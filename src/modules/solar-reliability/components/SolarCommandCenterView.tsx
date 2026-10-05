import React, { useMemo } from 'react';
import { 
  Sun, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Flame, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Thermometer, 
  Gauge, 
  ChevronRight,
  ArrowRight,
  BatteryCharging,
  Wind
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { useSolarReliability } from '../SolarReliabilityContext';

interface SolarCommandCenterViewProps {
  onNavigateToTab: (tab: string) => void;
  onNavigateToCatalog?: () => void;
}

// Mini Sparkline SVG Graph
interface MiniSparklineProps {
  data: number[];
  color: string;
  gradientId: string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ data, color, gradientId }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 100;
  const height = 30;
  const paddingY = 4;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
    return { x, y };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.38" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradientId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="2.5" fill={color} />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" fill={color} opacity="0.3" className="animate-ping" />
    </svg>
  );
};

export const SolarCommandCenterView: React.FC<SolarCommandCenterViewProps> = ({
  onNavigateToTab,
  onNavigateToCatalog
}) => {
  const {
    assets,
    alerts,
    recommendations,
    plantContext,
    plantOutputMW,
    plantHealthScore,
    overallRisk,
    highRiskAssetsCount,
    criticalAlertsCount,
    maintenanceDueCount,
    performanceRatioPct,
    availabilityPct,
    resetDemoScenario,
    setSelectedAsset,
    setSelectedAlert,
    createWorkOrderFromRecommendation
  } = useSolarReliability();

  const inv2 = assets.find(a => a.assetCode === 'INV-02');
  const isInv2Restored = inv2 && (inv2.riskLevel === 'Low' || inv2.riskLevel === 'Moderate') && (inv2.telemetry.igbtTempC ?? 0) < 65;

  // 24h Generation vs Irradiance Data
  const generationTimelineData = useMemo(() => [
    { time: '06:00', poa: 120, expectedMW: 15.0, actualGeneration: 14.5 },
    { time: '08:00', poa: 420, expectedMW: 58.0, actualGeneration: 56.5 },
    { time: '10:00', poa: 750, expectedMW: 104.0, actualGeneration: 101.5 },
    { time: '12:00', poa: 912, expectedMW: 128.5, actualGeneration: 125.8 },
    { time: '14:00', poa: 885, expectedMW: 124.0, actualGeneration: plantOutputMW },
    { time: '16:00', poa: 620, expectedMW: 86.0, actualGeneration: 84.2 },
    { time: '18:00', poa: 240, expectedMW: 32.0, actualGeneration: 31.0 },
    { time: '20:00', poa: 0, expectedMW: 0.0, actualGeneration: 0.0 }
  ], [plantOutputMW]);

  // Inverter Station Efficiency Comparison Chart
  const inverterEfficiencyData = useMemo(() => [
    { name: 'INV-01 Skid', efficiency: 98.6, baseline: 98.6, igbtTemp: 48.2 },
    { name: 'INV-02 Skid', efficiency: isInv2Restored ? 98.5 : 94.2, baseline: 98.6, igbtTemp: isInv2Restored ? 48.5 : 78.4 },
    { name: 'INV-03 Skid', efficiency: 98.6, baseline: 98.6, igbtTemp: 49.8 }
  ], [isInv2Restored]);

  // INV-02 IGBT Temperature & Conversion Efficiency Trend
  const inv2TrendData = useMemo(() => {
    if (isInv2Restored) {
      return [
        { time: '09:00', igbtTemp: 74.2, efficiency: 95.8, limitTemp: 65.0 },
        { time: '11:00', igbtTemp: 76.8, efficiency: 94.9, limitTemp: 65.0 },
        { time: '13:00', igbtTemp: 78.4, efficiency: 94.2, limitTemp: 65.0 },
        { time: '14:00', event: 'Maintenance Executed', igbtTemp: 62.0, efficiency: 97.4, limitTemp: 65.0 },
        { time: '14:30', igbtTemp: 52.4, efficiency: 98.2, limitTemp: 65.0 },
        { time: '15:00', igbtTemp: 48.5, efficiency: 98.5, limitTemp: 65.0 }
      ];
    }
    return [
      { time: '09:00', igbtTemp: 71.0, efficiency: 96.5, limitTemp: 65.0 },
      { time: '10:30', igbtTemp: 73.8, efficiency: 95.8, limitTemp: 65.0 },
      { time: '12:00', igbtTemp: 76.2, efficiency: 95.1, limitTemp: 65.0 },
      { time: '13:30', igbtTemp: 77.5, efficiency: 94.6, limitTemp: 65.0 },
      { time: '14:30', igbtTemp: 78.4, efficiency: 94.2, limitTemp: 65.0 },
      { time: 'Now', igbtTemp: 78.4, efficiency: 94.2, limitTemp: 65.0 }
    ];
  }, [isInv2Restored]);

  // Top Risk Assets
  const topRiskAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  }, [assets]);

  // Active Alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter(a => a.status !== 'Resolved' && a.status !== 'Dismissed').slice(0, 4);
  }, [alerts]);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-3 2xl:gap-3.5 animate-fadeIn overflow-y-auto pr-0.5">

      {/* ROW 1: TOP 8 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 shrink-0">
        
        {/* KPI 1: Plant Output */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Plant Output
            </span>
            <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              {plantOutputMW.toFixed(1)} <span className="text-xs font-semibold">MW</span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              / 130 MW export
            </div>
          </div>
        </div>

        {/* KPI 2: Plant Health */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Plant Health
            </span>
            <div className={`w-5 h-5 rounded-md ${plantHealthScore < 85 ? 'bg-amber-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
              <Activity className={`h-3 w-3 ${plantHealthScore < 85 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${plantHealthScore < 85 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {plantHealthScore}<span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Weighted Fleet Index
            </div>
          </div>
        </div>

        {/* KPI 3: Overall Risk */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Overall Risk
            </span>
            <div className={`w-5 h-5 rounded-md ${overallRisk === 'High' ? 'bg-rose-500/10' : overallRisk === 'Medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
              <ShieldAlert className={`h-3 w-3 ${overallRisk === 'High' ? 'text-rose-600 dark:text-rose-400' : overallRisk === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${overallRisk === 'High' ? 'text-rose-600 dark:text-rose-400' : overallRisk === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {overallRisk}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Plant-wide evaluation
            </div>
          </div>
        </div>

        {/* KPI 4: High-Risk Assets */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              High-Risk Assets
            </span>
            <div className={`w-5 h-5 rounded-md ${highRiskAssetsCount > 0 ? 'bg-rose-500/10' : 'bg-slate-500/10'} flex items-center justify-center`}>
              <Flame className={`h-3 w-3 ${highRiskAssetsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${highRiskAssetsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {highRiskAssetsCount}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              requiring dispatch
            </div>
          </div>
        </div>

        {/* KPI 5: Critical Alerts */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Critical Alerts
            </span>
            <div className={`w-5 h-5 rounded-md ${criticalAlertsCount > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
              <AlertTriangle className={`h-3 w-3 ${criticalAlertsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${criticalAlertsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {criticalAlertsCount}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              deterministic rules
            </div>
          </div>
        </div>

        {/* KPI 6: Maintenance Due */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Maintenance Due
            </span>
            <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Wrench className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {maintenanceDueCount}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              inverter / array cycle
            </div>
          </div>
        </div>

        {/* KPI 7: Performance Ratio */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Perf. Ratio (PR)
            </span>
            <div className={`w-5 h-5 rounded-md ${performanceRatioPct < 80.0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
              <Activity className={`h-3 w-3 ${performanceRatioPct < 80.0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${performanceRatioPct < 80.0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {performanceRatioPct}%
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              IEC 61724 standard
            </div>
          </div>
        </div>

        {/* KPI 8: Availability */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Availability
            </span>
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {availabilityPct}%
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              grid intertie online
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: SOLAR ENVIRONMENT CONTEXT + ACTIVE ALERTS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3 shrink-0">
        
        {/* Environment & Operating Context Card (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 gap-1.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Sun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Solar Resource &amp; Environmental Operating Context
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 pl-8">
                Operating solar irradiance and ambient measurements from on-site pyranometer station MET-01.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={resetDemoScenario}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset Solar Farm scenario data to initial baseline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* 5 Production-Relevant Readings */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1 items-stretch">
            
            {/* 1. POA Irradiance */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sun className="h-3 w-3 text-amber-500" />
                POA Irradiance
              </span>
              <div className="mt-2 flex items-end justify-between gap-1">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {plantContext.planeOfArrayIrradiancePoa} W/m²
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Tracker Plane</div>
                </div>
                <div className="w-16 h-7 shrink-0">
                  <MiniSparkline
                    data={[860, 880, 895, 910, 915, 912, plantContext.planeOfArrayIrradiancePoa]}
                    color="#f59e0b"
                    gradientId="spark-poa"
                  />
                </div>
              </div>
            </div>

            {/* 2. GHI Irradiance */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sun className="h-3 w-3 text-orange-500" />
                GHI Irradiance
              </span>
              <div className="mt-2 flex items-end justify-between gap-1">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {plantContext.globalHorizontalIrradianceGhi} W/m²
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Global Horizontal</div>
                </div>
                <div className="w-16 h-7 shrink-0">
                  <MiniSparkline
                    data={[820, 845, 860, 875, 878, 876, plantContext.globalHorizontalIrradianceGhi]}
                    color="#ea580c"
                    gradientId="spark-ghi"
                  />
                </div>
              </div>
            </div>

            {/* 3. Ambient Temperature */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-rose-500" />
                Ambient Temp
              </span>
              <div className="mt-2 flex items-end justify-between gap-1">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {plantContext.ambientTemperatureC.toFixed(1)}°C
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Shaded Pyranometer</div>
                </div>
                <div className="w-16 h-7 shrink-0">
                  <MiniSparkline
                    data={[26.5, 27.8, 28.9, 29.5, 29.7, 29.8, plantContext.ambientTemperatureC]}
                    color="#f43f5e"
                    gradientId="spark-amb-solar"
                  />
                </div>
              </div>
            </div>

            {/* 4. Module Average Temp */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-red-500" />
                Module Temp
              </span>
              <div className="mt-2 flex items-end justify-between gap-1">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {plantContext.moduleAverageTempC.toFixed(1)}°C
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Backsheet Mean</div>
                </div>
                <div className="w-16 h-7 shrink-0">
                  <MiniSparkline
                    data={[31.0, 32.5, 33.8, 34.2, 34.4, 34.3, plantContext.moduleAverageTempC]}
                    color="#dc2626"
                    gradientId="spark-mod-temp"
                  />
                </div>
              </div>
            </div>

            {/* 5. Wind Speed & Humidity */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Wind className="h-3 w-3 text-sky-500" />
                Wind / RH%
              </span>
              <div className="mt-2">
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  {plantContext.windSpeedMps.toFixed(1)} m/s
                </span>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">Humidity: {plantContext.relativeHumidityPct.toFixed(0)}%</div>
              </div>
            </div>

          </div>
        </div>

        {/* Active Reliability Alerts Card (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between overflow-hidden min-h-[220px]">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Active Reliability Alerts
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {activeAlerts.length} Active
              </span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  All solar subsystems within configured reliability limits.
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    onClick={() => setSelectedAlert(alert)}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/70 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-750/70 cursor-pointer transition shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {alert.assetCode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({alert.alertId})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                        {alert.priority} • +{alert.riskImpact}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1 pt-1">
                      {alert.alertTitle}
                    </p>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
                      <span>Val: <strong className="text-rose-600 dark:text-rose-400 font-mono">{alert.currentValue}</strong></span>
                      <span>Limit: <strong className="font-mono text-slate-700 dark:text-slate-300">{alert.thresholdValue}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('alerts')}
            className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-between transition cursor-pointer shadow-2xs shrink-0"
          >
            <span>Open Solar Complex Interactive Process HMI</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* ROW 3: THREE MAIN SOLAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3 shrink-0">
        
        {/* Chart 1: Generation vs Irradiance Model (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Plant Generation vs. Solar POA Irradiance
              </h3>
              <p className="text-[11px] text-slate-500">24-hour diurnal dispatch profile vs irradiance curve</p>
            </div>
            <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              124.6 MW Export
            </span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generationTimelineData}>
                <defs>
                  <linearGradient id="solarGenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="poaModelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis unit=" MW" domain={[0, 140]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="expectedMW" name="Expected Model (POA)" stroke="#94a3b8" strokeDasharray="3 3" fillOpacity={1} fill="url(#poaModelGrad)" />
                <Area type="monotone" dataKey="actualGeneration" name="Actual Generation" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#solarGenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inverter PCS Station Efficiency Comparison (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Inverter PCS Efficiency Benchmarks
              </h3>
              <p className="text-[11px] text-slate-500">Dual PCS Station Efficiency (%) &amp; Baseline</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Target &gt; 98.0%
            </span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inverterEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis unit="%" domain={[90, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <ReferenceLine y={97.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn: 97%', fill: '#f59e0b', fontSize: 9 }} />
                <Bar dataKey="efficiency" name="Actual Efficiency %" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: INV-02 IGBT Temp & Efficiency Anomaly Trend (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                INV-02 IGBT Thermal Anomaly
              </h3>
              <p className="text-[11px] text-slate-500">IGBT Junction Temp (°C) &amp; Eff</p>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
              isInv2Restored ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {isInv2Restored ? 'RESTORED' : 'ELEVATED'}
            </span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inv2TrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" unit="°C" domain={[40, 90]} tick={{ fontSize: 9 }} stroke="#f43f5e" />
                <YAxis yAxisId="right" orientation="right" unit="%" domain={[90, 100]} tick={{ fontSize: 9 }} stroke="#0284c7" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <ReferenceLine yAxisId="left" y={65} stroke="#f43f5e" strokeDasharray="3 3" />
                <Line yAxisId="left" type="monotone" dataKey="igbtTemp" name="IGBT Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#0284c7" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 4: LOWER COMMAND CENTER (THREE-CARD LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 2xl:gap-3 shrink-0 pb-6">
        
        {/* Card 1: Top Risk Assets */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Top Risk Solar Assets
              </h3>
              <button 
                onClick={() => onNavigateToTab('assets')}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              {topRiskAssets.map((asset) => (
                <div
                  key={asset.assetId}
                  onClick={() => setSelectedAsset(asset)}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 hover:border-amber-400 bg-slate-50 dark:bg-slate-750/70 cursor-pointer transition flex items-center justify-between shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {asset.assetCode}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        asset.riskLevel === 'Critical' || asset.riskLevel === 'High'
                          ? 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                          : asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      }`}>
                        {asset.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{asset.mainIssue}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      Risk: {asset.riskScore}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Health: {asset.healthScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Active Reliability Alerts */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Active Telemetry Alerts
              </h3>
              <button 
                onClick={() => onNavigateToTab('alerts')}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Process HMI</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.alertId}
                  onClick={() => setSelectedAlert(alert)}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 hover:border-amber-400 bg-slate-50 dark:bg-slate-750/70 cursor-pointer transition space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                      {alert.assetCode} — {alert.alertId}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      +{alert.riskImpact} Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {alert.alertTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {alert.triggerCondition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Prescriptive Recommended Actions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Prescriptive Recommended Actions
              </h3>
              <button 
                onClick={() => onNavigateToTab('cases')}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Work Orders</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.recommendationId}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-750/70 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {rec.assetCode} • {rec.priority}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">
                      -{rec.riskReductionEstimate} Risk Pts
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                    {rec.recommendationText}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400">Action: {rec.actionType}</span>
                    <button
                      onClick={() => createWorkOrderFromRecommendation(rec.recommendationId)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-500 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>Approve &amp; Log WO</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
