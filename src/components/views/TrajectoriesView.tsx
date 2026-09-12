import React, { useState } from 'react';
import { Route, MapPin, Navigation, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import { Camera, TrajectoryPoint, VehicleTrajectoryResult } from '../../types/startracker';
import { ThemeMode } from '../../types/theme';
import { CameraMap } from '../CameraMap';

interface TrajectoriesViewProps {
  cameras: Camera[];
  defaultTrajectory: VehicleTrajectoryResult | null;
  onSelectCamera: (cam: Camera) => void;
  themeMode?: ThemeMode;
}

export const TrajectoriesView: React.FC<TrajectoriesViewProps> = ({
  cameras,
  defaultTrajectory,
  onSelectCamera,
  themeMode = 'dark',
}) => {
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string>('PB10AB1234');

  const trajectoryDatasets: Record<string, { label: string; plate: string; points: TrajectoryPoint[] }> = {
    PB10AB1234: {
      label: 'PB10AB1234 • Red Car (Clock Tower -> Model Town)',
      plate: 'PB10AB1234',
      points: defaultTrajectory?.events || [
        {
          sequence: 1,
          camera_id: 'CAM-01',
          camera_name: 'Clock Tower Junction',
          camera_location: 'Old City Roundabout',
          latitude: 30.9125,
          longitude: 75.8530,
          timestamp: '14:15:20 IST',
          speed_estimate_kmh: 42.5,
        },
        {
          sequence: 2,
          camera_id: 'CAM-03',
          camera_name: 'Aarti Chowk Intersection',
          camera_location: 'Mall Road Crossing',
          latitude: 30.8984,
          longitude: 75.8285,
          timestamp: '14:28:10 IST',
          speed_estimate_kmh: 38.0,
        },
        {
          sequence: 3,
          camera_id: 'CAM-02',
          camera_name: 'Ferozepur Road Flyover',
          camera_location: 'Opp. PAU Gate 1',
          latitude: 30.9018,
          longitude: 75.8152,
          timestamp: '14:38:45 IST',
          speed_estimate_kmh: 45.2,
        },
        {
          sequence: 4,
          camera_id: 'CAM-04',
          camera_name: 'Model Town Square',
          camera_location: 'Market Crossing',
          latitude: 30.8872,
          longitude: 75.8360,
          timestamp: '14:46:22 IST',
          speed_estimate_kmh: 32.1,
        },
      ],
    },
    PB10CZ8899: {
      label: 'PB10CZ8899 • White Car (Ferozepur Rd -> Gill Rd)',
      plate: 'PB10CZ8899',
      points: [
        {
          sequence: 1,
          camera_id: 'CAM-02',
          camera_name: 'Ferozepur Road Flyover',
          camera_location: 'Opp. PAU Gate 1',
          latitude: 30.9018,
          longitude: 75.8152,
          timestamp: '14:00:10 IST',
          speed_estimate_kmh: 40.0,
        },
        {
          sequence: 2,
          camera_id: 'CAM-03',
          camera_name: 'Aarti Chowk',
          camera_location: 'Mall Road Corridor',
          latitude: 30.8984,
          longitude: 75.8285,
          timestamp: '14:20:00 IST',
          speed_estimate_kmh: 36.5,
        },
        {
          sequence: 3,
          camera_id: 'CAM-05',
          camera_name: 'Gill Road Corridor',
          camera_location: 'Canal Bridge',
          latitude: 30.8710,
          longitude: 75.8621,
          timestamp: '14:38:15 IST',
          speed_estimate_kmh: 48.0,
        },
      ],
    },
  };

  const activePoints = trajectoryDatasets[selectedVehicleKey]?.points || [];

  return (
    <div className="space-y-6">
      {/* Header & Vehicle Selector in Liquid Glass */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
            <Route className="h-5 w-5 text-cyan-300" />
            <span>Multi-Camera Corridor Trajectory Reconstruction</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Haversine geospatial velocity tracking & automated camera sequence ordering
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Vehicle:</span>
          <select
            value={selectedVehicleKey}
            onChange={(e) => setSelectedVehicleKey(e.target.value)}
            className="bg-black/30 border border-white/10 text-white rounded-full px-4 py-1.5 focus:outline-none focus:border-white/30 backdrop-blur-md shadow-inner"
          >
            {Object.entries(trajectoryDatasets).map(([key, data]) => (
              <option key={key} value={key} className="bg-slate-900 text-white">
                {data.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map & Corridor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5">
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="text-slate-200 font-semibold uppercase tracking-wider">
                Geospatial Path Trace ({activePoints.length} Checkpoints)
              </span>
              <span className="text-rose-300 font-medium flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
                <Navigation className="h-3.5 w-3.5" />
                Active Interpolated Vector
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/[0.1]">
              <CameraMap
                cameras={cameras}
                trajectoryPoints={activePoints}
                onSelectCamera={onSelectCamera}
                heightClass="h-[480px]"
                themeMode={themeMode}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-4 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-300" />
                <span>Sequential Trajectory Events</span>
              </h3>

              <div className="space-y-3">
                {activePoints.map((point) => (
                  <div
                    key={point.sequence}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] flex items-start gap-3 transition-all"
                  >
                    <div className="h-6 w-6 rounded-full bg-rose-500/80 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                      {point.sequence}
                    </div>

                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white">
                          {point.camera_id}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                          {point.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{point.camera_name}</p>

                      {point.speed_estimate_kmh && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Corridor Velocity:</span>
                          <span className="text-emerald-300 font-semibold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {point.speed_estimate_kmh} km/h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-xs font-mono text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Confidence Index:</span>
                <span className="text-white font-semibold">96.4%</span>
              </div>
              <div className="flex justify-between">
                <span>Time-Space Consistency:</span>
                <span className="text-emerald-300">Validated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
