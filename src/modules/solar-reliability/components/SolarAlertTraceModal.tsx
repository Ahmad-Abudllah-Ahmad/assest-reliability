import React from 'react';
import { 
  X, 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Wrench, 
  Sliders, 
  FileText,
  Thermometer,
  Layers,
  Sparkles
} from 'lucide-react';
import { ReliabilityAlert } from '../types';
import { useSolarReliability } from '../SolarReliabilityContext';

interface SolarAlertTraceModalProps {
  alert: ReliabilityAlert | null;
  onClose: () => void;
  onNavigateToCases?: () => void;
}

export const SolarAlertTraceModal: React.FC<SolarAlertTraceModalProps> = ({
  alert,
  onClose,
  onNavigateToCases
}) => {
  const { 
    acknowledgeAlert, 
    dismissAlert, 
    createWorkOrderFromRecommendation 
  } = useSolarReliability();

  if (!alert) return null;

  const trace = alert.traceability;

  const handleCreateWO = () => {
    createWorkOrderFromRecommendation(alert.recommendationId);
    onClose();
    if (onNavigateToCases) onNavigateToCases();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {alert.assetCode}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {alert.alertId}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                {alert.priority} • +{alert.riskImpact} Risk
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Status: {alert.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {alert.alertTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Equipment: <strong className="text-slate-700 dark:text-slate-300">{alert.assetName}</strong> | Triggered Condition: {alert.triggerCondition}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 6-Step Causal Trace Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          <div className="flex items-center gap-2 px-1">
            <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              End-to-End Reliability Causal Pipeline
            </span>
          </div>

          {/* STEP 1: RAW SCADA TELEMETRY */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">1</span>
                Raw SCADA Telemetry Stream
              </span>
              <span className="text-[10px] font-mono text-slate-400">{alert.createdAt}</span>
            </div>
            <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold pl-5">
              {trace.rawData}
            </p>
          </div>

          {/* STEP 2: CALCULATED INDICATORS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] flex items-center justify-center font-bold">2</span>
              Calculated Reliability Indicator
            </span>
            <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold pl-5">
              {trace.indicator}
            </p>
          </div>

          {/* STEP 3: CONFIGURED RULE TRIGGER */}
          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Configured Reliability Rule Triggered
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                +{alert.riskImpact} Risk Pts
              </span>
            </div>
            <p className="font-semibold text-rose-900 dark:text-rose-200 pl-5">
              {trace.rule}
            </p>
          </div>

          {/* STEP 4: CONDITION MODULE IMPACT */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">4</span>
              Condition Module Evaluation &amp; Health Impact
            </span>
            <p className="text-slate-800 dark:text-slate-200 pl-5">
              {trace.conditionModule} • {trace.conditionImpact}
            </p>
          </div>

          {/* STEP 5: RISK ASSESSMENT ESCALATION */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">5</span>
              Asset Risk Score Escalation
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 pl-5">
              {trace.overallRisk}
            </p>
          </div>

          {/* STEP 6: PRESCRIPTIVE RECOMMENDATION */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">6</span>
              Prescriptive Corrective Action Recommendation
            </span>
            <p className="font-medium text-emerald-950 dark:text-emerald-100 pl-5">
              {trace.recommendation}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {alert.status === 'Active' && (
              <button
                onClick={() => acknowledgeAlert(alert.alertId)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition cursor-pointer"
              >
                Acknowledge Alert
              </button>
            )}
            <button
              onClick={() => dismissAlert(alert.alertId)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleCreateWO}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition cursor-pointer active:scale-95"
            >
              <Wrench className="h-4 w-4" />
              <span>Approve &amp; Log Work Order</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
