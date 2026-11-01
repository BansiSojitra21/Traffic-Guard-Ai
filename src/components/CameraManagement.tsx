import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Video,
  Activity
} from 'lucide-react';
import { CameraSource, ViolationType } from '../types/traffic';
import { CAMERAS } from '../data/trafficData';

export const CameraManagement: React.FC = () => {
  const [cameras, setCameras] = useState<CameraSource[]>(CAMERAS);
  const [selectedCamera, setSelectedCamera] = useState<CameraSource | null>(cameras[0]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Camera Form state
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('rtsp://10.24.8.x:554/live/stream');
  const [newSpeedLimit, setNewSpeedLimit] = useState(50);

  const handleToggleRule = (cameraId: string, rule: ViolationType) => {
    setCameras(prev => prev.map(cam => {
      if (cam.id === cameraId) {
        const hasRule = cam.activeRules.includes(rule);
        const updatedRules = hasRule 
          ? cam.activeRules.filter(r => r !== rule)
          : [...cam.activeRules, rule];
        const updatedCam = { ...cam, activeRules: updatedRules };
        if (selectedCamera?.id === cameraId) {
          setSelectedCamera(updatedCam);
        }
        return updatedCam;
      }
      return cam;
    }));
  };

  const handleCreateCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCam: CameraSource = {
      id: `CAM-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      location: newLocation || 'North Urban District',
      ipStreamUrl: newStreamUrl,
      status: 'online',
      fps: 30,
      resolution: '1920x1080 (FHD)',
      speedLimitKmH: newSpeedLimit,
      calibrationStatus: 'needs_calibration',
      activeRules: ['speed_violation', 'no_helmet'],
      videoThumbnail: '/src/assets/images/traffic_cam_intersection_1793372822178.jpg',
      sampleVideoType: 'intersection',
    };

    setCameras([...cameras, newCam]);
    setShowAddModal(false);
    setNewName('');
    setNewLocation('');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Traffic Camera Sensors & Homography Calibration
          </h2>
          <p className="text-xs text-slate-500">
            Configure CCTV ingress endpoints, speed calibration ground planes, and active violation rules
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Camera</span>
        </button>
      </div>

      {/* Grid of Cameras and Selected Camera Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left list (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {cameras.map((cam) => {
            const isSelected = selectedCamera?.id === cam.id;
            return (
              <div
                key={cam.id}
                onClick={() => setSelectedCamera(cam)}
                className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-mono text-xs font-bold">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {cam.id}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {cam.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                        {cam.name}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {cam.fps} FPS
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Speed Limit: {cam.speedLimitKmH} km/h</span>
                  <span className={cam.calibrationStatus === 'calibrated' ? 'text-emerald-700' : 'text-amber-700'}>
                    {cam.calibrationStatus === 'calibrated' ? 'Calibrated' : 'Needs Ground Plane'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right configuration panel (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCamera ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedCamera.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedCamera.id} · {selectedCamera.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {selectedCamera.resolution}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    H.264 / RTSP Stream
                  </span>
                </div>
              </div>

              {/* Stream URL (Masked credentials) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Ingress Stream Endpoint (RTSP/WebRTC)
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 flex items-center justify-between">
                  <span className="truncate">{selectedCamera.ipStreamUrl}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">Credentials Server-Side Only</span>
                </div>
              </div>

              {/* Speed limit setting */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Road Speed Limit (km/h)
                  </label>
                  <input
                    type="number"
                    value={selectedCamera.speedLimitKmH}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 50;
                      setCameras(prev => prev.map(c => c.id === selectedCamera.id ? { ...c, speedLimitKmH: val } : c));
                      setSelectedCamera({ ...selectedCamera, speedLimitKmH: val });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Homography Calibration Matrix
                  </label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 flex items-center justify-between">
                    <span>4-Point Perspective Active</span>
                    <button 
                      onClick={() => alert(`Perspective calibration matrix for ${selectedCamera.id} is locked with RMSE 0.04m error across 25m distance.`)}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      View Matrix
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Violation Rule Toggles */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Active Automated Rule Detectors for this Feed:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'speed_violation' as ViolationType, label: 'Speed Limit Enforcement', desc: 'Homography pixel velocity tracker' },
                    { id: 'no_helmet' as ViolationType, label: 'Motorcycle Helmet Detector', desc: 'Rider ROI head classifier' },
                    { id: 'red_light_stopline' as ViolationType, label: 'Red Light Stop-Line Breach', desc: 'Polygon intersection boundary' },
                    { id: 'wrong_way' as ViolationType, label: 'Wrong-Way Trajectory', desc: 'ByteTrack vector angle mismatch' },
                    { id: 'illegal_lane_change' as ViolationType, label: 'Solid White Line Crossing', desc: 'Lane delimiter segmentation' },
                  ].map((rule) => {
                    const isEnabled = selectedCamera.activeRules.includes(rule.id);
                    return (
                      <button
                        key={rule.id}
                        onClick={() => handleToggleRule(selectedCamera.id, rule.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isEnabled
                            ? 'border-blue-500 bg-blue-50/40 text-blue-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{rule.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isEnabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-normal font-mono">
                          {rule.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
              Select a camera to inspect configuration
            </div>
          )}
        </div>
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Register New Traffic Camera Sensor
            </h3>
            <form onSubmit={handleCreateCamera} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Camera Name</label>
                <input
                  type="text"
                  placeholder="e.g. Camera 201 — North Highway Junction"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Geographical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Intersection of 5th Ave and Pine"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">RTSP Stream Source</label>
                <input
                  type="text"
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Configured Speed Limit (km/h)</label>
                <input
                  type="number"
                  value={newSpeedLimit}
                  onChange={(e) => setNewSpeedLimit(parseInt(e.target.value) || 50)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Register Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
