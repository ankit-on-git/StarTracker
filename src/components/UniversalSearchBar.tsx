import React, { useState } from 'react';
import { Search, X, Sparkles, Car, Truck, Hash } from 'lucide-react';
import { ThemeMode } from '../types/theme';

interface UniversalSearchBarProps {
  onSearch: (query: string) => void;
  currentQuery?: string;
  className?: string;
  themeMode?: ThemeMode;
}

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  onSearch,
  currentQuery = '',
  className = '',
  themeMode = 'dark',
}) => {
  const [inputValue, setInputValue] = useState(currentQuery);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleChipClick = (chipQuery: string) => {
    setInputValue(chipQuery);
    onSearch(chipQuery);
  };

  const clearInput = () => {
    setInputValue('');
  };

  const sampleChips = [
    { label: 'PB10AB1234', icon: Hash, query: 'PB10AB1234', category: 'Plate', accent: 'border-cyan-500/30 text-cyan-300' },
    { label: 'red car', icon: Car, query: 'red car', category: 'Vehicle', accent: 'border-rose-500/30 text-rose-300' },
    { label: 'yellow truck', icon: Truck, query: 'yellow truck', category: 'Heavy', accent: 'border-amber-500/30 text-amber-300' },
    { label: 'PB10CZ8899', icon: Hash, query: 'PB10CZ8899', category: 'SUV', accent: 'border-emerald-500/30 text-emerald-300' },
    { label: 'white vehicle', icon: Car, query: 'white vehicle', category: 'Vehicle', accent: 'border-slate-300/30 text-slate-200' },
  ];

  const isLight = themeMode === 'light';

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleFormSubmit} className="relative">
        <div className={`relative flex items-center rounded-full backdrop-blur-2xl transition-all duration-300 overflow-hidden p-1.5 ${
          isLight
            ? 'bg-white/80 hover:bg-white/95 focus-within:bg-white border border-slate-300/80 shadow-[0_12px_32px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)]'
            : 'bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.09] border border-white/[0.14] focus-within:border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]'
        }`}>
          <div className="pl-4 pr-1 flex items-center justify-center">
            <Search className={`h-4.5 w-4.5 ${isLight ? 'text-cyan-600' : 'text-cyan-300'}`} />
          </div>

          <input
            id="universal-search-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search vehicle plate, class or color (e.g. PB10AB1234, red car, yellow truck)..."
            className={`w-full py-2.5 px-3 bg-transparent text-sm focus:outline-none font-sans ${
              isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-400/80'
            }`}
          />

          <div className="flex items-center gap-1.5 pr-1">
            {inputValue && (
              <button
                type="button"
                onClick={clearInput}
                className={`p-1.5 rounded-full transition-colors ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              id="universal-search-submit"
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-[0_4px_16px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/20 flex items-center gap-1.5 active:scale-95"
            >
              <span>Track</span>
            </button>
          </div>
        </div>
      </form>

      {/* Glass Suggestion Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <div className={`flex items-center gap-1.5 text-[11px] font-medium pl-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          <Sparkles className="h-3.5 w-3.5 text-lime-400" />
          <span>Quick queries:</span>
        </div>
        {sampleChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.query}
              type="button"
              onClick={() => handleChipClick(chip.query)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 text-xs backdrop-blur-md ${
                isLight
                  ? 'bg-white/80 hover:bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-slate-900'
                  : `bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.1] hover:border-white/25 text-slate-300 hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${chip.accent}`
              }`}
            >
              <Icon className="h-3 w-3 opacity-80" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
