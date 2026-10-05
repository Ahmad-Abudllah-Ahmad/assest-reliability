import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Zap, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Layers,
  ArrowRight,
  Info,
  Sliders,
  Wind
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { useWindReliability } from '../WindReliabilityContext';
import { WindAsset } from '../types';

interface WindAssetDetailModalProps {
  asset: WindAsset | null;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type TabType = 'overview' | 'mechanical' | 'electrical' | 'thermal' | 'performance' | 'environment' | 'maintenance' | 'history';

export const WindAssetDetailModal: React.FC<WindAssetDetailModalProps> = ({
  asset,
  onClose,
  onNavigateToTab
}) => {
  const { historyEvents, setSelectedAlert, alerts } = useWindReliability();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!asset) return null;

  const isRiskHigh = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';
  const isRiskMed = asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate';
  const assetHistory = historyEvents.filter(h => h.assetCode === asset.assetCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0">
              <img src={asset.thumbnail} alt={asset.assetName} className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                  {asset.assetCode}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {asset.assetName}
                </h2>
                <span className="text-xs text-slate-400">• {asset.assetType}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isRiskHigh ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                  isRiskMed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                }`}>
                  Risk: {asset.riskLevel} ({asset.riskScore}/100)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Rated: <strong className="text-slate-700 dark:text-slate-300">{asset.ratedCapacity}</strong> | Operating: {asset.runningHours.toLocaleString()} hrs | Starts: {asset.startsCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Health</span>
              <span className={`font-mono text-sm font-bold ${asset.healthScore < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {asset.healthScore}/100
              </span>
            </div>

            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Priority</span>
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                {asset.priority}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Section 19: Overview, Mechanical, Electrical, Thermal, Performance, Environment, Maintenance, History) */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 text-xs font-semibold overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'mechanical', label: 'Mechanical' },
            { id: 'electrical', label: 'Electrical' },
            { id: 'thermal', label: 'Thermal' },
            { id: 'performance', label: 'Performance' },
            { id: 'environment', label: 'Environment' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'history', label: 'History & Audit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Summary Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-400">Current Health &amp; Risk State</span>
                  <span className="text-xs font-mono font-bold text-slate-500">Trend: {asset.riskTrend}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {asset.mainIssue}
                </p>
              </div>

              {/* 6 Condition Modules Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  6-Module Physical Condition Synthesis
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {asset.conditionModules.map(m => (
                    <div key={m.moduleId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">{m.moduleName}</span>
                      <span className={`font-mono text-lg font-bold block mt-1 ${m.score < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {m.score}/100
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Trend Chart */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  7-Day Health vs. Risk Trajectory
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={asset.trend7d}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                      <Line type="monotone" dataKey="healthScore" stroke="#10b981" strokeWidth={2.2} name="Health Score" />
                      <Line type="monotone" dataKey="riskScore" stroke="#f43f5e" strokeWidth={2.2} name="Risk Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Contributors */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Deterministic Risk Contributors
                </h3>
                <div className="space-y-2">
                  {asset.riskContributors.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">{c.source}</span>
                        <span className="text-[11px] text-slate-500">{c.explanation}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">+{c.impact} Risk</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MECHANICAL */}
          {activeTab === 'mechanical' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mechanical Condition Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asset.conditionModules.find(m => m.moduleId === 'mechanical')?.indicators.map(ind => (
                  <div key={ind.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{ind.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'Critical' ? 'bg-rose-500/10 text-rose-600' : ind.status === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {ind.status}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{ind.calculatedValue}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ELECTRICAL */}
          {activeTab === 'electrical' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Electrical &amp; Conversion Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asset.conditionModules.find(m => m.moduleId === 'electrical')?.indicators.map(ind => (
                  <div key={ind.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{ind.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'Critical' ? 'bg-rose-500/10 text-rose-600' : ind.status === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {ind.status}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{ind.calculatedValue}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: THERMAL */}
          {activeTab === 'thermal' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thermal Heat Dissipation Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asset.conditionModules.find(m => m.moduleId === 'thermal')?.indicators.map(ind => (
                  <div key={ind.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{ind.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'Critical' ? 'bg-rose-500/10 text-rose-600' : ind.status === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {ind.status}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{ind.calculatedValue}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aerodynamic Performance &amp; Yaw Accuracy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asset.conditionModules.find(m => m.moduleId === 'performance')?.indicators.map(ind => (
                  <div key={ind.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{ind.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'Critical' ? 'bg-rose-500/10 text-rose-600' : ind.status === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {ind.status}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{ind.calculatedValue}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ENVIRONMENT */}
          {activeTab === 'environment' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wind Resource &amp; Environmental Inflow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asset.conditionModules.find(m => m.moduleId === 'environment')?.indicators.map(ind => (
                  <div key={ind.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{ind.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'Critical' ? 'bg-rose-500/10 text-rose-600' : ind.status === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {ind.status}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{ind.calculatedValue}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance &amp; Compliance Log</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 block mb-1">Last Overhaul</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.lastMaintenanceDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 block mb-1">Next Service</span>
                  <span className={`font-mono font-bold ${asset.isMaintenanceOverdue ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {asset.nextMaintenanceDate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 block mb-1">Service Compliance</span>
                  <span className={`font-bold ${asset.isMaintenanceOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {asset.isMaintenanceOverdue ? 'OVERDUE' : 'COMPLIANT'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 block mb-1">Criticality Rating</span>
                  <span className="font-mono font-bold text-blue-600">{asset.criticality}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Asset Audit &amp; Event History</h3>
              <div className="space-y-2">
                {assetHistory.length > 0 ? (
                  assetHistory.map(evt => (
                    <div key={evt.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{evt.headline}</span>
                          {evt.badge && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {evt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{evt.details}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{evt.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No previous recorded anomaly events for this unit.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
