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
import { 
  HOURLY_TRAFFIC_DATA, 
  VIOLATION_CATEGORIES_DATA, 
  VEHICLE_DISTRIBUTION_DATA 
} from '../data/trafficData';
import { ViolationRecord } from '../types/traffic';

interface AnalyticsViewProps {
  violations: ViolationRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ violations }) => {
  // Compute violations by camera
  const cameraCounts: Record<string, number> = {};
  violations.forEach((v) => {
    cameraCounts[v.cameraId] = (cameraCounts[v.cameraId] || 0) + 1;
  });

  const cameraData = Object.entries(cameraCounts).map(([name, count]) => ({
    name,
    violations: count,
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#dc2626', '#7c3aed', '#3b82f6'];

  return (
    <div className="space-y-5">
      {/* Top row: Hourly Traffic & Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hourly Traffic Flow & Violations */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Hourly Traffic Volume vs. Detected Violations
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated 24-hour vehicle counts across all monitored junction corridors
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vehicles" 
                  name="Vehicles" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="violations" 
                  name="Violations" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-500 rounded-full" />
              <span>Traffic Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 rounded-full" />
              <span>Violations Detected</span>
            </div>
          </div>
        </div>

        {/* Violations Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Violation Categories Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of infractions recorded by the AI rules engine
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VIOLATION_CATEGORIES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" interval={0} angle={-10} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Violations" radius={[4, 4, 0, 0]}>
                  {VIOLATION_CATEGORIES_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] text-slate-500 mt-2 font-mono">
            Most frequent infraction: Speed Violations (+48% during peak hours)
          </div>
        </div>
      </div>

      {/* Bottom row: Vehicle Distribution & Camera Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vehicle Classification Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Detected Vehicle Class Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Classification counts from YOLOv11 Multi-Class Object Detector
          </p>

          <div className="space-y-3">
            {VEHICLE_DISTRIBUTION_DATA.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-900 font-mono font-semibold tabular-nums">
                    {item.count.toLocaleString()} ({item.percentage})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: item.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Violations by Camera Location */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
              Violations by Monitored Junction
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time incident density per camera sensor installation
            </p>

            <div className="space-y-3">
              {cameraData.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 font-mono">{item.name}</span>
                    <p className="text-[11px] text-slate-500">
                      {item.name === 'CAM-112' ? 'Downtown Main & Broadway 4-Way' : 
                       item.name === 'CAM-14B' ? 'Arterial Road South Expressway' : 'West Corridor Transit Overpass'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {item.violations}
                    </span>
                    <span className="text-[10px] text-slate-500 block">incidents</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            Camera 112 accounts for 58% of all speeding detections due to high speed limit delta.
          </div>
        </div>
      </div>
    </div>
  );
};
