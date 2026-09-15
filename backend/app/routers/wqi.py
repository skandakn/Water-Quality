from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.models import Lake, WQIRecord
from app.schemas.schemas import WQICalculateRequest, WQICalculateResponse, WQIRecordResponse
from app.services.wqi_engine import compute_wqi

router = APIRouter(prefix="/api/wqi", tags=["WQI Engine"])

@router.post("/calculate", response_model=WQICalculateResponse)
def calculate_wqi_on_the_fly(params: WQICalculateRequest):
    result = compute_wqi(
        ph=params.ph,
        turbidity=params.turbidity,
        dissolved_oxygen=params.dissolved_oxygen,
        tds=params.tds,
        temperature=params.temperature
    )
    return result

@router.get("/lakes/{lake_id}", response_model=List[WQIRecordResponse])
def get_lake_wqi_history(
    lake_id: int,
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    records = (
        db.query(WQIRecord)
        .filter(WQIRecord.lake_id == lake_id)
        .order_by(desc(WQIRecord.reading_date))
        .limit(limit)
        .all()
    )
    return records
