import React from 'react';
import { 
  Activity, 
  Factory, 
  KanbanSquare, 
  Sparkles, 
  ChevronLeft,
  Layers,
  Gauge
} from 'lucide-react';
import { ActiveTab } from '../types';

interface RightHoverNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  openCasesCount: number;
  onOpenCopilot: () => void;
}

export const RightHoverNav: React.FC<RightHoverNavProps> = ({
  activeTab,
  onTabChange,
  openCasesCount,
  onOpenCopilot
}) => {
  const currentTab = activeTab === 'diagnostics' ? 'overview' : activeTab;

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Plant Overview & EDA',
      shortLabel: 'Overview',
      icon: Activity,
      badge: null
    },
    {
      id: 'assets' as ActiveTab,
      label: 'Monitored Assets',
      shortLabel: 'Assets',
      icon: Factory,
      badge: '7 Units'
    },
    {
      id: 'cases' as ActiveTab,
      label: 'Cases Board',
      shortLabel: 'Cases',
      icon: KanbanSquare,
      badge: openCasesCount > 0 ? `${openCasesCount}` : null,
      badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300'
    }
  ];

  return (
    <aside 
      className="fixed right-0 top-0 h-full z-40 bg-white border-l border-slate-200 shadow-xl w-16 hover:w-64 transition-all duration-300 ease-in-out group flex flex-col justify-between select-none overflow-x-hidden"
      aria-label="Sidebar Navigation"
    >
      {/* Navigation Items */}
      <div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                className={`w-full flex items-center h-11 px-2.5 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border-r-4 border-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                }`}
              >
                {/* Icon Container (Strictly Centered in w-16) */}
                <div className="w-8 min-w-[32px] flex items-center justify-center">
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                </div>

                {/* Expanded Label & Badges */}
                <div className="ml-3 flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden pr-1">
                  <span className="text-xs tracking-tight">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                      item.badgeStyle || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Tooltip on collapsed state (optional fallback via title) */}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: AI Copilot Drawer Trigger */}
      <div className="p-2 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenCopilot}
          title="Open AI Plant Copilot"
          className="w-full flex items-center h-11 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition shadow-xs cursor-pointer group/copilot"
        >
          <div className="w-8 min-w-[32px] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-cyan-200 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="ml-3 flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden pr-1">
            <span className="text-xs">Plant Copilot</span>
            <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded">
              SCADA
            </span>
          </div>
        </button>

        {/* Mini status indicator footer when expanded */}
        <div className="px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-slate-400 flex items-center justify-between whitespace-nowrap overflow-hidden">
          <span>Grid: 60.01 Hz</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
