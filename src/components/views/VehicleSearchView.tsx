import React from 'react';
import { Search, Car, AlertCircle } from 'lucide-react';
import { UniversalSearchResponse, TrajectoryPoint, Camera } from '../../types/startracker';
import { VehicleResultCard } from '../VehicleResultCard';

interface VehicleSearchViewProps {
  searchResult: UniversalSearchResponse | null;
  searchQuery: string;
  onSearch: (q: string) => void;
  onPlotOnMap: (points: TrajectoryPoint[]) => void;
  onSelectCamera: (cam: Camera) => void;
  cameras: Camera[];
}

export const VehicleSearchView: React.FC<VehicleSearchViewProps> = ({
  searchResult,
  searchQuery,
  onSearch,
  onPlotOnMap,
  onSelectCamera,
  cameras,
}) => {
  return (
    <div className="space-y-6">
      {/* Header & Filter Context in Liquid Glass */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-300" />
              <span>Vehicle & Plate Trajectory Tracking Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Query: <strong className="text-cyan-300 font-mono">"{searchQuery || 'PB10AB1234'}"</strong> • Mode:{' '}
              <span className="text-slate-200 uppercase font-mono">{searchResult?.query_type || 'ANPR PLATE'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-full text-slate-300 backdrop-blur-md">
              Vehicles Found: <strong className="text-emerald-300 font-semibold">{searchResult?.total_results || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {searchResult && searchResult.total_results > 0 ? (
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
      ) : (
        <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] p-12 text-center shadow-lg">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Vehicle Match Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No active detection records matched the specified vehicle query. Try searching for sample plates or vehicle attributes like{' '}
            <button onClick={() => onSearch('PB10AB1234')} className="text-cyan-300 underline font-medium">PB10AB1234</button>,{' '}
            <button onClick={() => onSearch('red car')} className="text-cyan-300 underline font-medium">red car</button>,{' '}
            <button onClick={() => onSearch('white vehicle')} className="text-cyan-300 underline font-medium">white vehicle</button>, or{' '}
            <button onClick={() => onSearch('yellow truck')} className="text-cyan-300 underline font-medium">yellow truck</button>.
          </p>
        </div>
      )}
    </div>
  );
};
