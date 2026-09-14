import React, { useState } from 'react';
import { 
  Video, 
  Search, 
  Activity, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Radio, 
  Plus, 
  Layers, 
  Trash2, 
  RotateCcw,
  ExternalLink,
  Users,
  Car,
  Maximize2
} from 'lucide-react';
import { Camera } from '../../types/startracker';
import { AddCctvModal } from '../AddCctvModal';
import { CctvLiveStreamView } from '../CctvLiveStreamView';
import { CAMERA_PRESET_DETECTIONS } from '../../services/realDetector';

interface CamerasViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onCameraAdded?: (camera: Camera) => void;
  onCameraDeleted?: (cameraId: string) => void;
  onResetCameras?: () => void;
}

export const CamerasView: React.FC<CamerasViewProps> = ({ 
  cameras, 
  onSelectCamera,
  onCameraAdded,
  onCameraDeleted,
  onResetCameras,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [playingVideoCardId, setPlayingVideoCardId] = useState<string | null>(null);

  const filteredCameras = cameras.filter((cam) => {
    const matchesStatus = filterStatus === 'all' || cam.status === filterStatus;
    const matchesSearch =
      cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cam.provider && cam.provider.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls in Liquid Glass */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
        {/* Top edge reflection */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <Video className="h-5 w-5 text-cyan-300" />
              <span>Live CCTV Feeds & Optical Sentries</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              {cameras.length} Active Feeds
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time urban video streaming with hardware-accelerated YOLO person & vehicle detection
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search camera, node, or sector..."
              className="bg-black/30 border border-white/10 rounded-full text-xs pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-white/30 backdrop-blur-md w-56 shadow-inner"
            />
          </div>

          {/* Add CCTV Camera Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add CCTV Camera</span>
          </button>

          {/* Reset to 4 Default Cams */}
          {onResetCameras && (
            <button
              onClick={onResetCameras}
              title="Reset to 4 Default Streams"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Camera Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCameras.map((cam) => {
          const isActive = cam.status === 'active';
          const ytId = cam.youtube_id || 'yznpQlk0exE';
          const isPlayingThis = playingVideoCardId === cam.id;
          const detections = CAMERA_PRESET_DETECTIONS[cam.id] || [];
          const personCount = detections.filter(d => d.category === 'person').length;
          const vehicleCount = detections.filter(d => d.category === 'vehicle').length;

          return (
            <div
              key={cam.id}
              className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/[0.14] shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col justify-between transition-all duration-300 group"
            >
              {/* Top highlight */}
              <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              {/* Camera Header Banner */}
              <div className="p-4 border-b border-white/[0.08] flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      {cam.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex items-center gap-1 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>LIVE</span>
                    </span>

                    {cam.source_repo && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>God's Eye</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-white mt-1">{cam.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cam.location}</p>
                </div>

                {onCameraDeleted && cameras.length > 4 && (
                  <button
                    onClick={() => onCameraDeleted(cam.id)}
                    title="Remove Camera"
                    className="p-1.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Live Footage Thumbnail / Interactive In-Place Video Player */}
              <div className="relative aspect-video bg-black overflow-hidden group/vid cursor-pointer">
                {isPlayingThis ? (
                  <CctvLiveStreamView
                    camera={cam}
                    showHud={true}
                    showDetections={true}
                  />
                ) : (
                  <div 
                    onClick={() => onSelectCamera(cam)}
                    className="w-full h-full relative"
                  >
                    <img
                      src={cam.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={cam.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-500"
                    />

                    {/* Live Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-red-400 border border-red-500/30 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span>LIVE FEED</span>
                    </div>

                    {/* Detected Counts Overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {personCount > 0 && (
                        <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-mono text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{personCount}</span>
                        </div>
                      )}
                      {vehicleCount > 0 && (
                        <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-mono text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span>{vehicleCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Center Hover Play Action */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-4 py-2 rounded-full bg-cyan-500/90 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-2xl backdrop-blur-sm">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Launch Real YOLO Detection</span>
                      </div>
                    </div>

                    {/* Bottom stream telemetry strip */}
                    <div className="absolute bottom-2 inset-x-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                      <span>{cam.resolution} • {cam.fps} FPS</span>
                      <span className="text-cyan-300 font-semibold">{cam.feed_type === 'youtube_live' ? 'YouTube Live Stream' : cam.protocol?.toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stream Parameters & Quick Actions */}
              <div className="p-4 bg-black/20 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  <span className="text-slate-500">Node:</span> {cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlayingVideoCardId(isPlayingThis ? null : cam.id)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full text-xs font-medium border border-white/10 transition-all"
                  >
                    {isPlayingThis ? 'Show Preview' : 'Play Live Inline'}
                  </button>

                  <button
                    onClick={() => onSelectCamera(cam)}
                    className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-cyan-400/40 transition-all shadow-sm active:scale-95"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Real YOLO</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add CCTV Modal */}
      <AddCctvModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCameraAdded={(newCam) => {
          if (onCameraAdded) onCameraAdded(newCam);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
