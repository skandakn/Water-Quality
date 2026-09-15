from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "viewer"  # admin, analyst, viewer

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Lake Schemas -----------------
class LakeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    location: str = Field(..., min_length=2, max_length=255)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    area_km2: float = Field(..., gt=0)
    description: Optional[str] = None

class LakeCreate(LakeBase):
    pass

class LakeResponse(LakeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LakeCardSummary(BaseModel):
    id: int
    name: str
    location: str
    latitude: float
    longitude: float
    area_km2: float
    current_wqi: float
    quality_category: str
    water_coverage_percentage: float
    risk_level: str
    monitoring_status: str
    last_updated: date

# ----------------- Water Quality Reading Schemas -----------------
class WaterQualityReadingBase(BaseModel):
    lake_id: int
    reading_date: date
    ph: float = Field(..., ge=0.0, le=14.0, description="pH between 0 and 14")
    turbidity: float = Field(..., ge=0.0, description="Turbidity in NTU")
    dissolved_oxygen: float = Field(..., ge=0.0, description="Dissolved Oxygen in mg/L")
    tds: float = Field(..., ge=0.0, description="Total Dissolved Solids in mg/L")
    temperature: float = Field(..., description="Water temperature in °C")
    conductivity: Optional[float] = Field(None, ge=0.0)
    source: str = "Sensor Node A"
    data_quality_status: str = "VALID"

class WaterQualityReadingCreate(WaterQualityReadingBase):
    pass

class WaterQualityReadingResponse(WaterQualityReadingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- WQI Schemas -----------------
class ParameterScore(BaseModel):
    parameter: str
    measured_value: float
    unit: str
    standard_desirable: float
    standard_permissible: float
    sub_index_q: float
    relative_weight_w: float
    status: str
    explanation: str

class WQICalculateRequest(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0)
    turbidity: float = Field(..., ge=0.0)
    dissolved_oxygen: float = Field(..., ge=0.0)
    tds: float = Field(..., ge=0.0)
    temperature: float = Field(..., ge=-10.0, le=60.0)

class WQICalculateResponse(BaseModel):
    score: float
    category: str
    color: str
    status: str
    parameter_scores: List[ParameterScore]
    explanation: str
    calculation_version: str = "WAWQI_v1.0"

class WQIRecordResponse(BaseModel):
    id: int
    lake_id: int
    reading_date: date
    wqi_score: float
    quality_category: str
    calculation_version: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Satellite Observation Schemas -----------------
class SatelliteObservationResponse(BaseModel):
    id: int
    lake_id: int
    observation_date: date
    water_coverage_percentage: float
    estimated_water_area_km2: float
    image_url: str
    mask_url: Optional[str] = None
    overlay_url: Optional[str] = None
    water_detection_status: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Prediction Schemas -----------------
class PredictionResponse(BaseModel):
    id: int
    lake_id: int
    prediction_date: date
    target_date: date
    predicted_wqi: float
    confidence_score: float
    risk_level: str
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True

class ForecastDay(BaseModel):
    date: date
    predicted_wqi: float
    confidence_lower: float
    confidence_upper: float
    risk_level: str

class AIForecastResponse(BaseModel):
    current_wqi: float
    predicted_7d_wqi: float
    change_points: float
    horizon_days: int
    confidence_score: float
    risk_level: str
    model_version: str
    forecast_trajectory: List[ForecastDay]
    explanation: str

# ----------------- Alert Schemas -----------------
class AlertResponse(BaseModel):
    id: int
    lake_id: int
    alert_type: str
    severity: str
    title: str
    message: str
    recommended_action: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Trend Schemas -----------------
class TrendDataPoint(BaseModel):
    date: date
    wqi: float
    ph: float
    turbidity: float
    dissolved_oxygen: float
    tds: float
    temperature: float
    is_forecast: bool = False

class TrendSummary(BaseModel):
    lake_id: int
    timeframe: str
    current: float
    average: float
    minimum: float
    maximum: float
    change_percentage: float
    trend_direction: str  # "improving", "deteriorating", "stable"
    narrative: str
    series: List[TrendDataPoint]

# ----------------- CSV Ingestion Schemas -----------------
class CSVRowValidation(BaseModel):
    row_number: int
    lake_name: str
    date: str
    ph: Optional[float] = None
    turbidity: Optional[float] = None
    dissolved_oxygen: Optional[float] = None
    tds: Optional[float] = None
    temperature: Optional[float] = None
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    status: str  # VALID, SUSPICIOUS, MISSING, REVIEW_REQUIRED

class CSVUploadValidationResult(BaseModel):
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    suspicious_count: int
    preview_rows: List[CSVRowValidation]
    can_import: bool

# ----------------- Complete Dashboard Response -----------------
class DashboardParameter(BaseModel):
    name: str
    key: str
    value: float
    unit: str
    status: str
    color: str
    mini_trend: str
    change_pct: float
    tooltip: str

class DashboardResponse(BaseModel):
    lake: LakeResponse
    greeting: str
    water_coverage_percentage: float
    water_coverage_change: float
    estimated_water_area_km2: float
    current_wqi: float
    wqi_change_pct: float
    wqi_category: str
    wqi_color: str
    monitoring_status: str
    monitoring_status_color: str
    ai_satellite_analysis: str
    satellite_latest: SatelliteObservationResponse
    parameters: List[DashboardParameter]
    parameter_scores: List[ParameterScore]
    forecast: AIForecastResponse
    active_alerts: List[AlertResponse]
    historical_trend: TrendSummary
    is_demo_mode: bool = True
