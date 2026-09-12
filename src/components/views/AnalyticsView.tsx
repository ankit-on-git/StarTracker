import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, Sparkles, ArrowUpRight } from 'lucide-react';
import { AnalyticsSummary } from '../../types/startracker';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const hourlyData = analytics?.hourly_traffic || [
    { hour: '06:00', vehicles: 140, average_speed: 48 },
    { hour: '08:00', vehicles: 420, average_speed: 34 },
    { hour: '10:00', vehicles: 680, average_speed: 28 },
    { hour: '12:00', vehicles: 510, average_speed: 32 },
    { hour: '14:00', vehicles: 460, average_speed: 36 },
    { hour: '16:00', vehicles: 720, average_speed: 26 },
    { hour: '18:00', vehicles: 890, average_speed: 22 },
    { hour: '20:00', vehicles: 580, average_speed: 35 },
    { hour: '22:00', vehicles: 230, average_speed: 45 },
  ];

  const vehicleClassData = [
    { name: 'Cars / Sedans', count: 4, fill: '#38bdf8' },
    { name: 'Buses', count: 1, fill: '#bef264' },
    { name: 'Trucks', count: 1, fill: '#facc15' },
    { name: 'Motorcycles', count: 1, fill: '#fb7185' },
  ];

  const colorDistributionData = [
    { name: 'Red', count: 2, fill: '#fb7185' },
    { name: 'White', count: 1, fill: '#f8fafc' },
    { name: 'Silver', count: 1, fill: '#94a3b8' },
    { name: 'Blue', count: 1, fill: '#38bdf8' },
    { name: 'Black', count: 1, fill: '#64748b' },
    { name: 'Yellow', count: 1, fill: '#facc15' },
  ];

  const cameraActivityData = analytics?.camera_activity || [
    { name: 'CAM-01', detections: 342, speed_avg: 41 },
    { name: 'CAM-02', detections: 489, speed_avg: 45 },
    { name: 'CAM-03', detections: 512, speed_avg: 36 },
    { name: 'CAM-04', detections: 280, speed_avg: 33 },
    { name: 'CAM-05', detections: 198, speed_avg: 47 },
    { name: 'CAM-06', detections: 410, speed_avg: 29 },
  ];

  // 3D Glass volumetric pill activity bars (like in the reference image)
  const daysOfWeekActivity = [
    { day: 'Mon', hours: 42, active: false, height: '48%' },
    { day: 'Tue', hours: 55, active: false, height: '62%' },
    { day: 'Wed', hours: 38, active: false, height: '42%' },
    { day: 'Thu', hours: 78, active: false, height: '84%' },
    { day: 'Fri', hours: 94, active: true, height: '100%' },
    { day: 'Sat', hours: 64, active: false, height: '70%' },
    { day: 'Sun', hours: 82, active: false, height: '88%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header in Liquid Glass */}
      <div className="relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 flex items-center justify-between transition-all">
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-300" />
            <span>Urban Traffic Analytics & Camera Workload</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time flow telemetry, congestion patterns, and vehicle distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.08] text-slate-200 border border-white/10 backdrop-blur-md">
            Last 7 days
          </span>
        </div>
      </div>

      {/* Row 1: Hourly Flow & 3D Volumetric Activity Pill Bars (Ref Image Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-8 relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-300" />
                <span>Diurnal Traffic Ingress (Vehicles / Hour)</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">Aggregated across all CCTV corridor nodes</p>
            </div>
            <span className="text-xs font-medium text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full">
              Peak: 18:00 (890 vph)
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(16px)',
                    fontSize: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="vehicles"
                  name="Vehicles"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#38bdf8' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="average_speed"
                  name="Avg Speed (km/h)"
                  stroke="#facc15"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#facc15' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3D Glass Pill Activity Bar Card (Matching User Reference Image!) */}
        <div className="lg:col-span-4 relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Activity</span>
              <span className="text-[11px] text-slate-400 bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/10">
                last 7 days
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold tracking-tight text-white">24,9</span>
              <span className="text-xs text-slate-400">Hours tracked</span>
            </div>

            {/* Glowing active badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-medium border border-cyan-400/30 mb-6">
              <span>+4.2 hours today</span>
            </div>

            {/* 3D Volumetric Rounded Glass Bars (Exact reproduction of image archetype) */}
            <div className="h-36 flex items-end justify-between gap-2 px-1 mb-2">
              {daysOfWeekActivity.map((item) => (
                <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      style={{ height: item.height }}
                      className={`w-full max-w-[28px] rounded-full transition-all duration-500 shadow-md ${
                        item.active
                          ? 'bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.6)] border border-white'
                          : 'bg-white/[0.12] hover:bg-white/[0.2] border border-white/[0.1] shadow-inner'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] mt-2 transition-colors ${item.active ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span>Peak Day: Friday</span>
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              <span>Optimal flow</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Camera Ingestion Load & Color Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Camera Load Chart */}
        <div className="lg:col-span-7 relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-300" />
                <span>Camera Detection Density</span>
              </h3>
              <p className="text-xs text-slate-400">Total detections handled per node</p>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cameraActivityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(16px)',
                    fontSize: 12 
                  }}
                />
                <Bar dataKey="detections" fill="#38bdf8" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Classification & Color Spectrum in Liquid Glass */}
        <div className="lg:col-span-5 relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.22)] p-5 transition-all">
          <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2 mb-1">
            <PieIcon className="h-4 w-4 text-cyan-300" />
            <span>HSV Vehicle Color Distribution</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-sans">Autonomous Color Classification Breakdown</p>

          <div className="space-y-3 text-xs">
            {colorDistributionData.map((color) => (
              <div key={color.name}>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: color.fill }}></span>
                    <span className="font-medium">{color.name}</span>
                  </span>
                  <span className="text-slate-400">{color.count} vehicles</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.08] shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(color.count / 7) * 100}%`,
                      backgroundColor: color.fill,
                      boxShadow: `0 0 10px ${color.fill}80`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
