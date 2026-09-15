import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
    isPositive?: boolean;
  };
  statusBadge?: {
    text: string;
    color: string;
    bg: string;
  };
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subValue,
  icon: Icon,
  trend,
  statusBadge,
  accentColor = '#06b6d4',
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/15 p-5 shadow-lg shadow-black/40 hover:border-cyan-500/35 transition-all duration-300 group">
      {/* Top Accent Gradient Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-cyan-300">{unit}</span>}
          </div>
          {subValue && <p className="text-[11px] text-slate-400 mt-0.5">{subValue}</p>}
        </div>

        <div 
          className="p-3 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{ 
            backgroundColor: `${accentColor}15`, 
            borderColor: `${accentColor}30`,
            color: accentColor 
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom Row: Trend or Status */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {trend && (
          <div className="flex items-center gap-1.5">
            <span 
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                trend.isPositive 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trend.direction === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trend.direction === 'down' && <ArrowDownRight className="w-3 h-3" />}
              {trend.direction === 'stable' && <Minus className="w-3 h-3" />}
              {trend.value}
            </span>
            <span className="text-slate-500 text-[10px]">vs previous period</span>
          </div>
        )}

        {statusBadge && (
          <span 
            className="px-2.5 py-0.5 rounded-md text-[11px] font-bold border ml-auto"
            style={{ 
              backgroundColor: statusBadge.bg, 
              color: statusBadge.color,
              borderColor: `${statusBadge.color}40`
            }}
          >
            {statusBadge.text}
          </span>
        )}
      </div>
    </div>
  );
};
