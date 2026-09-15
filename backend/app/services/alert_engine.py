"""
Jaal Drushti - Early Warning & Alert Generation Engine
Analyzes sensor readings, historical deltas, and ML forecasts to trigger actionable alerts.
"""

from typing import List, Dict, Any, Optional
from datetime import date

def generate_lake_alerts(
    lake_id: int,
    lake_name: str,
    current_wqi: float,
    predicted_wqi: Optional[float],
    latest_reading: Dict[str, float],
    water_coverage: float,
    water_area_change_pct: float = 0.0
) -> List[Dict[str, Any]]:
    alerts = []

    # 1. WQI Deterioration Alert
    if predicted_wqi is not None:
        delta = current_wqi - predicted_wqi
        if delta >= 8.0:
            alerts.append({
                "lake_id": lake_id,
                "alert_type": "WQI DETERIORATION",
                "severity": "CRITICAL" if predicted_wqi < 50 else "HIGH",
                "title": f"Rapid Water Quality Deterioration Projected",
                "message": (
                    f"WQI is projected to sharply decline from {round(current_wqi, 1)} to "
                    f"{round(predicted_wqi, 1)} over the next 7 days (drop of {round(delta, 1)} points). "
                    f"Lake is at risk of falling into degraded category."
                ),
                "recommended_action": (
                    "Deploy field inspection team to upstream inflow channels. Inspect for unauthorized industrial "
                    "effluent discharge or storm drain overflow. Temporarily activate artificial aerators."
                ),
                "status": "ACTIVE"
            })
        elif delta >= 4.0:
            alerts.append({
                "lake_id": lake_id,
                "alert_type": "WQI DETERIORATION",
                "severity": "MODERATE",
                "title": f"Moderate Water Quality Decline Anticipated",
                "message": (
                    f"WQI is projected to decline from {round(current_wqi, 1)} to {round(predicted_wqi, 1)} "
                    f"over the next 7 days."
                ),
                "recommended_action": (
                    "Increase monitoring frequency from weekly to daily. Investigate potential agricultural runoff "
                    "and test localized nitrogen/phosphorus levels."
                ),
                "status": "ACTIVE"
            })

    # 2. Turbidity Spike Alert
    turb = latest_reading.get("turbidity", 0.0)
    if turb >= 30.0:
        alerts.append({
            "lake_id": lake_id,
            "alert_type": "TURBIDITY SPIKE",
            "severity": "HIGH",
            "title": f"Severe Turbidity Surge Detected ({turb} NTU)",
            "message": (
                f"Turbidity has surged to {turb} NTU, far exceeding the permissible benchmark of 10.0 NTU. "
                f"Suspended solids are severely limiting sunlight penetration."
            ),
            "recommended_action": (
                "Deploy silt curtains near active construction or agricultural inflow zones. "
                "Sample for potential toxic cyanobacteria / microcystis bloom."
            ),
            "status": "ACTIVE"
        })
    elif turb >= 18.0:
        alerts.append({
            "lake_id": lake_id,
            "alert_type": "TURBIDITY SPIKE",
            "severity": "MODERATE",
            "title": f"Elevated Turbidity ({turb} NTU)",
            "message": f"Turbidity reading of {turb} NTU indicates increased suspended particulates.",
            "recommended_action": "Check catchment sedimentation basins and inspect perimeter buffer vegetation.",
            "status": "ACTIVE"
        })

    # 3. Dissolved Oxygen Hypoxia Alert
    do = latest_reading.get("dissolved_oxygen", 8.0)
    if do < 3.5:
        alerts.append({
            "lake_id": lake_id,
            "alert_type": "DISSOLVED OXYGEN DROP",
            "severity": "CRITICAL",
            "title": f"Acute Hypoxia Alert — DO at {do} mg/L",
            "message": (
                f"Dissolved oxygen has plummeted to {do} mg/L, entering critical lethality zone for freshwater fish. "
                f"Imminent fish kill event hazard."
            ),
            "recommended_action": (
                "IMMEDIATE ACTION: Turn on floating fountain/diffused aeration systems. "
                "Restrict nutrient-rich untreated sewage inflows immediately."
            ),
            "status": "ACTIVE"
        })
    elif do < 5.0:
        alerts.append({
            "lake_id": lake_id,
            "alert_type": "DISSOLVED OXYGEN DROP",
            "severity": "MODERATE",
            "title": f"Low Dissolved Oxygen ({do} mg/L)",
            "message": f"Dissolved oxygen level has dropped to {do} mg/L (threshold: 6.0 mg/L).",
            "recommended_action": "Monitor nocturnal oxygen swings and sample for biochemical oxygen demand (BOD).",
            "status": "ACTIVE"
        })

    # 4. Water Area Decline / Shrinkage
    if water_area_change_pct <= -8.0:
        alerts.append({
            "lake_id": lake_id,
            "alert_type": "WATER AREA DECLINE",
            "severity": "HIGH",
            "title": f"Substantial Surface Water Shrinkage ({abs(round(water_area_change_pct, 1))}%)",
            "message": (
                f"Satellite segmentation indicates surface water extent has contracted by "
                f"{abs(round(water_area_change_pct, 1))}% compared to baseline seasonal average."
            ),
            "recommended_action": (
                "Verify upstream dam releases or diversions. Audit unauthorized borewell extraction and "
                "assess sediment siltation in shallow bays."
            ),
            "status": "ACTIVE"
        })

    return alerts
