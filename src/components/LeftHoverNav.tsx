import React from 'react';
import { 
  Activity, 
  Factory, 
  Wrench, 
  KanbanSquare, 
  Droplets,
  Database,
  Leaf,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import { ActiveTab } from '../types';
import { OgActiveTab } from '../types/oilGasTypes';

interface LeftHoverNavProps {
  facility: 'power' | 'oilgas';
  activeTab: string;
  onTabChange: (tab: any) => void;
  onNavigateToCatalog?: () => void;
  openCasesCount: number;
  unresolvedInspectionsCount?: number;
  onOpenCopilot?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenJargonGuide?: () => void;
}

export const LeftHoverNav: React.FC<LeftHoverNavProps> = ({
  facility,
  activeTab,
  onTabChange,
  onNavigateToCatalog,
  openCasesCount,
  unresolvedInspectionsCount = 0
}) => {
  const currentTab = activeTab === 'diagnostics' ? 'overview' : activeTab;

  // Facility-specific navigation tabs
  const powerNavItems = [
    {
      id: 'overview',
      label: 'Plant Overview & EDA',
      shortLabel: 'Overview',
      icon: Activity,
      badge: null
    },
    {
      id: 'assets',
      label: 'Monitored Assets',
      shortLabel: 'Assets',
      icon: Factory,
      badge: '7 Units'
    },
    {
      id: 'maintenance',
      label: 'Maintenance & Inspections',
      shortLabel: 'Maintenance',
      icon: Wrench,
      badge: unresolvedInspectionsCount > 0 ? `${unresolvedInspectionsCount} Alerts` : null,
      badgeStyle: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
    },
    {
      id: 'cases',
      label: 'Cases Board',
      shortLabel: 'Cases',
      icon: KanbanSquare,
      badge: openCasesCount > 0 ? `${openCasesCount}` : null,
      badgeStyle: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
    }
  ];

  const oilGasNavItems = [
    {
      id: 'overview',
      label: 'Production Overview & Pulse',
      shortLabel: 'Overview',
      icon: Activity,
      badge: null
    },
    {
      id: 'production',
      label: 'Wellheads & Separation',
      shortLabel: 'Production',
      icon: Droplets,
      badge: '4 Wells'
    },
    {
      id: 'assets',
      label: 'Machinery Health & RUL',
      shortLabel: 'Assets',
      icon: Cpu,
      badge: '1 Alert',
      badgeStyle: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
    },
    {
      id: 'storage',
      label: 'Storage & Export Logistics',
      shortLabel: 'Storage',
      icon: Database,
      badge: '470k bbl'
    },
    {
      id: 'environmental',
      label: 'GHG Emissions & Flare',
      shortLabel: 'Environment',
      icon: Leaf,
      badge: '98.4% Eff',
      badgeStyle: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
    },
    {
      id: 'cases',
      label: 'Work Orders & PTW Permits',
      shortLabel: 'Permits',
      icon: KanbanSquare,
      badge: openCasesCount > 0 ? `${openCasesCount}` : null,
      badgeStyle: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
    }
  ];

  const navItems = facility === 'power' ? powerNavItems : oilGasNavItems;

  return (
    <aside 
      className="fixed bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 rounded-full px-2 py-1 flex items-center select-none"
      aria-label="Bottom Navigation Pill"
    >
      {/* Navigation Items List */}
      <nav className="flex items-center gap-1.5">
        {onNavigateToCatalog && (
          <div className="relative group/item flex items-center">
            <button
              onClick={onNavigateToCatalog}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-120 active:scale-85 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/60 focus:outline-none"
              title="Back to Catalog"
              aria-label="Back to Catalog"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/item:-translate-x-0.5" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none opacity-0 group-hover/item:opacity-100 group-hover/item:-translate-y-0.5 transition-all duration-150 ease-out border border-slate-700/80 flex items-center gap-1.5">
              <span>Back to Catalog</span>
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
            </div>
            <span className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <div key={item.id} className="relative group/item">
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-120 active:scale-85 cursor-pointer relative focus:outline-none ${
                  isActive
                    ? facility === 'power'
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/80 dark:border-blue-800/80 shadow-xs scale-105'
                      : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/item:scale-110" />

                {item.badge && !isActive && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Floating Tooltip above button */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none opacity-0 group-hover/item:opacity-100 group-hover/item:-translate-y-0.5 transition-all duration-150 ease-out border border-slate-700/80 flex items-center gap-1.5">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9.5px] text-blue-400 font-mono bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/60">
                    {item.badge}
                  </span>
                )}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
