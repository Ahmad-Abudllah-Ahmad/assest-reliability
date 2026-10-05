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
  moduleId: 'mechanical' | 'electrical' | 'performance' | 'thermal' | 'environment' | 'history';
  moduleName: string;
  score: number; // 0-100 (100 = perfect condition)
  status: ConditionStatus;
  weight: number; // e.g. 0.25
  riskContribution: number;
  trend: AssetTrend;
  indicators: CalculatedIndicator[];
}

export interface ReliabilityRule {
  ruleId: string;
  name: string;
  category: 'mechanical' | 'electrical' | 'performance' | 'thermal' | 'environment' | 'history';
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

export interface WindPlantContext {
  avgWindSpeedMs: number;
  windDirectionDeg: number;
  windDirectionText: string;
  ambientTemperatureC: number;
  atmosphericPressureHpa: number;
  relativeHumidityPct: number;
  turbulenceIntensityPct: number;
  windShearExponent: number;
  plantTargetMW: number;
  gridFrequencyHz: number;
  statcomMvar: number;
}

export interface RawWindTelemetry {
  // Power / Generation
  activePowerKw: number;
  generationMW?: number;
  reactivePowerKvar: number;
  powerFactor: number;
  frequencyHz: number;
  voltageKV: number;
  currentAmps: number;
  
  // Wind resource
  windSpeedMs: number;
  windDirectionDeg: number;
  ambientTempC: number;
  turbulenceIntensityPct: number;
  
  // Drivetrain / Mechanical
  rotorRpm: number;
  generatorSpeedRpm: number;
  vibrationMmS: number;
  mainBearingTempC: number;
  gearboxBearingTempC: number;
  gearboxOilTempC: number;
  hydraulicPitchPressureBar: number;
  yawHeadingDeg: number;
  
  // Aerodynamic / Pitch
  bladePitchA: number;
  bladePitchB: number;
  bladePitchC: number;
  
  // Electrical / Generator / Inverter / Converter
  generatorStatorTempC: number;
  converterIgbtTempC: number;
  transformerOilTempC?: number;
  transformerWindingTempC?: number;
  transformerLoadPct?: number;
  thdPercent?: number;
}

export interface WindAsset {
  assetId: string;
  assetName: string;
  assetCode: string; // WT-001 ... WT-006, PCS-A, PCS-B, TR-BAY-A, TR-BAY-B, STAT-01, GIS-132, GRID-TIE
  assetType: 'Wind Turbine' | 'Converter Suite' | 'Step-Up Transformer' | 'STATCOM' | 'GIS Switchgear' | 'Grid Intertie' | 'Meteo Mast';
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

  // Underlying Raw & Calculated State
  telemetry: RawWindTelemetry;
  conditionModules: ConditionModule[];
  riskContributors: RiskContributor[];
  triggeredRules: RuleResult[];
  explainabilitySteps: string[];

  // 7-day trend
  trend7d: {
    day: string;
    healthScore: number;
    riskScore: number;
    vibrationMmS?: number;
    gearboxTempC?: number;
  }[];

  thumbnail: string;
}

export interface ReliabilityAlert {
  alertId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  alertTitle: string;
  conditionModule: 'Mechanical' | 'Electrical' | 'Performance' | 'Thermal' | 'Environment' | 'History';
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
  recommendationId: string;
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
    vibrationMmS?: number;
    gearboxBearingTempC?: number;
    generatorStatorTempC?: number;
    yawMisalignmentDeg?: number;
    healthScore: number;
    riskScore: number;
  };
  afterReading?: {
    vibrationMmS?: number;
    gearboxBearingTempC?: number;
    generatorStatorTempC?: number;
    yawMisalignmentDeg?: number;
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
  postMaintenanceTelemetry: Partial<RawWindTelemetry>;
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

export interface HmiPipeInfo {
  id: string;
  label: string;
  type: string;
  from: string;
  to: string;
  color: string;
}

export type HmiMachineStatus = 'normal' | 'moderate' | 'high' | 'critical';

export function isActiveAlertStatus(status: ReliabilityAlert['status']): boolean {
  return status === 'Active' || status === 'Acknowledged' || status === 'In Work Order';
}

export function deriveMachineHmiStatus(asset: WindAsset, activeAlerts: ReliabilityAlert[]): HmiMachineStatus {
  if (asset.riskLevel === 'Critical' || activeAlerts.some(a => a.riskLevel === 'Critical')) {
    return 'critical';
  }
  if (asset.riskLevel === 'High' || activeAlerts.some(a => a.riskLevel === 'High')) {
    return 'high';
  }
  if (asset.riskLevel === 'Moderate' || asset.riskLevel === 'Medium' || activeAlerts.length > 0) {
    return 'moderate';
  }
  return 'normal';
}
