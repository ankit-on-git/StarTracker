/**
 * StarTracker - City-Wide AI Traffic Intelligence Platform (SIH26127)
 * Multi-Camera ANPR Trajectory Tracking & Urban Traffic Analytics
 */

import React, { useState, useEffect } from 'react';
import { Camera, Detection, AnalyticsSummary, UniversalSearchResponse, TrajectoryPoint } from './types/startracker';
import { ThemeMode, THEMES } from './types/theme';
import { StarTrackerAPI } from './services/api';

import { Navbar } from './components/Navbar';
import { UniversalSearchBar } from './components/UniversalSearchBar';
import { LiveCameraFeedModal } from './components/LiveCameraFeedModal';

import { OverviewView } from './components/views/OverviewView';
import { CamerasView } from './components/views/CamerasView';
import { VehicleSearchView } from './components/views/VehicleSearchView';
import { TrajectoriesView } from './components/views/TrajectoriesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { VideoIngestView } from './components/views/VideoIngestView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Theme Management with LocalStorage persistence
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('startracker_theme') as ThemeMode;
    return saved && THEMES[saved] ? saved : 'dark';
  });

  const handleThemeChange = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    localStorage.setItem('startracker_theme', theme);
  };

  const [searchQuery, setSearchQuery] = useState<string>('PB10AB1234');
  const [searchResult, setSearchResult] = useState<UniversalSearchResponse | null>(null);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<Camera | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize data
  useEffect(() => {
    async function loadData() {
      try {
        const [cams, dets, anlyt, searchRes] = await Promise.all([
          StarTrackerAPI.getCameras(),
          StarTrackerAPI.getRecentDetections(),
          StarTrackerAPI.getAnalytics(),
          StarTrackerAPI.universalSearch('PB10AB1234'),
        ]);

        setCameras(cams);
        setRecentDetections(dets);
        setAnalytics(anlyt);
        setSearchResult(searchRes);
      } catch (err) {
        console.error('Error loading StarTracker data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const result = await StarTrackerAPI.universalSearch(query);
      setSearchResult(result);
      setActiveTab('vehicles');
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const handlePlotOnMap = (points: TrajectoryPoint[]) => {
    setActiveTab('trajectories');
  };

  const handleCameraAdded = (newCam: Camera) => {
    setCameras((prev) => [newCam, ...prev]);
  };

  const handleCameraDeleted = async (camId: string) => {
    await StarTrackerAPI.deleteCamera(camId);
    setCameras((prev) => prev.filter((c) => c.id !== camId));
  };

  const handleResetCameras = async () => {
    const defaultCams = await StarTrackerAPI.resetCameras();
    setCameras(defaultCams);
  };

  const isLight = currentTheme === 'light';
  const isCyber = currentTheme === 'cyber';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 relative selection:bg-cyan-500 selection:text-slate-950 ${
        isLight
          ? 'bg-[#edf2f7] text-slate-900'
          : isCyber
          ? 'bg-[#060814] text-slate-100'
          : 'bg-[#090b10] text-slate-100'
      }`}
    >
      {/* Dynamic Liquid Glass Background Atmosphere Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {isLight ? (
          <>
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-200/40 via-blue-200/20 to-transparent blur-3xl opacity-70 animate-pulse" />
            <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-indigo-200/30 via-slate-200/30 to-transparent blur-3xl opacity-60" />
            <div className="absolute -bottom-20 left-10 w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-sky-200/40 to-transparent blur-3xl opacity-60" />
          </>
        ) : isCyber ? (
          <>
            <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-fuchsia-600/15 via-purple-700/10 to-transparent blur-[120px] opacity-80" />
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-500/20 via-blue-600/10 to-transparent blur-[120px] opacity-80 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-transparent blur-[100px] opacity-60" />
          </>
        ) : (
          <>
            {/* Obsidian Glass Dark Aura */}
            <div className="absolute -top-36 left-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent blur-[140px] opacity-70" />
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-500/10 via-cyan-600/5 to-transparent blur-[140px] opacity-60" />
            <div className="absolute bottom-0 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-slate-700/15 to-transparent blur-[120px] opacity-50" />
          </>
        )}
      </div>

      {/* Navigation Header */}
      <div className="relative z-50 pt-2">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentTheme={currentTheme}
          onSelectTheme={handleThemeChange}
        />
      </div>

      {/* Main Command Bar Area */}
      <div className={`relative z-40 py-4 transition-colors duration-300 ${
        isLight 
          ? 'bg-white/40 border-b border-slate-200/70 backdrop-blur-xl' 
          : isCyber
          ? 'bg-slate-950/40 border-b border-cyan-500/20 backdrop-blur-xl'
          : 'bg-black/20 border-b border-white/[0.08] backdrop-blur-xl'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UniversalSearchBar
            onSearch={handleSearch}
            currentQuery={searchQuery}
            themeMode={currentTheme}
          />
        </div>
      </div>

      {/* Main App Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            cameras={cameras}
            recentDetections={recentDetections}
            analytics={analytics}
            activeSearchResult={searchResult}
            onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onCameraAdded={handleCameraAdded}
            themeMode={currentTheme}
          />
        )}

        {activeTab === 'cameras' && (
          <CamerasView
            cameras={cameras}
            onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
            onCameraAdded={handleCameraAdded}
            onCameraDeleted={handleCameraDeleted}
            onResetCameras={handleResetCameras}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehicleSearchView
            searchResult={searchResult}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onPlotOnMap={handlePlotOnMap}
            onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
            cameras={cameras}
          />
        )}

        {activeTab === 'trajectories' && (
          <TrajectoriesView
            cameras={cameras}
            defaultTrajectory={searchResult?.vehicles?.[0] || null}
            onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
            themeMode={currentTheme}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} />
        )}

        {activeTab === 'videolab' && (
          <VideoIngestView cameras={cameras} />
        )}
      </main>

      {/* Footer */}
      <footer className={`relative z-10 py-5 text-xs font-mono transition-colors duration-300 ${
        isLight
          ? 'border-t border-slate-200/80 bg-white/60 text-slate-500 backdrop-blur-lg'
          : 'border-t border-white/[0.08] bg-black/40 text-slate-400 backdrop-blur-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight">StarTracker</span>
            <span>•</span>
            <span>SIH26127 Urban Traffic AI</span>
            <span>•</span>
            <span className="text-cyan-400">CARTO Voyager Map API Integrated</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">YOLOv8 + ByteTrack</span>
            <span>PaddleOCR HSRP</span>
            <span>FastAPI Backend</span>
          </div>
        </div>
      </footer>

      {/* Camera Live Feed Modal */}
      {selectedCameraForModal && (
        <LiveCameraFeedModal
          camera={selectedCameraForModal}
          onClose={() => setSelectedCameraForModal(null)}
        />
      )}
    </div>
  );
}
