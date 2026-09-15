import React, { useState } from 'react';
import { SatelliteObservation } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Layers, ShieldCheck, Sparkles, Calendar, Maximize2 } from 'lucide-react';

interface SatelliteViewerProps {
  observation: SatelliteObservation;
  lakeName: string;
  aiAnalysisText: string;
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({
  observation,
  lakeName,
  aiAnalysisText,
}) => {
  const [activeTab, setActiveTab] = useState<'satellite' | 'mask' | 'overlay'>('overlay');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoomLevel(1);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Satellite Water Extent Monitor
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Sentinel-2 L2A
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Optical water surface segmentation & surface area estimation
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'satellite'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite RGB
          </button>
          <button
            onClick={() => setActiveTab('mask')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'mask'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Water Mask (NDWI)
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overlay'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Overlay
          </button>
        </div>
      </div>

      {/* Interactive Visual Canvas Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        {/* Render Layer Graphic */}
        <div 
          className="w-full h-full relative transition-transform duration-300 ease-out flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Simulated High-Resolution Satellite Scene Representation */}
          <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* Natural Satellite Texture Gradient */}
              <radialGradient id="terrainGrad" cx="40%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#1a2634" />
                <stop offset="50%" stopColor="#141e2b" />
                <stop offset="100%" stopColor="#0d141e" />
              </radialGradient>
              {/* Lake Water Surface Gradient */}
              <linearGradient id="lakeWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>
              {/* Water Mask High Contrast Cyan Gradient */}
              <linearGradient id="maskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="100%" stopColor="#4facfe" />
              </linearGradient>
              {/* Grid pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Background Terrain */}
            <rect width="600" height="400" fill={activeTab === 'mask' ? '#000000' : 'url(#terrainGrad)'} />
            <rect width="600" height="400" fill="url(#grid)" />

            {/* Lake Water Body Geometry */}
            <path
              d="M 160 140 
                 C 210 110, 310 100, 390 130 
                 C 460 155, 490 220, 450 270 
                 C 420 310, 340 330, 270 310 
                 C 200 290, 130 320, 110 260 
                 C 95 210, 120 165, 160 140 Z"
              fill={activeTab === 'mask' ? 'url(#maskGrad)' : (activeTab === 'satellite' ? 'url(#lakeWaterGrad)' : 'url(#lakeWaterGrad)')}
              filter={activeTab === 'mask' ? 'drop-shadow(0 0 15px rgba(6,182,212,0.8))' : 'none'}
              className="transition-all duration-500"
            />

            {/* Additional Inflow Channel */}
            <path
              d="M 390 130 Q 430 80, 480 50 Q 490 60, 450 90 Q 420 120, 390 130 Z"
              fill={activeTab === 'mask' ? 'url(#maskGrad)' : 'url(#lakeWaterGrad)'}
            />

            {/* AI Overlay Layer Elements */}
            {activeTab === 'overlay' && (
              <g className="animate-pulse">
                {/* Segmentation Contour Polygon */}
                <path
                  d="M 158 138 
                     C 208 108, 312 98, 392 128 
                     C 462 153, 492 218, 452 268 
                     C 422 308, 342 328, 272 308 
                     C 198 288, 128 318, 108 258 
                     C 93 208, 118 163, 158 138 Z"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                {/* AI Detection Hotspots & Depth Sensors */}
                <circle cx="280" cy="220" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <text x="290" y="225" fill="#10b981" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Station Alpha</text>
                
                <circle cx="390" cy="240" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <text x="400" y="245" fill="#f59e0b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Turbidity Plume</text>

                <circle cx="160" cy="210" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="170" y="215" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Inflow Delta</text>
              </g>
            )}

            {/* HUD Coordinates Overlay */}
            <text x="15" y="25" fill="rgba(6,182,212,0.6)" fontSize="10" fontFamily="monospace">LAT: 18°41'00"N | LON: 73°29'00"E</text>
            <text x="15" y="40" fill="rgba(6,182,212,0.6)" fontSize="10" fontFamily="monospace">BAND: B03, B08 (NDWI Normalized)</text>
          </svg>
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Overlay Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-[#070d1a]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-slate-300">Coverage:</span>
            <strong className="text-cyan-300 font-mono">{observation.water_coverage_percentage}%</strong>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Est. Surface Area:</span>
            <strong className="text-cyan-300 font-mono">{observation.estimated_water_area_km2} km²</strong>
          </div>

          <div className="bg-[#070d1a]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">{observation.water_detection_status}</span>
          </div>
        </div>
      </div>

      {/* AI Satellite Analysis Dynamic Narrative */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/50 to-slate-900/60 border border-cyan-500/25 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">AI Extent Intelligence</h4>
            <span className="text-[10px] text-slate-500 font-mono">Autonomous Segmentation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {aiAnalysisText}
          </p>
        </div>
      </div>
    </div>
  );
};
