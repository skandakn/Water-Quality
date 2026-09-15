import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Waves, Eye, Sparkles, ShieldCheck, ArrowRight, Activity, 
  Layers, MapPin, Database, Cpu, TrendingUp, AlertTriangle, 
  Compass, ChevronRight, CheckCircle2 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 pointer-events-none water-bg-mesh opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Hackathon Problem Statement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>PS 4.2: Lake Water Quality Index Monitor & Trend Analyzer</span>
        </div>

        {/* Main Title & Brand Identity */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-['Outfit']">
          JAAL <span className="gradient-text">DRUSHTI</span>
        </h1>
        <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-cyan-400 mt-2 font-mono">
          AI-Powered Lake Water Intelligence
        </p>

        {/* Tagline */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-300 mt-4">
          <span className="text-cyan-400">SEE.</span>
          <span>ANALYZE.</span>
          <span className="text-cyan-400">PREDICT.</span>
          <span>PROTECT.</span>
        </div>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
          "Transforming water monitoring from observation to prediction."
          Autonomous multi-temporal satellite water-mask segmentation combined with 
          in-situ physicochemical telemetry, standardized WQI computation, and machine learning 7-day deterioration early warnings.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>Explore Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2"
          >
            <span>How It Works</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </a>
        </div>

        {/* Hero Interactive Water Visualization Simulation Box */}
        <div className="mt-16 max-w-5xl mx-auto relative rounded-3xl overflow-hidden glass-panel-glow p-2 sm:p-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#070d1a] border border-cyan-500/20 aspect-[16/9] flex items-center justify-center">
            {/* SVG Interactive Map & Wave Simulation */}
            <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="heroWater" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
                </linearGradient>
                <pattern id="heroGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="450" fill="#060b14" />
              <rect width="800" height="450" fill="url(#heroGrid)" />

              {/* Water Extent Contour */}
              <path
                d="M 220 180 Q 320 120 480 160 T 640 240 Q 610 350 480 340 T 260 320 Q 180 260 220 180 Z"
                fill="url(#heroWater)"
                filter="drop-shadow(0 0 25px rgba(6,182,212,0.4))"
              />

              {/* Dynamic Telemetry Pins */}
              <g className="animate-pulse">
                <circle cx="360" cy="220" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <circle cx="480" cy="240" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx="560" cy="270" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </g>

              {/* Digital Grid HUD overlay */}
              <text x="30" y="40" fill="#06b6d4" fontSize="12" fontFamily="monospace">JAAL DRUSHTI // SATELLITE WATER INTEL</text>
              <text x="30" y="60" fill="#64748b" fontSize="11" fontFamily="monospace">LIVE EXTENT: 46.96% | SURFACE: 10.993 km²</text>
              <text x="30" y="80" fill="#10b981" fontSize="11" fontFamily="monospace">TELEMETRY: VALIDATED SENSOR FEED</text>
            </svg>

            {/* Floating Live Telemetry Cards */}
            <div className="absolute top-4 right-4 bg-[#070d1a]/85 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 text-left text-xs hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Lake Health</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-cyan-300 font-['Outfit']">72 / 100</span>
                <span className="text-emerald-400 font-bold text-xs">GOOD</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Pavna Basin Station Alpha</p>
            </div>

            <div className="absolute bottom-4 left-4 bg-[#070d1a]/85 backdrop-blur-md p-3 rounded-xl border border-amber-500/30 text-left text-xs hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Early Warning Flag
              </span>
              <p className="text-white font-bold text-xs mt-1">Turbidity Spike Anticipated</p>
              <p className="text-[10px] text-slate-300 mt-0.5 font-mono">7-Day Projected WQI: 64</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Questions / Workflow Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
            System Architecture & Vision
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-['Outfit']">
            Four Critical Environmental Questions Answered
          </p>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-3">
            An end-to-end data pipeline from orbital remote sensing to edge in-situ analytics and predictive decision support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-6 shadow-xl relative group hover:border-cyan-500/40 transition-all">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 w-fit mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Question 1</span>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1 mb-2">WHERE IS THE WATER?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optical satellite water-mask segmentation (NDWI) tracks surface water extent, boundary changes, and total surface area in km².
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-6 shadow-xl relative group hover:border-cyan-500/40 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 w-fit mb-4">
              <Waves className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Question 2</span>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1 mb-2">HOW HEALTHY IS THE WATER?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous monitoring of pH, Turbidity, Dissolved Oxygen, TDS, and Temperature evaluated via the Weighted Arithmetic WQI engine.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-6 shadow-xl relative group hover:border-cyan-500/40 transition-all">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 w-fit mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">Question 3</span>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1 mb-2">IMPROVING OR DETERIORATING?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical multi-temporal trend analysis across 7d, 30d, 90d, and 6 months detecting subtle baseline shifts and seasonal cycles.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-6 shadow-xl relative group hover:border-cyan-500/40 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Question 4</span>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1 mb-2">WHAT HAPPENS NEXT?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Machine Learning short-term regression forecasting (Random Forest) projecting future WQI, risk classifications, and recommended actions.
            </p>
          </div>
        </div>
      </section>

      {/* Key System Features */}
      <section className="py-20 border-t border-slate-800/80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">Platform Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white font-['Outfit']">
              Engineered for Real-World Environmental Intelligence
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed as a robust full-stack solution ready for State Lake Conservation Authorities, municipal urban planners, and environmental researchers.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Standardized WQI Engine</span>
              </div>
              <p className="text-xs text-slate-400">
                Implements Weighted Arithmetic Index (WAWQI) with transparent parameter sub-index contributions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Early-Warning Alert Triggers</span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous risk detection for WQI deterioration, turbidity runoff surges, and lethal dissolved oxygen drops.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>CSV Upload & Validation Engine</span>
              </div>
              <p className="text-xs text-slate-400">
                Rigorous row-by-row data audit flagging missing, suspicious, or out-of-physical-range telemetry before ingestion.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Executive Dossier Reports</span>
              </div>
              <p className="text-xs text-slate-400">
                One-click comprehensive lake intelligence reports with regulatory recommendations and printable exports.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
