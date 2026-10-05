import React, { useMemo } from 'react';
import { 
  Wind, 
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
  Compass, 
  ChevronRight,
  ArrowRight,
  Waves,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Scatter
} from 'recharts';
import { useWindReliability } from '../WindReliabilityContext';

interface WindCommandCenterViewProps {
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

export const WindCommandCenterView: React.FC<WindCommandCenterViewProps> = ({
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
    powerCurveDeviationPct,
    availabilityPct,
    resetDemoScenario,
    setSelectedAsset,
    setSelectedAlert,
    approveRecommendation,
    createWorkOrderFromRecommendation
  } = useWindReliability();

  const wt4 = assets.find(a => a.assetCode === 'WT-004');
  const isWt4Restored = wt4 && (wt4.riskLevel === 'Low' || wt4.riskLevel === 'Moderate') && wt4.telemetry.gearboxBearingTempC < 75;

  // 24h Generation vs Wind Power data
  const generationTimelineData = useMemo(() => [
    { time: '00:00', windSpeed: 8.2, availablePower: 18.5, actualGeneration: 18.2 },
    { time: '03:00', windSpeed: 9.1, availablePower: 22.4, actualGeneration: 22.0 },
    { time: '06:00', windSpeed: 10.4, availablePower: 26.8, actualGeneration: 26.3 },
    { time: '09:00', windSpeed: 11.2, availablePower: 29.8, actualGeneration: 29.1 },
    { time: '12:00', windSpeed: 11.6, availablePower: 31.0, actualGeneration: 30.2 },
    { time: '15:00', windSpeed: 11.5, availablePower: 30.8, actualGeneration: plantOutputMW },
    { time: '18:00', windSpeed: 10.8, availablePower: 28.2, actualGeneration: 27.6 },
    { time: '21:00', windSpeed: 9.6, availablePower: 24.1, actualGeneration: 23.5 }
  ], [plantOutputMW]);

  // Wind Turbine Power Curve (Wind Speed vs Expected MW vs Actual MW)
  const powerCurveData = useMemo(() => [
    { windSpeed: 3, cutIn: true, expectedMW: 0.1, actualMW: 0.1 },
    { windSpeed: 4, expectedMW: 0.4, actualMW: 0.38 },
    { windSpeed: 5, expectedMW: 0.9, actualMW: 0.88 },
    { windSpeed: 6, expectedMW: 1.6, actualMW: 1.55 },
    { windSpeed: 7, expectedMW: 2.5, actualMW: 2.42 },
    { windSpeed: 8, expectedMW: 3.4, actualMW: 3.28 },
    { windSpeed: 9, expectedMW: 4.2, actualMW: 4.05 },
    { windSpeed: 10, expectedMW: 4.8, actualMW: 4.65 },
    { windSpeed: 11, expectedMW: 5.1, actualMW: 4.98 },
    { windSpeed: 11.5, currentPoint: true, expectedMW: 5.2, actualMW: isWt4Restored ? 5.18 : 4.92 },
    { windSpeed: 12, expectedMW: 5.2, actualMW: 5.2 },
    { windSpeed: 14, expectedMW: 5.2, actualMW: 5.2 },
    { windSpeed: 16, expectedMW: 5.2, actualMW: 5.2 },
    { windSpeed: 20, expectedMW: 5.2, actualMW: 5.2 },
    { windSpeed: 25, cutOut: true, expectedMW: 5.2, actualMW: 0 }
  ], [isWt4Restored]);

  // WT-004 Bearing Temp & Vibration 8-hour trend
  const wt4TrendData = useMemo(() => {
    if (isWt4Restored) {
      return [
        { time: '08:00', bearingTemp: 78.4, vibration: 3.2, limitTemp: 75.0, limitVib: 2.5 },
        { time: '10:00', bearingTemp: 80.2, vibration: 3.5, limitTemp: 75.0, limitVib: 2.5 },
        { time: '12:00', bearingTemp: 81.4, vibration: 3.8, limitTemp: 75.0, limitVib: 2.5 },
        { time: '13:00', event: 'Work Order Executed', bearingTemp: 76.0, vibration: 2.4, limitTemp: 75.0, limitVib: 2.5 },
        { time: '14:00', bearingTemp: 70.2, vibration: 1.7, limitTemp: 75.0, limitVib: 2.5 },
        { time: '15:00', bearingTemp: 68.4, vibration: 1.5, limitTemp: 75.0, limitVib: 2.5 }
      ];
    }
    return [
      { time: '08:00', bearingTemp: 76.5, vibration: 2.8, limitTemp: 75.0, limitVib: 2.5 },
      { time: '10:00', bearingTemp: 78.2, vibration: 3.1, limitTemp: 75.0, limitVib: 2.5 },
      { time: '12:00', bearingTemp: 79.8, vibration: 3.4, limitTemp: 75.0, limitVib: 2.5 },
      { time: '13:30', bearingTemp: 80.6, vibration: 3.6, limitTemp: 75.0, limitVib: 2.5 },
      { time: '14:45', bearingTemp: 81.4, vibration: 3.8, limitTemp: 75.0, limitVib: 2.5 },
      { time: 'Now', bearingTemp: 81.4, vibration: 3.8, limitTemp: 75.0, limitVib: 2.5 }
    ];
  }, [isWt4Restored]);

  // Top Risk Assets sorted descending
  const topRiskAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  }, [assets]);

  // Active Alerts sorted by priority/riskImpact
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
            <div className="w-5 h-5 rounded-md bg-sky-500/10 flex items-center justify-center">
              <Zap className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-sky-600 dark:text-sky-400 tracking-tight">
              {plantOutputMW.toFixed(1)} <span className="text-xs font-semibold">MW</span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              / 31.2 MW rated
            </div>
          </div>
        </div>

        {/* KPI 2: Farm Health */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Farm Health
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
              of 6 turbines
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
              scheduled cycle
            </div>
          </div>
        </div>

        {/* KPI 7: Power Curve Dev */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Power Curve Dev
            </span>
            <div className={`w-5 h-5 rounded-md ${powerCurveDeviationPct < -2.0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
              <TrendingDown className={`h-3 w-3 ${powerCurveDeviationPct < -2.0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${powerCurveDeviationPct < -2.0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {powerCurveDeviationPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              vs aero model
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
              {availabilityPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              IEC 61400 standard
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: WIND ENVIRONMENT CONTEXT + ACTIVE ALERTS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3 shrink-0">
        
        {/* Environment & Operating Context Card (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 gap-1.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Wind className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Wind Resource &amp; Environmental Context
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 pl-8">
                Operating atmospheric conditions measured at 110m hub-height MET mast.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={resetDemoScenario}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:white bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset Wind Farm scenario data to initial baseline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* 5 Wind Environmental Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1 items-stretch">
            
            {/* 1. Avg Wind Speed */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Wind className="h-3 w-3 text-sky-500" />
                Avg Wind Speed
              </span>
              <div className="mt-2 flex items-end justify-between gap-1">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {plantContext.avgWindSpeedMs.toFixed(1)} m/s
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Optimal Range</div>
                </div>
                <div className="w-16 h-7 shrink-0">
                  <MiniSparkline
                    data={[9.8, 10.4, 11.2, 11.6, 11.4, 11.5, plantContext.avgWindSpeedMs]}
                    color="#0284c7"
                    gradientId="spark-wind-spd"
                  />
                </div>
              </div>
            </div>

            {/* 2. Wind Direction */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Compass className="h-3 w-3 text-indigo-500" />
                Wind Direction
              </span>
              <div className="mt-2">
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  {plantContext.windDirectionDeg.toFixed(0)}° WSW
                </span>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">True North Ref</div>
              </div>
            </div>

            {/* 3. Turbulence Intensity */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Waves className="h-3 w-3 text-teal-500" />
                Turbulence (TI)
              </span>
              <div className="mt-2">
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  {plantContext.turbulenceIntensityPct.toFixed(1)}%
                </span>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">IEC Category B</div>
              </div>
            </div>

            {/* 4. Ambient Temperature */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-amber-500" />
                Ambient Temp
              </span>
              <div className="mt-2 flex items-end justify-between gap-1">
                <div>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {plantContext.ambientTemperatureC.toFixed(1)}°C
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Air Density Normal</div>
                </div>
                <div className="w-16 h-7 shrink-0">
                  <MiniSparkline
                    data={[16.8, 17.2, 17.5, 17.8, 18.0, 18.2, plantContext.ambientTemperatureC]}
                    color="#f59e0b"
                    gradientId="spark-amb-temp"
                  />
                </div>
              </div>
            </div>

            {/* 5. Atmospheric Pressure & Shear */}
            <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Gauge className="h-3 w-3 text-blue-500" />
                Atm Pressure / α
              </span>
              <div className="mt-2">
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  {plantContext.atmosphericPressureHpa.toFixed(0)} hPa
                </span>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5">Shear α: {plantContext.windShearExponent.toFixed(3)}</div>
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
                  All turbine reliability rules within configured limits.
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    onClick={() => setSelectedAlert(alert)}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/70 hover:border-sky-400 dark:hover:border-sky-500 bg-slate-50 dark:bg-slate-750/70 cursor-pointer transition shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
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
            className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 border border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-[11px] font-semibold flex items-center justify-between transition cursor-pointer shadow-2xs shrink-0"
          >
            <span>Open Wind Farm Interactive Process HMI</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* ROW 3: THREE MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3 shrink-0">
        
        {/* Chart 1: Farm Generation vs Available Wind Power (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Farm Generation vs. Available Wind Power
              </h3>
              <p className="text-[11px] text-slate-500">24-hour dispatch timeline and aerodynamic capture</p>
            </div>
            <span className="text-[10px] font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              30.7 MW Net
            </span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generationTimelineData}>
                <defs>
                  <linearGradient id="windGenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="availPowerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis unit=" MW" domain={[0, 35]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="availablePower" name="Available Wind Power" stroke="#94a3b8" strokeDasharray="3 3" fillOpacity={1} fill="url(#availPowerGrad)" />
                <Area type="monotone" dataKey="actualGeneration" name="Actual Generation" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#windGenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Wind Turbine Power Curve (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                5.2MW Aerodynamic Power Curve
              </h3>
              <p className="text-[11px] text-slate-500">Wind Speed (m/s) vs. Output (MW)</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Cut-in 3.0 m/s
            </span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerCurveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="windSpeed" unit="m/s" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis unit=" MW" domain={[0, 6]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <ReferenceLine x={11.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Current: 11.5m/s', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                <Line type="monotone" dataKey="expectedMW" name="Expected Aero Model" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1.8} />
                <Line type="monotone" dataKey="actualMW" name="Fleet Actual Output" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: WT-004 Gearbox Temp & Vibration Anomaly Trend (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                WT-004 Bearing Anomaly
              </h3>
              <p className="text-[11px] text-slate-500">Gearbox Temp (°C) &amp; Vibration</p>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
              isWt4Restored ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {isWt4Restored ? 'RESTORED' : 'ELEVATED'}
            </span>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wt4TrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" unit="°C" domain={[60, 90]} tick={{ fontSize: 9 }} stroke="#f43f5e" />
                <YAxis yAxisId="right" orientation="right" unit="mm/s" domain={[0, 5]} tick={{ fontSize: 9 }} stroke="#8b5cf6" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
                />
                <ReferenceLine yAxisId="left" y={75} stroke="#f43f5e" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="right" y={2.5} stroke="#8b5cf6" strokeDasharray="3 3" />
                <Line yAxisId="left" type="monotone" dataKey="bearingTemp" name="Bearing Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
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
                Top Risk Wind Assets
              </h3>
              <button 
                onClick={() => onNavigateToTab('assets')}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
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
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 hover:border-sky-400 bg-slate-50 dark:bg-slate-750/70 cursor-pointer transition flex items-center justify-between shadow-2xs"
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
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
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
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 hover:border-sky-400 bg-slate-50 dark:bg-slate-750/70 cursor-pointer transition space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
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
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
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
                      -{rec.priority === 'P1' ? 25 : 15} Risk Pts
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                    {rec.recommendedAction}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400">Action: {rec.reason}</span>
                    <button
                      onClick={() => createWorkOrderFromRecommendation(rec.recommendationId)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-sky-600 hover:bg-sky-500 transition cursor-pointer flex items-center gap-1 shadow-2xs"
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
