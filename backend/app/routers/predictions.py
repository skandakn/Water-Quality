from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, timedelta

from app.database import get_db
from app.models.models import Lake, WaterQualityReading, SatelliteObservation, Prediction
from app.schemas.schemas import AIForecastResponse, ForecastDay, PredictionResponse
from app.services.wqi_engine import compute_wqi
from app.ml.prediction_service import prediction_service

router = APIRouter(prefix="/api/predictions", tags=["ML Predictions"])

@router.get("/{lake_id}", response_model=AIForecastResponse)
def get_lake_prediction(
    lake_id: int,
    horizon_days: int = Query(7, ge=1, le=14),
    db: Session = Depends(get_db)
):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise HTTPException(status_code=404, detail="Lake not found")

    readings = (
        db.query(WaterQualityReading)
        .filter(WaterQualityReading.lake_id == lake_id)
        .order_by(desc(WaterQualityReading.reading_date))
        .limit(30)
        .all()
    )
    readings.reverse()

    if not readings:
        raise HTTPException(status_code=404, detail="Insufficient readings to generate forecast")

    hist_wqi = []
    hist_dates = []
    for r in readings:
        score = compute_wqi(r.ph, r.turbidity, r.dissolved_oxygen, r.tds, r.temperature)["score"]
        hist_wqi.append(score)
        hist_dates.append(r.reading_date)

    latest = readings[-1]
    sat = (
        db.query(SatelliteObservation)
        .filter(SatelliteObservation.lake_id == lake_id)
        .order_by(desc(SatelliteObservation.observation_date))
        .first()
    )
    cov = sat.water_coverage_percentage if sat else 50.0

    forecast_dict = prediction_service.forecast_wqi(
        lake_id=lake_id,
        historical_wqi_series=hist_wqi,
        historical_dates=hist_dates,
        latest_parameters={
            "ph": latest.ph,
            "turbidity": latest.turbidity,
            "dissolved_oxygen": latest.dissolved_oxygen,
            "tds": latest.tds,
            "temperature": latest.temperature
        },
        water_coverage=cov,
        horizon_days=horizon_days
    )

    return AIForecastResponse(
        current_wqi=forecast_dict["current_wqi"],
        predicted_7d_wqi=forecast_dict["predicted_7d_wqi"],
        change_points=forecast_dict["change_points"],
        horizon_days=forecast_dict["horizon_days"],
        confidence_score=forecast_dict["confidence_score"],
        risk_level=forecast_dict["risk_level"],
        model_version=forecast_dict["model_version"],
        forecast_trajectory=[ForecastDay(**d) for d in forecast_dict["forecast_trajectory"]],
        explanation=forecast_dict["explanation"]
    )

@router.post("/{lake_id}/generate", response_model=PredictionResponse)
def trigger_prediction_generation(
    lake_id: int,
    db: Session = Depends(get_db)
):
    fc = get_lake_prediction(lake_id, horizon_days=7, db=db)
    pred_rec = Prediction(
        lake_id=lake_id,
        prediction_date=date.today(),
        target_date=date.today() + timedelta(days=7),
        predicted_wqi=fc.predicted_7d_wqi,
        confidence_score=fc.confidence_score,
        risk_level=fc.risk_level,
        model_version=fc.model_version
    )
    db.add(pred_rec)
    db.commit()
    db.refresh(pred_rec)
    return pred_rec
