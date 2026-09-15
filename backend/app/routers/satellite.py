from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.models import Lake, SatelliteObservation
from app.schemas.schemas import SatelliteObservationResponse

router = APIRouter(prefix="/api/satellite", tags=["Satellite Monitor"])

@router.get("/{lake_id}", response_model=SatelliteObservationResponse)
def get_lake_satellite_observation(lake_id: int, db: Session = Depends(get_db)):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")

    obs = (
        db.query(SatelliteObservation)
        .filter(SatelliteObservation.lake_id == lake_id)
        .order_by(desc(SatelliteObservation.observation_date))
        .first()
    )
    if not obs:
        raise HTTPException(status_code=404, detail="No satellite observation recorded for this lake")

    return obs
