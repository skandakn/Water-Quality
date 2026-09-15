import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLakes } from '../services/api';
import { LakeCardSummary } from '../types';
import { LakeMap } from '../components/LakeMap';
import { 
  Search, Filter, MapPin, Eye, Activity, ShieldCheck, 
  ArrowRight, RefreshCw, Loader2, Sparkles, SlidersHorizontal 
} from 'lucide-react';

export const LakesPage: React.FC = () => {
  const navigate = useNavigate();
  const [lakes, setLakes] = useState<LakeCardSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const loadLakes = async () => {
    setLoading(true);
    try {
      const data = await fetchLakes();
      setLakes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLakes();
  }, []);

  const filteredLakes = lakes.filter((lake) => {
    const matchesSearch = 
      lake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lake.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'ALL' || lake.monitoring_status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleSelectLake = (id: number) => {
    navigate(`/dashboard?lake=${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
            Lake Monitoring Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally supervised freshwater reservoirs and wetlands across regional river basins
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Catalog Grid
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'map'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive Map
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search lakes by name or regional basin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="STABLE">Stable (Healthy)</option>
            <option value="MODERATE">Moderate (Watchlist)</option>
            <option value="CRITICAL">Critical (Degraded)</option>
          </select>
        </div>
      </div>

      {/* View: Map View */}
      {viewMode === 'map' && (
        <LakeMap 
          lakes={filteredLakes} 
          onSelectLake={handleSelectLake} 
        />
      )}

      {/* View: Grid View */}
      {viewMode === 'grid' && (
        <>
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading catalog...</p>
            </div>
          ) : filteredLakes.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <p className="text-sm font-semibold text-slate-300">No lakes matched your criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or filter constraints.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLakes.map((lake) => {
                const isCritical = lake.monitoring_status === 'CRITICAL';
                const isModerate = lake.monitoring_status === 'MODERATE';
                const statusColor = isCritical ? '#ef4444' : (isModerate ? '#f59e0b' : '#10b981');

                return (
                  <div
                    key={lake.id}
                    onClick={() => handleSelectLake(lake.id)}
                    className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/15 p-5 shadow-xl hover:border-cyan-500/40 hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {/* Top Status Accent */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-[2px]" 
                      style={{ backgroundColor: statusColor }}
                    />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-white font-['Outfit'] group-hover:text-cyan-300 transition-colors">
                          {lake.name}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{lake.location}</span>
                        </p>
                      </div>

                      <span 
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
                        style={{ 
                          backgroundColor: `${statusColor}15`, 
                          color: statusColor,
                          borderColor: `${statusColor}35`
                        }}
                      >
                        {lake.monitoring_status}
                      </span>
                    </div>

                    {/* Key Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 my-3 text-center">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">WQI</p>
                        <p className="text-base font-black text-white font-mono mt-0.5" style={{ color: statusColor }}>
                          {Math.round(lake.current_wqi)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Coverage</p>
                        <p className="text-base font-black text-cyan-300 font-mono mt-0.5">
                          {lake.water_coverage_percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-500">Basin</p>
                        <p className="text-base font-black text-slate-300 font-mono mt-0.5">
                          {lake.area_km2}k
                        </p>
                      </div>
                    </div>

                    {/* Risk & Last Updated */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <div>
                        <span>Risk: </span>
                        <strong className="text-slate-200">{lake.risk_level}</strong>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>Dashboard</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
