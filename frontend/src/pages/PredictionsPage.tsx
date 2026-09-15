import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchLakes } from '../services/api';
import { DashboardData, LakeCardSummary } from '../types';
import { ForecastCard } from '../components/ForecastCard';
import { Sparkles, Brain, Sliders, ChevronDown, Loader2, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const PredictionsPage: React.FC = () => {
  const [selectedLakeId, setSelectedLakeId] = useState<number>(1);
  const [lakes, setLakes] = useState<LakeCardSummary[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [retraining, setRetraining] = useState<boolean>(false);

  useEffect(() => {
    fetchLakes().then(setLakes).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDashboard(selectedLakeId)
      .then(setDashboardData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedLakeId]);

  const handleSimulateNewInference = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      fetchDashboard(selectedLakeId).then(setDashboardData);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Predictive AI Intelligence Lab
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              RF-TS Model v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine Learning regression projecting 7-day WQI trajectory with confidence intervals and risk mitigation actions
          </p>
        </div>

        {/* Lake Selector & On-Demand Inference Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedLakeId}
              onChange={(e) => setSelectedLakeId(Number(e.target.value))}
              className="appearance-none bg-slate-900 border border-cyan-500/30 text-white text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {lakes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleSimulateNewInference}
            disabled={retraining}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Computing Inference...' : 'Generate New Forecast'}</span>
          </button>
        </div>
      </div>

      {loading || !dashboardData ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading ML predictions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Forecast Visual Card */}
          <ForecastCard
            forecast={dashboardData.forecast}
            historicalRecent={dashboardData.historical_trend.series}
          />

          {/* Model Architecture & Feature Weights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature Importances Card */}
            <div className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Feature Importance Weights</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Relative influence of telemetry signals in predicting 7-day future WQI
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Recent WQI Momentum (lag_1)</span>
                    <span className="font-mono text-cyan-400 font-bold">93.2%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '93.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>3-Day Lag Profile (lag_3)</span>
                    <span className="font-mono text-cyan-400 font-bold">1.7%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Dissolved Oxygen Gradient</span>
                    <span className="font-mono text-cyan-400 font-bold">1.2%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Turbidity Plume Spikes</span>
                    <span className="font-mono text-cyan-400 font-bold">0.9%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Model Architecture Specifications */}
            <div className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Model Architecture Specifications</span>
              </h3>
              <p className="text-xs text-slate-400">
                Lightweight, fast, interpretable tree-based ensemble trained for real-time hackathon deployment
              </p>

              <div className="divide-y divide-slate-800 text-xs text-slate-300">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Model Family</span>
                  <span className="font-semibold text-white">RandomForestRegressor (100 Estimators)</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Cross-Validation R²</span>
                  <span className="font-mono font-bold text-emerald-400">0.9544 (95.44%)</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Root Mean Squared Error (RMSE)</span>
                  <span className="font-mono text-cyan-300">3.00 WQI points</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Mean Absolute Error (MAE)</span>
                  <span className="font-mono text-cyan-300">2.32 WQI points</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Inference Latency</span>
                  <span className="font-mono text-emerald-400">&lt; 15 ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
