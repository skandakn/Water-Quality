import { 
  Lake, LakeCardSummary, DashboardData, TrendSummary, 
  AIForecast, SatelliteObservation, AlertItem, CSVUploadValidationResult,
  TelegramStatus, TelegramUpdateChat, TelegramSendResult
} from '../types';

const API_BASE = '/api';

export async function fetchLakes(search?: string, risk?: string, status?: string): Promise<LakeCardSummary[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (risk) params.append('risk', risk);
    if (status) params.append('status', status);
    
    const res = await fetch(`${API_BASE}/lakes?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Lakes fetch failed, using fallback catalog', err);
    return [
      {
        id: 1,
        name: 'Lake Pavna',
        location: 'Maval, Pune, Maharashtra',
        latitude: 18.6833,
        longitude: 73.4833,
        area_km2: 24.50,
        current_wqi: 72.0,
        quality_category: 'Good',
        water_coverage_percentage: 46.96,
        risk_level: 'MODERATE DETERIORATION',
        monitoring_status: 'MODERATE',
        last_updated: '2026-09-15'
      },
      {
        id: 2,
        name: 'Lake Vembanad',
        location: 'Alappuzha & Kottayam, Kerala',
        latitude: 9.6167,
        longitude: 76.4333,
        area_km2: 96.50,
        current_wqi: 80.5,
        quality_category: 'Good',
        water_coverage_percentage: 68.20,
        risk_level: 'STABLE CONDITION',
        monitoring_status: 'STABLE',
        last_updated: '2026-09-15'
      },
      {
        id: 3,
        name: 'Dal Lake',
        location: 'Srinagar, Jammu & Kashmir',
        latitude: 34.1167,
        longitude: 74.8667,
        area_km2: 18.00,
        current_wqi: 76.0,
        quality_category: 'Good',
        water_coverage_percentage: 58.40,
        risk_level: 'IMPROVING TREND',
        monitoring_status: 'STABLE',
        last_updated: '2026-09-15'
      }
    ];
  }
}

export async function fetchDashboard(lakeId: number = 1): Promise<DashboardData> {
  try {
    const res = await fetch(`${API_BASE}/dashboard/${lakeId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Dashboard fetch fallback', err);
    // Return the exact Deteriorating Main Demo scenario
    return {
      lake: {
        id: 1,
        name: 'Lake Pavna',
        location: 'Maval, Pune, Maharashtra',
        latitude: 18.6833,
        longitude: 73.4833,
        area_km2: 24.50,
        description: 'Critical freshwater reservoir supplying Pune metropolitan corridor. Currently under accelerated monitoring due to upstream catchment activity.'
      },
      greeting: 'Good Morning, Water Intelligence Team',
      water_coverage_percentage: 46.96,
      water_coverage_change: -1.4,
      estimated_water_area_km2: 10.993,
      current_wqi: 72.0,
      wqi_change_pct: -8.4,
      wqi_category: 'Good',
      wqi_color: '#06b6d4',
      monitoring_status: 'MODERATE',
      monitoring_status_color: '#f59e0b',
      ai_satellite_analysis: 'Water extent detected across 46.96% of the analyzed image. Estimated surface water area is 10.993 km². The system detected a moderate monitoring condition based on current observations.',
      satellite_latest: {
        id: 1,
        lake_id: 1,
        observation_date: '2026-09-15',
        water_coverage_percentage: 46.96,
        estimated_water_area_km2: 10.993,
        image_url: '/assets/satellite/lake_satellite.jpg',
        mask_url: '/assets/satellite/lake_water_mask.png',
        overlay_url: '/assets/satellite/lake_ai_overlay.png',
        water_detection_status: 'Water Detected',
        source: 'Sentinel-2 Optical (Simulated)'
      },
      parameters: [
        {
          name: 'pH',
          key: 'ph',
          value: 7.4,
          unit: '',
          status: 'GOOD',
          color: '#10b981',
          mini_trend: 'stable',
          change_pct: -0.2,
          tooltip: 'Hydrogen-ion concentration. Pure water is 7.0. Acceptable freshwater range is 6.5 - 8.5.'
        },
        {
          name: 'Turbidity',
          key: 'turbidity',
          value: 18.0,
          unit: 'NTU',
          status: 'MODERATE',
          color: '#f59e0b',
          mini_trend: 'up',
          change_pct: 35.0,
          tooltip: 'Water cloudiness caused by suspended sediments, micro-algae, or runoff particulates.'
        },
        {
          name: 'Dissolved Oxygen',
          key: 'dissolved_oxygen',
          value: 5.8,
          unit: 'mg/L',
          status: 'GOOD',
          color: '#10b981',
          mini_trend: 'down',
          change_pct: -12.4,
          tooltip: 'Essential oxygen dissolved in lake water for fish, zooplankton, and aerobic benthic bacteria.'
        },
        {
          name: 'Total Dissolved Solids',
          key: 'tds',
          value: 420.0,
          unit: 'mg/L',
          status: 'MODERATE',
          color: '#f59e0b',
          mini_trend: 'up',
          change_pct: 18.2,
          tooltip: 'Mineral salts, calcium, magnesium, and inorganic salts dissolved in solution.'
        },
        {
          name: 'Temperature',
          key: 'temperature',
          value: 27.0,
          unit: '°C',
          status: 'NORMAL',
          color: '#06b6d4',
          mini_trend: 'stable',
          change_pct: 0.5,
          tooltip: 'Ambient surface water temperature governing biochemical reaction rates and gas solubility.'
        }
      ],
      parameter_scores: [
        {
          parameter: 'pH',
          measured_value: 7.4,
          unit: '',
          standard_desirable: 7.0,
          standard_permissible: 8.5,
          sub_index_q: 93.3,
          relative_weight_w: 0.25,
          status: 'GOOD',
          explanation: 'Within acceptable standards for aquatic life'
        },
        {
          parameter: 'Dissolved Oxygen',
          measured_value: 5.8,
          unit: 'mg/L',
          standard_desirable: 7.5,
          standard_permissible: 6.0,
          sub_index_q: 76.7,
          relative_weight_w: 0.30,
          status: 'MODERATE',
          explanation: 'Adequate oxygenation for healthy aquatic ecosystems'
        },
        {
          parameter: 'Turbidity',
          measured_value: 18.0,
          unit: 'NTU',
          standard_desirable: 5.0,
          standard_permissible: 15.0,
          sub_index_q: 65.0,
          relative_weight_w: 0.15,
          status: 'MODERATE',
          explanation: 'Turbid waters; reduced light penetration and benthic health'
        },
        {
          parameter: 'Total Dissolved Solids',
          measured_value: 420.0,
          unit: 'mg/L',
          standard_desirable: 250.0,
          standard_permissible: 500.0,
          sub_index_q: 76.4,
          relative_weight_w: 0.15,
          status: 'GOOD',
          explanation: 'Desirable mineral content within drinking/bathing guidelines'
        },
        {
          parameter: 'Temperature',
          measured_value: 27.0,
          unit: '°C',
          standard_desirable: 22.0,
          standard_permissible: 28.0,
          sub_index_q: 80.0,
          relative_weight_w: 0.15,
          status: 'GOOD',
          explanation: 'Mild warm conditions with acceptable DO solubility'
        }
      ],
      forecast: {
        current_wqi: 72.0,
        predicted_7d_wqi: 64.0,
        change_points: -8.0,
        horizon_days: 7,
        confidence_score: 82.0,
        risk_level: 'MODERATE DETERIORATION',
        model_version: 'RF_TS_v1.0',
        forecast_trajectory: [
          { date: '2026-09-16', predicted_wqi: 71.0, confidence_lower: 68.3, confidence_upper: 73.7, risk_level: 'MODERATE' },
          { date: '2026-09-17', predicted_wqi: 69.8, confidence_lower: 66.2, confidence_upper: 73.4, risk_level: 'MODERATE' },
          { date: '2026-09-18', predicted_wqi: 68.5, confidence_lower: 64.0, confidence_upper: 73.0, risk_level: 'MODERATE' },
          { date: '2026-09-19', predicted_wqi: 67.2, confidence_lower: 61.8, confidence_upper: 72.6, risk_level: 'MODERATE' },
          { date: '2026-09-20', predicted_wqi: 66.0, confidence_lower: 59.7, confidence_upper: 72.3, risk_level: 'MODERATE' },
          { date: '2026-09-21', predicted_wqi: 64.9, confidence_lower: 57.7, confidence_upper: 72.1, risk_level: 'MODERATE' },
          { date: '2026-09-22', predicted_wqi: 64.0, confidence_lower: 55.9, confidence_upper: 72.1, risk_level: 'MODERATE' }
        ],
        explanation: 'WQI is projected to decline from 72.0 to 64.0 over the next 7 days (-8.0 point drop). Primary contributing factors include negative historical momentum compounded by elevated turbidity and declining dissolved oxygen.'
      },
      active_alerts: [
        {
          id: 1,
          lake_id: 1,
          alert_type: 'WQI DETERIORATION',
          severity: 'MODERATE',
          title: 'Water Quality Showing Downward Trend',
          message: 'WQI is projected to decline from 72 to 64 over the next 7 days.',
          recommended_action: 'Increase monitoring frequency and investigate potential upstream pollution sources.',
          status: 'ACTIVE',
          created_at: '2026-09-15'
        },
        {
          id: 2,
          lake_id: 1,
          alert_type: 'TURBIDITY SPIKE',
          severity: 'MODERATE',
          title: 'Elevated Turbidity (18.0 NTU)',
          message: 'Turbidity reading of 18.0 NTU indicates increased suspended particulates.',
          recommended_action: 'Check catchment sedimentation basins and inspect perimeter buffer vegetation.',
          status: 'ACTIVE',
          created_at: '2026-09-15'
        }
      ],
      historical_trend: {
        lake_id: 1,
        timeframe: '30 Days',
        current: 72.0,
        average: 76.8,
        minimum: 72.0,
        maximum: 82.0,
        change_percentage: -11.2,
        trend_direction: 'deteriorating',
        narrative: 'WQI decreased by 11.2% over the last 30 days.',
        series: Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          const frac = i / 29.0;
          const wqiVal = Math.round((82 - (frac * 10) + (Math.sin(i) * 0.8)) * 10) / 10;
          return {
            date: d.toISOString().split('T')[0],
            wqi: wqiVal,
            ph: 7.4 - (frac * 0.2),
            turbidity: 8.0 + (frac * 10.0),
            dissolved_oxygen: 6.8 - (frac * 1.0),
            tds: 320 + (frac * 100),
            temperature: 26.0 + (frac * 1.0),
            is_forecast: false
          };
        })
      },
      is_demo_mode: true
    };
  }
}

export async function fetchTrends(lakeId: number, days: number = 30): Promise<TrendSummary> {
  try {
    const res = await fetch(`${API_BASE}/trends/${lakeId}?days=${days}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const dash = await fetchDashboard(lakeId);
    return dash.historical_trend;
  }
}

export async function fetchAlerts(lakeId?: number, severity?: string): Promise<AlertItem[]> {
  try {
    const params = new URLSearchParams();
    if (lakeId) params.append('lake_id', lakeId.toString());
    if (severity) params.append('severity', severity);
    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const dash = await fetchDashboard(lakeId || 1);
    return dash.active_alerts;
  }
}

export async function uploadWaterQualityCSV(file: File, executeImport: boolean = false): Promise<CSVUploadValidationResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/water-quality/upload-csv?execute_import=${executeImport}`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(`CSV Upload failed with HTTP ${res.status}`);
  return await res.json();
}

export async function fetchLakeReport(lakeId: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/reports/${lakeId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const dash = await fetchDashboard(lakeId);
    return {
      report_id: `JD-REP-${lakeId}-DEMO`,
      generated_at: new Date().toISOString(),
      platform: 'Jaal Drushti - AI Lake Water Intelligence',
      lake_overview: dash.lake,
      current_status: {
        wqi_score: dash.current_wqi,
        wqi_category: dash.wqi_category,
        monitoring_status: dash.monitoring_status
      },
      satellite_intelligence: dash.satellite_latest,
      physicochemical_readings: dash.parameters,
      ai_predictive_forecast: dash.forecast,
      active_early_warnings: dash.active_alerts,
      regulatory_recommendations: [
        'Increase monitoring frequency from weekly to daily.',
        'Deploy silt curtains near active construction or agricultural inflow zones.',
        'Investigate upstream point sources for potential organic discharge.'
      ]
    };
  }
}

export async function fetchTelegramStatus(): Promise<TelegramStatus> {
  const res = await fetch(`${API_BASE}/telegram/status`);
  if (!res.ok) throw new Error(`Telegram status failed with HTTP ${res.status}`);
  return await res.json();
}

export async function testTelegramBot(): Promise<{ ok: boolean; username?: string; first_name?: string }> {
  const res = await fetch(`${API_BASE}/telegram/test`, { method: 'POST' });
  if (!res.ok) throw new Error(await readApiError(res));
  return await res.json();
}

export async function fetchTelegramUpdates(): Promise<TelegramUpdateChat[]> {
  const res = await fetch(`${API_BASE}/telegram/updates`);
  if (!res.ok) throw new Error(await readApiError(res));
  return await res.json();
}

function telegramTargetBody(chatId?: string): RequestInit {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(chatId ? { chat_id: chatId } : {})
  };
}

export async function sendTelegramTest(chatId?: string): Promise<TelegramSendResult> {
  const res = await fetch(`${API_BASE}/telegram/send-test`, telegramTargetBody(chatId));
  if (!res.ok) throw new Error(await readApiError(res));
  return await res.json();
}

export async function sendTelegramAlert(alertId: number, chatId?: string): Promise<TelegramSendResult> {
  const res = await fetch(`${API_BASE}/telegram/alerts/${alertId}/send`, telegramTargetBody(chatId));
  if (!res.ok) throw new Error(await readApiError(res));
  return await res.json();
}

export async function sendActiveTelegramAlerts(chatId?: string): Promise<TelegramSendResult> {
  const res = await fetch(`${API_BASE}/telegram/alerts/send-active`, telegramTargetBody(chatId));
  if (!res.ok) throw new Error(await readApiError(res));
  return await res.json();
}

async function readApiError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}
