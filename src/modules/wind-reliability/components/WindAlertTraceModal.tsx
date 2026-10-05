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
  Wind
} from 'lucide-react';
import { useWindReliability } from '../WindReliabilityContext';
import { ReliabilityAlert } from '../types';

interface WindAlertTraceModalProps {
  alert: ReliabilityAlert | null;
  onClose: () => void;
  onNavigateToCases?: () => void;
}

export const WindAlertTraceModal: React.FC<WindAlertTraceModalProps> = ({
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
  } = useWindReliability();

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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                  {alert.assetCode}
                </span>
                <span className="font-mono text-xs text-slate-400">({alert.alertId})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  {alert.priority} • {alert.riskLevel} Risk (+{alert.riskImpact})
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {alert.alertTitle}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Diagnostic Traceability Chain (Section 44) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Diagnostic Traceability Chain (Explainable AI Lineage)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{alert.createdAt}</span>
          </div>

          <div className="space-y-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900/60">
            {/* Step 1: Raw Data */}
            <div className="flex items-start gap-3 pl-1 relative">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs z-10">
                1
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Raw SCADA Telemetry</span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{alert.traceability.rawData}</span>
              </div>
            </div>

            {/* Step 2: Calculated Indicator */}
            <div className="flex items-start gap-3 pl-1 relative">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs z-10">
                2
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Indicator &amp; Threshold Exceedance</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{alert.traceability.indicator}</span>
              </div>
            </div>

            {/* Step 3: Triggered Rule */}
            <div className="flex items-start gap-3 pl-1 relative">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs z-10">
                3
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Triggered Reliability Rule</span>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{alert.traceability.rule}</span>
              </div>
            </div>

            {/* Step 4: Condition Module */}
            <div className="flex items-start gap-3 pl-1 relative">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs z-10">
                4
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition Module Impact</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{alert.traceability.condition}</span>
              </div>
            </div>

            {/* Step 5: Risk Impact & Overall Risk */}
            <div className="flex items-start gap-3 pl-1 relative">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs z-10">
                5
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Deterministic Risk Score Impact</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">{alert.traceability.riskImpact}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{alert.traceability.overallRisk}</span>
                </div>
              </div>
            </div>

            {/* Step 6: Prescriptive Action */}
            <div className="flex items-start gap-3 pl-1 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs z-10">
                6
              </div>
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Prescriptive Operational Recommendation</span>
                <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{alert.traceability.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Dismiss prompt if open */}
          {showDismissInput && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Engineering Rationale for Dismissal:
              </label>
              <input
                type="text"
                placeholder="e.g. Transient terrain gust wake verified by ultrasonic sensor"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDismissInput(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    dismissAlert(alert.alertId, dismissReason || 'Operator confirmed safe');
                    onClose();
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {alert.status === 'Active' && (
              <button
                onClick={() => acknowledgeAlert(alert.alertId)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Acknowledge Alert
              </button>
            )}
            {alert.status !== 'Dismissed' && !showDismissInput && (
              <button
                onClick={() => setShowDismissInput(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Dismiss...
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {associatedRec && associatedRec.status !== 'Completed' && (
              <button
                onClick={handleApproveAndCreateWo}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Approve &amp; Log Work Order</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
