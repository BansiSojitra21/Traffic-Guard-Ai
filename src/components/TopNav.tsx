import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Server, 
  User, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopNavProps {
  currentTab: NavTab;
  backendConnected: boolean;
  onToggleBackendMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  backendConnected,
  onToggleBackendMode,
  searchQuery,
  onSearchChange,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [engineModalOpen, setEngineModalOpen] = useState(false);

  const pageTitles: Record<NavTab, { title: string; category: string }> = {
    overview: { title: 'Executive Overview', category: 'Analytics' },
    monitoring: { title: 'Live Traffic Monitoring & Surveillance', category: 'Operations' },
    image_testing: { title: 'Still Image Detection & Benchmark Verification', category: 'Model Verification' },
    violations: { title: 'Violation Incident Review', category: 'Enforcement' },
    vehicles: { title: 'Vehicle Registry & Tracking Catalog', category: 'Surveillance' },
    analytics: { title: 'Traffic Analytics & Flow Statistics', category: 'Reporting' },
    cameras: { title: 'Camera & Calibration Management', category: 'Infrastructure' },
    model_info: { title: 'Model Diagnostics & Specifications', category: 'System Architecture' },
  };

  const { title, category } = pageTitles[currentTab] || { title: 'TrafficGuard AI', category: 'System' };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 z-10 shrink-0">
        {/* Zone 1: Breadcrumb and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase hidden sm:inline">
            {category}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
        </div>

        {/* Zone 2: Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by license plate, vehicle type, or incident ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Zone 3: Actions, Backend Health & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Backend health status badge */}
          <button
            onClick={() => setEngineModalOpen(true)}
            title="Click to view Computer Vision Engine details & what it does"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs transition-all cursor-pointer ${
              backendConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100 hover:border-blue-400'
            }`}
          >
            <Server className={`w-3.5 h-3.5 ${backendConnected ? 'text-emerald-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">
              {backendConnected ? 'Cloud Engine: Connected' : 'Edge Detection: Active'}
            </span>
            <span className="sm:hidden">
              {backendConnected ? 'Cloud' : 'Edge'}
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 ml-0.5 hover:text-slate-600" />
          </button>

          {/* Date Display */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>2026-10-30 UTC</span>
          </div>

          {/* Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition-all cursor-pointer"
            >
              <img
                src="/src/assets/images/avatar_operator_lead_1793372823122.jpg"
                alt="Reviewer avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-800">Sarah Jenkins</p>
                  <p className="text-slate-500 text-[11px]">Traffic Safety & Enforcement Lead</p>
                </div>
                <div className="px-3 py-2 text-[11px] text-slate-500">
                  Department: Municipal Traffic Enforcement
                </div>
                <div className="border-t border-slate-100 my-1" />
                <div className="px-3 py-1.5 text-[11px] text-slate-400">
                  Role: Verified Reviewer (RBAC Tier 1)
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Engine Status & What It Does Modal */}
      {engineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${backendConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Computer Vision Detection Engine</h3>
                  <p className="text-xs text-slate-500">Intelligent Automated Traffic Rule Violation Detection System</p>
                </div>
              </div>
              <button
                onClick={() => setEngineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What Does TrafficGuard AI Do?
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  TrafficGuard AI processes video feeds from highway and expressway surveillance cameras to automate traffic law enforcement:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-slate-700">
                  <li><strong>Real-time Vehicle Detection:</strong> YOLOv8 detects cars, buses, trucks, and motorcycles with persistent tracking IDs.</li>
                  <li><strong>Optical Speed Radar:</strong> Ground-plane homography measures vehicle real-world velocity (km/h) against posted limits.</li>
                  <li><strong>Rule Violation Detection:</strong> Flags speeding, illegal lane changes, red-light/stopline breaches, and helmet absence.</li>
                  <li><strong>License Plate OCR:</strong> Automated plate text recognition and confidence scoring for verified citations.</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Current Engine Mode</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                    {backendConnected ? 'Cloud FastAPI Engine' : 'Client Edge Detection'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {backendConnected 
                      ? 'Connected to Python FastAPI microservice at localhost:8000.'
                      : 'Running zero-latency local canvas inference inside browser.'}
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Inference Metrics</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">30.0 FPS / 26ms</div>
                  <div className="text-[11px] text-slate-500 mt-1">Homography ground-plane calibration active.</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">Toggle mode to test edge fallback:</span>
                <button
                  onClick={() => {
                    onToggleBackendMode();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  Switch to {backendConnected ? 'Edge Mode' : 'Cloud Mode'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setEngineModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
