import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchLakes } from '../services/api';
import { DashboardData, LakeCardSummary } from '../types';
import { MetricCard } from '../components/MetricCard';
import { SatelliteViewer } from '../components/SatelliteViewer';
import { ParameterCard } from '../components/ParameterCard';
import { WqiGauge } from '../components/WqiGauge';
import { TrendChart } from '../components/TrendChart';
import { ForecastCard } from '../components/ForecastCard';
import { AlertBanner } from '../components/AlertBanner';
import { DemoModeToggle } from '../components/DemoModeToggle';
import { MethodologyModal } from '../components/MethodologyModal';
import { 
  Eye, Droplet, Activity, ShieldCheck, AlertTriangle, 
  MapPin, RefreshCw, Loader2, Sparkles, ChevronDown 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [selectedLakeId, setSelectedLakeId] = useState<number>(1);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lakesList, setLakesList] = useState<LakeCardSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trendDays, setTrendDays] = useState<number>(30);
  const [methodologyOpen, setMethodologyOpen] = useState<boolean>(false);

  // Load Lakes Catalog
  useEffect(() => {
    fetchLakes().then((data) => {
      setLakesList(data);
    }).catch((err) => console.warn('Lakes list load error', err));
  }, []);

  // Load Dashboard Data for selected lake
  const loadDashboard = async (lakeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard(lakeId);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lake dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(selectedLakeId);
  }, [selectedLakeId]);

  const handleLakeChange = (id: number) => {
    setSelectedLakeId(id);
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white font-['Outfit']">Connecting to Telemetry Stations...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Fetching orbital satellite extent segmentation and multi-sensor physicochemical telemetry.
        </p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white font-['Outfit']">Unable to Load Lake Telemetry</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">{error}</p>
        <button
          onClick={() => loadDashboard(selectedLakeId)}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Hackathon Demo Mode Switcher Bar */}
      <DemoModeToggle 
        currentLakeId={selectedLakeId} 
        onSelectLake={handleLakeChange} 
      />

      {/* Command Center Greeting & Lake Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
              {dashboardData.greeting}
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Basin: </span>
            <strong className="text-slate-200">{dashboardData.lake.name}</strong>
            <span className="text-slate-500">({dashboardData.lake.location})</span>
          </p>
        </div>

        {/* Lake Selector Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="lake-select" className="text-xs text-slate-400 font-medium">Select Lake:</label>
          <div className="relative">
            <select
              id="lake-select"
              value={selectedLakeId}
              onChange={(e) => handleLakeChange(Number(e.target.value))}
              className="appearance-none bg-slate-900 border border-cyan-500/30 text-white text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-cyan-400 shadow-md cursor-pointer"
            >
              {lakesList.map((l) => (
                <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                  {l.name} — WQI {Math.round(l.current_wqi)} ({l.monitoring_status})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => loadDashboard(selectedLakeId)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Water Coverage */}
        <MetricCard
          title="Water Coverage"
          value={dashboardData.water_coverage_percentage}
          unit="%"
          subValue="Sentinel-2 Optical Segmentation"
          icon={Eye}
          trend={{
            direction: dashboardData.water_coverage_change < 0 ? 'down' : 'up',
            value: `${Math.abs(dashboardData.water_coverage_change)}%`,
            isPositive: dashboardData.water_coverage_change >= 0,
          }}
          accentColor="#06b6d4"
        />

        {/* 2. Est. Water Area */}
        <MetricCard
          title="Est. Water Area"
          value={dashboardData.estimated_water_area_km2}
          unit="km²"
          subValue={`Total Basin: ${dashboardData.lake.area_km2} km²`}
          icon={Droplet}
          trend={{
            direction: 'stable',
            value: 'Baseline',
            isPositive: true,
          }}
          accentColor="#38bdf8"
        />

        {/* 3. Current WQI */}
        <MetricCard
          title="Water Quality Index"
          value={dashboardData.current_wqi}
          unit="/ 100"
          subValue={`Quality: ${dashboardData.wqi_category}`}
          icon={Activity}
          trend={{
            direction: dashboardData.wqi_change_pct < 0 ? 'down' : 'up',
            value: `${Math.abs(dashboardData.wqi_change_pct)}%`,
            isPositive: dashboardData.wqi_change_pct >= 0,
          }}
          accentColor={dashboardData.wqi_color}
        />

        {/* 4. Monitoring Status */}
        <MetricCard
          title="Monitoring Status"
          value={dashboardData.monitoring_status}
          subValue="Autonomous Risk Evaluation"
          icon={ShieldCheck}
          statusBadge={{
            text: dashboardData.monitoring_status,
            color: dashboardData.monitoring_status_color,
            bg: `${dashboardData.monitoring_status_color}15`,
          }}
          accentColor={dashboardData.monitoring_status_color}
        />
      </div>

      {/* Active Early Warning Banner Section */}
      <AlertBanner alerts={dashboardData.active_alerts} />

      {/* Main Grid: Satellite Extent & Circular WQI Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Satellite Monitor */}
        <div className="lg:col-span-2" id="satellite">
          <SatelliteViewer
            observation={dashboardData.satellite_latest}
            lakeName={dashboardData.lake.name}
            aiAnalysisText={dashboardData.ai_satellite_analysis}
          />
        </div>

        {/* Right 1 Col: WQI Circular Gauge */}
        <div className="lg:col-span-1">
          <WqiGauge
            score={dashboardData.current_wqi}
            category={dashboardData.wqi_category}
            parameterScores={dashboardData.parameter_scores}
            onOpenMethodology={() => setMethodologyOpen(true)}
          />
        </div>
      </div>

      {/* Water Quality Parameters Section */}
      <div id="water-quality">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-['Outfit'] uppercase tracking-wider">
              Physicochemical Sensor Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              In-situ measurements from station sensor nodes calibrated against CPCB Class C standards
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
            5 Stations Transmitting
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardData.parameters.map((param) => (
            <ParameterCard key={param.key} param={param} />
          ))}
        </div>
      </div>

      {/* Bottom Section: Trend Analyzer & AI Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Trend Analyzer */}
        <TrendChart
          trendData={dashboardData.historical_trend}
          selectedDays={trendDays}
          onTimeframeChange={(days) => setTrendDays(days)}
        />

        {/* Right: AI Forecast Card */}
        <ForecastCard
          forecast={dashboardData.forecast}
          historicalRecent={dashboardData.historical_trend.series}
        />
      </div>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />
    </div>
  );
};
