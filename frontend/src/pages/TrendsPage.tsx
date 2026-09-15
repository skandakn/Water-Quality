import React, { useState, useEffect } from 'react';
import { fetchTrends, fetchLakes } from '../services/api';
import { TrendSummary, LakeCardSummary } from '../types';
import { TrendChart } from '../components/TrendChart';
import { TrendingUp, Calendar, Sliders, ChevronDown, Loader2, FileDown } from 'lucide-react';

export const TrendsPage: React.FC = () => {
  const [selectedLakeId, setSelectedLakeId] = useState<number>(1);
  const [lakes, setLakes] = useState<LakeCardSummary[]>([]);
  const [trendData, setTrendData] = useState<TrendSummary | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLakes().then(setLakes).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTrends(selectedLakeId, selectedDays)
      .then(setTrendData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedLakeId, selectedDays]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
            Temporal Trend Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Examine multi-scale environmental dynamics and historical parameter correlations
          </p>
        </div>

        {/* Lake Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="trend-lake-select" className="text-xs text-slate-400">Lake Basin:</label>
          <div className="relative">
            <select
              id="trend-lake-select"
              value={selectedLakeId}
              onChange={(e) => setSelectedLakeId(Number(e.target.value))}
              className="appearance-none bg-slate-900 border border-cyan-500/30 text-white text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {lakes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.monitoring_status})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Chart */}
      {loading || !trendData ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Aggregating time-series series...</p>
        </div>
      ) : (
        <>
          <TrendChart
            trendData={trendData}
            selectedDays={selectedDays}
            onTimeframeChange={setSelectedDays}
          />

          {/* Detailed Observations Data Table */}
          <div className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Logged Telemetry Records ({trendData.series.length} Observations)
              </h3>
              <button
                onClick={() => {
                  const csv = "Date,WQI,pH,Turbidity(NTU),DO(mg/L),TDS(mg/L),Temp(C)\n" +
                    trendData.series.map(s => `${s.date},${s.wqi},${s.ph},${s.turbidity},${s.dissolved_oxygen},${s.tds},${s.temperature}`).join("\n");
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Telemetry_Series_Lake_${selectedLakeId}_${selectedDays}d.csv`;
                  a.click();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 hover:bg-slate-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-700 bg-slate-900/50 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">WQI Score</th>
                    <th className="py-2.5 px-3">pH</th>
                    <th className="py-2.5 px-3">Turbidity (NTU)</th>
                    <th className="py-2.5 px-3">DO (mg/L)</th>
                    <th className="py-2.5 px-3">TDS (mg/L)</th>
                    <th className="py-2.5 px-3">Temp (°C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {trendData.series.slice(-10).reverse().map((row) => (
                    <tr key={row.date} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{row.date}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-400">{row.wqi}</td>
                      <td className="py-2.5 px-3">{row.ph}</td>
                      <td className="py-2.5 px-3">{row.turbidity}</td>
                      <td className="py-2.5 px-3">{row.dissolved_oxygen}</td>
                      <td className="py-2.5 px-3">{row.tds}</td>
                      <td className="py-2.5 px-3">{row.temperature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-right">Showing latest 10 rows of {trendData.series.length} data points</p>
          </div>
        </>
      )}
    </div>
  );
};
