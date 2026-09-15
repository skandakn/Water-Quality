import React from 'react';
import { X, BookOpen, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0b1426] border border-cyan-500/30 p-6 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Water Quality Index (WQI) Methodology
            </h3>
            <p className="text-xs text-cyan-300">
              Weighted Arithmetic Water Quality Index Method (WAWQI)
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[11px]">
              1. Mathematical Aggregation Formulation
            </h4>
            <p className="mb-2">
              The overall WQI is calculated using the standard weighted arithmetic formulation:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-cyan-300 text-center text-sm border border-cyan-500/20 my-2">
              WQI = ∑ ( q<sub>i</sub> × W<sub>i</sub> ) / ∑ W<sub>i</sub>
            </div>
            <p className="text-[11px] text-slate-400">
              Where <strong>q<sub>i</sub></strong> is the quality sub-index score for parameter <em>i</em> (normalized 0–100), 
              and <strong>W<sub>i</sub></strong> is the environmental sensitivity weight.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">
              2. Parameter Standards & Weights
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-slate-700 text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="py-1.5">Parameter</th>
                    <th className="py-1.5">Unit</th>
                    <th className="py-1.5">Ideal</th>
                    <th className="py-1.5">Standard</th>
                    <th className="py-1.5">Weight (W)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="py-1.5 font-semibold text-cyan-300">pH</td>
                    <td>—</td>
                    <td>7.0</td>
                    <td>6.5 – 8.5</td>
                    <td>0.25 (25%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-cyan-300">Dissolved Oxygen</td>
                    <td>mg/L</td>
                    <td>8.5</td>
                    <td>≥ 6.0</td>
                    <td>0.30 (30%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-cyan-300">Turbidity</td>
                    <td>NTU</td>
                    <td>2.0</td>
                    <td>≤ 10.0</td>
                    <td>0.15 (15%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-cyan-300">TDS</td>
                    <td>mg/L</td>
                    <td>150.0</td>
                    <td>≤ 500.0</td>
                    <td>0.15 (15%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-cyan-300">Temperature</td>
                    <td>°C</td>
                    <td>22.0</td>
                    <td>≤ 28.0</td>
                    <td>0.15 (15%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[11px]">
              3. Classification Scale
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-bold mt-2">
              <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <div>90 – 100</div>
                <div>EXCELLENT</div>
              </div>
              <div className="p-2 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <div>70 – 89</div>
                <div>GOOD</div>
              </div>
              <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <div>50 – 69</div>
                <div>MODERATE</div>
              </div>
              <div className="p-2 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300">
                <div>35 – 49</div>
                <div>POOR</div>
              </div>
              <div className="p-2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <div>&lt; 35</div>
                <div>VERY POOR</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/90 leading-relaxed">
            <strong>Regulatory Deployment Note: </strong>
            This software prototype employs a configurable weighted arithmetic index standard. In production deployments, 
            the weights, permissible standard limits, and sub-index equations can be calibrated dynamically to comply with 
            guidelines established by the Central Pollution Control Board (CPCB), State Lake Development Authorities, or the EPA.
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
