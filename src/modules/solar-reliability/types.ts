// Types for Solar Power Generation Asset Reliability Platform

export type AssetRiskLevel = 'Low' | 'Moderate' | 'Medium' | 'High' | 'Critical';
export type AssetPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type AssetTrend = 'improving' | 'stable' | 'deteriorating';
export type OperationalStatus = 'running' | 'warning' | 'critical' | 'maintenance' | 'standby';

export type SolarConditionModuleName = 
  | 'dc_electrical'
  | 'conversion_ac'
  | 'thermal'
  | 'performance'
  | 'environment'
  | 'history';

export interface SolarPlantContext {
  globalHorizontalIrradianceGhi: number; // W/m² (e.g. 876)
  planeOfArrayIrradiancePoa: number; // W/m² (e.g. 912)
  ambientTemperatureC: number; // °C (e.g. 29.8)
  moduleAverageTempC: number; // °C (e.g. 34.3)
  windSpeedMps: number; // m/s (e.g. 3.4)
  relativeHumidityPct: number; // % (e.g. 42.1)
  stowAlert: boolean;
  totalPlantCapacityMW: number; // 130 MW
  ratedDcCapacityMWp: number; // 150 MWp
}

export interface RawSolarTelemetry {
  // Common electrical / output
  activePowerOutputMW: number;
  reactivePowerMvar?: number;
  voltageV: number; // DC or AC
  currentA: number;

  // PV Array & Tracker specific
  poaIrradianceWpM2?: number;
  moduleTempC?: number;
  trackerTiltAngleDeg?: number;
  expectedTiltAngleDeg?: number;
  stringCurrentA?: number;
  stringVoltageV?: number;
  stringHealthIndexPct?: number;

  // Combiner Box specific
  dcBusVoltageV?: number;
  dcTotalCurrentKa?: number;
  cabinetTempC?: number;
  spdStatusOk?: boolean;

  // Inverter PCS specific
  dcInputPowerMW?: number;
  acOutputPowerMW?: number;
  inverterEfficiencyPct?: number;
  igbtTempC?: number;
  internalCabinetTempC?: number;
  powerFactor?: number;
  thdPercent?: number;
  coolingStatusOk?: boolean;

  // Step-up Transformer specific
  transformerLoadingPct?: number;
  topOilTempC?: number;
  windingTempC?: number;
  primaryVoltageV?: number;
  secondaryVoltageKv?: number;

  // BESS specific
  bessSocPct?: number;
  bessPowerFlowMW?: number; // positive = charging, negative = discharging
  bessCellMaxTempC?: number;
  bessSohPct?: number;
  bessHvacChillerOk?: boolean;
}

export interface SolarAsset {
  assetId: string;
  assetName: string;
  assetCode: string; // PV-ROW-1A..3B, COMB-01..06, INV-01..03, TR-01..03, BESS-01, SWG-33KV, MAIN-TR-130MVA, GRID-132KV, MET-01
  assetType: 'PV Array' | 'Combiner Box' | 'Inverter PCS' | 'Step-Up Transformer' | 'BESS' | 'MV Switchgear' | 'Main Substation TR' | 'Grid Intertie' | 'Meteo Mast';
  ratedCapacity: string;
  ratedMW: number;
  operationalStatus: OperationalStatus;

  criticality: number; // 1-5
  installationDate: string;
  assetAgeYears: number;
  expectedLifetimeYears: number;

  runningHours: number;
  startsCount: number;

  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  hoursSinceMaintenance: number;
  isMaintenanceOverdue: boolean;

  previousFaultCount: number;
  repeatedIssueCount: number;
  historicalRepeatedIssueCount?: number;
  activeRecurrenceCount?: number;
  openAlertCount: number;

  // Reliability Results
  healthScore: number; // 0-100
  riskScore: number; // 0-100
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  riskTrend: AssetTrend;
  mainIssue: string;

  // Telemetry stream
  telemetry: RawSolarTelemetry;

  // 6 Condition Modules
  conditionModules: {
    dcElectrical: ConditionModuleScore;
    conversionAc: ConditionModuleScore;
    thermal: ConditionModuleScore;
    performance: ConditionModuleScore;
    environment: ConditionModuleScore;
    history: ConditionModuleScore;
  };

  // Calculated Indicators
  indicators: Record<string, CalculatedIndicator>;

  // Triggered Rules
  triggeredRules: TriggeredRule[];
}

export interface ConditionModuleScore {
  moduleName: SolarConditionModuleName;
  label: string;
  score: number; // 0-100 (100 = perfect)
  weight: number; // 0-1
  status: 'optimal' | 'good' | 'warning' | 'critical';
  contributors: string[];
}

export interface CalculatedIndicator {
  key: string;
  label: string;
  currentValue: number;
  unit: string;
  benchmarkValue: number;
  deviation: number;
  status: 'normal' | 'warning' | 'critical';
  formulaExplanation: string;
}

export interface ReliabilityRule {
  ruleId: string;
  name: string;
  description: string;
  category: 'dc_electrical' | 'conversion_ac' | 'thermal' | 'performance' | 'environment' | 'history';
  assetType: SolarAsset['assetType'];
  parameterKey: string;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  comparisonOperator: '>' | '<' | '>=' | '<=' | 'abs_diff>';
  warningRiskImpact: number;
  criticalRiskImpact: number;
  priority: AssetPriority;
  isEnabled: boolean;
}

export interface TriggeredRule {
  ruleId: string;
  ruleName: string;
  severity: 'warning' | 'critical';
  parameterKey: string;
  parameterLabel: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  riskImpact: number;
  priority: AssetPriority;
  recommendationTemplate: string;
  triggeredAt: string;
}

export interface ReliabilityAlert {
  alertId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  alertTitle: string;
  conditionModule: string;
  triggeredRuleId: string;
  triggerCondition: string;
  currentValue: string;
  thresholdValue: string;
  riskImpact: number;
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  recommendationId: string;
  recommendationText: string;
  status: 'Active' | 'Acknowledged' | 'In Work Order' | 'Resolved' | 'Dismissed';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  traceability: {
    rawData: string;
    indicator: string;
    rule: string;
    conditionModule: string;
    conditionImpact: string;
    riskImpact: string;
    overallRisk: string;
    recommendation: string;
  };
}

export interface PrescriptiveRecommendation {
  recommendationId: string;
  sourceAlertId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  actionType: 'Inspect & Service' | 'Component Replacement' | 'Cleaning & Calibration' | 'Thermal Check' | 'Electrical Re-tighten';
  recommendationText: string;
  riskReductionEstimate: number; // e.g. -25 pts
  estimatedEffortHours: number;
  priority: AssetPriority;
  requiredParts: string[];
  riskIfIgnored: string;
  status: 'Pending' | 'Approved' | 'Work Order Created' | 'In Progress' | 'Completed' | 'Closed' | 'Rejected';
  createdAt: string;
}

export interface WorkOrderRecord {
  woNumber: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  issueTitle: string;
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  dueDate: string;
  sourceAlertId: string;
  recommendationId?: string;
  ruleId?: string;
  assignedEngineer: string;
  stage: 'Unassigned' | 'Diagnosing' | 'Planned Maintenance' | 'Closed';
  statusDescription: string;
  
  // Technical details
  problemDescription: string;
  sourceTelemetrySummary: string;
  triggeredRuleName: string;
  riskAssessmentSummary: string;
  plannedAction: string;
  actualAction?: string;
  rootCause: string;
  requiredParts: string[];
  partsReplaced?: string[];
  engineerNotes?: string;
  beforeReading: {
    igbtTempC?: number;
    inverterEfficiencyPct?: number;
    actualPowerMw?: number;
    moduleTempDeltaC?: number;
    healthScore: number;
    riskScore: number;
  };
  afterReading?: {
    igbtTempC?: number;
    inverterEfficiencyPct?: number;
    actualPowerMw?: number;
    moduleTempDeltaC?: number;
    healthScore: number;
    riskScore: number;
  };
  completionDate?: string;
  createdAt: string;
}

export interface MaintenanceOutcomeInput {
  woNumber: string;
  actualAction: string;
  rootCauseFindings: string;
  partsReplaced: string[];
  engineerNotes: string;
  postMaintenanceTelemetry: Partial<RawSolarTelemetry>;
}

export interface AssetHistoryEvent {
  id: string;
  timestamp: string;
  assetCode: string;
  eventType: 
    | 'telemetry_anomaly' 
    | 'rule_triggered' 
    | 'risk_escalation' 
    | 'alert_created' 
    | 'alert_acknowledged' 
    | 'alert_dismissed' 
    | 'recommendation_created' 
    | 'recommendation_approved' 
    | 'work_order_created' 
    | 'maintenance_completed' 
    | 'telemetry_updated' 
    | 'risk_normalized';
  headline: string;
  details: string;
  badge?: string;
}

export interface SolarHmiNodeStatus {
  id: string;
  assetCode: string;
  name: string;
  operationalStatus: OperationalStatus;
  healthScore: number;
  riskScore: number;
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  mainIssue: string;
  activePower: string;
  highlightedMetrics: Array<{ label: string; value: string; isAnomaly?: boolean }>;
  openAlertsCount: number;
}
