import React, { useState } from 'react';
import { DashboardParameter } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle, Activity } from 'lucide-react';

interface ParameterCardProps {
  param: DashboardParameter;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({ param }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/15 p-4 shadow-lg hover:border-cyan-500/35 transition-all duration-300 group">
      {/* Parameter Header & Tooltip */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {param.name}
        </span>
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
          aria-label={`About ${param.name}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Tooltip Bubble */}
      {showTooltip && (
        <div className="absolute z-20 top-10 right-2 w-64 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-[11px] text-slate-200 leading-relaxed animate-in fade-in zoom-in-95 duration-150">
          <p className="font-semibold text-cyan-300 mb-1">{param.name} Significance</p>
          <p>{param.tooltip}</p>
        </div>
      )}

      {/* Value & Unit */}
      <div className="flex items-baseline gap-1.5 my-2">
        <span 
          className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight"
          style={{ color: param.color }}
        >
          {param.value}
        </span>
        {param.unit && (
          <span className="text-xs font-semibold text-slate-400">{param.unit}</span>
        )}
      </div>

      {/* Status & Mini Trend Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-3 text-xs">
        {/* Status Pill */}
        <span 
          className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
          style={{ 
            backgroundColor: `${param.color}15`, 
            color: param.color,
            borderColor: `${param.color}35`
          }}
        >
          {param.status}
        </span>

        {/* Mini Trend Indicator */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          {param.mini_trend === 'up' && (
            <span className="flex items-center text-amber-400 font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              {param.change_pct > 0 ? `+${param.change_pct}%` : `${param.change_pct}%`}
            </span>
          )}
          {param.mini_trend === 'down' && (
            <span className="flex items-center text-cyan-400 font-semibold">
              <ArrowDownRight className="w-3 h-3" />
              {param.change_pct}%
            </span>
          )}
          {param.mini_trend === 'stable' && (
            <span className="flex items-center text-slate-400">
              <Minus className="w-3 h-3" />
              Stable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
