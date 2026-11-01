import React from 'react';
import { 
  Car, 
  AlertTriangle, 
  HardHat, 
  Gauge, 
  Fingerprint, 
  Activity,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { SystemStats } from '../types/traffic';

interface OverviewCardsProps {
  stats: SystemStats;
  backendConnected: boolean;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats, backendConnected }) => {
  const cards = [
    {
      label: 'Total Vehicles Detected',
      value: stats.totalVehiclesDetected.toLocaleString(),
      subtext: '+12.4% vs last hour',
      icon: Car,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Recorded Violations',
      value: stats.totalViolations.toLocaleString(),
      subtext: '4 pending manual verification',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Helmet Violations',
      value: stats.helmetViolations.toLocaleString(),
      subtext: 'Two-wheeler rider ROI',
      icon: HardHat,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Speed Violations',
      value: stats.speedViolations.toLocaleString(),
      subtext: 'Exceeding calibrated threshold',
      icon: Gauge,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Unique Tracked Vehicles',
      value: stats.uniqueVehicles.toLocaleString(),
      subtext: 'ByteTrack Kalman tracking',
      icon: Fingerprint,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Inference Throughput',
      value: `${stats.processingFps.toFixed(1)} FPS`,
      subtext: backendConnected ? 'FastAPI + CUDA TensorRT' : 'Local Browser Client Worker',
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 tracking-tight leading-tight">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="text-xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                <span>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
