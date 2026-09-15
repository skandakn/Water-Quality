from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.models import Alert, Lake
from app.schemas.schemas import AlertResponse
from app.routers.auth import require_analyst

router = APIRouter(prefix="/api/alerts", tags=["Early Warning & Alerts"])

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    lake_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query("ACTIVE"),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if lake_id:
        query = query.filter(Alert.lake_id == lake_id)
    if severity:
        query = query.filter(Alert.severity.ilike(severity))
    if status:
        query = query.filter(Alert.status.ilike(status))
    
    return query.order_by(desc(Alert.created_at)).all()

@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db), user=Depends(require_analyst)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "ACKNOWLEDGED"
    db.commit()
    db.refresh(alert)
    return alert

@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: int, db: Session = Depends(get_db), user=Depends(require_analyst)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "RESOLVED"
    db.commit()
    db.refresh(alert)
    return alert
