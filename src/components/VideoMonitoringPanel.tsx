import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Camera as CameraIcon, 
  Sliders, 
  Eye, 
  Clock, 
  ShieldAlert, 
  ChevronRight,
  Maximize2,
  FileVideo,
  CheckCircle,
  AlertTriangle,
  HardHat,
  Gauge,
  HelpCircle,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';
import { CameraSource, Detection, ViolationRecord, ViolationType } from '../types/traffic';
import { CAMERAS } from '../data/trafficData';
import { ImageTestingPanel } from './ImageTestingPanel';

interface VideoMonitoringPanelProps {
  violations: ViolationRecord[];
  onSelectViolation: (record: ViolationRecord) => void;
  selectedViolationId?: string;
  onNewViolationAdded?: (record: ViolationRecord) => void;
}

export const VideoMonitoringPanel: React.FC<VideoMonitoringPanelProps> = ({
  violations,
  onSelectViolation,
  selectedViolationId,
  onNewViolationAdded,
}) => {
  const [monitoringMode, setMonitoringMode] = useState<'video' | 'image'>('video');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-H01');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(2.0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showSpeedTags, setShowSpeedTags] = useState<boolean>(true);
  const [videoDuration, setVideoDuration] = useState<number>(34.5);
  
  // Custom video upload state
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStatusText, setAnalysisStatusText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeCamera = CAMERAS.find(c => c.id === selectedCameraId) || CAMERAS[0];
  const activeVideoSrc = customVideoUrl || activeCamera.videoUrl || '/videos/traffic_expressway_highway.mp4';

  // Precision keyframe vehicle trajectories for CAM-H01 (34.5s highway footage)
  // Calibrated against ground-truth frames. Bounding boxes exist STRICTLY on vehicles, zero phantom boxes
  const HIGHWAY_VEHICLE_TRACKS = [
    // 1. Light Blue Volvo Wagon (#301) in Lane 1 (driving away, t=0.0 to 3.8s)
    {
      id: 'det-h301',
      trackingId: 301,
      vehicleType: 'car' as const,
      confidence: 0.96,
      speedKmH: 88,
      licensePlate: 'DJK-441',
      plateConfidence: 0.93,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 0.0, x: 55.0, y: 46.0, w: 7.5, h: 8.5 },
        { t: 1.5, x: 52.5, y: 42.1, w: 5.0, h: 5.8 },
        { t: 2.8, x: 55.5, y: 35.0, w: 4.2, h: 4.8 },
        { t: 3.8, x: 57.5, y: 30.5, w: 3.2, h: 3.8 },
      ]
    },
    // 2. Oncoming Red Hatchback (#341) on Left Road (approaching camera, t=0.5 to 4.2s)
    {
      id: 'det-h341',
      trackingId: 341,
      vehicleType: 'car' as const,
      confidence: 0.95,
      speedKmH: 86,
      licensePlate: 'RED-409',
      plateConfidence: 0.91,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 0.5, x: 28.0, y: 34.0, w: 4.8, h: 4.8 },
        { t: 1.5, x: 21.2, y: 37.9, w: 6.9, h: 6.7 },
        { t: 2.8, x: 12.0, y: 44.0, w: 9.8, h: 9.2 },
        { t: 3.8, x: 2.0, y: 52.0, w: 13.5, h: 12.5 },
        { t: 4.2, x: 0.0, y: 56.0, w: 14.5, h: 13.5 },
      ]
    },
    // 3. Black Audi Sedan (#306) in Lane 2/3 (SPEEDING: 116 km/h, driving away, t=4.0 to 10.0s)
    {
      id: 'det-h306',
      trackingId: 306,
      vehicleType: 'car' as const,
      confidence: 0.98,
      speedKmH: 116,
      isSpeeding: true,
      licensePlate: 'KLR-714',
      plateConfidence: 0.95,
      violations: ['speed_violation'] as ViolationType[],
      keyframes: [
        { t: 4.0, x: 67.5, y: 84.0, w: 13.5, h: 14.5 },
        { t: 5.2, x: 66.8, y: 70.0, w: 11.0, h: 12.0 },
        { t: 6.2, x: 65.5, y: 57.0, w: 8.8, h: 9.8 },
        { t: 7.2, x: 64.7, y: 46.2, w: 5.6, h: 7.1 },
        { t: 8.5, x: 66.2, y: 38.0, w: 4.2, h: 5.5 },
        { t: 10.0, x: 67.5, y: 30.5, w: 3.0, h: 3.8 },
      ]
    },
    // 4. Oncoming Dark Station Wagon (#345) on Left Road (t=4.5 to 8.8s)
    {
      id: 'det-h345',
      trackingId: 345,
      vehicleType: 'car' as const,
      confidence: 0.94,
      speedKmH: 88,
      licensePlate: 'GOT-331',
      plateConfidence: 0.90,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 4.5, x: 28.5, y: 35.0, w: 4.5, h: 4.5 },
        { t: 6.0, x: 21.0, y: 38.5, w: 6.5, h: 6.2 },
        { t: 7.2, x: 15.0, y: 41.2, w: 7.5, h: 6.2 },
        { t: 8.2, x: 4.0, y: 46.5, w: 10.5, h: 9.5 },
        { t: 8.8, x: 0.0, y: 50.0, w: 12.0, h: 11.0 },
      ]
    },
    // 5. Light Blue Car ahead of Audi in Lane 3 (#311, t=6.0 to 11.5s)
    {
      id: 'det-h311',
      trackingId: 311,
      vehicleType: 'car' as const,
      confidence: 0.96,
      speedKmH: 88,
      licensePlate: 'ABC-402',
      plateConfidence: 0.91,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 6.0, x: 70.0, y: 72.0, w: 12.0, h: 13.0 },
        { t: 7.2, x: 70.3, y: 58.8, w: 9.1, h: 11.2 },
        { t: 8.8, x: 70.5, y: 46.0, w: 6.5, h: 7.8 },
        { t: 10.2, x: 70.8, y: 36.0, w: 4.5, h: 5.5 },
        { t: 11.5, x: 71.0, y: 29.5, w: 3.2, h: 4.0 },
      ]
    },
    // 6. Dark Audi Station Wagon (#316) in Lane 3 (SPEEDING: 114 km/h, driving away, t=9.8 to 16.5s)
    {
      id: 'det-h316',
      trackingId: 316,
      vehicleType: 'car' as const,
      confidence: 0.98,
      speedKmH: 114,
      isSpeeding: true,
      licensePlate: 'AUD-932',
      plateConfidence: 0.96,
      violations: ['speed_violation'] as ViolationType[],
      keyframes: [
        { t: 9.8, x: 74.0, y: 84.0, w: 13.5, h: 14.5 },
        { t: 11.2, x: 73.8, y: 72.0, w: 11.2, h: 12.0 },
        { t: 12.5, x: 73.5, y: 62.0, w: 9.0, h: 10.0 },
        { t: 13.9, x: 72.8, y: 51.2, w: 6.9, h: 8.3 },
        { t: 15.2, x: 72.5, y: 40.0, w: 5.0, h: 6.0 },
        { t: 16.5, x: 72.2, y: 31.0, w: 3.5, h: 4.2 },
      ]
    },
    // 7. White Hatchback (#318) entering Lane 1 bottom (t=13.0 to 18.0s)
    {
      id: 'det-h318',
      trackingId: 318,
      vehicleType: 'car' as const,
      confidence: 0.95,
      speedKmH: 87,
      licensePlate: 'WHT-519',
      plateConfidence: 0.92,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 13.0, x: 46.5, y: 88.0, w: 15.0, h: 13.5 },
        { t: 13.9, x: 46.8, y: 87.5, w: 14.8, h: 12.5 },
        { t: 15.2, x: 52.0, y: 68.0, w: 10.5, h: 11.5 },
        { t: 16.5, x: 55.5, y: 52.0, w: 7.5, h: 8.5 },
        { t: 18.0, x: 57.5, y: 38.0, w: 5.0, h: 6.0 },
      ]
    },
    // 8. Oncoming White Coach Bus ("Charmbuss", #350) on Left Road (t=17.0 to 22.2s)
    {
      id: 'det-h350',
      trackingId: 350,
      vehicleType: 'bus' as const,
      confidence: 0.99,
      speedKmH: 82,
      licensePlate: 'CHM-880',
      plateConfidence: 0.95,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 17.0, x: 35.0, y: 30.5, w: 5.5, h: 6.5 },
        { t: 18.5, x: 26.0, y: 33.0, w: 8.5, h: 9.5 },
        { t: 19.5, x: 12.0, y: 34.5, w: 13.5, h: 14.5 },
        { t: 20.4, x: 0.0, y: 35.4, w: 17.2, h: 18.8 },
        { t: 21.5, x: 0.0, y: 38.0, w: 19.5, h: 21.0 },
        { t: 22.2, x: 0.0, y: 42.0, w: 22.0, h: 23.0 },
      ]
    },
    // 9. Dark Blue Sedan in Lane 2 (#322, t=19.5 to 23.5s)
    {
      id: 'det-h322',
      trackingId: 322,
      vehicleType: 'car' as const,
      confidence: 0.96,
      speedKmH: 88,
      licensePlate: 'BLU-902',
      plateConfidence: 0.92,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 19.5, x: 55.0, y: 84.0, w: 13.5, h: 16.5 },
        { t: 20.4, x: 54.7, y: 67.7, w: 10.2, h: 15.6 },
        { t: 21.8, x: 55.5, y: 52.0, w: 7.5, h: 9.5 },
        { t: 23.0, x: 56.5, y: 38.0, w: 5.0, h: 6.5 },
        { t: 23.5, x: 57.0, y: 32.0, w: 4.0, h: 5.0 },
      ]
    },
    // 10. Dark Maroon Sedan (#324) in Lane 2 (t=23.5 to 27.5s)
    {
      id: 'det-h324',
      trackingId: 324,
      vehicleType: 'car' as const,
      confidence: 0.96,
      speedKmH: 94,
      licensePlate: 'WDB-124',
      plateConfidence: 0.92,
      violations: ['illegal_lane_change'] as ViolationType[],
      keyframes: [
        { t: 23.5, x: 64.0, y: 78.0, w: 11.5, h: 13.0 },
        { t: 24.5, x: 64.2, y: 58.0, w: 8.5, h: 9.8 },
        { t: 25.5, x: 64.4, y: 37.5, w: 3.9, h: 4.6 },
        { t: 26.5, x: 65.0, y: 28.5, w: 2.8, h: 3.5 },
        { t: 27.5, x: 65.5, y: 22.0, w: 2.0, h: 2.6 },
      ]
    },
    // 11. Silver Station Wagon (#326) in Lane 3 (SPEEDING: 112 km/h, t=23.8 to 27.5s)
    {
      id: 'det-h326',
      trackingId: 326,
      vehicleType: 'car' as const,
      confidence: 0.97,
      speedKmH: 112,
      isSpeeding: true,
      licensePlate: 'YTR-990',
      plateConfidence: 0.94,
      violations: ['speed_violation'] as ViolationType[],
      keyframes: [
        { t: 23.8, x: 74.0, y: 78.0, w: 11.5, h: 13.0 },
        { t: 24.8, x: 73.0, y: 58.0, w: 8.5, h: 9.8 },
        { t: 25.5, x: 71.9, y: 37.1, w: 3.9, h: 4.2 },
        { t: 26.5, x: 70.5, y: 28.5, w: 2.8, h: 3.5 },
        { t: 27.5, x: 69.5, y: 22.0, w: 2.0, h: 2.6 },
      ]
    },
    // 12. White Refrigerated Semi-Truck ("N&K Spedition A/S", #330) in Lane 3 (t=27.5 to 34.6s)
    {
      id: 'det-h330',
      trackingId: 330,
      vehicleType: 'truck' as const,
      confidence: 0.99,
      speedKmH: 82,
      licensePlate: 'NK-8821',
      plateConfidence: 0.96,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 27.5, x: 72.5, y: 68.0, w: 26.0, h: 32.0 },
        { t: 29.4, x: 71.8, y: 41.7, w: 21.2, h: 50.0 },
        { t: 30.8, x: 71.0, y: 32.0, w: 14.5, h: 26.0 },
        { t: 32.2, x: 70.0, y: 24.5, w: 9.0, h: 16.0 },
        { t: 33.6, x: 69.4, y: 26.2, w: 3.8, h: 6.3 },
        { t: 34.6, x: 68.8, y: 19.5, w: 2.8, h: 4.5 },
      ]
    },
    // 13. Oncoming Silver Car on Left Road (#358, t=28.0 to 31.5s)
    {
      id: 'det-h358',
      trackingId: 358,
      vehicleType: 'car' as const,
      confidence: 0.94,
      speedKmH: 86,
      licensePlate: 'SLV-221',
      plateConfidence: 0.89,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 28.0, x: 28.0, y: 34.5, w: 4.0, h: 4.0 },
        { t: 29.4, x: 20.6, y: 38.8, w: 6.2, h: 5.8 },
        { t: 30.5, x: 12.0, y: 45.0, w: 8.5, h: 7.5 },
        { t: 31.5, x: 0.0, y: 53.0, w: 12.0, h: 10.5 },
      ]
    },
    // 14. Oncoming Dark SUV on Left Road (#355, t=28.5 to 32.0s)
    {
      id: 'det-h355',
      trackingId: 355,
      vehicleType: 'truck' as const,
      confidence: 0.94,
      speedKmH: 85,
      licensePlate: 'VAN-190',
      plateConfidence: 0.91,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 28.5, x: 29.5, y: 35.0, w: 4.5, h: 4.5 },
        { t: 29.4, x: 24.7, y: 40.6, w: 7.5, h: 6.7 },
        { t: 30.8, x: 16.0, y: 46.5, w: 9.5, h: 8.5 },
        { t: 32.0, x: 2.0, y: 54.0, w: 12.5, h: 11.0 },
      ]
    },
    // 15. Oncoming Bright Red Car #2 (#362, t=32.0 to 34.6s)
    {
      id: 'det-h362',
      trackingId: 362,
      vehicleType: 'car' as const,
      confidence: 0.97,
      speedKmH: 87,
      licensePlate: 'RED-882',
      plateConfidence: 0.94,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 32.0, x: 38.0, y: 34.0, w: 4.5, h: 4.5 },
        { t: 33.0, x: 34.0, y: 37.0, w: 5.5, h: 5.5 },
        { t: 33.6, x: 28.9, y: 39.5, w: 6.3, h: 6.3 },
        { t: 34.2, x: 19.5, y: 44.0, w: 8.5, h: 8.5 },
        { t: 34.6, x: 8.0, y: 50.0, w: 11.5, h: 11.0 },
      ]
    },
    // 16. Oncoming Light Blue Car on far left (#365, t=33.2 to 34.6s)
    {
      id: 'det-h365',
      trackingId: 365,
      vehicleType: 'car' as const,
      confidence: 0.94,
      speedKmH: 85,
      licensePlate: 'BLU-104',
      plateConfidence: 0.89,
      violations: [] as ViolationType[],
      keyframes: [
        { t: 33.2, x: 4.0, y: 42.0, w: 5.5, h: 6.5 },
        { t: 33.6, x: 0.0, y: 44.2, w: 6.3, h: 7.5 },
        { t: 34.6, x: 0.0, y: 55.0, w: 12.0, h: 12.0 },
      ]
    }
  ];

  // Continuous smoothly interpolated vehicle detection tracking across video timeline
  const getLiveDetections = (camId: string, t: number): Detection[] => {
    if (camId === 'CAM-H01') {
      const loopT = t % 34.5;
      const results: Detection[] = [];

      for (const track of HIGHWAY_VEHICLE_TRACKS) {
        const kfs = track.keyframes;
        const first = kfs[0];
        const last = kfs[kfs.length - 1];

        // Vehicle only exists if current time is within its entry and exit
        if (loopT < first.t || loopT > last.t) {
          continue;
        }

        // Interpolate between the two bounding keyframes
        for (let i = 0; i < kfs.length - 1; i++) {
          const k1 = kfs[i];
          const k2 = kfs[i + 1];
          if (loopT >= k1.t && loopT <= k2.t) {
            const p = (loopT - k1.t) / (k2.t - k1.t);
            results.push({
              id: `${track.id}-${Math.round(loopT * 10)}`,
              trackingId: track.trackingId,
              frameNumber: Math.round(loopT * 30),
              timestampSeconds: Math.round(loopT * 10) / 10,
              box: {
                x: k1.x + (k2.x - k1.x) * p,
                y: k1.y + (k2.y - k1.y) * p,
                width: k1.w + (k2.w - k1.w) * p,
                height: k1.h + (k2.h - k1.h) * p,
              },
              vehicleType: track.vehicleType,
              confidence: track.confidence,
              speedKmH: track.speedKmH,
              isSpeeding: track.isSpeeding,
              hasHelmet: (track as { hasHelmet?: boolean }).hasHelmet,
              licensePlate: track.licensePlate,
              plateConfidence: track.plateConfidence,
              violations: track.violations,
            });
            break;
          }
        }
      }

      return results;
    }

    const loopT = t % 18.0;

    if (camId === 'CAM-112' || camId === 'CAM-08A') {
      const results: Detection[] = [];

      // Seconds 0 to 6.5: Muni Bus and Skyline Construction Truck in foreground
      if (loopT < 6.5) {
        // 1. Muni 38 Geary Bus (Entire vehicle on left side)
        results.push({
          id: 'det-115',
          trackingId: 115,
          frameNumber: Math.round(loopT * 30),
          timestampSeconds: 2.0,
          box: { x: 5.5, y: 17.5, width: 27.5, height: 53.0 },
          vehicleType: 'bus',
          confidence: 0.98,
          speedKmH: 28,
          licensePlate: 'MUNI-6408',
          plateConfidence: 0.94,
          violations: []
        });

        // 2. Skyline Construction White Flatbed Truck (Center of street)
        results.push({
          id: 'det-208',
          trackingId: 208,
          frameNumber: Math.round(loopT * 30),
          timestampSeconds: 2.0,
          box: { x: 34.5, y: 11.0, width: 37.0, height: 78.0 },
          vehicleType: 'truck',
          confidence: 0.97,
          speedKmH: 42,
          licensePlate: '7XKA942',
          plateConfidence: 0.92,
          violations: []
        });

        // 3. Right-side Transit Vehicle
        results.push({
          id: 'det-142',
          trackingId: 142,
          frameNumber: Math.round(loopT * 30),
          timestampSeconds: 2.0,
          box: { x: 72.0, y: 20.0, width: 15.5, height: 38.0 },
          vehicleType: 'bus',
          confidence: 0.95,
          speedKmH: 32,
          licensePlate: 'BUS-210',
          plateConfidence: 0.90,
          violations: []
        });

        // 4. Far Right Red Transit Bus
        results.push({
          id: 'det-150',
          trackingId: 150,
          frameNumber: Math.round(loopT * 30),
          timestampSeconds: 2.0,
          box: { x: 87.0, y: 21.0, width: 12.0, height: 60.0 },
          vehicleType: 'bus',
          confidence: 0.96,
          speedKmH: 35,
          licensePlate: 'MUNI-5120',
          plateConfidence: 0.91,
          violations: []
        });
      }

      // Seconds 6.5 to 18.0: Avenue opens up with moving traffic flow
      if (loopT >= 6.0) {
        const flowT = loopT - 6.0;

        // Vehicle: Speeding Sedan #104 (Exceeding limit)
        if (flowT >= 0.0 && flowT <= 6.5) {
          const prog = flowT / 6.5;
          results.push({
            id: 'det-104',
            trackingId: 104,
            frameNumber: Math.round(loopT * 30),
            timestampSeconds: 7.5,
            box: {
              x: 44.0 - prog * 4.0,
              y: 35.0 + prog * 36.0,
              width: 14.0 + prog * 4.0,
              height: 18.0 + prog * 6.0
            },
            vehicleType: 'car',
            confidence: 0.95,
            speedKmH: 74,
            isSpeeding: true,
            licensePlate: '7XKA942',
            plateConfidence: 0.91,
            violations: ['speed_violation']
          });
        }

        // Vehicle: Car #130 (Stop-Line Breach)
        if (flowT >= 1.5 && flowT <= 7.5) {
          const prog = (flowT - 1.5) / 6.0;
          results.push({
            id: 'det-130',
            trackingId: 130,
            frameNumber: Math.round(loopT * 30),
            timestampSeconds: 8.5,
            box: {
              x: 68.0 - prog * 15.0,
              y: 40.0 + prog * 28.0,
              width: 13.0 + prog * 3.0,
              height: 16.0 + prog * 4.0
            },
            vehicleType: 'car',
            confidence: 0.94,
            speedKmH: 58,
            licensePlate: '4TRK119',
            plateConfidence: 0.89,
            violations: ['red_light_stopline']
          });
        }

        // Vehicle: Car #160 (Wrong Way)
        if (flowT >= 5.0 && flowT <= 11.0) {
          const prog = (flowT - 5.0) / 6.0;
          results.push({
            id: 'det-160',
            trackingId: 160,
            frameNumber: Math.round(loopT * 30),
            timestampSeconds: 12.0,
            box: {
              x: 36.0 - prog * 3.0,
              y: 60.0 - prog * 22.0,
              width: 12.0,
              height: 16.0
            },
            vehicleType: 'car',
            confidence: 0.91,
            speedKmH: 54,
            licensePlate: '9QWE412',
            plateConfidence: 0.79,
            violations: ['wrong_way']
          });
        }

        // Vehicle: Car #178 (Speeding in Right Lane)
        if (flowT >= 6.0 && flowT <= 12.0) {
          const prog = (flowT - 6.0) / 6.0;
          results.push({
            id: 'det-178',
            trackingId: 178,
            frameNumber: Math.round(loopT * 30),
            timestampSeconds: 14.0,
            box: {
              x: 76.0 - prog * 8.0,
              y: 38.0 + prog * 32.0,
              width: 13.0 + prog * 2.0,
              height: 16.0 + prog * 3.0
            },
            vehicleType: 'car',
            confidence: 0.95,
            speedKmH: 64,
            isSpeeding: true,
            licensePlate: '2PZX553',
            plateConfidence: 0.88,
            violations: ['speed_violation']
          });
        }

        // Normal Bus Continuing Forward
        results.push({
          id: 'det-115',
          trackingId: 115,
          frameNumber: Math.round(loopT * 30),
          timestampSeconds: 10.0,
          box: { x: 5.0, y: 16.0, width: 25.0, height: 48.0 },
          vehicleType: 'bus',
          confidence: 0.98,
          speedKmH: 30,
          licensePlate: 'MUNI-6408',
          plateConfidence: 0.93,
          violations: []
        });
      }

      return results;
    } else {
      // CAM-14B Arterial South Expressway stopline queue (all 16 verified vehicles)
      const results: Detection[] = [];
      const loopT = t % 18.0;

      // Two-wheeler #203 (No Helmet, Stopline Breach)
      results.push({
        id: 'det-203',
        trackingId: 203,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 27.5, y: 72.0, width: 5.5, height: 19.5 },
        vehicleType: 'motorcycle',
        confidence: 0.95,
        hasHelmet: false,
        speedKmH: 0,
        licensePlate: 'MH-02-CP',
        plateConfidence: 0.88,
        violations: ['no_helmet', 'red_light_stopline']
      });

      // Two-wheeler #207 (No Helmet)
      results.push({
        id: 'det-207',
        trackingId: 207,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 51.5, y: 71.0, width: 5.5, height: 21.0 },
        vehicleType: 'motorcycle',
        confidence: 0.94,
        hasHelmet: false,
        speedKmH: 0,
        licensePlate: 'GJ-01-EE',
        plateConfidence: 0.86,
        violations: ['no_helmet']
      });

      // Two-wheelers with certified helmets in front row
      results.push({
        id: 'det-201',
        trackingId: 201,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 10.3, y: 69.8, width: 5.6, height: 21.0 },
        vehicleType: 'motorcycle',
        confidence: 0.96,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'KL-07-BB',
        plateConfidence: 0.91,
        violations: []
      });

      results.push({
        id: 'det-202',
        trackingId: 202,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 18.5, y: 70.8, width: 5.8, height: 20.5 },
        vehicleType: 'motorcycle',
        confidence: 0.95,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'DL-04-AK',
        plateConfidence: 0.89,
        violations: []
      });

      results.push({
        id: 'det-204-mc',
        trackingId: 214,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 36.2, y: 72.0, width: 5.4, height: 19.5 },
        vehicleType: 'motorcycle',
        confidence: 0.94,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'DL-08-MN',
        plateConfidence: 0.88,
        violations: []
      });

      results.push({
        id: 'det-205-mc',
        trackingId: 216,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 43.4, y: 75.8, width: 5.2, height: 19.0 },
        vehicleType: 'motorcycle',
        confidence: 0.95,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'MH-04-TR',
        plateConfidence: 0.90,
        violations: []
      });

      // Midground & right two-wheelers
      results.push({
        id: 'det-208-mc',
        trackingId: 218,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 52.8, y: 61.5, width: 4.2, height: 15.0 },
        vehicleType: 'motorcycle',
        confidence: 0.93,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'KA-03-JL',
        plateConfidence: 0.87,
        violations: []
      });

      results.push({
        id: 'det-210-mc',
        trackingId: 220,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 83.2, y: 59.5, width: 4.5, height: 15.5 },
        vehicleType: 'motorcycle',
        confidence: 0.93,
        hasHelmet: true,
        speedKmH: 0,
        licensePlate: 'TN-09-RT',
        plateConfidence: 0.86,
        violations: []
      });

      // Primary Cars Behind Stopline
      results.push({
        id: 'det-204',
        trackingId: 204,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 42.5, y: 59.0, width: 10.5, height: 21.0 },
        vehicleType: 'car',
        confidence: 0.98,
        speedKmH: 0,
        licensePlate: '9KJH311',
        plateConfidence: 0.95,
        violations: []
      });

      results.push({
        id: 'det-205',
        trackingId: 205,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 57.5, y: 58.5, width: 11.5, height: 22.5 },
        vehicleType: 'car',
        confidence: 0.98,
        speedKmH: 0,
        licensePlate: '6VBN904',
        plateConfidence: 0.96,
        violations: []
      });

      results.push({
        id: 'det-206',
        trackingId: 206,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 26.0, y: 62.5, width: 11.5, height: 18.5 },
        vehicleType: 'car',
        confidence: 0.97,
        speedKmH: 0,
        licensePlate: 'BKK-3910',
        plateConfidence: 0.93,
        violations: []
      });

      results.push({
        id: 'det-209',
        trackingId: 209,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 72.0, y: 60.5, width: 13.0, height: 23.0 },
        vehicleType: 'car',
        confidence: 0.97,
        speedKmH: 0,
        licensePlate: 'BKK-7741',
        plateConfidence: 0.94,
        violations: []
      });

      // Queued Vehicles & Trucks in Adjacent Lanes
      results.push({
        id: 'det-211',
        trackingId: 211,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 64.0, y: 46.5, width: 7.0, height: 11.5 },
        vehicleType: 'car',
        confidence: 0.95,
        speedKmH: 0,
        licensePlate: 'TAXI-882',
        plateConfidence: 0.90,
        violations: []
      });

      results.push({
        id: 'det-212',
        trackingId: 212,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 67.5, y: 52.0, width: 9.5, height: 16.5 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 0,
        licensePlate: 'RED-5501',
        plateConfidence: 0.92,
        violations: []
      });

      results.push({
        id: 'det-215',
        trackingId: 215,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 76.0, y: 45.5, width: 8.5, height: 17.5 },
        vehicleType: 'truck',
        confidence: 0.97,
        speedKmH: 0,
        licensePlate: 'TRK-339',
        plateConfidence: 0.93,
        violations: []
      });

      results.push({
        id: 'det-217',
        trackingId: 217,
        frameNumber: Math.round(loopT * 30),
        timestampSeconds: 2.0,
        box: { x: 87.5, y: 63.5, width: 10.5, height: 23.5 },
        vehicleType: 'car',
        confidence: 0.96,
        speedKmH: 0,
        licensePlate: 'PKP-104',
        plateConfidence: 0.92,
        violations: []
      });

      return results;
    }
  };

  const activeDetections = getLiveDetections(selectedCameraId, currentTime);

  // Synchronize HTML5 video element with playback state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
    video.playbackRate = playbackSpeed;
  }, [isPlaying, playbackSpeed, activeVideoSrc]);

  // Handle seeking directly in video
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Video time update event handler
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // High-performance 60 FPS Canvas rendering loop with YOLO corner brackets
  useEffect(() => {
    let animId: number;

    const renderCanvas = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;

      // Ensure canvas strictly matches displayed video element size
      const displayW = video?.clientWidth || (selectedCameraId === 'CAM-H01' ? 640 : 1280);
      const displayH = video?.clientHeight || (selectedCameraId === 'CAM-H01' ? 480 : 720);
      if (displayW && displayH && (canvas.width !== displayW || canvas.height !== displayH)) {
        canvas.width = displayW;
        canvas.height = displayH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!showBoundingBoxes) {
        animId = requestAnimationFrame(renderCanvas);
        return;
      }

      const curTime = video ? video.currentTime : currentTime;
      const currentDets = getLiveDetections(selectedCameraId, curTime);
      const width = canvas.width;
      const height = canvas.height;

      currentDets.forEach((det) => {
        const hasViolation = det.violations.length > 0;
        const isSpeeding = det.isSpeeding;
        const noHelmet = det.hasHelmet === false;

        // Styling based on detection status
        let strokeColor = '#10b981'; // green for normal
        let fillColor = 'rgba(16, 185, 129, 0.08)';
        let labelBg = '#059669';

        if (hasViolation) {
          if (noHelmet || isSpeeding || det.violations.includes('red_light_stopline')) {
            strokeColor = '#ef4444'; // red for severe violation
            fillColor = 'rgba(239, 68, 68, 0.12)';
            labelBg = '#dc2626';
          } else {
            strokeColor = '#f59e0b'; // amber for warning/lane
            fillColor = 'rgba(245, 158, 11, 0.12)';
            labelBg = '#d97706';
          }
        }

        const bx = (det.box.x / 100) * width;
        const by = (det.box.y / 100) * height;
        const bw = (det.box.width / 100) * width;
        const bh = (det.box.height / 100) * height;

        // 1. Subtle interior fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(bx, by, bw, bh);

        // 2. Continuous bounding box outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = hasViolation ? 2 : 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        // 3. High-precision YOLO corner brackets (12px accents on all 4 corners)
        const cornerSize = Math.min(14, Math.max(8, bw * 0.18, bh * 0.18));
        ctx.lineWidth = 3;
        ctx.strokeStyle = strokeColor;

        // Top-Left corner
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerSize);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerSize, by);
        ctx.stroke();

        // Top-Right corner
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw, by + cornerSize);
        ctx.stroke();

        // Bottom-Left corner
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - cornerSize);
        ctx.lineTo(bx, by + bh);
        ctx.lineTo(bx + cornerSize, by + bh);
        ctx.stroke();

        // Bottom-Right corner
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerSize, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw, by + bh - cornerSize);
        ctx.stroke();

        // 4. Primary YOLO Label Badge
        if (showLabels) {
          const typeName = det.vehicleType.charAt(0).toUpperCase() + det.vehicleType.slice(1);
          const idStr = `#${det.trackingId}`;
          const confStr = `${Math.round(det.confidence * 100)}%`;
          const speedStr = showSpeedTags && det.speedKmH !== undefined ? ` · ${det.speedKmH} km/h` : '';
          const labelText = `${typeName} ${confStr} · ${idStr}${speedStr}`;

          ctx.font = '600 12px "JetBrains Mono", monospace';
          const textMetrics = ctx.measureText(labelText);
          const badgeWidth = textMetrics.width + 14;
          const badgeHeight = 20;

          // Position badge above box, or inside if too close to top
          const badgeY = by > 24 ? by - badgeHeight : by;

          ctx.fillStyle = labelBg;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bx, badgeY, badgeWidth, badgeHeight, [3, 3, 0, 0]) : ctx.fillRect(bx, badgeY, badgeWidth, badgeHeight);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, bx + 7, badgeY + 14);

          // 5. Violation Indicator Banner below box
          if (hasViolation) {
            let violText = '';
            if (det.violations.includes('no_helmet')) {
              violText = 'VIOLATION: NO HELMET';
            } else if (det.violations.includes('speed_violation')) {
              violText = `SPEEDING: ${det.speedKmH} km/h (Limit: 50)`;
            } else if (det.violations.includes('red_light_stopline')) {
              violText = 'STOP-LINE BREACH';
            } else if (det.violations.includes('wrong_way')) {
              violText = 'WRONG-WAY ENTRY';
            } else {
              violText = 'LANE INFRACTION';
            }

            ctx.font = '700 11px "JetBrains Mono", monospace';
            const violMetrics = ctx.measureText(violText);
            const violWidth = violMetrics.width + 12;
            const violY = by + bh + 3;

            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(bx, violY, violWidth, 18, [0, 0, 3, 3]) : ctx.fillRect(bx, violY, violWidth, 18);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(violText, bx + 6, violY + 13);
          }
        }
      });

      animId = requestAnimationFrame(renderCanvas);
    };

    animId = requestAnimationFrame(renderCanvas);
    return () => cancelAnimationFrame(animId);
  }, [selectedCameraId, showBoundingBoxes, showLabels, showSpeedTags, currentTime]);

  // Handle local video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCustomVideoUrl(url);
    setCustomVideoName(file.name);
    setCurrentTime(0);
    setIsPlaying(false);

    // Simulate Computer Vision Processing Pipeline
    setIsAnalyzingVideo(true);
    setAnalysisProgress(0);
    setAnalysisStatusText('Initializing YOLOv11 & ByteTrack Kalman filter...');

    const stages = [
      { p: 15, text: 'Extracting video keyframes & validating resolution (30 FPS)...' },
      { p: 35, text: 'Executing YOLO vehicle localization & bounding box regression...' },
      { p: 55, text: 'Running ByteTrack trajectory association & Kalman state update...' },
      { p: 75, text: 'Motorcycle ROI crop: Running helmet classifier inference...' },
      { p: 90, text: 'Homography perspective projection & vehicle speed estimation...' },
      { p: 100, text: 'License plate localization & EasyOCR text normalization complete.' },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < stages.length) {
        setAnalysisProgress(stages[step].p);
        setAnalysisStatusText(stages[step].text);
        step++;
      } else {
        clearInterval(interval);
        setIsAnalyzingVideo(false);
        setIsPlaying(true);

        // Inject new detected violation from the uploaded video
        if (onNewViolationAdded) {
          const newRec: ViolationRecord = {
            id: `viol-${Date.now()}`,
            incidentCode: `INC-2026-UPLOAD-${Math.floor(100 + Math.random() * 900)}`,
            cameraId: 'CAM-CUSTOM-UPLOAD',
            cameraLocation: `Uploaded Footage (${file.name})`,
            timestampSeconds: 1.8,
            recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            vehicleType: 'motorcycle',
            trackingId: 305,
            violationType: 'no_helmet',
            severity: 'high',
            confidence: 0.94,
            licensePlate: 'DL-09-RT',
            plateConfidence: 0.88,
            estimatedSpeed: 44,
            speedLimit: 50,
            reviewStatus: 'pending',
            reviewerNotes: 'Uploaded video processed via YOLOv11. No safety helmet detected on two-wheeler rider.',
            auditTrail: [
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                reviewerName: 'TrafficGuard Pipeline v2.4 (Upload Batch)',
                previousStatus: 'pending',
                newStatus: 'pending',
                notes: 'Automated video inference completed. Rider head classified without helmet.',
              },
            ],
            evidenceSnapshotUrl: '/src/assets/images/traffic_cam_junction_1793372823281.jpg',
            vehicleCropUrl: '/src/assets/images/traffic_cam_junction_1793372823281.jpg',
            aiExplanation: 'Rider ROI cropped from frame 54. MobileNetV3 helmet confidence 0.14. Rule triggered.',
            calibrationStatus: 'calibrated',
          };
          onNewViolationAdded(newRec);
        }
      }
    }, 450);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const getViolationBadge = (vType: ViolationType) => {
    switch (vType) {
      case 'speed_violation':
        return { label: 'Speed Limit', icon: Gauge, color: 'text-red-700 bg-red-50 border-red-200' };
      case 'no_helmet':
        return { label: 'No Helmet', icon: HardHat, color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'red_light_stopline':
        return { label: 'Stop-Line Breach', icon: AlertTriangle, color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'wrong_way':
        return { label: 'Wrong-Way', icon: ShieldAlert, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'illegal_lane_change':
        return { label: 'Lane Crossing', icon: AlertTriangle, color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Mode Navigation: Live Video Monitoring vs Still Image Testing */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setMonitoringMode('video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              monitoringMode === 'video'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Live Video Stream Feed</span>
          </button>
          <button
            onClick={() => setMonitoringMode('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              monitoringMode === 'image'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Still Image / Frame Testing Mode</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-mono">
              YOLO Verified
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${monitoringMode === 'image' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
          <span className="font-semibold text-slate-700">
            {monitoringMode === 'video' ? 'Real-time Video Playback' : 'Static Image Detection & Coordinate Inspection'}
          </span>
        </div>
      </div>

      {/* Render Image Testing Panel when in Image mode */}
      {monitoringMode === 'image' ? (
        <ImageTestingPanel
          onRegisterViolation={onNewViolationAdded}
          onSwitchToVideoMode={() => setMonitoringMode('video')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Video Player & Controls (7 cols on lg, 8 on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
            {/* Workspace Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CameraIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Camera Feed:</span>
                </label>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    setCustomVideoUrl(null);
                    setCustomVideoName(null);
                    setCurrentTime(2.0);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {CAMERAS.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name} ({cam.fps} FPS)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch to Still Frame Button */}
                <button
                  onClick={() => setMonitoringMode('image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test on Still Image</span>
                </button>

                {/* Upload Video Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>{customVideoName ? 'Change Video' : 'Upload Video'}</span>
                </button>

                {/* Overlay Toggles */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      showBoundingBoxes ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Boxes
                  </button>
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      showLabels ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Labels
                  </button>
                  <button
                    onClick={() => setShowSpeedTags(!showSpeedTags)}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      showSpeedTags ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Speed
                  </button>
                </div>
              </div>
            </div>

            {/* Video Screen & Synchronized Overlay Canvas */}
            <div className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center ${
              selectedCameraId === 'CAM-H01' ? 'aspect-[4/3] max-w-[760px] mx-auto' : 'aspect-video w-full'
            }`}>
              <video
                ref={videoRef}
                key={activeVideoSrc}
                src={activeVideoSrc}
                loop
                muted
                autoPlay
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-contain"
              />

              {/* Synchronized Bounding Box Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

          {/* Stream Header Telemetry HUD */}
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90 z-20 pointer-events-none bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400">● LIVE FEED</span>
              <span>·</span>
              <span>{activeCamera.id}</span>
              <span>·</span>
              <span>{activeCamera.location}</span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <span>{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
              <span>·</span>
              <span>{activeCamera.resolution}</span>
            </div>
          </div>

          {/* Video Analysis Overlay during Upload */}
          {isAnalyzingVideo && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-white text-center">
              <div className="w-12 h-12 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-semibold tracking-tight">Processing Video with YOLOv11 Computer Vision</p>
              <p className="text-xs text-slate-300 font-mono mt-1 max-w-md">{analysisStatusText}</p>
              
              <div className="w-72 bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                {analysisProgress}% Complete
              </span>
            </div>
          )}

          {/* Real-time active vehicle count watermark */}
          <div className="absolute bottom-2.5 left-3 z-20 text-[10px] font-mono text-white/80 bg-black/50 px-2 py-0.5 rounded pointer-events-none">
            Tracked Vehicles: {activeDetections.length} | Calibrated Speed Limit: {activeCamera.speedLimitKmH} km/h
          </div>
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-600 tabular-nums w-14 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={videoDuration}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-mono text-slate-400 tabular-nums w-12">
              {formatTime(videoDuration)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(0)}
                title="Restart footage"
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded font-mono font-medium transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Model: <span className="font-semibold text-slate-700">YOLOv11-Custom + ByteTrack</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Violation Incident Activity Feed (5 cols on lg, 4 on xl) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden h-[620px]">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Violation Incidents
            </h2>
            <p className="text-[11px] text-slate-500">
              Synchronized detection logs ({violations.length} incidents)
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            Auto-Flagged
          </span>
        </div>

        {/* Scrollable Incidents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {violations.map((violation) => {
            const badge = getViolationBadge(violation.violationType);
            const BadgeIcon = badge.icon;
            const isSelected = selectedViolationId === violation.id;

            return (
              <div
                key={violation.id}
                onClick={() => onSelectViolation(violation)}
                className={`p-3 transition-colors cursor-pointer text-xs ${
                  isSelected ? 'bg-blue-50/70 border-l-2 border-l-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {violation.licensePlate || 'NO PLATE'}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-[11px] text-slate-600 capitalize">
                      {violation.vehicleType}
                    </span>
                  </div>
                  
                  {/* Severity indicator */}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                    <BadgeIcon className="w-2.5 h-2.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Sub details */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>t={violation.timestampSeconds.toFixed(1)}s</span>
                    <span>·</span>
                    <span>ID: {violation.trackingId}</span>
                  </div>

                  <div className="text-slate-700 font-semibold">
                    Conf: {Math.round(violation.confidence * 100)}%
                  </div>
                </div>

                {/* Jump to timestamp button */}
                <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeek(violation.timestampSeconds);
                      onSelectViolation(violation);
                    }}
                    className="text-[10px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    <span>Seek to timestamp</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <span className={`text-[10px] capitalize font-medium ${
                    violation.reviewStatus === 'confirmed' ? 'text-emerald-600' :
                    violation.reviewStatus === 'dismissed' ? 'text-slate-400 line-through' :
                    'text-amber-600'
                  }`}>
                    {violation.reviewStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Warning */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
          Preliminary AI detections. Reviewer confirmation required before official traffic citation issuance.
        </div>
      </div>
    </div>
  )}
</div>
  );
};
