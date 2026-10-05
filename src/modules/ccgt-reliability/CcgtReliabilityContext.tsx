import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  PlantContext,
  ReliabilityRule,
  RawAssetTelemetry,
  CcgtAsset,
  ReliabilityAlert,
  ReliabilityRecommendation,
  WorkOrderRecord,
  AssetHistoryEvent,
  MaintenanceOutcomeInput
} from './types';
import {
  INITIAL_PLANT_CONTEXT,
  INITIAL_RULES,
  INITIAL_BASE_ASSETS,
  INITIAL_RAW_TELEMETRY,
  INITIAL_ALERTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_WORK_ORDERS,
  INITIAL_HISTORY_EVENTS
} from './mockData';
import {
  calculatePlantGenerationMW,
  calculateAssetIndicators,
  evaluateConditionModules,
  calculateHealthScore,
  evaluateRules,
  calculateRiskAssessment,
  generateAlertsFromRules,
  generateRecommendationsFromAlerts,
  recalculateAsset,
  applyMaintenanceFeedback,
  calculateDeviationPct,
  initializeFleetReliability
} from './engine';

interface CcgtReliabilityContextType {
  // Core state
  assets: CcgtAsset[];
  plantContext: PlantContext;
  rules: ReliabilityRule[];
  alerts: ReliabilityAlert[];
  recommendations: ReliabilityRecommendation[];
  workOrders: WorkOrderRecord[];
  historyEvents: AssetHistoryEvent[];

  // Selection / Modal state
  selectedAsset: CcgtAsset | null;
  setSelectedAsset: (asset: CcgtAsset | null) => void;
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
  heatRateDeviationPct: number;
  availabilityPct: number;
}

const CcgtReliabilityContext = createContext<CcgtReliabilityContextType | null>(null);

function createInitialFleetState(rules: ReliabilityRule[], plantContext: PlantContext) {
  const baseAssets: CcgtAsset[] = INITIAL_BASE_ASSETS.map((base) => {
    const rawTel = INITIAL_RAW_TELEMETRY[base.assetId] || base.telemetry;
    return {
      ...base,
      telemetry: rawTel,
      healthScore: 100,
      riskScore: 5,
      riskLevel: 'Low',
      priority: 'P5',
      riskTrend: 'Stable',
      mainIssue: 'None',
      conditionModules: [],
      riskContributors: [],
      triggeredRules: [],
      explainabilitySteps: [],
      trend7d: [
        { day: 'D-6', healthScore: 92, riskScore: 8 },
        { day: 'D-5', healthScore: 91, riskScore: 9 },
        { day: 'D-4', healthScore: 90, riskScore: 10 },
        { day: 'D-3', healthScore: 88, riskScore: 12 },
        { day: 'D-2', healthScore: 82, riskScore: 18 },
        { day: 'D-1', healthScore: 74, riskScore: 26 },
        { day: 'Today', healthScore: 68, riskScore: 72, egtSpreadC: rawTel.egtSpreadC, heatRateBtu: rawTel.heatRateBtuKwh }
      ],
      openAlertCount: 0
    };
  });

  // Part A §1: Initialize dynamically from current assets and rules, zero static active alert dependency
  return initializeFleetReliability(
    baseAssets,
    rules,
    plantContext
  );
}

export const CcgtReliabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plantContext] = useState<PlantContext>(INITIAL_PLANT_CONTEXT);
  const [rules, setRules] = useState<ReliabilityRule[]>(INITIAL_RULES);
  
  const initialData = useMemo(() => {
    return createInitialFleetState(INITIAL_RULES, INITIAL_PLANT_CONTEXT);
  }, []);

  const [assets, setAssets] = useState<CcgtAsset[]>(initialData.assets);
  const [alerts, setAlerts] = useState<ReliabilityAlert[]>(initialData.alerts);
  const [recommendations, setRecommendations] = useState<ReliabilityRecommendation[]>(initialData.recommendations);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(INITIAL_WORK_ORDERS);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(INITIAL_HISTORY_EVENTS);

  // Modals / Drawers
  const [selectedAsset, setSelectedAsset] = useState<CcgtAsset | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ReliabilityAlert | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderRecord | null>(null);
  const [completingWorkOrder, setCompletingWorkOrder] = useState<WorkOrderRecord | null>(null);

  // Synchronize selectedAsset if assets update
  const currentSelectedAsset = useMemo(() => {
    if (!selectedAsset) return null;
    return assets.find(a => a.assetId === selectedAsset.assetId) || selectedAsset;
  }, [assets, selectedAsset]);

  // Synchronize selectedWorkOrder if workOrders update
  const currentSelectedWorkOrder = useMemo(() => {
    if (!selectedWorkOrder) return null;
    return workOrders.find(w => w.woNumber === selectedWorkOrder.woNumber) || selectedWorkOrder;
  }, [workOrders, selectedWorkOrder]);

  // Action: Acknowledge Alert (Section 22: Correct eventType)
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
          details: `Control room operator acknowledged alert for ${targetAlert.alertTitle}.`,
          badge: 'Acknowledged'
        },
        ...prev
      ]);
    }
  }, [alerts]);

  // Action: Dismiss Alert (Section 22: Correct eventType)
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

  // Action: Create Work Order From Recommendation (Preserves complete link: WO -> REC -> ALERT -> RULE)
  const createWorkOrderFromRecommendation = useCallback((recId: string, assignedEngineer = 'Bob Smith') => {
    const rec = recommendations.find(r => r.recommendationId === recId);
    if (!rec) return '';

    const newWoNumber = `WO-${2040 + workOrders.length + 1}`;
    const targetAsset = assets.find(a => a.assetId === rec.assetId);

    const getAssetTelemetrySummary = (asset?: CcgtAsset) => {
      if (!asset) return '';
      if (asset.assetCode.startsWith('GT')) {
        return `EGT Spread: ${asset.telemetry.egtSpreadC}°C | Heat Rate: ${asset.telemetry.heatRateBtuKwh} BTU/kWh | Vibration: ${asset.telemetry.vibrationMmS} mm/s`;
      }
      if (asset.assetCode.startsWith('ST')) {
        return `Bearing Temp: ${asset.telemetry.bearingTempC}°C | Vibration: ${asset.telemetry.vibrationMmS} mm/s | Lube Oil Temp: ${asset.telemetry.lubeOilTempC || 59}°C`;
      }
      if (asset.assetCode === 'BFP-A') {
        return `Casing Vibration: ${asset.telemetry.vibrationMmS} mm/s | Discharge Pressure: ${asset.telemetry.dischargePressureBar || 165} bar | Bearing Temp: ${asset.telemetry.bearingTempC}°C`;
      }
      if (asset.assetCode === 'GSU') {
        return `Transformer Oil Temp: ${asset.telemetry.oilTempC}°C | Winding Temp: ${asset.telemetry.windingTempC}°C | Load: ${asset.telemetry.transmittedMW || 462} MW`;
      }
      return `Telemetry registered for ${asset.assetCode}`;
    };

    const getAssetParts = (assetCode: string) => {
      if (assetCode.startsWith('GT')) return ['Diagnostic Seal Kit', 'Thermocouple Replacement Lead', 'High-Temp Gasket Pack'];
      if (assetCode.startsWith('ST')) return ['Bearing Tilt Pads', 'Labyrinth Oil Seal Ring', 'Synthetic Lube Oil ISO VG 32'];
      if (assetCode === 'BFP-A') return ['Flexible Coupling Elements', 'Radial Sleeve Bearing', 'Mechanical Seal Kit'];
      if (assetCode === 'GSU') return ['Radiator Fan Motor 1.5kW', 'Thermal Overload Relay', 'Insulating Oil Test Kit'];
      return ['OEM Replacement Spares', 'Standard Seal Kit'];
    };

    const newWorkOrder: WorkOrderRecord = {
      woNumber: newWoNumber,
      assetId: rec.assetId,
      assetCode: rec.assetCode,
      assetName: targetAsset ? targetAsset.assetName : rec.assetCode,
      issueTitle: rec.recommendedAction,
      riskLevel: targetAsset ? targetAsset.riskLevel : 'High',
      priority: rec.priority,
      dueDate: '04 Oct',
      sourceAlertId: rec.sourceAlertId,
      recommendationId: rec.recommendationId,
      ruleId: rec.sourceRuleId,
      assignedEngineer,
      stage: 'Diagnosing',
      statusDescription: `Assigned to ${assignedEngineer}; Work order generated from reliability recommendation.`,
      problemDescription: rec.reason,
      sourceTelemetrySummary: getAssetTelemetrySummary(targetAsset),
      triggeredRuleName: rec.sourceRuleId,
      riskAssessmentSummary: `Risk Level: ${targetAsset?.riskLevel || 'High'} (Score: ${targetAsset?.riskScore || 72}/100)`,
      plannedAction: `Execute corrective maintenance in accordance with ${rec.recommendedAction}. Check mechanical seals and calibration.`,
      rootCause: rec.reason,
      requiredParts: getAssetParts(rec.assetCode),
      engineerNotes: `Dispatched from CCGT Reliability Center based on ${rec.sourceRuleId}.`,
      beforeReading: {
        egtSpreadC: targetAsset?.telemetry.egtSpreadC,
        heatRateDevPct: targetAsset ? calculateDeviationPct(targetAsset.telemetry.heatRateBtuKwh, targetAsset.telemetry.baselineHeatRateBtuKwh) : 5.4,
        bearingTempC: targetAsset?.telemetry.bearingTempC,
        vibrationMmS: targetAsset?.telemetry.vibrationMmS,
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
  }, [recommendations, assets, workOrders]);

  // Action: Update Work Order Stage in Kanban
  const updateWorkOrderStage = useCallback((woNumber: string, newStage: WorkOrderRecord['stage']) => {
    setWorkOrders(prev => prev.map(w => w.woNumber === woNumber ? { ...w, stage: newStage } : w));
  }, []);

  // MANDATORY: MAINTENANCE FEEDBACK LOOP (Section 12, 17, 18, 21, 22)
  // Work Completed -> Record Outcome -> Update History -> Update Relevant Telemetry -> Recalculate Indicators -> Recalculate Risk -> Update Health -> Update Dashboard
  // Crucial: Only resolve alerts whose rule conditions are no longer met! Unrelated alerts remain open.
  const completeMaintenanceOutcome = useCallback((outcome: MaintenanceOutcomeInput) => {
    const targetWo = workOrders.find(w => w.woNumber === outcome.woNumber);
    if (!targetWo) return;

    const targetAsset = assets.find(a => a.assetId === targetWo.assetId);
    if (!targetAsset) return;

    // Run engine feedback loop on target asset with provided telemetry
    const { updatedAsset, recalculatedRules } = applyMaintenanceFeedback(
      targetAsset,
      outcome.postMaintenanceTelemetry,
      rules,
      plantContext
    );

    // Part A §2: Run standard pipeline to regenerate alerts across rules
    // generateAlertsFromRules resolves cleared alerts, keeps existing active ones, and adds newly triggered ones
    const previousAssetAlerts = alerts.filter(a => a.assetId === targetAsset.assetId);
    const nextAlerts = generateAlertsFromRules(updatedAsset, recalculatedRules, alerts);
    
    // Identify newly resolved alert IDs for history logging
    const activeRuleIdsForAsset = new Set(recalculatedRules.map(r => r.rule.ruleId));
    const resolvedAlertIds = previousAssetAlerts
      .filter(a => a.status !== 'Resolved' && a.status !== 'Dismissed' && !activeRuleIdsForAsset.has(a.triggeredRuleId))
      .map(a => a.alertId);

    // Update linked recommendation to Completed (Section 21)
    let nextRecs = recommendations;
    if (targetWo.recommendationId) {
      nextRecs = nextRecs.map(r =>
        r.recommendationId === targetWo.recommendationId ? { ...r, status: 'Completed' as const } : r
      );
    }
    // Regenerate recommendations from alerts and rules (Section 4)
    nextRecs = generateRecommendationsFromAlerts(updatedAsset, nextAlerts, recalculatedRules, nextRecs);

    // Calculate real open alert count (Section 13)
    const openCount = nextAlerts.filter(
      a => a.assetId === updatedAsset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed'
    ).length;

    const finalAsset: CcgtAsset = {
      ...updatedAsset,
      openAlertCount: openCount
    };

    setAssets(prev => prev.map(a => a.assetId === finalAsset.assetId ? finalAsset : a));
    setAlerts(nextAlerts);
    setRecommendations(nextRecs);

    // Update work order with afterReading and mark Closed
    const completionDate = '03 Oct 15:00';
    const updatedWo: WorkOrderRecord = {
      ...targetWo,
      stage: 'Closed',
      actualAction: outcome.actualAction,
      partsReplaced: outcome.partsReplaced,
      engineerNotes: outcome.engineerNotes,
      rootCause: outcome.rootCauseFindings,
      completionDate,
      afterReading: {
        egtSpreadC: finalAsset.telemetry.egtSpreadC,
        heatRateDevPct: calculateDeviationPct(finalAsset.telemetry.heatRateBtuKwh, finalAsset.telemetry.baselineHeatRateBtuKwh),
        bearingTempC: finalAsset.telemetry.bearingTempC,
        vibrationMmS: finalAsset.telemetry.vibrationMmS,
        healthScore: finalAsset.healthScore,
        riskScore: finalAsset.riskScore
      }
    };

    setWorkOrders(prev => prev.map(w => w.woNumber === outcome.woNumber ? updatedWo : w));

    // Append chronological feedback sequence to History (Section 22)
    const newHistory: AssetHistoryEvent[] = [
      {
        id: `HIST-${Date.now()}-5`,
        timestamp: '03 Oct 15:06',
        assetCode: targetAsset.assetCode,
        eventType: 'risk_score_changed',
        headline: `Risk Score changed ${targetWo.beforeReading.riskScore} → ${finalAsset.riskScore}`,
        details: `Asset risk reduced from ${targetWo.riskLevel} to ${finalAsset.riskLevel} following verified field intervention.`,
        beforeVal: `${targetWo.beforeReading.riskScore} (${targetWo.riskLevel})`,
        afterVal: `${finalAsset.riskScore} (${finalAsset.riskLevel})`,
        badge: 'Risk Reduced'
      },
      {
        id: `HIST-${Date.now()}-4`,
        timestamp: '03 Oct 15:06',
        assetCode: targetAsset.assetCode,
        eventType: 'health_changed',
        headline: `Health Score changed ${targetWo.beforeReading.healthScore} → ${finalAsset.healthScore}`,
        details: `Thermal and mechanical condition recovered. Health improved from ${targetWo.beforeReading.healthScore}/100 to ${finalAsset.healthScore}/100.`,
        beforeVal: `${targetWo.beforeReading.healthScore}/100`,
        afterVal: `${finalAsset.healthScore}/100`,
        badge: 'Health Restored'
      },
      {
        id: `HIST-${Date.now()}-3`,
        timestamp: '03 Oct 15:05',
        assetCode: targetAsset.assetCode,
        eventType: 'telemetry_updated',
        headline: `Telemetry normalized for ${targetAsset.assetCode}`,
        details: `Post-maintenance verification confirmed: Physical parameters returned to normal baseline limits.`,
        badge: 'Normalized'
      },
      {
        id: `HIST-${Date.now()}-2`,
        timestamp: '03 Oct 14:05',
        assetCode: targetAsset.assetCode,
        eventType: 'maintenance_performed',
        headline: `${outcome.actualAction || 'Field maintenance intervention performed'}`,
        details: `Replaced parts: ${outcome.partsReplaced.join(', ')}. Tech: ${targetWo.assignedEngineer}.`,
        badge: 'Field Action'
      },
      {
        id: `HIST-${Date.now()}-1`,
        timestamp: '03 Oct 14:00',
        assetCode: targetAsset.assetCode,
        eventType: 'work_order_completed',
        headline: `Work Order ${outcome.woNumber} Completed`,
        details: `Findings: "${outcome.rootCauseFindings}"`,
        badge: outcome.woNumber
      }
    ];

    if (targetWo.recommendationId) {
      newHistory.unshift({
        id: `HIST-${Date.now()}-rec`,
        timestamp: '03 Oct 15:06',
        assetCode: targetAsset.assetCode,
        eventType: 'recommendation_completed',
        headline: `Recommendation ${targetWo.recommendationId} Completed`,
        details: `Maintenance action closed linked recommendation.`,
        badge: 'Completed'
      });
    }

    for (const resAlertId of resolvedAlertIds) {
      newHistory.unshift({
        id: `HIST-${Date.now()}-${resAlertId}`,
        timestamp: '03 Oct 15:06',
        assetCode: targetAsset.assetCode,
        eventType: 'alert_resolved',
        headline: `Alert ${resAlertId} Resolved`,
        details: `Triggering rule condition cleared following maintenance intervention.`,
        badge: 'Resolved'
      });
    }

    setHistoryEvents(prev => [...newHistory, ...prev]);
    setCompletingWorkOrder(null);
  }, [workOrders, assets, rules, plantContext, alerts, recommendations]);

  // Action: Reset Demo Scenario (Section 3: dynamically generated from engine)
  const resetDemoScenario = useCallback(() => {
    const freshData = createInitialFleetState(rules, plantContext);
    setAssets(freshData.assets);
    setAlerts(freshData.alerts);
    setRecommendations(freshData.recommendations);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setHistoryEvents(INITIAL_HISTORY_EVENTS);
    setSelectedAsset(null);
    setSelectedAlert(null);
    setSelectedWorkOrder(null);
    setCompletingWorkOrder(null);
  }, [rules, plantContext]);

  // Centralized Rule Change Handler (Section 4, 5, 12, 13)
  const applyRuleChange = useCallback((nextRules: ReliabilityRule[]) => {
    setRules(nextRules);
    setAssets(currentAssets => {
      // 1. Recalculate assets first to get updated triggeredRules
      const recalculatedAssets = currentAssets.map(a => recalculateAsset(a, nextRules, plantContext));

      // 2. Generate updated alerts across all assets
      setAlerts(currentAlerts => {
        let updatedAlerts = [...currentAlerts];
        for (const asset of recalculatedAssets) {
          updatedAlerts = generateAlertsFromRules(asset, asset.triggeredRules, updatedAlerts);
        }

        // 3. Generate updated recommendations
        setRecommendations(currentRecs => {
          let updatedRecs = [...currentRecs];
          for (const asset of recalculatedAssets) {
            updatedRecs = generateRecommendationsFromAlerts(asset, updatedAlerts, asset.triggeredRules, updatedRecs);
          }
          return updatedRecs;
        });

        // 4. Final pass: synchronize openAlertCount on each asset
        setAssets(assetsToSync => assetsToSync.map(a => ({
          ...a,
          openAlertCount: updatedAlerts.filter(
            alert => alert.assetId === a.assetId && alert.status !== 'Resolved' && alert.status !== 'Dismissed'
          ).length
        })));

        return updatedAlerts;
      });

      return recalculatedAssets;
    });
  }, [plantContext]);

  // Action: Toggle Rule (Section 9 & 10: Recalculates against CURRENT state without resetting telemetry!)
  const toggleRule = useCallback((ruleId: string) => {
    setRules(prevRules => {
      const nextRules = prevRules.map(r => r.ruleId === ruleId ? { ...r, enabled: !r.enabled } : r);
      applyRuleChange(nextRules);
      return nextRules;
    });
  }, [applyRuleChange]);

  // Action: Update Rule Threshold (Section 9 & 10: Recalculates against CURRENT state without resetting telemetry!)
  const updateRuleThreshold = useCallback((
    ruleId: string,
    warning: number,
    critical: number,
    warningImpact: number,
    criticalImpact: number
  ) => {
    setRules(prevRules => {
      const nextRules = prevRules.map(r => r.ruleId === ruleId ? {
        ...r,
        warningThreshold: warning,
        criticalThreshold: critical,
        warningRiskImpact: warningImpact,
        criticalRiskImpact: criticalImpact
      } : r);
      applyRuleChange(nextRules);
      return nextRules;
    });
  }, [applyRuleChange]);

  // High-level Plant KPIs (Derived directly from current assets & engine)
  const plantOutputMW = useMemo(() => {
    return calculatePlantGenerationMW(assets);
  }, [assets]);

  // Section 15: Criticality-Weighted Plant Health
  const plantHealthScore = useMemo(() => {
    if (assets.length === 0) return 82;
    const totalCriticality = assets.reduce((sum, a) => sum + (a.criticality || 1), 0);
    if (totalCriticality === 0) return 82;
    const weightedSum = assets.reduce((sum, a) => sum + a.healthScore * (a.criticality || 1), 0);
    return Math.round(weightedSum / totalCriticality);
  }, [assets]);

  const highRiskAssetsCount = useMemo(() => {
    return assets.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length;
  }, [assets]);

  // Section 17: Critical Alerts counts actual critical severity alerts
  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(
      a => (a.status === 'Active' || a.status === 'Acknowledged' || a.status === 'In Work Order') && a.riskLevel === 'Critical'
    ).length;
  }, [alerts]);

  // Section 16: Plant Risk with transparent hierarchy
  const overallRisk = useMemo(() => {
    if (assets.some(a => a.riskLevel === 'Critical')) return 'Critical';
    if (assets.some(a => (a.criticality ?? 3) >= 5 && a.riskLevel === 'High')) return 'High';
    if (assets.some(a => a.riskLevel === 'High')) return 'Medium';
    if (assets.some(a => a.riskLevel === 'Medium' || a.riskLevel === 'Moderate')) return 'Moderate';
    return 'Low';
  }, [assets]);

  const maintenanceDueCount = useMemo(() => {
    return assets.filter(a => a.isMaintenanceOverdue || a.hoursSinceMaintenance > 3500).length;
  }, [assets]);

  const heatRateDeviationPct = useMemo(() => {
    const gtAssets = assets.filter(a => a.assetCode.startsWith('GT'));
    if (gtAssets.length === 0) return 2.8;
    const totalDev = gtAssets.reduce((sum, a) => {
      const dev = a.telemetry.baselineHeatRateBtuKwh > 0
        ? calculateDeviationPct(a.telemetry.heatRateBtuKwh, a.telemetry.baselineHeatRateBtuKwh)
        : 0;
      return sum + dev;
    }, 0);
    return Number((totalDev / gtAssets.length).toFixed(1));
  }, [assets]);

  return (
    <CcgtReliabilityContext.Provider
      value={{
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
        heatRateDeviationPct,
        availabilityPct: 96.4
      }}
    >
      {children}
    </CcgtReliabilityContext.Provider>
  );
};

export const useCcgtReliability = (): CcgtReliabilityContextType => {
  const context = useContext(CcgtReliabilityContext);
  if (!context) {
    throw new Error('useCcgtReliability must be used within a CcgtReliabilityProvider');
  }
  return context;
};
