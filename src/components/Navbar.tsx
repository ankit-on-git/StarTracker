import React from 'react';
import { 
  Radio, 
  Video, 
  Search, 
  Route, 
  BarChart3, 
  Cpu, 
  LayoutDashboard,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeMode } from '../types/theme';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTheme?: ThemeMode;
  onSelectTheme?: (theme: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  currentTheme = 'dark',
  onSelectTheme = () => {},
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehicle Search', icon: Search },
    { id: 'trajectories', label: 'Trajectories', icon: Route },
    { id: 'analytics', label: 'Urban Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all">
      <div className="relative rounded-full backdrop-blur-2xl bg-white/[0.06] hover:bg-white/[0.08] border border-white/[0.15] shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] px-4 sm:px-5 py-2.5 flex items-center justify-between transition-all">
        
        {/* Subtle top edge liquid reflection */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Logo & Clean Apple-style Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500/30 via-white/20 to-lime-400/20 border border-white/30 backdrop-blur-xl flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105">
              <Radio className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight group-hover:opacity-90 transition-opacity">
                StarTracker
              </span>
            </div>
          </button>
        </div>

        {/* Center Floating Glass Capsule Navigation (Apple UI Style) */}
        <nav className="hidden md:flex items-center gap-1 bg-black/25 backdrop-blur-xl border border-white/[0.08] p-1 rounded-full shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/[0.22] shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/[0.25]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Section */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-black/30 border border-white/[0.08] px-3 py-1.5 rounded-full backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px] text-slate-300 font-medium">AI Active</span>
          </div>
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="md:hidden mt-2 flex overflow-x-auto rounded-2xl border border-white/[0.1] px-2 py-1.5 bg-black/40 backdrop-blur-2xl scrollbar-none gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap rounded-full text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-white/[0.25] text-white border border-white/20 shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
