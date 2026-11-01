import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  Car, 
  BarChart3, 
  Camera, 
  Cpu, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

export type NavTab = 
  | 'overview'
  | 'monitoring'
  | 'image_testing'
  | 'violations'
  | 'vehicles'
  | 'analytics'
  | 'cameras'
  | 'model_info';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  violationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  violationsCount,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring' as NavTab, label: 'Live Video Feed', icon: Video },
    { id: 'image_testing' as NavTab, label: 'Still Image Testing', icon: ImageIcon },
    { id: 'violations' as NavTab, label: 'Violations', icon: AlertTriangle, badge: violationsCount },
    { id: 'vehicles' as NavTab, label: 'Vehicle Records', icon: Car },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'cameras' as NavTab, label: 'Camera Management', icon: Camera },
    { id: 'model_info' as NavTab, label: 'Models & Diagnostics', icon: Cpu },
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                TrafficGuard AI
              </span>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                Vision Safety System
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engineering Footer info */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Inference Pipeline</span>
            <span className="text-blue-600 font-mono text-[10px]">YOLOv11+ByteTrack</span>
          </div>
          <div className="text-slate-500 text-[10px] leading-relaxed">
            Automated traffic enforcement and license plate recognition system.
          </div>
        </div>
      )}
    </aside>
  );
};
