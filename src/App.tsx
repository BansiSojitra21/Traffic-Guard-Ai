import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { OverviewCards } from './components/OverviewCards';
import { VideoMonitoringPanel } from './components/VideoMonitoringPanel';
import { ViolationsTable } from './components/ViolationsTable';
import { ViolationDetailDrawer } from './components/ViolationDetailDrawer';
import { AnalyticsView } from './components/AnalyticsView';
import { CameraManagement } from './components/CameraManagement';
import { ModelInfoPanel } from './components/ModelInfoPanel';
import { VehicleRegistryView } from './components/VehicleRegistryView';
import { ImageTestingPanel } from './components/ImageTestingPanel';
import { INITIAL_VIOLATIONS } from './data/trafficData';
import { ReviewStatus, SystemStats, ViolationRecord } from './types/traffic';
import { ArrowUpRight, Eye, Video as VideoIcon, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('monitoring');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [violations, setViolations] = useState<ViolationRecord[]>(INITIAL_VIOLATIONS);
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | null>(null);

  // Compute live system stats
  const stats: SystemStats = {
    totalVehiclesDetected: 2572 + (violations.length - INITIAL_VIOLATIONS.length),
    totalViolations: violations.length,
    helmetViolations: violations.filter(v => v.violationType === 'no_helmet').length,
    speedViolations: violations.filter(v => v.violationType === 'speed_violation').length,
    uniqueVehicles: 1845 + (violations.length - INITIAL_VIOLATIONS.length),
    processingFps: backendConnected ? 31.4 : 30.0,
    backendConnected,
  };

  // Handle review status updates
  const handleUpdateStatus = (violationId: string, newStatus: ReviewStatus, notes: string) => {
    setViolations(prev => prev.map(v => {
      if (v.id === violationId) {
        const auditEntry = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          reviewerName: 'Sarah Jenkins (Lead Reviewer)',
          previousStatus: v.reviewStatus,
          newStatus: newStatus,
          notes: notes,
        };
        const updated = {
          ...v,
          reviewStatus: newStatus,
          reviewerNotes: notes,
          auditTrail: [auditEntry, ...v.auditTrail],
        };
        if (selectedViolation?.id === violationId) {
          setSelectedViolation(updated);
        }
        return updated;
      }
      return v;
    }));
  };

  const handleAddNewViolation = (newRecord: ViolationRecord) => {
    setViolations(prev => [newRecord, ...prev]);
    setSelectedViolation(newRecord);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        violationsCount={violations.filter(v => v.reviewStatus === 'pending').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          currentTab={currentTab}
          backendConnected={backendConnected}
          onToggleBackendMode={() => setBackendConnected(!backendConnected)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Overview Tab */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <OverviewCards stats={stats} backendConnected={backendConnected} />
              
              {/* Monitoring Split Preview Shortcut */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <VideoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Live Traffic Footage & Bounding Box Video Workspace
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inspect multi-camera surveillance feeds, test uploaded video files, and monitor real-time vehicle detections.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('monitoring')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  <span>Open Video Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Incident Feed and Analytics preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7">
                  <ViolationsTable
                    violations={violations}
                    onSelectViolation={setSelectedViolation}
                    onUpdateStatus={handleUpdateStatus}
                  />
                </div>
                <div className="lg:col-span-5">
                  <AnalyticsView violations={violations} />
                </div>
              </div>
            </div>
          )}

          {/* Live Monitoring / Video Analysis Tab */}
          {currentTab === 'monitoring' && (
            <div className="space-y-4">
              <OverviewCards stats={stats} backendConnected={backendConnected} />
              <VideoMonitoringPanel
                violations={violations}
                onSelectViolation={setSelectedViolation}
                selectedViolationId={selectedViolation?.id}
                onNewViolationAdded={handleAddNewViolation}
              />
            </div>
          )}

          {/* Still Image Testing & Coordinate Verification Tab */}
          {currentTab === 'image_testing' && (
            <div className="space-y-4">
              <OverviewCards stats={stats} backendConnected={backendConnected} />
              <ImageTestingPanel
                onRegisterViolation={handleAddNewViolation}
                onSwitchToVideoMode={() => setCurrentTab('monitoring')}
              />
            </div>
          )}

          {/* Violations Incident Review Tab */}
          {currentTab === 'violations' && (
            <div className="space-y-4">
              <ViolationsTable
                violations={violations}
                onSelectViolation={setSelectedViolation}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {/* Tracked Vehicle Records Tab */}
          {currentTab === 'vehicles' && (
            <VehicleRegistryView
              violations={violations}
              onSelectViolation={setSelectedViolation}
            />
          )}

          {/* Analytics Tab */}
          {currentTab === 'analytics' && (
            <div className="space-y-4">
              <AnalyticsView violations={violations} />
            </div>
          )}

          {/* Camera Management Tab */}
          {currentTab === 'cameras' && (
            <CameraManagement />
          )}

          {/* Model Diagnostics & Performance Specs */}
          {currentTab === 'model_info' && (
            <ModelInfoPanel />
          )}
        </main>
      </div>

      {/* Side Drawer for Violation Inspection & Review */}
      <ViolationDetailDrawer
        violation={selectedViolation}
        onClose={() => setSelectedViolation(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
