import React, { useState, useEffect } from 'react';
import { fetchLakeReport, fetchLakes } from '../services/api';
import { LakeCardSummary } from '../types';
import { 
  FileText, Download, Printer, ShieldCheck, 
  Sparkles, Calendar, Droplets, Activity, AlertTriangle, ChevronDown 
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [selectedLakeId, setSelectedLakeId] = useState<number>(1);
  const [lakes, setLakes] = useState<LakeCardSummary[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLakes().then(setLakes).catch(console.error);
  }, []);

  const generateReport = async (lakeId: number) => {
    setLoading(true);
    try {
      const data = await fetchLakeReport(lakeId);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport(selectedLakeId);
  }, [selectedLakeId]);

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_id}.json`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
            Executive Lake Intelligence Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated environmental compliance report compiled from telemetry, satellite extent, and ML projections
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Formatted Report Preview Document */}
      {report && (
        <div className="rounded-2xl bg-[#09101f] border border-cyan-500/25 p-8 shadow-2xl text-slate-200 space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          {/* Top Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white font-['Outfit'] print:text-black">
                  JAAL DRUSHTI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 print:border-gray-400 print:text-black">
                  OFFICIAL DOSSIER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
                Centralized Lake Health & Risk Prognosis Report
              </p>
            </div>
            <div className="text-left sm:text-right text-xs font-mono text-slate-400 print:text-gray-600">
              <p>Report ID: <strong className="text-cyan-300 print:text-black">{report.report_id}</strong></p>
              <p>Generated: {new Date(report.generated_at).toLocaleString()}</p>
            </div>
          </div>

          {/* 1. Lake Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono print:text-blue-800">
              1. Basin Geography & Boundary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Lake Name</p>
                <p className="font-bold text-white print:text-black mt-0.5">{report.lake_overview?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Location</p>
                <p className="font-semibold text-slate-200 print:text-black mt-0.5">{report.lake_overview?.location}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Total Basin Area</p>
                <p className="font-semibold text-slate-200 print:text-black mt-0.5">{report.lake_overview?.total_basin_area_km2 || report.lake_overview?.area_km2} km²</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Coordinates</p>
                <p className="font-mono text-slate-300 print:text-black mt-0.5">
                  {report.lake_overview?.coordinates ? `${report.lake_overview.coordinates.latitude}°N, ${report.lake_overview.coordinates.longitude}°E` : `${report.lake_overview?.latitude}°N, ${report.lake_overview?.longitude}°E`}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Satellite Surface Water Extent */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono print:text-blue-800">
              2. Satellite Optical Extent & Water Mask
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400">Water Coverage</p>
                  <p className="text-lg font-bold text-cyan-300 print:text-black">{report.satellite_intelligence?.water_coverage_percentage}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Estimated Water Area</p>
                  <p className="text-lg font-bold text-cyan-300 print:text-black">{report.satellite_intelligence?.estimated_water_area_km2} km²</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Sensor Source</p>
                  <p className="font-semibold text-slate-200 print:text-black">{report.satellite_intelligence?.sensor_source || 'Sentinel-2 Optical'}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 italic pt-1 print:text-gray-700">
                "{report.satellite_intelligence?.ai_interpretation || 'Water extent detected across nominal parameters.'}"
              </p>
            </div>
          </div>

          {/* 3. Physicochemical Telemetry Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono print:text-blue-800">
              3. Physicochemical Water Quality Telemetry
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800 print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="py-2 px-3">Parameter</th>
                    <th className="py-2 px-3">Measured Value</th>
                    <th className="py-2 px-3">Standard Limit</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200 print:divide-gray-300 print:text-black font-mono">
                  {report.physicochemical_readings?.map((p: any) => (
                    <tr key={p.parameter}>
                      <td className="py-2 px-3 font-semibold font-sans">{p.parameter}</td>
                      <td className="py-2 px-3">{p.value} {p.unit}</td>
                      <td className="py-2 px-3 text-slate-400">CPCB Class C standard</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'GOOD' || p.status === 'NORMAL' 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. AI Prediction & 7-Day Risk */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono print:text-blue-800">
              4. Machine Learning 7-Day Prognosis
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400">Current WQI: </span>
                  <strong className="text-white print:text-black">{report.ai_predictive_forecast?.current_wqi}</strong>
                  <span className="mx-2">→</span>
                  <span className="text-slate-400">Predicted 7-Day WQI: </span>
                  <strong className="text-amber-400 font-bold">{report.ai_predictive_forecast?.predicted_7d_wqi}</strong>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {report.ai_predictive_forecast?.risk_assessment || 'MODERATE RISK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed print:text-gray-700">
                {report.ai_predictive_forecast?.expert_explanation}
              </p>
            </div>
          </div>

          {/* 5. Recommended Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono print:text-blue-800">
              5. Actionable Regulatory Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 print:text-gray-800">
              {report.regulatory_recommendations?.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Sign-off / Verification stamp */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex items-center justify-between text-[11px] text-slate-500">
            <span>Jaal Drushti Autonomous Environmental Intelligence Engine</span>
            <span>Verified System Stamp: #JD-AUTH-2026</span>
          </div>
        </div>
      )}
    </div>
  );
};
