import React, { useEffect, useRef } from 'react';
import { LakeCardSummary } from '../types';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LakeMapProps {
  lakes: LakeCardSummary[];
  selectedLakeId?: number;
  onSelectLake?: (id: number) => void;
}

export const LakeMap: React.FC<LakeMapProps> = ({
  lakes,
  selectedLakeId,
  onSelectLake,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only load Leaflet on client side
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to ensure no SSR or build issues
    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Center map around India (20.5937, 78.9629)
      const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      mapInstanceRef.current = map;

      // Dark CartoDB basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom Colored Markers
      lakes.forEach((lake) => {
        const markerColor =
          lake.monitoring_status === 'STABLE'
            ? '#10b981'
            : lake.monitoring_status === 'MODERATE'
            ? '#f59e0b'
            : '#ef4444';

        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: ${markerColor};
              border: 3px solid #0b1426;
              border-radius: 50%;
              box-shadow: 0 0 14px ${markerColor};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([lake.latitude, lake.longitude], { icon: customIcon }).addTo(map);

        const popupHtml = `
          <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 180px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #ffffff; font-size: 13px;">${lake.name}</strong>
              <span style="background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor}40; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                WQI ${Math.round(lake.current_wqi)}
              </span>
            </div>
            <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">${lake.location}</p>
            <div style="font-size: 11px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-bottom: 8px;">
              <div>Coverage: <strong>${lake.water_coverage_percentage}%</strong></div>
              <div>Risk: <strong>${lake.risk_level}</strong></div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Updated: ${lake.last_updated}</div>
            </div>
            <button id="lake-btn-${lake.id}" style="
              width: 100%;
              background: #06b6d4;
              color: #050914;
              border: none;
              padding: 5px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
            ">
              Open Dashboard →
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`lake-btn-${lake.id}`);
          if (btn && onSelectLake) {
            btn.onclick = () => onSelectLake(lake.id);
          }
        });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lakes, onSelectLake]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0b1426]/90 to-[#070d1a]/95 border border-cyan-500/20 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Geospatial Lake Monitoring Network
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Good (70+)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (50-69)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical (&lt;50)
          </span>
        </div>
      </div>

      <div 
        ref={mapContainerRef} 
        className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-800"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};
