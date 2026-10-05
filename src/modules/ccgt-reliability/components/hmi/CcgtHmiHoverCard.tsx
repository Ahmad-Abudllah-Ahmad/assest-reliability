import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Zap, 
  Wrench, 
  Flame, 
  X,
  ExternalLink
} from 'lucide-react';
import { useCcgtReliability } from '../../CcgtReliabilityContext';
import { 
  CcgtAsset, 
  ReliabilityAlert, 
  ReliabilityRecommendation, 
  sortAlertsByOperationalSeverity,
  deriveMachineHmiStatus 
} from '../../types';
import { MachineLayoutNode } from './hmiLayoutConfig';

interface CcgtHmiHoverCardProps {
  node: MachineLayoutNode;
  asset?: CcgtAsset;
  alerts: ReliabilityAlert[];
  recommendation?: ReliabilityRecommendation;
  recommendations?: ReliabilityRecommendation[];
  onTrace: (alert: ReliabilityAlert) => void;
  onInspectAsset?: (asset: CcgtAsset) => void;
  onNavigateToCases?: () => void;
  onClose?: () => void;
  isPinned?: boolean;
}

export const CcgtHmiHoverCard: React.FC<CcgtHmiHoverCardProps> = ({
  node,
  asset,
  alerts,
  recommendation,
  recommendations = [],
  onTrace,
  onInspectAsset,
  onNavigateToCases,
  onClose,
  isPinned = false
}) => {
  const { createWorkOrderFromRecommendation } = useCcgtReliability();
  const [createdWoNum, setCreatedWoNum] = useState<string | null>(null);

  // If it's a process context item (non-monitored equipment: HRSG, Deaerator, Condenser, etc.)
  if (node.category === 'process' || !asset) {
    return (
      <div className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-slate-800 dark:text-slate-100 text-xs animate-fadeIn pointer-events-auto">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {node.label}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Process Context
          </span>
        </div>
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
          {node.name}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
          {node.sublabel}
        </p>
      </div>
    );
  }

  // Monitored Reliability Asset
  const machineStatus = deriveMachineHmiStatus(asset, alerts);
  const isHealthy = machineStatus === 'normal';
  const isModerate = machineStatus === 'moderate';
  const isHigh = machineStatus === 'high';
  const isCritical = machineStatus === 'critical';

  // Primary active alert selected deterministically: Priority (P1>P2>...) -> riskImpact (desc) -> createdAt
  const sortedAlerts = sortAlertsByOperationalSeverity(alerts);
  const primaryAlert = sortedAlerts[0];
  const secondaryAlerts = sortedAlerts.slice(1);

  // Match recommendation to the exact Primary Alert: sourceAlertId first, then sourceRuleId
  const matchedRecommendation = primaryAlert
    ? recommendations.find(r => r.sourceAlertId === primaryAlert.alertId) ||
      recommendations.find(r => r.sourceRuleId === primaryAlert.triggeredRuleId) ||
      recommendation
    : undefined;

  // Work order status derivation
  const isWoCreated = Boolean(
    createdWoNum ||
    matchedRecommendation?.status === 'Work Order Created' ||
    primaryAlert?.status === 'In Work Order'
  );

  const canApproveWo = Boolean(
    matchedRecommendation &&
    !isWoCreated &&
    (matchedRecommendation.status === 'Pending' || matchedRecommendation.status === 'Approved')
  );

  const handleApproveAndLogWo = () => {
    if (!matchedRecommendation) return;
    const woNum = createWorkOrderFromRecommendation(matchedRecommendation.recommendationId);
    setCreatedWoNum(woNum);
  };

  // Status badge with 4 visual levels
  const statusBadge = isCritical ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-600/30 font-mono animate-pulse">
      Critical • {asset.priority}
    </span>
  ) : isHigh ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-mono">
      High Risk • {asset.priority}
    </span>
  ) : isModerate ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
      Moderate • {asset.priority}
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-mono">
      Normal • Optimal
    </span>
  );

  return (
    <div className="w-[350px] max-h-[560px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-2xl text-slate-800 dark:text-slate-100 text-xs animate-fadeIn pointer-events-auto flex flex-col gap-2">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            {asset.assetCode}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[140px]" title={asset.assetName}>
            {asset.assetName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {statusBadge}
          {isPinned && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Inspector"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Mini-Grid */}
      <div className="grid grid-cols-4 gap-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-750 text-center shrink-0">
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Health</span>
          <span className={`font-mono font-bold text-xs ${
            asset.healthScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : asset.healthScore >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {asset.healthScore}/100
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Risk</span>
          <span className={`font-mono font-bold text-xs ${
            isCritical || isHigh ? 'text-rose-600 dark:text-rose-400' : isModerate ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {asset.riskScore}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Priority</span>
          <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
            {asset.priority}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Alerts</span>
          <span className={`font-mono font-bold text-xs ${
            alerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {alerts.length}
          </span>
        </div>
      </div>

      {/* Operational Telemetry Summary */}
      <div className="text-[10.5px] space-y-0.5 text-slate-600 dark:text-slate-300 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Power / Load:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {asset.telemetry.generationMW !== undefined
              ? `${asset.telemetry.generationMW.toFixed(0)} MW (${asset.telemetry.loadPct.toFixed(1)}%)`
              : asset.telemetry.powerConsumptionMW !== undefined
              ? `${asset.telemetry.powerConsumptionMW.toFixed(1)} MW Consumed`
              : asset.telemetry.transmittedMW !== undefined
              ? `${asset.telemetry.transmittedMW.toFixed(0)} MW Transmitted`
              : `${asset.telemetry.loadPct.toFixed(1)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Main Issue:</span>
          <span className={`font-medium truncate max-w-[210px] ${alerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {asset.mainIssue}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Trend:</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {asset.riskTrend}
          </span>
        </div>
      </div>

      {/* Healthy Asset View */}
      {isHealthy && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-center">
          <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            No active reliability conditions detected.
          </span>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            Operating within configured reliability thresholds.
          </p>
          {onInspectAsset && (
            <button
              onClick={() => onInspectAsset(asset)}
              className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Asset Diagnostics</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Active Alerts View */}
      {alerts.length > 0 && primaryAlert && (
        <div className="space-y-2 pt-0.5 flex flex-col">
          {/* Primary Alert Card */}
          <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 rounded-lg p-2 space-y-1 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1 truncate max-w-[230px]" title={primaryAlert.alertTitle}>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{primaryAlert.alertTitle}</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                +{primaryAlert.riskImpact} Risk
              </span>
            </div>

            <div className="text-[9.5px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Module: {primaryAlert.conditionModule}</span>
              <span className="font-mono font-semibold">Priority: {primaryAlert.priority}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[9.5px] bg-white/70 dark:bg-slate-900/60 p-1.5 rounded border border-rose-100 dark:border-rose-900/50">
              <div>
                <span className="text-slate-400 block">Current Value:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {primaryAlert.currentValue}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Threshold:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {primaryAlert.thresholdValue}
                </span>
              </div>
            </div>

            {/* Recommendation (matched exactly to this primary alert) */}
            <div className="pt-0.5">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                Prescriptive Action:
              </span>
              <p className="text-[10.5px] text-slate-700 dark:text-slate-300 line-clamp-2 mt-0.5">
                {matchedRecommendation?.recommendedAction || primaryAlert.recommendationText}
              </p>
            </div>

            {/* Rule ID display */}
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-0.5">
              <span>Rule Reference:</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">
                {primaryAlert.triggeredRuleId || primaryAlert.conditionModule}
              </span>
            </div>

            {/* Action Area: [ Trace Explainability ] [ Approve & Log WO ] */}
            <div className="pt-1.5 flex items-center gap-1.5 border-t border-rose-200/60 dark:border-rose-800/40">
              <button
                onClick={() => onTrace(primaryAlert)}
                className="flex-1 min-w-[110px] px-2 py-1 text-[10.5px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                title="Trace explainability and rule logic"
              >
                <span>Trace</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              {canApproveWo ? (
                <button
                  onClick={handleApproveAndLogWo}
                  className="flex-1 min-w-[120px] px-2 py-1 text-[10.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Approve recommendation and dispatch work order"
                >
                  <Wrench className="h-3 w-3" />
                  <span>Approve &amp; Log WO</span>
                </button>
              ) : isWoCreated ? (
                <span className="flex-1 min-w-[120px] px-2 py-1 text-[9.5px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-md flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>{createdWoNum ? `${createdWoNum} Logged` : 'WO Dispatched'}</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Secondary Alerts List (internal scrollable when multiple conditions active) */}
          {secondaryAlerts.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 flex flex-col gap-1 shrink-0">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block">
                Additional Active Conditions ({secondaryAlerts.length}):
              </span>
              <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                {secondaryAlerts.map(alt => (
                  <div key={alt.alertId} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <div className="truncate max-w-[210px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate" title={alt.alertTitle}>
                        • {alt.alertTitle}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {alt.priority} • +{alt.riskImpact} Risk
                      </span>
                    </div>
                    <button
                      onClick={() => onTrace(alt)}
                      className="px-2 py-0.5 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded text-[10px] font-bold flex items-center gap-0.5 shrink-0 transition cursor-pointer"
                    >
                      <span>Trace</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer link to Asset Diagnostics */}
      {onInspectAsset && (
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <span>{isPinned ? 'Asset Selected (Pinned)' : 'Hover active'}</span>
          <button
            onClick={() => onInspectAsset(asset)}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Full Diagnostics</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      )}

    </div>
  );
};

