export type OgActiveTab = 'overview' | 'production' | 'assets' | 'storage' | 'environmental' | 'cases';

export type OgCaseSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type OgCaseStatus = 'Unassigned' | 'Diagnosing' | 'Planned Maintenance' | 'Closed';

export interface ProductionPulsePoint {
  time: string;
  crudeOilBpd: number; // Barrels per day
  exportGasMmscfd: number; // Million standard cubic feet per day
  producedWaterBpd: number; // Barrels per day
  chokeOpeningPct: number;
  manifoldPressurePsi: number;
}

export interface GhgEmissionRecord {
  source: string;
  category: 'Turbogenerator Combustion' | 'Flare Combustion' | 'Venting' | 'Fugitive Emissions';
  tonnesCo2ePerDay: number;
  percentage: number;
  color: string;
  mitigationStatus: string;
}

export interface StorageExportPoint {
  time: string;
  tank1FillBbl: number;
  tank2FillBbl: number;
  tank3FillBbl: number;
  totalStorageBbl: number;
  exportPipelineFlowBpd: number;
  tankerOffloadingActive: boolean;
}

export interface RotatingEquipmentRul {
  id: string;
  name: string;
  tag: string;
  category: 'Gas Compression' | 'Crude Export Pumping' | 'Power Generation';
  rulPercent: number; // Remaining Useful Life % (0-100)
  hoursToService: number;
  designLifeHours: number;
  vibrationRmsMmS: number;
  vibrationLimitMmS: number;
  bearingTempC: number;
  bearingTempLimitC: number;
  sealLeakageScfm?: number;
  sealLeakageLimitScfm?: number;
  dischargePressureBar: number;
  dischargePressureRatingBar: number;
  status: 'optimal' | 'warning' | 'critical';
  statusLabel: string;
  diagnosticFinding: string;
  recommendedAction: string;
}

export interface OffshoreWellhead {
  id: string;
  wellName: string;
  slotNumber: string;
  zone: string;
  casingPressurePsi: number;
  tubingHeadPressurePsi: number;
  chokeValvePct: number;
  flowlineTempC: number;
  manifoldRoute: 'Production Header A' | 'Production Header B' | 'Test Separator';
  status: 'flowing' | 'choked' | 'shut_in' | 'testing';
  dailyCrudeBpd: number;
  bswCutPct: number;
}

export interface OffshoreSeparator {
  id: string;
  name: string;
  tag: string;
  type: '3-Phase Production Separator' | 'Test Separator & Metering Skid';
  operatingPressureBar: number;
  pressureLimitBar: number;
  liquidLevelPct: number;
  oilLevelPct: number;
  waterCutBswPct: number;
  gasOutletRateMmscfd: number;
  sandAccumulationPct: number;
  status: 'normal' | 'attention' | 'critical';
  efficiencyPct: number;
}

export interface OffshoreStorageTank {
  id: string;
  name: string;
  cargoCapacityBbl: number;
  currentStockBbl: number;
  fillPercentage: number;
  ullageMeters: number;
  tankTemperatureC: number;
  inertGasPressureMbar: number;
  status: 'filling' | 'holding' | 'exporting_to_pipeline';
}

export interface OffshoreExportSystem {
  pipelineName: string;
  diameterInches: number;
  lengthMiles: number;
  currentFlowBpd: number;
  designCapacityBpd: number;
  inletPressureBar: number;
  exportGasPressureBar: number;
  pigLauncherStatus: 'Ready' | 'Loaded' | 'Pressurized & Launching' | 'Isolated';
  lastPigInspectionDate: string;
  corrosionRateMmPerYear: number;
}

export interface OffshoreFlareSystem {
  hpFlareRateMmscfd: number;
  lpFlareRateMmscfd: number;
  combustionEfficiencyPct: number;
  purgeGasVelocityMs: number;
  pilotFlameStatus: 'All 3 Pilots Active' | '1 Pilot Standby' | 'Warning';
  dailyCo2eTonnes: number;
  regulatoryCeilingTonnes: number;
  smokeOpacityPct: number;
}

export interface OgCaseItem {
  id: string;
  title: string;
  equipment: string;
  equipmentTag: string;
  assignee: string;
  severity: OgCaseSeverity;
  status: OgCaseStatus;
  timestamp: string;
  rootCause: string;
  permitRequired: 'Hot Work Permit' | 'Cold Work Permit' | 'Confined Space Entry' | 'Electrical Isolation';
  requiredParts: string[];
  estimatedTime: string;
  metricName: string;
  observedValue: string;
  thresholdValue: string;
  telemetryPoints: { time: string; value: number; baseline: number; unit: string }[];
}
