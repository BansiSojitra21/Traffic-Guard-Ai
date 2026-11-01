import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HardHat, 
  Gauge, 
  ShieldAlert, 
  Clock, 
  ChevronRight,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { ReviewStatus, VehicleType, ViolationRecord, ViolationType } from '../types/traffic';
import { exportViolationsToCSV } from '../lib/exportUtils';

interface ViolationsTableProps {
  violations: ViolationRecord[];
  onSelectViolation: (record: ViolationRecord) => void;
  onUpdateStatus: (id: string, status: ReviewStatus, notes: string) => void;
}

export const ViolationsTable: React.FC<ViolationsTableProps> = ({
  violations,
  onSelectViolation,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [violationTypeFilter, setViolationTypeFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [cameraFilter, setCameraFilter] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState<number>(0.7);

  // Filtered dataset
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchPlate = v.licensePlate?.toLowerCase().includes(term);
        const matchCode = v.incidentCode.toLowerCase().includes(term);
        const matchLoc = v.cameraLocation.toLowerCase().includes(term);
        if (!matchPlate && !matchCode && !matchLoc) return false;
      }

      // Violation type
      if (violationTypeFilter !== 'all' && v.violationType !== violationTypeFilter) {
        return false;
      }

      // Vehicle type
      if (vehicleTypeFilter !== 'all' && v.vehicleType !== vehicleTypeFilter) {
        return false;
      }

      // Review status
      if (reviewStatusFilter !== 'all' && v.reviewStatus !== reviewStatusFilter) {
        return false;
      }

      // Camera
      if (cameraFilter !== 'all' && v.cameraId !== cameraFilter) {
        return false;
      }

      // Confidence
      if (v.confidence < minConfidence) {
        return false;
      }

      return true;
    });
  }, [violations, searchTerm, violationTypeFilter, vehicleTypeFilter, reviewStatusFilter, cameraFilter, minConfidence]);

  const uniqueCameras = Array.from(new Set(violations.map(v => v.cameraId)));

  const handleExport = () => {
    exportViolationsToCSV(filteredViolations, `trafficguard_incidents_${Date.now()}.csv`);
  };

  const formatViolationName = (type: ViolationType) => {
    switch (type) {
      case 'speed_violation': return 'Speed Limit';
      case 'no_helmet': return 'No Helmet';
      case 'red_light_stopline': return 'Stop-Line Crossing';
      case 'wrong_way': return 'Wrong-Way Movement';
      case 'illegal_lane_change': return 'Illegal Lane Change';
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Confirmed</span>;
      case 'dismissed':
        return <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">Dismissed</span>;
      case 'manual_verification':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Verification Req.</span>;
      default:
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">Pending Review</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Table Header and Filters Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Traffic Rule Violation Incidents Log
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredViolations.length} of {violations.length} recorded incidents
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV / Excel</span>
          </button>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Search box */}
          <div className="col-span-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plate, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Violation Type */}
          <div>
            <select
              value={violationTypeFilter}
              onChange={(e) => setViolationTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Violations</option>
              <option value="speed_violation">Speed Limit</option>
              <option value="no_helmet">No Helmet</option>
              <option value="red_light_stopline">Stop-Line</option>
              <option value="wrong_way">Wrong-Way</option>
              <option value="illegal_lane_change">Lane Change</option>
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="bus">Bus</option>
              <option value="truck">Truck</option>
              <option value="bicycle">Bicycle</option>
            </select>
          </div>

          {/* Review Status */}
          <div>
            <select
              value={reviewStatusFilter}
              onChange={(e) => setReviewStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="dismissed">Dismissed</option>
              <option value="manual_verification">Needs Verification</option>
            </select>
          </div>

          {/* Camera Source */}
          <div>
            <select
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Cameras</option>
              {uniqueCameras.map((camId) => (
                <option key={camId} value={camId}>
                  {camId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Incident Code</th>
              <th className="py-3 px-4">License Plate</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Violation Type</th>
              <th className="py-3 px-4">Speed / Limit</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Camera / Timestamp</th>
              <th className="py-3 px-4">Review Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredViolations.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600">No violations match the specified filter criteria</p>
                  <p className="text-[11px] mt-1">Try resetting the filters or lowering the minimum confidence</p>
                </td>
              </tr>
            ) : (
              filteredViolations.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => onSelectViolation(v)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                    {v.incidentCode}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {v.licensePlate || 'NO PLATE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-700">
                    {v.vehicleType} <span className="text-slate-400 font-mono text-[11px]">(#{v.trackingId})</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {formatViolationName(v.violationType)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                    {v.estimatedSpeed ? (
                      <span className={v.estimatedSpeed > (v.speedLimit || 50) ? 'text-red-600 font-semibold' : ''}>
                        {v.estimatedSpeed} / {v.speedLimit} km/h
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700 font-medium">
                    {Math.round(v.confidence * 100)}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    <div>{v.cameraId}</div>
                    <div className="text-slate-400 text-[10px]">t={v.timestampSeconds.toFixed(1)}s</div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(v.reviewStatus)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectViolation(v);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono">
          Compliant with CSV & RFC-4180 export standards · Formula injection sanitized
        </span>
        <span className="font-medium text-slate-700">
          Total Violations Stored: {violations.length}
        </span>
      </div>
    </div>
  );
};
