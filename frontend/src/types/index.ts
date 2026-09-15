export interface Lake {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  area_km2: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LakeCardSummary {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  area_km2: number;
  current_wqi: number;
  quality_category: string;
  water_coverage_percentage: number;
  risk_level: string;
  monitoring_status: 'STABLE' | 'MODERATE' | 'CRITICAL';
  last_updated: string;
}

export interface ParameterScore {
  parameter: string;
  measured_value: number;
  unit: string;
  standard_desirable: number;
  standard_permissible: number;
  sub_index_q: number;
  relative_weight_w: number;
  status: string;
  explanation: string;
}

export interface DashboardParameter {
  name: string;
  key: string;
  value: number;
  unit: string;
  status: string;
  color: string;
  mini_trend: 'up' | 'down' | 'stable';
  change_pct: number;
  tooltip: string;
}

export interface SatelliteObservation {
  id: number;
  lake_id: number;
  observation_date: string;
  water_coverage_percentage: number;
  estimated_water_area_km2: number;
  image_url: string;
  mask_url?: string;
  overlay_url?: string;
  water_detection_status: string;
  source: string;
  created_at?: string;
}

export interface ForecastDay {
  date: string;
  predicted_wqi: number;
  confidence_lower: number;
  confidence_upper: number;
  risk_level: string;
}

export interface AIForecast {
  current_wqi: number;
  predicted_7d_wqi: number;
  change_points: number;
  horizon_days: number;
  confidence_score: number;
  risk_level: string;
  model_version: string;
  forecast_trajectory: ForecastDay[];
  explanation: string;
}

export interface AlertItem {
  id: number;
  lake_id: number;
  alert_type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  recommended_action: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
}

export interface TrendPoint {
  date: string;
  wqi: number;
  ph: number;
  turbidity: number;
  dissolved_oxygen: number;
  tds: number;
  temperature: number;
  is_forecast?: boolean;
}

export interface TrendSummary {
  lake_id: number;
  timeframe: string;
  current: number;
  average: number;
  minimum: number;
  maximum: number;
  change_percentage: number;
  trend_direction: 'improving' | 'deteriorating' | 'stable';
  narrative: string;
  series: TrendPoint[];
}

export interface DashboardData {
  lake: Lake;
  greeting: string;
  water_coverage_percentage: number;
  water_coverage_change: number;
  estimated_water_area_km2: number;
  current_wqi: number;
  wqi_change_pct: number;
  wqi_category: string;
  wqi_color: string;
  monitoring_status: string;
  monitoring_status_color: string;
  ai_satellite_analysis: string;
  satellite_latest: SatelliteObservation;
  parameters: DashboardParameter[];
  parameter_scores: ParameterScore[];
  forecast: AIForecast;
  active_alerts: AlertItem[];
  historical_trend: TrendSummary;
  is_demo_mode: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface CSVRowValidation {
  row_number: number;
  lake_name: string;
  date: string;
  ph?: number;
  turbidity?: number;
  dissolved_oxygen?: number;
  tds?: number;
  temperature?: number;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  status: 'VALID' | 'SUSPICIOUS' | 'MISSING' | 'REVIEW_REQUIRED';
}

export interface CSVUploadValidationResult {
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
  suspicious_count: number;
  preview_rows: CSVRowValidation[];
  can_import: boolean;
}

export interface TelegramStatus {
  configured: boolean;
  chat_configured: boolean;
  bot_username?: string;
  bot_link?: string;
}

export interface TelegramUpdateChat {
  update_id?: number;
  chat_id: string;
  chat_type?: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  message_preview?: string;
  received_at?: string;
}

export interface TelegramSendResult {
  ok: boolean;
  message_id?: number;
  sent_count: number;
  detail: string;
}
