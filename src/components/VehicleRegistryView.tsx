import React, { useState } from 'react';
import { Car, Search, AlertTriangle, ShieldCheck, Clock, Eye } from 'lucide-react';
import { ViolationRecord } from '../types/traffic';

interface VehicleRegistryViewProps {
  violations: ViolationRecord[];
  onSelectViolation: (record: ViolationRecord) => void;
}

export const VehicleRegistryView: React.FC<VehicleRegistryViewProps> = ({
  violations,
  onSelectViolation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group violations by trackingId/plate
  const vehicleMap: Record<string, {
    trackingId: number;
    plate: string;
    vehicleType: string;
    incidents: ViolationRecord[];
    maxSpeed: number;
    lastSeen: string;
  }> = {};

  violations.forEach((v) => {
    const key = v.licensePlate || `ID-${v.trackingId}`;
    if (!vehicleMap[key]) {
      vehicleMap[key] = {
        trackingId: v.trackingId,
        plate: v.licensePlate || 'NO PLATE',
        vehicleType: v.vehicleType,
        incidents: [],
        maxSpeed: v.estimatedSpeed || 0,
        lastSeen: v.recordedAt,
      };
    }
    vehicleMap[key].incidents.push(v);
    if ((v.estimatedSpeed || 0) > vehicleMap[key].maxSpeed) {
      vehicleMap[key].maxSpeed = v.estimatedSpeed || 0;
    }
  });

  const vehicleList = Object.values(vehicleMap).filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return v.plate.toLowerCase().includes(term) || 
           v.vehicleType.toLowerCase().includes(term) ||
           String(v.trackingId).includes(term);
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Tracked Vehicle Registry & Recidivism Catalog
          </h2>
          <p className="text-xs text-slate-500">
            Persistent entity records synthesized from ByteTrack tracking trajectories and OCR matches
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by license plate or track ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <th className="py-3 px-4">Tracking ID</th>
              <th className="py-3 px-4">License Plate</th>
              <th className="py-3 px-4">Vehicle Category</th>
              <th className="py-3 px-4">Violations Logged</th>
              <th className="py-3 px-4">Max Recorded Speed</th>
              <th className="py-3 px-4">Last Detected At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {vehicleList.map((veh) => (
              <tr key={veh.trackingId} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">
                  #{veh.trackingId}
                </td>
                <td className="py-3 px-4">
                  <span className="bg-slate-100 font-bold text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {veh.plate}
                  </span>
                </td>
                <td className="py-3 px-4 capitalize font-sans text-slate-700">
                  {veh.vehicleType}
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    {veh.incidents.length} Infraction{veh.incidents.length > 1 ? 's' : ''}
                  </span>
                </td>
                <td className="py-3 px-4 tabular-nums text-slate-700">
                  {veh.maxSpeed > 0 ? `${veh.maxSpeed} km/h` : 'N/A'}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {veh.lastSeen}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onSelectViolation(veh.incidents[0])}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-sans font-medium transition-colors inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>View Dossier</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
