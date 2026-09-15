import React from 'react';
import { Waves, ShieldAlert, Sparkles, Database, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#040711] text-slate-400 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Waves className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight font-['Outfit']">
                JAAL DRUSHTI
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                PS 4.2
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-lg">
              Centralized AI Lake Water Intelligence Platform. Monitoring lake surface extent via satellite imagery, 
              evaluating physicochemical quality indices (WQI), predicting water degradation horizons, and triggering 
              early-warning ecological alerts.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-medium pt-1">
              <span>Tagline:</span>
              <span className="text-white font-semibold">SEE. ANALYZE. PREDICT. PROTECT.</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Platform Modules</h4>
            <ul className="space-y-1.5">
              <li><Link to="/dashboard" className="hover:text-cyan-300 transition-colors">Command Center Dashboard</Link></li>
              <li><Link to="/lakes" className="hover:text-cyan-300 transition-colors">Lakes Registry & Map</Link></li>
              <li><Link to="/trends" className="hover:text-cyan-300 transition-colors">Historical Trend Analyzer</Link></li>
              <li><Link to="/predictions" className="hover:text-cyan-300 transition-colors">AI Forecasting Engine</Link></li>
              <li><Link to="/data-management" className="hover:text-cyan-300 transition-colors">CSV Data Ingestion & Quality Audit</Link></li>
            </ul>
          </div>

          {/* Col 3: Scientific Methodology */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Scientific Reference</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Methodology: <span className="text-slate-300">Weighted Arithmetic WQI</span></li>
              <li>Standards: <span className="text-slate-300">CPCB Class C / WHO Guidelines</span></li>
              <li>Model: <span className="text-slate-300">Random Forest Time-Series (RF-TS)</span></li>
              <li>Spatial: <span className="text-slate-300">Optical NDWI Water Extent</span></li>
              <li><Link to="/about" className="text-cyan-400 hover:underline inline-flex items-center gap-1">Read Methodology Whitepaper <ExternalLink className="w-3 h-3" /></Link></li>
            </ul>
          </div>
        </div>

        {/* Scientific Honesty Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-slate-400 mb-8">
          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-slate-200">Scientific Transparency Note: </strong>
            Satellite optical segmentation measures lake surface area and extent variation. Physicochemical parameters 
            (pH, Turbidity, DO, TDS, Temperature) are derived from in-situ telemetry stations and validated field datasets. 
            All synthetic records displayed are labeled <span className="text-cyan-300 font-medium">"Demo / Simulated Data"</span> for hackathon demonstration.
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <p>© 2026 Jaal Drushti. Developed for National Environmental Intelligence Hackathon.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300">Methodology</Link>
            <span>•</span>
            <Link to="/data-management" className="hover:text-slate-300">Admin Portal</Link>
            <span>•</span>
            <a href="https://github.com/skandakn/Water-Quality" target="_blank" rel="noreferrer" className="hover:text-cyan-300 inline-flex items-center gap-1">
              GitHub Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
