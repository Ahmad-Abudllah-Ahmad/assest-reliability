export type AssetRiskLevel = 'Low' | 'Moderate' | 'Medium' | 'High' | 'Critical';
export type AssetPriority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export type AssetTrend = 'Improving' | 'Stable' | 'Deteriorating';
export type ConditionStatus = 'Normal' | 'Warning' | 'Critical';
export type OperationalStatus = 'Online' | 'Derated' | 'Standby' | 'Maintenance' | 'Tripped';

export interface CalculatedIndicator {
  id: string;
  name: string;
  rawValue: number | string;
  unit: string;
  calculatedValue: number | string;
  baselineValue: number | string;
  warningThreshold: number | string;
  criticalThreshold: number | string;
  deviationText: string;
  status: ConditionStatus;
  riskImpact: number;
  explanation: string;
}

export interface ConditionModule {
  moduleId: 'electrical' | 'thermal' | 'performance' | 'mechanical' | 'environment' | 'history';
  moduleName: string;
  score: number; // 0-100 (100 = perfect condition)
  status: ConditionStatus;
  weight: number; // e.g. 0.25 for thermal
  riskContribution: number; // score contribution to risk
  trend: AssetTrend;
  indicators: CalculatedIndicator[];
}

export interface ReliabilityRule {
  ruleId: string;
  name: string;
  category: 'thermal' | 'performance' | 'mechanical' | 'electrical' | 'history';
  assetType?: string;
  assetTypes?: string[];
  parameter: string;
  parameterLabel: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | 'spread_gt';
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  warningRiskImpact: number;
  criticalRiskImpact: number;
  priorityImpact?: AssetPriority;
  priority?: AssetPriority;
  recommendation: string;
  enabled: boolean;
  explanation: string;
}

export interface RuleResult {
  rule: ReliabilityRule;
  triggered: boolean;
  severity: 'normal' | 'warning' | 'critical';
  actualValue: number;
  thresholdExceeded: number;
  riskImpact: number;
  details: string;
  recommendation?: string;
}

export interface RiskContributor {
  source: string;
  value: number | string;
  threshold: number | string;
  impact: number;
  ruleId?: string;
  explanation: string;
}

export interface PlantContext {
  ambientTemperatureC: number;
  ambientHumidityPct: number;
  atmosphericPressureHpa: number;
  coolingWaterTempC: number;
  coolingWaterDeltaC: number;
  gridFrequencyHz: number;
  plantTargetMW: number;
}

export interface RawAssetTelemetry {
  // Generation / Power semantics
  generationMW?: number; // For generating units: GT-1, GT-2, ST-1
  powerConsumptionMW?: number; // For auxiliary equipment: BFP-A
  transmittedMW?: number; // For transmission transformers: GSU

  // Common
  mwOutput: number;
  loadPct: number;
  voltageKV: number;
  currentAmps: number;
  powerFactor: number;
  frequencyHz: number;
  
  // Thermal
  egtSpreadC: number;
  avgEgtC: number;
  maxEgtC: number;
  minEgtC: number;
  bearingTempC: number;
  exhaustTempC: number;
  oilTempC: number;
  windingTempC: number;
  
  // Performance
  heatRateBtuKwh: number;
  baselineHeatRateBtuKwh: number;
  efficiencyPct: number;
  fuelFlowKgS: number;
  
  // Mechanical
  vibrationMmS: number;
  shaftVibrationMmS: number;
  rotorRpm: number;
  lubeOilPressureBar: number;
  lubeOilTempC: number;
  suctionPressureBar?: number;
  dischargePressureBar?: number;
  pumpFlowM3h?: number;

  // Discrete combustor cans (for GT)
  combustorCanTemps?: { canNumber: number; canLabel: string; tempC: number }[];
}

export interface CcgtAsset {
  assetId: string;
  assetName: string;
  assetCode: string; // 'GT-1', 'GT-2', 'ST-1', 'BFP-A', 'GSU'
  assetType: string;
  ratedCapacity: string;
  ratedMW: number;
  operationalStatus: OperationalStatus;

  criticality: number; // 1-5 (5 = most critical)
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

  // Underlying Raw & Calculated State
  telemetry: RawAssetTelemetry;
  conditionModules: ConditionModule[];
  riskContributors: RiskContributor[];
  triggeredRules: RuleResult[];
  explainabilitySteps: string[];

  // 7-day trend
  trend7d: {
    day: string;
    healthScore: number;
    riskScore: number;
    egtSpreadC?: number;
    heatRateBtu?: number;
  }[];

  // Thumbnail
  thumbnail: string;
}

export interface ReliabilityAlert {
  alertId: string; // e.g. 'ALT-201'
  assetId: string;
  assetCode: string;
  assetName: string;
  alertTitle: string;
  conditionModule: 'Thermal' | 'Performance' | 'Mechanical' | 'Electrical' | 'History' | 'Environment';
  triggeredRuleId: string;
  triggerCondition: string;
  currentValue: string;
  thresholdValue: string;
  riskImpact: number;
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  recommendationId?: string;
  recommendationText: string;
  status: 'Active' | 'Acknowledged' | 'In Work Order' | 'Resolved' | 'Dismissed';
  createdAt: string;
  traceability: {
    rawData: string;
    indicator: string;
    rule: string;
    condition: string;
    riskImpact: string;
    overallRisk: string;
    recommendation: string;
  };
}

export interface ReliabilityRecommendation {
  recommendationId: string; // e.g. 'REC-201'
  assetId: string;
  assetCode: string;
  sourceAlertId: string;
  sourceRuleId: string;
  recommendedAction: string;
  reason: string;
  priority: AssetPriority;
  recommendedTimeline: string;
  riskIfIgnored: string;
  status: 'Pending' | 'Approved' | 'Work Order Created' | 'In Progress' | 'Completed' | 'Closed' | 'Rejected';
  createdAt: string;
}

export interface WorkOrderRecord {
  woNumber: string; // e.g. 'WO-2041'
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
    egtSpreadC?: number;
    heatRateDevPct?: number;
    bearingTempC?: number;
    vibrationMmS?: number;
    healthScore: number;
    riskScore: number;
  };
  afterReading?: {
    egtSpreadC?: number;
    heatRateDevPct?: number;
    bearingTempC?: number;
    vibrationMmS?: number;
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
  postMaintenanceTelemetry: {
    egtSpreadC?: number;
    bearingTempC?: number;
    vibrationMmS?: number;
    shaftVibrationMmS?: number;
    heatRateBtuKwh?: number;
    oilTempC?: number;
    windingTempC?: number;
    lubeOilPressureBar?: number;
    dischargePressureBar?: number;
    efficiencyPct?: number;
  };
}

export interface AssetHistoryEvent {
  id: string;
  timestamp: string;
  assetCode: string;
  eventType: 
    | 'telemetry_anomaly' 
    | 'rule_triggered' 
    | 'rule_cleared'
    | 'condition_changed' 
    | 'risk_score_changed' 
    | 'health_changed'
    | 'alert_created' 
    | 'alert_acknowledged'
    | 'alert_dismissed'
    | 'alert_resolved'
    | 'recommendation_created'
    | 'recommendation_approved' 
    | 'recommendation_completed'
    | 'work_order_created' 
    | 'work_order_completed' 
    | 'maintenance_completed' 
    | 'maintenance_performed'
    | 'telemetry_restored'
    | 'telemetry_updated';
  headline: string;
  details: string;
  badge?: string;
  beforeVal?: string;
  afterVal?: string;
}

export const ACTIVE_ALERT_STATUSES = [
  'Active',
  'Acknowledged',
  'In Work Order'
] as const;

export type ActiveAlertStatus = typeof ACTIVE_ALERT_STATUSES[number];

export const isActiveAlertStatus = (status: string): boolean => {
  return (ACTIVE_ALERT_STATUSES as readonly string[]).includes(status);
};

const PRIORITY_RANK: Record<string, number> = {
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
  P5: 5,
};

export const sortAlertsByOperationalSeverity = (alertsList: ReliabilityAlert[]): ReliabilityAlert[] => {
  return [...alertsList].sort((a, b) => {
    const pA = PRIORITY_RANK[a.priority] ?? 99;
    const pB = PRIORITY_RANK[b.priority] ?? 99;
    if (pA !== pB) return pA - pB;
    if (b.riskImpact !== a.riskImpact) return b.riskImpact - a.riskImpact;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export type HmiMachineStatus = 'normal' | 'moderate' | 'high' | 'critical';

export const deriveMachineHmiStatus = (asset: CcgtAsset, activeAlerts: ReliabilityAlert[]): HmiMachineStatus => {
  const isCritical = asset.riskLevel === 'Critical' || activeAlerts.some(a => a.riskLevel === 'Critical' || a.priority === 'P1');
  if (isCritical) return 'critical';

  const isHigh = asset.riskLevel === 'High' || activeAlerts.some(a => a.riskLevel === 'High' || a.priority === 'P2');
  if (isHigh) return 'high';

  const isModerate = asset.riskLevel === 'Moderate' || asset.riskLevel === 'Medium' || activeAlerts.length > 0;
  if (isModerate) return 'moderate';

  return 'normal';
};

export interface HmiPipeInfo {
  id: string;
  name: string;
  type: string;
  flowFrom: string;
  from: string;
  flowTo: string;
  to: string;
  color: string;
}

export const CCGT_HMI_PIPES: Record<string, HmiPipeInfo> = {
  'pipe-fuel-gas': {
    id: 'pipe-fuel-gas',
    name: 'Fuel Gas',
    type: 'Fuel Gas',
    flowFrom: 'NG Skid',
    from: 'NG Skid',
    flowTo: 'GT-1 & GT-2',
    to: 'GT-1 & GT-2',
    color: '#d97706'
  },
  'pipe-flue-gt1': {
    id: 'pipe-flue-gt1',
    name: 'Hot Flue Gas',
    type: 'Hot Flue Gas',
    flowFrom: 'GT-1 Exhaust',
    from: 'GT-1 Exhaust',
    flowTo: 'HRSG-1',
    to: 'HRSG-1',
    color: '#ea580c'
  },
  'pipe-flue-gt2': {
    id: 'pipe-flue-gt2',
    name: 'Hot Flue Gas',
    type: 'Hot Flue Gas',
    flowFrom: 'GT-2 Exhaust',
    from: 'GT-2 Exhaust',
    flowTo: 'HRSG-2',
    to: 'HRSG-2',
    color: '#ea580c'
  },
  'pipe-hp-steam': {
    id: 'pipe-hp-steam',
    name: 'HP Main Steam',
    type: 'HP Main Steam',
    flowFrom: 'HRSG HP Drums',
    from: 'HRSG HP Drums',
    flowTo: 'Steam Turbine HP',
    to: 'Steam Turbine HP',
    color: '#b91c1c'
  },
  'pipe-reheat-steam': {
    id: 'pipe-reheat-steam',
    name: 'Hot Reheat Steam',
    type: 'Hot Reheat Steam',
    flowFrom: 'HRSG Reheaters',
    from: 'HRSG Reheaters',
    flowTo: 'Steam Turbine IP',
    to: 'Steam Turbine IP',
    color: '#7e22ce'
  },
  'pipe-feedwater': {
    id: 'pipe-feedwater',
    name: 'Feedwater',
    type: 'Feedwater',
    flowFrom: 'Deaerator / BFP-A',
    from: 'Deaerator / BFP-A',
    flowTo: 'HRSG-1 & HRSG-2',
    to: 'HRSG-1 & HRSG-2',
    color: '#0284c7'
  },
  'pipe-condensate': {
    id: 'pipe-condensate',
    name: 'Condensate Return',
    type: 'Condensate Return',
    flowFrom: 'Condenser Hotwell',
    from: 'Condenser Hotwell',
    flowTo: 'Deaerator',
    to: 'Deaerator',
    color: '#1d4ed8'
  },
  'pipe-cooling-water': {
    id: 'pipe-cooling-water',
    name: 'Cooling Water',
    type: 'Cooling Water',
    flowFrom: 'Condenser',
    from: 'Condenser',
    flowTo: 'Cooling Tower Loop',
    to: 'Cooling Tower Loop',
    color: '#0f766e'
  },
  'pipe-power': {
    id: 'pipe-power',
    name: '400kV Electrical Power',
    type: '400kV Electrical Power',
    flowFrom: 'Generators & GSU',
    from: 'Generators & GSU',
    flowTo: 'National Grid',
    to: 'National Grid',
    color: '#059669'
  }
};


