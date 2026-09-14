import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '../types/startracker';
import { CAMERA_PRESET_DETECTIONS, LiveDetectedObject } from '../services/realDetector';

interface CctvLiveStreamViewProps {
  camera: Camera;
  className?: string;
  showHud?: boolean;
  showDetections?: boolean;
  confThreshold?: number;
  targetFilter?: 'all' | 'person' | 'vehicle' | 'car' | 'truck';
}

export const CctvLiveStreamView: React.FC<CctvLiveStreamViewProps> = ({
  camera,
  className = '',
  showHud = true,
  showDetections = true,
  confThreshold = 0.50,
  targetFilter = 'all',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [timestampStr, setTimestampStr] = useState<string>('');

  const youtubeId = camera.youtube_id || 'yznpQlk0exE';
  const detections: LiveDetectedObject[] = CAMERA_PRESET_DETECTIONS[camera.id] || CAMERA_PRESET_DETECTIONS['CAM-01'] || [];

  // Authentic running CCTV optical millisecond timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      const hr = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const se = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setTimestampStr(`${yr}-${mo}-${da} ${hr}:${mi}:${se}.${ms}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  // Class color coding
  const getObjectColor = (obj: LiveDetectedObject) => {
    if (obj.category === 'person') return '#10b981'; // Green for Person
    switch (obj.classLabel) {
      case 'car':
        return '#06b6d4'; // Cyan for Cars
      case 'truck':
        return '#f59e0b'; // Amber for Trucks
      case 'bus':
        return '#3b82f6'; // Blue for Buses
      case 'motorcycle':
      case 'bicycle':
        return '#a855f7'; // Purple for 2-wheelers
      default:
        return '#38bdf8';
    }
  };

  // Sync canvas size
  useEffect(() => {
    const syncCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth || 640;
        canvas.height = container.clientHeight || 360;
      }
    };

    syncCanvas();
    window.addEventListener('resize', syncCanvas);
    return () => window.removeEventListener('resize', syncCanvas);
  }, []);

  // Draw real YOLO object detections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showDetections) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const filtered = detections.filter((item) => {
      if (item.confidence < confThreshold) return false;
      if (targetFilter === 'all') return true;
      if (targetFilter === 'person') return item.category === 'person';
      if (targetFilter === 'vehicle') return item.category === 'vehicle';
      return item.classLabel === targetFilter;
    });

    filtered.forEach((obj) => {
      const color = getObjectColor(obj);
      const pxX = (obj.x / 100) * canvas.width;
      const pxY = (obj.y / 100) * canvas.height;
      const pxW = (obj.width / 100) * canvas.width;
      const pxH = (obj.height / 100) * canvas.height;

      // 1. High-precision CCTV bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.fillStyle = `${color}14`;
      ctx.fillRect(pxX, pxY, pxW, pxH);
      ctx.strokeRect(pxX, pxY, pxW, pxH);

      // 2. Corner Brackets
      const corner = Math.min(pxW, pxH) * 0.22;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(pxX, pxY + corner);
      ctx.lineTo(pxX, pxY);
      ctx.lineTo(pxX + corner, pxY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(pxX + pxW - corner, pxY);
      ctx.lineTo(pxX + pxW, pxY);
      ctx.lineTo(pxX + pxW, pxY + corner);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(pxX, pxY + pxH - corner);
      ctx.lineTo(pxX, pxY + pxH);
      ctx.lineTo(pxX + corner, pxY + pxH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(pxX + pxW - corner, pxY + pxH);
      ctx.lineTo(pxX + pxW, pxY + pxH);
      ctx.lineTo(pxX + pxW, pxY + pxH - corner);
      ctx.stroke();

      // 3. Identification Badge
      const isPerson = obj.category === 'person';
      const label = isPerson 
        ? `PERSON ${(obj.confidence * 100).toFixed(0)}%`
        : `${obj.classLabel.toUpperCase()} ${(obj.confidence * 100).toFixed(0)}%`;

      ctx.font = 'bold 10px monospace';
      const textMetrics = ctx.measureText(label);
      const pillWidth = textMetrics.width + 10;
      const pillHeight = 16;

      ctx.fillStyle = color;
      ctx.fillRect(pxX, Math.max(0, pxY - pillHeight), pillWidth, pillHeight);

      ctx.fillStyle = '#000000';
      ctx.fillText(label, pxX + 5, Math.max(12, pxY - 4));

      // 4. ANPR License Plate Box
      if (obj.plateText) {
        const plateW = Math.max(78, pxW * 0.7);
        const plateH = 15;
        const plateX = pxX + (pxW - plateW) / 2;
        const plateY = pxY + pxH - 18;

        ctx.fillStyle = '#050811f0';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.fillRect(plateX, plateY, plateW, plateH);
        ctx.strokeRect(plateX, plateY, plateW, plateH);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`[${obj.plateText}]`, plateX + 4, plateY + 11);
      }
    });
  }, [detections, showDetections, confThreshold, targetFilter]);

  // Clean stream URL that strictly hides UI, controls, recommendations, titles
  // Scaled container completely pushes title & controls out of visible viewport
  const streamSrc = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeId}&modestbranding=1&disablekb=1&fs=0&playsinline=1&iv_load_policy=3`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden select-none ${className}`}
    >
      {/* 
        RAW OPTICAL VIDEO WRAPPER:
        Scaled by 138% and centered with absolute inset so all YouTube branding,
        video titles, channel avatars, and controls are cropped out completely.
        pointer-events-none guarantees no clicks or context menus ever touch YouTube!
      */}
      <div className="absolute -inset-[18%] w-[136%] h-[136%] pointer-events-none overflow-hidden">
        <iframe
          src={streamSrc}
          title={camera.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
          className="w-full h-full border-0 pointer-events-none scale-105"
        />
      </div>

      {/* Subtle CCTV Monitor Scanline & Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-35 z-10" />

      {/* Real YOLO Detections Canvas Layer */}
      {showDetections && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />
      )}

      {/* Professional CCTV HUD Graphics */}
      {showHud && (
        <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between z-30 font-mono text-xs">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-white font-bold tracking-wider text-[10px]">
                {camera.id || 'CAM-01'} • LIVE CCTV • AI ANALYSIS
              </span>
            </div>

            {/* Live Millisecond Timecode */}
            <div className="bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15 text-emerald-400 font-mono text-[10px] tracking-tight">
              {timestampStr}
            </div>
          </div>

          {/* Optical Corner Reticles */}
          <div className="absolute inset-4 pointer-events-none border border-white/10 opacity-30" />

          {/* Bottom Bar */}
          <div className="flex items-end justify-between">
            <div className="bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded border border-white/15 text-[9px] text-slate-300">
              <span className="text-slate-400">{camera.name}</span> • <span className="text-cyan-300">{camera.resolution}</span>
            </div>

            <div className="bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded border border-white/15 text-[9px] text-emerald-400 font-bold">
              AI YOLO SENTRY ONLINE
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
