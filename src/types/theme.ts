export type ThemeMode = 'dark' | 'light' | 'cyber';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  iconName: string;
  bgClass: string;
  textClass: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  navBg: string;
  inputBg: string;
  pillActive: string;
  basemapType: 'voyager' | 'dark' | 'light';
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Obsidian Glass',
    iconName: 'Moon',
    bgClass: 'bg-[#090b10] text-slate-100',
    textClass: 'text-slate-100',
    cardBg: 'bg-white/[0.05] hover:bg-white/[0.07]',
    cardBorder: 'border-white/[0.14]',
    cardShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)]',
    navBg: 'bg-white/[0.07] border-white/[0.15]',
    inputBg: 'bg-black/35 border-white/[0.12]',
    pillActive: 'bg-white/[0.2] text-white border-white/30',
    basemapType: 'dark',
  },
  light: {
    id: 'light',
    name: 'Crystal Glass',
    iconName: 'Sun',
    bgClass: 'bg-[#f0f4f9] text-slate-900',
    textClass: 'text-slate-900',
    cardBg: 'bg-white/75 hover:bg-white/85',
    cardBorder: 'border-slate-200/80',
    cardShadow: 'shadow-[0_16px_36px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)]',
    navBg: 'bg-white/80 border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.06)]',
    inputBg: 'bg-white/80 border-slate-300/80',
    pillActive: 'bg-slate-900 text-white shadow-md',
    basemapType: 'voyager',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon Glass',
    iconName: 'Sparkles',
    bgClass: 'bg-[#070919] text-slate-100',
    textClass: 'text-slate-100',
    cardBg: 'bg-indigo-950/25 hover:bg-indigo-950/35',
    cardBorder: 'border-cyan-500/25',
    cardShadow: 'shadow-[0_20px_50px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.25)]',
    navBg: 'bg-slate-900/60 border-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
    inputBg: 'bg-slate-950/70 border-cyan-500/30',
    pillActive: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    basemapType: 'voyager',
  },
};
