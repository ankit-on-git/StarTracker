import React, { useState } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Navigation, 
  Eye, 
  Play, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VehicleTrajectoryResult, TrajectoryPoint } from '../types/startracker';

interface VehicleResultCardProps {
  trajectoryResult: VehicleTrajectoryResult;
  onPlotOnMap?: (points: TrajectoryPoint[]) => void;
  onOpenLiveFeed?: (cameraId: string) => void;
}

export const VehicleResultCard: React.FC<VehicleResultCardProps> = ({
  trajectoryResult,
  onPlotOnMap,
  onOpenLiveFeed,
}) => {
  const { vehicle, events, total_cameras, time_span_minutes } = trajectoryResult;
  const [expanded, setExpanded] = useState(true);
  const [activeMediaPoint, setActiveMediaPoint] = useState<TrajectoryPoint | null>(events[0] || null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Apple-style Glass pill color badges
  const colorBadges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    red: { bg: 'bg-rose-500/15', text: 'text-rose-200', dot: 'bg-rose-400', border: 'border-rose-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-200', dot: 'bg-orange-400', border: 'border-orange-500/40' },
    'orange/yellow': { bg: 'bg-amber-500/20', text: 'text-amber-200', dot: 'bg-amber-400', border: 'border-amber-500/40' },
    white: { bg: 'bg-white/20', text: 'text-white', dot: 'bg-white', border: 'border-white/40' },
    silver: { bg: 'bg-slate-300/15', text: 'text-slate-200', dot: 'bg-slate-300', border: 'border-slate-300/30' },
    blue: { bg: 'bg-blue-500/15', text: 'text-blue-200', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    black: { bg: 'bg-black/40', text: 'text-slate-300', dot: 'bg-slate-500', border: 'border-white/10' },
    yellow: { bg: 'bg-amber-500/15', text: 'text-amber-200', dot: 'bg-amber-400', border: 'border-amber-500/30' },
  };

  const badge = colorBadges[vehicle.vehicle_color.toLowerCase()] || {
    bg: 'bg-white/10',
    text: 'text-slate-200',
    dot: 'bg-slate-400',
    border: 'border-white/15',
  };

  return (
    <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] overflow-hidden transition-all duration-300 mb-5">
      {/* Top subtle liquid glass highlight reflection */}
      <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Card Header Bar */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          {/* Indian HSRP License Plate Glass Pill */}
          <div className="relative flex items-center bg-gradient-to-b from-white to-slate-100 text-slate-950 font-mono font-bold tracking-wider px-3.5 py-1.5 rounded-xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col items-center justify-center mr-2.5 pr-2 border-r border-slate-300 text-[8px] text-blue-900 leading-none">
              <span>IND</span>
              <span className="text-[7px]">🇮🇳</span>
            </div>
            <span className="text-base tracking-widest">{vehicle.plate_number}</span>
          </div>

          {/* Vehicle Type & Color Chips */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.08] border border-white/[0.12] text-slate-200 uppercase flex items-center gap-1.5 shadow-sm">
              <Car className="h-3.5 w-3.5 text-cyan-300" />
              <span>{vehicle.vehicle_type}</span>
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 shadow-sm ${badge.bg} ${badge.border} ${badge.text}`}>
              <span className={`h-2 w-2 rounded-full ${badge.dot}`}></span>
              <span className="capitalize">{vehicle.vehicle_color}</span>
            </span>
          </div>
        </div>

        {/* Confidence & Action Glass Buttons */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-slate-300 backdrop-blur-md">
            <span>OCR Match:</span>
            <span className="font-bold text-emerald-300">
              {Math.round(vehicle.plate_confidence * 100)}%
            </span>
          </div>

          {onPlotOnMap && (
            <button
              onClick={() => onPlotOnMap(events)}
              className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 rounded-full flex items-center gap-1.5 font-medium transition-all shadow-[0_4px_16px_rgba(6,182,212,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Plot Trajectory</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.1] rounded-full transition-colors border border-white/[0.08]"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Trajectory Summary Ribbon */}
      <div className="px-5 py-2.5 bg-black/25 border-b border-white/[0.06] flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-cyan-300" />
            <strong className="text-white font-semibold">{total_cameras}</strong> cameras traversed
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-300" />
            Duration: <strong className="text-white font-semibold">{time_span_minutes} mins</strong>
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          First seen: {vehicle.first_seen_at} • Last seen: {vehicle.last_seen_at}
        </div>
      </div>

      {expanded && (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Chronological Multi-Camera Timeline */}
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center justify-between">
              <span>Chronological Camera Trajectory</span>
              <span className="text-[11px] text-cyan-300 font-mono">{events.length} Verification Nodes</span>
            </div>

            <div className="relative pl-6 border-l border-white/[0.12] space-y-3.5 ml-2">
              {events.map((point) => {
                const isActive = activeMediaPoint?.sequence === point.sequence;
                return (
                  <div
                    key={point.sequence}
                    onClick={() => setActiveMediaPoint(point)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/[0.12] border-cyan-400/60 shadow-[0_8px_24px_rgba(6,182,212,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                        : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.16]'
                    }`}
                  >
                    {/* Node Sequence Marker Pin */}
                    <div
                      className={`absolute -left-[31px] top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950 border-white shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                          : 'bg-black/60 text-slate-300 border-white/20'
                      }`}
                    >
                      {point.sequence}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white">
                            {point.camera_id}
                          </span>
                          <span className="text-xs text-slate-200 font-medium">
                            {point.camera_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{point.camera_location}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-cyan-300 font-semibold block">
                          {point.timestamp}
                        </span>
                        {point.speed_estimate_kmh && (
                          <span className="text-[11px] font-mono text-emerald-300 mt-0.5 inline-flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {point.speed_estimate_kmh} km/h
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Coordinates: {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                      {onOpenLiveFeed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLiveFeed(point.camera_id);
                          }}
                          className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 hover:underline"
                        >
                          <span>Inspect Node</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Evidence & Media Snapshot */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-black/30 rounded-2xl p-4 border border-white/[0.08] backdrop-blur-xl">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
                <span>CCTV Optical Evidence</span>
                {activeMediaPoint && (
                  <span className="text-cyan-300 font-mono font-semibold">
                    Step #{activeMediaPoint.sequence} ({activeMediaPoint.camera_id})
                  </span>
                )}
              </div>

              {/* CCTV Frame Display */}
              <div className="relative aspect-video rounded-xl bg-black/60 border border-white/[0.1] overflow-hidden group shadow-inner">
                {activeMediaPoint?.frame_path ? (
                  <img
                    src={activeMediaPoint.frame_path}
                    alt={`Detection crop at ${activeMediaPoint.camera_id}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                    <Eye className="h-8 w-8 mb-2 opacity-40" />
                    <span>Visual frame archived</span>
                  </div>
                )}

                {/* Simulated CCTV Overlay Details */}
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 border border-white/20 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
                  REC • {activeMediaPoint?.camera_id} • 1080P
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 bg-black/75 rounded-lg text-[10px] font-mono text-slate-200 border border-white/10 backdrop-blur-md">
                  <span>{activeMediaPoint?.timestamp}</span>
                  <span className="text-emerald-400">YOLO: 0.96</span>
                </div>

                {/* Video Play Trigger */}
                {activeMediaPoint?.video_path && (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.6)] transition-transform group-hover:scale-110"
                    title="Play Video Clip"
                  >
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Evidence Validation Checklist */}
            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2 text-white font-semibold mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Automated Integrity Verification</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Plate OCR Integrity:</span>
                <span className="text-slate-200">Standard Indian HSRP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Color Model:</span>
                <span className="text-slate-200">HSV Segmented Dominance</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Speed Calculation:</span>
                <span className="text-slate-200">Haversine GPS Delta / Time</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900/90 border border-white/20 rounded-3xl max-w-2xl w-full p-5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-sm text-white">
                <Play className="h-4 w-4 text-cyan-400" />
                <span>CCTV Video Playback • {activeMediaPoint?.camera_id}</span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-300 hover:text-white text-xs font-mono px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Close (ESC)
              </button>
            </div>

            <div className="mt-4 aspect-video bg-black/90 rounded-2xl flex flex-col items-center justify-center text-slate-300 font-mono text-sm relative overflow-hidden border border-white/15 shadow-inner">
              <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                CCTV ARCHIVE PLAYBACK
              </div>
              <p className="text-slate-200 mb-2">Simulated RTSP Ingestion Stream for {activeMediaPoint?.camera_id}</p>
              <p className="text-xs text-slate-400">Captured: {activeMediaPoint?.timestamp}</p>
              <div className="mt-4 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-cyan-300 text-xs">
                ANPR Trigger: {vehicle.plate_number} detected at frame #420 (Confidence: {Math.round(vehicle.plate_confidence * 100)}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
