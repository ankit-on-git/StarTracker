import React, { useState } from 'react';
import { X, Video, Activity, Shield, Layers, Radio, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { Camera, Detection } from '../types/startracker';
import { LiveYoloDetector } from './LiveYoloDetector';

interface LiveCameraFeedModalProps {
  camera: Camera | null;
  onClose: () => void;
}

export const LiveCameraFeedModal: React.FC<LiveCameraFeedModalProps> = ({ camera, onClose }) => {
  const [detectionFeed, setDetectionFeed] = useState<string[]>([
    'ANPR Scan: PB10AB1234 (Confidence 0.96) - Car / Red',
    'YOLO: Pedestrian detected (Upper: Blue) - Confidence 0.91',
    'ANPR Scan: PB10CZ8899 (Confidence 0.94) - Car / White',
  ]);

  if (!camera) return null;

  const handleDetectionCaptured = (detection: Detection) => {
    const formatted = `Capture: ${detection.plate || 'Unknown'} (${detection.object_type.toUpperCase()} • ${(detection.confidence * 100).toFixed(0)}%) - ${camera.name}`;
    setDetectionFeed((prev) => [formatted, ...prev.slice(0, 5)]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative bg-slate-950/85 backdrop-blur-3xl border border-white/20 rounded-3xl max-w-5xl w-full shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
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

          {/* Real-time Detections Stream Logs */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Live YOLO Inference Ingress Events</span>
              </span>
              <span className="text-cyan-300 flex items-center gap-1 font-sans text-[11px]">
                <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                <span>Real-time Stream Synced</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {detectionFeed.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                >
                  <span className="truncate pr-2">{item}</span>
                  <span className="text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/20 whitespace-nowrap">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
