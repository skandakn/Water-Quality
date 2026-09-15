import React from 'react';
import { 
  Waves, Eye, Sparkles, Scale, Database, Cpu, 
  ShieldCheck, AlertTriangle, BookOpen, Layers, CheckCircle2 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="text-center space-y-3 pb-8 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <Waves className="w-3.5 h-3.5" />
          <span>PS 4.2 Whitepaper & System Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
          JAAL <span className="gradient-text">DRUSHTI</span>
        </h1>
        <p className="text-xs sm:text-sm text-cyan-400 font-mono uppercase tracking-widest font-bold">
          AI-Powered Lake Water Intelligence — Architecture & Methodology
        </p>
        <p className="text-xs text-slate-400 max-w-xl mx-auto italic">
          "Prototype developed for hackathon demonstration."
        </p>
      </div>

      {/* 1. What is Jaal Drushti & Why It Matters */}
      <section className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>1. Motivation & Ecological Urgency</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Freshwater lakes sustain regional biodiversity, agricultural catchment irrigation, and municipal drinking water supply. 
          However, rapid urbanization and catchment erosion lead to undetected industrial discharge, sewage ingress, and toxic cyanobacteria blooms. 
          Traditional environmental monitoring relies on manual grab sampling analyzed weeks later in distant laboratories—often after fish mortality 
          or eutrophication has already caused irreversible damage.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Jaal Drushti</strong> shifts environmental management from <em>reactive remediation</em> to <em>predictive prevention</em> 
          by fusing multi-temporal satellite surface water extent segmentation with in-situ sensor telemetry and automated machine learning forecasts.
        </p>
      </section>

      {/* 2. Scientific Separation of Extent vs Physicochemistry */}
      <section className="rounded-2xl bg-gradient-to-r from-cyan-950/30 via-[#0b1426]/90 to-slate-900/90 border border-cyan-500/25 p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-cyan-300 font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>2. Scientific Transparency & Remote Sensing Reality</span>
        </h2>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
          <p className="leading-relaxed">
            <strong className="text-white">Clear Separation of Capabilities: </strong>
            In adherence to strict scientific honesty, Jaal Drushti does NOT claim that ordinary optical satellite imagery 
            can directly measure subsurface pH, total dissolved solids, or dissolved oxygen.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pt-1">
            <li><strong>Satellite Optical Imagery (Sentinel-2 / NDWI): </strong>Measures surface water extent, boundary changes, shallow silt turbidity plumes, and surface area in km².</li>
            <li><strong>Physicochemical Parameters (pH, DO, TDS, Temp, Turbidity): </strong>Derived from in-situ telemetry sensor stations, authorized field laboratories, and validated CSV uploads.</li>
          </ul>
        </div>
      </section>

      {/* 3. WQI Mathematical Engine */}
      <section className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>3. Standardized WQI Engine Formulation</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The core WQI engine utilizes the <strong>Weighted Arithmetic Water Quality Index (WAWQI)</strong> methodology:
        </p>
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/25 font-mono text-cyan-300 text-center text-sm">
          WQI = ∑ ( q<sub>i</sub> × W<sub>i</sub> ) / ∑ W<sub>i</sub>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="font-bold text-white mb-1">Sub-Index (q<sub>i</sub>)</p>
            <p className="text-slate-400">
              Normalized score between 0 and 100 representing parameter quality relative to desirable ideal and standard permissible thresholds.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="font-bold text-white mb-1">Relative Weights (W<sub>i</sub>)</p>
            <p className="text-slate-400">
              Dissolved Oxygen (0.30), pH (0.25), Turbidity (0.15), Total Dissolved Solids (0.15), Temperature (0.15).
            </p>
          </div>
        </div>
      </section>

      {/* 4. Machine Learning Forecasting Architecture */}
      <section className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>4. AI/ML Forecasting Architecture</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          A dedicated Random Forest Regressor trained on lag-1, lag-3, and lag-7 temporal features combined with in-situ stress indicators 
          (turbidity surge spikes and dissolved oxygen depletion rates). The model outputs:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-400 text-[10px]">Horizon</p>
            <p className="text-cyan-300 font-bold mt-0.5">7 Days</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-400 text-[10px]">CV Accuracy</p>
            <p className="text-emerald-400 font-bold mt-0.5">95.4% R²</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-400 text-[10px]">MAE</p>
            <p className="text-cyan-300 font-bold mt-0.5">2.32 pts</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-400 text-[10px]">Latency</p>
            <p className="text-emerald-400 font-bold mt-0.5">&lt; 15 ms</p>
          </div>
        </div>
      </section>

      {/* 5. System Technology Stack */}
      <section className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>5. Technology Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-300">Frontend</p>
            <p className="text-slate-400">React 18, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet, Lucide, Framer Motion.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-300">Backend API</p>
            <p className="text-slate-400">Python 3, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn, Python-Jose JWT.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-300">Database & ML</p>
            <p className="text-slate-400">PostgreSQL (with zero-friction SQLite fallback), Scikit-Learn, Pandas, NumPy.</p>
          </div>
        </div>
      </section>

      {/* 6. Limitations & Future Scope */}
      <section className="rounded-2xl bg-[#0b1426]/90 border border-cyan-500/20 p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white font-['Outfit'] uppercase tracking-wider">
          6. Future Scope & Production Roadmap
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
          <li>Integration with live Copernicus Sentinel Hub OpenSearch API for automated 5-day orbital imagery refresh.</li>
          <li>Edge IoT integration supporting LoRaWAN and MQTT telemetry protocols directly from solar buoys.</li>
          <li>Hydrodynamic 3D dispersion modeling for chemical effluent plume tracking.</li>
          <li>Native SMS / WhatsApp automated emergency broadcast integration for district water authorities.</li>
        </ul>
      </section>
    </div>
  );
};
