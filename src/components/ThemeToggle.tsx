import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sparkles, Palette, Check } from 'lucide-react';
import { ThemeMode, THEMES } from '../types/theme';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onSelectTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeIcons: Record<ThemeMode, React.ReactNode> = {
    dark: <Moon className="h-4 w-4 text-cyan-300" />,
    light: <Sun className="h-4 w-4 text-amber-500" />,
    cyber: <Sparkles className="h-4 w-4 text-fuchsia-400" />,
  };

  const currentConfig = THEMES[currentTheme];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Liquid Glass Theme Switcher Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.18] shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl transition-all duration-300 group"
        title="Change Visual Theme"
        aria-label="Change Theme"
      >
        <span className="transition-transform group-hover:rotate-12 duration-300">
          {themeIcons[currentTheme]}
        </span>
        <span className="hidden sm:inline text-xs font-medium tracking-tight">
          {currentConfig.name.split(' ')[0]}
        </span>
        <Palette className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Floating Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/10 mb-1">
            Visual Themes
          </div>

          {(Object.keys(THEMES) as ThemeMode[]).map((themeKey) => {
            const config = THEMES[themeKey];
            const isSelected = currentTheme === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => {
                  onSelectTheme(themeKey);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white/20 text-white shadow-inner font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {themeIcons[themeKey]}
                  <span>{config.name}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-cyan-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
