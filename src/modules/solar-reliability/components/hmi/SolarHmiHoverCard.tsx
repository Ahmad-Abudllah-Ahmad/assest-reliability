import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle, 
  Pin, 
  ShieldAlert, 
  Wrench, 
  Zap,
  X,
  Thermometer,
  Layers
} from 'lucide-react';
import { SolarAsset } from '../../types';

interface SolarHmiHoverCardProps {
  asset: SolarAsset;
  isPinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
  onOpenTrace: (asset: SolarAsset) => void;
  onOpenDetail: (asset: SolarAsset) => void;
  onLogWorkOrder: (asset: SolarAsset) => void;
}

export const SolarHmiHoverCard: React.FC<SolarHmiHoverCardProps> = ({
  asset,
  isPinned,
  onTogglePin,
  onClose,
  onOpenTrace,
  onOpenDetail,
  onLogWorkOrder
}) => {
  const tel = asset.telemetry;
  const isHealthy = asset.riskLevel === 'Low';
  const primaryRule = asset.triggeredRules[0];

  return (
    <div 
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-4 w-84 sm:w-96 text-xs text-slate-900 dark:text-slate-100 flex flex-col gap-2.5 transition-all select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              {asset.assetCode}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              asset.riskLevel === 'Critical' || asset.riskLevel === 'High'
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                : asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
            }`}>
              {asset.priority} • {asset.riskLevel} Risk
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
            {asset.assetName}
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isPinned 
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isPinned ? 'Unpin card' : 'Pin card in place'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Row: Health vs Risk Scores */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Health</span>
          <span className={`text-base font-bold font-mono ${
            asset.healthScore < 80 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {asset.healthScore}%
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Risk</span>
          <span className={`text-base font-bold font-mono ${
            asset.riskScore >= 60 ? 'text-rose-600' : asset.riskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {asset.riskScore}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Power</span>
          <span className="text-base font-bold font-mono text-sky-600">
            {tel.activePowerOutputMW} MW
          </span>
        </div>
      </div>

      {/* Key Diagnostic Telemetry Strip */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {tel.igbtTempC !== undefined && (
          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500 flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-rose-500" />
              IGBT Temp
            </span>
            <span className={`font-mono font-bold ${tel.igbtTempC >= 75 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
              {tel.igbtTempC}°C
            </span>
          </div>
        )}

        {tel.inverterEfficiencyPct !== undefined && (
          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500">Inverter Efficiency</span>
            <span className={`font-mono font-bold ${tel.inverterEfficiencyPct < 96 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {tel.inverterEfficiencyPct}%
            </span>
          </div>
        )}

        {tel.poaIrradianceWpM2 !== undefined && (
          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500">Plane of Array (POA)</span>
            <span className="font-mono font-bold text-amber-600">{tel.poaIrradianceWpM2} W/m²</span>
          </div>
        )}

        {tel.moduleTempC !== undefined && (
          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500">Module Surface Temp</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{tel.moduleTempC}°C</span>
          </div>
        )}

        {tel.trackerTiltAngleDeg !== undefined && (
          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500">Tracker Tilt / Target</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {tel.trackerTiltAngleDeg}° / {tel.expectedTiltAngleDeg}°
            </span>
          </div>
        )}

        {tel.bessSocPct !== undefined && (
          <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-500">BESS State of Charge</span>
            <span className="font-mono font-bold text-sky-600">{tel.bessSocPct}%</span>
          </div>
        )}
      </div>

      {/* Primary Triggered Condition Box (if abnormal) */}
      {!isHealthy && primaryRule && (
        <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {primaryRule.ruleName}
            </span>
            <span className="text-[10px] font-mono text-rose-600 font-bold">
              +{primaryRule.riskImpact} Risk
            </span>
          </div>
          <p className="text-[11px] text-rose-900 dark:text-rose-200 font-medium">
            Measured: <strong className="font-mono">{primaryRule.currentValue} {primaryRule.unit}</strong> (Threshold: {primaryRule.thresholdValue} {primaryRule.unit})
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic pt-0.5 line-clamp-2">
            Recommendation: {primaryRule.recommendationTemplate}
          </p>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onOpenDetail(asset)}
          className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <Layers className="h-3 w-3" />
          <span>Diagnostic Detail</span>
        </button>

        {!isHealthy && (
          <>
            <button
              onClick={() => onOpenTrace(asset)}
              className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-300 dark:border-amber-800 transition flex items-center justify-center gap-1 cursor-pointer"
              title="Inspect 6-step causal trace"
            >
              <Activity className="h-3 w-3" />
              <span>Trace</span>
            </button>

            <button
              onClick={() => onLogWorkOrder(asset)}
              className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <Wrench className="h-3 w-3" />
              <span>Log WO</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
};
