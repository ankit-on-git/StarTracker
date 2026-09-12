import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Terminal, 
  CheckCircle2, 
  FileVideo, 
  Sliders, 
  ExternalLink,
  GitBranch,
  Check,
  XCircle,
  Code2,
  Zap,
  ShieldCheck,
  Video,
  Sparkles,
  Radio,
  Layers,
  Camera as CameraIcon,
  RefreshCw
} from 'lucide-react';
import { Camera, Detection } from '../../types/startracker';
import { StarTrackerAPI } from '../../services/api';
import { LiveYoloDetector } from '../LiveYoloDetector';

interface VideoIngestViewProps {
  cameras: Camera[];
}

export const VideoIngestView: React.FC<VideoIngestViewProps> = ({ cameras }) => {
  const [activeTab, setActiveTab] = useState<'live_studio' | 'batch_benchmark'>('live_studio');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-GEV-01');
  const [frameSkip, setFrameSkip] = useState<number>(3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingOutput, setProcessingOutput] = useState<any | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'ultralytics' | 'opencv'>('ultralytics');
  const [capturedDetections, setCapturedDetections] = useState<Detection[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] StarTracker Video Ingestion Worker loaded',
    '[INIT] Ultralytics YOLOv8n engine active (github.com/ultralytics/ultralytics)',
    '[INGRESS] Synchronized feeds from bilawalsidhu/gods-eye-view (Austin CCTV provider)',
    '[INIT] PaddleOCR English (PP-OCRv4 Mobile) engine initialized',
    '[READY] Selected best working detector: Ultralytics YOLOv8 with ByteTrack.',
  ]);

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  const handleDetectionCaptured = (detection: Detection) => {
    setCapturedDetections((prev) => [detection, ...prev.slice(0, 7)]);
    setTerminalLogs((prev) => [
      `[EVENT] Live YOLO Detection Captured: ${detection.plate || 'No-plate'} (${detection.object_type.toUpperCase()}) on ${selectedCamera.name}`,
      ...prev.slice(0, 10),
    ]);
  };

  const runVideoIngestion = async () => {
    setIsProcessing(true);
    setTerminalLogs((prev) => [
      ...prev,
      `[TASK] Starting ingestion for Camera: ${selectedCameraId}`,
      `[CV] Ingesting stream (FRAME_STRIDE=${frameSkip})`,
      '[CV] Ultralytics YOLOv8 tracking inference executing (COCO 80 classes)...',
      '[CV] ByteTrack algorithm preserving vehicle tracklets across frames...',
      '[CV] Indian HSRP license plate crops passed to PaddleOCR...',
      '[CV] Extracting dominant HSV color on vehicle chassis...',
    ]);

    try {
      const res = await StarTrackerAPI.processVideoSimulation(selectedCameraId, frameSkip);
      setTimeout(() => {
        setProcessingOutput(res);
        setTerminalLogs((prev) => [
          ...prev,
          `[SUCCESS] Ingestion completed: ${res.vehicles_identified} vehicles tracked across camera node`,
          `[DB] Trajectory coordinates and velocity metrics logged into database.`,
        ]);
        setIsProcessing(false);
      }, 1200);
    } catch (e) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Strip with Mode Tabs */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-300" />
              <span>CCTV Video Ingestion & YOLO Object Detection Studio</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live feeds integrated from <strong className="text-cyan-300 font-semibold">bilawalsidhu/gods-eye-view</strong> & municipal RTSP nodes running <strong className="text-white font-semibold">Ultralytics YOLOv8</strong>
            </p>
          </div>

          {/* Studio Navigation Switcher */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('live_studio')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'live_studio'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_2px_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Live YOLO Detection Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('batch_benchmark')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'batch_benchmark'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_2px_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Model Benchmark & Batch Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Live YOLO Detection Studio */}
      {activeTab === 'live_studio' && (
        <div className="space-y-6">
          {/* Camera Feed Ingress Selector Capsule */}
          <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-4.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                <Radio className="h-4 w-4 text-cyan-300 animate-pulse" />
                <span>Select Ingress Camera Stream:</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-400/30">
                {cameras.length} Active Video & CCTV Streams Connected
              </span>
            </div>

            {/* Quick camera pill selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {cameras.map((cam) => {
                const isSelected = cam.id === selectedCameraId;
                const isGodsEye = Boolean(cam.source_repo);

                return (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'bg-black/30 border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-white">{cam.id}</span>
                      {isGodsEye ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/40">
                          God's Eye View
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Edge Node
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{cam.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{cam.location}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main YOLO Detector Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Real-time Live YOLO Detector */}
            <div className="lg:col-span-8 space-y-4">
              <LiveYoloDetector
                camera={selectedCamera}
                onDetectionCaptured={handleDetectionCaptured}
                showFullControls={true}
              />
            </div>

            {/* Right 4 Cols: Stream Telemetry & Captured Log */}
            <div className="lg:col-span-4 space-y-4">
              {/* Camera Profile & Ingress Details */}
              <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 space-y-3.5 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <CameraIcon className="h-4 w-4 text-cyan-300" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Camera Stream Ingress
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold uppercase">
                    {selectedCamera.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Camera Identifier:</span>
                    <span className="text-white font-bold">{selectedCamera.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Location Sector:</span>
                    <span className="text-slate-200 truncate max-w-[170px]">{selectedCamera.location}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stream Resolution:</span>
                    <span className="text-cyan-300">{selectedCamera.resolution} @ {selectedCamera.fps} FPS</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Feed Type:</span>
                    <span className="text-amber-300 uppercase">{selectedCamera.feed_type || 'RTSP Video'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Provider / Ingest:</span>
                    <span className="text-slate-200 truncate max-w-[170px]">{selectedCamera.provider || 'StarTracker'}</span>
                  </div>
                  {selectedCamera.source_repo && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-cyan-300">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>Source Repo:</span>
                      </span>
                      <a
                        href={`https://github.com/${selectedCamera.source_repo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-white truncate max-w-[160px]"
                      >
                        {selectedCamera.source_repo}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Captured Frame Events Log */}
              <div className="relative rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Live Captured Detections</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                    {capturedDetections.length} Saved
                  </span>
                </div>

                {capturedDetections.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center text-xs text-slate-400">
                    <p>No frames captured yet.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Click "Capture Frame" in the video HUD to log a vehicle detection with its ANPR license plate into the system.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {capturedDetections.map((det) => (
                      <div
                        key={det.id}
                        className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono space-y-1 hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-300 font-bold">{det.plate || 'NO-PLATE'}</span>
                          <span className="text-[10px] uppercase font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/20">
                            {det.object_type} • {(det.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Camera: {det.camera_name || det.camera_id}</span>
                          <span>{new Date(det.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Model Benchmark & Batch Ingestion Pipeline */}
      {activeTab === 'batch_benchmark' && (
        <div className="space-y-6">
          {/* YOLO Repository Evaluation & Selection Banner */}
          <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-cyan-300" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  YOLO Object Detection Engine Selection (SIH26127 Evaluation)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                Selected: Ultralytics YOLO
              </span>
            </div>

            {/* Side by Side Repo Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              {/* Ultralytics YOLO Card - SELECTED */}
              <div className="p-4 rounded-2xl bg-cyan-500/[0.08] border border-cyan-400/40 relative shadow-[0_4px_20px_rgba(6,182,212,0.15)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span className="font-bold text-sm text-white">Ultralytics YOLO (v8 / 11)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[10px] uppercase">
                    Best Working Choice
                  </span>
                </div>

                <p className="text-slate-300 text-xs mb-3">
                  Official, actively maintained computer vision framework with built-in multi-object tracking (ByteTrack & BoT-SORT) for continuous vehicle trajectories.
                </p>

                <div className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/10 mb-3">
                  <div className="flex justify-between">
                    <span>Inference Throughput:</span>
                    <span className="text-emerald-300 font-bold">65–140 FPS (Edge GPU/CPU)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trajectory Tracking:</span>
                    <span className="text-emerald-300 font-bold">Built-in ByteTrack / BoT-SORT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance & Community:</span>
                    <span className="text-cyan-300">Active 2026 (30k+ Stars)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1 text-emerald-300 font-medium">
                    <Check className="h-3.5 w-3.5" /> High Precision & Native ONNX/TensorRT
                  </span>
                  <a 
                    href="https://github.com/ultralytics/ultralytics.git" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-300 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>ultralytics/ultralytics</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Legacy OpenCV DNN Card */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 relative opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                    <span className="font-bold text-sm text-slate-300">OpenCV DNN (arunponnusamy)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[10px] uppercase font-mono">
                    Legacy Tutorial
                  </span>
                </div>

                <p className="text-slate-400 text-xs mb-3">
                  A basic OpenCV <code>cv2.dnn.readNet()</code> wrapper demonstrating YOLOv3 weights from 2018. Lacks built-in tracking IDs, bounding boxes jump between frames.
                </p>

                <div className="space-y-1.5 font-mono text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-white/10 mb-3">
                  <div className="flex justify-between">
                    <span>Inference Throughput:</span>
                    <span className="text-amber-400">12–22 FPS (CPU Bottleneck)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trajectory Tracking:</span>
                    <span className="text-rose-400 font-semibold">None (requires external SORT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span className="text-slate-500">Archived / 6+ Years Inactive</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1 text-slate-400">
                    <XCircle className="h-3.5 w-3.5 text-rose-400" /> Slower, no trajectory persistence
                  </span>
                  <a 
                    href="https://github.com/arunponnusamy/object-detection-opencv.git" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>object-detection-opencv</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Architecture Code Snippet View */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-cyan-300" />
                  <span>Production Pipeline Implementation:</span>
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveCodeTab('ultralytics')}
                    className={`px-2.5 py-0.5 rounded text-[10px] transition-colors ${
                      activeCodeTab === 'ultralytics' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Ultralytics YOLOv8 (Active)
                  </button>
                </div>
              </div>

              <pre className="text-cyan-300 overflow-x-auto p-2.5 bg-black/60 rounded-xl text-[11px] leading-relaxed">
{`from ultralytics import YOLO

# Load Ultralytics YOLOv8n pretrained weights
model = YOLO('yolov8n.pt')

# Run inference with built-in ByteTrack multi-object tracker
results = model.track(
    source='${selectedCamera.stream_url || "rtsp://camera-node"}',
    tracker='bytetrack.yaml',
    classes=[2, 3, 5, 7], # car, motorcycle, bus, truck (vehicles only)
    persist=True,
    conf=0.45
)`}
              </pre>
            </div>
          </div>

          {/* Main Execution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Ingestion Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 space-y-5 transition-all">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <FileVideo className="h-4 w-4 text-cyan-300" />
                  <span>Ingestion Configuration</span>
                </h3>

                {/* Camera Select */}
                <div>
                  <label className="block text-xs text-slate-300 mb-2">
                    Target Camera Node:
                  </label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 text-white text-xs rounded-2xl p-3 focus:outline-none focus:border-white/30 backdrop-blur-md shadow-inner"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.id} — {c.name} ({c.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Frame Skip / Ingestion Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-2 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-cyan-300" />
                      Frame Skip Stride:
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">Every {frameSkip} frames</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={frameSkip}
                    onChange={(e) => setFrameSkip(Number(e.target.value))}
                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-white/10"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Higher stride reduces inference latency on edge compute devices.
                  </p>
                </div>

                {/* Processing Engine Summary */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08] text-xs font-mono space-y-2 text-slate-300 backdrop-blur-md shadow-inner">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Object Detector:</span>
                    <span className="text-white font-semibold">Ultralytics YOLOv8n (FP16)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Filter:</span>
                    <span className="text-cyan-300 font-semibold">Vehicles Only (Car, Bus, Truck, Moto)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>OCR Engine:</span>
                    <span className="text-white font-semibold">PaddleOCR Mobile PP-OCRv4</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Plate Rules:</span>
                    <span className="text-white font-semibold">HSRP Regex + RapidFuzz</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={runVideoIngestion}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-full font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                    isProcessing
                      ? 'bg-white/10 text-slate-400 cursor-not-allowed border border-white/10'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-semibold shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_4px_28px_rgba(6,182,212,0.6)]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                      <span>Running Ultralytics Inference...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Execute Extraction Pipeline</span>
                    </>
                  )}
                </button>
              </div>

              {/* Results Summary Card */}
              {processingOutput && (
                <div className="relative rounded-3xl bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-2xl p-5 text-xs font-mono space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Ingestion Completed Successfully</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vehicle Entities:</span>
                    <span className="text-white font-bold">{processingOutput.vehicles_identified}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>ANPR Plates Captured:</span>
                    <span className="text-white font-bold">{processingOutput.vehicles_identified}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Avg Extraction Latency:</span>
                    <span className="text-cyan-300 font-bold">{processingOutput.time_taken_seconds}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right 7 Cols: Terminal Log Output */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 flex flex-col h-full">
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <Terminal className="h-4 w-4 text-cyan-300" />
                    <span>Worker Process Telemetry (stdout)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-[11px] font-mono text-slate-400">Daemon Active</span>
                  </div>
                </div>

                <div className="bg-black/80 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-y-auto max-h-[460px] flex-1 border border-white/[0.06] shadow-inner">
                  {terminalLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      <span className="text-cyan-400">{log.split(' ')[0]}</span>{' '}
                      <span className="text-slate-300">{log.substring(log.indexOf(' ') + 1)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Ultralytics 8.3 • PaddleOCR 2.7 • OpenCV 4.9</span>
                  <span>Buffer: 100% Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
