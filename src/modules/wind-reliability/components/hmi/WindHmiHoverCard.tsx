import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Zap, 
  Wrench, 
  Wind, 
  X,
  ExternalLink
} from 'lucide-react';
import { useWindReliability } from '../../WindReliabilityContext';
import { 
  WindAsset, 
  ReliabilityAlert, 
  ReliabilityRecommendation,
  deriveMachineHmiStatus 
} from '../../types';
import { WindMachineLayoutNode } from './windHmiLayoutConfig';

interface WindHmiHoverCardProps {
  node: WindMachineLayoutNode;
  asset?: WindAsset;
  alerts: ReliabilityAlert[];
  recommendation?: ReliabilityRecommendation;
  recommendations?: ReliabilityRecommendation[];
  onTrace: (alert: ReliabilityAlert) => void;
  onInspectAsset?: (asset: WindAsset) => void;
  onNavigateToCases?: () => void;
  onClose?: () => void;
  isPinned?: boolean;
}

export const WindHmiHoverCard: React.FC<WindHmiHoverCardProps> = ({
  node,
  asset,
  alerts,
  recommendations = [],
  onTrace,
  onInspectAsset,
  onNavigateToCases,
  onClose,
  isPinned = false
}) => {
  const { createWorkOrderFromRecommendation } = useWindReliability();
  const [createdWoNum, setCreatedWoNum] = useState<string | null>(null);

  // If process context item (e.g., MET-01, Aux GenSet, Grid intertie)
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
        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{node.name}</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{node.sublabel}</p>
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2 border border-slate-200/80 dark:border-slate-700/60 text-[11px] flex items-center justify-between">
          <span className="text-slate-500">Telemetry Status:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">NOMINAL RUN</span>
        </div>
      </div>
    );
  }

  const primaryAlert = alerts[0];
  const primaryRec = recommendations.find(r => r.assetId === asset.assetId || r.sourceAlertId === primaryAlert?.alertId);
  const isHighRisk = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';
  const isHealthy = asset.riskLevel === 'Low' && alerts.length === 0;

  const handleCreateWo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryRec) {
      const woNum = createWorkOrderFromRecommendation(primaryRec.recommendationId);
      setCreatedWoNum(woNum);
      setTimeout(() => {
        onNavigateToCases?.();
      }, 700);
    }
  };

  return (
    <div className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xl text-slate-800 dark:text-slate-100 text-xs animate-fadeIn select-none pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            {asset.assetCode}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[130px]">
            {asset.assetName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isPinned && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              PINNED
            </span>
          )}
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition cursor-pointer"
            title="Close card"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Scores Row */}
      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Health</span>
          <span className={`font-mono text-sm font-bold ${asset.healthScore < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {asset.healthScore}/100
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Risk</span>
          <span className={`font-mono text-sm font-bold ${isHighRisk ? 'text-rose-600 dark:text-rose-400' : asset.riskLevel === 'Moderate' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {asset.riskScore}/100
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Power</span>
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
            {((asset.telemetry.activePowerKw || 0) / 1000).toFixed(1)} MW
          </span>
        </div>
      </div>

      {/* Primary Issue / Telemetry finding */}
      <div className="mb-2.5">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Diagnosis</div>
        <p className={`text-[11px] font-medium leading-snug rounded-lg p-2 border ${
          isHighRisk 
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200' 
            : asset.riskLevel === 'Moderate'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
        }`}>
          {asset.mainIssue}
        </p>
      </div>

      {/* Alerts & Traceability if present */}
      {primaryAlert && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/60 mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-rose-500" />
              <span>{primaryAlert.alertTitle}</span>
            </span>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
              +{primaryAlert.riskImpact} Risk
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <div>Measured: <strong className="text-slate-700 dark:text-slate-200 font-mono">{primaryAlert.currentValue}</strong> (Limit: {primaryAlert.thresholdValue})</div>
          </div>
          <button
            onClick={() => onTrace(primaryAlert)}
            className="mt-2 w-full py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded border border-blue-200 dark:border-blue-800 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Trace Diagnostic Explainability</span>
            <ArrowRight className="h-2.5 w-2.5" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onInspectAsset?.(asset)}
          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Asset Detail</span>
          <ExternalLink className="h-3 w-3" />
        </button>

        {primaryRec && primaryRec.status !== 'Completed' && (
          <button
            onClick={handleCreateWo}
            disabled={Boolean(createdWoNum)}
            className={`flex-1 py-1.5 px-2 font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1 cursor-pointer ${
              createdWoNum 
                ? 'bg-emerald-600 text-white cursor-default' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
            }`}
          >
            {createdWoNum ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>{createdWoNum}</span>
              </>
            ) : (
              <>
                <Wrench className="h-3 w-3" />
                <span>Log Work Order</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
