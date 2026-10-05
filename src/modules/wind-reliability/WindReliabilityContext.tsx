import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  WindPlantContext,
  ReliabilityRule,
  RawWindTelemetry,
  WindAsset,
  ReliabilityAlert,
  ReliabilityRecommendation,
  WorkOrderRecord,
  AssetHistoryEvent,
  MaintenanceOutcomeInput
} from './types';
import {
  INITIAL_WIND_PLANT_CONTEXT,
  INITIAL_WIND_RULES,
  INITIAL_BASE_WIND_ASSETS,
  INITIAL_WIND_WORK_ORDERS,
  INITIAL_WIND_HISTORY_EVENTS
} from './mockData';
import {
  calculateWindPlantGenerationMW,
  initializeWindFleetReliability,
  recalculateWindAsset,
  applyWindMaintenanceFeedback,
  generateWindAlertsFromRules,
  generateWindRecommendationsFromAlerts
} from './engine';

interface WindReliabilityContextType {
  // Core state
  assets: WindAsset[];
  plantContext: WindPlantContext;
  rules: ReliabilityRule[];
  alerts: ReliabilityAlert[];
  recommendations: ReliabilityRecommendation[];
  workOrders: WorkOrderRecord[];
  historyEvents: AssetHistoryEvent[];

  // Selection / Modal state
  selectedAsset: WindAsset | null;
  setSelectedAsset: (asset: WindAsset | null) => void;
  selectedAlert: ReliabilityAlert | null;
  setSelectedAlert: (alert: ReliabilityAlert | null) => void;
  selectedWorkOrder: WorkOrderRecord | null;
  setSelectedWorkOrder: (wo: WorkOrderRecord | null) => void;
  completingWorkOrder: WorkOrderRecord | null;
  setCompletingWorkOrder: (wo: WorkOrderRecord | null) => void;

  // Actions
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string, reason: string) => void;
  approveRecommendation: (recId: string) => void;
  createWorkOrderFromRecommendation: (recId: string, assignedEngineer?: string) => string;
  updateWorkOrderStage: (woNumber: string, newStage: WorkOrderRecord['stage']) => void;
  completeMaintenanceOutcome: (outcome: MaintenanceOutcomeInput) => void;
  resetDemoScenario: () => void;
  toggleRule: (ruleId: string) => void;
  updateRuleThreshold: (
    ruleId: string,
    warning: number,
    critical: number,
    warningImpact: number,
    criticalImpact: number
  ) => void;

  // High-Level KPIs for Command Center
  plantOutputMW: number;
  plantHealthScore: number;
  overallRisk: string;
  highRiskAssetsCount: number;
  criticalAlertsCount: number;
  maintenanceDueCount: number;
  powerCurveDeviationPct: number;
  availabilityPct: number;
}

const WindReliabilityContext = createContext<WindReliabilityContextType | null>(null);

export function useWindReliability(): WindReliabilityContextType {
  const context = useContext(WindReliabilityContext);
  if (!context) {
    throw new Error('useWindReliability must be used within a WindReliabilityProvider');
  }
  return context;
}

function createInitialFleetState(rules: ReliabilityRule[], plantContext: WindPlantContext) {
  return initializeWindFleetReliability(
    INITIAL_BASE_WIND_ASSETS,
    rules,
    plantContext
  );
}

export const WindReliabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plantContext] = useState<WindPlantContext>(INITIAL_WIND_PLANT_CONTEXT);
  const [rules, setRules] = useState<ReliabilityRule[]>(INITIAL_WIND_RULES);

  const initialData = useMemo(() => {
    return createInitialFleetState(INITIAL_WIND_RULES, INITIAL_WIND_PLANT_CONTEXT);
  }, []);

  const [assets, setAssets] = useState<WindAsset[]>(initialData.assets);
  const [alerts, setAlerts] = useState<ReliabilityAlert[]>(initialData.alerts);
  const [recommendations, setRecommendations] = useState<ReliabilityRecommendation[]>(initialData.recommendations);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(INITIAL_WIND_WORK_ORDERS);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(INITIAL_WIND_HISTORY_EVENTS);

  // Modals / Drawers
  const [selectedAsset, setSelectedAsset] = useState<WindAsset | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ReliabilityAlert | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderRecord | null>(null);
  const [completingWorkOrder, setCompletingWorkOrder] = useState<WorkOrderRecord | null>(null);

  // Synchronize selection if assets update
  const currentSelectedAsset = useMemo(() => {
    if (!selectedAsset) return null;
    return assets.find(a => a.assetId === selectedAsset.assetId) || selectedAsset;
  }, [assets, selectedAsset]);

  const currentSelectedWorkOrder = useMemo(() => {
    if (!selectedWorkOrder) return null;
    return workOrders.find(w => w.woNumber === selectedWorkOrder.woNumber) || selectedWorkOrder;
  }, [workOrders, selectedWorkOrder]);

  // Action: Acknowledge Alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, status: 'Acknowledged' } : a));
    const targetAlert = alerts.find(a => a.alertId === alertId);
    if (targetAlert) {
      setHistoryEvents(prev => [
        {
          id: `HIST-${Date.now()}`,
          timestamp: 'Just now',
          assetCode: targetAlert.assetCode,
          eventType: 'alert_acknowledged',
          headline: `Alert ${alertId} Acknowledged`,
          details: `Acknowledged: "${targetAlert.alertTitle}" on ${targetAlert.assetCode}.`,
          badge: 'Acknowledged'
        },
        ...prev
      ]);
    }
  }, [alerts]);

  // Action: Dismiss Alert
  const dismissAlert = useCallback((alertId: string, reason: string) => {
    setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, status: 'Dismissed' } : a));
    const targetAlert = alerts.find(a => a.alertId === alertId);
    if (targetAlert) {
      setHistoryEvents(prev => [
        {
          id: `HIST-${Date.now()}`,
          timestamp: 'Just now',
          assetCode: targetAlert.assetCode,
          eventType: 'alert_dismissed',
          headline: `Alert ${alertId} Dismissed`,
          details: `Dismissed by engineer: ${reason}`,
          badge: 'Dismissed'
        },
        ...prev
      ]);
    }
    setSelectedAlert(null);
  }, [alerts]);

  // Action: Approve Recommendation
  const approveRecommendation = useCallback((recId: string) => {
    setRecommendations(prev => prev.map(r => r.recommendationId === recId ? { ...r, status: 'Approved' } : r));
    const targetRec = recommendations.find(r => r.recommendationId === recId);
    if (targetRec) {
      setHistoryEvents(prev => [
        {
          id: `HIST-${Date.now()}`,
          timestamp: 'Just now',
          assetCode: targetRec.assetCode,
          eventType: 'recommendation_approved',
          headline: `Recommendation ${recId} Approved`,
          details: `Approved: "${targetRec.recommendedAction}" with priority ${targetRec.priority}.`,
          badge: 'Approved'
        },
        ...prev
      ]);
    }
  }, [recommendations]);

  // Action: Create Work Order From Recommendation
  const createWorkOrderFromRecommendation = useCallback((recId: string, assignedEngineer = 'Marcus Vance (Drivetrain)') => {
    const rec = recommendations.find(r => r.recommendationId === recId);
    if (!rec) return '';

    const newWoNumber = `WO-${3040 + workOrders.length + 1}`;
    const targetAsset = assets.find(a => a.assetId === rec.assetId);

    const getAssetTelemetrySummary = (asset?: WindAsset) => {
      if (!asset) return '';
      if (asset.assetCode.startsWith('WT-')) {
        return `Vibration: ${asset.telemetry.vibrationMmS} mm/s | Gearbox Temp: ${asset.telemetry.gearboxBearingTempC}°C | Power: ${asset.telemetry.activePowerKw} kW`;
      }
      return `Telemetry registered for ${asset.assetCode}`;
    };

    const targetAlert = alerts.find(a => a.alertId === rec.sourceAlertId);
    const triggeredRule = targetAlert?.triggeredRuleId;
    const ruleName = targetAlert?.alertTitle || 'Reliability Rule Triggered';

    const newWorkOrder: WorkOrderRecord = {
      woNumber: newWoNumber,
      assetId: rec.assetId,
      assetCode: rec.assetCode,
      assetName: targetAsset?.assetName || rec.assetCode,
      issueTitle: `${rec.assetCode}: ${rec.recommendedAction}`,
      riskLevel: targetAsset?.riskLevel || 'High',
      priority: rec.priority,
      dueDate: rec.recommendedTimeline,
      sourceAlertId: rec.sourceAlertId,
      recommendationId: rec.recommendationId,
      ruleId: triggeredRule,
      assignedEngineer,
      stage: 'Diagnosing',
      statusDescription: `Maintenance order created from recommendation ${recId}. Awaiting technical execution.`,
      problemDescription: rec.reason,
      sourceTelemetrySummary: getAssetTelemetrySummary(targetAsset),
      triggeredRuleName: ruleName,
      riskAssessmentSummary: `Asset Risk Score: ${targetAsset?.riskScore || 70}/100 (${targetAsset?.riskLevel || 'High'})`,
      plannedAction: rec.recommendedAction,
      rootCause: targetAsset?.mainIssue || 'Drivetrain thermal/vibration anomaly investigated.',
      requiredParts: ['High-Speed Bearing Assembly #GBX-300', '10-Micron Gearbox Filter Element', 'Synthetic Lube ISO VG 320'],
      beforeReading: {
        vibrationMmS: targetAsset?.telemetry.vibrationMmS,
        gearboxBearingTempC: targetAsset?.telemetry.gearboxBearingTempC,
        generatorStatorTempC: targetAsset?.telemetry.generatorStatorTempC,
        healthScore: targetAsset?.healthScore || 68,
        riskScore: targetAsset?.riskScore || 72
      },
      createdAt: 'Just now'
    };

    setWorkOrders(prev => [newWorkOrder, ...prev]);

    setRecommendations(prev => prev.map(r => r.recommendationId === recId ? { ...r, status: 'Work Order Created' } : r));
    setAlerts(prev => prev.map(a => a.alertId === rec.sourceAlertId ? { ...a, status: 'In Work Order' } : a));

    setHistoryEvents(prev => [
      {
        id: `HIST-${Date.now()}`,
        timestamp: 'Just now',
        assetCode: rec.assetCode,
        eventType: 'work_order_created',
        headline: `Work Order ${newWoNumber} Created`,
        details: `Ticket created for "${rec.recommendedAction}" and assigned to ${assignedEngineer}.`,
        badge: newWoNumber
      },
      ...prev
    ]);

    return newWoNumber;
  }, [recommendations, assets, workOrders, alerts]);

  // Action: Update Work Order Stage
  const updateWorkOrderStage = useCallback((woNumber: string, newStage: WorkOrderRecord['stage']) => {
    setWorkOrders(prev => prev.map(w => w.woNumber === woNumber ? { ...w, stage: newStage } : w));
  }, []);

  // MANDATORY: MAINTENANCE FEEDBACK LOOP
  const completeMaintenanceOutcome = useCallback((outcome: MaintenanceOutcomeInput) => {
    const targetWo = workOrders.find(w => w.woNumber === outcome.woNumber);
    if (!targetWo) return;

    const targetAsset = assets.find(a => a.assetId === targetWo.assetId);
    if (!targetAsset) return;

    // Run engine feedback loop on target asset
    const { updatedAsset, recalculatedRules } = applyWindMaintenanceFeedback(
      targetAsset,
      outcome.postMaintenanceTelemetry,
      rules,
      plantContext
    );

    const previousAssetAlerts = alerts.filter(a => a.assetId === targetAsset.assetId);
    const nextAlerts = generateWindAlertsFromRules(updatedAsset, recalculatedRules, alerts);

    // Update linked recommendation to Completed
    let nextRecs = recommendations;
    if (targetWo.recommendationId) {
      nextRecs = nextRecs.map(r =>
        r.recommendationId === targetWo.recommendationId ? { ...r, status: 'Completed' as const } : r
      );
    }
    nextRecs = generateWindRecommendationsFromAlerts(updatedAsset, nextAlerts, recalculatedRules, nextRecs);

    const openCount = nextAlerts.filter(
      a => a.assetId === updatedAsset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed'
    ).length;

    const finalAsset: WindAsset = {
      ...updatedAsset,
      openAlertCount: openCount
    };

    setAssets(prev => prev.map(a => a.assetId === finalAsset.assetId ? finalAsset : a));
    setAlerts(nextAlerts);
    setRecommendations(nextRecs);

    // Update work order with afterReading and mark Closed
    const completionDate = 'Just now';
    const updatedWo: WorkOrderRecord = {
      ...targetWo,
      stage: 'Closed',
      actualAction: outcome.actualAction,
      partsReplaced: outcome.partsReplaced,
      engineerNotes: outcome.engineerNotes,
      completionDate,
      afterReading: {
        vibrationMmS: finalAsset.telemetry.vibrationMmS,
        gearboxBearingTempC: finalAsset.telemetry.gearboxBearingTempC,
        generatorStatorTempC: finalAsset.telemetry.generatorStatorTempC,
        healthScore: finalAsset.healthScore,
        riskScore: finalAsset.riskScore
      }
    };

    setWorkOrders(prev => prev.map(w => w.woNumber === targetWo.woNumber ? updatedWo : w));

    setHistoryEvents(prev => [
      {
        id: `HIST-${Date.now()}-2`,
        timestamp: 'Just now',
        assetCode: finalAsset.assetCode,
        eventType: 'risk_normalized',
        headline: `${finalAsset.assetCode} Risk Normalized to ${finalAsset.riskLevel} (${finalAsset.riskScore}/100)`,
        details: `Physical condition restored: Vibration ${finalAsset.telemetry.vibrationMmS} mm/s, Bearing Temp ${finalAsset.telemetry.gearboxBearingTempC}°C. Health increased to ${finalAsset.healthScore}/100.`,
        badge: `${finalAsset.healthScore}/100 Health`
      },
      {
        id: `HIST-${Date.now()}-1`,
        timestamp: 'Just now',
        assetCode: finalAsset.assetCode,
        eventType: 'maintenance_completed',
        headline: `Work Order ${targetWo.woNumber} Completed`,
        details: outcome.actualAction,
        badge: 'Closed'
      },
      ...prev
    ]);

    setCompletingWorkOrder(null);
  }, [workOrders, assets, rules, plantContext, alerts, recommendations]);

  // Action: Toggle Rule
  const toggleRule = useCallback((ruleId: string) => {
    setRules(prev => {
      const updatedRules = prev.map(r => r.ruleId === ruleId ? { ...r, enabled: !r.enabled } : r);
      // Recalculate fleet
      setAssets(currentAssets => {
        let currentAlerts = alerts;
        let currentRecs = recommendations;

        const recalculatedFleet = currentAssets.map(asset => {
          const recAsset = recalculateWindAsset(asset, updatedRules, plantContext, currentAlerts);
          const newAlerts = generateWindAlertsFromRules(recAsset, recAsset.triggeredRules, currentAlerts);
          currentAlerts = newAlerts;
          currentRecs = generateWindRecommendationsFromAlerts(recAsset, newAlerts, recAsset.triggeredRules, currentRecs);
          return {
            ...recAsset,
            openAlertCount: newAlerts.filter(a => a.assetId === asset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed').length
          };
        });

        setAlerts(currentAlerts);
        setRecommendations(currentRecs);
        return recalculatedFleet;
      });

      return updatedRules;
    });
  }, [alerts, recommendations, plantContext]);

  // Action: Update Rule Threshold
  const updateRuleThreshold = useCallback((
    ruleId: string,
    warning: number,
    critical: number,
    warningImpact: number,
    criticalImpact: number
  ) => {
    setRules(prev => {
      const updatedRules = prev.map(r =>
        r.ruleId === ruleId
          ? {
              ...r,
              warningThreshold: warning,
              criticalThreshold: critical,
              warningRiskImpact: warningImpact,
              criticalRiskImpact: criticalImpact
            }
          : r
      );

      setAssets(currentAssets => {
        let currentAlerts = alerts;
        let currentRecs = recommendations;

        const recalculatedFleet = currentAssets.map(asset => {
          const recAsset = recalculateWindAsset(asset, updatedRules, plantContext, currentAlerts);
          const newAlerts = generateWindAlertsFromRules(recAsset, recAsset.triggeredRules, currentAlerts);
          currentAlerts = newAlerts;
          currentRecs = generateWindRecommendationsFromAlerts(recAsset, newAlerts, recAsset.triggeredRules, currentRecs);
          return {
            ...recAsset,
            openAlertCount: newAlerts.filter(a => a.assetId === asset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed').length
          };
        });

        setAlerts(currentAlerts);
        setRecommendations(currentRecs);
        return recalculatedFleet;
      });

      return updatedRules;
    });
  }, [alerts, recommendations, plantContext]);

  // Action: Reset Demo Scenario
  const resetDemoScenario = useCallback(() => {
    const fresh = createInitialFleetState(INITIAL_WIND_RULES, INITIAL_WIND_PLANT_CONTEXT);
    setRules(INITIAL_WIND_RULES);
    setAssets(fresh.assets);
    setAlerts(fresh.alerts);
    setRecommendations(fresh.recommendations);
    setWorkOrders(INITIAL_WIND_WORK_ORDERS);
    setHistoryEvents(INITIAL_WIND_HISTORY_EVENTS);
    setSelectedAsset(null);
    setSelectedAlert(null);
    setSelectedWorkOrder(null);
    setCompletingWorkOrder(null);
  }, []);

  // Fleet KPIs
  const plantOutputMW = useMemo(() => calculateWindPlantGenerationMW(assets), [assets]);
  
  const plantHealthScore = useMemo(() => {
    const turbineAssets = assets.filter(a => a.assetCode.startsWith('WT-'));
    if (turbineAssets.length === 0) return 90;
    const avg = turbineAssets.reduce((sum, a) => sum + a.healthScore, 0) / turbineAssets.length;
    return Math.round(avg);
  }, [assets]);

  const highRiskAssetsCount = useMemo(() => {
    return assets.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length;
  }, [assets]);

  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(a => a.riskLevel === 'Critical' && (a.status === 'Active' || a.status === 'Acknowledged')).length;
  }, [alerts]);

  const maintenanceDueCount = useMemo(() => {
    return assets.filter(a => a.isMaintenanceOverdue).length;
  }, [assets]);

  const overallRisk = useMemo(() => {
    if (criticalAlertsCount > 0 || highRiskAssetsCount >= 2) return 'High';
    if (highRiskAssetsCount >= 1) return 'High';
    const moderateCount = assets.filter(a => a.riskLevel === 'Moderate' || a.riskLevel === 'Medium').length;
    if (moderateCount >= 2) return 'Medium';
    return 'Low';
  }, [criticalAlertsCount, highRiskAssetsCount, assets]);

  const powerCurveDeviationPct = useMemo(() => {
    const wt4 = assets.find(a => a.assetCode === 'WT-004');
    const wt5 = assets.find(a => a.assetCode === 'WT-005');
    if (wt4 && wt4.riskLevel === 'High') return 5.8;
    if (wt5 && wt5.riskLevel === 'Moderate') return 2.4;
    return 1.2;
  }, [assets]);

  const availabilityPct = useMemo(() => {
    const isDerated = assets.some(a => a.operationalStatus === 'Derated');
    return isDerated ? 98.4 : 99.6;
  }, [assets]);

  const contextValue: WindReliabilityContextType = {
    assets,
    plantContext,
    rules,
    alerts,
    recommendations,
    workOrders,
    historyEvents,
    selectedAsset: currentSelectedAsset,
    setSelectedAsset,
    selectedAlert,
    setSelectedAlert,
    selectedWorkOrder: currentSelectedWorkOrder,
    setSelectedWorkOrder,
    completingWorkOrder,
    setCompletingWorkOrder,
    acknowledgeAlert,
    dismissAlert,
    approveRecommendation,
    createWorkOrderFromRecommendation,
    updateWorkOrderStage,
    completeMaintenanceOutcome,
    resetDemoScenario,
    toggleRule,
    updateRuleThreshold,
    plantOutputMW,
    plantHealthScore,
    overallRisk,
    highRiskAssetsCount,
    criticalAlertsCount,
    maintenanceDueCount,
    powerCurveDeviationPct,
    availabilityPct
  };

  return (
    <WindReliabilityContext.Provider value={contextValue}>
      {children}
    </WindReliabilityContext.Provider>
  );
};
