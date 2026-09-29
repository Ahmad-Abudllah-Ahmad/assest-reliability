import React from 'react';
import { 
  Zap, 
  Factory, 
  Leaf, 
  ClipboardCheck, 
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModuleId } from '../types';

interface NavItem {
  id: ModuleId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeType?: 'warning' | 'alert' | 'neutral' | 'success';
}

export const Sidebar: React.FC = () => {
  const { 
    activeModule, 
    setActiveModule, 
    recommendations,
    fleetAssets,
    gridFrequency,
    bessStatus
  } = useApp();

  const pendingApprovalsCount = recommendations.filter(r => r.status === 'NEEDS_APPROVAL').length;
  const criticalAssetsCount = fleetAssets.filter(a => a.status === 'CRITICAL').length;
  const warningAssetsCount = fleetAssets.filter(a => a.status === 'WARNING').length;

  const navItems: NavItem[] = [
    {
      id: 'dispatch',
      label: 'Grid Dispatch',
      sublabel: 'Peak Load & BESS Arbitrage',
      icon: Zap,
      badge: `${bessStatus.socPercent}% SOC`,
      badgeType: 'neutral'
    },
    {
      id: 'fleet',
      label: 'Fleet & Transformers',
      sublabel: 'Asset Reliability & Thermals',
      icon: Factory,
      badge: criticalAssetsCount > 0 ? `${criticalAssetsCount} Alert` : `${warningAssetsCount} Warn`,
      badgeType: criticalAssetsCount > 0 ? 'alert' : 'warning'
    },
    {
      id: 'carbon',
      label: 'Carbon & Efficiency',
      sublabel: 'Heat Rate & Low-NOx',
      icon: Leaf,
      badge: '91% Cap',
      badgeType: 'neutral'
    },
    {
      id: 'approvals',
      label: 'AI Recommendation Hub',
      sublabel: 'Approval & Dispatch Center',
      icon: ClipboardCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : 'Clean',
      badgeType: pendingApprovalsCount > 0 ? 'warning' : 'success'
    }
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-800 bg-[#0B0F19]/80 flex flex-col justify-between p-3 lg:p-4">
      <div className="space-y-4">
        {/* Section Heading */}
        <div className="px-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            OPERATIONAL MODULES
          </span>
        </div>

        {/* Navigation Buttons */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition group ${
                  isActive
                    ? 'bg-blue-950/60 border border-blue-600/50 text-white shadow-md shadow-blue-950/40'
                    : 'border border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900/70 hover:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-gray-800/80 text-gray-400 group-hover:text-gray-200 group-hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                      item.badgeType === 'alert'
                        ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                        : item.badgeType === 'warning'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : item.badgeType === 'success'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-gray-800 text-gray-400 border border-gray-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Dispatch Readiness Card */}
      <div className="mt-6 pt-4 border-t border-gray-800/80 hidden lg:block space-y-3">
        <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase text-gray-400">
              DISPATCH READINESS
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="h-3 w-3" />
              NERC-BAL-001
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-gray-400">
              <span>Spinning Reserve:</span>
              <span className="font-mono text-gray-200 font-semibold">+42.0 MW</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Frequency Bias:</span>
              <span className="font-mono text-emerald-400">{(gridFrequency - 60.0).toFixed(3)} Hz</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>BESS Available:</span>
              <span className="font-mono text-purple-300">78 MWh</span>
            </div>
          </div>
        </div>

        <div className="px-1 text-[10px] text-gray-500 flex items-center gap-1.5">
          <Info className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span>IEEE C57.91 & EPA Part 75 active monitoring.</span>
        </div>
      </div>
    </aside>
  );
};
