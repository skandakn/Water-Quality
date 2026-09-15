import React from 'react';
import { getWqiCategory } from '../utils/wqi';
import { ParameterScore } from '../types';
import { Info, HelpCircle } from 'lucide-react';

interface WqiGaugeProps {
  score: number;
  category: string;
  parameterScores?: ParameterScore[];
  onOpenMethodology?: () => void;
}

export const WqiGauge: React.FC<WqiGaugeProps> = ({
  score,
  category,
  parameterScores = [],
  onOpenMethodology,
}) => {
  const details = getWqiCategory(score);
  
  // SVG Gauge calculations
  // Radius: 90, Circumference: 2 * Math.PI * 90 = 565.48
  // Arc angle: 260 degrees (0.722 of full circle)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-6 shadow-xl flex flex-col items-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none -top-10"
        style={{ backgroundColor: details.color }}
      />

      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Composite WQI Index</h3>
          <p className="text-xs text-slate-400">Weighted Arithmetic Methodology</p>
        </div>
        {onOpenMethodology && (
          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/25 transition-all"
            title="View mathematical formulation"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Formula</span>
          </button>
        )}
      </div>

      {/* Large Circular Gauge */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(30, 41, 59, 0.6)"
            strokeWidth="14"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Active Animated Score Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={details.color}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${details.color}66)` }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span 
              className="text-5xl font-black font-['Outfit'] tracking-tight transition-all duration-500"
              style={{ color: details.color }}
            >
              {Math.round(score)}
            </span>
            <span className="text-sm font-semibold text-slate-400 ml-1">/ 100</span>
          </div>
          
          <span 
            className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm"
            style={{ 
              backgroundColor: `${details.color}15`, 
              color: details.color,
              borderColor: `${details.color}40`
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Interpretation */}
      <p className="text-xs text-center text-slate-300 max-w-xs mt-1 leading-relaxed">
        {details.description}
      </p>

      {/* Parameter Weights Breakdown Mini-List */}
      {parameterScores.length > 0 && (
        <div className="w-full mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Sub-Index Contributions (q_i)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {parameterScores.map((ps) => (
              <div key={ps.parameter} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 truncate max-w-[100px]">{ps.parameter}</span>
                  <span className="font-semibold text-slate-200">{ps.sub_index_q}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${ps.sub_index_q}%`,
                      backgroundColor: ps.sub_index_q >= 80 ? '#10b981' : (ps.sub_index_q >= 60 ? '#06b6d4' : (ps.sub_index_q >= 40 ? '#f59e0b' : '#ef4444'))
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
