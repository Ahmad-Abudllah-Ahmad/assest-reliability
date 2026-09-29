import { 
  DemandPoint, 
  BessStatus, 
  GenerationMixItem, 
  FleetAsset, 
  HeatRatePoint, 
  Scope1Emissions, 
  Recommendation,
  Facility
} from '../types';

export const FACILITIES: Facility[] = [
  { id: 'unit-4-main', name: 'Apex Central Plant — Unit 4', region: 'ERCOT North Hub', capacityMW: 650, type: 'Combined Cycle + BESS' },
  { id: 'substation-alpha', name: 'Substation Alpha Transmission Hub', region: 'MISO Zone 7', capacityMW: 420, type: 'High Voltage Step-Down' },
  { id: 'highland-wind-bess', name: 'Highland Ridge Hybrid Park', region: 'CAISO SP-15', capacityMW: 380, type: 'Solar PV + Wind + BESS' }
];

export const INITIAL_DEMAND_CURVE: DemandPoint[] = [
  { time: '00:00', actualMW: 310, forecastMW: 315, upperBand: 335, lowerBand: 295, solarMW: 0, windMW: 140, gasPeakerMW: 110, bessFlowMW: -15, lmpPrice: 28.5 },
  { time: '02:00', actualMW: 285, forecastMW: 290, upperBand: 310, lowerBand: 270, solarMW: 0, windMW: 155, gasPeakerMW: 90, bessFlowMW: -20, lmpPrice: 22.0 },
  { time: '04:00', actualMW: 270, forecastMW: 275, upperBand: 295, lowerBand: 255, solarMW: 0, windMW: 160, gasPeakerMW: 85, bessFlowMW: -20, lmpPrice: 19.8 },
  { time: '06:00', actualMW: 340, forecastMW: 335, upperBand: 360, lowerBand: 315, solarMW: 15, windMW: 135, gasPeakerMW: 140, bessFlowMW: 0, lmpPrice: 42.1 },
  { time: '08:00', actualMW: 420, forecastMW: 425, upperBand: 450, lowerBand: 400, solarMW: 85, windMW: 110, gasPeakerMW: 180, bessFlowMW: 0, lmpPrice: 58.4 },
  { time: '10:00', actualMW: 460, forecastMW: 455, upperBand: 485, lowerBand: 430, solarMW: 145, windMW: 85, gasPeakerMW: 190, bessFlowMW: -10, lmpPrice: 48.2 },
  { time: '12:00', actualMW: 495, forecastMW: 490, upperBand: 520, lowerBand: 465, solarMW: 170, windMW: 70, gasPeakerMW: 215, bessFlowMW: -25, lmpPrice: 38.6 },
  { time: '14:00', actualMW: 525, forecastMW: 530, upperBand: 560, lowerBand: 500, solarMW: 155, windMW: 80, gasPeakerMW: 245, bessFlowMW: 0, lmpPrice: 65.0 },
  { time: '16:00', forecastMW: 580, upperBand: 615, lowerBand: 550, solarMW: 95, windMW: 105, gasPeakerMW: 290, bessFlowMW: 15, lmpPrice: 94.5 },
  { time: '18:00', forecastMW: 640, upperBand: 680, lowerBand: 605, solarMW: 20, windMW: 130, gasPeakerMW: 370, bessFlowMW: 25, lmpPrice: 148.0 },
  { time: '20:00', forecastMW: 590, upperBand: 625, lowerBand: 560, solarMW: 0, windMW: 165, gasPeakerMW: 320, bessFlowMW: 20, lmpPrice: 112.4 },
  { time: '22:00', forecastMW: 440, upperBand: 470, lowerBand: 415, solarMW: 0, windMW: 175, gasPeakerMW: 210, bessFlowMW: 0, lmpPrice: 52.0 },
];

export const INITIAL_BESS_STATUS: BessStatus = {
  capacityMWh: 100,
  currentStorageMWh: 78,
  socPercent: 78,
  powerMW: 25,
  state: 'DISCHARGING',
  todayArbitrageSavings: 4820,
  cycleCount: 1.4,
  cellMaxTempC: 31.4,
  targetPeakCutMW: 25,
  autoMode: true
};

export const INITIAL_GENERATION_MIX: GenerationMixItem[] = [
  { name: 'Combined Gas Peakers', valueMW: 245, percent: 46.7, color: '#3B82F6' },
  { name: 'Solar PV Array', valueMW: 155, percent: 29.5, color: '#F59E0B' },
  { name: 'Wind Turbines', valueMW: 80, percent: 15.2, color: '#10B981' },
  { name: 'BESS Arbitrage Flow', valueMW: 25, percent: 4.8, color: '#8B5CF6' },
  { name: 'Grid Interconnect', valueMW: 20, percent: 3.8, color: '#64748B' }
];

export const INITIAL_FLEET_ASSETS: FleetAsset[] = [
  {
    id: 'gt-01',
    name: 'Gas Turbine #1 (Heavy Frame)',
    type: 'Gas Turbine',
    status: 'OPTIMAL',
    unitTag: 'GEN-GT-01',
    currentLoadMW: 185,
    capacityMW: 210,
    frequencyHz: 59.99,
    busVoltageKV: 138.1,
    heatRateBtu: 8620,
    windingTempC: 76.2,
    topOilTempC: 62.0,
    vibrationMms: 1.8,
    failureRiskPercent: 7.4,
    failureMode: 'Normal Baseline Wear',
    degradationRate: '+0.2% / month',
    daysToMaintenance: 142,
    sparklineHistory: [180, 182, 184, 185, 185, 186, 185]
  },
  {
    id: 'gt-02',
    name: 'Gas Turbine #2 (Aeroderivative Peaker)',
    type: 'Gas Turbine',
    status: 'WARNING',
    unitTag: 'GEN-GT-02',
    currentLoadMW: 142,
    capacityMW: 160,
    frequencyHz: 59.96,
    busVoltageKV: 137.8,
    heatRateBtu: 9140,
    windingTempC: 88.5,
    topOilTempC: 71.3,
    vibrationMms: 3.9,
    failureRiskPercent: 42.8,
    failureMode: 'Exhaust Thermocouple Differential Drift',
    degradationRate: '+1.4% / month',
    daysToMaintenance: 18,
    sparklineHistory: [135, 138, 140, 144, 141, 143, 142]
  },
  {
    id: 'xfmr-04',
    name: 'Substation Step-Up Transformer T-04',
    type: 'Substation Transformer',
    status: 'CRITICAL',
    unitTag: 'XFMR-345/138-04',
    currentLoadMW: 320,
    capacityMW: 350,
    frequencyHz: 59.98,
    busVoltageKV: 138.4,
    windingTempC: 98.4,
    topOilTempC: 84.1,
    vibrationMms: 2.1,
    failureRiskPercent: 74.2,
    failureMode: 'Winding Hotspot Insulation Loss-of-Life',
    degradationRate: '+3.8x IEEE Life Loss Factor',
    daysToMaintenance: 4,
    sparklineHistory: [86, 88, 91, 94, 96, 97, 98.4]
  },
  {
    id: 'inv-b',
    name: 'Solar Inverter Bank B (Central Array)',
    type: 'Inverter Bank',
    status: 'OPTIMAL',
    unitTag: 'INV-PV-B',
    currentLoadMW: 45,
    capacityMW: 50,
    frequencyHz: 60.01,
    busVoltageKV: 34.5,
    windingTempC: 54.0,
    vibrationMms: 0.4,
    failureRiskPercent: 11.5,
    failureMode: 'DC Bus Capacitor Ripple Stability',
    degradationRate: '+0.4% / month',
    daysToMaintenance: 98,
    sparklineHistory: [38, 42, 45, 48, 46, 45, 45]
  },
  {
    id: 'bess-enc-3',
    name: 'BESS Enclosure Tier 3 (LFP Modules)',
    type: 'BESS Enclosure',
    status: 'OPTIMAL',
    unitTag: 'BESS-MOD-03',
    currentLoadMW: 25,
    capacityMW: 25,
    frequencyHz: 60.00,
    busVoltageKV: 34.5,
    windingTempC: 31.4,
    failureRiskPercent: 8.9,
    failureMode: 'Cell Voltage Balancing Dispersion',
    degradationRate: '+0.1% / month',
    daysToMaintenance: 210,
    sparklineHistory: [20, 22, 25, 25, 25, 24, 25]
  }
];

export const INITIAL_HEAT_RATE_DATA: HeatRatePoint[] = [
  { loadPercent: 40, actualHeatRate: 10450, designHeatRate: 9800, thermalEfficiencyPercent: 32.7 },
  { loadPercent: 50, actualHeatRate: 9820,  designHeatRate: 9350, thermalEfficiencyPercent: 34.7 },
  { loadPercent: 60, actualHeatRate: 9280,  designHeatRate: 8950, thermalEfficiencyPercent: 36.8 },
  { loadPercent: 70, actualHeatRate: 8910,  designHeatRate: 8700, thermalEfficiencyPercent: 38.3 },
  { loadPercent: 80, actualHeatRate: 8680,  designHeatRate: 8520, thermalEfficiencyPercent: 39.3 },
  { loadPercent: 90, actualHeatRate: 8540,  designHeatRate: 8410, thermalEfficiencyPercent: 40.0 },
  { loadPercent: 100, actualHeatRate: 8490, designHeatRate: 8350, thermalEfficiencyPercent: 40.2 },
];

export const INITIAL_EMISSIONS: Scope1Emissions = {
  scope1Intensity: 0.382,
  regulatoryCap: 0.420,
  dailyEmissionsTons: 1420.5,
  cleanEnergyPercent: 44.7,
  carbonCreditsUSD: 14850,
  airFuelRatioOptimized: false,
  noxPpm: 12.8,
  coPpm: 8.2
};

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-701',
    assetId: 'bess-enc-3',
    assetName: 'BESS Enclosure Tier 3',
    title: 'Pre-charge 25 MW BESS prior to 17:00 Peak LMP Spike',
    category: 'DISPATCH',
    actionProposed: 'Charge BESS at 20 MW rate between 13:00-15:30 using low-cost solar surplus ($38/MWh), then discharge 25 MW into the 18:00 evening peak ($148/MWh).',
    financialSavingsPerHour: 2750,
    totalProjectedSavings: 8250,
    gridReliabilityImpact: '+18.4 MW Spinning Reserve Cushion',
    riskScore: 12,
    status: 'NEEDS_APPROVAL',
    confidenceScore: 96.4,
    urgency: 'HIGH',
    timestamp: '14:32 Today',
    evidence: {
      primaryDrivers: [
        'Day-Ahead LMP Spread: Peak projected at $148.00/MWh vs current solar trough at $38.60/MWh.',
        'Battery Degradation Marginal Cost: Evaluated at $16.80/MWh, netting +$92.60/MWh profit arbitrage.',
        'Solar Curtailment Avoidance: Absorbs 42 MWh of localized high-voltage solar oversupply.'
      ],
      tradeOffs: [
        { metric: 'Arbitrage Revenue', statusQuo: '$0 (Idle)', recommended: '+$8,250 net gain', benefit: '+$8,250', positive: true },
        { metric: 'Peak Grid Stress', statusQuo: '96% Feeder Limit', recommended: '81% Feeder Limit', benefit: '-15% congestion', positive: true },
        { metric: 'BESS Degradation', statusQuo: '0.00% daily wear', recommended: '0.018% equivalent cycle', benefit: 'Nominal wear ($420)', positive: false },
        { metric: 'Local Carbon Intensity', statusQuo: '0.412 tCO2e/MWh', recommended: '0.368 tCO2e/MWh', benefit: '-10.7% emissions', positive: true }
      ],
      marketEconomics: {
        lmpSpread: '$109.40 / MWh spread',
        fuelSavings: '$4,120 gas fuel displaced',
        assetWearCost: '-$420 cell cycle wear',
        netBenefitHourly: '+$2,750 / operating hour'
      },
      sensitivity: {
        confidencePct: 96.4,
        rollbackTimeMinutes: 2,
        sensorSignals: [
          { name: 'Forecast Peak LMP', value: '$148.00', threshold: '>$85.00 triggers charge', status: 'ANOMALOUS' },
          { name: 'BESS State of Charge', value: '78%', threshold: 'Min 20%, Max 95%', status: 'NORMAL' },
          { name: 'Battery Core Temp', value: '31.4°C', threshold: '<45.0°C thermal limit', status: 'NORMAL' }
        ]
      },
      rootCause: 'High evening residential ramp demand combined with sudden solar drop-off (Duck Curve).'
    }
  },
  {
    id: 'REC-702',
    assetId: 'xfmr-04',
    assetName: 'Substation Transformer T-04',
    title: 'Transfer 12 MW Feeder Load to alleviate Winding Thermal Surge',
    category: 'MAINTENANCE',
    actionProposed: 'Shed 12 MW from Feeder 7 onto adjacent Busbar 3 to curtail winding temperature ramp from +1.8°C/hr down to equilibrium (82°C).',
    financialSavingsPerHour: 1840,
    totalProjectedSavings: 64000,
    gridReliabilityImpact: 'Prevents Catastrophic Buchholz Relay Trip (Loss of 320 MW)',
    riskScore: 78,
    status: 'NEEDS_APPROVAL',
    confidenceScore: 94.1,
    urgency: 'HIGH',
    timestamp: '14:28 Today',
    evidence: {
      primaryDrivers: [
        'Winding Temperature: Current 98.4°C (Design rating 85°C standard; IEEE C57 thermal limit is 105°C).',
        'Top-Oil Temperature Ramp: Climbing at +1.8°C per hour under 91.4% nameplate load.',
        'Insulation Accelerated Aging: Running at 3.8x normal life loss factor.'
      ],
      tradeOffs: [
        { metric: 'Winding Temperature', statusQuo: '98.4°C (rising)', recommended: '82.5°C (steady)', benefit: '-15.9°C cooldown', positive: true },
        { metric: 'Trip Probability (2h)', statusQuo: '68% thermal trip', recommended: '<2% trip risk', benefit: 'Avoids 320 MW blackout', positive: true },
        { metric: 'Switching Transient', statusQuo: 'None', recommended: 'Brief ±0.4 kV step', benefit: 'Within IEEE 1159 spec', positive: false },
        { metric: 'Avoided Replacement', statusQuo: '$1.4M rewinding risk', recommended: '$0 asset damage', benefit: 'Preserves transformer core', positive: true }
      ],
      marketEconomics: {
        lmpSpread: 'Neutral feeder transfer',
        fuelSavings: 'Avoids peaker emergency spin',
        assetWearCost: '-$64,000 avoided damage',
        netBenefitHourly: '+$1,840 / hour reliability value'
      },
      sensitivity: {
        confidencePct: 94.1,
        rollbackTimeMinutes: 5,
        sensorSignals: [
          { name: 'Winding Hotspot Temp', value: '98.4°C', threshold: 'Max continuous 85.0°C', status: 'ANOMALOUS' },
          { name: 'Top-Oil Temperature', value: '84.1°C', threshold: 'Warning at 75.0°C', status: 'ANOMALOUS' },
          { name: 'Dissolved Gas (H2)', value: '142 ppm', threshold: '<100 ppm normal', status: 'ELEVATED' }
        ]
      },
      rootCause: 'Sustained industrial pump inductive load on Feeder 7 paired with 34°C ambient weather.'
    }
  },
  {
    id: 'REC-703',
    assetId: 'gt-02',
    assetName: 'Gas Turbine #2',
    title: 'Optimize Air-to-Fuel Ratio for Low-NOx Combustion Mode',
    category: 'EFFICIENCY',
    actionProposed: 'Trim fuel control valve trim by -1.8% and step up premix combustor pressure to suppress NOx flame temperatures while maintaining 142 MW output.',
    financialSavingsPerHour: 480,
    totalProjectedSavings: 2880,
    gridReliabilityImpact: 'Preserves Continuous Environmental Permit Compliance',
    riskScore: 24,
    status: 'NEEDS_APPROVAL',
    confidenceScore: 91.8,
    urgency: 'MEDIUM',
    timestamp: '14:15 Today',
    evidence: {
      primaryDrivers: [
        'Scope 1 Intensity: 0.382 tCO2e/MWh approaching quarterly regional allowance limit.',
        'NOx Exhaust: Hovering at 12.8 ppm (Rolling 3-hr legal cap is 15.0 ppm).',
        'Combustor Dynamic Stability: Lean blow-out margin is generous at 18.2% headroom.'
      ],
      tradeOffs: [
        { metric: 'NOx Emissions', statusQuo: '12.8 ppm (warning zone)', recommended: '8.4 ppm (safe)', benefit: '-34% NOx reduction', positive: true },
        { metric: 'Heat Rate Efficiency', statusQuo: '9,140 BTU/kWh', recommended: '9,010 BTU/kWh', benefit: '+1.4% thermal efficiency', positive: true },
        { metric: 'Combustion Dynamic Risk', statusQuo: '1.2 psi acoustic RMS', recommended: '1.6 psi acoustic RMS', benefit: 'Well under 3.5 psi trip', positive: false },
        { metric: 'Compliance Penalty Risk', statusQuo: '$25,000 fine exposure', recommended: '$0 penalty risk', benefit: 'Clean regulatory buffer', positive: true }
      ],
      marketEconomics: {
        lmpSpread: 'No curtailment required',
        fuelSavings: '+$380 / hr natural gas saved',
        assetWearCost: 'Zero mechanical penalty',
        netBenefitHourly: '+$480 / operating hour'
      },
      sensitivity: {
        confidencePct: 91.8,
        rollbackTimeMinutes: 1,
        sensorSignals: [
          { name: 'NOx Stack Monitor', value: '12.8 ppm', threshold: '15.0 ppm legal limit', status: 'ELEVATED' },
          { name: 'Combustor Acoustic RMS', value: '1.2 psi', threshold: '<3.5 psi trip limit', status: 'NORMAL' },
          { name: 'Fuel Gas Pressure', value: '382 psig', threshold: '370 - 400 psig nominal', status: 'NORMAL' }
        ]
      },
      rootCause: 'Ambient inlet air moisture drop altered stoichiometric burn temperature in Combustor Can #3.'
    }
  },
  {
    id: 'REC-704',
    assetId: 'highland-wind-bess',
    assetName: 'Highland Ridge Hybrid Park',
    title: 'Curtain 15 MW Wind Generation to avoid Negative Real-Time LMP',
    category: 'DISPATCH',
    actionProposed: 'Pitch wind rotor blades on Array 4 to throttle output from 80 MW down to 65 MW during scheduled 30-minute transmission congestion window.',
    financialSavingsPerHour: 620,
    totalProjectedSavings: 1240,
    gridReliabilityImpact: 'Prevents Substation 138kV Overvoltage Violation',
    riskScore: 18,
    status: 'NEEDS_APPROVAL',
    confidenceScore: 89.5,
    urgency: 'LOW',
    timestamp: '13:50 Today',
    evidence: {
      primaryDrivers: [
        'Real-time LMP: Cleared at -$14.20/MWh on Highland Bus due to downstream transmission line maintenance.',
        'Paying to Generate: Unhedged merchant generation incurs negative revenue without curtailment.',
        'BESS Ingestion Cap: Local batteries already charging at max C-rate.'
      ],
      tradeOffs: [
        { metric: 'Merchant Revenue Loss', statusQuo: '-$1,136 penalty fee', recommended: '$0 fee', benefit: 'Saves -$14.20/MWh fee', positive: true },
        { metric: 'Clean Energy Yield', statusQuo: '80 MW green output', recommended: '65 MW green output', benefit: '-15 MW green curtailment', positive: false },
        { metric: 'Line Thermal Headroom', statusQuo: '98.5% line rating', recommended: '86.0% line rating', benefit: '+12.5% safety margin', positive: true }
      ],
      marketEconomics: {
        lmpSpread: 'Negative LMP evasion',
        fuelSavings: '$0 (zero fuel cost)',
        assetWearCost: 'Minimal blade pitch wear',
        netBenefitHourly: '+$620 / hour avoided cost'
      },
      sensitivity: {
        confidencePct: 89.5,
        rollbackTimeMinutes: 1,
        sensorSignals: [
          { name: 'Substation Bus LMP', value: '-$14.20/MWh', threshold: '<$0.00 negative alert', status: 'ANOMALOUS' },
          { name: 'Transmission Line 44 Load', value: '98.5%', threshold: '<90.0% safe limit', status: 'ANOMALOUS' }
        ]
      },
      rootCause: 'Downstream 230kV line scheduled maintenance combined with 28 mph wind front.'
    }
  }
];
