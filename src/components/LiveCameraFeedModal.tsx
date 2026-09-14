import React, { useState } from 'react';
import { X, Video, Activity, Shield, Layers, Radio, RefreshCw, Sparkles, ExternalLink, Camera as CameraIcon, Clock, MapPin, Eye, Search } from 'lucide-react';
import { Camera, Detection } from '../types/startracker';
import { LiveYoloDetector } from './LiveYoloDetector';

interface LiveCameraFeedModalProps {
  camera: Camera | null;
  onClose: () => void;
  onSearchPlate?: (plate: string) => void;
}

export const LiveCameraFeedModal: React.FC<LiveCameraFeedModalProps> = ({ 
  camera, 
  onClose,
  onSearchPlate,
}) => {
  const [capturedEvents, setCapturedEvents] = useState<Detection[]>([
    {
      id: 'init-1',
      camera_id: camera?.id || 'CAM-01',
      camera_name: camera?.name || 'Shinjuku Kabukicho Traffic Junction',
      timestamp: 'LIVE now',
      object_type: 'car',
      category: 'vehicle',
      confidence: 0.98,
      plate: 'MH12AB1234',
      color: 'Orange',
      frame_path: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80',
      bbox_x: 0.42,
      bbox_y: 0.46,
      bbox_width: 0.20,
      bbox_height: 0.22,
    },
    {
      id: 'init-2',
      camera_id: camera?.id || 'CAM-01',
      camera_name: camera?.name || 'Shinjuku Kabukicho Traffic Junction',
      timestamp: '1 min ago',
      object_type: 'car',
      category: 'vehicle',
      confidence: 0.96,
      plate: 'PB10AB1234',
      color: 'Red',
      frame_path: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
      bbox_x: 0.64,
      bbox_y: 0.38,
      bbox_width: 0.17,
      bbox_height: 0.19,
    },
  ]);

  const [previewSnapshot, setPreviewSnapshot] = useState<Detection | null>(null);

  if (!camera) return null;

  const handleDetectionCaptured = (detection: Detection) => {
    setCapturedEvents((prev) => [detection, ...prev.slice(0, 7)]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative bg-slate-950/90 backdrop-blur-3xl border border-white/20 rounded-3xl max-w-5xl w-full shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top subtle highlight reflection */}
        <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-sm">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-mono">{camera.id}</span>
                <span className="text-sm font-semibold text-slate-200">{camera.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                  camera.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {camera.status}
                </span>
                {camera.source_repo && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>{camera.source_repo}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {camera.location} • {camera.provider || 'City Traffic Surveillance Grid'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Live YOLO Detector Feed Canvas */}
          <LiveYoloDetector
            camera={camera}
            onDetectionCaptured={handleDetectionCaptured}
            showFullControls={true}
          />

          {/* Real-time Ingress Snapshots & Detections Stream */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 uppercase tracking-wider font-semibold flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Captured Database Ingress Snapshots ({capturedEvents.length})</span>
              </span>
              <span className="text-emerald-300 flex items-center gap-1 font-sans text-[11px]">
                <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                <span>Auto-Persisting to Backend DB & Supabase</span>
              </span>
            </div>

            {/* Visual Snapshots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {capturedEvents.map((det) => (
                <div
                  key={det.id}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-cyan-400/40 text-slate-300 space-y-2 group transition-all"
                >
                  {/* Snapshot Thumbnail with Zoom button */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black/80 border border-white/10">
                    <img
                      src={det.frame_path}
                      alt={det.plate || 'Detection'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-1 left-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/80 text-cyan-300 border border-white/15">
                      {det.color || 'Vehicle'}
                    </div>
                    <button
                      onClick={() => setPreviewSnapshot(det)}
                      className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-slate-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Inspect Snapshot Picture"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Plate */}
                    <div className="flex items-center bg-white text-slate-950 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-white/80">
                      <span className="mr-1 text-[7px] text-blue-900">IND</span>
                      <span>{det.plate || 'NO PLATE'}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold">
                      {Math.round(det.confidence * 100)}%
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="capitalize">{det.color} {det.object_type}</span>
                    <span>{det.timestamp}</span>
                  </div>

                  {onSearchPlate && det.plate && (
                    <button
                      onClick={() => onSearchPlate(det.plate || '')}
                      className="w-full py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 text-[10px] font-sans font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Search className="h-3 w-3" />
                      <span>Search in Database</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot High-Res Inspection Modal */}
      {previewSnapshot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-sm text-white">
                <CameraIcon className="h-4 w-4 text-cyan-400" />
                <span>CCTV Optical Evidence Snapshot • {previewSnapshot.plate}</span>
              </div>
              <button
                onClick={() => setPreviewSnapshot(null)}
                className="text-slate-300 hover:text-white text-xs font-mono px-3 py-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black">
              <img
                src={previewSnapshot.frame_path}
                alt="Detection Snapshot"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-slate-400 block">License Plate:</span>
                <span className="text-white font-bold text-sm">{previewSnapshot.plate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-slate-400 block">Vehicle Color:</span>
                <span className="text-orange-300 font-bold text-sm">{previewSnapshot.color}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-slate-400 block">Location:</span>
                <span className="text-cyan-300 truncate block">{previewSnapshot.camera_name}</span>
              </div>
            </div>

            {onSearchPlate && previewSnapshot.plate && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    const pl = previewSnapshot.plate;
                    setPreviewSnapshot(null);
                    onSearchPlate(pl || '');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search {previewSnapshot.plate} in Vehicle Database & Tracking</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
