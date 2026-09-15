import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { AIForecast } from '../types';
import { Sparkles, ShieldAlert, ArrowDownRight, ArrowUpRight, Minus, AlertCircle } from 'lucide-react';

interface ForecastCardProps {
  forecast: AIForecast;
  historicalRecent?: { date: string; wqi: number }[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  historicalRecent = [],
}) => {
  // Combine historical recent points with forecast trajectory for unified visual progression
  const chartData = [
    ...historicalRecent.slice(-7).map((h) => ({
      date: h.date.slice(5),
      actual_wqi: h.wqi,
      predicted_wqi: null,
      confidence_lower: null,
      confidence_upper: null,
      is_forecast: false,
    })),
    // Connecting bridge point
    ...(historicalRecent.length > 0 ? [{
      date: historicalRecent[historicalRecent.length - 1].date.slice(5),
      actual_wqi: historicalRecent[historicalRecent.length - 1].wqi,
      predicted_wqi: historicalRecent[historicalRecent.length - 1].wqi,
      confidence_lower: historicalRecent[historicalRecent.length - 1].wqi,
      confidence_upper: historicalRecent[historicalRecent.length - 1].wqi,
      is_forecast: true,
    }] : []),
    ...forecast.forecast_trajectory.map((f) => ({
      date: f.date.slice(5),
      actual_wqi: null,
      predicted_wqi: f.predicted_wqi,
      confidence_lower: f.confidence_lower,
      confidence_upper: f.confidence_upper,
      is_forecast: true,
    })),
  ];

  const isDeteriorating = forecast.change_points < -2;
  const isImproving = forecast.change_points > 2;

  const riskColor = 
    forecast.risk_level.includes('CRITICAL') ? '#ef4444' :
    forecast.risk_level.includes('MODERATE') ? '#f59e0b' :
    forecast.risk_level.includes('IMPROVING') ? '#10b981' : '#06b6d4';

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              AI Water Quality Forecast
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              RF-TS Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Short-term predictive horizon based on historical lag dynamics & sensor stressors
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400 mr-1.5">Model Confidence:</span>
            <strong className="text-cyan-300 font-mono">{forecast.confidence_score}%</strong>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Current WQI</p>
          <p className="text-2xl font-black text-white font-['Outfit'] mt-1">{forecast.current_wqi}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Predicted 7-Day WQI</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-['Outfit']" style={{ color: riskColor }}>
              {forecast.predicted_7d_wqi}
            </span>
            <span className={`text-xs font-semibold flex items-center ${
              isDeteriorating ? 'text-rose-400' : (isImproving ? 'text-emerald-400' : 'text-slate-400')
            }`}>
              {isDeteriorating && <ArrowDownRight className="w-3 h-3" />}
              {isImproving && <ArrowUpRight className="w-3 h-3" />}
              {!isDeteriorating && !isImproving && <Minus className="w-3 h-3" />}
              {forecast.change_points > 0 ? `+${forecast.change_points}` : forecast.change_points} pts
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Forecast Horizon</p>
          <p className="text-2xl font-black text-cyan-300 font-['Outfit'] mt-1">{forecast.horizon_days} Days</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Risk Classification</p>
          <span 
            className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border"
            style={{ 
              backgroundColor: `${riskColor}15`, 
              color: riskColor,
              borderColor: `${riskColor}40`
            }}
          >
            {forecast.risk_level}
          </span>
        </div>
      </div>

      {/* Trajectory Chart with Shaded Prediction Zone */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={riskColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={riskColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickMargin={8} />
            <YAxis stroke="#64748b" fontSize={11} domain={[50, 100]} tickMargin={8} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className="p-3 rounded-xl bg-[#0b1426]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-md text-xs">
                      <p className="text-slate-400 font-mono text-[11px] mb-1">
                        Date: {label} {dataPoint.is_forecast && '(Forecast)'}
                      </p>
                      {dataPoint.actual_wqi !== null && (
                        <p className="text-cyan-300 font-sans">
                          Historical Observed WQI: <strong className="font-mono">{dataPoint.actual_wqi}</strong>
                        </p>
                      )}
                      {dataPoint.predicted_wqi !== null && (
                        <div className="mt-1 space-y-0.5">
                          <p style={{ color: riskColor }}>
                            Predicted WQI: <strong className="font-mono">{dataPoint.predicted_wqi}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Confidence Bounds: [{dataPoint.confidence_lower} – {dataPoint.confidence_upper}]
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Historical Segment */}
            <Area 
              type="monotone" 
              dataKey="actual_wqi" 
              stroke="#06b6d4" 
              strokeWidth={2.5} 
              fill="none" 
              dot={{ r: 3, fill: '#06b6d4' }}
            />

            {/* Projected Segment (Dashed line with gradient area) */}
            <Area 
              type="monotone" 
              dataKey="predicted_wqi" 
              stroke={riskColor} 
              strokeWidth={2.5} 
              strokeDasharray="5 5" 
              fill="url(#predGrad)" 
              dot={{ r: 4, fill: riskColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">AI Prognosis: </strong>
          {forecast.explanation}
        </p>
      </div>

      {/* Mandatory Scientific Estimation Disclaimer */}
      <p className="text-[10px] text-slate-500 text-center mt-3">
        * Predictions are time-series ML estimates based on historical trajectories and environmental stressors. 
        Forecasts should be used in conjunction with active field surveys.
      </p>
    </div>
  );
};
