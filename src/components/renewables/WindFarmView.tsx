import React, { useState, useEffect } from 'react';

const SHOW_EQUIPMENT_THUMBNAILS = true;

import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
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
  ReferenceLine,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  Wind,
  Zap,
  Gauge,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Wrench,
  Activity,
  Sparkles,
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  Download,
  Flag,
  FileText,
  ShieldAlert,
  Layers,
  Plus,
  Calendar,
  Send,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { InvestigationDrawer } from '../InvestigationDrawer';
import { AddMachineryModal, NewMachineryData } from '../AddMachineryModal';
import {
  WIND_TURBINES,
  WIND_POWER_CURVE,
  WIND_KPIS,
  WIND_ROSE,
  WIND_24H_GENERATION,
  WIND_ANOMALIES,
  WIND_INSPECTIONS,
  WIND_MAINT_HISTORY,
  WIND_PARETO,
  WIND_AVAIL_12M,
  WIND_TASKS,
  WIND_CASES,
  WIND_CASE_TELEMETRY,
  WindTurbineStatus,
  WindTurbine
} from '../../data/windFarmMockData';
import { TOOLTIP_STYLE, MiniSpark, severityPill, heatCell } from './chartTheme';

function statusPill(status: WindTurbineStatus) {
  if (status === 'Online') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
  if (status === 'Curtailed') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
  if (status === 'Maintenance') return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
  return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
}

function metricTone(warning: boolean, critical = false) {
  if (critical) return 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200';
  if (warning) return 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200';
  return 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
}

// --- MODAL COMPONENT ---
function WindAssetModal({ asset, onClose, showToast, handleLogCaseFromAsset, getActiveCaseForAsset }: any) {
  const vibData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    vibration: Number((asset.nacelleVibrationMmS * (0.8 + (i * 0.05))).toFixed(2))
  }));

  const activeCase = getActiveCaseForAsset(asset.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700/80 p-1 overflow-hidden flex items-center justify-center shadow-xs">
              <img 
                src="/images/thumbnails/wind-turbine-3d.png" 
                alt="Wind Turbine" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Wind Turbine Diagnostic Overview</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusPill(asset.status)}`}>{asset.status}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{asset.id} • {asset.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Gearbox Vibration Trend (7-Day)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vibData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" mm/s" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <ReferenceLine y={4.5} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Warning Threshold', fill: '#f43f5e', fontSize: 10 }} />
                  <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Live Telemetry Parameter Grid</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">Power Output</span><span className="font-mono font-bold text-sm">{asset.powerKw} kW</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">Wind Speed</span><span className="font-mono font-bold text-sm">{asset.windSpeedMs} m/s</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">Rotor RPM</span><span className="font-mono font-bold text-sm">{asset.rotorRpm}</span></div>
              <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-xs"><span className="text-slate-500 block mb-1">Gearbox Oil</span><span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">{asset.gearboxOilTempC}°C</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">Main Bearing</span><span className="font-mono font-bold text-sm">{asset.mainBearingTempC}°C</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">Gen Winding</span><span className="font-mono font-bold text-sm">{asset.generatorWindingTempC}°C</span></div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"><span className="text-slate-500 block mb-1">Pitch Angle</span><span className="font-mono font-bold text-sm">{asset.pitchDeg}°</span></div>
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-xs"><span className="text-slate-500 block mb-1">Yaw Error</span><span className="font-mono font-bold text-sm text-rose-700 dark:text-rose-400">{asset.yawErrorDeg}°</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2">
              <Sparkles className="h-4 w-4" /> Plain-English AI Diagnostics
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Vibration signature at {asset.nacelleVibrationMmS} mm/s matches inner race bearing pitting pattern. Gearbox oil temp is elevated at {asset.gearboxOilTempC}°C. Recommend borescope inspection within 7 days to prevent catastrophic failure.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-3">
          <button onClick={() => {
            handleLogCaseFromAsset({
              code: asset.id,
              name: asset.name,
              healthScore: asset.nacelleVibrationMmS > 4.5 || asset.gearboxOilTempC > 80 ? 76 : asset.underperforming ? 86 : 94,
              aiSummary: `Vibration signature at ${asset.nacelleVibrationMmS} mm/s matches inner race bearing pitting pattern. Gearbox oil temp is elevated at ${asset.gearboxOilTempC}°C. Recommend borescope inspection within 7 days to prevent catastrophic failure.`,
              compactMetrics: [
                { label: 'Wind Speed', value: `${asset.windSpeedMs} m/s`, status: 'normal' },
                { label: 'Gearbox Oil Temp', value: `${asset.gearboxOilTempC} °C`, status: 'warning' },
                { label: 'Nacelle Vibration', value: `${asset.nacelleVibrationMmS} mm/s`, status: 'warning' },
                { label: 'Active Power', value: `${asset.powerKw.toLocaleString()} kW`, status: 'normal' }
              ],
              healthTrend7d: distinctHealthTrend(asset.nacelleVibrationMmS > 4.5 ? 76 : 94, Number(String(asset.id).replace(/\D/g, '') || 1))
            });
            onClose();
          }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition">
            <Wrench className="h-4 w-4" /> {activeCase ? `View ${activeCase.id}` : 'Log Turbine Case'}
          </button>
          <button onClick={() => { showToast('Technician Assigned', 'Nacelle access crew notified.'); onClose(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <UserPlus className="h-4 w-4" /> Assign Wind Technician
          </button>
          <button onClick={() => { showToast('Report Exported', 'Diagnostic PDF downloaded.'); onClose(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Download className="h-4 w-4" /> Export Vibration Report
          </button>
          <button onClick={() => { showToast('Mobilization Flagged', 'Heavy crane access requirement logged.'); onClose(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Flag className="h-4 w-4" /> Flag Crane Mobilization
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SUB-PAGES ---
function OverviewPage({ onNavigateToCatalog }: { onNavigateToCatalog?: () => void }) {
  const CustomPowerCurveTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs min-w-[160px]">
          <p className="font-bold text-slate-100 mb-2 border-b border-slate-700 pb-1.5">
            {data.id || 'Reference Point'}
          </p>
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.fill || entry.stroke || '#fff';
            return (
              <div key={index} className="flex justify-between items-center gap-4 mt-1.5">
                <span style={{ color }} className="font-bold">{entry.name}</span>
                <span className="font-mono font-bold text-slate-100">{entry.value} kW</span>
              </div>
            );
          })}
          <div className="flex justify-between items-center gap-4 mt-1.5 pt-1.5 border-t border-slate-700/50">
            <span className="font-bold text-slate-400">Wind Speed</span>
            <span className="font-mono font-bold text-slate-100">{data.windSpeed} m/s</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3.5 animate-fadeIn">
      {/* 5 KPIs Row */}
      <section aria-label="Wind farm KPIs" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 2xl:gap-3 shrink-0">
        {[
          { hover: 'hover:border-blue-400 dark:hover:border-blue-500', label: 'Total Farm Output', value: String(WIND_KPIS.totalOutputMw), unit: 'MW', sub: `/ ${WIND_KPIS.capacityMw} MW`, badge: `${((WIND_KPIS.totalOutputMw / WIND_KPIS.capacityMw) * 100).toFixed(1)}% of Capacity`, badgeCls: 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20' },
          { hover: 'hover:border-cyan-400 dark:hover:border-cyan-500', label: 'Capacity Factor', value: `${WIND_KPIS.capacityFactorPct}`, unit: '%', sub: 'trailing 30d', badge: 'Energy / nameplate', badgeCls: 'text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/20' },
          { hover: 'hover:border-emerald-400 dark:hover:border-emerald-500', label: 'Fleet Availability', value: `${WIND_KPIS.fleetAvailabilityPct}`, unit: '%', sub: 'available', badge: 'Live', badgeCls: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
          { hover: 'hover:border-sky-400 dark:hover:border-sky-500', label: 'Avg Wind Speed', value: String(WIND_KPIS.avgWindSpeedMs), unit: 'm/s', sub: 'hub height', badge: 'Hub Height', badgeCls: 'text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20' },
          { hover: 'hover:border-amber-400 dark:hover:border-amber-500', label: 'MTBF', value: WIND_KPIS.mtbfHours.toLocaleString(), unit: 'hrs', sub: 'fleet mean', badge: 'Fleet Mean', badgeCls: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20' }
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
        
        {/* Left Column (8 cols): Power Curve & 24hr Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 2xl:gap-3.5 h-full min-h-0">
          
          {/* Card 1: Power Curve Analysis */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Power Curve Analysis
              </h3>
              <span className="text-[10px] text-slate-400">Red points: sub-optimal performance vs theoretical curve</span>
            </div>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 6, right: 12, left: -14, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis type="number" dataKey="windSpeed" domain={[0, 25]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} unit=" m/s" />
                  <YAxis type="number" domain={[0, 3500]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} unit=" kW" />
                  <ZAxis range={[50, 50]} />
                  <Tooltip content={<CustomPowerCurveTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line data={WIND_POWER_CURVE} dataKey="theoreticalKw" name="Theoretical S-curve" type="monotone" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Scatter data={WIND_TURBINES.map((t) => ({ windSpeed: t.windSpeedMs, powerKw: t.powerKw, id: t.id, underperforming: t.underperforming }))} dataKey="powerKw" name="Turbine point" fill="#94a3b8">
                    {WIND_TURBINES.map((t) => (
                      <Cell key={t.id} fill={t.underperforming || t.status === 'Faulted' ? '#f43f5e' : '#10b981'} />
                    ))}
                  </Scatter>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: 24hr Generation Timeline */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                24hr Generation Timeline
              </h3>
              <span className="text-[10px] text-slate-400">Actual output vs forecast trajectory</span>
            </div>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={WIND_24H_GENERATION} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="windArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} unit=" MW" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="actualMw" name="Actual output" stroke="#3b82f6" fill="url(#windArea)" strokeWidth={2} />
                  <Line type="monotone" dataKey="forecastMw" name="Wind forecast" stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Wind Rose & Critical Anomaly Feed */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 2xl:gap-3.5 h-full min-h-0">
          
          {/* Card 3: Wind Direction & Energy Rose */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Wind Direction & Energy Rose
              </h3>
              <span className="text-[10px] text-slate-400">SW Heading Dominant</span>
            </div>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={WIND_ROSE} margin={{ top: 2, right: 6, bottom: 2, left: 6 }}>
                  <PolarGrid stroke="#94a3b8" opacity={0.3} />
                  <PolarAngleAxis dataKey="dir" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <PolarRadiusAxis tick={{ fontSize: 8, fill: '#64748b' }} />
                  <Radar name="Wind Freq (%)" dataKey="frequency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Radar name="Energy (MWh)" dataKey="energy" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#e2e8f0' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 4: Critical Anomaly Feed */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Critical Anomaly Feed
              </h3>
              <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                3 Monitored
              </span>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 pt-2">
              {WIND_ANOMALIES.map((a) => (
                <div key={a.id} className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200">{a.asset} • {a.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${severityPill(a.severity)}`}>{a.severity}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{a.detail}</p>
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
  const [modalAsset, setModalAsset] = useState<WindTurbine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extraTurbines, setExtraTurbines] = useState<any[]>([]);

  const handleAddNewMachinery = (data: NewMachineryData) => {
    const newTurbineCard = {
      turbine: {
        id: data.code,
        status: 'Online',
        windSpeedMs: 9.8,
        powerKw: 4200,
        rotorRpm: 12.4,
        nacelleVibrationMmS: 1.2,
        gearboxOilTempC: 62,
        mainBearingTempC: 58,
        generatorWindingTempC: 72,
        pitchDeg: 1.5,
        yawErrorDeg: 0.8,
        underperforming: false
      },
      code: data.code,
      name: data.name,
      category: data.category || 'Wind Turbine',
      ratedCapacity: data.ratedCapacity || '4.2 MW',
      healthScore: data.healthScore,
      statusText: data.healthScore < 80 ? 'Critical Advisory' : data.healthScore < 90 ? 'Under Advisory' : 'Optimal',
      compactMetrics: [
        { label: 'Wind Speed', value: '9.8 m/s', status: 'normal' as const },
        { label: 'Gearbox Oil Temp', value: '62 °C', status: 'normal' as const },
        { label: data.metricLabel || 'Nacelle Vibration', value: data.metricValue || '1.2 mm/s', status: 'normal' as const },
        { label: 'Active Power', value: '4,200 kW', status: 'normal' as const }
      ],
      expandedMetrics: [
        { label: 'Rotor RPM', value: '12.4 rpm', status: 'normal' as const },
        { label: 'Main Bearing Temp', value: '58 °C', status: 'normal' as const },
        { label: 'Generator Stator Temp', value: '72 °C', status: 'normal' as const },
        { label: 'Blade Pitch Angle', value: '1.5°', status: 'normal' as const },
        { label: 'Yaw Alignment Error', value: '0.8°', status: 'normal' as const }
      ],
      aiSummary: data.aiSummary || `${data.name} (${data.code}) successfully commissioned into Wind Farm Zone 1 monitoring.`,
      healthTrend7d: [
        { day: 'D-6', score: data.healthScore },
        { day: 'D-5', score: data.healthScore },
        { day: 'D-4', score: data.healthScore },
        { day: 'D-3', score: data.healthScore },
        { day: 'D-2', score: data.healthScore },
        { day: 'D-1', score: data.healthScore },
        { day: 'Today', score: data.healthScore }
      ]
    };
    setExtraTurbines(prev => [newTurbineCard, ...prev]);
    showToast?.('Machinery Commissioned', `${data.name} (${data.code}) added to fleet.`);
  };

  const WIND_MODELS = [
    { name: 'Vestas V150 4.2 MW', capacity: '4.2 MW' },
    { name: 'GE 3.8-137', capacity: '3.8 MW' },
    { name: 'Siemens Gamesa SG 4.5', capacity: '4.5 MW' }
  ];

  const metricStatus = (warning: boolean, critical: boolean): 'normal' | 'warning' | 'critical' =>
    critical ? 'critical' : warning ? 'warning' : 'normal';

  const fleetCards = WIND_TURBINES.map((t, idx) => {
    const model = WIND_MODELS[idx % WIND_MODELS.length];
    const oilWarn = t.gearboxOilTempC >= 70 && t.gearboxOilTempC <= 80;
    const oilCrit = t.gearboxOilTempC > 80;
    const vibWarn = t.nacelleVibrationMmS >= 3 && t.nacelleVibrationMmS <= 4.5;
    const vibCrit = t.nacelleVibrationMmS > 4.5;
    let healthScore = 96 - (idx % 5);
    if (t.status === 'Faulted') healthScore = 71;
    else if (oilCrit || vibCrit) healthScore = 78;
    else if (t.underperforming || t.status === 'Maintenance') healthScore = 86;
    else if (oilWarn || vibWarn || t.status === 'Curtailed') healthScore = 91;
    healthScore = Math.max(68, Math.min(99, healthScore));

    const compactMetrics = [
      { label: 'Wind Speed', value: `${t.windSpeedMs} m/s`, status: metricStatus(false, false) },
      { label: 'Gearbox Oil Temp', value: `${t.gearboxOilTempC} °C`, status: metricStatus(oilWarn, oilCrit) },
      { label: 'Nacelle Vibration', value: `${t.nacelleVibrationMmS} mm/s`, status: metricStatus(vibWarn, vibCrit) },
      { label: 'Active Power', value: `${t.powerKw.toLocaleString()} kW`, status: t.status === 'Faulted' ? 'critical' as const : t.underperforming ? 'warning' as const : 'normal' as const }
    ];
    const expandedMetrics = [
      ...compactMetrics,
      { label: 'Rotor RPM', value: `${t.rotorRpm} rpm`, status: 'normal' as const },
      { label: 'Main Bearing Temp', value: `${t.mainBearingTempC} °C`, status: t.mainBearingTempC > 70 ? 'warning' as const : 'normal' as const },
      { label: 'Generator Stator Temp', value: `${t.generatorWindingTempC} °C`, status: t.generatorWindingTempC > 80 ? 'warning' as const : 'normal' as const },
      { label: 'Blade Pitch Angle', value: `${t.pitchDeg}°`, status: t.pitchDeg > 20 ? 'warning' as const : 'normal' as const },
      { label: 'Yaw Alignment Error', value: `${t.yawErrorDeg}°`, status: t.yawErrorDeg > 4 ? 'warning' as const : 'normal' as const }
    ];

    let aiSummary = `${t.id} drivetrain, gearbox oil, and pitch hydraulics are within fleet envelopes. Yaw alignment and rotor RPM tracking the current ${t.windSpeedMs} m/s hub wind.`;
    if (t.id === 'WT-07' || vibCrit) {
      aiSummary = `${t.id} drivetrain vibration trending upward (+0.4 mm/s over 48h). Harmonic frequency matches inner ring spalling pattern on high-speed stage bearing.`;
    } else if (oilCrit) {
      aiSummary = `${t.id} gearbox oil at ${t.gearboxOilTempC}°C, rising vs fleet mean. Cross-check high-speed bearing temperature and schedule borescope before crane slot is lost.`;
    } else if (t.underperforming) {
      aiSummary = `${t.id} sits below the theoretical power curve at ${t.windSpeedMs} m/s. Yaw error ${t.yawErrorDeg}° is leaking energy versus the SW-dominant rose.`;
    }

    const statusText = healthScore < 80 ? 'Critical Advisory' : healthScore < 90 ? 'Under Advisory' : t.status === 'Online' ? 'Optimal' : t.status;
    const healthTrend7d = distinctHealthTrend(healthScore, idx);

    return { turbine: t, code: t.id, name: model.name, category: 'Wind Turbine', ratedCapacity: model.capacity, healthScore, statusText, compactMetrics, expandedMetrics, aiSummary, healthTrend7d };
  });

  const allFleetCards = [...extraTurbines, ...fleetCards];
  const attentionCount = allFleetCards.filter(a => a.healthScore < 90).length;
  const optimalCount = allFleetCards.filter(a => a.healthScore >= 90).length;

  const filteredAssets = allFleetCards.filter(asset => {
    if (filter === 'attention' && asset.healthScore >= 90) return false;
    if (filter === 'optimal' && asset.healthScore < 90) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (![asset.name, asset.code, asset.category, asset.statusText].some((s) => s.toLowerCase().includes(q))) return false;
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
      {modalAsset && <WindAssetModal asset={modalAsset} onClose={() => setModalAsset(null)} showToast={showToast} handleLogCaseFromAsset={handleLogCaseFromAsset} getActiveCaseForAsset={getActiveCaseForAsset} />}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Wind Fleet Monitored Assets
            </h2>
            <span className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              25 Turbines Online (200 MW Nameplate)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous high-frequency drivetrain vibration, gearbox oil health, and pitch telemetry across Wind Farm Zone 1.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg">
            {optimalCount} Units Optimal (90%+ Health)
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-xs shadow-cyan-600/20 transition cursor-pointer active:scale-95"
            title="Add New Machinery or Component"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Machinery / Component</span>
          </button>
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
          const activeCase = getActiveCaseForAsset(asset.code);
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
                          src="/images/thumbnails/wind-turbine-3d.png" 
                          alt="Wind Turbine" 
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
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      {asset.statusText}
                    </span>
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
                      {metrics.map((m: any, idx: number) => (
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
                    {metrics.map((m: any, idx: number) => (
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
                  onClick={(e) => { e.stopPropagation(); setModalAsset(asset.turbine); }}
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

      {/* Add Machinery / Component Modal */}
      <AddMachineryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewMachinery}
        facilityType="wind"
      />
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
          Maintenance & Inspections — Wind
        </h2>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Last 12 Days
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {WIND_INSPECTIONS.map((ins) => (
          <div key={ins.id} className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-5 py-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">{ins.id}</span>
                <div className="flex items-start gap-2 mt-1.5">
                  <Send className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0 rotate-[-20deg]" />
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
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-end gap-[2px]">
                <span className="w-1 h-2 rounded-sm bg-blue-500" />
                <span className="w-1 h-3 rounded-sm bg-blue-500" />
                <span className="w-1 h-4 rounded-sm bg-blue-500" />
              </span>
              Downtime Pareto
            </h3>
            <div className="h-52 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={WIND_PARETO} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="cause" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="h" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="c" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar yAxisId="h" dataKey="hours" name="Downtime hours" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line yAxisId="c" type="monotone" dataKey="cumulative" name="Cumulative %" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Monthly Availability Trend</h3>
            <div className="h-44 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WIND_AVAIL_12M} margin={{ top: 8, right: 28, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="windAvailFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[85, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <ReferenceLine y={95} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '95% target', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                  <Area type="monotone" dataKey="availability" stroke="#10b981" fill="url(#windAvailFill)" strokeWidth={2} />
                </AreaChart>
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
    if (sortBy === 'downtime') return parseInt(a.downtime.replace(/\D/g, '')) - parseInt(b.downtime.replace(/\D/g, ''));
    return a.rank - b.rank;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">Primary Plant Bottleneck</h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">WT-07 gearbox bearing must be replaced before winter storm season.</p>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" /> Task Optimizer — Wind Farm</h2>
            <p className="text-xs text-slate-500 mt-1">Deterministic optimization ranking maintenance tasks by financial revenue yield.</p>
          </div>
          <button onClick={() => showToast('Report Downloaded', 'Shift Priority Brief saved to disk')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition">
            <Download className="h-4 w-4" /> Export Wind O&M Brief (PDF)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"><span className="text-xs uppercase font-medium text-emerald-800 dark:text-emerald-300">Total Savings</span><div className="font-mono font-extrabold text-xl text-emerald-950 dark:text-emerald-100 mt-1">$428.7K</div></div>
          <div className="bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4"><span className="text-xs uppercase font-medium text-blue-800 dark:text-blue-300">Downtime Avoided</span><div className="font-mono font-extrabold text-xl text-blue-950 dark:text-blue-100 mt-1">24.2 Days</div></div>
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4"><span className="text-xs uppercase font-medium text-slate-600">Active Tasks</span><div className="font-mono font-extrabold text-xl mt-1">5</div></div>
          <div className="bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl p-4"><span className="text-xs uppercase font-medium text-purple-800 dark:text-purple-300">Avg ROI</span><div className="font-mono font-extrabold text-xl text-purple-950 dark:text-purple-100 mt-1">8.4x</div></div>
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
              <p className="text-xs text-slate-700 dark:text-slate-300">{task.rationale}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs"><span className="uppercase font-medium text-emerald-800 dark:text-emerald-300">Yield Saved</span><p className="font-mono font-bold text-sm mt-1 text-emerald-700 dark:text-emerald-400">{task.yieldSaved}</p></div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"><span className="uppercase font-medium text-slate-500">Downtime</span><p className="font-semibold text-sm mt-1">{task.downtime}</p></div>
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

function enrichWindInvestigationCase(c: any) {
  const catalog = WIND_CASE_TELEMETRY[c.id] || WIND_CASE_TELEMETRY[c.asset];
  const seed = [...String(c.id) + String(c.asset || '')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const fallbackPoints = ['08:00', '10:00', '12:00', '14:00', '16:00'].map((time, i) => ({
    time,
    value: Number((2.0 + (seed % 7) * 0.15 + i * (0.35 + (seed % 5) * 0.08)).toFixed(2)),
    baseline: 3.0,
    unit: 'mm/s'
  }));
  const last = fallbackPoints[fallbackPoints.length - 1];
  const stream = catalog || {
    metricName: 'HIGH-SPEED SHAFT VIBRATION',
    observedValue: `${last.value} mm/s`,
    thresholdValue: '3.0 mm/s',
    telemetryPoints: fallbackPoints
  };

  return {
    ...c,
    equipment: c.equipment || c.asset || 'Unknown turbine',
    assignee: c.assignee || 'Unassigned',
    rootCause: c.rootCause || c.detail || `${c.title} — drivetrain physics model flagged an out-of-envelope signature.`,
    requiredParts: c.requiredParts || ['HS-stage bearing kit (SKF 22328)', 'Gearbox oil ISO VG 320 (200 L)', 'Nacelle borescope kit', 'Yaw encoder spare'],
    estimatedTime: c.estimatedTime || '2 shifts',
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
            Cases Board — Wind Farm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Investigate machine condition alerts, assign engineers, and manage investigation work orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleLogCase('Fleet-Wide', 'General', 'Manual case created', 'Low')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Log New Case</span>
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

export const WindFarmView: React.FC<{ 
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

  const [cases, setCases] = useState<any[]>(WIND_CASES.map(c => ({
    ...c,
    status: (c as any).status || (c.column === 'new' ? 'Unassigned' : c.column === 'investigating' ? 'Diagnosing' : c.column === 'scheduled' ? 'Planned Maintenance' : 'Closed')
  })));
  const [tasks, setTasks] = useState(WIND_TASKS);
  const [maintLogs, setMaintLogs] = useState(WIND_MAINT_HISTORY);
  const [caseCounter, setCaseCounter] = useState(6);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogCaseFromAsset = (asset: any) => {
    const code = asset.code || asset.id;
    const name = asset.name || code;
    const existing = cases.find((c) =>
      c.status !== 'Closed' && (
        c.asset === code ||
        (c.equipment && String(c.equipment).includes(code))
      )
    );

    const goToCases = () => {
      if (setActiveTab) setActiveTab('cases');
      else setOverrideTab('cases');
    };

    if (existing) {
      goToCases();
      setSelectedCase(enrichWindInvestigationCase(existing));
      showToast('Viewing Existing Ticket', `Opening ${existing.id} on Cases Board.`);
      return;
    }

    const newId = `WND-${String(caseCounter + 1).padStart(3, '0')}`;
    setCaseCounter((n) => n + 1);
    const healthScore = typeof asset.healthScore === 'number' ? asset.healthScore : 86;
    const primary = (asset.compactMetrics && asset.compactMetrics[2]) || (asset.compactMetrics && asset.compactMetrics[0]);
    const catalog = WIND_CASE_TELEMETRY[code] || WIND_CASE_TELEMETRY[newId];
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
      assignee: 'Marcus Vance',
      severity: healthScore < 80 ? 'Critical' : 'High',
      status: 'Diagnosing',
      timestamp: 'Just now',
      rootCause: asset.aiSummary || asset.detail || `Surveillance flagged ${name} for drivetrain review.`,
      detail: asset.aiSummary || asset.detail,
      requiredParts: ['High-Speed Bearing Assembly #GBX-300', 'Synthetic ISO VG 320 Flush Fluid'],
      estimatedTime: '4.0 Hours',
      metricName: catalog?.metricName || primary?.label || 'Nacelle Vibration',
      observedValue: catalog?.observedValue || primary?.value || `${healthScore}%`,
      thresholdValue: catalog?.thresholdValue || '4.5 mm/s',
      telemetryPoints
    };

    setCases((prev) => [newCase, ...prev]);
    goToCases();
    setSelectedCase(enrichWindInvestigationCase(newCase));
    showToast(`Case Logged (${newCase.id})`, `Work order ticket registered for ${name}.`);
  };

  const handleLogCase = (assetId: string, assetName: string, detail: string, severity: string) => {
    handleLogCaseFromAsset({
      code: assetId,
      name: assetName,
      healthScore: /crit/i.test(severity) ? 75 : 86,
      aiSummary: detail,
      compactMetrics: [{ label: 'Nacelle Vibration', value: '—', status: 'warning' }],
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
        id: `MH-W-${Date.now()}`,
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
      id: `MH-W-${Date.now()}`,
      text: `${asset} Task Dispatched — via ${caseId}`,
      when: 'Just now',
      unknown: false
    };
    setMaintLogs(prev => [newLog, ...prev]);
    showToast('Shift Brief Dispatched', `Crew assigned to ${asset}`);
  };

  const getActiveCaseForAsset = (assetId: string) => {
    return cases.find((c) =>
      c.status !== 'Closed' && (
        c.asset === assetId ||
        (c.equipment && String(c.equipment).includes(assetId))
      )
    );
  };

  const page = overrideTab || (activeTab === 'diagnostics' ? 'overview' : activeTab);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0">
      {page === 'assets' && <AssetsPage showToast={showToast} cases={cases} handleLogCaseFromAsset={handleLogCaseFromAsset} getActiveCaseForAsset={getActiveCaseForAsset} />}
      {page === 'maintenance' && <MaintenancePage maintLogs={maintLogs} />}
      {page === 'optimizer' && <OptimizerPage showToast={showToast} tasks={tasks} handleDispatchTask={handleDispatchTask} onNavigateToCases={navigateToCases} />}
      {page === 'cases' && <CasesPage showToast={showToast} cases={cases} handleUpdateCaseStatus={handleUpdateCaseStatus} handleLogCase={handleLogCase} onSelectCase={(c: any) => setSelectedCase(enrichWindInvestigationCase(c))} />}
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