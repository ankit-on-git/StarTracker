import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Navigation, Compass } from 'lucide-react';
import { Camera, TrajectoryPoint } from '../types/startracker';

interface CameraMapProps {
  cameras: Camera[];
  selectedCamera?: Camera | null;
  onSelectCamera?: (camera: Camera) => void;
  trajectoryPoints?: TrajectoryPoint[];
  heightClass?: string;
  themeMode?: 'dark' | 'light' | 'cyber';
}

type BasemapStyle = 'voyager' | 'dark' | 'light';

export const CameraMap: React.FC<CameraMapProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  trajectoryPoints = [],
  heightClass = 'h-[460px]',
  themeMode = 'dark',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap style state with default based on themeMode
  const [activeBasemap, setActiveBasemap] = useState<BasemapStyle>(
    themeMode === 'light' ? 'voyager' : 'voyager' // Voyager is requested specifically by user!
  );

  // Synchronize basemap when themeMode changes if user hasn't explicitly overridden
  useEffect(() => {
    if (themeMode === 'light') {
      setActiveBasemap('voyager');
    } else if (themeMode === 'cyber') {
      setActiveBasemap('voyager');
    } else {
      setActiveBasemap('voyager');
    }
  }, [themeMode]);

  // CARTO Tile Layer Definitions with User API Key
  const CARTO_API_KEY = 'cb1_2xye_1_27ac559588d97d068a913981';

  const tileConfigs: Record<BasemapStyle, { url: string; subdomains: string; attribution: string }> = {
    voyager: {
      // Direct API URL requested by user
      url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> Voyager &copy; OpenStreetMap',
    },
    dark: {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> Dark Matter &copy; OpenStreetMap',
    },
    light: {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> Positron &copy; OpenStreetMap',
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.9010, 75.8390],
        zoom: 13,
        zoomControl: false, // Custom placed zoom or default
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Tile Layer
      const cfg = tileConfigs[activeBasemap];
      const tileLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }
  }, []);

  // Update Tile Layer when basemap changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = tileConfigs[activeBasemap];
    const newTileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeBasemap]);

  // Update Camera Markers and Trajectories
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: [number, number][] = [];

    // Draw camera nodes
    cameras.forEach((cam) => {
      const isSelected = selectedCamera?.id === cam.id;
      const isPartTrajectory = trajectoryPoints.some((tp) => tp.camera_id === cam.id);

      bounds.push([cam.latitude, cam.longitude]);

      const pulseHtml = isSelected
        ? `<div class="relative flex items-center justify-center">
            <span class="absolute h-9 w-9 rounded-full bg-cyan-400/50 animate-ping"></span>
            <div class="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-[0_0_16px_rgba(6,182,212,0.8)]">
              ${cam.id.replace('CAM-', '')}
            </div>
           </div>`
        : isPartTrajectory
        ? `<div class="h-6 w-6 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-[0_0_12px_rgba(244,63,94,0.7)]">
            ${cam.id.replace('CAM-', '')}
           </div>`
        : `<div class="h-5 w-5 rounded-full ${
            cam.status === 'active' ? 'bg-cyan-500 border-white' : 'bg-amber-500 border-white'
          } border-2 flex items-center justify-center text-[9px] font-mono text-slate-950 font-bold shadow-md hover:scale-110 transition-transform">
            ${cam.id.replace('CAM-', '')}
           </div>`;

      const customIcon = L.divIcon({
        className: 'custom-camera-marker',
        html: pulseHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([cam.latitude, cam.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 4px; min-width: 200px;">
          <div style="font-weight: 700; font-size: 13px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span>${cam.id}: ${cam.name}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${
              cam.status === 'active' ? '#dcfce7; color: #15803d' : '#fef3c7; color: #b45309'
            };">${cam.status.toUpperCase()}</span>
          </div>
          <div style="margin-bottom: 3px;"><strong>Location:</strong> ${cam.location}</div>
          <div style="margin-bottom: 3px;"><strong>Feed:</strong> ${cam.feed_type === 'cctv_snapshot' ? 'Live CCTV Snapshot (God\'s Eye View)' : 'RTSP / Video Stream'}</div>
          ${cam.provider ? `<div style="margin-bottom: 3px; font-size: 11px; color: #0284c7;"><strong>Provider:</strong> ${cam.provider}</div>` : ''}
          <div style="margin-bottom: 3px;"><strong>Stream:</strong> ${cam.resolution} @ ${cam.fps} FPS</div>
          <div style="margin-bottom: 6px;"><strong>Detections:</strong> ${cam.total_detections || 0}</div>
          <button style="width: 100%; padding: 4px 8px; background: #06b6d4; color: #020617; font-weight: 700; font-size: 11px; border: none; border-radius: 6px; cursor: pointer;">
            Launch YOLO Live Detector &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectCamera) {
          onSelectCamera(cam);
        }
      });

      marker.addTo(layerGroup);
    });

    // Draw trajectories if present
    if (trajectoryPoints.length > 0) {
      const sortedPoints = [...trajectoryPoints].sort((a, b) => a.sequence - b.sequence);
      const latlngs: [number, number][] = sortedPoints.map((p) => [p.latitude, p.longitude]);

      // Outer glow line
      L.polyline(latlngs, {
        color: '#f43f5e',
        weight: 6,
        opacity: 0.35,
      }).addTo(layerGroup);

      // Core animated dashed line
      const polyline = L.polyline(latlngs, {
        color: '#f43f5e',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '6, 8',
      }).addTo(layerGroup);

      sortedPoints.forEach((point) => {
        const checkIcon = L.divIcon({
          className: 'trajectory-checkpoint',
          html: `<div class="h-6 w-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(244,63,94,0.8)]">
                  ${point.sequence}
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([point.latitude, point.longitude], { icon: checkIcon })
          .bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
              <strong style="color: #e11d48;">Step #${point.sequence}: ${point.camera_id}</strong><br/>
              <span>${point.camera_name}</span><br/>
              <span style="color: #64748b; font-size: 11px;">Time: ${point.timestamp}</span><br/>
              <span style="font-weight: 600; color: #059669;">Speed Est: ${point.speed_estimate_kmh || '--'} km/h</span>
            </div>
          `)
          .addTo(layerGroup);
      });

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }, [cameras, selectedCamera, trajectoryPoints, onSelectCamera]);

  return (
    <div className={`relative w-full overflow-hidden ${heightClass}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Basemap Selector Capsule */}
      <div className="absolute top-3 left-3 z-20 flex items-center bg-slate-900/85 backdrop-blur-xl border border-white/20 p-1 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] text-[11px] font-medium text-slate-300">
        <div className="px-2.5 py-1 text-cyan-300 flex items-center gap-1 font-semibold">
          <Compass className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Map Style:</span>
        </div>

        <button
          onClick={() => setActiveBasemap('voyager')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
            activeBasemap === 'voyager'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="CARTO Voyager Raster Tiles"
        >
          <span>Voyager</span>
          <span className="text-[9px] opacity-75 font-mono">API</span>
        </button>

        <button
          onClick={() => setActiveBasemap('dark')}
          className={`px-3 py-1 rounded-full transition-all ${
            activeBasemap === 'dark'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="CARTO Dark Matter"
        >
          <span>Dark</span>
        </button>

        <button
          onClick={() => setActiveBasemap('light')}
          className={`px-3 py-1 rounded-full transition-all ${
            activeBasemap === 'light'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="CARTO Positron Light"
        >
          <span>Light</span>
        </button>
      </div>

      {/* Map Legend Overlay Capsule */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/85 backdrop-blur-xl border border-white/20 px-3.5 py-2.5 rounded-2xl text-[11px] font-mono text-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
        <div className="text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px] flex items-center justify-between gap-3">
          <span>Telemetry Status</span>
          <span className="text-[9px] text-cyan-300 font-mono">CARTO API</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          <span>Active CCTV Node</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
          <span>Maintenance Node</span>
        </div>
        {trajectoryPoints.length > 0 && (
          <div className="flex items-center gap-2 border-t border-white/10 pt-1 mt-1 text-rose-300 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            <span>Trajectory Track</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Region Navigation Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-2xl border border-white/20 p-1.5 rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.6)] text-[11px] font-mono text-slate-300">
        <span className="px-2.5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider hidden sm:inline">
          Focus Sector:
        </span>
        <button
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) {
              map.flyTo([30.9018, 75.8300], 13, { duration: 1.2 });
            }
          }}
          className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-all active:scale-95"
        >
          Ludhiana Urban Grid (7 Cams)
        </button>
        <button
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) {
              map.flyTo([30.2682, -97.7428], 13.5, { duration: 1.2 });
            }
          }}
          className="px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-all font-semibold active:scale-95 flex items-center gap-1"
        >
          <span>God's Eye View / Austin CCTV (4 Cams)</span>
        </button>
      </div>
    </div>
  );
};
