import React, { useState } from 'react';
import { X, Play, Pause, Video, ShieldCheck, MapPin, Gauge, Eye, Sparkles } from 'lucide-react';
import { SupabaseVehicleDetection } from '../types/startracker';

interface FootagePlayerModalProps {
  detection: SupabaseVehicleDetection | null;
  onClose: () => void;
}

export const FootagePlayerModal: React.FC<FootagePlayerModalProps> = ({ detection, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!detection) return null;

  const color = detection.color || 'Orange';
  const isOrange = color.toLowerCase().includes('orange');

  // Video embed url fallback formatted for clean CCTV playback without YouTube branding
  const rawUrl = detection.video_url || 'https://www.youtube-nocookie.com/embed/yznpQlk0exE';
  // Extract video ID if present
  const match = rawUrl.match(/(?:embed\/|v=|vi\/|live\/)([a-zA-Z0-9_-]{11})/);
  const ytId = match ? match[1] : 'yznpQlk0exE';
  const videoUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${ytId}&modestbranding=1&disablekb=1&fs=0&playsinline=1&iv_load_policy=3`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-950/90 backdrop-blur-3xl border border-white/20 rounded-3xl max-w-4xl w-full shadow-[0_30px_90px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top subtle highlight reflection */}
        <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center shadow-md ${
              isOrange 
                ? 'bg-orange-500/20 border-orange-400/40 text-orange-300' 
                : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
            }`}>
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-mono">{detection.camera_id || 'CAM-01'}</span>
                <span className="text-sm font-semibold text-slate-200">LIVE CCTV • AI ANALYSIS</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                  isOrange 
                    ? 'bg-orange-500/20 text-orange-300 border-orange-400/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                }`}>
                  {detection.color}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span>{detection.location || 'Urban Traffic Corridor'}</span>
                <span>•</span>
                <span>Captured: {detection.detected_at ? new Date(detection.detected_at).toLocaleTimeString() : 'Live'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Footage Stage */}
        <div className="relative aspect-video w-full bg-black overflow-hidden group select-none">
          {isPlaying ? (
            <div className="absolute -inset-[16%] w-[132%] h-[132%] pointer-events-none overflow-hidden bg-black select-none">
              <iframe
                src={videoUrl}
                className="w-full h-full border-0 pointer-events-none scale-105"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                tabIndex={-1}
                title={`Footage ${detection.plate_number}`}
              />
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center">
              {detection.thumbnail && (
                <img
                  src={detection.thumbnail}
                  alt={detection.plate_number}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="p-4 rounded-full bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 hover:scale-110 transition-transform"
                >
                  <Play className="h-8 w-8 fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* Subtle CCTV Monitor Scanline & Vignette Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.60)_100%)] z-10" />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.22)_50%)] bg-[length:100%_4px] opacity-35 z-10" />

          {/* AI Detection Sentry HUD Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="bg-black/65 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-xs font-mono space-y-1 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>YOLOv8 + Supabase Stream Sync</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Target: <span className="text-white font-bold">{detection.plate_number}</span> ({detection.object_type || 'car'})
              </div>
              <div className="text-slate-300 text-[11px]">
                Hue Profile: <span className="text-orange-300 font-bold">{detection.color}</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Confidence: <span className="text-emerald-300 font-bold">{Math.round(detection.confidence * 100)}%</span>
              </div>
              {detection.person_clothing_color && (
                <div className="text-slate-300 text-[11px]">
                  Apparel: <span className="text-cyan-300 font-bold">{detection.person_clothing_color}</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Watermark Reticle */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600/80 backdrop-blur-md rounded-full text-[10px] font-mono text-white font-bold uppercase tracking-wider animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
              <span>Footage Playback</span>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="p-4 bg-slate-900/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Database Record:</span>
            <span className="font-mono text-cyan-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
              Supabase • {detection.plate_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause Feed' : 'Resume Playback'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
