export type Severity = "Critical" | "High" | "Watch" | "Nominal";
export type AlertState = "New" | "Acknowledged" | "Case Open" | "Resolved";
export type AssetFamily = 
  | "Gas Turbine" 
  | "Steam Turbine" 
  | "Generator" 
  | "Transformer" 
  | "Pump & Auxiliary" 
  | "Grid & Switchgear";

export interface Plant {
  id: string;
  name: string;
  location: string;
  capacityMW: number;
}

export interface AssetParameter {
  name: string;
  value: number | string;
  unit: string;
  baseline: string;
  status: "normal" | "warning" | "critical";
}

export interface Asset {
  id: string;
  name: string;
  family: AssetFamily;
  plantId: string;
  plant: string;
  status: Severity;
  health: number; // 0 - 100
  risk: number;   // 0 - 100
  load: number;   // %
  impactMW: number;
  alerts: number;
  nextMaint: string;
  availability: number;
  model: string;
  lastService: string;
  failure: string;
  concern: string;
  conditionState: "Stable" | "Needs Attention" | "Immediate Action";
  failureWindow: string;
  description: string;
  parameters: AssetParameter[];
  maintenanceHistory: {
    date: string;
    type: string;
    description: string;
    technician: string;
    status: "Completed" | "Scheduled";
  }[];
}

export interface AIAlert {
  id: string;
  asset: string;
  assetName: string;
  plantId: string;
  plant: string;
  title: string;
  problem: string;
  severity: Severity;
  state: AlertState;
  risk: number;
  confidence: number;
  detected: string;
  ageMin: number;
  impactMW: number;
  impactSummary: string;
  urgency: "Immediate (< 24h)" | "High (2-3 days)" | "Moderate (1 week)" | "Low";
  failure: string;
  action: string;
  rootCause: string;
  failureProbabilities: { mode: string; prob: number }[];
  evidencePoints: string[];
  signalsInvolved: string[];
}

export interface ReliabilityModel {
  id: string;
  name: string;
  targetFamily: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  drift: number;
  status: "Healthy" | "Review" | "Retraining";
  updated: string;
  signals: number;
  failureModes: number;
  assetsCovered: number;
  topFeatures: { name: string; importance: number }[];
  description: string;
}

export interface Deployment {
  id: string;
  modelId: string;
  modelName: string;
  targetAssets: string[];
  plantId: string;
  coverage: number; // %
  quality: number;  // %
  freshness: string;
  state: "Running" | "Degraded" | "Paused";
  sensorStatus: {
    total: number;
    healthy: number;
    degraded: number;
    offline: number;
  };
  notes: string;
}

export interface CaseItem {
  id: string;
  alertId: string;
  assetId: string;
  title: string;
  owner: string;
  priority: "P1" | "P2" | "P3";
  status: "In Progress" | "Planned" | "Resolved";
  age: string;
  notes: string;
  createdAt: string;
}

export interface WorkOrderItem {
  id: string;
  caseId?: string;
  assetId: string;
  plant: string;
  task: string;
  due: string;
  duration: string;
  parts: "Ready" | "In Transit" | "Not required";
  outage: "Required" | "Standby swap" | "Online" | "Bay isolation";
  priority: "P1" | "P2" | "P3";
  status: "Scheduled" | "In Progress" | "Completed";
  technicians: string;
}

export interface OptimizationRecommendation {
  assetId: string;
  assetName: string;
  plant: string;
  risk: number;
  effortHours: number;
  exposureMW: number;
  recommendation: string;
  value: string;
  downtimeHoursAvoided: number;
  financialRiskUSD: number;
  category: "Quick Win" | "Critical Overhaul" | "Planned Window" | "Routine Optimization";
}

export const plants: Plant[] = [
  { id: "all", name: "All generation sites", location: "National Fleet", capacityMW: 1280 },
  { id: "ming", name: "Mingachevir CCGT — Block A", location: "Mingachevir", capacityMW: 626 },
  { id: "shirvan", name: "Shirvan Thermal — Unit 2", location: "Shirvan", capacityMW: 434 },
  { id: "absheron", name: "Absheron Grid — 220 kV Yard", location: "Absheron", capacityMW: 220 },
];

export const initialAssets: Asset[] = [
  {
    id: "GT-01",
    name: "Gas Turbine 01",
    family: "Gas Turbine",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    status: "High",
    health: 68,
    risk: 84,
    load: 91,
    impactMW: 142,
    alerts: 1,
    nextMaint: "In 6 days",
    availability: 94.2,
    model: "SGT5-2000E",
    lastService: "22 Aug 2026",
    failure: "Bearing wear (temperature increasing)",
    concern: "Journal bearing #2 temperature is rising above normal baseline.",
    conditionState: "Needs Attention",
    failureWindow: "48 to 72 hours",
    description: "Main gas turbine operating at baseload. Bearing temperature is climbing under high generation load.",
    parameters: [
      { name: "Bearing Vibration", value: 4.8, unit: "mm/s", baseline: "< 2.8", status: "critical" },
      { name: "Bearing Metal Temp", value: 98.4, unit: "°C", baseline: "< 85.0", status: "warning" },
      { name: "Lube Oil Pressure", value: 2.1, unit: "bar", baseline: "2.0 - 2.4", status: "normal" },
      { name: "Exhaust Temp Spread", value: 28.5, unit: "°C", baseline: "< 22.0", status: "warning" },
      { name: "Turbine Efficiency", value: 37.8, unit: "%", baseline: "38.5", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "22 Aug 2026", type: "Minor Inspection", description: "Lube oil filter replacement and magnetic plug check", technician: "K. Novruzov", status: "Completed" },
      { date: "15 May 2026", type: "Combustion Check", description: "Visual inspection of fuel nozzles", technician: "Field Engineering Team", status: "Completed" },
      { date: "10 Sep 2026", type: "Bearing Alignment", description: "Inspect and align journal bearing 2", technician: "A. Mammadov", status: "Scheduled" }
    ]
  },
  {
    id: "GT-02",
    name: "Gas Turbine 02",
    family: "Gas Turbine",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    status: "Critical",
    health: 54,
    risk: 93,
    load: 88,
    impactMW: 156,
    alerts: 1,
    nextMaint: "< 24 hours",
    availability: 91.8,
    model: "SGT5-2000E",
    lastService: "22 Aug 2026",
    failure: "Combustion flame instability",
    concern: "Combustor pressure oscillations detected. Potential trip risk during dispatch ramp.",
    conditionState: "Immediate Action",
    failureWindow: "Immediate (< 24h)",
    description: "Gas turbine combustor flame shows pressure pulses. High risk of forced trip if load is increased.",
    parameters: [
      { name: "Combustor Pressure Pulse", value: 42.1, unit: "mbar", baseline: "< 18.0", status: "critical" },
      { name: "Exhaust Temp Spread", value: 41.2, unit: "°C", baseline: "< 22.0", status: "critical" },
      { name: "Fuel Gas Ratio Shift", value: 3.8, unit: "%", baseline: "< 1.0", status: "critical" },
      { name: "Shaft Vibration", value: 3.4, unit: "mm/s", baseline: "< 2.8", status: "warning" },
      { name: "Compressor Pressure", value: 14.2, unit: "pr", baseline: "14.4", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "22 Aug 2026", type: "Routine Check", description: "Flame scanner calibration and fuel valve inspection", technician: "R. Hasanov", status: "Completed" },
      { date: "09 Sep 2026", type: "Combustion Tuning", description: "Emergency fuel valve re-balancing and burner check", technician: "OEM Specialist", status: "Scheduled" }
    ]
  },
  {
    id: "ST-01",
    name: "Steam Turbine 01",
    family: "Steam Turbine",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    status: "Nominal",
    health: 92,
    risk: 18,
    load: 82,
    impactMW: 118,
    alerts: 0,
    nextMaint: "41 days",
    availability: 98.6,
    model: "SST-600",
    lastService: "02 Jul 2026",
    failure: "None — Operating normally",
    concern: "All temperatures and vibration levels within healthy ranges.",
    conditionState: "Stable",
    failureWindow: "Stable (> 90d)",
    description: "High-pressure steam turbine operating smoothly on steam from heat recovery boilers.",
    parameters: [
      { name: "Casing Temperature", value: 14.1, unit: "°C", baseline: "< 25.0", status: "normal" },
      { name: "Shaft Vibration", value: 18.2, unit: "µm", baseline: "< 35.0", status: "normal" },
      { name: "Thrust Bearing Temp", value: 72.4, unit: "°C", baseline: "< 88.0", status: "normal" },
      { name: "Main Steam Pressure", value: 92.5, unit: "bar", baseline: "90 - 95", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "02 Jul 2026", type: "Major Overhaul", description: "Blade cleaning and steam seal renewal", technician: "Turbine Services", status: "Completed" }
    ]
  },
  {
    id: "GEN-01",
    name: "Generator 01",
    family: "Generator",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    status: "Nominal",
    health: 95,
    risk: 12,
    load: 89,
    impactMW: 210,
    alerts: 0,
    nextMaint: "58 days",
    availability: 99.1,
    model: "SGen-2000P",
    lastService: "13 Jun 2026",
    failure: "None — Operating normally",
    concern: "Electrical insulation and cooling conditions healthy.",
    conditionState: "Stable",
    failureWindow: "Stable (> 90d)",
    description: "Primary hydrogen-cooled generator. Clean electrical output and low temperature rise.",
    parameters: [
      { name: "Stator Core Temp", value: 81.2, unit: "°C", baseline: "< 110.0", status: "normal" },
      { name: "Hydrogen Purity", value: 99.1, unit: "%", baseline: "> 98.0", status: "normal" },
      { name: "Electrical Current", value: 680, unit: "A", baseline: "< 850", status: "normal" },
      { name: "Partial Discharge", value: 120, unit: "pC", baseline: "< 400", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "13 Jun 2026", type: "Electrical Testing", description: "Insulation testing and power factor scan", technician: "Electrical Team", status: "Completed" }
    ]
  },
  {
    id: "GEN-03",
    name: "Generator 03",
    family: "Generator",
    plantId: "shirvan",
    plant: "Shirvan Thermal",
    status: "Watch",
    health: 76,
    risk: 64,
    load: 77,
    impactMW: 96,
    alerts: 1,
    nextMaint: "9 days",
    availability: 96.7,
    model: "TGEN-160",
    lastService: "05 Aug 2026",
    failure: "Winding temperature rising",
    concern: "Phase B winding temperature is drifting higher than other phases.",
    conditionState: "Needs Attention",
    failureWindow: "10 to 14 days",
    description: "Generator with localized cooling imbalance in Phase B windings.",
    parameters: [
      { name: "Phase B Winding Temp", value: 108.6, unit: "°C", baseline: "< 95.0", status: "warning" },
      { name: "Cooler Temp Drop", value: 6.2, unit: "°C", baseline: "9.0 - 12.0", status: "warning" },
      { name: "Voltage Balance", value: 99.4, unit: "%", baseline: "> 98.5", status: "normal" },
      { name: "Vibration", value: 2.1, unit: "mm/s", baseline: "< 3.0", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "05 Aug 2026", type: "Cooler Flushing", description: "Cleaning cooling tube bundle", technician: "E. Aliyev", status: "Completed" }
    ]
  },
  {
    id: "TR-03",
    name: "GSU Transformer 03",
    family: "Transformer",
    plantId: "absheron",
    plant: "Absheron Grid",
    status: "High",
    health: 63,
    risk: 79,
    load: 94,
    impactMW: 180,
    alerts: 1,
    nextMaint: "3 days overdue",
    availability: 97.0,
    model: "ONAF 160 MVA",
    lastService: "06 Jun 2026",
    failure: "Transformer overheating (fan bank issue)",
    concern: "Cooling fan bank #2 failed; top oil temperature running hot under heavy transmission load.",
    conditionState: "Needs Attention",
    failureWindow: "3 to 5 days",
    description: "Main grid step-up transformer running near maximum capacity with degraded cooling fans.",
    parameters: [
      { name: "Top Oil Temperature", value: 89.4, unit: "°C", baseline: "< 75.0", status: "critical" },
      { name: "Winding Hotspot Temp", value: 119.2, unit: "°C", baseline: "< 105.0", status: "critical" },
      { name: "Cooling Fan Bank 2", value: "Degraded", unit: "", baseline: "Running", status: "warning" },
      { name: "Gas in Oil Level", value: 142, unit: "ppm", baseline: "< 100", status: "warning" }
    ],
    maintenanceHistory: [
      { date: "06 Jun 2026", type: "Oil Sampling", description: "Standard oil insulation and gas test", technician: "Oil Lab Specialist", status: "Completed" },
      { date: "09 Sep 2026", type: "Fan Inspection", description: "Replace cooling fan contactor and re-test oil", technician: "T. Qasimov", status: "Scheduled" }
    ]
  },
  {
    id: "BFP-02",
    name: "Boiler Feed Pump 02",
    family: "Pump & Auxiliary",
    plantId: "shirvan",
    plant: "Shirvan Thermal",
    status: "Watch",
    health: 72,
    risk: 67,
    load: 84,
    impactMW: 62,
    alerts: 1,
    nextMaint: "4 days",
    availability: 95.5,
    model: "BB5 180 bar",
    lastService: "18 Jul 2026",
    failure: "Pump cavitation (strainer dirty)",
    concern: "Water flow restriction at suction inlet causing micro-vibrations.",
    conditionState: "Needs Attention",
    failureWindow: "7 to 10 days",
    description: "High-pressure boiler water pump showing early cavitation noise from clogged suction strainer.",
    parameters: [
      { name: "Suction Inlet Pressure", value: 1.8, unit: "bar", baseline: "> 2.4", status: "warning" },
      { name: "Pump Vibration", value: 4.6, unit: "mm/s", baseline: "< 2.8", status: "warning" },
      { name: "Bearing Temp", value: 76.1, unit: "°C", baseline: "< 80.0", status: "normal" },
      { name: "Discharge Pressure", value: 174.0, unit: "bar", baseline: "175 - 182", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "18 Jul 2026", type: "Seal Check", description: "Mechanical seal leak check and flush line cleaning", technician: "Pumps Crew", status: "Completed" }
    ]
  },
  {
    id: "CWP-01",
    name: "Cooling Water Pump 01",
    family: "Pump & Auxiliary",
    plantId: "shirvan",
    plant: "Shirvan Thermal",
    status: "Nominal",
    health: 90,
    risk: 20,
    load: 73,
    impactMW: 38,
    alerts: 0,
    nextMaint: "33 days",
    availability: 98.8,
    model: "VS1 8,000 m3/h",
    lastService: "11 Jul 2026",
    failure: "None — Operating normally",
    concern: "Water flow and motor temperatures in healthy target band.",
    conditionState: "Stable",
    failureWindow: "Stable (> 60d)",
    description: "Main cooling water pump feeding steam condenser. Steady operation.",
    parameters: [
      { name: "Pump Vibration", value: 1.6, unit: "mm/s", baseline: "< 3.2", status: "normal" },
      { name: "Motor Temp", value: 71.0, unit: "°C", baseline: "< 90.0", status: "normal" },
      { name: "Water Flow", value: 7850, unit: "m³/h", baseline: "7500 - 8200", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "11 Jul 2026", type: "Lubrication", description: "Thrust bearing oil flushed and replaced", technician: "Maint Team", status: "Completed" }
    ]
  },
  {
    id: "CB-12",
    name: "220 kV Breaker Bay 12",
    family: "Grid & Switchgear",
    plantId: "absheron",
    plant: "Absheron Grid",
    status: "Watch",
    health: 81,
    risk: 58,
    load: 66,
    impactMW: 220,
    alerts: 1,
    nextMaint: "12 days",
    availability: 99.0,
    model: "SF6 245 kV",
    lastService: "27 May 2026",
    failure: "Switchgear closing delay (mechanism sticking)",
    concern: "Breaker mechanical switch is taking 10 ms longer to close than standard specification.",
    conditionState: "Needs Attention",
    failureWindow: "14 to 20 days",
    description: "High-voltage transmission line circuit breaker with slow mechanical actuation.",
    parameters: [
      { name: "Switch Close Time", value: 58.2, unit: "ms", baseline: "42.0 - 48.0", status: "warning" },
      { name: "Insulating Gas Pressure", value: 6.4, unit: "bar", baseline: "> 6.0", status: "normal" },
      { name: "Trip Coil Action", value: "Sluggish", unit: "", baseline: "Normal", status: "warning" },
      { name: "Travel Distance", value: 142.1, unit: "mm", baseline: "140 - 145", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "27 May 2026", type: "Gas Inspection", description: "Insulating gas tested and topped up", technician: "Switchgear Specialist", status: "Completed" }
    ]
  },
  {
    id: "TR-01",
    name: "Station Transformer 01",
    family: "Transformer",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    status: "Nominal",
    health: 89,
    risk: 22,
    load: 71,
    impactMW: 55,
    alerts: 0,
    nextMaint: "47 days",
    availability: 99.3,
    model: "ONAN 63 MVA",
    lastService: "19 Jun 2026",
    failure: "None — Operating normally",
    concern: "Auxiliary power transformer operating well within thermal limits.",
    conditionState: "Stable",
    failureWindow: "Stable (> 90d)",
    description: "Station auxiliary transformer supplying plant motors and pumps.",
    parameters: [
      { name: "Oil Temperature", value: 61.5, unit: "°C", baseline: "< 75.0", status: "normal" },
      { name: "Moisture in Oil", value: 9.4, unit: "ppm", baseline: "< 15.0", status: "normal" },
      { name: "Tap Switch Operations", value: 14820, unit: "ops", baseline: "< 25000", status: "normal" }
    ],
    maintenanceHistory: [
      { date: "19 Jun 2026", type: "Annual Inspection", description: "Thermal camera scan and relay protection test", technician: "Relay Team", status: "Completed" }
    ]
  }
];

export const initialAlerts: AIAlert[] = [
  {
    id: "AL-2048",
    asset: "GT-02",
    assetName: "Gas Turbine 02",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    title: "Combustion flame instability (vibration rising)",
    problem: "Combustion pressure pulses rising rapidly in combustor #4.",
    severity: "Critical",
    state: "New",
    risk: 93,
    confidence: 91,
    detected: "12:18",
    ageMin: 17,
    impactMW: 156,
    impactSummary: "Risk of forced plant shutdown (156 MW capacity at stake)",
    urgency: "Immediate (< 24h)",
    failure: "Combustion flame instability",
    action: "Hold generation at 88% load and check fuel gas valves before increasing output.",
    rootCause: "Fuel nozzle blockage creating flame oscillation in combustion chamber 4.",
    failureProbabilities: [
      { mode: "Flame instability in combustor", prob: 91 },
      { mode: "Flame detector sensor issue", prob: 6 },
      { mode: "Temporary grid transient", prob: 3 }
    ],
    evidencePoints: [
      "Pressure pulses jumped from normal 14 mbar to 42.1 mbar over the last 30 minutes.",
      "Exhaust temperatures show a localized cold spot of 41.2°C spread in burner zone 4.",
      "Fuel gas valve position shifted 3.8% from expected baseline setting."
    ],
    signalsInvolved: ["Combustor Pressure Pulse", "Exhaust Temp Spread", "Fuel Gas Ratio", "Shaft Vibration"]
  },
  {
    id: "AL-2047",
    asset: "GT-01",
    assetName: "Gas Turbine 01",
    plantId: "ming",
    plant: "Mingachevir CCGT",
    title: "Bearing #2 wear (temperature increasing)",
    problem: "Bearing #2 vibration and metal temperature climbing above safe thresholds.",
    severity: "High",
    state: "Case Open",
    risk: 84,
    confidence: 88,
    detected: "11:42",
    ageMin: 53,
    impactMW: 142,
    impactSummary: "Unplanned turbine trip risk if bearing metal overheats",
    urgency: "High (2-3 days)",
    failure: "Journal bearing wear",
    action: "Inspect bearing 2 and check lubricating oil lines during next 6-hour night window.",
    rootCause: "Thinning oil film and early babbit metal surface wear on journal bearing #2.",
    failureProbabilities: [
      { mode: "Journal bearing metal wear", prob: 88 },
      { mode: "Oil filter blockage / low flow", prob: 8 },
      { mode: "Shaft coupling misalignment", prob: 4 }
    ],
    evidencePoints: [
      "Bearing vibration rose to 4.8 mm/s (normal is below 2.8 mm/s).",
      "Bearing metal temperature reached 98.4°C while oil supply temperature remained normal at 46°C.",
      "Vibration frequency shows characteristic oil whirl signature."
    ],
    signalsInvolved: ["Bearing Vibration", "Bearing Metal Temp", "Lube Oil Pressure"]
  },
  {
    id: "AL-2043",
    asset: "TR-03",
    assetName: "GSU Transformer 03",
    plantId: "absheron",
    plant: "Absheron Grid",
    title: "Transformer overheating (cooling fan issue)",
    problem: "Top oil temperature running hot under heavy transmission load.",
    severity: "High",
    state: "New",
    risk: 79,
    confidence: 86,
    detected: "09:56",
    ageMin: 159,
    impactMW: 180,
    impactSummary: "180 MW transmission line derating if transformer exceeds thermal limit",
    urgency: "High (2-3 days)",
    failure: "Cooling fan bank failure",
    action: "Manually start backup cooling fan bank and take an oil sample for lab test.",
    rootCause: "Cooling fan contactor tripped on bank 2 while transformer operates at 94% heavy load.",
    failureProbabilities: [
      { mode: "Cooling fan failure / thermal overload", prob: 86 },
      { mode: "Internal electrical winding fault", prob: 9 },
      { mode: "Temperature sensor drift", prob: 5 }
    ],
    evidencePoints: [
      "Hotspot temperature reached 119.2°C, surpassing safe limit of 105°C.",
      "Cooling fan bank 2 electrical current dropped to zero.",
      "Dissolved gas test shows slight increase in hydrogen gas in oil."
    ],
    signalsInvolved: ["Top Oil Temperature", "Winding Hotspot Temp", "Cooling Fan Bank 2", "Gas in Oil Level"]
  },
  {
    id: "AL-2041",
    asset: "BFP-02",
    assetName: "Boiler Feed Pump 02",
    plantId: "shirvan",
    plant: "Shirvan Thermal",
    title: "Pump cavitation (suction filter dirty)",
    problem: "Feedwater pump vibrating due to water flow restriction at suction.",
    severity: "Watch",
    state: "Acknowledged",
    risk: 67,
    confidence: 82,
    detected: "08:31",
    ageMin: 244,
    impactMW: 62,
    impactSummary: "Steam boiler trip if feedwater pressure drops",
    urgency: "Moderate (1 week)",
    failure: "Dirty suction strainer causing cavitation",
    action: "Clean suction basket filter and check recirculation valve.",
    rootCause: "Debris accumulation in inlet basket strainer reducing water pressure entering the pump.",
    failureProbabilities: [
      { mode: "Pump cavitation from dirty filter", prob: 82 },
      { mode: "Pump impeller blade wear", prob: 12 },
      { mode: "Recirculation bypass valve leaking", prob: 6 }
    ],
    evidencePoints: [
      "Acoustic sensor picked up characteristic bubble collapse noise band.",
      "Inlet suction pressure dropped to 1.8 bar against required minimum of 2.2 bar.",
      "Pump vibration is fluctuating with water flow rate."
    ],
    signalsInvolved: ["Suction Inlet Pressure", "Pump Vibration", "Discharge Pressure"]
  },
  {
    id: "AL-2039",
    asset: "GEN-03",
    assetName: "Generator 03",
    plantId: "shirvan",
    plant: "Shirvan Thermal",
    title: "Generator winding temperature rising",
    problem: "Phase B winding running 18°C warmer than other phases.",
    severity: "Watch",
    state: "New",
    risk: 64,
    confidence: 79,
    detected: "07:48",
    ageMin: 287,
    impactMW: 96,
    impactSummary: "Insulation life reduction if high temperatures persist",
    urgency: "Moderate (1 week)",
    failure: "Cooling gas duct restriction",
    action: "Check temperature sensors and inspect hydrogen cooling tubes during shift.",
    rootCause: "Partial dirt buildup on internal cooling baffle restricting gas flow to Phase B.",
    failureProbabilities: [
      { mode: "Cooling gas duct restriction", prob: 79 },
      { mode: "Temperature sensor channel drift", prob: 15 },
      { mode: "Rotor magnetic imbalance", prob: 6 }
    ],
    evidencePoints: [
      "Phase B winding reading 108.6°C compared to 90°C on Phase A and C.",
      "Cooling temperature drop is lower than normal (6.2°C vs expected 10°C).",
      "Electrical voltages and currents remain balanced, confirming cooling cause."
    ],
    signalsInvolved: ["Phase B Winding Temp", "Cooler Temp Drop", "Voltage Balance"]
  },
  {
    id: "AL-2035",
    asset: "CB-12",
    assetName: "220 kV Breaker Bay 12",
    plantId: "absheron",
    plant: "Absheron Grid",
    title: "Switchgear closing delay (mechanism sticking)",
    problem: "Circuit breaker takes 10 ms longer to close than standard safety limits.",
    severity: "Watch",
    state: "Acknowledged",
    risk: 58,
    confidence: 76,
    detected: "05:22",
    ageMin: 433,
    impactMW: 220,
    impactSummary: "Slow clearance of transmission line faults",
    urgency: "Moderate (1 week)",
    failure: "Mechanical linkage friction",
    action: "Perform breaker closing time test before next transmission switching operation.",
    rootCause: "Hardened damper grease causing mechanical friction in the closing spring latch.",
    failureProbabilities: [
      { mode: "Mechanical linkage friction", prob: 76 },
      { mode: "Trip coil electrical resistance shift", prob: 16 },
      { mode: "Auxiliary contact switch bounce", prob: 8 }
    ],
    evidencePoints: [
      "Closing stroke time drifted to 58.2 ms (standard specification is 42 to 48 ms).",
      "Electrical trip coil shows slight delay in latch release.",
      "Insulating gas pressure is normal at 6.4 bar, confirming mechanical issue."
    ],
    signalsInvolved: ["Switch Close Time", "Trip Coil Action", "Insulating Gas Pressure"]
  }
];

export const initialModels: ReliabilityModel[] = [
  {
    id: "M-01",
    name: "Gas Turbine Health & Anomaly Detector",
    targetFamily: "Gas Turbine",
    accuracy: 96.2,
    precision: 94.1,
    recall: 91.5,
    f1: 92.8,
    drift: 2.1,
    status: "Healthy",
    updated: "03 Sep 2026",
    signals: 18,
    failureModes: 6,
    assetsCovered: 2,
    topFeatures: [
      { name: "Combustor Pressure Pulse", importance: 0.32 },
      { name: "Bearing Vibration", importance: 0.26 },
      { name: "Exhaust Temp Spread", importance: 0.21 },
      { name: "Compressor Pressure", importance: 0.12 },
      { name: "Fuel Valve Position", importance: 0.09 }
    ],
    description: "Detects early combustion instability, bearing distress, and turbine blade vibration."
  },
  {
    id: "M-02",
    name: "Generator Winding & Thermal Model",
    targetFamily: "Generator",
    accuracy: 94.8,
    precision: 91.3,
    recall: 89.2,
    f1: 90.2,
    drift: 3.4,
    status: "Healthy",
    updated: "31 Aug 2026",
    signals: 12,
    failureModes: 4,
    assetsCovered: 2,
    topFeatures: [
      { name: "Winding Temperature", importance: 0.38 },
      { name: "Hydrogen Cooler Temp Drop", importance: 0.28 },
      { name: "Current Balance", importance: 0.19 },
      { name: "Core Vibration", importance: 0.15 }
    ],
    description: "Monitors generator electrical winding temperatures and cooling gas effectiveness."
  },
  {
    id: "M-03",
    name: "Transformer Hotspot & Thermal Risk Model",
    targetFamily: "Transformer",
    accuracy: 92.1,
    precision: 93.0,
    recall: 87.4,
    f1: 90.1,
    drift: 6.9,
    status: "Review",
    updated: "27 Aug 2026",
    signals: 11,
    failureModes: 5,
    assetsCovered: 2,
    topFeatures: [
      { name: "Winding Hotspot Temp", importance: 0.41 },
      { name: "Top Oil Temperature", importance: 0.30 },
      { name: "Cooling Fan Current", importance: 0.18 },
      { name: "Gas in Oil Level", importance: 0.11 }
    ],
    description: "Tracks transformer internal temperatures, fan cooling health, and oil gas levels."
  },
  {
    id: "M-04",
    name: "Pump Cavitation & Bearing Wear Model",
    targetFamily: "Pump & Auxiliary",
    accuracy: 93.5,
    precision: 90.4,
    recall: 88.6,
    f1: 89.5,
    drift: 2.8,
    status: "Healthy",
    updated: "01 Sep 2026",
    signals: 9,
    failureModes: 5,
    assetsCovered: 2,
    topFeatures: [
      { name: "Acoustic Noise (Cavitation)", importance: 0.44 },
      { name: "Suction Pressure", importance: 0.27 },
      { name: "Pump Vibration", importance: 0.18 },
      { name: "Water Pressure Fluctuation", importance: 0.11 }
    ],
    description: "Monitors high-pressure feedwater pumps for clogged filters, cavitation, and bearing wear."
  },
  {
    id: "M-05",
    name: "Circuit Breaker Timing & Mechanism Model",
    targetFamily: "Grid & Switchgear",
    accuracy: 91.7,
    precision: 89.0,
    recall: 85.5,
    f1: 87.2,
    drift: 4.2,
    status: "Healthy",
    updated: "29 Aug 2026",
    signals: 7,
    failureModes: 3,
    assetsCovered: 1,
    topFeatures: [
      { name: "Switch Close Time", importance: 0.46 },
      { name: "Trip Coil Action", importance: 0.32 },
      { name: "Insulating Gas Pressure", importance: 0.22 }
    ],
    description: "Evaluates high-voltage switchgear actuation speed to predict mechanical sticking."
  }
];

export const initialDeployments: Deployment[] = [
  {
    id: "DEP-071",
    modelId: "M-01",
    modelName: "Gas Turbine Health & Anomaly Detector",
    targetAssets: ["GT-01", "GT-02"],
    plantId: "ming",
    coverage: 98.8,
    quality: 98.7,
    freshness: "4s ago",
    state: "Running",
    sensorStatus: { total: 36, healthy: 35, degraded: 1, offline: 0 },
    notes: "Monitoring normally. Minor electrical noise on GT-01 exhaust sensor #14."
  },
  {
    id: "DEP-064",
    modelId: "M-02",
    modelName: "Generator Winding & Thermal Model",
    targetAssets: ["GEN-01", "GEN-03"],
    plantId: "shirvan",
    coverage: 100,
    quality: 99.2,
    freshness: "3s ago",
    state: "Running",
    sensorStatus: { total: 24, healthy: 24, degraded: 0, offline: 0 },
    notes: "All 24 temperature channels transmitting cleanly. Temperature alert active on GEN-03."
  },
  {
    id: "DEP-058",
    modelId: "M-03",
    modelName: "Transformer Hotspot & Thermal Risk Model",
    targetAssets: ["TR-01", "TR-03"],
    plantId: "absheron",
    coverage: 88.5,
    quality: 91.4,
    freshness: "12s ago",
    state: "Degraded",
    sensorStatus: { total: 22, healthy: 18, degraded: 3, offline: 1 },
    notes: "Cooling Fan Bank 2 current sensor offline on TR-03. Model running in backup estimation mode."
  },
  {
    id: "DEP-049",
    modelId: "M-04",
    modelName: "Pump Cavitation & Bearing Wear Model",
    targetAssets: ["BFP-02", "CWP-01"],
    plantId: "shirvan",
    coverage: 94.0,
    quality: 96.5,
    freshness: "6s ago",
    state: "Running",
    sensorStatus: { total: 18, healthy: 17, degraded: 1, offline: 0 },
    notes: "Cavitation acoustic sensor on BFP-02 reading slight baseline drift."
  },
  {
    id: "DEP-032",
    modelId: "M-05",
    modelName: "Circuit Breaker Timing & Mechanism Model",
    targetAssets: ["CB-12"],
    plantId: "absheron",
    coverage: 100,
    quality: 95.9,
    freshness: "Event-triggered",
    state: "Running",
    sensorStatus: { total: 7, healthy: 7, degraded: 0, offline: 0 },
    notes: "Standby for trip actuation signals. Last operation recorded 10 ms switch delay."
  }
];

export const initialCases: CaseItem[] = [
  {
    id: "CASE-118",
    alertId: "AL-2047",
    assetId: "GT-01",
    title: "Investigate bearing #2 wear and rising temperature",
    owner: "A. Mammadov",
    priority: "P1",
    status: "In Progress",
    age: "53 min ago",
    notes: "Reviewed with OEM engineering. Bearing clearance inspection scheduled for tonight.",
    createdAt: "09 Sep 2026 · 11:55"
  },
  {
    id: "CASE-113",
    alertId: "AL-2035",
    assetId: "CB-12",
    title: "Check circuit breaker closing delay and lubricate mechanism",
    owner: "N. Aliyev",
    priority: "P2",
    status: "Planned",
    age: "7 hours ago",
    notes: "Switching isolation permit requested from dispatch. Test timer prepared.",
    createdAt: "09 Sep 2026 · 05:45"
  }
];

export const initialWorkOrders: WorkOrderItem[] = [
  {
    id: "WO-8821",
    caseId: "CASE-118",
    assetId: "GT-01",
    plant: "Mingachevir CCGT",
    task: "Inspect bearing #2 and clean lubricating oil lines",
    due: "10 Sep · 02:00",
    duration: "6.0 h",
    parts: "Ready",
    outage: "Required",
    priority: "P1",
    status: "Scheduled",
    technicians: "A. Mammadov, K. Novruzov"
  },
  {
    id: "WO-8814",
    assetId: "TR-03",
    plant: "Absheron Grid",
    task: "Replace cooling fan contactor and take urgent oil sample",
    due: "09 Sep · 18:00",
    duration: "2.0 h",
    parts: "Ready",
    outage: "Online",
    priority: "P1",
    status: "Scheduled",
    technicians: "T. Qasimov"
  },
  {
    id: "WO-8807",
    assetId: "BFP-02",
    plant: "Shirvan Thermal",
    task: "Clean suction basket filter and check pressure sensors",
    due: "10 Sep · 08:00",
    duration: "1.5 h",
    parts: "Ready",
    outage: "Standby swap",
    priority: "P2",
    status: "Scheduled",
    technicians: "E. Aliyev"
  },
  {
    id: "WO-8799",
    caseId: "CASE-113",
    assetId: "CB-12",
    plant: "Absheron Grid",
    task: "Test breaker timing speed and re-lubricate operating spring",
    due: "12 Sep · 06:00",
    duration: "2.5 h",
    parts: "Not required",
    outage: "Bay isolation",
    priority: "P2",
    status: "Scheduled",
    technicians: "N. Aliyev"
  }
];

export const initialOptimization: OptimizationRecommendation[] = [
  {
    assetId: "GT-02",
    assetName: "Gas Turbine 02",
    plant: "Mingachevir CCGT",
    risk: 93,
    effortHours: 5.5,
    exposureMW: 156,
    recommendation: "Tune combustion burners and re-balance fuel valves",
    value: "Avoid forced shutdown and heavy curtailment penalties",
    downtimeHoursAvoided: 72,
    financialRiskUSD: 480000,
    category: "Critical Overhaul"
  },
  {
    assetId: "GT-01",
    assetName: "Gas Turbine 01",
    plant: "Mingachevir CCGT",
    risk: 84,
    effortHours: 6.0,
    exposureMW: 142,
    recommendation: "Inspect bearing #2 during planned off-peak night window",
    value: "Prevent catastrophic shaft wipe into a controlled 6-hour service",
    downtimeHoursAvoided: 120,
    financialRiskUSD: 620000,
    category: "Planned Window"
  },
  {
    assetId: "TR-03",
    assetName: "GSU Transformer 03",
    plant: "Absheron Grid",
    risk: 79,
    effortHours: 2.0,
    exposureMW: 180,
    recommendation: "Fix cooling fan contactor switch and test oil",
    value: "Prevent transformer overheating on major transmission line",
    downtimeHoursAvoided: 24,
    financialRiskUSD: 240000,
    category: "Quick Win"
  },
  {
    assetId: "BFP-02",
    assetName: "Boiler Feed Pump 02",
    plant: "Shirvan Thermal",
    risk: 67,
    effortHours: 1.5,
    exposureMW: 62,
    recommendation: "Clean inlet water filter to stop pump cavitation",
    value: "Prevent pump blade damage and steam boiler trip",
    downtimeHoursAvoided: 18,
    financialRiskUSD: 95000,
    category: "Quick Win"
  },
  {
    assetId: "GEN-03",
    assetName: "Generator 03",
    plant: "Shirvan Thermal",
    risk: 64,
    effortHours: 3.0,
    exposureMW: 96,
    recommendation: "Clean hydrogen cooling tubes to restore even temperature",
    value: "Protect generator winding insulation life",
    downtimeHoursAvoided: 36,
    financialRiskUSD: 180000,
    category: "Routine Optimization"
  }
];

export const portfolioTrendData = [
  { date: "27 Aug", exposureMW: 312, highRiskAssets: 2, fleetHealth: 88 },
  { date: "29 Aug", exposureMW: 326, highRiskAssets: 2, fleetHealth: 87 },
  { date: "31 Aug", exposureMW: 344, highRiskAssets: 3, fleetHealth: 86 },
  { date: "02 Sep", exposureMW: 338, highRiskAssets: 3, fleetHealth: 86 },
  { date: "04 Sep", exposureMW: 372, highRiskAssets: 3, fleetHealth: 84 },
  { date: "06 Sep", exposureMW: 401, highRiskAssets: 4, fleetHealth: 83 },
  { date: "08 Sep", exposureMW: 420, highRiskAssets: 4, fleetHealth: 82 },
  { date: "09 Sep", exposureMW: 478, highRiskAssets: 4, fleetHealth: 81 },
];

export const signalEvidenceData = Array.from({ length: 24 }, (_, i) => {
  const isAnomaly = i >= 17;
  const vibration = Number((2.1 + Math.sin(i / 3) * 0.2 + (isAnomaly ? (i - 16) * 0.44 : 0)).toFixed(2));
  const exhaustSpread = Number((16.5 + Math.sin(i / 4) * 1.8 + (isAnomaly ? (i - 16) * 3.8 : 0)).toFixed(1));
  const bearingTemp = Number((78 + Math.sin(i / 3) * 2.0 + (isAnomaly ? (i - 16) * 3.1 : 0)).toFixed(1));
  const loadPercent = Number((86 + Math.cos(i / 2) * 5.0).toFixed(0));

  return {
    time: `${String(i).padStart(2, "0")}:00`,
    vibration,
    exhaustSpread,
    bearingTemp,
    loadPercent,
    vibrationBaseline: 2.8,
    exhaustSpreadBaseline: 22.0,
    bearingTempBaseline: 85.0
  };
});

export const liveStreamData = [
  { time: "12:10", gt01Vib: 4.6, gt02Pressure: 38.2, tr03Temp: 87.2, gridFreq: 50.02 },
  { time: "12:12", gt01Vib: 4.7, gt02Pressure: 39.5, tr03Temp: 87.8, gridFreq: 49.98 },
  { time: "12:14", gt01Vib: 4.8, gt02Pressure: 41.0, tr03Temp: 88.5, gridFreq: 50.01 },
  { time: "12:16", gt01Vib: 4.8, gt02Pressure: 41.8, tr03Temp: 89.0, gridFreq: 49.99 },
  { time: "12:18", gt01Vib: 4.8, gt02Pressure: 42.1, tr03Temp: 89.4, gridFreq: 50.00 },
];
