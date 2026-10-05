import React, { useState } from 'react';
import { 
  X, 
  Thermometer, 
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
  Sliders
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
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { CcgtAsset } from '../types';

interface CcgtAssetDetailModalProps {
  asset: CcgtAsset | null;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type TabType = 'overview' | 'performance' | 'thermal' | 'electrical' | 'mechanical' | 'maintenance' | 'history';

export const CcgtAssetDetailModal: React.FC<CcgtAssetDetailModalProps> = ({
  asset,
  onClose,
  onNavigateToTab
}) => {
  const { historyEvents, setSelectedAlert, alerts } = useCcgtReliability();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!asset) return null;

  const isRiskHigh = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';
  const isRiskMed = asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate';

  // Filter history events for this asset
  const assetHistory = historyEvents.filter(h => h.assetCode === asset.assetCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER SECTION (Section 11 Requirement) */}
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
                Rated: <strong className="text-slate-700 dark:text-slate-300">{asset.ratedCapacity}</strong> | Commissioned: {asset.installationDate} ({asset.assetAgeYears} yrs)
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & Close */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Health</span>
              <span className={`font-mono text-sm font-bold ${asset.healthScore < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {asset.healthScore}/100
              </span>
            </div>

            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Priority</span>
              <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                {asset.priority}
              </span>
            </div>

            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Criticality</span>
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                {asset.criticality}/5
              </span>
            </div>

            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Load</span>
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {asset.telemetry.loadPct}%
              </span>
            </div>

            <div className="text-center px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Output</span>
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {asset.telemetry.mwOutput} MW
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CONDITION SUMMARY: 6 CONDITION CARDS (Section 11 Requirement) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 sm:px-5 bg-slate-100/70 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {asset.conditionModules.map((mod) => {
            const isWarn = mod.status === 'Warning';
            const isCrit = mod.status === 'Critical';

            return (
              <div 
                key={mod.moduleId} 
                className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${
                  isCrit 
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' 
                    : isWarn 
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
                    {mod.moduleName.replace(' Condition', '')}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className={`font-mono text-sm sm:text-base font-bold ${
                      isCrit ? 'text-rose-600 dark:text-rose-400' :
                      isWarn ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {mod.score}/100
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {(mod.weight * 100).toFixed(0)}% Wgt
                    </span>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${
                    isCrit ? 'text-rose-600 dark:text-rose-400' :
                    isWarn ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {mod.status}
                  </span>
                  <span className="text-slate-400">
                    +{mod.riskContribution} Risk
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABS NAVIGATION ROW */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shrink-0 text-xs">
          {[
            { id: 'overview', label: 'Overview & Explainability' },
            { id: 'performance', label: 'Performance' },
            { id: 'thermal', label: 'Thermal' },
            { id: 'electrical', label: 'Electrical' },
            { id: 'mechanical', label: 'Mechanical' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'history', label: `History (${assetHistory.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-2 border-b-2 font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB BODY SCROLL CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">

          {/* TAB 1: OVERVIEW & EXPLAINABILITY */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Primary Issue Highlight Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    Primary Condition Bottleneck
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">
                    Primary Issue: {asset.mainIssue}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Observed Value</span>
                    <strong className={`font-mono text-sm ${asset.triggeredRules.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {asset.triggeredRules[0]
                        ? `${asset.triggeredRules[0].actualValue} ${asset.triggeredRules[0].rule.unit}`
                        : asset.assetCode.startsWith('GT')
                        ? `${asset.telemetry.egtSpreadC}°C Spread`
                        : `${asset.telemetry.vibrationMmS} mm/s`}
                    </strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Allowable Limit</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200 text-sm">
                      {asset.triggeredRules[0]
                        ? `${asset.triggeredRules[0].thresholdExceeded} ${asset.triggeredRules[0].rule.unit} (${asset.triggeredRules[0].severity === 'critical' ? 'Crit' : 'Warn'})`
                        : asset.assetCode.startsWith('GT')
                        ? '15°C Warn / 25°C Crit'
                        : '6.0 mm/s Limit'}
                    </strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <strong className={`text-sm ${asset.triggeredRules.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {asset.triggeredRules[0]
                        ? (asset.triggeredRules[0].severity === 'critical' ? 'Critical Exceedance' : 'Warning Exceedance')
                        : 'Within Normal Baseline'}
                    </strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Risk Impact</span>
                    <strong className={`font-mono text-sm ${asset.triggeredRules.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {asset.triggeredRules[0] ? `+${asset.triggeredRules[0].riskImpact} Contribution` : '0 Impact'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Explainability Section: "Why is GT-2 High Risk?" */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Deterministic Explainability Audit: Why is {asset.assetCode} {asset.riskLevel} Risk?
                </div>

                <div className="space-y-1.5 pt-1">
                  {asset.explainabilitySteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-xs">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Risk Contributors Breakdown */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Main Risk Contributors Breakdown
                </h3>

                <div className="space-y-2">
                  {asset.riskContributors.map((contrib, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{contrib.source}</span>
                          {contrib.ruleId && (
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1 rounded">
                              {contrib.ruleId}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{contrib.explanation}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs block">
                          +{contrib.impact} Risk
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {contrib.value} (Limit: {contrib.threshold})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Trend Visual Chart */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>7-Day Condition Progression Trend (Health vs Risk Score)</span>
                  <span className="text-[11px] font-normal text-slate-400">Reconstructed DCS Archive</span>
                </h3>

                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={asset.trend7d} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
                      <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="healthScore" stroke="#10b981" strokeWidth={2} name="Health Score" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="riskScore" stroke="#f43f5e" strokeWidth={2} name="Risk Score" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Active MW Output</span>
                  <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 block mt-1">{asset.telemetry.mwOutput} MW</span>
                  <span className="text-[10px] text-slate-500">Rated: {asset.ratedCapacity}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Heat Rate</span>
                  <span className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400 block mt-1">
                    {asset.telemetry.heatRateBtuKwh > 0 ? `${asset.telemetry.heatRateBtuKwh} BTU` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">Baseline: {asset.telemetry.baselineHeatRateBtuKwh} BTU</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Thermal Efficiency</span>
                  <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                    {asset.telemetry.efficiencyPct}%
                  </span>
                  <span className="text-[10px] text-slate-500">Carnot cycle basis</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Mass Flow</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">
                    {asset.telemetry.fuelFlowKgS > 0 ? `${asset.telemetry.fuelFlowKgS} kg/s` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">Natural gas (CH₄)</span>
                </div>
              </div>

              {/* Performance Indicator Table */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs mb-2">Calculated Performance Indicators</h4>
                <div className="space-y-2">
                  {asset.conditionModules.find(m => m.moduleId === 'performance')?.indicators.map(ind => (
                    <div key={ind.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{ind.name}</span>
                        <p className="text-[11px] text-slate-500">{ind.explanation}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ind.calculatedValue}</span>
                        <span className="block text-[10px] text-slate-400">Baseline: {ind.baselineValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THERMAL */}
          {activeTab === 'thermal' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">EGT Spread</span>
                  <span className={`font-mono text-lg font-bold block mt-1 ${asset.telemetry.egtSpreadC > 15 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {asset.telemetry.egtSpreadC}°C
                  </span>
                  <span className="text-[10px] text-slate-500">Limit: 15°C Warn / 25°C Crit</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Bearing Metal Temp</span>
                  <span className={`font-mono text-lg font-bold block mt-1 ${asset.telemetry.bearingTempC > 85 ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {asset.telemetry.bearingTempC > 0 ? `${asset.telemetry.bearingTempC}°C` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">Limit: 85°C Warning</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Oil Temperature</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">
                    {asset.telemetry.oilTempC > 0 ? `${asset.telemetry.oilTempC}°C` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">Limit: 75°C Warning</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Exhaust Plenum Temp</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">
                    {asset.telemetry.exhaustTempC > 0 ? `${asset.telemetry.exhaustTempC}°C` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">Flue inlet to HRSG</span>
                </div>
              </div>

              {/* Combustor Annulus Can Thermocouple Matrix (if GT) */}
              {asset.telemetry.combustorCanTemps && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-xs flex items-center justify-between">
                    <span>14-Can Combustor Exhaust Thermocouple Array</span>
                    <span className="text-[10px] font-normal text-slate-400">Mean: {asset.telemetry.avgEgtC}°C</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                    {asset.telemetry.combustorCanTemps.map(can => (
                      <div 
                        key={can.canNumber} 
                        className={`p-2 rounded-lg text-center border ${
                          can.tempC < 585 
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] uppercase block text-slate-400">{can.canLabel}</span>
                        <span className="font-mono text-xs font-bold">{can.tempC}°C</span>
                        {can.tempC < 585 && <span className="block text-[9px] font-bold text-rose-600">Cold Spot</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ELECTRICAL */}
          {activeTab === 'electrical' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Terminal Voltage</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">{asset.telemetry.voltageKV} kV</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Stator Current</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">{asset.telemetry.currentAmps} A</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Power Factor</span>
                  <span className="font-mono text-lg font-bold text-emerald-600 block mt-1">{asset.telemetry.powerFactor}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Grid Sync Frequency</span>
                  <span className="font-mono text-lg font-bold text-blue-600 block mt-1">{asset.telemetry.frequencyHz} Hz</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MECHANICAL */}
          {activeTab === 'mechanical' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Casing Vibration</span>
                  <span className={`font-mono text-lg font-bold block mt-1 ${asset.telemetry.vibrationMmS > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {asset.telemetry.vibrationMmS} mm/s
                  </span>
                  <span className="text-[10px] text-slate-500">ISO 10816 Zone A/B</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Shaft Dynamic Orbit</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">{asset.telemetry.shaftVibrationMmS} mm/s</span>
                  <span className="text-[10px] text-slate-500">Proximity probe #1</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rotor Speed</span>
                  <span className="font-mono text-lg font-bold text-blue-600 block mt-1">{asset.telemetry.rotorRpm} RPM</span>
                  <span className="text-[10px] text-slate-500">60 Hz Synchronous</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lube Header Pressure</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">
                    {asset.telemetry.lubeOilPressureBar > 0 ? `${asset.telemetry.lubeOilPressureBar} bar` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500">Hydraulic margin safe</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Equivalent Operating Hours</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200 block mt-1">{asset.runningHours.toLocaleString()} hrs</span>
                  <span className="text-[10px] text-slate-500">Starts: {asset.startsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Major Overhaul</span>
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 block mt-1">{asset.lastMaintenanceDate}</span>
                  <span className="text-[10px] text-slate-500">{asset.hoursSinceMaintenance} hrs since service</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Service Window</span>
                  <span className={`font-mono text-sm font-bold block mt-1 ${asset.isMaintenanceOverdue ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {asset.nextMaintenanceDate}
                  </span>
                  <span className="text-[10px] text-slate-500">{asset.isMaintenanceOverdue ? 'Overdue!' : 'On schedule'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Recurring Alarms</span>
                  <span className={`font-mono text-lg font-bold block mt-1 ${asset.repeatedIssueCount >= 3 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {asset.repeatedIssueCount} Alarms
                  </span>
                  <span className="text-[10px] text-slate-500">Past faults: {asset.previousFaultCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ASSET HISTORY CHRONOLOGICAL TIMELINE (Section 16 Requirement) */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Chronological Reliability &amp; Maintenance Audit Trail for {asset.assetCode}
                </h4>
                <span className="text-[10px] text-slate-400">{assetHistory.length} Recorded Milestones</span>
              </div>

              <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {assetHistory.map((hist) => (
                  <div key={hist.id} className="relative">
                    <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">{hist.timestamp}</span>
                        {hist.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                            {hist.badge}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{hist.headline}</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{hist.details}</p>
                      {hist.beforeVal && hist.afterVal && (
                        <div className="text-[10px] font-mono text-slate-500 pt-1 flex items-center gap-2">
                          <span>Before: <strong className="text-rose-600 dark:text-rose-400">{hist.beforeVal}</strong></span>
                          <span>→</span>
                          <span>After: <strong className="text-emerald-600 dark:text-emerald-400">{hist.afterVal}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
