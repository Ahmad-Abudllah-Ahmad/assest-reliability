import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Flame, 
  Wrench, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Zap,
  Waves,
  ChevronRight,
  Play
} from 'lucide-react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { ReliabilityAlert } from '../types';
import { GenerationTimelineCard } from '../../../components/GenerationTimelineCard';
import { CombustorEgtChart } from '../../../components/CombustorEgtChart';
import { HeatRateCurveChart } from '../../../components/HeatRateCurveChart';
import { INITIAL_COMBUSTOR_CANS, INITIAL_HEAT_RATE_DATA } from '../../../mockData';

interface CcgtCommandCenterViewProps {
  onNavigateToTab: (tab: string) => void;
  onNavigateToCatalog?: () => void;
}

// Mini Sparkline SVG Graph that cleanly fits inside the environmental reading cards
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

// Pool of realistic transient telemetry-triggered condition alerts for real-time streaming
const STREAMING_ALERTS_POOL: Omit<ReliabilityAlert, 'createdAt'>[] = [
  {
    alertId: 'ALT-204',
    assetId: 'asset-bfpa',
    assetCode: 'BFP-A',
    assetName: 'Boiler Feed Pump A',
    alertTitle: 'DE Bearing Vibration Transient Spike',
    conditionModule: 'Mechanical',
    triggeredRuleId: 'RULE-BFP-002',
    triggerCondition: 'Vibration reached 7.4 mm/s (> 6.0 mm/s Warning Threshold)',
    currentValue: '7.4 mm/s (Peak)',
    thresholdValue: '6.0 mm/s Warn / 8.5 mm/s Crit',
    riskImpact: 12,
    riskLevel: 'High',
    priority: 'P2',
    recommendationId: 'REC-204',
    recommendationText: 'Inspect outboard coupling alignment and bearing housing oil level.',
    status: 'Active',
    traceability: {
      rawData: 'Vibration Sensor DE-X = 7.4 mm/s, DE-Y = 6.8 mm/s',
      indicator: 'Overall RMS Vibration = 7.4 mm/s',
      rule: 'RULE-BFP-002: DE Bearing Vibration > 6.0 mm/s',
      condition: 'Mechanical Condition = Warning',
      riskImpact: '+12 Mechanical Risk',
      overallRisk: 'High vibration risking pump seal trip',
      recommendation: 'Perform vibration spectrum analysis and check coupling.'
    }
  },
  {
    alertId: 'ALT-205',
    assetId: 'asset-gt1',
    assetCode: 'GT-1',
    assetName: 'Gas Turbine 1',
    alertTitle: 'Combustor Can #8 Dynamic Pressure Pulsation',
    conditionModule: 'Thermal',
    triggeredRuleId: 'RULE-GT-005',
    triggerCondition: 'Combustion dynamics pulsation 0.38 bar (> 0.30 bar Warn Threshold)',
    currentValue: '0.38 bar RMS',
    thresholdValue: '0.30 bar Warn / 0.45 bar Crit',
    riskImpact: 8,
    riskLevel: 'Medium',
    priority: 'P3',
    recommendationId: 'REC-205',
    recommendationText: 'Tune pilot gas fuel split ratio to suppress acoustic oscillation.',
    status: 'Active',
    traceability: {
      rawData: 'Piezo Sensor Can 8 = 0.38 bar, 185 Hz dominant tone',
      indicator: 'Dynamic pressure band peak = 0.38 bar',
      rule: 'RULE-GT-005: Can Dynamics > 0.30 bar',
      condition: 'Combustion Dynamics = Warning',
      riskImpact: '+8 Thermal Risk',
      overallRisk: 'Minor acoustic fatigue on transition piece',
      recommendation: 'Trim pilot fuel valve by 1.2%.'
    }
  },
  {
    alertId: 'ALT-206',
    assetId: 'asset-gt2',
    assetCode: 'GT-2',
    assetName: 'Gas Turbine 2',
    alertTitle: 'Fuel Gas Control Valve Actuator Drift',
    conditionModule: 'Performance',
    triggeredRuleId: 'RULE-GT-008',
    triggerCondition: 'Valve position command error 3.8% (> 2.0% Threshold)',
    currentValue: '3.8% Position Error',
    thresholdValue: '2.0% Warn / 5.0% Crit',
    riskImpact: 14,
    riskLevel: 'High',
    priority: 'P2',
    recommendationId: 'REC-206',
    recommendationText: 'Check hydraulic servo valve pressure and feedback LVDT calibration.',
    status: 'Active',
    traceability: {
      rawData: 'LVDT Feedback = 64.2%, Setpoint = 68.0%, Delta = 3.8%',
      indicator: 'Servo Tracking Error = 3.8%',
      rule: 'RULE-GT-008: Fuel Valve Deviation > 2.0%',
      condition: 'Actuator Tracking = Warning',
      riskImpact: '+14 Control Risk',
      overallRisk: 'Turbine load oscillation during peak dispatch',
      recommendation: 'Inspect hydraulic servo filter and recalibrate LVDT.'
    }
  },
  {
    alertId: 'ALT-207',
    assetId: 'asset-gsu',
    assetCode: 'GSU',
    assetName: 'Main Step-Up Transformer',
    alertTitle: 'Transformer Top Oil Thermal Rise Gradient',
    conditionModule: 'Thermal',
    triggeredRuleId: 'RULE-GSU-001',
    triggerCondition: 'Oil temperature gradient reached +1.8°C/hr (> 1.2°C/hr)',
    currentValue: '72.4°C (+1.8°C/hr)',
    thresholdValue: '70.0°C Warn / 85.0°C Crit',
    riskImpact: 10,
    riskLevel: 'Medium',
    priority: 'P3',
    recommendationId: 'REC-207',
    recommendationText: 'Start auxiliary cooling fan bank 2 and inspect radiator airflow.',
    status: 'Active',
    traceability: {
      rawData: 'Top Oil RTD = 72.4°C, Ambient = 39.0°C, Fan Group 1 Running',
      indicator: 'Winding Hotspot = 82.1°C',
      rule: 'RULE-GSU-001: Top Oil Temp > 70°C',
      condition: 'Thermal Condition = Warning',
      riskImpact: '+10 Thermal Risk',
      overallRisk: 'High ambient causing elevated dielectric stress',
      recommendation: 'Stage secondary forced air cooling fans.'
    }
  },
  {
    alertId: 'ALT-208',
    assetId: 'asset-st1',
    assetCode: 'ST-1',
    assetName: 'Steam Turbine ST-1',
    alertTitle: 'HP Inlet Steam Valve Gland Leakoff Temperature',
    conditionModule: 'Thermal',
    triggeredRuleId: 'RULE-ST-006',
    triggerCondition: 'Valve packing leakoff temperature exceeded 310°C',
    currentValue: '318°C Leakoff Temp',
    thresholdValue: '300°C Warn / 340°C Crit',
    riskImpact: 9,
    riskLevel: 'Medium',
    priority: 'P3',
    recommendationId: 'REC-208',
    recommendationText: 'Verify steam seal gland regulator and adjust condenser leakoff.',
    status: 'Active',
    traceability: {
      rawData: 'Stem Leakoff TC = 318°C, Gland Steam Header = 1.08 bar',
      indicator: 'Gland leakoff temperature delta = +18°C',
      rule: 'RULE-ST-006: Steam Seal Leakoff > 300°C',
      condition: 'Steam Seal = Warning',
      riskImpact: '+9 Thermodynamic Risk',
      overallRisk: 'Steam loss to gland condenser reducing cycle efficiency',
      recommendation: 'Check gland steam exhauster vacuum.'
    }
  },
  {
    alertId: 'ALT-209',
    assetId: 'asset-gt2',
    assetCode: 'GT-2',
    assetName: 'Gas Turbine 2',
    alertTitle: 'Compressor Discharge Pressure Fluctuations',
    conditionModule: 'Performance',
    triggeredRuleId: 'RULE-GT-011',
    triggerCondition: 'CDP fluctuation amplitude reached 0.42 bar (> 0.25 bar)',
    currentValue: '14.8 bar (±0.42 bar)',
    thresholdValue: '15.2 bar Baseline (±0.25)',
    riskImpact: 11,
    riskLevel: 'High',
    priority: 'P2',
    recommendationId: 'REC-209',
    recommendationText: 'Inspect variable inlet guide vane (VIGV) tracking calibration.',
    status: 'Active',
    traceability: {
      rawData: 'CDP PT-201 = 14.8 bar, VIGV Angle = 81.2°',
      indicator: 'Compressor discharge stability index = 0.88',
      rule: 'RULE-GT-011: CDP Instability > 0.25 bar',
      condition: 'Aerodynamic Performance = Warning',
      riskImpact: '+11 Performance Risk',
      overallRisk: 'Compressor surge margin reduction',
      recommendation: 'Verify guide vane actuator positioner calibration.'
    }
  }
];

export const CcgtCommandCenterView: React.FC<CcgtCommandCenterViewProps> = ({
  onNavigateToTab,
  onNavigateToCatalog
}) => {
  const {
    assets,
    plantContext,
    alerts,
    setSelectedAlert,
    resetDemoScenario,
    plantOutputMW,
    plantHealthScore,
    overallRisk,
    highRiskAssetsCount,
    criticalAlertsCount,
    maintenanceDueCount,
    heatRateDeviationPct,
    availabilityPct
  } = useCcgtReliability();

  // Live Alert Streaming Simulator: adds a live incoming alert every 4 seconds
  const [liveAlerts, setLiveAlerts] = React.useState<ReliabilityAlert[]>(() => {
    return alerts.filter(a => a.status === 'Active' || a.status === 'Acknowledged');
  });
  const [isPaused, setIsPaused] = React.useState(false);
  const streamIndexRef = React.useRef(0);

  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const template = STREAMING_ALERTS_POOL[streamIndexRef.current % STREAMING_ALERTS_POOL.length];
      streamIndexRef.current += 1;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newAlert: ReliabilityAlert = {
        ...template,
        alertId: `ALT-${204 + (streamIndexRef.current % 100)}`,
        createdAt: timeStr
      };

      setLiveAlerts(prev => [newAlert, ...prev.slice(0, 8)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Check if GT-2 is post-maintenance restored (Section 14: multi-criteria reliability state)
  const gt2 = assets.find(a => a.assetCode === 'GT-2');
  const isGt2Restored = React.useMemo(() => {
    if (!gt2) return false;
    const isLowOrModerate = gt2.riskLevel === 'Low' || gt2.riskLevel === 'Moderate';
    const noCriticalRules = !gt2.triggeredRules.some(r => r.severity === 'critical');
    const noCriticalAlerts = !alerts.some(
      a => a.assetCode === 'GT-2' && (a.status === 'Active' || a.status === 'Acknowledged' || a.status === 'In Work Order') && a.riskLevel === 'Critical'
    );
    return isLowOrModerate && noCriticalRules && noCriticalAlerts;
  }, [gt2, alerts]);

  // Section 18: Bind current/final heat-rate values to current asset state while preserving historical points
  const heatRateCurveData = React.useMemo(() => {
    return INITIAL_HEAT_RATE_DATA.map(pt => {
      if (pt.isCurrentPoint) {
        const gt2HeatRate = gt2?.telemetry.heatRateBtuKwh ?? 10330;
        const gt2Baseline = gt2?.telemetry.baselineHeatRateBtuKwh ?? 9800;
        const gt2DevPct = gt2Baseline > 0 ? (gt2HeatRate - gt2Baseline) / gt2Baseline : 0.054;
        const calculatedPlantHeatRate = Math.round(6700 * (1 + (gt2DevPct * 142 / 462)));
        return {
          ...pt,
          actualHeatRate: calculatedPlantHeatRate,
          timestamp: isGt2Restored ? 'Current (Post-Maint)' : 'Current (14:00)'
        };
      }
      return pt;
    });
  }, [gt2, isGt2Restored]);

  // Transform GT-2 can temps for CombustorEgtChart
  const combustorCans = React.useMemo(() => {
    if (gt2?.telemetry.combustorCanTemps) {
      return gt2.telemetry.combustorCanTemps.map(c => ({
        canNumber: c.canNumber,
        canLabel: c.canLabel,
        temperature: c.tempC,
        isAnomaly: c.tempC < 585 || c.tempC > 620,
        statusText: c.tempC < 585 ? 'Cold Spot Deviation' : 'Normal Uniform'
      }));
    }
    return INITIAL_COMBUSTOR_CANS;
  }, [gt2]);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-3 2xl:gap-3.5 animate-fadeIn overflow-y-auto pr-0.5">

      {/* ROW 1: TOP EXECUTIVE KPI CARDS (8 Compact Modular Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 shrink-0">
        
        {/* KPI 1: Plant Output */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Plant Output
            </span>
            <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tracking-tight">
              {plantOutputMW.toFixed(0)} <span className="text-xs font-semibold">MW</span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              / 500 MW capacity
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
              Weighted Index
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
              of 5 units
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
              critical severity
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
              overhaul cycle
            </div>
          </div>
        </div>

        {/* KPI 7: Heat Rate Dev */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Heat Rate Dev
            </span>
            <div className={`w-5 h-5 rounded-md ${heatRateDeviationPct > 3 ? 'bg-rose-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
              <TrendingUp className={`h-3 w-3 ${heatRateDeviationPct > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${heatRateDeviationPct > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              +{heatRateDeviationPct}%
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              design gap
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
              NERC BAL standard
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: ENVIRONMENT CONTEXT (WITH MINI SPARKLINE GRAPHS) + LIVE ACTIVE RELIABILITY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3 shrink-0">
        
        {/* Environment & Operating Context Card (approx 68% desktop width) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/60 gap-1.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Thermometer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Environment &amp; Operating Context
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 pl-8">
                Conditions affecting plant output and thermal efficiency.
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={resetDemoScenario}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset Gas Combined Cycle scenario data to initial baseline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Grouped Readings: Ambient Conditions and Cooling Conditions with embedded Mini Trend Graphs */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch flex-1">
            
            {/* Ambient Conditions Group */}
            <div className="flex-1 sm:flex-[1.5] flex flex-col gap-1.5 justify-between">
              <div className="flex items-center gap-2 px-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Ambient Conditions
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                {/* Ambient Temp Card */}
                <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-amber-500" />
                      Ambient Temp
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      plantContext.ambientTemperatureC >= 38 
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    }`}>
                      {plantContext.ambientTemperatureC >= 38 ? 'Warning' : 'Normal'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-1.5">
                    <div>
                      <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                        {plantContext.ambientTemperatureC.toFixed(0)}°C
                      </span>
                      <div className="text-[9px] text-slate-400 font-medium">6h Trend</div>
                    </div>
                    <div className="w-16 sm:w-20 md:w-24 h-7 sm:h-8 shrink-0">
                      <MiniSparkline
                        data={[28, 29.5, 31, 33.5, 36, 38, plantContext.ambientTemperatureC]}
                        color={plantContext.ambientTemperatureC >= 38 ? '#f59e0b' : '#10b981'}
                        gradientId="spark-ambient"
                      />
                    </div>
                  </div>
                </div>

                {/* Humidity Card */}
                <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      Humidity
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      plantContext.ambientHumidityPct > 85 || plantContext.ambientHumidityPct < 20
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    }`}>
                      {plantContext.ambientHumidityPct > 85 || plantContext.ambientHumidityPct < 20 ? 'Warning' : 'Normal'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-1.5">
                    <div>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        {plantContext.ambientHumidityPct.toFixed(0)}%
                      </span>
                      <div className="text-[9px] text-slate-400 font-medium">6h Trend</div>
                    </div>
                    <div className="w-16 sm:w-20 md:w-24 h-7 sm:h-8 shrink-0">
                      <MiniSparkline
                        data={[65, 62, 59, 56, 54, 53, plantContext.ambientHumidityPct]}
                        color="#3b82f6"
                        gradientId="spark-humidity"
                      />
                    </div>
                  </div>
                </div>

                {/* Atm Pressure Card */}
                <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-indigo-500" />
                      Atm Pressure
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      plantContext.atmosphericPressureHpa < 980
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    }`}>
                      {plantContext.atmosphericPressureHpa < 980 ? 'Warning' : 'Normal'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-1.5">
                    <div>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        {plantContext.atmosphericPressureHpa.toFixed(0)} hPa
                      </span>
                      <div className="text-[9px] text-slate-400 font-medium">6h Trend</div>
                    </div>
                    <div className="w-16 sm:w-20 md:w-24 h-7 sm:h-8 shrink-0">
                      <MiniSparkline
                        data={[1007, 1006, 1005.5, 1005, 1004.5, 1004, plantContext.atmosphericPressureHpa]}
                        color="#6366f1"
                        gradientId="spark-pressure"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="hidden sm:block w-px bg-slate-200/80 dark:bg-slate-700/60 self-stretch my-0.5" />

            {/* Cooling Conditions Group */}
            <div className="flex-1 sm:flex-[1.0] flex flex-col gap-1.5 justify-between">
              <div className="flex items-center gap-2 px-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Cooling Conditions
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                {/* Cooling Water Temp Card */}
                <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Waves className="h-3 w-3 text-cyan-500" />
                      Cooling Water
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      plantContext.coolingWaterTempC >= 30
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    }`}>
                      {plantContext.coolingWaterTempC >= 30 ? 'Warning' : 'Normal'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-1.5">
                    <div>
                      <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                        {plantContext.coolingWaterTempC.toFixed(0)}°C
                      </span>
                      <div className="text-[9px] text-slate-400 font-medium">6h Trend</div>
                    </div>
                    <div className="w-16 sm:w-20 md:w-24 h-7 sm:h-8 shrink-0">
                      <MiniSparkline
                        data={[25, 26, 27.5, 29, 30, 30.8, plantContext.coolingWaterTempC]}
                        color={plantContext.coolingWaterTempC >= 30 ? '#f59e0b' : '#06b6d4'}
                        gradientId="spark-cooling"
                      />
                    </div>
                  </div>
                </div>

                {/* Cooling Water Delta T Card */}
                <div className="bg-slate-50 dark:bg-slate-750/70 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-teal-500" />
                      CW ΔT
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      Normal
                    </span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-1.5">
                    <div>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        {plantContext.coolingWaterDeltaC.toFixed(1)}°C
                      </span>
                      <div className="text-[9px] text-slate-400 font-medium">6h Trend</div>
                    </div>
                    <div className="w-16 sm:w-20 md:w-24 h-7 sm:h-8 shrink-0">
                      <MiniSparkline
                        data={[8.1, 8.3, 8.4, 8.6, 8.5, 8.4, plantContext.coolingWaterDeltaC]}
                        color="#14b8a6"
                        gradientId="spark-cw-delta"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Row 2 Right Card: ACTIVE RELIABILITY ALERTS (LIVE STREAMING) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between overflow-hidden min-h-[220px]">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Active Reliability Alerts</span>
                  </h3>
                </div>
              </div>

              {/* Live Streaming Indicator & Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition cursor-pointer"
                  title={isPaused ? "Resume live alert stream" : "Pause live alert stream"}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-2.5 w-2.5 text-emerald-500 fill-emerald-500" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">LIVE</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Streaming Alerts List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {liveAlerts.slice(0, 4).map((alert, idx) => (
                <div 
                  key={`${alert.alertId}-${alert.createdAt}`}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    idx === 0 && !isPaused
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-2xs animate-fadeIn'
                      : 'bg-slate-50 dark:bg-slate-750/70 border-slate-200/80 dark:border-slate-700/70 hover:border-amber-400 dark:hover:border-amber-500'
                  }`}
                  title="Click to trace alert & inspect root cause"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">{alert.assetCode}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({alert.alertId})</span>
                      {idx === 0 && !isPaused && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white animate-pulse">
                          LIVE
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {alert.createdAt}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                        {alert.priority} • +{alert.riskImpact}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1 pt-1">
                    {alert.alertTitle}
                  </p>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>Val: <strong className="text-rose-600 dark:text-rose-400 font-mono">{alert.currentValue}</strong></span>
                    <span>Limit: <strong className="font-mono text-slate-700 dark:text-slate-300">{alert.thresholdValue}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('alerts')}
            className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center justify-between transition cursor-pointer shadow-2xs shrink-0"
          >
            <span>Open Combined Cycle Process &amp; Reliability HMI ({liveAlerts.length} Total)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* ROW 3: MAIN CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3 shrink-0 pb-6">
        {/* Large Generation Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <GenerationTimelineCard 
            onNavigateToOptimizer={() => onNavigateToTab('cases')}
            onNavigateToCatalog={onNavigateToCatalog}
          />
        </div>

        {/* Stacked EGT Spread & Heat Rate Curve (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 2xl:gap-3">
          <div className="flex-1">
            <CombustorEgtChart 
              data={combustorCans}
              onLogCase={() => onNavigateToTab('alerts')}
            />
          </div>
          <div className="flex-1">
            <HeatRateCurveChart 
              data={heatRateCurveData}
              onLogCase={() => onNavigateToTab('alerts')}
            />
          </div>
        </div>
      </div>



    </div>
  );
};
