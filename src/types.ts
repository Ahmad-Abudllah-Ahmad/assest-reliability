export type ActiveTab = 'overview' | 'assets' | 'maintenance' | 'optimizer' | 'cases' | 'diagnostics';

export type CaseSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type CaseStatus = 'Unassigned' | 'Diagnosing' | 'Planned Maintenance' | 'Closed';

export interface TelemetryPoint {
  time: string;
  value: number;
  baseline: number;
  unit: string;
}

export interface CaseItem {
  id: string; // e.g. 'CAS-001'
  title: string;
  equipment: string;
  assignee: string;
  severity: CaseSeverity;
  status: CaseStatus;
  timestamp: string;
  rootCause: string;
  requiredParts: string[];
  estimatedTime: string;
  telemetryPoints: TelemetryPoint[];
  metricName: string;
  observedValue: string;
  thresholdValue: string;
}

export interface TelemetryItem {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical' | 'optimal';
  limit?: string;
  note?: string;
}

export interface MachineAsset {
  id: string;
  name: string;
  model: string;
  code: string;
  type: string;
  ratedMW: number;
  currentMW: number;
  status: 'healthy' | 'warning' | 'critical';
  statusLabel: string;
  telemetry: TelemetryItem[];
  aiRunningInsight: string;
  advisoryActions: {
    label: string;
    actionType: 'log_case' | 'assign_engineer' | 'export_package' | 'flag_outage';
    casePayload?: {
      title: string;
      equipment: string;
      severity: CaseSeverity;
      metricName: string;
      observedValue: string;
      thresholdValue: string;
      rootCause: string;
    };
  }[];
  temperatureHistory: { time: string; temp: number; benchmark: number }[];
}

export interface CombustorCan {
  canNumber: number;
  canLabel: string;
  temperature: number;
  isAnomaly: boolean;
  statusText: string;
}

export interface HeatRateCurvePoint {
  loadMW: number;
  oemDesignHeatRate: number;
  actualHeatRate?: number;
  isCurrentPoint?: boolean;
  timestamp?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

export type ToastItem = ToastMessage;

export interface MonitoredAsset {
  id: string;
  name: string;
  code: string;
  category: string;
  ratedCapacity: string;
  healthScore: number;
  statusText: string;
  statusType: 'optimal' | 'warning' | 'critical' | 'normal';
  metrics: {
    label: string;
    value: string;
    status: 'optimal' | 'normal' | 'warning' | 'critical';
  }[];
  healthTrend7d: { day: string; score: number }[];
  caseId?: string;
  aiSummary: string;
}

export interface OptimizerTask {
  id: string;
  rank: number;
  title: string;
  caseId?: string;
  assetName: string;
  assetCode: string;
  urgency: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  whyFirst: string;
  timeSaved: string;
  moneySaved: string;
  moneySavedAmount: number; // For sorting by savings
  downtimeSavedHours: number; // For sorting by downtime
  assignedTech: string;
  estDuration: string;
  actionLabel: string;
  actionToast: string;
  status: 'Pending Authorization' | 'Queued' | 'Scheduled' | 'Assigned' | 'Authorized';
}

export interface AssetMaintenanceRecord {
  id: string;
  assetName: string;
  assetTag: string;
  eoh: string;
  lastMaintenanceDate: string;
  lastMaintenanceType: string;
  nextServiceDate: string;
  nextServiceType: string;
  cycleStatus: 'on_schedule' | 'due_soon' | 'overdue';
  cycleStatusLabel: string;
}

export interface UnresolvedAlertInspection {
  id: string; // e.g. INS-101
  title: string;
  asset: string;
  assetCode: string;
  urgency: 'High' | 'Medium' | 'Critical';
  telemetryFinding: string;
  rootCauseStatus: string;
  requiredInspectionType: string;
  inspectionDetail: string;
  targetWindow: string;
  leadInspector: string;
  actionLabel: string;
  actionToast: string;
  status: 'Unscheduled' | 'Scheduled' | 'Dispatched' | 'Completed';
}

export interface CompletedInspection {
  id: string;
  asset: string;
  inspectionDate: string;
  inspector: string;
  inspectionType: string;
  findings: string;
  resultStatus: 'Passed' | 'Action Flagged' | 'Clean';
}
