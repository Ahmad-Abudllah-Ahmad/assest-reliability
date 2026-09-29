import {
  OffshoreWellhead,
  OffshoreSeparator,
  RotatingEquipmentRul,
  OffshoreStorageTank,
  OffshoreExportSystem,
  OffshoreFlareSystem,
  ProductionPulsePoint,
  GhgEmissionRecord,
  StorageExportPoint,
  OgCaseItem
} from '../types/oilGasTypes';

// 1. The Production Pulse 24-Hour Time-Series (Crude bbl/d, Export Gas MMscf/d, Produced Water bbl/d)
export const INITIAL_PRODUCTION_PULSE: ProductionPulsePoint[] = [
  { time: '00:00', crudeOilBpd: 81400, exportGasMmscfd: 142.1, producedWaterBpd: 24800, chokeOpeningPct: 62, manifoldPressurePsi: 2420 },
  { time: '02:00', crudeOilBpd: 82100, exportGasMmscfd: 143.4, producedWaterBpd: 25100, chokeOpeningPct: 62, manifoldPressurePsi: 2435 },
  { time: '04:00', crudeOilBpd: 82800, exportGasMmscfd: 144.8, producedWaterBpd: 25300, chokeOpeningPct: 63, manifoldPressurePsi: 2440 },
  { time: '06:00', crudeOilBpd: 83500, exportGasMmscfd: 146.2, producedWaterBpd: 25700, chokeOpeningPct: 64, manifoldPressurePsi: 2450 },
  { time: '08:00', crudeOilBpd: 84600, exportGasMmscfd: 148.0, producedWaterBpd: 26100, chokeOpeningPct: 65, manifoldPressurePsi: 2465 },
  { time: '10:00', crudeOilBpd: 85200, exportGasMmscfd: 149.5, producedWaterBpd: 26400, chokeOpeningPct: 66, manifoldPressurePsi: 2470 },
  { time: '12:00', crudeOilBpd: 84900, exportGasMmscfd: 148.8, producedWaterBpd: 26200, chokeOpeningPct: 65, manifoldPressurePsi: 2460 },
  { time: '14:00', crudeOilBpd: 84200, exportGasMmscfd: 148.0, producedWaterBpd: 26050, chokeOpeningPct: 65, manifoldPressurePsi: 2455 },
  { time: '16:00', crudeOilBpd: 84650, exportGasMmscfd: 148.6, producedWaterBpd: 26180, chokeOpeningPct: 65, manifoldPressurePsi: 2458 },
  { time: '18:00', crudeOilBpd: 85100, exportGasMmscfd: 149.2, producedWaterBpd: 26350, chokeOpeningPct: 66, manifoldPressurePsi: 2462 },
  { time: '20:00', crudeOilBpd: 84400, exportGasMmscfd: 148.1, producedWaterBpd: 26100, chokeOpeningPct: 65, manifoldPressurePsi: 2452 },
  { time: '22:00', crudeOilBpd: 83900, exportGasMmscfd: 147.3, producedWaterBpd: 25900, chokeOpeningPct: 64, manifoldPressurePsi: 2445 },
  { time: '24:00', crudeOilBpd: 84200, exportGasMmscfd: 148.0, producedWaterBpd: 26100, chokeOpeningPct: 65, manifoldPressurePsi: 2450 }
];

// 2. GHG Emissions Breakdown by Source (Tonnes CO2e per day)
export const INITIAL_GHG_EMISSIONS: GhgEmissionRecord[] = [
  {
    source: 'Dual-Fuel Turbogenerators (TG-1 & TG-2)',
    category: 'Turbogenerator Combustion',
    tonnesCo2ePerDay: 142.8,
    percentage: 62.4,
    color: '#3b82f6', // Blue
    mitigationStatus: 'Waste Heat Recovery Units (WHRU) online, 18% thermal fuel offset'
  },
  {
    source: 'HP / LP Production Flare Combustion',
    category: 'Flare Combustion',
    tonnesCo2ePerDay: 48.2,
    percentage: 21.1,
    color: '#f97316', // Amber / Orange
    mitigationStatus: 'Optical sonic flare meter calibrated; 98.4% destruction efficiency'
  },
  {
    source: 'Atmospheric Glycol & Produced Water Venting',
    category: 'Venting',
    tonnesCo2ePerDay: 24.6,
    percentage: 10.7,
    color: '#a855f7', // Purple
    mitigationStatus: 'Vapor Recovery Unit (VRU) suction maintaining < 15 mbar header pressure'
  },
  {
    source: 'Process Valves, Flanges & Compressor Seals',
    category: 'Fugitive Emissions',
    tonnesCo2ePerDay: 13.2,
    percentage: 5.8,
    color: '#10b981', // Emerald
    mitigationStatus: 'OGI infrared laser camera FLIR scan completed; 2 valve packings repacked'
  }
];

// 3. Storage & Export Logistics (Tanks 1-3 fill volume + Export Pipeline Flow)
export const INITIAL_STORAGE_LOGISTICS: StorageExportPoint[] = [
  { time: '00:00', tank1FillBbl: 198000, tank2FillBbl: 154000, tank3FillBbl: 88000, totalStorageBbl: 440000, exportPipelineFlowBpd: 84200, tankerOffloadingActive: false },
  { time: '04:00', tank1FillBbl: 202000, tank2FillBbl: 158000, tank3FillBbl: 94000, totalStorageBbl: 454000, exportPipelineFlowBpd: 84500, tankerOffloadingActive: false },
  { time: '08:00', tank1FillBbl: 206500, tank2FillBbl: 162500, tank3FillBbl: 99000, totalStorageBbl: 468000, exportPipelineFlowBpd: 85100, tankerOffloadingActive: false },
  { time: '12:00', tank1FillBbl: 211000, tank2FillBbl: 167000, tank3FillBbl: 104000, totalStorageBbl: 482000, exportPipelineFlowBpd: 84800, tankerOffloadingActive: false },
  { time: '16:00', tank1FillBbl: 185000, tank2FillBbl: 148000, tank3FillBbl: 96000, totalStorageBbl: 429000, exportPipelineFlowBpd: 112000, tankerOffloadingActive: true },
  { time: '20:00', tank1FillBbl: 160000, tank2FillBbl: 130000, tank3FillBbl: 86000, totalStorageBbl: 376000, exportPipelineFlowBpd: 115000, tankerOffloadingActive: true },
  { time: '24:00', tank1FillBbl: 172000, tank2FillBbl: 139000, tank3FillBbl: 92000, totalStorageBbl: 403000, exportPipelineFlowBpd: 84200, tankerOffloadingActive: false }
];

// 4. Asset Health & RUL (Remaining Useful Life % for Compressors & Pumps)
export const INITIAL_ROTATING_RUL: RotatingEquipmentRul[] = [
  {
    id: 'comp-hp',
    name: 'HP Export Gas Compressor Skid A',
    tag: 'K-201A',
    category: 'Gas Compression',
    rulPercent: 88,
    hoursToService: 6840,
    designLifeHours: 24000,
    vibrationRmsMmS: 3.4,
    vibrationLimitMmS: 4.5,
    bearingTempC: 78.5,
    bearingTempLimitC: 95.0,
    sealLeakageScfm: 0.82,
    sealLeakageLimitScfm: 1.50,
    dischargePressureBar: 185.0,
    dischargePressureRatingBar: 210.0,
    status: 'optimal',
    statusLabel: 'Operating Within Envelope',
    diagnosticFinding: 'Aerodynamic stage efficiency 89.2%. Dry gas seal nitrogen barrier pressure delta is normal (+2.4 bar).',
    recommendedAction: 'Continue 4,000-hour acoustic lube oil sampling cycle.'
  },
  {
    id: 'comp-lp',
    name: 'LP Booster Gas Compressor Skid',
    tag: 'K-101',
    category: 'Gas Compression',
    rulPercent: 74,
    hoursToService: 4210,
    designLifeHours: 20000,
    vibrationRmsMmS: 4.1,
    vibrationLimitMmS: 4.5,
    bearingTempC: 84.2,
    bearingTempLimitC: 92.0,
    sealLeakageScfm: 1.28,
    sealLeakageLimitScfm: 1.50,
    dischargePressureBar: 8.6,
    dischargePressureRatingBar: 12.0,
    status: 'warning',
    statusLabel: 'Seal Wear Advisory',
    diagnosticFinding: 'Drive-end tandem dry gas seal primary leakage rate elevated from 0.7 to 1.28 scfm over 14 days.',
    recommendedAction: 'Inspect seal buffer gas differential pressure transducer and schedule seal cartridge swap.'
  },
  {
    id: 'pump-crude-a',
    name: 'Main Crude Export Pump A',
    tag: 'P-101A',
    category: 'Crude Export Pumping',
    rulPercent: 62,
    hoursToService: 1950,
    designLifeHours: 18000,
    vibrationRmsMmS: 5.2,
    vibrationLimitMmS: 6.0,
    bearingTempC: 86.8,
    bearingTempLimitC: 90.0,
    dischargePressureBar: 112.4,
    dischargePressureRatingBar: 140.0,
    status: 'warning',
    statusLabel: 'Bearing Thermal Elevation',
    diagnosticFinding: 'Outboard radial bearing temperature running 7.5°C above twin pump P-101B. 1X vibration harmonics detected.',
    recommendedAction: 'Sample bearing synthetic lubricant for copper/tin metallic trace particulates.'
  },
  {
    id: 'pump-crude-b',
    name: 'Main Crude Export Pump B (Hot Standby)',
    tag: 'P-101B',
    category: 'Crude Export Pumping',
    rulPercent: 96,
    hoursToService: 8420,
    designLifeHours: 18000,
    vibrationRmsMmS: 2.1,
    vibrationLimitMmS: 6.0,
    bearingTempC: 64.1,
    bearingTempLimitC: 90.0,
    dischargePressureBar: 112.8,
    dischargePressureRatingBar: 140.0,
    status: 'optimal',
    statusLabel: 'Optimal Standby Readiness',
    diagnosticFinding: 'Motor stator resistance balanced (0.018 ohms). Auto-start transfer sequence tested and armed.',
    recommendedAction: 'Ready for duty transfer if Pump A reaches 88°C threshold.'
  },
  {
    id: 'tg-1',
    name: 'Offshore Turbogenerator Unit 1 (Dual-Fuel)',
    tag: 'TG-1',
    category: 'Power Generation',
    rulPercent: 82,
    hoursToService: 5200,
    designLifeHours: 32000,
    vibrationRmsMmS: 2.6,
    vibrationLimitMmS: 4.0,
    bearingTempC: 72.0,
    bearingTempLimitC: 95.0,
    dischargePressureBar: 24.5,
    dischargePressureRatingBar: 30.0,
    status: 'optimal',
    statusLabel: 'Generating 21.4 MW Load',
    diagnosticFinding: 'Combustion efficiency 99.1%. Running on clean fuel gas with automated diesel backup sync.',
    recommendedAction: 'Normal operation. Next scheduled air intake filter pulse clean in 72 hours.'
  }
];

// 5. Production Wellheads & Manifolds
export const INITIAL_WELLHEADS: OffshoreWellhead[] = [
  {
    id: 'wh-01',
    wellName: 'Well A-01 (Deep Upper Jurrasic)',
    slotNumber: 'Slot #01',
    zone: 'Subsea Manifold North',
    casingPressurePsi: 2480,
    tubingHeadPressurePsi: 1840,
    chokeValvePct: 68,
    flowlineTempC: 74.2,
    manifoldRoute: 'Production Header A',
    status: 'flowing',
    dailyCrudeBpd: 22400,
    bswCutPct: 18.2
  },
  {
    id: 'wh-02',
    wellName: 'Well A-02 (Cenomanian Sand)',
    slotNumber: 'Slot #02',
    zone: 'Subsea Manifold North',
    casingPressurePsi: 2360,
    tubingHeadPressurePsi: 1780,
    chokeValvePct: 62,
    flowlineTempC: 71.0,
    manifoldRoute: 'Production Header A',
    status: 'flowing',
    dailyCrudeBpd: 19800,
    bswCutPct: 22.5
  },
  {
    id: 'wh-03',
    wellName: 'Well B-01 (Lower Carbonate Ridge)',
    slotNumber: 'Slot #05',
    zone: 'Subsea Manifold South',
    casingPressurePsi: 2590,
    tubingHeadPressurePsi: 1920,
    chokeValvePct: 71,
    flowlineTempC: 78.6,
    manifoldRoute: 'Production Header B',
    status: 'flowing',
    dailyCrudeBpd: 26200,
    bswCutPct: 14.8
  },
  {
    id: 'wh-04',
    wellName: 'Well B-02 (Peripheral Flank)',
    slotNumber: 'Slot #06',
    zone: 'Subsea Manifold South',
    casingPressurePsi: 2180,
    tubingHeadPressurePsi: 1540,
    chokeValvePct: 48,
    flowlineTempC: 66.4,
    manifoldRoute: 'Test Separator',
    status: 'testing',
    dailyCrudeBpd: 15800,
    bswCutPct: 38.4
  },
  {
    id: 'wh-05',
    wellName: 'Well C-01 (Deep Subsea Flank)',
    slotNumber: 'Slot #07',
    zone: 'Subsea Manifold South',
    casingPressurePsi: 2420,
    tubingHeadPressurePsi: 1760,
    chokeValvePct: 56,
    flowlineTempC: 69.8,
    manifoldRoute: 'Production Header B',
    status: 'flowing',
    dailyCrudeBpd: 18400,
    bswCutPct: 19.5
  }
];

// 6. Production & Test Separators
export const INITIAL_SEPARATORS: OffshoreSeparator[] = [
  {
    id: 'sep-01',
    name: '1st Stage 3-Phase Production Separator',
    tag: 'V-101',
    type: '3-Phase Production Separator',
    operatingPressureBar: 82.4,
    pressureLimitBar: 95.0,
    liquidLevelPct: 56.4,
    oilLevelPct: 38.2,
    waterCutBswPct: 22.8,
    gasOutletRateMmscfd: 114.2,
    sandAccumulationPct: 8.5,
    status: 'normal',
    efficiencyPct: 98.6
  },
  {
    id: 'sep-02',
    name: '2nd Stage Intermediate Degasser Separator',
    tag: 'V-102',
    type: '3-Phase Production Separator',
    operatingPressureBar: 24.8,
    pressureLimitBar: 35.0,
    liquidLevelPct: 51.0,
    oilLevelPct: 44.0,
    waterCutBswPct: 7.2,
    gasOutletRateMmscfd: 33.8,
    sandAccumulationPct: 4.1,
    status: 'normal',
    efficiencyPct: 99.2
  },
  {
    id: 'sep-test',
    name: 'Wellhead Test Separator & Coriolis Skid',
    tag: 'V-105',
    type: 'Test Separator & Metering Skid',
    operatingPressureBar: 80.2,
    pressureLimitBar: 100.0,
    liquidLevelPct: 54.0,
    oilLevelPct: 32.0,
    waterCutBswPct: 38.4,
    gasOutletRateMmscfd: 18.5,
    sandAccumulationPct: 14.2,
    status: 'attention',
    efficiencyPct: 96.8
  }
];

// 7. Storage Tanks 1, 2, 3
export const INITIAL_STORAGE_TANKS: OffshoreStorageTank[] = [
  {
    id: 'tank-1',
    name: 'FPSO Cargo Storage Tank 1 (Center)',
    cargoCapacityBbl: 250000,
    currentStockBbl: 205000,
    fillPercentage: 82.0,
    ullageMeters: 3.2,
    tankTemperatureC: 38.4,
    inertGasPressureMbar: 22.5,
    status: 'filling'
  },
  {
    id: 'tank-2',
    name: 'FPSO Cargo Storage Tank 2 (Port)',
    cargoCapacityBbl: 250000,
    currentStockBbl: 162500,
    fillPercentage: 65.0,
    ullageMeters: 6.8,
    tankTemperatureC: 37.8,
    inertGasPressureMbar: 23.0,
    status: 'filling'
  },
  {
    id: 'tank-3',
    name: 'FPSO Cargo Storage Tank 3 (Starboard)',
    cargoCapacityBbl: 250000,
    currentStockBbl: 102500,
    fillPercentage: 41.0,
    ullageMeters: 11.4,
    tankTemperatureC: 36.9,
    inertGasPressureMbar: 21.8,
    status: 'holding'
  }
];

// 8. Export Systems & Subsea Pig Launcher
export const INITIAL_EXPORT_SYSTEM: OffshoreExportSystem = {
  pipelineName: 'Gulf Deepwater 16" Subsea Export Trunkline',
  diameterInches: 16,
  lengthMiles: 84.5,
  currentFlowBpd: 84200,
  designCapacityBpd: 120000,
  inletPressureBar: 112.4,
  exportGasPressureBar: 185.0,
  pigLauncherStatus: 'Ready',
  lastPigInspectionDate: '02/14/2026',
  corrosionRateMmPerYear: 0.04
};

// 9. Turbogenerators & Flare Stack
export const INITIAL_FLARE_SYSTEM: OffshoreFlareSystem = {
  hpFlareRateMmscfd: 1.85,
  lpFlareRateMmscfd: 0.42,
  combustionEfficiencyPct: 98.4,
  purgeGasVelocityMs: 0.18,
  pilotFlameStatus: 'All 3 Pilots Active',
  dailyCo2eTonnes: 48.2,
  regulatoryCeilingTonnes: 65.0,
  smokeOpacityPct: 0.8
};

// 10. Offshore Cases / Permits / Work Orders
export const INITIAL_OG_CASES: OgCaseItem[] = [
  {
    id: 'OG-001',
    title: 'LP Booster Gas Compressor Seal Gas Leakage Elevation',
    equipment: 'LP Booster Compressor (K-101)',
    equipmentTag: 'K-101',
    assignee: 'Marcus Vance (Senior Rotating Equipment Lead)',
    severity: 'High',
    status: 'Diagnosing',
    timestamp: '2 hours ago',
    rootCause: 'Primary vent seal leakage rose to 1.28 scfm. Buffer nitrogen regulator diaphragm shows slight hysteresis.',
    permitRequired: 'Cold Work Permit',
    requiredParts: ['John Crane Type 2800 Dry Gas Seal Cartridge', 'Nitrogen Regulator Rebuild Kit', 'Elastomeric O-Rings Viton-90'],
    estimatedTime: '4.0 Hours',
    metricName: 'Seal Leakage',
    observedValue: '1.28 scfm (Limit: 1.50 scfm)',
    thresholdValue: '1.50 scfm Max Allowable',
    telemetryPoints: [
      { time: '08:00', value: 0.72, baseline: 1.50, unit: 'scfm' },
      { time: '10:00', value: 0.94, baseline: 1.50, unit: 'scfm' },
      { time: '12:00', value: 1.15, baseline: 1.50, unit: 'scfm' },
      { time: '14:00', value: 1.28, baseline: 1.50, unit: 'scfm' }
    ]
  },
  {
    id: 'OG-002',
    title: 'Crude Export Pump A Bearing Temperature High Advisory',
    equipment: 'Main Oil Export Pump A (P-101A)',
    equipmentTag: 'P-101A',
    assignee: 'Sarah Lin (Offshore Mechanical Lead)',
    severity: 'Medium',
    status: 'Planned Maintenance',
    timestamp: '5 hours ago',
    rootCause: 'Outboard radial bearing temperature elevated to 86.8°C due to micro-particulate build-up in lube reservoir.',
    permitRequired: 'Cold Work Permit',
    requiredParts: ['Mobil SHC 626 Synthetic Bearing Oil (20L)', 'Duplex Micron Lube Filter Core', 'PT100 RTD Sensor Probe'],
    estimatedTime: '2.5 Hours',
    metricName: 'Bearing Temp',
    observedValue: '86.8°C (Limit: 90.0°C)',
    thresholdValue: '90.0°C Alarm Threshold',
    telemetryPoints: [
      { time: '08:00', value: 74.0, baseline: 90.0, unit: '°C' },
      { time: '10:00', value: 79.5, baseline: 90.0, unit: '°C' },
      { time: '12:00', value: 83.2, baseline: 90.0, unit: '°C' },
      { time: '14:00', value: 86.8, baseline: 90.0, unit: '°C' }
    ]
  },
  {
    id: 'OG-003',
    title: 'Test Separator Sand Jetting & Desanding Flush',
    equipment: 'Wellhead Test Separator (V-105)',
    equipmentTag: 'V-105',
    assignee: 'David Kalu (Process Operations Supervisor)',
    severity: 'Low',
    status: 'Unassigned',
    timestamp: '1 day ago',
    rootCause: 'Sand accumulation level reached 14.2% following Well B-02 choke step-up test.',
    permitRequired: 'Hot Work Permit',
    requiredParts: ['Sand Cyclone Desander Liner', 'High-Pressure Hydrocyclone Flushing Nozzles'],
    estimatedTime: '3.0 Hours',
    metricName: 'Sand Bed Level',
    observedValue: '14.2% (Limit: 20.0%)',
    thresholdValue: '20.0% Cleanout Trigger',
    telemetryPoints: [
      { time: '04:00', value: 8.5, baseline: 20.0, unit: '%' },
      { time: '08:00', value: 10.2, baseline: 20.0, unit: '%' },
      { time: '12:00', value: 12.8, baseline: 20.0, unit: '%' },
      { time: '14:00', value: 14.2, baseline: 20.0, unit: '%' }
    ]
  }
];
