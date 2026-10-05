import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Clock, 
  Thermometer, 
  Layers, 
  Zap, 
  BatteryCharging,
  Sun,
  Waves
} from 'lucide-react';
import { SolarAsset, AssetHistoryEvent } from '../types';
import { useSolarReliability } from '../SolarReliabilityContext';

interface SolarAssetDetailModalProps {
  asset: SolarAsset | null;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type SolarTabKey = 
  | 'overview' 
  | 'dc_electrical' 
  | 'conversion_ac' 
  | 'thermal' 
  | 'performance' 
  | 'environment' 
  | 'maintenance' 
  | 'history';

export const SolarAssetDetailModal: React.FC<SolarAssetDetailModalProps> = ({
  asset,
  onClose,
  onNavigateToTab
}) => {
  const { historyEvents } = useSolarReliability();
  const [activeTab, setActiveTab] = useState<SolarTabKey>('overview');

  if (!asset) return null;

  const tel = asset.telemetry;
  const mods = asset.conditionModules;
  const assetEvents = historyEvents.filter(e => e.assetCode === asset.assetCode);

  const TABS: Array<{ key: SolarTabKey; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'dc_electrical', label: 'DC Electrical' },
    { key: 'conversion_ac', label: 'AC / Conversion' },
    { key: 'thermal', label: 'Thermal' },
    { key: 'performance', label: 'Performance' },
    { key: 'environment', label: 'Environment' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'history', label: 'History' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {asset.assetCode}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {asset.assetType} • Rated: {asset.ratedCapacity}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                asset.riskLevel === 'Critical' || asset.riskLevel === 'High'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                  : asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
              }`}>
                {asset.priority} • {asset.riskLevel} Risk ({asset.riskScore}/100)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {asset.assetName} Diagnostic Dossier
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Operating Hours: {asset.runningHours.toLocaleString()} hrs | Criticality: {'★'.repeat(asset.criticality)} | Trend: {asset.riskTrend}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-4 sm:px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shrink-0 text-xs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 6 Condition Module Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.values(mods).map((m) => (
                  <div key={m.moduleName} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between text-center">
                    <span className="text-[10px] text-slate-400 font-semibold truncate block">{m.label}</span>
                    <span className={`text-base font-bold font-mono my-1 ${
                      m.score < 75 ? 'text-rose-600' : m.score < 88 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {m.score}%
                    </span>
                    <span className="text-[9px] text-slate-400">Weight: {(m.weight * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>

              {/* Health & Risk Summary Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Calculated Reliability State
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span>Physical Health Score:</span>
                    <strong className="font-mono text-emerald-600">{asset.healthScore}/100</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Operational Risk Score:</span>
                    <strong className="font-mono text-rose-600">{asset.riskScore}/100 ({asset.riskLevel})</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Priority Dispatch:</span>
                    <span className="font-mono font-bold">{asset.priority}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                    Main Issue: <strong className="text-slate-800 dark:text-slate-200">{asset.mainIssue}</strong>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Active Triggered Condition Rules ({asset.triggeredRules.length})
                  </h4>
                  {asset.triggeredRules.length === 0 ? (
                    <p className="text-slate-400 italic text-[11px]">All configured threshold checks passed normally.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {asset.triggeredRules.map((r) => (
                        <div key={r.ruleId} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                          <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
                            <span>{r.ruleName}</span>
                            <span className="font-mono text-[10px]">+{r.riskImpact} pts</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            Measured: {r.currentValue} {r.unit} (Limit: {r.thresholdValue} {r.unit})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DC ELECTRICAL */}
          {activeTab === 'dc_electrical' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">DC Electrical &amp; Array Telemetry</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">DC Bus Voltage</span>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.voltageV} V DC</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Total DC Current</span>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.currentA} A</div>
                </div>
                {tel.stringCurrentA && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Individual String Current</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.stringCurrentA} A DC</div>
                  </div>
                )}
                {tel.trackerTiltAngleDeg !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Tracker Tilt Angle</span>
                    <div className="text-base font-bold font-mono text-amber-600">{tel.trackerTiltAngleDeg}° (Target: {tel.expectedTiltAngleDeg}°)</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AC / CONVERSION */}
          {activeTab === 'conversion_ac' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Inverter Conversion &amp; AC Output Telemetry</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Active Power Generation</span>
                  <div className="text-base font-bold font-mono text-sky-600">{tel.activePowerOutputMW} MW</div>
                </div>
                {tel.inverterEfficiencyPct !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Conversion Efficiency</span>
                    <div className={`text-base font-bold font-mono ${tel.inverterEfficiencyPct < 96 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tel.inverterEfficiencyPct}%
                    </div>
                  </div>
                )}
                {tel.thdPercent !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Total Harmonic Distortion (THD)</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.thdPercent}%</div>
                  </div>
                )}
                {tel.transformerLoadingPct !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Transformer MVA Loading</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.transformerLoadingPct}%</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: THERMAL */}
          {activeTab === 'thermal' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Thermal Subsystem Indicators</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tel.igbtTempC !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">IGBT Junction Temp</span>
                    <div className={`text-base font-bold font-mono ${tel.igbtTempC >= 75 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                      {tel.igbtTempC}°C
                    </div>
                  </div>
                )}
                {tel.moduleTempC !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Module Surface Temp</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.moduleTempC}°C</div>
                  </div>
                )}
                {tel.topOilTempC !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">Transformer Top Oil Temp</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.topOilTempC}°C</div>
                  </div>
                )}
                {tel.bessCellMaxTempC !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-[10px] text-slate-400">BESS Cell Max Temp</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{tel.bessCellMaxTempC}°C</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Yield &amp; Performance Model</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Asset yield compared against astronomical Plane-of-Array irradiance model and inverter thermal derating profile.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Performance Module Score</span>
                  <div className="text-base font-bold font-mono text-emerald-600">{mods.performance.score}/100</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Generation Yield Status</span>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {mods.performance.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ENVIRONMENT */}
          {activeTab === 'environment' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Meteorological Operating Environment</h4>
              <p className="text-slate-500 text-xs">Reference parameters from MET-01 station:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400">GHI Irradiance</span>
                  <div className="font-mono font-bold text-amber-600 text-sm">876 W/m²</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400">POA Irradiance</span>
                  <div className="font-mono font-bold text-amber-600 text-sm">912 W/m²</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400">Ambient Temp</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">29.8°C</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400">Wind Speed</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">3.4 m/s</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Field Maintenance &amp; Overhaul Timeline</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Last Service Date</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.lastMaintenanceDate}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Next Scheduled Service</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.nextMaintenanceDate}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-400">Operating Hours Since Service</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.hoursSinceMaintenance} hrs</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Asset Event &amp; Degradation History</h4>
              {assetEvents.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">No critical state transition events logged for this asset.</p>
              ) : (
                <div className="space-y-2">
                  {assetEvents.map((evt) => (
                    <div key={evt.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{evt.headline}</span>
                        <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">{evt.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Dossier compiled from verified SCADA registers &amp; IEC 61850 protocol streams.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
