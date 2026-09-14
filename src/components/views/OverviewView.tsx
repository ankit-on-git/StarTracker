import React, { useState } from 'react';
import { 
  Camera as CameraIcon, 
  Car, 
  Activity, 
  ArrowRight,
  ShieldCheck,
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
  const [activeTrajectory] = useState<any[]>(
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* God's Eye Interactive City Camera Map - Expansive View */}
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
            heightClass="h-[520px]"
            themeMode={themeMode}
          />
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
