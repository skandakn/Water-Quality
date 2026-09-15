from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date

from app.database import get_db
from app.models.models import Lake, WQIRecord, SatelliteObservation, Prediction, Alert
from app.schemas.schemas import LakeResponse, LakeCreate, LakeCardSummary
from app.routers.auth import require_admin, require_analyst

router = APIRouter(prefix="/api/lakes", tags=["Lakes"])

@router.get("", response_model=List[LakeCardSummary])
def list_lakes(
    search: Optional[str] = Query(None, description="Search by name or location"),
    risk: Optional[str] = Query(None, description="Filter by risk category"),
    status: Optional[str] = Query(None, description="Filter by monitoring status"),
    db: Session = Depends(get_db)
):
    query = db.query(Lake)
    if search:
        query = query.filter(
            (Lake.name.ilike(f"%{search}%")) | (Lake.location.ilike(f"%{search}%"))
        )
    lakes = query.all()

    summaries = []
    for lake in lakes:
        # Latest WQI
        latest_wqi_rec = (
            db.query(WQIRecord)
            .filter(WQIRecord.lake_id == lake.id)
            .order_by(desc(WQIRecord.reading_date))
            .first()
        )
        curr_wqi = latest_wqi_rec.wqi_score if latest_wqi_rec else 70.0
        category = latest_wqi_rec.quality_category if latest_wqi_rec else "Moderate"
        last_date = latest_wqi_rec.reading_date if latest_wqi_rec else date.today()

        # Latest Satellite
        sat = (
            db.query(SatelliteObservation)
            .filter(SatelliteObservation.lake_id == lake.id)
            .order_by(desc(SatelliteObservation.observation_date))
            .first()
        )
        cov = sat.water_coverage_percentage if sat else 50.0

        # Latest Prediction / Risk
        pred = (
            db.query(Prediction)
            .filter(Prediction.lake_id == lake.id)
            .order_by(desc(Prediction.created_at))
            .first()
        )
        risk_lvl = pred.risk_level if pred else "LOW RISK"

        # Monitoring status
        if "CRITICAL" in risk_lvl or curr_wqi < 50:
            mon_status = "CRITICAL"
        elif "MODERATE" in risk_lvl or curr_wqi < 70:
            mon_status = "MODERATE"
        else:
            mon_status = "STABLE"

        # Filter check
        if risk and risk.lower() not in risk_lvl.lower():
            continue
        if status and status.lower() != mon_status.lower():
            continue

        summaries.append(LakeCardSummary(
            id=lake.id,
            name=lake.name,
            location=lake.location,
            latitude=lake.latitude,
            longitude=lake.longitude,
            area_km2=lake.area_km2,
            current_wqi=curr_wqi,
            quality_category=category,
            water_coverage_percentage=cov,
            risk_level=risk_lvl,
            monitoring_status=mon_status,
            last_updated=last_date
        ))

    return summaries

@router.get("/{lake_id}", response_model=LakeResponse)
def get_lake(lake_id: int, db: Session = Depends(get_db)):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")
    return lake

@router.post("", response_model=LakeResponse)
def create_lake(lake_in: LakeCreate, db: Session = Depends(get_db), user=Depends(require_analyst)):
    lake = Lake(**lake_in.dict())
    db.add(lake)
    db.commit()
    db.refresh(lake)
    return lake

@router.delete("/{lake_id}")
def delete_lake(lake_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")
    db.delete(lake)
    db.commit()
    return {"message": f"Lake '{lake.name}' deleted successfully"}
