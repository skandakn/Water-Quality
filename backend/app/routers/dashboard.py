from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, timedelta
from typing import List, Optional

from app.database import get_db
from app.models.models import (
    Lake, WaterQualityReading, WQIRecord, 
    SatelliteObservation, Prediction, Alert
)
from app.schemas.schemas import (
    DashboardResponse, DashboardParameter, ParameterScore, 
    SatelliteObservationResponse, AIForecastResponse, ForecastDay,
    TrendSummary, TrendDataPoint, AlertResponse, LakeResponse
)
from app.services.wqi_engine import compute_wqi, get_wqi_category_details
from app.ml.prediction_service import prediction_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/{lake_id}", response_model=DashboardResponse)
def get_lake_dashboard(
    lake_id: int,
    db: Session = Depends(get_db)
):
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        # Default to first available lake if requested id not found
        lake = db.query(Lake).first()
        if not lake:
            raise HTTPException(status_code=404, detail="No lakes found in database. Please run seed script.")

    # 1. Latest 30 Days of Readings
    readings = (
        db.query(WaterQualityReading)
        .filter(WaterQualityReading.lake_id == lake.id)
        .order_by(desc(WaterQualityReading.reading_date))
        .limit(30)
        .all()
    )
    readings.reverse()  # Chronological order

    latest_reading = readings[-1] if readings else None
    if not latest_reading:
        raise HTTPException(status_code=404, detail=f"No readings found for {lake.name}")

    # 2. Latest WQI & Previous Period Delta
    latest_wqi_rec = (
        db.query(WQIRecord)
        .filter(WQIRecord.lake_id == lake.id)
        .order_by(desc(WQIRecord.reading_date))
        .first()
    )
    current_wqi = latest_wqi_rec.wqi_score if latest_wqi_rec else 72.0
    category, color, status = get_wqi_category_details(current_wqi)

    # 30-day delta
    first_wqi_30d = (
        db.query(WQIRecord)
        .filter(WQIRecord.lake_id == lake.id)
        .order_by(desc(WQIRecord.reading_date))
        .offset(29)
        .first()
    )
    prev_wqi = first_wqi_30d.wqi_score if first_wqi_30d else (current_wqi + 6.0)
    wqi_change_pct = round(((current_wqi - prev_wqi) / prev_wqi) * 100.0, 1)

    # 3. Satellite Observation
    sat = (
        db.query(SatelliteObservation)
        .filter(SatelliteObservation.lake_id == lake.id)
        .order_by(desc(SatelliteObservation.observation_date))
        .first()
    )
    if not sat:
        cov = 46.96
        est_area = round(lake.area_km2 * (cov / 100.0), 3)
        sat_resp = SatelliteObservationResponse(
            id=1,
            lake_id=lake.id,
            observation_date=date.today(),
            water_coverage_percentage=cov,
            estimated_water_area_km2=est_area,
            image_url="/assets/satellite/lake_satellite.jpg",
            mask_url="/assets/satellite/lake_water_mask.png",
            overlay_url="/assets/satellite/lake_ai_overlay.png",
            water_detection_status="Water Detected",
            source="Sentinel-2 Optical (Simulated)",
            created_at=date.today()
        )
    else:
        cov = sat.water_coverage_percentage
        est_area = sat.estimated_water_area_km2
        sat_resp = SatelliteObservationResponse.from_orm(sat)

    # Monitoring status classification
    if current_wqi >= 75 and cov >= 50:
        monitoring_status = "STABLE"
        monitoring_color = "#10b981"
    elif current_wqi >= 55:
        monitoring_status = "MODERATE"
        monitoring_color = "#f59e0b"
    else:
        monitoring_status = "CRITICAL"
        monitoring_color = "#ef4444"

    # AI narrative for satellite analysis
    ai_satellite_analysis = (
        f"Water extent detected across {cov:.2f}% of the analyzed image. "
        f"Estimated surface water area is {est_area:.3f} km². "
        f"The system detected a {monitoring_status.lower()} monitoring condition based on current observations."
    )

    # 4. Water Quality Parameter Cards & Detailed Sub-indices
    wqi_computed = compute_wqi(
        ph=latest_reading.ph,
        turbidity=latest_reading.turbidity,
        dissolved_oxygen=latest_reading.dissolved_oxygen,
        tds=latest_reading.tds,
        temperature=latest_reading.temperature
    )

    # Mini trends over last 7 readings
    recent_7 = readings[-7:] if len(readings) >= 7 else readings
    ph_delta = round(latest_reading.ph - recent_7[0].ph, 2)
    turb_delta = round(latest_reading.turbidity - recent_7[0].turbidity, 1)
    do_delta = round(latest_reading.dissolved_oxygen - recent_7[0].dissolved_oxygen, 2)
    tds_delta = round(latest_reading.tds - recent_7[0].tds, 0)
    temp_delta = round(latest_reading.temperature - recent_7[0].temperature, 1)

    parameters = [
        DashboardParameter(
            name="pH",
            key="ph",
            value=latest_reading.ph,
            unit="",
            status="GOOD" if 6.5 <= latest_reading.ph <= 8.5 else "MODERATE",
            color="#10b981" if 6.5 <= latest_reading.ph <= 8.5 else "#f59e0b",
            mini_trend="stable" if abs(ph_delta) < 0.2 else ("up" if ph_delta > 0 else "down"),
            change_pct=round(ph_delta * 10, 1),
            tooltip="Hydrogen-ion concentration. Pure water is 7.0. Acceptable freshwater range is 6.5 - 8.5."
        ),
        DashboardParameter(
            name="Turbidity",
            key="turbidity",
            value=latest_reading.turbidity,
            unit="NTU",
            status="GOOD" if latest_reading.turbidity < 10 else ("MODERATE" if latest_reading.turbidity < 25 else "CRITICAL"),
            color="#10b981" if latest_reading.turbidity < 10 else ("#f59e0b" if latest_reading.turbidity < 25 else "#ef4444"),
            mini_trend="up" if turb_delta > 1.0 else ("down" if turb_delta < -1.0 else "stable"),
            change_pct=round((turb_delta / max(1.0, recent_7[0].turbidity)) * 100.0, 1),
            tooltip="Water cloudiness caused by suspended sediments, micro-algae, or runoff particulates."
        ),
        DashboardParameter(
            name="Dissolved Oxygen",
            key="dissolved_oxygen",
            value=latest_reading.dissolved_oxygen,
            unit="mg/L",
            status="GOOD" if latest_reading.dissolved_oxygen >= 6.0 else ("MODERATE" if latest_reading.dissolved_oxygen >= 4.0 else "CRITICAL"),
            color="#10b981" if latest_reading.dissolved_oxygen >= 6.0 else ("#f59e0b" if latest_reading.dissolved_oxygen >= 4.0 else "#ef4444"),
            mini_trend="up" if do_delta > 0.2 else ("down" if do_delta < -0.2 else "stable"),
            change_pct=round((do_delta / max(1.0, recent_7[0].dissolved_oxygen)) * 100.0, 1),
            tooltip="Essential oxygen dissolved in lake water for fish, zooplankton, and aerobic benthic bacteria."
        ),
        DashboardParameter(
            name="Total Dissolved Solids",
            key="tds",
            value=latest_reading.tds,
            unit="mg/L",
            status="GOOD" if latest_reading.tds < 350 else ("MODERATE" if latest_reading.tds < 600 else "CRITICAL"),
            color="#10b981" if latest_reading.tds < 350 else ("#f59e0b" if latest_reading.tds < 600 else "#ef4444"),
            mini_trend="up" if tds_delta > 15 else ("down" if tds_delta < -15 else "stable"),
            change_pct=round((tds_delta / max(1.0, recent_7[0].tds)) * 100.0, 1),
            tooltip="Mineral salts, calcium, magnesium, and inorganic salts dissolved in solution."
        ),
        DashboardParameter(
            name="Temperature",
            key="temperature",
            value=latest_reading.temperature,
            unit="°C",
            status="NORMAL" if latest_reading.temperature < 29 else "ELEVATED",
            color="#06b6d4" if latest_reading.temperature < 29 else "#f59e0b",
            mini_trend="up" if temp_delta > 0.5 else ("down" if temp_delta < -0.5 else "stable"),
            change_pct=round(temp_delta, 1),
            tooltip="Ambient surface water temperature governing biochemical reaction rates and gas solubility."
        )
    ]

    # 5. AI Forecast
    hist_wqi_values = []
    hist_dates = []
    for r in readings:
        w = compute_wqi(r.ph, r.turbidity, r.dissolved_oxygen, r.tds, r.temperature)["score"]
        hist_wqi_values.append(w)
        hist_dates.append(r.reading_date)

    forecast_res = prediction_service.forecast_wqi(
        lake_id=lake.id,
        historical_wqi_series=hist_wqi_values,
        historical_dates=hist_dates,
        latest_parameters={
            "ph": latest_reading.ph,
            "turbidity": latest_reading.turbidity,
            "dissolved_oxygen": latest_reading.dissolved_oxygen,
            "tds": latest_reading.tds,
            "temperature": latest_reading.temperature
        },
        water_coverage=cov,
        horizon_days=7
    )
    forecast_model = AIForecastResponse(
        current_wqi=forecast_res["current_wqi"],
        predicted_7d_wqi=forecast_res["predicted_7d_wqi"],
        change_points=forecast_res["change_points"],
        horizon_days=forecast_res["horizon_days"],
        confidence_score=forecast_res["confidence_score"],
        risk_level=forecast_res["risk_level"],
        model_version=forecast_res["model_version"],
        forecast_trajectory=[ForecastDay(**d) for d in forecast_res["forecast_trajectory"]],
        explanation=forecast_res["explanation"]
    )

    # 6. Active Alerts
    db_alerts = (
        db.query(Alert)
        .filter(Alert.lake_id == lake.id, Alert.status == "ACTIVE")
        .order_by(desc(Alert.created_at))
        .all()
    )
    alerts_resp = [AlertResponse.from_orm(a) for a in db_alerts]

    # 7. 30-Day Trend Series
    series = []
    for r in readings:
        w_sc = compute_wqi(r.ph, r.turbidity, r.dissolved_oxygen, r.tds, r.temperature)["score"]
        series.append(TrendDataPoint(
            date=r.reading_date,
            wqi=w_sc,
            ph=r.ph,
            turbidity=r.turbidity,
            dissolved_oxygen=r.dissolved_oxygen,
            tds=r.tds,
            temperature=r.temperature,
            is_forecast=False
        ))

    wqi_vals = [s.wqi for s in series]
    trend_direction = "deteriorating" if wqi_change_pct < -3 else ("improving" if wqi_change_pct > 3 else "stable")
    narrative = (
        f"WQI decreased by {abs(wqi_change_pct)}% over the last 30 days." 
        if wqi_change_pct < 0 
        else f"WQI improved by {wqi_change_pct}% over the last 30 days."
    )

    trend_summary = TrendSummary(
        lake_id=lake.id,
        timeframe="30 Days",
        current=current_wqi,
        average=round(sum(wqi_vals) / len(wqi_vals), 1) if wqi_vals else current_wqi,
        minimum=min(wqi_vals) if wqi_vals else current_wqi,
        maximum=max(wqi_vals) if wqi_vals else current_wqi,
        change_percentage=wqi_change_pct,
        trend_direction=trend_direction,
        narrative=narrative,
        series=series
    )

    return DashboardResponse(
        lake=LakeResponse.from_orm(lake),
        greeting="Good Morning, Water Intelligence Team",
        water_coverage_percentage=cov,
        water_coverage_change=-1.4 if lake.name == "Lake Pavna" else 0.2,
        estimated_water_area_km2=est_area,
        current_wqi=current_wqi,
        wqi_change_pct=wqi_change_pct,
        wqi_category=category,
        wqi_color=color,
        monitoring_status=monitoring_status,
        monitoring_status_color=monitoring_color,
        ai_satellite_analysis=ai_satellite_analysis,
        satellite_latest=sat_resp,
        parameters=parameters,
        parameter_scores=[ParameterScore(**ps) for ps in wqi_computed["parameter_scores"]],
        forecast=forecast_model,
        active_alerts=alerts_resp,
        historical_trend=trend_summary,
        is_demo_mode=True
    )
