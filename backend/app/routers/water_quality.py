from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date

from app.database import get_db
from app.models.models import Lake, WaterQualityReading, WQIRecord
from app.schemas.schemas import (
    WaterQualityReadingCreate, WaterQualityReadingResponse,
    CSVUploadValidationResult
)
from app.services.wqi_engine import compute_wqi
from app.services.csv_validator import parse_and_validate_csv
from app.routers.auth import require_analyst

router = APIRouter(prefix="/api/water-quality", tags=["Water Quality"])

@router.get("/lakes/{lake_id}", response_model=List[WaterQualityReadingResponse])
def get_lake_readings(
    lake_id: int,
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    readings = (
        db.query(WaterQualityReading)
        .filter(WaterQualityReading.lake_id == lake_id)
        .order_by(desc(WaterQualityReading.reading_date))
        .limit(limit)
        .all()
    )
    return readings

@router.post("/lakes/{lake_id}", response_model=WaterQualityReadingResponse)
def add_water_quality_reading(
    lake_id: int,
    reading_in: WaterQualityReadingCreate,
    db: Session = Depends(get_db),
    user=Depends(require_analyst)
):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")

    reading = WaterQualityReading(
        lake_id=lake_id,
        reading_date=reading_in.reading_date,
        ph=reading_in.ph,
        turbidity=reading_in.turbidity,
        dissolved_oxygen=reading_in.dissolved_oxygen,
        tds=reading_in.tds,
        temperature=reading_in.temperature,
        conductivity=reading_in.conductivity or (reading_in.tds * 1.56),
        source=reading_in.source,
        data_quality_status=reading_in.data_quality_status
    )
    db.add(reading)

    # Compute and store WQI record in sync
    wqi_res = compute_wqi(
        ph=reading_in.ph,
        turbidity=reading_in.turbidity,
        dissolved_oxygen=reading_in.dissolved_oxygen,
        tds=reading_in.tds,
        temperature=reading_in.temperature
    )
    wqi_rec = WQIRecord(
        lake_id=lake_id,
        reading_date=reading_in.reading_date,
        wqi_score=wqi_res["score"],
        quality_category=wqi_res["category"],
        calculation_version="WAWQI_v1.0"
    )
    db.add(wqi_rec)
    db.commit()
    db.refresh(reading)
    return reading

@router.post("/upload-csv", response_model=CSVUploadValidationResult)
async def upload_csv_file(
    file: UploadFile = File(...),
    execute_import: bool = Query(False, description="Set to true to commit valid rows"),
    db: Session = Depends(get_db),
    user=Depends(require_analyst)
):
    contents = await file.read()
    try:
        csv_text = contents.decode("utf-8")
    except UnicodeDecodeError:
        csv_text = contents.decode("latin-1")

    known_lakes = [l.name for l in db.query(Lake.name).all()]
    lake_map = {l.name.lower(): l.id for l in db.query(Lake).all()}

    validation_result = parse_and_validate_csv(csv_text, known_lakes)

    if execute_import and validation_result.can_import:
        # Import valid rows
        imported_count = 0
        from datetime import datetime
        for row in validation_result.preview_rows:
            if row.is_valid and row.lake_name.lower() in lake_map:
                l_id = lake_map[row.lake_name.lower()]
                r_date = datetime.strptime(row.date, "%Y-%m-%d").date()
                reading = WaterQualityReading(
                    lake_id=l_id,
                    reading_date=r_date,
                    ph=row.ph,
                    turbidity=row.turbidity,
                    dissolved_oxygen=row.dissolved_oxygen,
                    tds=row.tds,
                    temperature=row.temperature,
                    conductivity=round(row.tds * 1.56, 1),
                    source="CSV Batch Upload",
                    data_quality_status=row.status
                )
                db.add(reading)
                wqi_res = compute_wqi(row.ph, row.turbidity, row.dissolved_oxygen, row.tds, row.temperature)
                wqi_rec = WQIRecord(
                    lake_id=l_id,
                    reading_date=r_date,
                    wqi_score=wqi_res["score"],
                    quality_category=wqi_res["category"],
                    calculation_version="WAWQI_v1.0"
                )
                db.add(wqi_rec)
                imported_count += 1
        db.commit()

    return validation_result
