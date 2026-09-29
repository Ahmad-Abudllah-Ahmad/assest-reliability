export type ModuleId = 'dispatch' | 'fleet' | 'carbon' | 'approvals';

export type FacilityId = 'unit-4-main' | 'substation-alpha' | 'highland-wind-bess';

export interface Facility {
  id: FacilityId;
  name: string;
  region: string;
  capacityMW: number;
  type: string;
}

export interface DemandPoint {
  time: string;
  actualMW?: number;
  forecastMW: number;
  upperBand: number;
  lowerBand: number;
  solarMW: number;
  windMW: number;
  gasPeakerMW: number;
  bessFlowMW: number; // positive = discharge, negative = charge
  lmpPrice: number;   // $/MWh
}

export interface BessStatus {
  capacityMWh: number;
  currentStorageMWh: number;
  socPercent: number;
  powerMW: number;
  state: 'CHARGING' | 'DISCHARGING' | 'STANDBY';
  todayArbitrageSavings: number;
  cycleCount: number;
  cellMaxTempC: number;
  targetPeakCutMW: number;
  autoMode: boolean;
}

export interface GenerationMixItem {
  name: string;
  valueMW: number;
  percent: number;
  color: string;
}

export interface FleetAsset {
  id: string;
  name: string;
  type: 'Gas Turbine' | 'Substation Transformer' | 'Inverter Bank' | 'BESS Enclosure';
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  unitTag: string;
  currentLoadMW?: number;
  capacityMW?: number;
  frequencyHz?: number;
  busVoltageKV?: number;
  heatRateBtu?: number;
  windingTempC?: number;
  topOilTempC?: number;
  vibrationMms?: number;
  failureRiskPercent: number;
  failureMode: string;
  degradationRate: string;
  daysToMaintenance: number;
  sparklineHistory: number[];
}

export interface HeatRatePoint {
  loadPercent: number;
  actualHeatRate: number;
  designHeatRate: number;
  thermalEfficiencyPercent: number;
}

export interface Scope1Emissions {
  scope1Intensity: number;   // tCO2e/MWh
  regulatoryCap: number;     // tCO2e/MWh
  dailyEmissionsTons: number;
  cleanEnergyPercent: number;
  carbonCreditsUSD: number;
  airFuelRatioOptimized: boolean;
  noxPpm: number;
  coPpm: number;
}

export interface TradeOffRow {
  metric: string;
  statusQuo: string;
  recommended: string;
  benefit: string;
  positive: boolean;
}

export interface SensorSignal {
  name: string;
  value: string;
  threshold: string;
  status: 'NORMAL' | 'ELEVATED' | 'ANOMALOUS';
}

export interface EvidencePackage {
  primaryDrivers: string[];
  tradeOffs: TradeOffRow[];
  marketEconomics: {
    lmpSpread: string;
    fuelSavings: string;
    assetWearCost: string;
    netBenefitHourly: string;
  };
  sensitivity: {
    confidencePct: number;
    rollbackTimeMinutes: number;
    sensorSignals: SensorSignal[];
  };
  rootCause: string;
}

export interface Recommendation {
  id: string;
  assetId: string;
  assetName: string;
  title: string;
  category: 'DISPATCH' | 'MAINTENANCE' | 'EFFICIENCY' | 'GRID_RESERVE';
  actionProposed: string;
  financialSavingsPerHour: number;
  totalProjectedSavings: number;
  gridReliabilityImpact: string;
  riskScore: number;
  status: 'NEEDS_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SIMULATING';
  confidenceScore: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  evidence: EvidencePackage;
}

export interface ReasoningStep {
  step: number;
  label: string;
  status: 'pending' | 'active' | 'done';
}

export interface ActionButton {
  label: string;
  actionId: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'emerald';
  payload?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  reasoningSteps?: ReasoningStep[];
  actionButtons?: ActionButton[];
  executedAction?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}
