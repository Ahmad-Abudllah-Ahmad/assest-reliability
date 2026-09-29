import React, { useState, useEffect } from 'react';

const SHOW_EQUIPMENT_THUMBNAILS = true;

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Sun,
  Zap,
  Gauge,
  Droplets,
  ShieldCheck,
  BatteryCharging,
  Cpu,
  Compass,
  Sparkles,
  AlertTriangle,
  Wrench,
  HelpCircle,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  Download,
  Flag,
  ShieldAlert,
  Layers,
  Plus,
  Activity,
  Calendar,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { InvestigationDrawer } from '../InvestigationDrawer';
import {
  SOLAR_INVERTERS,
  SOLAR_TRACKERS,
  SOLAR_BESS,
  SOLAR_GENERATION_CURVE,
  SOLAR_KPIS,
  SOLAR_ANOMALIES,
  SOLAR_WATERFALL,
  SOLAR_STRING_SPREAD,
  SOLAR_INSPECTIONS,
  SOLAR_MAINT_HISTORY,
  SOLAR_PR_12M,
  SOLAR_FAILURE_DONUT,
  SOLAR_TASKS,
  SOLAR_CASES,
  SOLAR_CASE_TELEMETRY,
  SOLAR_BESS_SOC,
  InverterStatus,
  TrackerStatus,
  MotorHealth,
  SolarInverter
} from '../../data/solarFarmMockData';
import { TOOLTIP_STYLE, MiniSpark, severityPill, heatCell } from './chartTheme';

function invPill(status: InverterStatus) {
  if (status === 'Online') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
  if (status === 'Derated') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
}

function trackerPill(status: TrackerStatus) {
  if (status === 'Tracking') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
  if (status === 'Stowed') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
  return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
}

function motorPill(health: MotorHealth) {
  return health === 'Healthy'
    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
}

function metricTone(warning: boolean, critical = false) {
  if (critical) return 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200';
  if (warning) return 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200';
  return 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
}

// --- MODAL COMPONENT ---
function SolarAssetModal({ inv, onClose, showToast, handleLogCaseFromAsset, getActiveCaseForAsset }: any) {
  const effData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    efficiency: Number(Math.max(90, inv.efficiencyPct + ((15 - i) * 0.1)).toFixed(1))
  }));

  const activeCase = getActiveCaseForAsset(inv.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700/80 p-1 overflow-hidden flex items-center justify-center shadow-xs">
              <img 
                src={
                  inv.category?.includes('Tracker') 
                    ? '/images/thumbnails/solar-tracker-3d.png' 
                    : inv.category?.includes('BESS') || inv.name?.includes('BESS') 
                      ? '/images/thumbnails/bess-container-3d.png' 
                      : '/images/thumbnails/solar-inverter-3d.png'
                } 
                alt={inv.name} 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Solar Inverter Diagnostic Overview</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${invPill(inv.status)}`}>{inv.status}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{inv.id} • {inv.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Inverter Efficiency Trend (30-Day)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={effData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} interval={6} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <ReferenceLine y={96} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Baseline Efficiency 96%', fill: '#f43f5e', fontSize: 10 }} />
                  <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Live Telemetry Parameter Grid</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">AC Power</span><span className="font-mono font-bold text-sm">{inv.acPowerKw} kW</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">DC Voltage</span><span className="font-mono font-bold text-sm">{inv.dcVoltageV} V</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">DC Current</span><span className="font-mono font-bold text-sm">{inv.dcCurrentA} A</span></div>
              <div className={`p-3 rounded-lg border text-xs ${inv.internalTempC > 55 ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}><span className="text-slate-500 block mb-1">Internal Temp</span><span className="font-mono font-bold text-sm">{inv.internalTempC}°C</span></div>
              <div className={`p-3 rounded-lg border text-xs ${inv.efficiencyPct < 96 && inv.efficiencyPct > 0 ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}><span className="text-slate-500 block mb-1">Efficiency</span><span className="font-mono font-bold text-sm">{inv.efficiencyPct}%</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2">
              <Sparkles className="h-4 w-4" /> Plain-English AI Diagnostics
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              DC-link capacitor ESR increasing linearly. Pattern matches thermal aging in central inverters. Efficiency has dropped to {inv.efficiencyPct}%. Estimated failure in {inv.rulMonths} months if unresolved.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-3">
          <button onClick={() => {
            handleLogCaseFromAsset({
              code: inv.id,
              name: inv.name,
              healthScore: inv.efficiencyPct < 93 || inv.status === 'Fault' ? 74 : inv.status === 'Derated' ? 84 : 95,
              aiSummary: `DC-link capacitor ESR increasing linearly. Pattern matches thermal aging in central inverters. Efficiency has dropped to ${inv.efficiencyPct}%. Estimated failure in ${inv.rulMonths} months if unresolved.`,
              compactMetrics: [
                { label: 'DC Voltage', value: `${inv.dcVoltageV.toLocaleString()} V`, status: 'normal' },
                { label: 'AC Output', value: `${inv.acPowerKw.toLocaleString()} kW`, status: 'normal' },
                { label: 'Inverter Internal Temp', value: `${inv.internalTempC} °C`, status: 'warning' },
                { label: 'Efficiency', value: `${inv.efficiencyPct} %`, status: 'warning' }
              ],
              healthTrend7d: distinctHealthTrend(inv.efficiencyPct < 93 ? 74 : 95, Number(String(inv.id).replace(/\D/g, '') || 1))
            });
            onClose();
          }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition">
            <Wrench className="h-4 w-4" /> {activeCase ? `View ${activeCase.id}` : 'Log Inverter Case'}
          </button>
          <button onClick={() => { showToast('Technician Assigned', 'O&M crew dispatched.'); onClose(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"><UserPlus className="h-4 w-4" /> Assign Field Technician</button>
          <button onClick={() => { showToast('Report Exported', 'Thermal drone scan downloaded.'); onClose(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"><Download className="h-4 w-4" /> Export Thermal Scan Report</button>
          <button onClick={() => { showToast('Isolation Flagged', 'DC strings flagged for manual isolation.'); onClose(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"><Flag className="h-4 w-4" /> Flag DC Isolation Required</button>
        </div>
      </div>
    </div>
  );
}

function OverviewPage({ onNavigateToCatalog }: { onNavigateToCatalog?: () => void }) {
  const soilingColor = SOLAR_KPIS.soilingLossPct > 5 ? '#f43f5e' : SOLAR_KPIS.soilingLossPct >= 2 ? '#f59e0b' : '#10b981';

  const CustomSolarCurveTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs min-w-[150px]">
          <p className="font-bold text-slate-100 mb-1 border-b border-slate-700 pb-1">
            {data.time || 'Time'}
          </p>
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.fill || entry.stroke || '#fff';
            return (
              <div key={index} className="flex justify-between items-center gap-3 mt-1">
                <span style={{ color }} className="font-bold">{entry.name}</span>
                <span className="font-mono font-bold text-slate-100">{entry.value}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3.5 animate-fadeIn">
      {/* 5 KPIs Row */}
      <section aria-label="Solar farm KPIs" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 2xl:gap-3 shrink-0">
        {[
          { hover: 'hover:border-blue-400 dark:hover:border-blue-500', label: 'Total Farm Output', value: String(SOLAR_KPIS.totalOutputMw), unit: 'MW', sub: `/ ${SOLAR_KPIS.capacityMwp} MWp`, badge: `${((SOLAR_KPIS.totalOutputMw / SOLAR_KPIS.capacityMwp) * 100).toFixed(1)}% of Capacity`, badgeCls: 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20' },
          { hover: 'hover:border-cyan-400 dark:hover:border-cyan-500', label: 'Performance Ratio', value: `${SOLAR_KPIS.performanceRatioPct}`, unit: '%', sub: 'overall', badge: 'Energy / expected', badgeCls: 'text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/20' },
          { hover: 'hover:border-emerald-400 dark:hover:border-emerald-500', label: 'Specific Yield', value: `${SOLAR_KPIS.specificYield}`, unit: 'kWh/kWp', sub: 'today', badge: 'Today', badgeCls: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
          { hover: 'hover:border-amber-400 dark:hover:border-amber-500', label: 'Soiling Loss', value: `${SOLAR_KPIS.soilingLossPct}`, unit: '%', sub: 'estimated', badge: 'Estimated', badgeCls: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20' },
          { hover: 'hover:border-blue-400 dark:hover:border-blue-500', label: 'Inverter Availability', value: `${SOLAR_KPIS.inverterAvailabilityPct}`, unit: '%', sub: 'live', badge: 'Live', badgeCls: 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20' }
        ].map((k) => (
          <div key={k.label} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between transition ${k.hover}`}>
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] 2xl:text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px] 2xl:text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {k.label}
                </span>
                <span className={`font-bold px-1.5 py-0.5 rounded-full text-[10px] border truncate ${k.badgeCls}`}>{k.badge}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1 2xl:mt-1.5">
                <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">{k.value}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{k.unit}</span>
                {k.sub && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-0.5 truncate">{k.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content Grid: Balanced Left & Right Columns */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3.5">
        
        {/* Left Column (8 cols): Actual vs Expected Generation & Loss Waterfall */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 2xl:gap-3.5 h-full min-h-0">
          
          {/* Card 1: Actual vs Expected Generation */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Actual vs Expected Generation
              </h3>
              <span className="text-[10px] text-slate-400">Irradiance-based expected vs actual AC output</span>
            </div>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={SOLAR_GENERATION_CURVE} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="time" interval={3} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} unit=" MW" />
                  <Tooltip content={<CustomSolarCurveTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="actualMw" name="Actual AC" stroke="#f59e0b" fill="url(#pvFill)" strokeWidth={2} />
                  <Line type="monotone" dataKey="expectedMw" name="Expected (irradiance)" stroke="#3b82f6" strokeDasharray="6 4" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Loss Waterfall */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Loss Waterfall
              </h3>
              <span className="text-[10px] text-slate-400">System derates and balance-of-plant loss breakdown</span>
            </div>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SOLAR_WATERFALL} margin={{ top: 6, right: 8, left: -14, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 8.5, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={26} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} unit=" MW" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any, _n: any, item: any) => [item.payload.display, 'MW']} />
                  <Bar dataKey="base" stackId="w" fill="transparent" />
                  <Bar dataKey="amount" stackId="w" radius={[4, 4, 0, 0]}>
                    {SOLAR_WATERFALL.map((r) => <Cell key={r.name} fill={r.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Soiling & Cleaning ROI & Critical Anomaly Feed */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 2xl:gap-3.5 h-full min-h-0">
          
          {/* Card 3: Soiling & Cleaning ROI */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Soiling & Cleaning ROI
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+$2,100 ROI</span>
            </div>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="58%" outerRadius="95%" data={[{ name: 'Soiling', value: SOLAR_KPIS.soilingLossPct, fill: soilingColor }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" maxBarSize={12} background={{ fill: '#e2e8f0' }} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 dark:fill-slate-100" style={{ fontSize: 18, fontWeight: 800 }}>{SOLAR_KPIS.soilingLossPct}%</text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center shrink-0 pt-1">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5"><span className="text-slate-400 block text-[9px]">Days clean</span><strong className="text-slate-900 dark:text-slate-100">14d</strong></div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 p-1.5 bg-amber-50/50 dark:bg-amber-950/20"><span className="text-slate-400 block text-[9px]">AI Action</span><strong className="text-amber-700 dark:text-amber-300">Clean in 3d</strong></div>
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 p-1.5 bg-emerald-50/50 dark:bg-emerald-950/20"><span className="text-slate-400 block text-[9px]">Net ROI</span><strong className="text-emerald-700 dark:text-emerald-300">+$2,100</strong></div>
            </div>
          </div>

          {/* Card 4: Critical Anomaly Feed */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Critical Anomaly Feed
              </h3>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
                {SOLAR_ANOMALIES.length} Active
              </span>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 pt-1.5 overflow-hidden">
              {SOLAR_ANOMALIES.map((a) => (
                <div key={a.id} className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 rounded-xl p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">{a.asset}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${severityPill(a.severity)}`}>{a.severity}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{a.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function distinctHealthTrend(healthScore: number, idx: number) {
  const labels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Now'];
  const bump = idx % 5;
  const wave = idx % 2 === 0 ? 1 : -1;
  let series: number[];
  if (healthScore < 80) {
    series = [92, 89, 85, 82, 78, 74, 71].map((v, i) => v - bump + (i === idx % 7 ? wave : 0));
  } else if (healthScore < 90) {
    series = [95, 94, 92, 90, 88, 86, 84].map((v, i) => v - (bump % 3) + ((idx + i) % 2));
  } else {
    series = [98, 97, 98, 99, 98, 97, 98].map((v, i) => Math.min(99, Math.max(96, v + (bump % 3) - 1 + (i === (idx % 7) ? wave : 0))));
  }
  return labels.map((day, i) => ({ day, score: Math.max(68, Math.min(99, series[i])) }));
}

function AssetsPage({ showToast, cases, handleLogCaseFromAsset, getActiveCaseForAsset }: any) {
  const [filter, setFilter] = useState<'all' | 'attention' | 'optimal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [modalAsset, setModalAsset] = useState<SolarInverter | null>(null);

  const metricStatus = (warning: boolean, critical: boolean): 'normal' | 'warning' | 'critical' =>
    critical ? 'critical' : warning ? 'warning' : 'normal';

  const makeTrend = (healthScore: number, seed: number) => distinctHealthTrend(healthScore, seed);

  const inverterCards = SOLAR_INVERTERS.map((inv, idx) => {
    const tempWarn = inv.internalTempC >= 50 && inv.internalTempC <= 55;
    const tempCrit = inv.internalTempC > 55;
    const effWarn = inv.efficiencyPct >= 93 && inv.efficiencyPct <= 96;
    const effCrit = inv.efficiencyPct > 0 && inv.efficiencyPct < 93;
    let healthScore = 96 - (idx % 4);
    if (inv.status === 'Fault') healthScore = 68;
    else if (effCrit) healthScore = 74;
    else if (inv.status === 'Derated' || tempCrit) healthScore = 83;
    else if (effWarn || tempWarn) healthScore = 88;
    const compactMetrics = [
      { label: 'DC Voltage', value: `${inv.dcVoltageV.toLocaleString()} V`, status: inv.dcVoltageV < 100 ? 'critical' as const : 'normal' as const },
      { label: 'AC Output', value: `${inv.acPowerKw.toLocaleString()} kW`, status: inv.status === 'Fault' ? 'critical' as const : inv.status === 'Derated' ? 'warning' as const : 'normal' as const },
      { label: 'Internal Temp', value: `${inv.internalTempC} °C`, status: metricStatus(tempWarn, tempCrit) },
      { label: 'Efficiency', value: `${inv.efficiencyPct} %`, status: metricStatus(effWarn, effCrit) }
    ];
    const expandedMetrics = [
      ...compactMetrics,
      { label: 'DC Current', value: `${inv.dcCurrentA} A`, status: 'normal' as const },
      { label: 'Daily Energy', value: `${inv.dailyEnergyMwh} MWh`, status: 'normal' as const },
      { label: 'Expected Output', value: `${inv.expectedDailyMwh} MWh`, status: inv.dailyEnergyMwh < inv.expectedDailyMwh * 0.9 ? 'warning' as const : 'normal' as const },
      { label: 'Inverter RUL', value: `${inv.rulMonths} months`, status: inv.rulMonths < 12 ? 'warning' as const : 'normal' as const }
    ];
    let aiSummary = `${inv.id} string MPPT voltages and conversion efficiency are tracking the irradiance model. Thermal envelope is stable at ${inv.internalTempC}°C.`;
    if (inv.id === 'INV-04' || effCrit) {
      aiSummary = `${inv.id} conversion efficiency dropped to ${inv.efficiencyPct}% under full irradiance. High ESR signature indicates DC-link capacitor bank thermal stress.`;
    } else if (inv.status === 'Fault') {
      aiSummary = `${inv.id} is offline with DC voltage collapsed to ${inv.dcVoltageV} V. Isolate the block and inspect AC breaker and IGBT stack before re-energizing.`;
    } else if (tempCrit) {
      aiSummary = `${inv.id} internal temperature at ${inv.internalTempC}°C. Cooling fan or filter restriction likely; thermal derate will begin at 60°C.`;
    }
    return {
      caseId: inv.id,
      code: inv.id,
      name: 'SMA Sunny Central 2500-EV',
      category: 'Central Inverter',
      ratedCapacity: '2.5 MVA',
      healthScore,
      statusText: healthScore < 80 ? 'Critical Advisory' : healthScore < 90 ? 'Under Advisory' : 'Optimal',
      compactMetrics,
      expandedMetrics,
      aiSummary,
      healthTrend7d: makeTrend(healthScore, idx),
      inverter: inv
    };
  });

  const trackerCards = SOLAR_TRACKERS.map((z, idx) => {
    const degraded = z.motorHealth === 'Degraded' || z.trackingStatus !== 'Tracking';
    const healthScore = z.trackingStatus === 'Stowed' && z.motorHealth === 'Degraded' ? 82 : degraded ? 87 : 96 - idx;
    const letter = z.id.replace('ZONE-', '');
    const compactMetrics = [
      { label: 'Tilt Angle', value: `${z.tiltDeg}°`, status: z.trackingStatus === 'Stowed' ? 'warning' as const : 'normal' as const },
      { label: 'Motor Draw', value: z.motorHealth === 'Degraded' ? '3.8 A' : '1.4 A', status: z.motorHealth === 'Degraded' ? 'warning' as const : 'normal' as const },
      { label: 'Wind Stow', value: z.trackingStatus === 'Stowed' ? 'Active' : 'Armed', status: z.trackingStatus === 'Stowed' ? 'warning' as const : 'normal' as const },
      { label: 'Tracking Status', value: z.trackingStatus === 'Tracking' ? 'Optimal' : z.trackingStatus, status: z.trackingStatus === 'Tracking' ? 'normal' as const : 'warning' as const }
    ];
    const expandedMetrics = [
      ...compactMetrics,
      { label: 'Motor Health', value: z.motorHealth, status: z.motorHealth === 'Degraded' ? 'warning' as const : 'normal' as const },
      { label: 'Tracker Rows', value: 'Rows 1–24', status: 'normal' as const },
      { label: 'Controller', value: z.trackingStatus === 'Manual' ? 'Local override' : 'SCADA auto', status: z.trackingStatus === 'Manual' ? 'warning' as const : 'normal' as const }
    ];
    const aiSummary = degraded
      ? `${z.name} stalled at ${z.tiltDeg}°. Motor controller ${z.motorHealth === 'Degraded' ? 'unresponsive' : 'in manual'}. Zone energy loss until rows are released to solar noon tracking.`
      : `${z.name} single-axis trackers following the sun path. Motor current 1.4 A, wind-stow circuit armed.`;
    return {
      caseId: z.id,
      code: `TRK-Zone ${letter}`,
      name: 'Nextracker Horizon Gen 3',
      category: 'Single-Axis Tracker',
      ratedCapacity: 'Zone block',
      healthScore,
      statusText: healthScore < 90 ? 'Under Advisory' : 'Optimal',
      compactMetrics,
      expandedMetrics,
      aiSummary,
      healthTrend7d: makeTrend(healthScore, idx + 10),
      inverter: null as SolarInverter | null
    };
  });

  const sohPct = Number((100 - (SOLAR_BESS.cycleCount / SOLAR_BESS.ratedCycles) * 8).toFixed(1));
  const bessHealth = SOLAR_BESS.cellTempC > 35 ? 86 : 97;
  const bessCard = {
    caseId: SOLAR_BESS.id,
    code: SOLAR_BESS.id,
    name: 'Tesla Megapack 2XL - 3.9 MWh',
    category: 'Battery Energy Storage',
    ratedCapacity: '3.9 MWh',
    healthScore: bessHealth,
    statusText: bessHealth < 90 ? 'Under Advisory' : 'Optimal',
    compactMetrics: [
      { label: 'State of Charge', value: `${SOLAR_BESS.socPct} %`, status: 'normal' as const },
      { label: 'Pack Temp', value: `${SOLAR_BESS.cellTempC} °C`, status: SOLAR_BESS.cellTempC > 35 ? 'warning' as const : 'normal' as const },
      { label: 'Discharge Rate', value: `${Math.abs(SOLAR_BESS.powerMw)} MW`, status: 'normal' as const },
      { label: 'State of Health', value: `${sohPct} %`, status: sohPct < 90 ? 'warning' as const : 'normal' as const }
    ],
    expandedMetrics: [
      { label: 'State of Charge', value: `${SOLAR_BESS.socPct} %`, status: 'normal' as const },
      { label: 'Pack Temp', value: `${SOLAR_BESS.cellTempC} °C`, status: SOLAR_BESS.cellTempC > 35 ? 'warning' as const : 'normal' as const },
      { label: 'Discharge Rate', value: `${Math.abs(SOLAR_BESS.powerMw)} MW`, status: 'normal' as const },
      { label: 'State of Health', value: `${sohPct} %`, status: 'normal' as const },
      { label: 'Dispatch Mode', value: SOLAR_BESS.mode, status: 'normal' as const },
      { label: 'Cycle Count', value: `${SOLAR_BESS.cycleCount.toLocaleString()} / ${SOLAR_BESS.ratedCycles.toLocaleString()}`, status: 'normal' as const }
    ],
    aiSummary: `BESS-01 rack temperatures ${SOLAR_BESS.cellTempC}°C with SOC at ${SOLAR_BESS.socPct}%. Cycle life ${sohPct}% SOH. Dispatch following peak-shave schedule.`,
    healthTrend7d: makeTrend(bessHealth, 20),
    inverter: null as SolarInverter | null
  };

  const fleetCards = [...inverterCards, ...trackerCards, bessCard];
  const attentionCount = fleetCards.filter(a => a.healthScore < 90).length;
  const optimalCount = fleetCards.filter(a => a.healthScore >= 90).length;

  const filteredAssets = fleetCards.filter(asset => {
    if (filter === 'attention' && asset.healthScore >= 90) return false;
    if (filter === 'optimal' && asset.healthScore < 90) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (![asset.name, asset.code, asset.category, asset.statusText, asset.caseId].some((s) => s.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const renderSparkline = (trend: { day: string; score: number }[]) => {
    if (!trend || trend.length === 0) return null;
    const min = 70;
    const max = 100;
    const width = 120;
    const height = 32;
    const points = trend.map((t, idx) => {
      const x = (idx / (trend.length - 1)) * width;
      const y = height - ((t.score - min) / (max - min)) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');
    const lastScore = trend[trend.length - 1].score;
    const strokeColor = lastScore >= 90 ? '#10b981' : lastScore >= 80 ? '#f59e0b' : '#f43f5e';
    return (
      <div className="flex items-center gap-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
          {trend.map((t, idx) => {
            const x = (idx / (trend.length - 1)) * width;
            const y = height - ((t.score - min) / (max - min)) * (height - 6) - 3;
            if (idx === trend.length - 1) {
              return <circle key={idx} cx={x} cy={y} r="3.5" fill={strokeColor} stroke="#ffffff" strokeWidth={1.5} />;
            }
            return null;
          })}
        </svg>
        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">{lastScore}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {modalAsset && <SolarAssetModal inv={modalAsset} onClose={() => setModalAsset(null)} showToast={showToast} handleLogCaseFromAsset={handleLogCaseFromAsset} getActiveCaseForAsset={getActiveCaseForAsset} />}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Solar Farm Monitored Assets
            </h2>
            <span className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              Inverters, Trackers & BESS Subsystems
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Telemetry surveillance covering string-level MPPT voltages, inverter conversion efficiency, and single-axis tracker alignment.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg">
            12 Units Optimal (90%+ Health)
          </span>
          <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-lg">
            2 Units Under Advisory
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Subsystems ({fleetCards.length})
          </button>
          <button
            onClick={() => setFilter('attention')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              filter === 'attention'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Under Advisory ({attentionCount})
          </button>
          <button
            onClick={() => setFilter('optimal')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              filter === 'optimal'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Optimal Base ({optimalCount})
          </button>
        </div>

        {/* Live Filter Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, name, or fault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 2xl:gap-5">
        {filteredAssets.map((asset) => {
          const isAttention = asset.healthScore < 90;
          const isCritical = asset.healthScore < 80;
          const isExpanded = expandedAssetId === asset.code;
          const activeCase = getActiveCaseForAsset(asset.caseId);
          const metrics = isExpanded ? asset.expandedMetrics : asset.compactMetrics;

          return (
            <div
              key={asset.code}
              onClick={() => setExpandedAssetId(prev => prev === asset.code ? null : asset.code)}
              className={`w-full bg-white dark:bg-slate-800 border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer group ${
                isExpanded
                  ? 'ring-2 ring-blue-500/40 border-blue-400 dark:border-blue-500 shadow-md'
                  : isCritical
                  ? 'border-rose-300/80 dark:border-rose-900/60 hover:border-rose-400'
                  : isAttention
                  ? 'border-amber-300/80 dark:border-amber-900/60 bg-amber-500/5 dark:bg-amber-950/20 hover:border-amber-400'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="flex gap-3">
                    {SHOW_EQUIPMENT_THUMBNAILS && (
                      <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700/80 p-1 overflow-hidden flex items-center justify-center shadow-xs group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
                        <img 
                          src={
                            asset.category.includes('Inverter') 
                              ? '/images/thumbnails/solar-inverter-3d.png' 
                              : asset.category.includes('Tracker') 
                                ? '/images/thumbnails/solar-tracker-3d.png' 
                                : '/images/thumbnails/bess-container-3d.png'
                          } 
                          alt={asset.category} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {asset.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {asset.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {asset.category} • {asset.ratedCapacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                        : isAttention
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-500' : isAttention ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {asset.healthScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{asset.statusText}</span>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="my-3.5 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-1.5">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Activity className="h-3.5 w-3.5" />
                        Live Sensor Telemetry
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Click card to collapse</span>
                    </div>
                    <div className="space-y-1.5">
                      {metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            m.status === 'critical'
                              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200'
                              : m.status === 'warning'
                              ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">{m.label}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{m.status} Sensor State</span>
                          </div>
                          <span className="font-mono font-bold text-xs shrink-0 text-slate-900 dark:text-slate-100 whitespace-nowrap">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 my-3">
                    {metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-xs flex flex-col justify-between min-h-[50px] ${
                          m.status === 'critical'
                            ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200'
                            : m.status === 'warning'
                            ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                        title={`${m.label}: ${m.value}`}
                      >
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate block" title={m.label}>{m.label}</span>
                        <span className="font-mono font-bold text-xs mt-1 text-slate-900 dark:text-slate-100 truncate block">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">7-Day Trend</div>
                  {renderSparkline(asset.healthTrend7d)}
                </div>

                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isAttention
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Sparkles className={`h-3.5 w-3.5 ${isAttention ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    <span className="text-slate-900 dark:text-slate-100">Surveillance Insight:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{asset.aiSummary}</p>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (asset.inverter) setModalAsset(asset.inverter);
                    else showToast('Diagnostics', `Opening field diagnostic package for ${asset.code}`);
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open Deep Diagnostic Modal"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Diagnostics</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedAssetId(prev => prev === asset.code ? null : asset.code); }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title={isExpanded ? 'Collapse data' : 'Expand telemetry data'}
                  >
                    <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogCaseFromAsset(asset);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeCase
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={activeCase ? `View Active Case: ${activeCase.id}` : 'Log Investigation Case'}
                  >
                    <Wrench className="h-3 w-3" />
                    <span>{activeCase ? activeCase.id : 'Log'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaintenancePage({ maintLogs }: { maintLogs: any[] }) {
  const knownLogs = maintLogs.filter((h) => !h.unknown);
  const headerWhen = knownLogs[0]?.when || 'Last 12 days';

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-5 py-4 shadow-xs flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Wrench className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Maintenance & Inspections — Solar
        </h2>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Last 12 Days
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {SOLAR_INSPECTIONS.map((ins) => (
          <div key={ins.id} className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-5 py-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">{ins.id}</span>
                <div className="flex items-start gap-2 mt-1.5">
                  <Sun className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{ins.title}</p>
                    <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{ins.detail}</p>
                  </div>
                </div>
              </div>
              <span className={`shrink-0 text-[10px] uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${severityPill(ins.urgency)}`}>{ins.urgency}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Maintenance History Timeline
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{headerWhen}</span>
          </div>
          <div className="space-y-1">
            {maintLogs.map((h) => (
              h.unknown ? (
                <div key={h.id} className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs mb-1.5">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{h.text}</p>
                    <p className="text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1 text-[11px]">
                      <HelpCircle className="h-3 w-3" /> Unknown cause — AI flagged, no matching signature
                    </p>
                  </div>
                  <span className="text-slate-400 whitespace-nowrap shrink-0">{h.when}</span>
                </div>
              ) : (
                <div key={h.id} className="flex items-start justify-between gap-3 px-1 py-2 text-xs">
                  <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    {h.text}
                  </p>
                  <span className="text-slate-400 whitespace-nowrap shrink-0">{h.when}</span>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Performance Ratio — 12 months</h3>
            <div className="h-52 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SOLAR_PR_12M} margin={{ top: 8, right: 28, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Min PR', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                  <Line type="monotone" dataKey="prPct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Failure Category Breakdown</h3>
            <div className="h-44 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SOLAR_FAILURE_DONUT} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>
                    {SOLAR_FAILURE_DONUT.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, n: any) => [`${v}%`, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptimizerPage({ showToast, tasks, handleDispatchTask, onNavigateToCases }: any) {
  const [sortBy, setSortBy] = useState<'priority' | 'savings' | 'downtime'>('priority');

  const sortedTasks = [...tasks].sort((a: any, b: any) => {
    if (sortBy === 'savings') return parseInt(b.yieldSaved.replace(/\D/g, '')) - parseInt(a.yieldSaved.replace(/\D/g, ''));
    if (sortBy === 'downtime') return a.downtime.length - b.downtime.length; // Mock sort
    return a.rank - b.rank;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">Primary Plant Bottleneck</h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">INV-04 capacitor failure will shut down 10% of farm in 18 days.</p>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" /> Task Optimizer — Solar Farm</h2>
            <p className="text-xs text-slate-500 mt-1">Deterministic optimization ranking maintenance tasks by financial revenue yield.</p>
          </div>
          <button onClick={() => showToast('Report Downloaded', 'Solar Shift Priority Brief saved to disk')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition">
            <Download className="h-4 w-4" /> Export Solar O&M Brief (PDF)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"><span className="text-xs uppercase font-medium text-emerald-800 dark:text-emerald-300">Revenue Recovery</span><div className="font-mono font-extrabold text-xl text-emerald-950 dark:text-emerald-100 mt-1">$28.5K / day</div></div>
          <div className="bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4"><span className="text-xs uppercase font-medium text-blue-800 dark:text-blue-300">Downtime Avoided</span><div className="font-mono font-extrabold text-xl text-blue-950 dark:text-blue-100 mt-1">10% Array</div></div>
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4"><span className="text-xs uppercase font-medium text-slate-600">Active Tasks</span><div className="font-mono font-extrabold text-xl mt-1">5</div></div>
          <div className="bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl p-4"><span className="text-xs uppercase font-medium text-purple-800 dark:text-purple-300">Avg ROI</span><div className="font-mono font-extrabold text-xl text-purple-950 dark:text-purple-100 mt-1">12x</div></div>
        </div>

        <div className="flex items-center gap-2 mt-4 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button onClick={() => setSortBy('priority')} className={`px-3 py-1 rounded-lg font-bold text-xs ${sortBy === 'priority' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>AI Priority</button>
          <button onClick={() => setSortBy('savings')} className={`px-3 py-1 rounded-lg font-bold text-xs ${sortBy === 'savings' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Highest Savings ($)</button>
          <button onClick={() => setSortBy('downtime')} className={`px-3 py-1 rounded-lg font-bold text-xs ${sortBy === 'downtime' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Shortest Downtime</button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div key={task.rank} className={`w-full bg-white dark:bg-slate-800 border rounded-xl p-5 shadow-xs ${task.rank === 1 ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex gap-3">
                <span className="text-slate-500 font-bold text-lg">{task.rank}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{task.title}</h3>
                    <span onClick={() => { onNavigateToCases(); }} className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border cursor-pointer hover:bg-emerald-100 transition">{task.caseId}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Asset: {task.asset}</p>
                </div>
              </div>
            </div>
            
            <div className="my-3.5 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1"><Sparkles className="h-3.5 w-3.5" /> AI Ranking Rationale</div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{task.rationale}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs"><span className="uppercase font-medium text-emerald-800 dark:text-emerald-300">Revenue Recovery</span><p className="font-mono font-bold text-sm mt-1 text-emerald-700 dark:text-emerald-400">{task.yieldSaved}</p></div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"><span className="uppercase font-medium text-slate-500">Downtime Avoided</span><p className="font-semibold text-sm mt-1">{task.downtime}</p></div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"><span className="uppercase font-medium text-slate-500">Duration</span><p className="font-semibold text-sm mt-1">1 Shift</p></div>
              <div className={`p-3 rounded-lg border text-xs ${task.clearance === 'safe' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}><span className="uppercase font-medium text-slate-500">Clearance</span><p className="font-semibold text-sm mt-1">{task.clearance === 'safe' ? '🟢' : '🔴'} {task.clearanceText}</p></div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center mt-3">
              <span className="text-xs text-slate-500">Audit log will be registered.</span>
              <button onClick={() => handleDispatchTask(task.caseId, task.asset, task.caseId)} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition"><Wrench className="h-3.5 w-3.5 inline mr-1" /> Approve & Dispatch</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function enrichSolarInvestigationCase(c: any) {
  const catalog = SOLAR_CASE_TELEMETRY[c.id] || SOLAR_CASE_TELEMETRY[c.asset];
  const seed = [...String(c.id) + String(c.asset || '')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const fallbackPoints = ['06:00', '09:00', '12:00', '15:00', '18:00'].map((time, i) => ({
    time,
    value: Number((97.8 - i * (0.4 + (seed % 6) * 0.12) - (seed % 4) * 0.15).toFixed(1)),
    baseline: 96.0,
    unit: '%'
  }));
  const last = fallbackPoints[fallbackPoints.length - 1];
  const stream = catalog || {
    metricName: 'INVERTER CONVERSION EFFICIENCY',
    observedValue: `${last.value} %`,
    thresholdValue: '96.0 %',
    telemetryPoints: fallbackPoints
  };

  return {
    ...c,
    equipment: c.equipment || c.asset || 'Unknown equipment',
    assignee: c.assignee || 'Unassigned',
    rootCause: c.rootCause || c.detail || `${c.title} — inverter/tracker physics model flagged an out-of-envelope signature.`,
    requiredParts: c.requiredParts || ['DC-link capacitor bank (C-pack)', 'Inverter cooling fan assembly', 'String isolation PPE kit', 'Thermal scan report pack'],
    estimatedTime: c.estimatedTime || '1 night window',
    metricName: c.metricName || stream.metricName,
    observedValue: c.observedValue || stream.observedValue,
    thresholdValue: c.thresholdValue || stream.thresholdValue,
    telemetryPoints: (c.telemetryPoints && c.telemetryPoints.length) ? c.telemetryPoints : stream.telemetryPoints
  };
}

function CasesPage({ showToast, cases, handleUpdateCaseStatus, handleLogCase, onSelectCase }: any) {
  const COLUMNS = [
    { id: 'Unassigned', label: 'UNASSIGNED', badgeStyle: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
    { id: 'Diagnosing', label: 'DIAGNOSING', badgeStyle: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { id: 'Planned Maintenance', label: 'PLANNED MAINTENANCE', badgeStyle: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    { id: 'Closed', label: 'CLOSED', badgeStyle: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-bold';
      case 'High': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-bold';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20 font-semibold';
      case 'Low': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-medium';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Cases Board — Solar Farm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Investigate machine condition alerts, assign engineers, and manage investigation work orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleLogCase('Fleet-Wide', 'General', 'Manual case created', 'Low')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Log New Solar Case</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 2xl:gap-6 items-start">
        {COLUMNS.map((col) => {
          const items = cases.filter((c: any) => c.status === col.id);
          return (
            <div key={col.id} className="w-full bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col min-h-[580px] 2xl:min-h-[680px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{col.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full border shadow-xs ${col.badgeStyle}`}>{items.length}</span>
                </div>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                    <span>No cases in this stage</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Drag or select stage to transfer</span>
                  </div>
                ) : (
                  items.map((c: any) => (
                    <div key={c.id} onClick={() => onSelectCase(c)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl p-4 sm:p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">{c.id}</span>
                        <span className={`text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadge(c.severity)}`}>{c.severity}</span>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{c.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                          <span>{c.asset}</span>
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs gap-2">
                        <span className="text-slate-500 dark:text-slate-400 truncate font-medium">By: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{c.assignee || 'Unassigned'}</strong></span>
                        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateCaseStatus(c.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer pr-5 appearance-none transition"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Diagnosing">Diagnosing</option>
                            <option value="Planned Maintenance">Planned Maint</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SolarFarmView: React.FC<{ 
  activeTab: ActiveTab; 
  setActiveTab?: (tab: ActiveTab) => void;
  onNavigateToCatalog?: () => void;
}> = ({ activeTab, setActiveTab, onNavigateToCatalog }) => {
  const [toast, setToast] = useState<{title: string, message: string} | null>(null);
  const [overrideTab, setOverrideTab] = useState<ActiveTab | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  useEffect(() => {
    setOverrideTab(null);
  }, [activeTab]);

  const navigateToCases = () => {
    if (setActiveTab) {
      setActiveTab('cases');
    } else {
      setOverrideTab('cases');
    }
  };

  const [cases, setCases] = useState<any[]>(SOLAR_CASES.map(c => ({
    ...c,
    status: (c as any).status || (c.column === 'new' ? 'Unassigned' : c.column === 'investigating' ? 'Diagnosing' : c.column === 'scheduled' ? 'Planned Maintenance' : 'Closed')
  })));
  const [tasks, setTasks] = useState(SOLAR_TASKS);
  const [maintLogs, setMaintLogs] = useState(SOLAR_MAINT_HISTORY);
  const [caseCounter, setCaseCounter] = useState(6);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogCaseFromAsset = (asset: any) => {
    const code = asset.code || asset.caseId || asset.id;
    const name = asset.name || code;
    const tokens = [code, asset.caseId, asset.id].filter(Boolean);
    const existing = cases.find((c) =>
      c.status !== 'Closed' && tokens.some((token) => {
        const n = String(token).toLowerCase();
        const hay = [c.asset, c.equipment, c.title].filter(Boolean).join(' ').toLowerCase();
        const variants = [n, n.replace(/^zone-/, 'zone '), n.replace(/^trk-zone\s*/, 'zone ')];
        return variants.some((v) => v.length > 2 && hay.includes(v));
      })
    );

    const goToCases = () => {
      if (setActiveTab) setActiveTab('cases');
      else setOverrideTab('cases');
    };

    if (existing) {
      goToCases();
      setSelectedCase(enrichSolarInvestigationCase(existing));
      showToast('Viewing Existing Ticket', `Opening ${existing.id} on Cases Board.`);
      return;
    }

    const newId = `SOL-${String(caseCounter + 1).padStart(3, '0')}`;
    setCaseCounter((n) => n + 1);
    const healthScore = typeof asset.healthScore === 'number' ? asset.healthScore : 86;
    const primary = (asset.compactMetrics && (asset.compactMetrics.find((m: any) => /temp/i.test(m.label)) || asset.compactMetrics[0]));
    const catalog = SOLAR_CASE_TELEMETRY[code] || SOLAR_CASE_TELEMETRY[asset.caseId];
    const trend = asset.healthTrend7d && asset.healthTrend7d.length
      ? asset.healthTrend7d.slice(-5)
      : distinctHealthTrend(healthScore, Number(String(code).replace(/\D/g, '') || caseCounter));
    const telemetryPoints = catalog?.telemetryPoints || trend.map((h: any) => ({
      time: h.day || h.time,
      value: h.score ?? h.value,
      baseline: 90,
      unit: h.unit || '%'
    }));

    const newCase = {
      id: newId,
      column: 'investigating',
      title: `Mechanical anomaly investigation for ${name}`,
      equipment: `${name} (${code})`,
      asset: code,
      assignee: 'David L.',
      severity: healthScore < 80 ? 'Critical' : 'High',
      status: 'Diagnosing',
      timestamp: 'Just now',
      rootCause: asset.aiSummary || asset.detail || `Surveillance flagged ${name} for inverter/tracker review.`,
      detail: asset.aiSummary || asset.detail,
      requiredParts: ['DC-link capacitor bank', 'Cooling fan assembly'],
      estimatedTime: '4.0 Hours',
      metricName: catalog?.metricName || primary?.label || 'Inverter Internal Temp',
      observedValue: catalog?.observedValue || primary?.value || `${healthScore}%`,
      thresholdValue: catalog?.thresholdValue || '55.0 °C',
      telemetryPoints
    };

    setCases((prev) => [newCase, ...prev]);
    goToCases();
    setSelectedCase(enrichSolarInvestigationCase(newCase));
    showToast(`Case Logged (${newCase.id})`, `Work order ticket registered for ${name}.`);
  };

  const handleLogCase = (assetId: string, assetName: string, detail: string, severity: string) => {
    handleLogCaseFromAsset({
      code: assetId,
      name: assetName,
      healthScore: /crit/i.test(severity) ? 75 : 86,
      aiSummary: detail,
      compactMetrics: [{ label: 'Inverter Internal Temp', value: '—', status: 'warning' }],
      healthTrend7d: distinctHealthTrend(/crit/i.test(severity) ? 75 : 86, caseCounter)
    });
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
    
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    if (newStatus === 'Planned Maintenance') {
      if (!tasks.find(t => t.caseId === caseId)) {
        const newTask = {
          rank: tasks.length + 1,
          title: `Action: ${c.title}`,
          asset: c.asset || 'Unknown',
          caseId: c.id,
          rationale: c.detail,
          yieldSaved: 'TBD',
          downtime: 'TBD',
          clearance: 'safe' as const,
          clearanceText: 'Pending review'
        };
        setTasks(prev => [newTask, ...prev]);
        showToast('Task Created', `Task auto-generated for Case ${caseId}`);
      }
    } else if (newStatus === 'Closed') {
      const newLog = {
        id: `MH-S-${Date.now()}`,
        text: `Case ${caseId} Closed — ${c.title} Completed`,
        when: 'Just now',
        unknown: false
      };
      setMaintLogs(prev => [newLog, ...prev]);
      showToast('Case Closed', `Maintenance log updated for ${caseId}`);
    }
  };

  const handleDispatchTask = (taskId: string, asset: string, caseId: string) => {
    setTasks(prev => prev.filter(t => t.caseId !== caseId));
    const newLog = {
      id: `MH-S-${Date.now()}`,
      text: `${asset} Task Dispatched — via ${caseId}`,
      when: 'Just now',
      unknown: false
    };
    setMaintLogs(prev => [newLog, ...prev]);
    showToast('Shift Brief Dispatched', `O&M crew assigned to ${asset}`);
  };

  const getActiveCaseForAsset = (assetId: string) => {
    const n = String(assetId || '').toLowerCase();
    const variants = [n, n.replace(/^zone-/, 'zone '), n.replace(/^trk-zone\s*/, 'zone ')];
    return cases.find((c) => {
      if (c.status === 'Closed') return false;
      const hay = [c.asset, c.equipment, c.title].filter(Boolean).join(' ').toLowerCase();
      return variants.some((v) => v && hay.includes(v));
    });
  };

  const page = overrideTab || (activeTab === 'diagnostics' ? 'overview' : activeTab);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0">
      {page === 'assets' && <AssetsPage showToast={showToast} cases={cases} handleLogCaseFromAsset={handleLogCaseFromAsset} getActiveCaseForAsset={getActiveCaseForAsset} />}
      {page === 'maintenance' && <MaintenancePage maintLogs={maintLogs} />}
      {page === 'optimizer' && <OptimizerPage showToast={showToast} tasks={tasks} handleDispatchTask={handleDispatchTask} onNavigateToCases={navigateToCases} />}
      {page === 'cases' && <CasesPage showToast={showToast} cases={cases} handleUpdateCaseStatus={handleUpdateCaseStatus} handleLogCase={handleLogCase} onSelectCase={(c: any) => setSelectedCase(enrichSolarInvestigationCase(c))} />}
      {page === 'overview' && <OverviewPage onNavigateToCatalog={onNavigateToCatalog} />}

      <InvestigationDrawer
        selectedCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdateStatus={(id, newStatus) => {
          handleUpdateCaseStatus(id, newStatus);
          if (selectedCase && selectedCase.id === id) {
            setSelectedCase({ ...selectedCase, status: newStatus });
          }
        }}
        onDispatchAction={(caseItem) => {
          handleUpdateCaseStatus(caseItem.id, 'Planned Maintenance');
          setSelectedCase(null);
          showToast('Work Order Dispatched', `WO-${caseItem.id.replace('CAS-', '').replace('WND-', '').replace('SOL-', '')} dispatched to ${caseItem.assignee}`);
        }}
      />

      {/* Local Toast Overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fadeIn">
          <div className="bg-slate-900 text-white border border-slate-700 shadow-2xl rounded-xl p-4 pr-12 min-w-[280px]">
            <h4 className="text-sm font-bold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
