from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from app.database import get_db
from app.models.models import Lake, WaterQualityReading
from app.schemas.schemas import TrendSummary, TrendDataPoint
from app.services.wqi_engine import compute_wqi

router = APIRouter(prefix="/api/trends", tags=["Trends"])

@router.get("/{lake_id}", response_model=TrendSummary)
def get_lake_trends(
    lake_id: int,
    days: int = Query(30, description="Timeframe in days (7, 30, 90, 180)"),
    db: Session = Depends(get_db)
):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")

    readings = (
        db.query(WaterQualityReading)
        .filter(WaterQualityReading.lake_id == lake_id)
        .order_by(desc(WaterQualityReading.reading_date))
        .limit(days)
        .all()
    )
    readings.reverse()

    if not readings:
        raise HTTPException(status_code=404, detail="No readings available for trend calculation")

    series = []
    wqi_values = []
    for r in readings:
        w_score = compute_wqi(r.ph, r.turbidity, r.dissolved_oxygen, r.tds, r.temperature)["score"]
        wqi_values.append(w_score)
        series.append(TrendDataPoint(
            date=r.reading_date,
            wqi=w_score,
            ph=r.ph,
            turbidity=r.turbidity,
            dissolved_oxygen=r.dissolved_oxygen,
            tds=r.tds,
            temperature=r.temperature,
            is_forecast=False
        ))

    current = wqi_values[-1]
    baseline = wqi_values[0]
    change_pct = round(((current - baseline) / max(1.0, baseline)) * 100.0, 1)
    
    if change_pct < -3.0:
        direction = "deteriorating"
        narrative = f"WQI decreased by {abs(change_pct)}% over the last {days} days."
    elif change_pct > 3.0:
        direction = "improving"
        narrative = f"WQI increased by {change_pct}% over the last {days} days."
    else:
        direction = "stable"
        narrative = f"WQI remained largely stable (change: {change_pct}%) over the last {days} days."

    return TrendSummary(
        lake_id=lake_id,
        timeframe=f"{days} Days",
        current=current,
        average=round(sum(wqi_values) / len(wqi_values), 1),
        minimum=min(wqi_values),
        maximum=max(wqi_values),
        change_percentage=change_pct,
        trend_direction=direction,
        narrative=narrative,
        series=series
    )
