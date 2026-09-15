import React from 'react';
import { Sparkles, TrendingDown, CheckCircle2, TrendingUp } from 'lucide-react';

interface DemoModeToggleProps {
  currentLakeId: number;
  onSelectLake: (id: number) => void;
}

export const DemoModeToggle: React.FC<DemoModeToggleProps> = ({
  currentLakeId,
  onSelectLake,
}) => {
  const demoScenarios = [
    {
      id: 1,
      name: 'Lake Pavna',
      label: 'Deteriorating Scenario',
      tag: 'Main Demo',
      wqi: '72 → 64',
      risk: 'Moderate Risk',
      color: '#f59e0b',
      icon: TrendingDown,
    },
    {
      id: 2,
      name: 'Lake Vembanad',
      label: 'Stable Scenario',
      tag: 'Equilibrium',
      wqi: '~80.5',
      risk: 'Stable',
      color: '#06b6d4',
      icon: CheckCircle2,
    },
    {
      id: 3,
      name: 'Dal Lake',
      label: 'Improving Scenario',
      tag: 'Restoration',
      wqi: '60 → 76',
      risk: 'Improving',
      color: '#10b981',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0b1426]/95 to-slate-900/90 border border-cyan-500/25 p-4 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Hackathon Evaluation Mode
            </h4>
            <p className="text-[11px] text-slate-400">
              Switch between seeded real-world scenario states to inspect autonomous alert & forecast mechanics
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>DEMO DATA — Seeded Historical Database</span>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {demoScenarios.map((scenario) => {
          const isSelected = currentLakeId === scenario.id;
          const Icon = scenario.icon;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectLake(scenario.id)}
              className={`p-3 rounded-xl text-left border transition-all duration-200 flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/20 scale-[1.01]'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-['Outfit']">{scenario.name}</span>
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                    style={{ 
                      backgroundColor: `${scenario.color}15`, 
                      color: scenario.color,
                      borderColor: `${scenario.color}35`
                    }}
                  >
                    {scenario.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{scenario.label}</p>
                <p className="text-[11px] font-mono font-semibold" style={{ color: scenario.color }}>
                  WQI: {scenario.wqi}
                </p>
              </div>

              <div 
                className={`p-2 rounded-lg shrink-0 border ${
                  isSelected ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-slate-800 border-slate-700'
                }`}
                style={{ color: scenario.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
