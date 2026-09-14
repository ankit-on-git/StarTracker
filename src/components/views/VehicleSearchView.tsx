import React, { useState } from 'react';
import { 
  Search, 
  Car, 
  AlertCircle, 
  Database, 
  Play, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  MapPin, 
  Clock, 
  Calendar,
  Plus, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Eye,
  Maximize2,
  Filter
} from 'lucide-react';
import { UniversalSearchResponse, TrajectoryPoint, Camera, SupabaseVehicleDetection } from '../../types/startracker';
import { VehicleResultCard } from '../VehicleResultCard';
import { FootagePlayerModal } from '../FootagePlayerModal';
import { insertDetectionToSupabase } from '../../services/supabase';
import { generateVehicleCctvSnapshot, saveVehicleDetectionToDatabase } from '../../services/snapshotService';

interface VehicleSearchViewProps {
  searchResult: UniversalSearchResponse | null;
  searchQuery: string;
  isSearching?: boolean;
  onSearch: (q: string) => void;
  onPlotOnMap: (points: TrajectoryPoint[]) => void;
  onSelectCamera: (cam: Camera) => void;
  cameras: Camera[];
}

export const VehicleSearchView: React.FC<VehicleSearchViewProps> = ({
  searchResult,
  searchQuery,
  isSearching = false,
  onSearch,
  onPlotOnMap,
  onSelectCamera,
  cameras,
}) => {
  const [selectedFootage, setSelectedFootage] = useState<SupabaseVehicleDetection | null>(null);
  const [inspectedPicture, setInspectedPicture] = useState<SupabaseVehicleDetection | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [insertSuccessMsg, setInsertSuccessMsg] = useState<string | null>(null);

  // Extract supabase detections from response
  const supabaseDetections = searchResult?.supabase_detections || [];
  const queryLower = (searchQuery || '').toLowerCase();
  const isOrangeQuery = queryLower.includes('orange');

  // Helper to handle test insertion of an Orange Car with real generated CCTV snapshot picture
  const handleInsertTestOrangeCar = async () => {
    setIsInserting(true);
    setInsertSuccessMsg(null);
    try {
      const cam = cameras[0] || {
        id: 'CAM-01',
        name: 'Shinjuku Kabukicho Traffic Junction',
        location: 'Shinjuku Central Optical Sentry',
        embed_url: 'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1&playsinline=1&controls=0',
      };

      const plate = `MH12AB${Math.floor(1000 + Math.random() * 9000)}`;
      const snapshot = generateVehicleCctvSnapshot(cam as any, {
        plate_number: plate,
        color: 'Orange',
        object_type: 'car',
        confidence: 0.98,
        speed_kmh: 46,
        location: cam.location || cam.name,
        detected_at: new Date().toISOString(),
      });

      const newDetection: SupabaseVehicleDetection = {
        id: `det-${Date.now()}`,
        plate_number: plate,
        color: 'Orange',
        confidence: 0.98,
        camera_id: cam.id,
        location: cam.location || cam.name,
        object_type: 'car',
        video_url: 'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1&playsinline=1&controls=0',
        thumbnail: snapshot,
        detected_at: new Date().toISOString(),
      };

      await saveVehicleDetectionToDatabase(newDetection);
      setInsertSuccessMsg(`Stored ${newDetection.plate_number} (${newDetection.color} Car) with picture snapshot into database!`);
      
      // Trigger search to refresh view
      setTimeout(() => {
        onSearch(searchQuery || 'orange car');
      }, 500);
    } catch (err) {
      console.error('Failed to insert test detection:', err);
    } finally {
      setIsInserting(false);
    }
  };

  // Helper for formatting date and time clearly
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { date: 'Sep 14, 2026', time: '14:15:32', relative: 'Just now' };
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const time = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Relative calculation
    const diffSec = Math.round((Date.now() - dateObj.getTime()) / 1000);
    let relative = 'Just now';
    if (diffSec > 60 && diffSec < 3600) {
      relative = `${Math.floor(diffSec / 60)} min ago`;
    } else if (diffSec >= 3600) {
      relative = `${Math.floor(diffSec / 3600)} hr ago`;
    }

    return { date, time, relative };
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Context in Liquid Glass */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-cyan-300" />
                <span>Vehicle Detection & Database Search Results</span>
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                <Database className="h-3 w-3" />
                <span>Backend DB + Supabase</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Query: <strong className="text-cyan-300 font-mono">"{searchQuery || 'orange car'}"</strong> • Classification:{' '}
              <span className="text-slate-200 uppercase font-mono">{searchResult?.query_type || 'VEHICLE_ATTRIBUTE'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-full text-slate-300 backdrop-blur-md">
              Matching Records: <strong className="text-emerald-300 font-semibold">{supabaseDetections.length || searchResult?.total_results || 0}</strong>
            </span>

            {/* Quick Demo Insert Button */}
            <button
              onClick={handleInsertTestOrangeCar}
              disabled={isInserting}
              className="px-3.5 py-1.5 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-400/40 font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isInserting ? 'Writing Picture to DB...' : '+ Store Orange Car with Picture'}</span>
            </button>
          </div>
        </div>

        {insertSuccessMsg && (
          <div className="mt-3 py-2 px-3 bg-emerald-500/15 border border-emerald-400/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{insertSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Radar Optical Scanning Loading Animation */}
      {isSearching && (
        <div className="relative rounded-3xl bg-slate-950/70 backdrop-blur-2xl border border-cyan-500/30 p-10 text-center shadow-[0_20px_50px_rgba(6,182,212,0.15)] overflow-hidden animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center justify-center space-y-5">
            {/* Radar Scope Visual */}
            <div className="relative w-36 h-36 rounded-full border border-cyan-400/40 bg-cyan-950/20 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.25)]">
              <div className="absolute w-24 h-24 rounded-full border border-cyan-400/20" />
              <div className="absolute w-12 h-12 rounded-full border border-cyan-400/20" />
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-400/30" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-400/30" />
              <div className="absolute inset-0 rounded-full animate-spin [animation-duration:2.5s] origin-center bg-gradient-to-tr from-transparent via-cyan-400/25 to-transparent pointer-events-none" />
              <div className="absolute top-8 right-9 w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_12px_#fb923c] animate-ping" />
              <div className="absolute top-8 right-9 w-2.5 h-2.5 rounded-full bg-orange-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white font-mono flex items-center justify-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span>FETCHING EVIDENCE RECORDS WITH PICTURES</span>
              </h3>
              <p className="text-xs text-cyan-300/80 font-mono">
                Searching color and license plate matches on backend & Supabase...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Database Stored Detections: Full Cards with Time, Date, Location & Picture */}
      {!isSearching && supabaseDetections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Database Detection Records with Picture & Location ({supabaseDetections.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Click picture for full-resolution snapshot or "Watch Footage" for video playback
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {supabaseDetections.map((det, idx) => {
              const colorStr = (det.color || '').toLowerCase();
              const isColorOrange = colorStr.includes('orange');
              const { date, time, relative } = formatDateTime(det.detected_at);

              return (
                <div
                  key={det.id || idx}
                  className="relative rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] hover:border-cyan-400/40 shadow-xl overflow-hidden transition-all duration-200 group flex flex-col justify-between"
                >
                  {/* Card Media Preview Header (CCTV Picture Snapshot) */}
                  <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
                    {det.thumbnail ? (
                      <img
                        src={det.thumbnail}
                        alt={det.plate_number}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                        <Car className="h-10 w-10" />
                      </div>
                    )}

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Color Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 border ${
                        isColorOrange
                          ? 'bg-orange-500/85 border-orange-300/40 text-slate-950'
                          : 'bg-cyan-500/85 border-cyan-300/40 text-slate-950'
                      }`}>
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="capitalize">{det.color}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/60 text-slate-200 border border-white/20 backdrop-blur-md">
                        {det.object_type || 'CAR'}
                      </span>
                    </div>

                    {/* Camera Node Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/75 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                        {det.camera_id}
                      </span>
                    </div>

                    {/* Inspect Picture Overlay Button */}
                    <button
                      onClick={() => setInspectedPicture(det)}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-slate-950 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                      title="Inspect Snapshot Picture"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Card Content & Telemetry: Time, Date, Location & Plate */}
                  <div className="p-4 space-y-3.5">
                    {/* Plate & Confidence */}
                    <div className="flex items-center justify-between">
                      {/* Indian HSRP License Plate */}
                      <div className="flex items-center bg-white text-slate-950 font-mono font-bold text-xs tracking-wider px-2.5 py-1 rounded-lg border border-white/80 shadow-sm">
                        <span className="mr-1.5 pr-1 border-r border-slate-300 text-[8px] text-blue-900">IND</span>
                        <span>{det.plate_number}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono text-emerald-300 font-bold block">
                          {Math.round(det.confidence * 100)}% Match
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {relative}
                        </span>
                      </div>
                    </div>

                    {/* Date & Time display */}
                    <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1 font-mono text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-cyan-400" />
                          <span>Date:</span>
                        </span>
                        <span className="text-white font-medium">{date}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-cyan-400" />
                          <span>Time:</span>
                        </span>
                        <span className="text-emerald-300 font-semibold">{time}</span>
                      </div>
                    </div>

                    {/* Location display */}
                    <div className="text-xs text-slate-200 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-white block">{det.camera_id}</span>
                        <span className="text-slate-400 text-[11px]">{det.location || 'Urban Traffic Corridor'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setInspectedPicture(det)}
                        className="py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                      >
                        <Eye className="h-3 w-3 text-cyan-300" />
                        <span>View Picture</span>
                      </button>

                      <button
                        onClick={() => setSelectedFootage(det)}
                        className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-cyan-400/40"
                      >
                        <Play className="h-3 w-3 text-cyan-300 fill-current" />
                        <span>Watch CCTV</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trajectory & Chronological Multi-Camera Sightings Results */}
      {!isSearching && searchResult && searchResult.vehicles.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Multi-Camera Trajectory & Route Reconstruction
            </h3>
          </div>

          <div className="space-y-4">
            {searchResult.vehicles.map((vTraj) => (
              <VehicleResultCard
                key={vTraj.vehicle.id}
                trajectoryResult={vTraj}
                onPlotOnMap={onPlotOnMap}
                onOpenLiveFeed={(camId) => {
                  const c = cameras.find((cam) => cam.id === camId);
                  if (c) onSelectCamera(c);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Match State */}
      {!isSearching && (!searchResult || (searchResult.total_results === 0 && supabaseDetections.length === 0)) && (
        <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-12 text-center shadow-lg">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Vehicle Match Found in Database</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No active detection records matched the specified query. Try searching for{' '}
            <button onClick={() => onSearch('orange colour vehicle')} className="text-cyan-300 underline font-medium cursor-pointer">orange colour vehicle</button>,{' '}
            <button onClick={() => onSearch('MH12AB1234')} className="text-cyan-300 underline font-medium cursor-pointer">MH12AB1234</button>,{' '}
            <button onClick={() => onSearch('red car')} className="text-cyan-300 underline font-medium cursor-pointer">red car</button>, or{' '}
            <button onClick={() => onSearch('DL01XY9999')} className="text-cyan-300 underline font-medium cursor-pointer">DL01XY9999</button>.
          </p>
        </div>
      )}

      {/* High-Resolution Picture Inspection Modal */}
      {inspectedPicture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900/95 border border-white/20 rounded-3xl max-w-3xl w-full p-5 space-y-4 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-sm text-white">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>CCTV Optical Picture Evidence • {inspectedPicture.plate_number}</span>
              </div>
              <button
                onClick={() => setInspectedPicture(null)}
                className="text-slate-300 hover:text-white text-xs font-mono px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Close (ESC)
              </button>
            </div>

            {/* Picture Display */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-inner">
              <img
                src={inspectedPicture.thumbnail}
                alt={inspectedPicture.plate_number}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Evidence Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-slate-400 text-[10px] block">License Plate:</span>
                <span className="text-white font-bold text-sm">{inspectedPicture.plate_number}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-slate-400 text-[10px] block">Color & Type:</span>
                <span className="text-orange-300 font-bold text-sm capitalize">{inspectedPicture.color} {inspectedPicture.object_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-slate-400 text-[10px] block">Date & Time:</span>
                <span className="text-emerald-300 font-medium text-xs">
                  {formatDateTime(inspectedPicture.detected_at).date} {formatDateTime(inspectedPicture.detected_at).time}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-slate-400 text-[10px] block">Camera Node:</span>
                <span className="text-cyan-300 font-bold text-xs truncate block">{inspectedPicture.camera_id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedFootage(inspectedPicture);
                  setInspectedPicture(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:from-cyan-400 hover:to-blue-500"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Watch Live CCTV Stream</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Footage Playback Modal */}
      {selectedFootage && (
        <FootagePlayerModal
          detection={selectedFootage}
          onClose={() => setSelectedFootage(null)}
        />
      )}
    </div>
  );
};
