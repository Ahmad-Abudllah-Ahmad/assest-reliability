import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  SolarAsset,
  SolarPlantContext,
  ReliabilityRule,
  ReliabilityAlert,
  PrescriptiveRecommendation,
  WorkOrderRecord,
  AssetHistoryEvent,
  MaintenanceOutcomeInput,
  AssetRiskLevel
} from './types';
import {
  INITIAL_SOLAR_PLANT_CONTEXT,
  INITIAL_SOLAR_RULES,
  INITIAL_SOLAR_WORK_ORDERS,
  INITIAL_SOLAR_HISTORY_EVENTS,
  initializeSolarFleetReliability
} from './mockData';
import {
  recalculateSolarAsset,
  generateSolarAlertsFromRules,
  generateSolarRecommendationsFromAlerts,
  applySolarMaintenanceFeedback
} from './engine';

interface SolarReliabilityContextType {
  assets: SolarAsset[];
  alerts: ReliabilityAlert[];
  recommendations: PrescriptiveRecommendation[];
  workOrders: WorkOrderRecord[];
  historyEvents: AssetHistoryEvent[];
  rules: ReliabilityRule[];
  plantContext: SolarPlantContext;

  // Key Aggregated Metrics
  plantOutputMW: number;
  plantHealthScore: number;
  overallRisk: AssetRiskLevel;
  highRiskAssetsCount: number;
  criticalAlertsCount: number;
  maintenanceDueCount: number;
  performanceRatioPct: number;
  availabilityPct: number;

  // Selected State for Modals & Drawers
  selectedAsset: SolarAsset | null;
  setSelectedAsset: (asset: SolarAsset | null) => void;
  selectedAlert: ReliabilityAlert | null;
  setSelectedAlert: (alert: ReliabilityAlert | null) => void;
  selectedWorkOrder: WorkOrderRecord | null;
  setSelectedWorkOrder: (wo: WorkOrderRecord | null) => void;
  completingWorkOrder: WorkOrderRecord | null;
  setCompletingWorkOrder: (wo: WorkOrderRecord | null) => void;

  // Workflow Actions
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  approveRecommendation: (recId: string) => void;
  createWorkOrderFromRecommendation: (recId: string) => void;
  updateWorkOrderStage: (woNumber: string, newStage: WorkOrderRecord['stage']) => void;
  completeMaintenanceOutcome: (outcome: MaintenanceOutcomeInput) => void;

  // Rule Configuration Engine
  toggleRule: (ruleId: string) => void;
  updateRuleThreshold: (
    ruleId: string,
    warning: number,
    critical: number,
    warnImpact: number,
    critImpact: number
  ) => void;

  // Reset to Approved Demo State
  resetDemoScenario: () => void;
}

const SolarReliabilityContext = createContext<SolarReliabilityContextType | undefined>(undefined);

export const SolarReliabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plantContext, setPlantContext] = useState<SolarPlantContext>(INITIAL_SOLAR_PLANT_CONTEXT);
  const [rules, setRules] = useState<ReliabilityRule[]>(INITIAL_SOLAR_RULES);

  const initialReliability = useMemo(() => initializeSolarFleetReliability(), []);
  const [assets, setAssets] = useState<SolarAsset[]>(initialReliability.assets);
  const [alerts, setAlerts] = useState<ReliabilityAlert[]>(initialReliability.alerts);
  const [recommendations, setRecommendations] = useState<PrescriptiveRecommendation[]>(initialReliability.recommendations);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(INITIAL_SOLAR_WORK_ORDERS);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(INITIAL_SOLAR_HISTORY_EVENTS);

  // Modal Selection State
  const [selectedAsset, setSelectedAsset] = useState<SolarAsset | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ReliabilityAlert | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderRecord | null>(null);
  const [completingWorkOrder, setCompletingWorkOrder] = useState<WorkOrderRecord | null>(null);

  // Sync selectedAsset when assets change
  const currentSelectedAsset = useMemo(() => {
    if (!selectedAsset) return null;
    return assets.find((a) => a.assetCode === selectedAsset.assetCode) || selectedAsset;
  }, [selectedAsset, assets]);

  // Executive Top-Line KPIs
  const plantOutputMW = useMemo(() => {
    // Total plant export at 132kV is approx 124.6 MW (or sum of inverters minus auxiliary/BESS charge)
    const invTotal = assets
      .filter(a => a.assetType === 'Inverter PCS')
      .reduce((sum, a) => sum + (a.telemetry.activePowerOutputMW || 0), 0);
    return Number(invTotal.toFixed(1));
  }, [assets]);

  const plantHealthScore = useMemo(() => {
    if (assets.length === 0) return 95;
    const sum = assets.reduce((acc, a) => acc + a.healthScore, 0);
    return Math.round(sum / assets.length);
  }, [assets]);

  const overallRisk = useMemo<AssetRiskLevel>(() => {
    const hasCritical = assets.some((a) => a.riskLevel === 'Critical');
    if (hasCritical) return 'Critical';
    const hasHigh = assets.some((a) => a.riskLevel === 'High');
    if (hasHigh) return 'High';
    const hasMedium = assets.some((a) => a.riskLevel === 'Medium');
    if (hasMedium) return 'Medium';
    const hasModerate = assets.some((a) => a.riskLevel === 'Moderate');
    if (hasModerate) return 'Moderate';
    return 'Low';
  }, [assets]);

  const highRiskAssetsCount = useMemo(() => {
    return assets.filter((a) => a.riskLevel === 'High' || a.riskLevel === 'Critical').length;
  }, [assets]);

  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(
      (a) =>
        (a.status === 'Active' || a.status === 'Acknowledged' || a.status === 'In Work Order') &&
        (a.priority === 'P1' || a.riskLevel === 'Critical')
    ).length;
  }, [alerts]);

  const maintenanceDueCount = useMemo(() => {
    return assets.filter((a) => a.isMaintenanceOverdue || a.hoursSinceMaintenance > 4000).length;
  }, [assets]);

  const performanceRatioPct = useMemo(() => {
    // Performance Ratio = Actual Generation vs Theoretical POA Yield (approx 83.5%)
    const pvArrays = assets.filter(a => a.assetType === 'PV Array');
    if (pvArrays.length === 0) return 83.5;
    const avgScore = pvArrays.reduce((sum, a) => sum + a.conditionModules.performance.score, 0) / pvArrays.length;
    return Number(((avgScore / 100) * 85.0).toFixed(1));
  }, [assets]);

  const availabilityPct = useMemo(() => {
    const offlineCount = assets.filter((a) => a.operationalStatus === 'critical' || a.operationalStatus === 'maintenance').length;
    return Number((((assets.length - offlineCount) / assets.length) * 100).toFixed(1));
  }, [assets]);

  // Re-evaluates entire fleet whenever rules or context change
  const recomputeFleet = useCallback((currentAssets: SolarAsset[], currentRules: ReliabilityRule[], currentContext: SolarPlantContext) => {
    const updatedAssets = currentAssets.map((asset) =>
      recalculateSolarAsset(asset, currentRules, currentContext)
    );

    let generatedAlerts: ReliabilityAlert[] = [];
    updatedAssets.forEach((asset) => {
      if (asset.triggeredRules.length > 0) {
        generatedAlerts = [...generatedAlerts, ...generateSolarAlertsFromRules(asset, asset.triggeredRules)];
      }
    });

    const generatedRecs = generateSolarRecommendationsFromAlerts(generatedAlerts);

    setAssets(updatedAssets);
    setAlerts(generatedAlerts);
    setRecommendations(generatedRecs);
  }, []);

  // Alert Workflow
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alertId === alertId ? { ...a, status: 'Acknowledged', acknowledgedAt: 'Just now' } : a))
    );
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alertId === alertId ? { ...a, status: 'Dismissed' } : a))
    );
  }, []);

  // Recommendation Workflow
  const approveRecommendation = useCallback((recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.recommendationId === recId ? { ...r, status: 'Approved' } : r))
    );
  }, []);

  const createWorkOrderFromRecommendation = useCallback((recId: string) => {
    const rec = recommendations.find((r) => r.recommendationId === recId);
    if (!rec) return;

    const woNumber = `WO-SOL-${Date.now().toString().slice(-4)}`;
    const newWo: WorkOrderRecord = {
      woNumber,
      assetId: rec.assetId,
      assetCode: rec.assetCode,
      assetName: rec.assetName,
      issueTitle: `${rec.assetCode} ${rec.actionType}: ${rec.recommendationText}`,
      riskLevel: 'High',
      priority: rec.priority,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      sourceAlertId: rec.sourceAlertId,
      recommendationId: rec.recommendationId,
      assignedEngineer: 'Marcus Vance (Field Team Lead)',
      stage: 'Planned Maintenance',
      statusDescription: 'Approved and dispatched from prescriptive reliability recommendation.',
      problemDescription: rec.recommendationText,
      sourceTelemetrySummary: `Origin recommendation: ${rec.actionType}`,
      triggeredRuleName: 'Prescriptive Condition Trigger',
      riskAssessmentSummary: `Estimated risk reduction: ${rec.riskReductionEstimate} points`,
      plannedAction: rec.recommendationText,
      rootCause: 'Under investigation in field.',
      requiredParts: rec.requiredParts,
      beforeReading: {
        healthScore: 70,
        riskScore: 65
      },
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setWorkOrders((prev) => [newWo, ...prev]);
    setRecommendations((prev) =>
      prev.map((r) => (r.recommendationId === recId ? { ...r, status: 'Work Order Created' } : r))
    );
    setAlerts((prev) =>
      prev.map((a) => (a.alertId === rec.sourceAlertId ? { ...a, status: 'In Work Order' } : a))
    );
  }, [recommendations]);

  const updateWorkOrderStage = useCallback((woNumber: string, newStage: WorkOrderRecord['stage']) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.woNumber === woNumber ? { ...w, stage: newStage } : w))
    );
  }, []);

  // Complete Maintenance Outcome Feedback Loop
  const completeMaintenanceOutcome = useCallback((outcome: MaintenanceOutcomeInput) => {
    const targetWo = workOrders.find((w) => w.woNumber === outcome.woNumber);
    if (!targetWo) return;

    const targetAsset = assets.find((a) => a.assetCode === targetWo.assetCode);
    if (!targetAsset) return;

    // Apply deterministic feedback loop
    const { updatedAsset, historyEvents: newEvents } = applySolarMaintenanceFeedback(
      targetAsset,
      outcome,
      rules,
      plantContext
    );

    // Update fleet assets with recalculation
    const updatedFleet = assets.map((a) => (a.assetCode === updatedAsset.assetCode ? updatedAsset : a));
    recomputeFleet(updatedFleet, rules, plantContext);

    // Update Work Order to Closed with verified after-readings
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.woNumber === outcome.woNumber
          ? {
              ...w,
              stage: 'Closed',
              actualAction: outcome.actualAction,
              rootCause: outcome.rootCauseFindings,
              partsReplaced: outcome.partsReplaced,
              engineerNotes: outcome.engineerNotes,
              completionDate: new Date().toISOString().split('T')[0],
              afterReading: {
                healthScore: updatedAsset.healthScore,
                riskScore: updatedAsset.riskScore,
                igbtTempC: updatedAsset.telemetry.igbtTempC,
                inverterEfficiencyPct: updatedAsset.telemetry.inverterEfficiencyPct,
                actualPowerMw: updatedAsset.telemetry.activePowerOutputMW
              }
            }
          : w
      )
    );

    // Append history events
    setHistoryEvents((prev) => [...newEvents, ...prev]);
  }, [workOrders, assets, rules, plantContext, recomputeFleet]);

  // Rule Editing & Toggling
  const toggleRule = useCallback((ruleId: string) => {
    const updatedRules = rules.map((r) => (r.ruleId === ruleId ? { ...r, isEnabled: !r.isEnabled } : r));
    setRules(updatedRules);
    recomputeFleet(assets, updatedRules, plantContext);
  }, [rules, assets, plantContext, recomputeFleet]);

  const updateRuleThreshold = useCallback((
    ruleId: string,
    warning: number,
    critical: number,
    warnImpact: number,
    critImpact: number
  ) => {
    const updatedRules = rules.map((r) =>
      r.ruleId === ruleId
        ? {
            ...r,
            warningThreshold: warning,
            criticalThreshold: critical,
            warningRiskImpact: warnImpact,
            criticalRiskImpact: critImpact
          }
        : r
    );
    setRules(updatedRules);
    recomputeFleet(assets, updatedRules, plantContext);
  }, [rules, assets, plantContext, recomputeFleet]);

  // Reset Scenario
  const resetDemoScenario = useCallback(() => {
    const fresh = initializeSolarFleetReliability();
    setRules(INITIAL_SOLAR_RULES);
    setPlantContext(INITIAL_SOLAR_PLANT_CONTEXT);
    setAssets(fresh.assets);
    setAlerts(fresh.alerts);
    setRecommendations(fresh.recommendations);
    setWorkOrders(INITIAL_SOLAR_WORK_ORDERS);
    setHistoryEvents(INITIAL_SOLAR_HISTORY_EVENTS);
    setSelectedAsset(null);
    setSelectedAlert(null);
    setSelectedWorkOrder(null);
    setCompletingWorkOrder(null);
  }, []);

  return (
    <SolarReliabilityContext.Provider
      value={{
        assets,
        alerts,
        recommendations,
        workOrders,
        historyEvents,
        rules,
        plantContext,
        plantOutputMW,
        plantHealthScore,
        overallRisk,
        highRiskAssetsCount,
        criticalAlertsCount,
        maintenanceDueCount,
        performanceRatioPct,
        availabilityPct,
        selectedAsset: currentSelectedAsset,
        setSelectedAsset,
        selectedAlert,
        setSelectedAlert,
        selectedWorkOrder,
        setSelectedWorkOrder,
        completingWorkOrder,
        setCompletingWorkOrder,
        acknowledgeAlert,
        dismissAlert,
        approveRecommendation,
        createWorkOrderFromRecommendation,
        updateWorkOrderStage,
        completeMaintenanceOutcome,
        toggleRule,
        updateRuleThreshold,
        resetDemoScenario
      }}
    >
      {children}
    </SolarReliabilityContext.Provider>
  );
};

export const useSolarReliability = (): SolarReliabilityContextType => {
  const context = useContext(SolarReliabilityContext);
  if (!context) {
    throw new Error('useSolarReliability must be used within a SolarReliabilityProvider');
  }
  return context;
};
