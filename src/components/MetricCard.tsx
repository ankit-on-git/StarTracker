import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'blue' | 'purple' | 'lime';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  sublabel,
  icon: Icon,
  accentColor = 'cyan',
  badge,
}) => {
  const colorMap = {
    cyan: {
      glow: 'from-cyan-500/20 to-blue-500/10',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      value: 'text-white',
      dot: 'bg-cyan-400',
    },
    emerald: {
      glow: 'from-emerald-500/20 to-teal-500/10',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      value: 'text-white',
      dot: 'bg-emerald-400',
    },
    amber: {
      glow: 'from-amber-500/20 to-yellow-500/10',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      value: 'text-white',
      dot: 'bg-amber-400',
    },
    blue: {
      glow: 'from-blue-500/20 to-indigo-500/10',
      iconBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      value: 'text-white',
      dot: 'bg-blue-400',
    },
    purple: {
      glow: 'from-purple-500/20 to-pink-500/10',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      value: 'text-white',
      dot: 'bg-purple-400',
    },
    lime: {
      glow: 'from-lime-500/20 to-emerald-500/10',
      iconBg: 'bg-lime-500/20 text-lime-300 border-lime-400/30',
      value: 'text-white',
      dot: 'bg-lime-400',
    },
  };

  const scheme = colorMap[accentColor] || colorMap.cyan;

  return (
    <div
      id={id}
      className="relative p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/[0.14] shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
    >
      {/* Top subtle liquid glass highlight line */}
      <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Subtle ambient colored backlight orb */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${scheme.glow} blur-xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-normal block">
            {label}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight text-white/95`}>
              {value}
            </span>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] ${scheme.iconBg}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 relative z-10">
        <span className="truncate flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${scheme.dot}`} />
          <span>{sublabel}</span>
        </span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.08] text-slate-200 border border-white/10">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
