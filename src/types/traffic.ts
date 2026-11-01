export type VehicleType = 'car' | 'motorcycle' | 'bus' | 'truck' | 'bicycle';

export type ViolationType = 
  | 'no_helmet'
  | 'speed_violation'
  | 'red_light_stopline'
  | 'wrong_way'
  | 'illegal_lane_change';

export type ReviewStatus = 'pending' | 'confirmed' | 'dismissed' | 'manual_verification';

export type SeverityLevel = 'high' | 'medium' | 'low';

export interface BoundingBox {
  x: number; // percentage 0-100 or normalized
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  id: string;
  trackingId: number;
  frameNumber: number;
  timestampSeconds: number;
  box: BoundingBox;
  vehicleType: VehicleType;
  confidence: number;
  speedKmH?: number;
  isSpeeding?: boolean;
  hasHelmet?: boolean | null;
  licensePlate?: string;
  plateConfidence?: number;
  violations: ViolationType[];
}

export interface ReviewAuditEntry {
  id: string;
  timestamp: string;
  reviewerName: string;
  previousStatus: ReviewStatus;
  newStatus: ReviewStatus;
  notes: string;
}

export interface ViolationRecord {
  id: string;
  incidentCode: string;
  cameraLocation: string;
  cameraId: string;
  timestampSeconds: number;
  recordedAt: string;
  vehicleType: VehicleType;
  trackingId: number;
  violationType: ViolationType;
  severity: SeverityLevel;
  confidence: number;
  licensePlate: string;
  plateConfidence: number;
  estimatedSpeed?: number;
  speedLimit?: number;
  reviewStatus: ReviewStatus;
  reviewerNotes?: string;
  auditTrail: ReviewAuditEntry[];
  evidenceSnapshotUrl: string;
  plateCropUrl?: string;
  vehicleCropUrl?: string;
  aiExplanation: string;
  calibrationStatus: 'calibrated' | 'uncalibrated';
}

export interface CameraSource {
  id: string;
  name: string;
  location: string;
  ipStreamUrl: string;
  status: 'online' | 'degraded' | 'offline';
  fps: number;
  resolution: string;
  speedLimitKmH: number;
  calibrationStatus: 'calibrated' | 'needs_calibration';
  activeRules: ViolationType[];
  videoThumbnail: string;
  videoUrl?: string;
  sampleVideoType: 'highway' | 'intersection' | 'junction';
}

export interface SystemStats {
  totalVehiclesDetected: number;
  totalViolations: number;
  helmetViolations: number;
  speedViolations: number;
  uniqueVehicles: number;
  processingFps: number;
  backendConnected: boolean;
}
