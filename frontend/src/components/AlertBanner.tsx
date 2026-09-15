import React from 'react';
import { AlertItem } from '../types';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  alerts: AlertItem[];
  onAcknowledge?: (id: number) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onAcknowledge }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0b1426]/90 to-[#070d1a]/95 border border-emerald-500/20 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">All Parameters Nominal</h4>
            <p className="text-xs text-slate-400">No critical deterioration alerts currently active for this water body.</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400/80 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
          SURVEILLANCE PASS
        </span>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          border: 'border-rose-500/40',
          bg: 'from-rose-950/40 via-slate-900/60 to-slate-900/80',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          iconColor: 'text-rose-400',
        };
      case 'HIGH':
        return {
          border: 'border-orange-500/40',
          bg: 'from-orange-950/30 via-slate-900/60 to-slate-900/80',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          iconColor: 'text-orange-400',
        };
      case 'MODERATE':
      default:
        return {
          border: 'border-amber-500/35',
          bg: 'from-amber-950/30 via-slate-900/60 to-slate-900/80',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          iconColor: 'text-amber-400',
        };
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const style = getSeverityStyle(alert.severity);
        return (
          <div
            key={alert.id}
            className={`rounded-2xl bg-gradient-to-r ${style.bg} border ${style.border} p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 ${style.iconColor} shrink-0 mt-0.5`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${style.badge}`}>
                    {alert.severity} RISK
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    [{alert.alert_type}]
                  </span>
                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                    {alert.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {alert.message}
                </p>
                <div className="pt-1 text-xs text-amber-300/90 flex items-start gap-1.5 font-medium">
                  <span className="font-bold text-amber-400 shrink-0">Action Required:</span>
                  <span>{alert.recommended_action}</span>
                </div>
              </div>
            </div>

            {onAcknowledge && alert.status === 'ACTIVE' && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Acknowledge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
