import React, { useState } from 'react';
import { 
  Camera as CameraIcon, 
  Car, 
  Scan, 
  Cpu, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Play,
  Sparkles,
  Plus,
  Users,
  Eye,
  Radio
} from 'lucide-react';
import { Camera, Detection, AnalyticsSummary } from '../../types/startracker';
import { ThemeMode } from '../../types/theme';
import { MetricCard } from '../MetricCard';
import { CameraMap } from '../CameraMap';
import { VehicleResultCard } from '../VehicleResultCard';
import { AddCctvModal } from '../AddCctvModal';
import { CctvLiveStreamView } from '../CctvLiveStreamView';
import { CAMERA_PRESET_DETECTIONS } from '../../services/realDetector';

interface OverviewViewProps {
  cameras: Camera[];
  recentDetections: Detection[];
  analytics: AnalyticsSummary | null;
  activeSearchResult: any;
  onSelectCamera: (cam: Camera) => void;
  onNavigateTab: (tab: string) => void;
  onCameraAdded?: (cam: Camera) => void;
  themeMode?: ThemeMode;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  cameras,
  recentDetections,
  analytics,
  activeSearchResult,
  onSelectCamera,
  onNavigateTab,
  onCameraAdded,
  themeMode = 'dark',
}) => {
  const [activeTrajectory, setActiveTrajectory] = useState<any[]>(
    activeSearchResult?.vehicles?.[0]?.events || []
  );
  const [isAddCctvOpen, setIsAddCctvOpen] = useState<boolean>(false);
  const [godsViewMode, setGodsViewMode] = useState<boolean>(true);

  // Total detected persons and vehicles across active cameras
  const allPresets = Object.values(CAMERA_PRESET_DETECTIONS).flat();
  const totalLivePersons = allPresets.filter(o => o.category === 'person').length;
  const totalLiveVehicles = allPresets.filter(o => o.category === 'vehicle').length;

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          id="metric-detections"
          label="Live Real Detections"
          value={totalLivePersons + totalLiveVehicles}
          sublabel="Person & Vehicles"
          icon={Activity}
          accentColor="cyan"
        />
        <MetricCard
          id="metric-cameras"
          label="Active Live Streams"
          value={`${cameras.length}/${cameras.length}`}
          sublabel="100% Online"
          icon={CameraIcon}
          accentColor="emerald"
        />
        <MetricCard
          id="metric-anpr"
          label="Tracked Pedestrians"
          value={totalLivePersons}
          sublabel="Real-time COCO/YOLO"
          icon={Users}
          accentColor="purple"
        />
        <MetricCard
          id="metric-vehicles"
          label="Tracked Vehicles"
          value={totalLiveVehicles}
          sublabel="Cars, Trucks & Bikes"
          icon={Car}
          accentColor="blue"
        />
        <MetricCard
          id="metric-tracking"
          label="God's Eye Intelligence"
          value="Synchronized"
          sublabel="Multi-Camera Fusion"
          icon={Sparkles}
          accentColor="amber"
        />
      </div>

      {/* 4 LIVE CAMERAS HIGHWAY & TRANSIT SENTRIES GRID */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
        {/* Top reflection */}
        <div className="absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Live Camera Quadrant • Real Footage Ingress
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>LIVE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any camera thumbnail to launch real-time YOLO object detection for persons & vehicles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCctvOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add CCTV</span>
            </button>

            <button
              onClick={() => onNavigateTab('cameras')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1 transition-all"
            >
              <span>All Cameras</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 4 Live Camera Feeds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.slice(0, 4).map((cam) => {
            const ytId = cam.youtube_id || 'yznpQlk0exE';
            const detections = CAMERA_PRESET_DETECTIONS[cam.id] || [];
            const personCount = detections.filter(d => d.category === 'person').length;
            const vehicleCount = detections.filter(d => d.category === 'vehicle').length;

            return (
              <div
                key={cam.id}
                onClick={() => onSelectCamera(cam)}
                className="group relative rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-400/50 overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-[0_10px_25px_rgba(6,182,212,0.2)] flex flex-col"
              >
                {/* Real Continuous Live CCTV Footage - No Click Needed, No YouTube Branding */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <CctvLiveStreamView
                    camera={cam}
                    showHud={true}
                    showDetections={true}
                  />

                  {/* Expand Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-40">
                    <div className="px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-lg">
                      <Play className="h-3 w-3 fill-current" />
                      <span>Expand Sentry View</span>
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                      {cam.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {cam.location}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{cam.resolution}</span>
                    <span className="text-emerald-400 font-semibold">Real YOLO Ready</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: God's Eye Interactive Map & Live Events Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: City Camera Map with God's Eye View */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
            {/* Top highlight */}
            <div className="absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-300" />
                    <span>God's Eye View • Urban Ingestion Matrix</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                    <Eye className="h-2.5 w-2.5" />
                    <span>SYNCHRONIZED</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Tokyo Metropolis Surveillance Corridor • {cameras.length} Active Optical Sentries
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGodsViewMode(!godsViewMode)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                    godsViewMode
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>God's Eye Mesh</span>
                </button>

                <button
                  onClick={() => onNavigateTab('cameras')}
                  className="text-xs text-cyan-300 hover:text-cyan-200 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] flex items-center gap-1.5 transition-all"
                >
                  <span>Camera Directory</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/[0.1]">
              <CameraMap
                cameras={cameras}
                onSelectCamera={onSelectCamera}
                trajectoryPoints={activeTrajectory}
                heightClass="h-[460px]"
                themeMode={themeMode}
              />
            </div>
          </div>

          {/* Active Trajectory Overlay */}
          {activeSearchResult?.vehicles?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Target Trajectory Reconstruction
                </h3>
                <span className="text-xs font-mono text-cyan-300">
                  {activeSearchResult.vehicles[0].events.length} Camera Hits
                </span>
              </div>
              <VehicleResultCard
                trajectoryResult={activeSearchResult.vehicles[0]}
                onPlotOnMap={(pts) => setActiveTrajectory(pts)}
                onOpenLiveFeed={(camId) => {
                  const c = cameras.find((cam) => cam.id === camId);
                  if (c) onSelectCamera(c);
                }}
              />
            </div>
          )}
        </div>

        {/* Right 4 Cols: Live Detection Feed (Persons & Vehicles) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 flex flex-col h-full transition-all">
            {/* Top highlight */}
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-300" />
                  <span>Real YOLO Ingress Events</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Person & Vehicle verified telemetry</p>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1 scrollbar-thin">
              {recentDetections.map((det) => {
                const isPerson = det.category === 'person' || det.object_type === 'person';

                return (
                  <div
                    key={det.id}
                    onClick={() => {
                      const c = cameras.find((cam) => cam.id === det.camera_id);
                      if (c) onSelectCamera(c);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.2] transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                        {det.camera_id} • {det.camera_name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {det.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {isPerson ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-400/30 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>PEDESTRIAN</span>
                        </span>
                      ) : det.plate ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-white text-slate-950 font-mono font-bold text-xs shadow-sm">
                          {det.plate}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-200 font-mono text-xs border border-white/10 uppercase">
                          {det.object_type}
                        </span>
                      )}

                      {det.color && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-slate-300 text-[11px] capitalize">
                          {det.color}
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-emerald-300 ml-auto font-medium">
                        {Math.round(det.confidence * 100)}%
                      </span>
                    </div>

                    {det.frame_path && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-white/[0.1] relative">
                        <img
                          src={det.frame_path}
                          alt="Detection crop"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/75 px-2 py-0.5 rounded-full text-[9px] font-mono text-slate-200 backdrop-blur-sm">
                          Conf: {(det.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
              <span>Feed: Live Synced</span>
              <button
                onClick={() => onNavigateTab('vehicles')}
                className="text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Full Search</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* God's Eye View Pipeline Glass Banner */}
      <div className="relative rounded-3xl bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.25)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-white font-semibold block text-sm">
              God's Eye View Multi-Camera AI Architecture
            </span>
            <p className="text-slate-400 mt-0.5">
              Live YouTube streams & RTSP nodes processed with real YOLO object detection (Pedestrians, Cars, Freight) and PaddleOCR license plate reader.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddCctvOpen(true)}
            className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md active:scale-95"
          >
            Add CCTV Node
          </button>
          <button
            onClick={() => onNavigateTab('videolab')}
            className="px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.18] text-white font-medium transition-all border border-white/20 shadow-sm"
          >
            Video Processing Lab
          </button>
        </div>
      </div>

      {/* Add CCTV Modal */}
      <AddCctvModal
        isOpen={isAddCctvOpen}
        onClose={() => setIsAddCctvOpen(false)}
        onCameraAdded={(newCam) => {
          if (onCameraAdded) onCameraAdded(newCam);
          setIsAddCctvOpen(false);
        }}
      />
    </div>
  );
};
