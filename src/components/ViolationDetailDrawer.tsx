import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Printer, 
  Download, 
  Clock, 
  Camera, 
  Gauge, 
  HardHat, 
  ShieldAlert, 
  AlertTriangle,
  History,
  Send
} from 'lucide-react';
import { ReviewStatus, ViolationRecord } from '../types/traffic';

interface ViolationDetailDrawerProps {
  violation: ViolationRecord | null;
  onClose: () => void;
  onUpdateStatus: (violationId: string, newStatus: ReviewStatus, notes: string) => void;
}

export const ViolationDetailDrawer: React.FC<ViolationDetailDrawerProps> = ({
  violation,
  onClose,
  onUpdateStatus,
}) => {
  if (!violation) return null;

  const [notesInput, setNotesInput] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(violation.reviewStatus);

  const handleSaveReview = () => {
    onUpdateStatus(violation.id, selectedStatus, notesInput.trim() || 'Status updated by reviewer.');
    setNotesInput('');
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Confirmed Citation', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'dismissed':
        return { text: 'Dismissed / False Positive', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'manual_verification':
        return { text: 'Needs Manual Verification', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { text: 'Pending Human Review', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
  };

  const currentBadge = getStatusBadge(violation.reviewStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-900">
                {violation.incidentCode}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${currentBadge.color}`}>
                {currentBadge.text}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Incident Evidence & Audit Trail Dossier
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
          {/* Evidence Visuals Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Visual Evidence Crops
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Full Camera Snapshot */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                <div className="relative aspect-video">
                  <img
                    src={violation.evidenceSnapshotUrl}
                    alt="Evidence Frame"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                    Frame Context (t={violation.timestampSeconds}s)
                  </div>
                </div>
                <div className="p-2 text-[10px] text-slate-500 font-mono">
                  Camera: {violation.cameraId}
                </div>
              </div>

              {/* Vehicle / License Plate Crop with OCR text simulation */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col justify-between">
                <div className="p-3 bg-white border-b border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    EasyOCR Plate Extraction
                  </div>
                  <div className="h-10 bg-slate-900 text-amber-400 rounded flex items-center justify-center font-mono font-bold text-base tracking-widest border border-slate-700 shadow-inner">
                    {violation.licensePlate || 'UNIDENTIFIED'}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>OCR Confidence:</span>
                    <span className="font-bold text-slate-800">
                      {Math.round((violation.plateConfidence || 0.85) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-2 text-[10px] text-slate-500 space-y-0.5">
                  <div>Vehicle: <span className="font-semibold text-slate-800 capitalize">{violation.vehicleType}</span></div>
                  <div>ByteTrack ID: <span className="font-mono font-semibold text-slate-800">#{violation.trackingId}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Detection Telemetry */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Detection Telemetry & Calibration
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Violation Type</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {violation.violationType.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Model Confidence</span>
                <span className="font-semibold text-slate-800 font-mono tabular-nums">
                  {(violation.confidence * 100).toFixed(1)}% (YOLOv11 Head)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Estimated Speed</span>
                <span className="font-semibold text-slate-800 font-mono tabular-nums">
                  {violation.estimatedSpeed ? `${violation.estimatedSpeed} km/h (Limit: ${violation.speedLimit} km/h)` : 'N/A (Stationary)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Homography Calibration</span>
                <span className="font-semibold text-emerald-700 font-mono text-[11px]">
                  {violation.calibrationStatus.toUpperCase()} (4-Pt Ground Plane)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Pipeline Reasoning: </span>
              {violation.aiExplanation}
            </div>
          </div>

          {/* Review Decision Workflow */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Human Reviewer Determination
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('confirmed')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                  selectedStatus === 'confirmed'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Confirm Violation</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('dismissed')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                  selectedStatus === 'dismissed'
                    ? 'border-slate-500 bg-slate-100 text-slate-800 font-semibold ring-1 ring-slate-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Dismiss (False Positive)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('manual_verification')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                  selectedStatus === 'manual_verification'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Need Verification</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                  selectedStatus === 'pending'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Reset to Pending</span>
              </button>
            </div>

            {/* Reviewer Notes Field */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-700">
                Audited Reviewer Notes:
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="State technical justification, camera perspective, or dismissal reasoning..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              onClick={handleSaveReview}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Official Review Decision</span>
            </button>
          </div>

          {/* Audit History Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audited Review History
              </h3>
            </div>
            
            <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
              {violation.auditTrail.map((entry) => (
                <div key={entry.id} className="relative text-xs">
                  <div className="w-2 h-2 rounded-full bg-slate-400 absolute -left-[17px] top-1.5" />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700">{entry.reviewerName}</span>
                    <span>{entry.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                    {entry.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Evidence Dossier</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
