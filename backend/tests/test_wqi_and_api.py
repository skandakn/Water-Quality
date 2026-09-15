import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.services.wqi_engine import compute_wqi, calculate_ph_subindex, calculate_do_subindex
from app.services.alert_engine import generate_lake_alerts
from app.services.csv_validator import parse_and_validate_csv
from app.ml.prediction_service import prediction_service

def test_wqi_pristine():
    # Ideal clean water: pH 7.2, Turbidity 2.0, DO 8.0, TDS 150, Temp 22
    res = compute_wqi(ph=7.2, turbidity=2.0, dissolved_oxygen=8.0, tds=150.0, temperature=22.0)
    assert res["score"] >= 85.0
    assert res["category"] in ["Excellent", "Good"]

def test_wqi_deteriorated():
    # Heavily polluted water: pH 5.5, Turbidity 55.0, DO 2.5, TDS 1100, Temp 32
    res = compute_wqi(ph=5.5, turbidity=55.0, dissolved_oxygen=2.5, tds=1100.0, temperature=32.0)
    assert res["score"] < 50.0
    assert res["category"] in ["Poor", "Very Poor"]

def test_alert_generation():
    # High turbidity and dropping WQI
    alerts = generate_lake_alerts(
        lake_id=1,
        lake_name="Test Lake",
        current_wqi=72.0,
        predicted_wqi=64.0,
        latest_reading={"turbidity": 28.0, "dissolved_oxygen": 5.2, "ph": 7.3, "tds": 410.0},
        water_coverage=45.0,
        water_area_change_pct=-9.2
    )
    alert_types = [a["alert_type"] for a in alerts]
    assert "WQI DETERIORATION" in alert_types
    assert "TURBIDITY SPIKE" in alert_types
    assert "WATER AREA DECLINE" in alert_types

def test_csv_validation():
    csv_sample = (
        "date,lake_name,ph,turbidity,dissolved_oxygen,tds,temperature\n"
        "2026-09-15,Lake Pavna,7.4,18.0,5.8,420,27.0\n"
        "2026-09-16,Lake Pavna,16.5,20.0,5.0,400,26.0\n"
    )
    res = parse_and_validate_csv(csv_sample, ["Lake Pavna"])
    assert res.total_rows == 2
    assert res.valid_rows_count == 1
    assert res.invalid_rows_count == 1
    assert "out of physically possible range" in res.preview_rows[1].errors[0]

def test_ml_prediction_service():
    forecast = prediction_service.forecast_wqi(
        lake_id=1,
        historical_wqi_series=[82.0, 79.0, 76.0, 74.0, 72.0],
        historical_dates=[],
        latest_parameters={"ph": 7.4, "turbidity": 18.0, "dissolved_oxygen": 5.8, "tds": 420.0, "temperature": 27.0},
        water_coverage=46.96,
        horizon_days=7
    )
    assert len(forecast["forecast_trajectory"]) == 7
    assert forecast["current_wqi"] == 72.0
    assert forecast["confidence_score"] >= 70.0
    assert "DETERIORATION" in forecast["risk_level"]

if __name__ == "__main__":
    test_wqi_pristine()
    test_wqi_deteriorated()
    test_alert_generation()
    test_csv_validation()
    test_ml_prediction_service()
    print("ALL UNIT TESTS PASSED SUCCESSFULLY!")
