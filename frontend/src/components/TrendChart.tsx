import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { TrendSummary } from '../types';
import { TrendingDown, TrendingUp, Minus, Calendar, Sliders } from 'lucide-react';

interface TrendChartProps {
  trendData: TrendSummary;
  onTimeframeChange?: (days: number) => void;
  selectedDays?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  trendData,
  onTimeframeChange,
  selectedDays = 30,
}) => {
  const [activeParams, setActiveParams] = useState<{ [key: string]: boolean }>({
    wqi: true,
    ph: false,
    turbidity: false,
    dissolved_oxygen: false,
  });

  const toggleParam = (key: string) => {
    setActiveParams((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const paramConfig = [
    { key: 'wqi', label: 'WQI Score', color: '#06b6d4', unit: '' },
    { key: 'ph', label: 'pH', color: '#10b981', unit: '' },
    { key: 'turbidity', label: 'Turbidity (NTU)', color: '#f59e0b', unit: 'NTU' },
    { key: 'dissolved_oxygen', label: 'DO (mg/L)', color: '#38bdf8', unit: 'mg/L' },
  ];

  const timeframes = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
    { label: '6 Months', value: 180 },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-5 shadow-xl">
      {/* Header Row: Title & Timeframe Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Water Quality Trend Analyzer
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Interactive Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-parameter temporal progression across sensor observation series
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange && onTimeframeChange(tf.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDays === tf.value
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Multi-Select Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sliders className="w-3 h-3 text-cyan-400" /> Parameters:
        </span>
        {paramConfig.map((p) => {
          const isSelected = activeParams[p.key];
          return (
            <button
              key={p.key}
              onClick={() => toggleParam(p.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-300'
              }`}
              style={{
                borderColor: isSelected ? `${p.color}50` : undefined,
                color: isSelected ? p.color : undefined,
              }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: isSelected ? p.color : '#475569' }} 
              />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Recharts Responsive Area Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {paramConfig.map((p) => (
                <linearGradient key={p.key} id={`grad_${p.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={p.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={p.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={11} 
              tickFormatter={(val) => val.slice(5)} 
              tickMargin={8}
            />
            <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} tickMargin={8} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-xl bg-[#0b1426]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-md text-xs">
                      <p className="text-slate-400 font-mono text-[11px] mb-2">{label}</p>
                      <div className="space-y-1">
                        {payload.map((item: any) => (
                          <div key={item.name} className="flex items-center justify-between gap-4 font-sans">
                            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}:
                            </span>
                            <strong className="text-white font-mono">{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Dynamic Parameter Curves */}
            {activeParams.wqi && (
              <Area 
                type="monotone" 
                dataKey="wqi" 
                name="WQI Score" 
                stroke="#06b6d4" 
                strokeWidth={2.5} 
                fill="url(#grad_wqi)" 
              />
            )}
            {activeParams.ph && (
              <Area 
                type="monotone" 
                dataKey="ph" 
                name="pH" 
                stroke="#10b981" 
                strokeWidth={2} 
                fill="url(#grad_ph)" 
              />
            )}
            {activeParams.turbidity && (
              <Area 
                type="monotone" 
                dataKey="turbidity" 
                name="Turbidity (NTU)" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                fill="url(#grad_turbidity)" 
              />
            )}
            {activeParams.dissolved_oxygen && (
              <Area 
                type="monotone" 
                dataKey="dissolved_oxygen" 
                name="DO (mg/L)" 
                stroke="#38bdf8" 
                strokeWidth={2} 
                fill="url(#grad_dissolved_oxygen)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Metrics Strip */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Current WQI</p>
          <p className="text-lg font-bold text-white font-['Outfit'] mt-0.5">{trendData.current}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Period Average</p>
          <p className="text-lg font-bold text-slate-300 font-['Outfit'] mt-0.5">{trendData.average}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Minimum</p>
          <p className="text-lg font-bold text-rose-400 font-['Outfit'] mt-0.5">{trendData.minimum}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Maximum</p>
          <p className="text-lg font-bold text-emerald-400 font-['Outfit'] mt-0.5">{trendData.maximum}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Delta</p>
          <p className={`text-lg font-bold font-['Outfit'] mt-0.5 flex items-center gap-1 ${
            trendData.change_percentage < 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {trendData.change_percentage < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            {trendData.change_percentage}%
          </p>
        </div>
      </div>

      {/* Dynamic Trend Narrative */}
      <div className="mt-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span><strong>Trend Analysis: </strong>{trendData.narrative}</span>
        <span className="text-[11px] font-mono text-cyan-400/80 hidden sm:inline">Confidence: 94.2%</span>
      </div>
    </div>
  );
};
