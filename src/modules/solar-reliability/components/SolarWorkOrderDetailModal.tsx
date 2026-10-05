import React from 'react';
import { 
  X, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  ShieldAlert, 
  Activity,
  Layers,
  Thermometer
} from 'lucide-react';
import { useSolarReliability } from '../SolarReliabilityContext';
import { WorkOrderRecord } from '../types';

interface SolarWorkOrderDetailModalProps {
  workOrder: WorkOrderRecord | null;
  onClose: () => void;
  onOpenCompleteModal: (wo: WorkOrderRecord) => void;
}

export const SolarWorkOrderDetailModal: React.FC<SolarWorkOrderDetailModalProps> = ({
  workOrder,
  onClose,
  onOpenCompleteModal
}) => {
  const { updateWorkOrderStage } = useSolarReliability();

  if (!workOrder) return null;

  const isClosed = workOrder.stage === 'Closed';

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
              <span className="font-mono text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                {workOrder.woNumber}
              </span>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                {workOrder.assetName} ({workOrder.assetCode})
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                {workOrder.priority} • {workOrder.riskLevel} Risk
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isClosed 
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}>
                Stage: {workOrder.stage}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {workOrder.issueTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Assigned Field Engineer: <strong className="text-slate-700 dark:text-slate-300">{workOrder.assignedEngineer}</strong> | Due Date: {workOrder.dueDate}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Work Order Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Closed banner if finished */}
          {isClosed && (
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                    Maintenance Completed &amp; Deterministic Recalculation Applied
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Closed on {workOrder.completionDate}. Telemetry verified in SCADA pipeline, health restored, and alert cleared.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Trace Info Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Incident SCADA Telemetry Stream</span>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-xs font-semibold">{workOrder.sourceTelemetrySummary}</p>
              <p className="text-[11px] text-slate-500 pt-0.5">Triggered: {workOrder.triggeredRuleName}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Reliability Risk Assessment</span>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-xs font-semibold">{workOrder.riskAssessmentSummary}</p>
              <p className="text-[11px] text-slate-500 pt-0.5">Origin Alert: {workOrder.sourceAlertId}</p>
            </div>
          </div>

          {/* Diagnostic Root Cause & Problem Description */}
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Diagnostic Problem &amp; Root Cause Analysis
            </h4>
            <div className="space-y-1 text-xs">
              <p><strong>Observed Problem:</strong> {workOrder.problemDescription}</p>
              <p><strong>Root Cause:</strong> {workOrder.rootCause}</p>
            </div>
          </div>

          {/* Required Parts & Planned Actions */}
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Field Execution Plan &amp; Replacement Spares
            </h4>
            <div className="space-y-1 text-xs">
              <p><strong>Planned Action:</strong> {workOrder.plannedAction}</p>
              {workOrder.actualAction && (
                <p className="text-emerald-700 dark:text-emerald-400"><strong>Actual Action Completed:</strong> {workOrder.actualAction}</p>
              )}
              <div>
                <strong>Spares / Parts:</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {workOrder.requiredParts.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-600">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              {workOrder.engineerNotes && (
                <p className="text-slate-600 dark:text-slate-400 pt-1"><strong>Engineer Notes:</strong> {workOrder.engineerNotes}</p>
              )}
            </div>
          </div>

          {/* Before vs After Reading Verification */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              Before &amp; After Condition Verification Matrix
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-600 block">Before Maintenance</span>
                <div>Health Score: <strong className="font-mono text-rose-600">{workOrder.beforeReading.healthScore}/100</strong></div>
                <div>Risk Score: <strong className="font-mono text-rose-600">{workOrder.beforeReading.riskScore}/100</strong></div>
                {workOrder.beforeReading.igbtTempC !== undefined && (
                  <div>IGBT Temp: <strong className="font-mono text-rose-600">{workOrder.beforeReading.igbtTempC}°C</strong></div>
                )}
                {workOrder.beforeReading.inverterEfficiencyPct !== undefined && (
                  <div>Inverter Efficiency: <strong className="font-mono text-rose-600">{workOrder.beforeReading.inverterEfficiencyPct}%</strong></div>
                )}
                {workOrder.beforeReading.actualPowerMw !== undefined && (
                  <div>Active Power: <strong className="font-mono text-slate-700 dark:text-slate-300">{workOrder.beforeReading.actualPowerMw} MW</strong></div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block">After Maintenance</span>
                {workOrder.afterReading ? (
                  <>
                    <div>Health Score: <strong className="font-mono text-emerald-600">{workOrder.afterReading.healthScore}/100</strong></div>
                    <div>Risk Score: <strong className="font-mono text-emerald-600">{workOrder.afterReading.riskScore}/100</strong></div>
                    {workOrder.afterReading.igbtTempC !== undefined && (
                      <div>IGBT Temp: <strong className="font-mono text-emerald-600">{workOrder.afterReading.igbtTempC}°C</strong></div>
                    )}
                    {workOrder.afterReading.inverterEfficiencyPct !== undefined && (
                      <div>Inverter Efficiency: <strong className="font-mono text-emerald-600">{workOrder.afterReading.inverterEfficiencyPct}%</strong></div>
                    )}
                    {workOrder.afterReading.actualPowerMw !== undefined && (
                      <div>Active Power: <strong className="font-mono text-emerald-600">{workOrder.afterReading.actualPowerMw} MW</strong></div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 italic text-[11px] pt-1">
                    Pending field work execution and post-maintenance SCADA sign-off.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {!isClosed && (
              <>
                <button
                  onClick={() => updateWorkOrderStage(workOrder.woNumber, 'Diagnosing')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${workOrder.stage === 'Diagnosing' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                >
                  Diagnosing
                </button>
                <button
                  onClick={() => updateWorkOrderStage(workOrder.woNumber, 'Planned Maintenance')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${workOrder.stage === 'Planned Maintenance' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                >
                  Planned Maintenance
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>

            {!isClosed && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCompleteModal(workOrder);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Maintenance &amp; Record Outcome</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
