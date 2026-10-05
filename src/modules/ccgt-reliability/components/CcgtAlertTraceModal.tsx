import React, { useState } from 'react';
import { 
  X, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  UserPlus, 
  ShieldAlert, 
  FileText,
  Clock,
  Zap,
  Layers
} from 'lucide-react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { ReliabilityAlert } from '../types';

interface CcgtAlertTraceModalProps {
  alert: ReliabilityAlert | null;
  onClose: () => void;
  onNavigateToCases?: () => void;
}

export const CcgtAlertTraceModal: React.FC<CcgtAlertTraceModalProps> = ({
  alert,
  onClose,
  onNavigateToCases
}) => {
  const {
    acknowledgeAlert,
    dismissAlert,
    approveRecommendation,
    createWorkOrderFromRecommendation,
    recommendations
  } = useCcgtReliability();

  const [dismissReason, setDismissReason] = useState('');
  const [showDismissInput, setShowDismissInput] = useState(false);

  if (!alert) return null;

  const associatedRec = recommendations.find(r => r.recommendationId === alert.recommendationId || r.sourceAlertId === alert.alertId);

  const handleApproveAndCreateWo = () => {
    if (associatedRec) {
      approveRecommendation(associatedRec.recommendationId);
      createWorkOrderFromRecommendation(associatedRec.recommendationId);
      onClose();
      onNavigateToCases?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {alert.alertId}
              </span>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                {alert.assetCode}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-mono">
                {alert.priority} • {alert.riskLevel} Risk
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {alert.alertTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Trigger: {alert.triggerCondition} | Registered: {alert.createdAt}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Traceability Flow (Section 12 Mandatory Trace) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Full Explainability Traceability Chain
            </h4>
            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
              Rule-Based Deterministic Trace
            </span>
          </div>

          {/* Trace Nodes Sequence */}
          <div className="space-y-2 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
            {/* Step 1: Raw Operational Data */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2.5 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                1
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Source Raw Telemetry</span>
                <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {alert.traceability.rawData}
                </p>
              </div>
            </div>

            {/* Step 2: Calculated Indicator */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2.5 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                2
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Reliability Indicator</span>
                <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {alert.traceability.indicator}
                </p>
              </div>
            </div>

            {/* Step 3: Triggered Rule */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2.5 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                3
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Triggered Reliability Rule</span>
                <p className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                  {alert.traceability.rule}
                </p>
              </div>
            </div>

            {/* Step 4: Condition Module Status */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2.5 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                4
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition Module Impact</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {alert.traceability.condition}
                </p>
              </div>
            </div>

            {/* Step 5: Risk Impact & Overall Risk */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2.5 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                5
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Risk Contribution</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                    {alert.traceability.riskImpact}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {alert.traceability.overallRisk}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 6: Structured Recommendation */}
            <div className="relative pl-9">
              <div className="absolute left-2.5 top-2.5 -translate-x-1/2 h-4 w-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                6
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Recommended Mitigating Action</span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {associatedRec ? associatedRec.recommendedAction : alert.recommendationText}
                </p>
                {associatedRec && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 space-y-1">
                    <p><strong>Reason:</strong> {associatedRec.reason}</p>
                    <p><strong>Timeline:</strong> {associatedRec.recommendedTimeline} | <strong>Priority:</strong> {associatedRec.priority}</p>
                    <p className="text-rose-600 dark:text-rose-400"><strong>Risk if ignored:</strong> {associatedRec.riskIfIgnored}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dismissal input if opened */}
          {showDismissInput && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Reason for dismissing alert:
              </label>
              <input
                type="text"
                placeholder="e.g. Transient SCADA sensor spike verified during startup ramp"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDismissInput(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => dismissAlert(alert.alertId, dismissReason || 'Dismissed by engineer')}
                  className="px-3 py-1 text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Confirm Dismissal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Row (Section 12 Requirements) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {alert.status === 'Active' && (
              <button
                onClick={() => acknowledgeAlert(alert.alertId)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition cursor-pointer"
              >
                Acknowledge Alert
              </button>
            )}

            {!showDismissInput && alert.status !== 'Dismissed' && alert.status !== 'Resolved' && (
              <button
                onClick={() => setShowDismissInput(true)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-rose-600 transition cursor-pointer"
              >
                Dismiss / Close
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleApproveAndCreateWo}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30 transition cursor-pointer active:scale-95"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Approve &amp; Create Work Order</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
