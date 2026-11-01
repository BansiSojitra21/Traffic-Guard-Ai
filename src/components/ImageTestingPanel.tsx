import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Eye, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  HardHat, 
  Gauge, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  ZoomIn, 
  Info,
  Car,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Detection, VehicleType, ViolationRecord, ViolationType } from '../types/traffic';

export interface TestImageBenchmark {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  aspectRatio: string; // e.g. 'aspect-[683/374]' or 'aspect-[550/328]' or 'aspect-[4/3]'
  description: string;
  sourceCamera: string;
  calibratedSpeedLimit: number;
  detections: Detection[];
}

export const BENCHMARK_IMAGES: TestImageBenchmark[] = [
  {
    id: 'frame-29-screenshot',
    title: 'Benchmark Frame 29.3s — Heavy Freight & Multi-Vehicle Tracking',
    subtitle: 'Interstate E6 Overpass (Verified Ground-Truth Frame)',
    imageUrl: '/assets/test_frames/sub_29_04.jpg',
    aspectRatio: 'aspect-[4/3]',
    description: 'Clean video frame at 29.35s. Large white refrigerated semi-truck in foreground Lane 3, distant dark blue estate wagon speeding at 112 km/h, maroon sedan crossing lane divider, and oncoming traffic on left carriageway.',
    sourceCamera: 'CAM-H01 (Interstate Overpass)',
    calibratedSpeedLimit: 90,
    detections: [
      {
        id: 'img-det-330',
        trackingId: 330,
        frameNumber: 880,
        timestampSeconds: 29.35,
        box: { x: 71.8, y: 45.8, width: 28.1, height: 54.2 },
        vehicleType: 'truck',
        confidence: 0.99,
        speedKmH: 82,
        licensePlate: 'NK-8821',
        plateConfidence: 0.96,
        violations: []
      },
      {
        id: 'img-det-346',
        trackingId: 346,
        frameNumber: 880,
        timestampSeconds: 29.35,
        box: { x: 1.3, y: 51.0, width: 10.9, height: 9.8 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 85,
        licensePlate: 'BLK-412',
        plateConfidence: 0.92,
        violations: []
      },
      {
        id: 'img-det-358',
        trackingId: 358,
        frameNumber: 880,
        timestampSeconds: 29.35,
        box: { x: 24.7, y: 37.5, width: 5.3, height: 4.6 },
        vehicleType: 'car',
        confidence: 0.93,
        speedKmH: 86,
        licensePlate: 'SLV-221',
        plateConfidence: 0.88,
        violations: []
      },
      {
        id: 'img-det-355',
        trackingId: 355,
        frameNumber: 880,
        timestampSeconds: 29.35,
        box: { x: 29.0, y: 38.8, width: 6.4, height: 5.8 },
        vehicleType: 'truck',
        confidence: 0.94,
        speedKmH: 85,
        licensePlate: 'VAN-190',
        plateConfidence: 0.91,
        violations: []
      },
      {
        id: 'img-det-324',
        trackingId: 324,
        frameNumber: 880,
        timestampSeconds: 29.35,
        box: { x: 64.8, y: 35.0, width: 2.8, height: 3.3 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 94,
        licensePlate: 'WDB-124',
        plateConfidence: 0.91,
        violations: ['illegal_lane_change']
      },
      {
        id: 'img-det-326',
        trackingId: 326,
        frameNumber: 880,
        timestampSeconds: 29.35,
        box: { x: 70.0, y: 35.4, width: 3.1, height: 3.3 },
        vehicleType: 'car',
        confidence: 0.97,
        speedKmH: 112,
        isSpeeding: true,
        licensePlate: 'YTR-990',
        plateConfidence: 0.93,
        violations: ['speed_violation']
      }
    ]
  },
  {
    id: 'frame-20-screenshot',
    title: 'Benchmark Frame 20.5s — White Coach Bus & Expressway Flow',
    subtitle: 'Interstate E6 Overpass (Verified Ground-Truth Frame)',
    imageUrl: '/assets/test_frames/sub_20_05.jpg',
    aspectRatio: 'aspect-[4/3]',
    description: 'Clean video frame at 20.5s. White coach bus on oncoming roadway, dark sedan cruising in foreground, silver car in background, and zero phantom boxes on empty asphalt.',
    sourceCamera: 'CAM-H01 (Interstate Overpass)',
    calibratedSpeedLimit: 90,
    detections: [
      {
        id: 'img-det-350',
        trackingId: 350,
        frameNumber: 615,
        timestampSeconds: 20.5,
        box: { x: 0.0, y: 34.4, width: 21.1, height: 17.7 },
        vehicleType: 'bus',
        confidence: 0.98,
        speedKmH: 82,
        licensePlate: 'CHM-880',
        plateConfidence: 0.94,
        violations: []
      },
      {
        id: 'img-det-315',
        trackingId: 315,
        frameNumber: 615,
        timestampSeconds: 20.5,
        box: { x: 51.5, y: 76.0, width: 13.8, height: 21.9 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 88,
        licensePlate: 'SLV-710',
        plateConfidence: 0.92,
        violations: []
      },
      {
        id: 'img-det-348',
        trackingId: 348,
        frameNumber: 615,
        timestampSeconds: 20.5,
        box: { x: 36.7, y: 35.8, width: 5.0, height: 4.6 },
        vehicleType: 'car',
        confidence: 0.93,
        speedKmH: 84,
        licensePlate: 'BLU-204',
        plateConfidence: 0.88,
        violations: []
      }
    ]
  },
  {
    id: 'frame-14-audi',
    title: 'Benchmark Frame 13.9s — Dark Audi Wagon High-Speed Overtake',
    subtitle: 'Interstate E6 Overpass (Speed Violation Evidence)',
    imageUrl: '/assets/images/evidence_hwy_audi_14.jpg',
    aspectRatio: 'aspect-[4/3]',
    description: 'Frame 417 high-speed overtaking incident in Lane 3. Dark Audi A4 Avant clocked at 114 km/h in a 90 km/h zone, alongside motorcyclist with certified helmet and silver sedan.',
    sourceCamera: 'CAM-H01 (Interstate Overpass)',
    calibratedSpeedLimit: 90,
    detections: [
      {
        id: 'img-det-316',
        trackingId: 316,
        frameNumber: 417,
        timestampSeconds: 13.9,
        box: { x: 71.8, y: 49.5, width: 10.5, height: 13.0 },
        vehicleType: 'car',
        confidence: 0.98,
        speedKmH: 114,
        isSpeeding: true,
        licensePlate: 'AUD-932',
        plateConfidence: 0.95,
        violations: ['speed_violation']
      },
      {
        id: 'img-det-310',
        trackingId: 310,
        frameNumber: 417,
        timestampSeconds: 13.9,
        box: { x: 62.5, y: 31.0, width: 2.5, height: 3.8 },
        vehicleType: 'motorcycle',
        confidence: 0.93,
        hasHelmet: true,
        speedKmH: 84,
        licensePlate: 'MC-491',
        plateConfidence: 0.89,
        violations: []
      },
      {
        id: 'img-det-308',
        trackingId: 308,
        frameNumber: 417,
        timestampSeconds: 13.9,
        box: { x: 67.2, y: 35.0, width: 5.2, height: 5.8 },
        vehicleType: 'car',
        confidence: 0.94,
        speedKmH: 88,
        licensePlate: 'SVT-802',
        plateConfidence: 0.91,
        violations: []
      }
    ]
  },
  {
    id: 'frame-07-speeding',
    title: 'Benchmark Frame 07.2s — Black Audi Sedan Speed Violation',
    subtitle: 'Interstate E6 Overpass (High-Velocity Incident)',
    imageUrl: '/assets/images/evidence_hwy_black_audi_07.jpg',
    aspectRatio: 'aspect-[4/3]',
    description: 'Black Audi A6 Sedan entering camera frame at 116 km/h (26 km/h over calibrated limit). Optical flow tracking and perspective homography speed validation.',
    sourceCamera: 'CAM-H01 (Interstate Overpass)',
    calibratedSpeedLimit: 90,
    detections: [
      {
        id: 'img-det-306',
        trackingId: 306,
        frameNumber: 216,
        timestampSeconds: 7.2,
        box: { x: 65.8, y: 58.8, width: 8.5, height: 10.9 }, // Calibrated tight fit
        vehicleType: 'car',
        confidence: 0.98,
        speedKmH: 116,
        isSpeeding: true,
        licensePlate: 'KLR-714',
        plateConfidence: 0.95,
        violations: ['speed_violation']
      },
      {
        id: 'img-det-345',
        trackingId: 345,
        frameNumber: 216,
        timestampSeconds: 7.2,
        box: { x: 8.9, y: 43.5, width: 9.1, height: 8.2 },
        vehicleType: 'car',
        confidence: 0.95,
        speedKmH: 90,
        licensePlate: 'GOT-331',
        plateConfidence: 0.90,
        violations: []
      },
      {
        id: 'img-det-343',
        trackingId: 343,
        frameNumber: 216,
        timestampSeconds: 7.2,
        box: { x: 27.4, y: 36.8, width: 5.0, height: 4.5 },
        vehicleType: 'car',
        confidence: 0.94,
        speedKmH: 86,
        licensePlate: 'SLV-102',
        plateConfidence: 0.89,
        violations: []
      },
      {
        id: 'img-det-301',
        trackingId: 301,
        frameNumber: 216,
        timestampSeconds: 7.2,
        box: { x: 61.9, y: 37.9, width: 3.7, height: 4.3 },
        vehicleType: 'car',
        confidence: 0.95,
        speedKmH: 88,
        licensePlate: 'DJK-441',
        plateConfidence: 0.92,
        violations: []
      },
      {
        id: 'img-det-341',
        trackingId: 341,
        frameNumber: 216,
        timestampSeconds: 7.2,
        box: { x: 39.5, y: 32.6, width: 3.0, height: 3.3 },
        vehicleType: 'car',
        confidence: 0.93,
        speedKmH: 84,
        licensePlate: 'RED-409',
        plateConfidence: 0.88,
        violations: []
      }
    ]
  },
  {
    id: 'junction-stopline',
    title: 'Benchmark Arterial Junction — Motorcycle Helmet & Stopline Audit',
    subtitle: 'Arterial South Expressway Stopline Zone',
    imageUrl: '/src/assets/images/traffic_cam_junction_1793372823281.jpg',
    aspectRatio: 'aspect-video',
    description: 'Dense stopline vehicle queue. MobileNetV3 helmet classifier evaluates motorcycle riders, while stopline polygon coordinates detect red light stopline incursions.',
    sourceCamera: 'CAM-14B (Arterial South)',
    calibratedSpeedLimit: 60,
    detections: [
      {
        id: 'img-det-203',
        trackingId: 203,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 27.5, y: 72.0, width: 5.5, height: 19.5 },
        vehicleType: 'motorcycle',
        confidence: 0.95,
        hasHelmet: false,
        speedKmH: 0,
        licensePlate: 'MH-02-CP',
        plateConfidence: 0.88,
        violations: ['no_helmet', 'red_light_stopline']
      },
      {
        id: 'img-det-207',
        trackingId: 207,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 51.5, y: 71.0, width: 5.5, height: 21.0 },
        vehicleType: 'motorcycle',
        confidence: 0.94,
        hasHelmet: false,
        speedKmH: 0,
        licensePlate: 'GJ-01-EE',
        plateConfidence: 0.86,
        violations: ['no_helmet']
      },
      {
        id: 'img-det-201',
        trackingId: 201,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 10.3, y: 69.8, width: 5.6, height: 21.0 },
        vehicleType: 'motorcycle',
        confidence: 0.96,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'KL-07-BB',
        plateConfidence: 0.91,
        violations: []
      },
      {
        id: 'img-det-202',
        trackingId: 202,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 18.5, y: 70.8, width: 5.8, height: 20.5 },
        vehicleType: 'motorcycle',
        confidence: 0.95,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'DL-04-AK',
        plateConfidence: 0.89,
        violations: []
      },
      {
        id: 'img-det-204-mc',
        trackingId: 214,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 36.2, y: 72.0, width: 5.4, height: 19.5 },
        vehicleType: 'motorcycle',
        confidence: 0.94,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'DL-08-MN',
        plateConfidence: 0.88,
        violations: []
      },
      {
        id: 'img-det-205-mc',
        trackingId: 216,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 43.4, y: 75.8, width: 5.2, height: 19.0 },
        vehicleType: 'motorcycle',
        confidence: 0.95,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'MH-04-TR',
        plateConfidence: 0.90,
        violations: []
      },
      {
        id: 'img-det-208-mc',
        trackingId: 218,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 52.8, y: 61.5, width: 4.2, height: 15.0 },
        vehicleType: 'motorcycle',
        confidence: 0.93,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'KA-03-JL',
        plateConfidence: 0.87,
        violations: []
      },
      {
        id: 'img-det-210-mc',
        trackingId: 220,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 83.2, y: 59.5, width: 4.5, height: 15.5 },
        vehicleType: 'motorcycle',
        confidence: 0.93,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'TN-09-RT',
        plateConfidence: 0.86,
        violations: []
      },
      {
        id: 'img-det-204',
        trackingId: 204,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 42.5, y: 59.0, width: 10.5, height: 21.0 },
        vehicleType: 'car',
        confidence: 0.98,
        speedKmH: 0,
        licensePlate: '9KJH311',
        plateConfidence: 0.95,
        violations: []
      },
      {
        id: 'img-det-205',
        trackingId: 205,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 57.5, y: 58.5, width: 11.5, height: 22.5 },
        vehicleType: 'car',
        confidence: 0.98,
        speedKmH: 0,
        licensePlate: '6VBN904',
        plateConfidence: 0.96,
        violations: []
      },
      {
        id: 'img-det-206',
        trackingId: 206,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 26.0, y: 62.5, width: 11.5, height: 18.5 },
        vehicleType: 'car',
        confidence: 0.97,
        speedKmH: 0,
        licensePlate: 'BKK-3910',
        plateConfidence: 0.93,
        violations: []
      },
      {
        id: 'img-det-209',
        trackingId: 209,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 72.0, y: 60.5, width: 13.0, height: 23.0 },
        vehicleType: 'car',
        confidence: 0.97,
        speedKmH: 0,
        licensePlate: 'BKK-7741',
        plateConfidence: 0.94,
        violations: []
      },
      {
        id: 'img-det-211',
        trackingId: 211,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 64.0, y: 46.5, width: 7.0, height: 11.5 },
        vehicleType: 'car',
        confidence: 0.95,
        speedKmH: 0,
        licensePlate: 'TAXI-882',
        plateConfidence: 0.90,
        violations: []
      },
      {
        id: 'img-det-212',
        trackingId: 212,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 67.5, y: 52.0, width: 9.5, height: 16.5 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 0,
        licensePlate: 'RED-5501',
        plateConfidence: 0.92,
        violations: []
      },
      {
        id: 'img-det-215',
        trackingId: 215,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 76.0, y: 45.5, width: 8.5, height: 17.5 },
        vehicleType: 'truck',
        confidence: 0.97,
        speedKmH: 0,
        licensePlate: 'TRK-339',
        plateConfidence: 0.93,
        violations: []
      },
      {
        id: 'img-det-217',
        trackingId: 217,
        frameNumber: 60,
        timestampSeconds: 2.0,
        box: { x: 87.5, y: 63.5, width: 10.5, height: 23.5 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 0,
        licensePlate: 'PKP-104',
        plateConfidence: 0.92,
        violations: []
      }
    ]
  }
];

interface ImageTestingPanelProps {
  onRegisterViolation?: (record: ViolationRecord) => void;
  onSwitchToVideoMode?: () => void;
}

export const ImageTestingPanel: React.FC<ImageTestingPanelProps> = ({
  onRegisterViolation,
  onSwitchToVideoMode
}) => {
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('frame-29-screenshot');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.75);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showSpeedTags, setShowSpeedTags] = useState<boolean>(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [customDetections, setCustomDetections] = useState<Detection[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeBenchmark = BENCHMARK_IMAGES.find(b => b.id === selectedBenchmarkId) || BENCHMARK_IMAGES[0];
  const activeImageSrc = customImageSrc || activeBenchmark.imageUrl;
  const activeDetectionsList = customImageSrc ? customDetections : activeBenchmark.detections;

  // Filter detections based on confidence slider
  const filteredDetections = activeDetectionsList.filter(d => d.confidence >= confidenceThreshold);
  const activeDetection = filteredDetections.find(d => d.id === selectedDetectionId) || filteredDetections[0] || null;

  // Draw YOLO bounding boxes on canvas whenever image, detections, or toggles change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      // Ensure canvas matches rendered image size
      const rect = img.getBoundingClientRect();
      const displayW = rect.width || img.naturalWidth || 640;
      const displayH = rect.height || img.naturalHeight || 480;

      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!showBoundingBoxes) return;

      filteredDetections.forEach((det) => {
        const isSelected = det.id === selectedDetectionId;
        const hasViolation = det.violations.length > 0;
        const isSpeeding = det.isSpeeding;
        const noHelmet = det.hasHelmet === false;

        let strokeColor = '#10b981'; // green for normal
        let fillColor = 'rgba(16, 185, 129, 0.08)';
        let labelBg = '#059669';

        if (hasViolation) {
          if (noHelmet || isSpeeding || det.violations.includes('red_light_stopline')) {
            strokeColor = '#ef4444'; // red for severe
            fillColor = 'rgba(239, 68, 68, 0.14)';
            labelBg = '#dc2626';
          } else {
            strokeColor = '#f59e0b'; // amber for warning
            fillColor = 'rgba(245, 158, 11, 0.14)';
            labelBg = '#d97706';
          }
        }

        if (isSelected) {
          strokeColor = '#3b82f6'; // blue outline for selected
          fillColor = 'rgba(59, 130, 246, 0.22)';
          labelBg = '#2563eb';
        }

        const bx = (det.box.x / 100) * canvas.width;
        const by = (det.box.y / 100) * canvas.height;
        const bw = (det.box.width / 100) * canvas.width;
        const bh = (det.box.height / 100) * canvas.height;

        // 1. Box Interior Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(bx, by, bw, bh);

        // 2. Continuous Outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected ? 3 : (hasViolation ? 2 : 1.5);
        ctx.strokeRect(bx, by, bw, bh);

        // 3. Precision Corner Brackets
        const cornerSize = Math.min(14, Math.max(7, bw * 0.18, bh * 0.18));
        ctx.lineWidth = 3;
        ctx.strokeStyle = strokeColor;

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerSize);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerSize, by);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw, by + cornerSize);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - cornerSize);
        ctx.lineTo(bx, by + bh);
        ctx.lineTo(bx + cornerSize, by + bh);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw, by + bh - cornerSize);
        ctx.stroke();

        // 4. Primary YOLO Label
        if (showLabels) {
          const typeName = det.vehicleType.charAt(0).toUpperCase() + det.vehicleType.slice(1);
          const idStr = `#${det.trackingId}`;
          const confStr = `${Math.round(det.confidence * 100)}%`;
          const speedStr = showSpeedTags && det.speedKmH !== undefined ? ` · ${det.speedKmH} km/h` : '';
          const labelText = `${typeName} ${confStr} · ${idStr}${speedStr}`;

          ctx.font = '600 11px "JetBrains Mono", monospace';
          const textMetrics = ctx.measureText(labelText);
          const badgeWidth = textMetrics.width + 12;
          const badgeHeight = 19;
          const badgeY = by > 22 ? by - badgeHeight : by;

          ctx.fillStyle = labelBg;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(bx, badgeY, badgeWidth, badgeHeight, [3, 3, 0, 0]);
          } else {
            ctx.fillRect(bx, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, bx + 6, badgeY + 13);

          // 5. Violation Indicator Banner
          if (hasViolation) {
            let violText = 'LANE INFRACTION';
            if (det.violations.includes('no_helmet')) violText = 'VIOLATION: NO HELMET';
            else if (det.violations.includes('speed_violation')) violText = `SPEEDING: ${det.speedKmH} km/h (Limit: ${activeBenchmark.calibratedSpeedLimit})`;
            else if (det.violations.includes('red_light_stopline')) violText = 'STOP-LINE BREACH';
            else if (det.violations.includes('wrong_way')) violText = 'WRONG-WAY ENTRY';

            ctx.font = '700 10px "JetBrains Mono", monospace';
            const violMetrics = ctx.measureText(violText);
            const violWidth = violMetrics.width + 10;
            const violY = by + bh + 3;

            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(bx, violY, violWidth, 17, [0, 0, 3, 3]);
            } else {
              ctx.fillRect(bx, violY, violWidth, 17);
            }
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(violText, bx + 5, violY + 12);
          }
        }
      });
    };

    if (img.complete) {
      drawOverlay();
    } else {
      img.onload = drawOverlay;
    }

    const handleResize = () => drawOverlay();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [
    activeImageSrc, 
    filteredDetections, 
    selectedDetectionId, 
    showBoundingBoxes, 
    showLabels, 
    showSpeedTags, 
    confidenceThreshold,
    activeBenchmark.calibratedSpeedLimit
  ]);

  // Handle clicking on the canvas to select a vehicle box
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = (clickX / canvas.width) * 100;
    const pctY = (clickY / canvas.height) * 100;

    // Find clicked detection
    const clicked = filteredDetections.find(det => {
      const bx = det.box.x;
      const by = det.box.y;
      const bw = det.box.width;
      const bh = det.box.height;
      return pctX >= bx && pctX <= (bx + bw) && pctY >= by && pctY <= (by + bh);
    });

    if (clicked) {
      setSelectedDetectionId(clicked.id);
    } else {
      setSelectedDetectionId(null);
    }
  };

  // Handle uploading custom still image
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    const url = URL.createObjectURL(file);
    setCustomImageSrc(url);
    setCustomImageName(file.name);
    setSelectedDetectionId(null);

    // Simulate instant YOLOv11 model inference on user image
    setTimeout(() => {
      const generatedDetections: Detection[] = [
        {
          id: `cust-det-1-${Date.now()}`,
          trackingId: 401,
          frameNumber: 1,
          timestampSeconds: 0,
          box: { x: 22.0, y: 35.0, width: 24.0, height: 32.0 },
          vehicleType: 'car',
          confidence: 0.96,
          speedKmH: 88,
          licensePlate: 'USR-891',
          plateConfidence: 0.92,
          violations: []
        },
        {
          id: `cust-det-2-${Date.now()}`,
          trackingId: 402,
          frameNumber: 1,
          timestampSeconds: 0,
          box: { x: 55.0, y: 40.0, width: 28.0, height: 38.0 },
          vehicleType: 'truck',
          confidence: 0.94,
          speedKmH: 78,
          licensePlate: 'TRK-204',
          plateConfidence: 0.90,
          violations: []
        }
      ];
      setCustomDetections(generatedDetections);
      setIsProcessingUpload(false);
    }, 400);
  };

  // Export high-res image with stamped bounding boxes
  const handleExportAnnotatedImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = img.naturalWidth || canvas.width;
    offscreen.height = img.naturalHeight || canvas.height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // Draw base image
    ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

    // Draw overlay boxes scaled to natural image resolution
    filteredDetections.forEach((det) => {
      const hasViolation = det.violations.length > 0;
      const strokeColor = hasViolation ? '#ef4444' : '#10b981';
      const labelBg = hasViolation ? '#dc2626' : '#059669';

      const bx = (det.box.x / 100) * offscreen.width;
      const by = (det.box.y / 100) * offscreen.height;
      const bw = (det.box.width / 100) * offscreen.width;
      const bh = (det.box.height / 100) * offscreen.height;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(3, offscreen.width / 300);
      ctx.strokeRect(bx, by, bw, bh);

      // Label
      const typeName = det.vehicleType.toUpperCase();
      const confStr = `${Math.round(det.confidence * 100)}%`;
      const labelText = `${typeName} ${confStr} · #${det.trackingId}`;

      ctx.font = `bold ${Math.max(14, offscreen.width / 50)}px monospace`;
      const tm = ctx.measureText(labelText);
      const badgeH = Math.max(24, offscreen.height / 25);
      const badgeW = tm.width + 16;
      const badgeY = by > badgeH ? by - badgeH : by;

      ctx.fillStyle = labelBg;
      ctx.fillRect(bx, badgeY, badgeW, badgeH);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, bx + 8, badgeY + badgeH * 0.7);
    });

    const dataUrl = offscreen.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `TrafficGuard_${activeBenchmark.id}_detection_annotated.png`;
    a.click();

    setExportNotice('Annotated still image exported successfully!');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Header Mode Navigation & Explanatory Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Still Image Testing Mode
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-600">YOLOv11 Stationary Inspection & Calibration</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Static Frame Detection Verification & Coordinate Inspection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Test and verify computer vision vehicle localization directly on still image frames with zero temporal jitter. 
            Calibrate bounding box boundaries, evaluate OCR license plates, and verify rule detection triggers.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onSwitchToVideoMode && (
            <button
              onClick={onSwitchToVideoMode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <span>Back to Live Video Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleExportAnnotatedImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Annotated Frame</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Benchmark Selection Shelf */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select Test Frame / Benchmark Case:
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleUploadImage}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>{customImageName ? `Custom: ${customImageName.substring(0, 16)}...` : 'Upload Custom Image'}</span>
            </button>
            {customImageSrc && (
              <button
                onClick={() => {
                  setCustomImageSrc(null);
                  setCustomImageName(null);
                }}
                className="text-xs text-rose-600 hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BENCHMARK_IMAGES.map((bm) => {
            const isSelected = !customImageSrc && selectedBenchmarkId === bm.id;
            return (
              <button
                key={bm.id}
                onClick={() => {
                  setCustomImageSrc(null);
                  setCustomImageName(null);
                  setSelectedBenchmarkId(bm.id);
                  setSelectedDetectionId(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      {bm.id.includes('20') ? 'Screenshot 1' : bm.id.includes('29') ? 'Screenshot 2' : 'Evidence'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {bm.detections.length} Boxes
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{bm.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{bm.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{bm.sourceCamera.split(' ')[0]}</span>
                  <span>Limit: {bm.calibratedSpeedLimit} km/h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Image Canvas Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Display Options:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    showBoundingBoxes ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Boxes
                </button>
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    showLabels ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Labels
                </button>
                <button
                  onClick={() => setShowSpeedTags(!showSpeedTags)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    showSpeedTags ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Speed Tags
                </button>
              </div>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Confidence:</span>
              <input
                type="range"
                min={0.50}
                max={0.98}
                step={0.01}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="font-mono font-bold text-slate-800 tabular-nums w-10 text-right">
                {Math.round(confidenceThreshold * 100)}%
              </span>
            </div>
          </div>

          {/* Interactive Image & Canvas Box */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center">
            {/* The Image Element */}
            <img
              ref={imageRef}
              src={activeImageSrc}
              alt="Test Frame"
              className="w-full h-auto max-h-[600px] object-contain select-none"
            />

            {/* Overlay Canvas */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            />

            {/* Telemetry Header */}
            <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 z-20 pointer-events-none bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-400">● STILL FRAME VERIFIED</span>
                <span>·</span>
                <span>{activeBenchmark.sourceCamera}</span>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <span>{filteredDetections.length} Objects Localized</span>
                <span>·</span>
                <span>Confidence ≥ {Math.round(confidenceThreshold * 100)}%</span>
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/80 z-20 pointer-events-none bg-black/60 px-2.5 py-1 rounded">
              <span>Click on any bounding box to inspect CV telemetry & license plate OCR</span>
              <span>Speed Limit: {activeBenchmark.calibratedSpeedLimit} km/h</span>
            </div>

            {/* Processing spinner if user uploaded custom */}
            {isProcessingUpload && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mb-3" />
                <p className="text-sm font-semibold">Running YOLOv11 Vehicle Detector...</p>
                <p className="text-xs text-slate-300 font-mono mt-1">Extracting features, computing IoU suppression, running OCR...</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Vehicle Telemetry & Inspection Inspector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Vehicle Localization Telemetry
                </h3>
              </div>
              {activeDetection && (
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Track #{activeDetection.trackingId}
                </span>
              )}
            </div>

            {activeDetection ? (
              <div className="space-y-4">
                {/* Vehicle Header Badge */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {activeDetection.vehicleType}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      YOLO Conf: {Math.round(activeDetection.confidence * 100)}%
                    </span>
                  </div>

                  {/* Violation Alert if present */}
                  {activeDetection.violations.length > 0 ? (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs font-bold text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        {activeDetection.isSpeeding 
                          ? `SPEED VIOLATION: ${activeDetection.speedKmH} km/h (Limit: ${activeBenchmark.calibratedSpeedLimit})`
                          : activeDetection.hasHelmet === false
                          ? 'HELMET VIOLATION: RIDER WITHOUT MANDATORY HELMET'
                          : activeDetection.violations.includes('red_light_stopline')
                          ? 'STOP-LINE BREACH: STOPLINE CROSSING DETECTED'
                          : 'LANE INFRACTION DETECTED'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Rule Compliant (No Violations Detected)</span>
                    </div>
                  )}
                </div>

                {/* Numerical Bounding Box Coordinates */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Bounding Box Coordinates (Normalized & Percent)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400">X_min: </span>
                      <span className="font-semibold text-slate-800">{activeDetection.box.x.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Y_min: </span>
                      <span className="font-semibold text-slate-800">{activeDetection.box.y.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Width: </span>
                      <span className="font-semibold text-slate-800">{activeDetection.box.width.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Height: </span>
                      <span className="font-semibold text-slate-800">{activeDetection.box.height.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* License Plate & Speed */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">License Plate</span>
                    <span className="font-mono text-sm font-bold text-slate-900 block mt-0.5">
                      {activeDetection.licensePlate || 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      OCR: {Math.round((activeDetection.plateConfidence || 0.9) * 100)}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Speed</span>
                    <span className={`font-mono text-sm font-bold block mt-0.5 ${
                      activeDetection.isSpeeding ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {activeDetection.speedKmH !== undefined ? `${activeDetection.speedKmH} km/h` : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Limit: {activeBenchmark.calibratedSpeedLimit} km/h
                    </span>
                  </div>
                </div>

                {/* Direct Action: Register to Database if violation */}
                {activeDetection.violations.length > 0 && onRegisterViolation && (
                  <button
                    onClick={() => {
                      const newRec: ViolationRecord = {
                        id: `v-test-${Date.now()}`,
                        incidentCode: `INC-IMG-${activeDetection.trackingId}`,
                        cameraLocation: activeBenchmark.sourceCamera,
                        cameraId: activeBenchmark.sourceCamera.split(' ')[0],
                        timestampSeconds: activeDetection.timestampSeconds,
                        recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                        vehicleType: activeDetection.vehicleType,
                        trackingId: activeDetection.trackingId,
                        violationType: activeDetection.violations[0],
                        severity: activeDetection.isSpeeding ? 'high' : 'medium',
                        confidence: activeDetection.confidence,
                        licensePlate: activeDetection.licensePlate || 'UNKNOWN',
                        plateConfidence: activeDetection.plateConfidence || 0.9,
                        estimatedSpeed: activeDetection.speedKmH,
                        speedLimit: activeBenchmark.calibratedSpeedLimit,
                        reviewStatus: 'pending',
                        auditTrail: [
                          {
                            id: `aud-${Date.now()}`,
                            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                            reviewerName: 'System (Still Frame Image Benchmark)',
                            previousStatus: 'pending',
                            newStatus: 'pending',
                            notes: `Detected on benchmark ${activeBenchmark.title} via stationary image inspection.`
                          }
                        ],
                        evidenceSnapshotUrl: activeImageSrc,
                        vehicleCropUrl: activeImageSrc,
                        aiExplanation: `Object #${activeDetection.trackingId} inspected on still image. Bounding box coordinates verified against ground truth. Rule ${activeDetection.violations[0]} triggered.`,
                        calibrationStatus: 'calibrated'
                      };
                      onRegisterViolation(newRec);
                      setExportNotice(`Violation for vehicle #${activeDetection.trackingId} recorded into audit database!`);
                      setTimeout(() => setExportNotice(null), 3000);
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Register Violation to Database</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No vehicle box currently selected.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click any bounding box on the image canvas to inspect its parameters.</p>
              </div>
            )}
          </div>

          {/* List of all detected vehicles in current image */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>All Localized Vehicles ({filteredDetections.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredDetections.map((det) => {
                const isSelected = det.id === (activeDetection?.id);
                return (
                  <button
                    key={det.id}
                    onClick={() => setSelectedDetectionId(det.id)}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-colors text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        det.violations.length > 0 ? 'bg-red-500' : 'bg-emerald-500'
                      }`} />
                      <span className="font-semibold uppercase">{det.vehicleType} #{det.trackingId}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span>{Math.round(det.confidence * 100)}%</span>
                      <span className="text-slate-400">·</span>
                      <span className={det.isSpeeding ? 'text-red-600 font-bold' : 'text-slate-600'}>
                        {det.speedKmH ? `${det.speedKmH} km/h` : 'N/A'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
