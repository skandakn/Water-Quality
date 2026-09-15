"""
Jaal Drushti - Dedicated Water Quality Index (WQI) Engine
Implements the standardized Weighted Arithmetic Water Quality Index (WAWQI) Method.

The calculation is modular:
1. Raw measurements ingestion
2. Sub-index calculation (q_i) for each parameter based on standard desirable & permissible values
3. Relative weighting (w_i) representing environmental sensitivity
4. Composite index calculation normalized to [0, 100] (Higher is healthier)
5. Categorization and actionable scientific explanation
"""

from typing import Dict, Any, List, Tuple

# Standard environmental benchmarks (CPCB / WHO freshwater lake standards)
PARAM_STANDARDS = {
    "ph": {
        "name": "pH",
        "unit": "",
        "ideal": 7.0,
        "desirable_min": 6.5,
        "desirable_max": 8.5,
        "permissible_max": 9.2,
        "weight": 0.25,
        "description": "Measure of acidity/alkalinity. Ideal range 6.5–8.5 for freshwater ecosystems."
    },
    "dissolved_oxygen": {
        "name": "Dissolved Oxygen",
        "unit": "mg/L",
        "ideal": 8.5,
        "desirable_min": 6.0,
        "critical_min": 4.0,
        "weight": 0.30,
        "description": "Essential for aquatic organisms. Levels below 4.0 mg/L cause severe biological stress."
    },
    "turbidity": {
        "name": "Turbidity",
        "unit": "NTU",
        "ideal": 2.0,
        "desirable_max": 10.0,
        "permissible_max": 25.0,
        "weight": 0.15,
        "description": "Water clarity indicator. Elevated NTU signifies suspended silt, runoff, or algal blooms."
    },
    "tds": {
        "name": "Total Dissolved Solids",
        "unit": "mg/L",
        "ideal": 150.0,
        "desirable_max": 500.0,
        "permissible_max": 1000.0,
        "weight": 0.15,
        "description": "Combined inorganic salts and organic matter dissolved in water."
    },
    "temperature": {
        "name": "Temperature",
        "unit": "°C",
        "ideal": 22.0,
        "desirable_max": 28.0,
        "permissible_max": 33.0,
        "weight": 0.15,
        "description": "Affects oxygen solubility and biochemical kinetics in the lake."
    }
}


def calculate_ph_subindex(ph: float) -> Tuple[float, str, str]:
    """Calculates pH sub-index (0 to 100, where 100 is pristine)."""
    if 6.8 <= ph <= 7.6:
        return 100.0, "EXCELLENT", "Optimal near-neutral pH balance"
    elif 6.5 <= ph <= 8.5:
        # Minor deviation
        dev = min(abs(ph - 7.0) / 1.5, 1.0)
        score = 100.0 - (dev * 25.0)
        return round(score, 1), "GOOD", "Within acceptable standards for aquatic life"
    elif 6.0 <= ph <= 9.0:
        dev = min(abs(ph - 7.0) / 2.0, 1.0)
        score = 75.0 - (dev * 30.0)
        return round(score, 1), "MODERATE", "Moderate alkalinity or acidity; potential biological stress"
    else:
        dev = min(abs(ph - 7.0) / 4.0, 1.0)
        score = max(10.0, 45.0 - (dev * 35.0))
        return round(score, 1), "CRITICAL", "Extreme pH deviation; toxic conditions for freshwater fauna"


def calculate_do_subindex(do: float) -> Tuple[float, str, str]:
    """Calculates Dissolved Oxygen sub-index (0 to 100, higher is better)."""
    if do >= 7.5:
        return 100.0, "EXCELLENT", "Rich dissolved oxygen supporting diverse biodiversity"
    elif do >= 6.0:
        score = 80.0 + ((do - 6.0) / 1.5) * 20.0
        return round(score, 1), "GOOD", "Adequate oxygenation for healthy aquatic ecosystems"
    elif do >= 4.5:
        score = 55.0 + ((do - 4.5) / 1.5) * 25.0
        return round(score, 1), "MODERATE", "Marginal oxygen concentration; early sign of eutrophication"
    elif do >= 2.5:
        score = 25.0 + ((do - 2.5) / 2.0) * 30.0
        return round(score, 1), "POOR", "Hypoxic zone developing; high fish mortality hazard"
    else:
        score = max(5.0, do * 10.0)
        return round(score, 1), "CRITICAL", "Severe anoxia; anaerobic bacterial breakdown prevalent"


def calculate_turbidity_subindex(turb: float) -> Tuple[float, str, str]:
    """Calculates Turbidity sub-index (0 to 100, lower turbidity gives higher score)."""
    if turb <= 5.0:
        score = 100.0 - (turb / 5.0) * 10.0
        return round(score, 1), "EXCELLENT", "Clear water with high solar penetration"
    elif turb <= 15.0:
        score = 90.0 - ((turb - 5.0) / 10.0) * 20.0
        return round(score, 1), "GOOD", "Moderate clarity with standard sediment suspension"
    elif turb <= 30.0:
        score = 70.0 - ((turb - 15.0) / 15.0) * 25.0
        return round(score, 1), "MODERATE", "Turbid waters; reduced light penetration and benthic health"
    elif turb <= 60.0:
        score = 45.0 - ((turb - 30.0) / 30.0) * 25.0
        return round(score, 1), "POOR", "Substantial runoff sediment or dense algal bloom"
    else:
        score = max(5.0, 20.0 - min(15.0, (turb - 60.0) * 0.2))
        return round(score, 1), "CRITICAL", "Heavy suspended solids, sludge or active effluent discharge"


def calculate_tds_subindex(tds: float) -> Tuple[float, str, str]:
    """Calculates TDS sub-index (0 to 100, lower TDS gives higher score)."""
    if tds <= 250.0:
        return 100.0, "EXCELLENT", "Low dissolved salt concentration, pristine freshwater"
    elif tds <= 500.0:
        score = 90.0 - ((tds - 250.0) / 250.0) * 20.0
        return round(score, 1), "GOOD", "Desirable mineral content within drinking/bathing guidelines"
    elif tds <= 800.0:
        score = 70.0 - ((tds - 500.0) / 300.0) * 25.0
        return round(score, 1), "MODERATE", "Elevated mineralization; agricultural or domestic drainage"
    elif tds <= 1200.0:
        score = 45.0 - ((tds - 800.0) / 400.0) * 25.0
        return round(score, 1), "POOR", "High dissolved solids impairing aquatic flora"
    else:
        score = max(5.0, 20.0 - min(15.0, (tds - 1200.0) * 0.01))
        return round(score, 1), "CRITICAL", "Extremely high TDS; severe wastewater or brine ingress"


def calculate_temp_subindex(temp: float) -> Tuple[float, str, str]:
    """Calculates Temperature sub-index (0 to 100)."""
    if 18.0 <= temp <= 25.0:
        return 100.0, "EXCELLENT", "Optimal thermal range for temperate/subtropical lakes"
    elif 25.0 < temp <= 29.0:
        score = 90.0 - ((temp - 25.0) / 4.0) * 20.0
        return round(score, 1), "GOOD", "Mild warm conditions with acceptable DO solubility"
    elif 29.0 < temp <= 33.0:
        score = 70.0 - ((temp - 29.0) / 4.0) * 25.0
        return round(score, 1), "MODERATE", "Warm surface temperature accelerates algal metabolism"
    elif temp > 33.0:
        score = max(10.0, 45.0 - (temp - 33.0) * 5.0)
        return round(score, 1), "CRITICAL", "Thermal pollution hazard; sharply drops dissolved oxygen"
    else:
        # Below 18 C
        score = max(40.0, 80.0 - (18.0 - temp) * 4.0)
        return round(score, 1), "GOOD", "Cold water profile"


def get_wqi_category_details(wqi: float) -> Tuple[str, str, str]:
    """Returns Category, Theme Color, and High-Level Status description."""
    if wqi >= 90.0:
        return "Excellent", "#10b981", "EXCELLENT"  # Emerald
    elif wqi >= 70.0:
        return "Good", "#06b6d4", "GOOD"             # Cyan
    elif wqi >= 50.0:
        return "Moderate", "#f59e0b", "MODERATE"     # Amber
    elif wqi >= 35.0:
        return "Poor", "#f97316", "POOR"             # Orange
    else:
        return "Very Poor", "#ef4444", "CRITICAL"    # Red


def compute_wqi(
    ph: float,
    turbidity: float,
    dissolved_oxygen: float,
    tds: float,
    temperature: float
) -> Dict[str, Any]:
    """
    Computes complete WQI with sub-index breakdown and transparent scientific explanation.
    """
    # 1. Parameter sub-indices
    q_ph, status_ph, expl_ph = calculate_ph_subindex(ph)
    q_do, status_do, expl_do = calculate_do_subindex(dissolved_oxygen)
    q_turb, status_turb, expl_turb = calculate_turbidity_subindex(turbidity)
    q_tds, status_tds, expl_tds = calculate_tds_subindex(tds)
    q_temp, status_temp, expl_temp = calculate_temp_subindex(temperature)

    weights = {
        "ph": PARAM_STANDARDS["ph"]["weight"],
        "dissolved_oxygen": PARAM_STANDARDS["dissolved_oxygen"]["weight"],
        "turbidity": PARAM_STANDARDS["turbidity"]["weight"],
        "tds": PARAM_STANDARDS["tds"]["weight"],
        "temperature": PARAM_STANDARDS["temperature"]["weight"],
    }
    sum_weights = sum(weights.values())

    # Weighted Arithmetic Aggregation
    composite_wqi = (
        (q_ph * weights["ph"]) +
        (q_do * weights["dissolved_oxygen"]) +
        (q_turb * weights["turbidity"]) +
        (q_tds * weights["tds"]) +
        (q_temp * weights["temperature"])
    ) / sum_weights

    composite_wqi = max(0.0, min(100.0, composite_wqi))
    category, color, status = get_wqi_category_details(composite_wqi)

    parameter_scores = [
        {
            "parameter": "pH",
            "measured_value": round(ph, 2),
            "unit": "",
            "standard_desirable": 7.0,
            "standard_permissible": 8.5,
            "sub_index_q": q_ph,
            "relative_weight_w": weights["ph"],
            "status": status_ph,
            "explanation": expl_ph
        },
        {
            "parameter": "Dissolved Oxygen",
            "measured_value": round(dissolved_oxygen, 2),
            "unit": "mg/L",
            "standard_desirable": 7.5,
            "standard_permissible": 6.0,
            "sub_index_q": q_do,
            "relative_weight_w": weights["dissolved_oxygen"],
            "status": status_do,
            "explanation": expl_do
        },
        {
            "parameter": "Turbidity",
            "measured_value": round(turbidity, 2),
            "unit": "NTU",
            "standard_desirable": 5.0,
            "standard_permissible": 15.0,
            "sub_index_q": q_turb,
            "relative_weight_w": weights["turbidity"],
            "status": status_turb,
            "explanation": expl_turb
        },
        {
            "parameter": "Total Dissolved Solids",
            "measured_value": round(tds, 1),
            "unit": "mg/L",
            "standard_desirable": 250.0,
            "standard_permissible": 500.0,
            "sub_index_q": q_tds,
            "relative_weight_w": weights["tds"],
            "status": status_tds,
            "explanation": expl_tds
        },
        {
            "parameter": "Temperature",
            "measured_value": round(temperature, 1),
            "unit": "°C",
            "standard_desirable": 22.0,
            "standard_permissible": 28.0,
            "sub_index_q": q_temp,
            "relative_weight_w": weights["temperature"],
            "status": status_temp,
            "explanation": expl_temp
        }
    ]

    # Narrative explanation
    weakest_param = min(parameter_scores, key=lambda p: p["sub_index_q"])
    if composite_wqi >= 80:
        explanation = (
            f"Overall water quality is {category.lower()} ({round(composite_wqi, 1)}/100). "
            f"All key chemical parameters are within safe ranges for aquatic biodiversity."
        )
    elif composite_wqi >= 65:
        explanation = (
            f"Overall water quality is {category.lower()} ({round(composite_wqi, 1)}/100). "
            f"Primary factor limiting score is {weakest_param['parameter']} "
            f"({weakest_param['measured_value']} {weakest_param['unit']})."
        )
    elif composite_wqi >= 50:
        explanation = (
            f"Overall water quality is {category.lower()} ({round(composite_wqi, 1)}/100). "
            f"Noticeable contamination detected, primarily driven by {weakest_param['parameter']}. "
            f"Heightened surveillance recommended."
        )
    else:
        explanation = (
            f"CRITICAL: Water quality is {category.lower()} ({round(composite_wqi, 1)}/100). "
            f"Severe ecological stress flagged. {weakest_param['parameter']} is severely impaired "
            f"at {weakest_param['measured_value']} {weakest_param['unit']}."
        )

    return {
        "score": round(composite_wqi, 1),
        "category": category,
        "color": color,
        "status": status,
        "parameter_scores": parameter_scores,
        "explanation": explanation,
        "calculation_version": "WAWQI_v1.0"
    }
