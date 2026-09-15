"""
Jaal Drushti - Comprehensive Database Seed Script
Initializes tables and seeds 90 days of continuous multi-lake readings,
WQI scores, satellite observations, ML predictions, active alerts, and RBAC users.
"""

import os
import sys
from pathlib import Path
from datetime import date, timedelta, datetime
import math

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.database import engine, Base, SessionLocal
from app.models.models import (
    Lake, WaterQualityReading, WQIRecord, 
    SatelliteObservation, Prediction, Alert, User
)
from app.services.wqi_engine import compute_wqi
from app.services.alert_engine import generate_lake_alerts

def get_password_hash(password: str) -> str:
    # Use standard sha256 or bcrypt
    import hashlib
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def seed_database():
    print("==================================================")
    print("      JAAL DRUSHTI — DATABASE SEEDING             ")
    print("==================================================")
    
    # Create all tables
    print("[1/5] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_lakes = db.query(Lake).count()
        if existing_lakes > 0:
            print(f"      Database already contains {existing_lakes} lakes. Clearing old records for clean seed...")
            db.query(Alert).delete()
            db.query(Prediction).delete()
            db.query(SatelliteObservation).delete()
            db.query(WQIRecord).delete()
            db.query(WaterQualityReading).delete()
            db.query(Lake).delete()
            db.query(User).delete()
            db.commit()

        # [2/5] Seed RBAC Users
        print("[2/5] Seeding RBAC users...")
        users = [
            User(
                name="Dr. Aditi Sharma",
                email="admin@jaaldrushti.org",
                password_hash=get_password_hash("Admin@123"),
                role="admin"
            ),
            User(
                name="Rohan Verma",
                email="analyst@jaaldrushti.org",
                password_hash=get_password_hash("Analyst@123"),
                role="analyst"
            ),
            User(
                name="Siddharth Rao",
                email="viewer@jaaldrushti.org",
                password_hash=get_password_hash("Viewer@123"),
                role="viewer"
            )
        ]
        db.add_all(users)
        db.commit()
        print("      Created: admin@jaaldrushti.org, analyst@jaaldrushti.org, viewer@jaaldrushti.org")

        # [3/5] Seed Lakes
        print("[3/5] Seeding lakes...")
        lakes_data = [
            {
                "name": "Lake Pavna",
                "location": "Maval, Pune, Maharashtra",
                "latitude": 18.6833,
                "longitude": 73.4833,
                "area_km2": 24.50,
                "description": "Critical freshwater reservoir supplying Pune metropolitan corridor. Currently under accelerated monitoring due to upstream catchment activity."
            },
            {
                "name": "Lake Vembanad",
                "location": "Alappuzha & Kottayam, Kerala",
                "latitude": 9.6167,
                "longitude": 76.4333,
                "area_km2": 96.50,
                "description": "Ramsar wetland complex sustaining extensive estuarine biodiversity, regional fisheries, and inland tourism waterways."
            },
            {
                "name": "Dal Lake",
                "location": "Srinagar, Jammu & Kashmir",
                "latitude": 34.1167,
                "longitude": 74.8667,
                "area_km2": 18.00,
                "description": "Urban Himalayan lake currently undergoing active ecological restoration, weed harvesting, and mechanical circulation aeration."
            }
        ]

        lake_objs = []
        for l_data in lakes_data:
            lake = Lake(**l_data)
            db.add(lake)
            lake_objs.append(lake)
        db.commit()

        # [4/5] Generate 90 Days of Historical Readings & WQI
        print("[4/5] Generating 90-day time-series readings and WQI records...")
        today = date.today()
        start_date = today - timedelta(days=89)

        # Simulation patterns
        # Lake 1 (Pavna): Deteriorating (WQI drops 84 -> 72 over 30 days)
        # Lake 2 (Vembanad): Stable (WQI hovers 78 - 81)
        # Lake 3 (Dal): Improving (WQI rises 62 -> 76 over 60 days)

        satellite_observations = []
        alerts_to_add = []
        predictions_to_add = []

        for lake in lake_objs:
            print(f"      Synthesizing 90 days for {lake.name}...")
            
            readings = []
            wqi_records = []
            
            for d_offset in range(90):
                curr_date = start_date + timedelta(days=d_offset)
                progress_fraction = d_offset / 89.0  # 0.0 to 1.0

                if lake.name == "Lake Pavna":
                    # Deteriorating profile: Turbidity climbs, DO drops, TDS climbs
                    # Days 0-60: steady good, Days 60-89 (past 30 days): deterioration kicks in
                    if d_offset < 60:
                        ph = 7.4 + 0.1 * math.sin(d_offset)
                        turbidity = 7.5 + 1.2 * math.cos(d_offset)
                        do = 6.8 + 0.3 * math.sin(d_offset * 0.5)
                        tds = 320.0 + 15.0 * math.sin(d_offset * 0.3)
                        temp = 25.0 + 1.5 * math.sin(d_offset * 0.1)
                        cov = 48.5 - (d_offset * 0.02)
                    else:
                        # Recent 30 days: sharp degradation
                        rec_frac = (d_offset - 60) / 29.0
                        ph = 7.4 - (rec_frac * 0.4) + 0.08 * math.sin(d_offset)
                        turbidity = 8.5 + (rec_frac * 13.5) + 1.5 * math.cos(d_offset)
                        do = 6.8 - (rec_frac * 1.6) + 0.2 * math.sin(d_offset)
                        tds = 320.0 + (rec_frac * 120.0) + 10.0 * math.cos(d_offset)
                        temp = 26.0 + (rec_frac * 1.5)
                        cov = 47.8 - (rec_frac * 0.84)

                elif lake.name == "Lake Vembanad":
                    # Stable healthy profile
                    ph = 7.3 + 0.12 * math.sin(d_offset * 0.8)
                    turbidity = 6.2 + 0.8 * math.cos(d_offset * 0.5)
                    do = 6.6 + 0.4 * math.sin(d_offset * 0.4)
                    tds = 280.0 + 20.0 * math.sin(d_offset * 0.2)
                    temp = 27.5 + 1.0 * math.sin(d_offset * 0.15)
                    cov = 68.2 + 0.6 * math.sin(d_offset * 0.3)

                else:
                    # Dal Lake: Improving profile
                    rec_frac = progress_fraction
                    ph = 6.9 + (rec_frac * 0.5) + 0.08 * math.sin(d_offset)
                    turbidity = 24.0 - (rec_frac * 16.0) + 1.0 * math.cos(d_offset)
                    do = 4.8 + (rec_frac * 2.4) + 0.25 * math.sin(d_offset)
                    tds = 460.0 - (rec_frac * 150.0) + 15.0 * math.sin(d_offset)
                    temp = 19.5 + 2.0 * math.sin(d_offset * 0.1)
                    cov = 57.0 + (rec_frac * 1.4)

                # Clamp values to valid physics
                ph = round(max(5.5, min(9.5, ph)), 2)
                turbidity = round(max(1.0, turbidity), 2)
                do = round(max(2.0, min(11.0, do)), 2)
                tds = round(max(50.0, tds), 1)
                temp = round(temp, 1)

                reading = WaterQualityReading(
                    lake_id=lake.id,
                    reading_date=curr_date,
                    ph=ph,
                    turbidity=turbidity,
                    dissolved_oxygen=do,
                    tds=tds,
                    temperature=temp,
                    conductivity=round(tds * 1.56, 1),
                    source="In-situ Sensor Station Alpha",
                    data_quality_status="VALID"
                )
                readings.append(reading)

                # Calculate WQI using standard engine
                wqi_res = compute_wqi(ph, turbidity, do, tds, temp)
                wqi_rec = WQIRecord(
                    lake_id=lake.id,
                    reading_date=curr_date,
                    wqi_score=wqi_res["score"],
                    quality_category=wqi_res["category"],
                    calculation_version="WAWQI_v1.0"
                )
                wqi_records.append(wqi_rec)

            db.add_all(readings)
            db.add_all(wqi_records)
            db.flush()

            # Latest satellite observation
            latest_cov = 46.96 if lake.name == "Lake Pavna" else (68.20 if lake.name == "Lake Vembanad" else 58.40)
            est_area = round(lake.area_km2 * (latest_cov / 100.0), 3)

            sat_obs = SatelliteObservation(
                lake_id=lake.id,
                observation_date=today,
                water_coverage_percentage=latest_cov,
                estimated_water_area_km2=est_area,
                image_url="/assets/satellite/lake_satellite.jpg",
                mask_url="/assets/satellite/lake_water_mask.png",
                overlay_url="/assets/satellite/lake_ai_overlay.png",
                water_detection_status="Water Detected",
                source="Sentinel-2 Optical (Simulated)"
            )
            satellite_observations.append(sat_obs)

            # Predictions (7-day horizon)
            last_wqi = wqi_records[-1].wqi_score
            if lake.name == "Lake Pavna":
                pred_wqi = 64.0  # Matches demo scenario: 72 -> 64
                risk = "MODERATE DETERIORATION"
                conf = 82.0
            elif lake.name == "Lake Vembanad":
                pred_wqi = round(last_wqi - 0.5, 1)
                risk = "STABLE CONDITION"
                conf = 88.5
            else:
                pred_wqi = round(last_wqi + 4.5, 1)
                risk = "IMPROVING TREND"
                conf = 85.0

            pred = Prediction(
                lake_id=lake.id,
                prediction_date=today,
                target_date=today + timedelta(days=7),
                predicted_wqi=pred_wqi,
                confidence_score=conf,
                risk_level=risk,
                model_version="RF_TS_v1.0"
            )
            predictions_to_add.append(pred)

            # Generate dynamic alerts
            latest_read_dict = {
                "turbidity": readings[-1].turbidity,
                "dissolved_oxygen": readings[-1].dissolved_oxygen,
                "ph": readings[-1].ph,
                "tds": readings[-1].tds
            }
            area_delta = -8.4 if lake.name == "Lake Pavna" else 0.5
            lake_alerts = generate_lake_alerts(
                lake_id=lake.id,
                lake_name=lake.name,
                current_wqi=last_wqi,
                predicted_wqi=pred_wqi,
                latest_reading=latest_read_dict,
                water_coverage=latest_cov,
                water_area_change_pct=area_delta
            )
            for a in lake_alerts:
                alerts_to_add.append(Alert(**a))

        db.add_all(satellite_observations)
        db.add_all(predictions_to_add)
        db.add_all(alerts_to_add)
        db.commit()

        print("[5/5] Database seeding completed successfully!")
        print(f"      Total lakes: {len(lake_objs)}")
        print(f"      Total readings: {db.query(WaterQualityReading).count()}")
        print(f"      Total WQI records: {db.query(WQIRecord).count()}")
        print(f"      Total alerts generated: {db.query(Alert).count()}")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"ERROR: Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
