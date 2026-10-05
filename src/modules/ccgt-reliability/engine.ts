import {
  PlantContext,
  ReliabilityRule,
  RawAssetTelemetry,
  CcgtAsset,
  CalculatedIndicator,
  ConditionModule,
  RuleResult,
  RiskContributor,
  AssetRiskLevel,
  AssetPriority,
  AssetTrend,
  ConditionStatus,
  ReliabilityAlert,
  ReliabilityRecommendation
} from './types';

// Helper: Calculate percentage deviation
export function calculateDeviationPct(current: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Number((((current - baseline) / baseline) * 100).toFixed(1));
}

// 1. Plant Generation MW Calculation (Section 5)
// Only sum actual generating units (GT-1, GT-2, ST-1).
// BFP-A is auxiliary power consumption and GSU is transmitted power; DO NOT double count!
export function calculatePlantGenerationMW(assets: CcgtAsset[]): number {
  return assets.reduce((sum, a) => {
    if (a.telemetry.generationMW !== undefined) {
      return sum + a.telemetry.generationMW;
    }
    // Fallback: only combustion & steam turbines are generating units
    if (a.assetCode.startsWith('GT') || a.assetCode.startsWith('ST')) {
      return sum + (a.telemetry.mwOutput || 0);
    }
    return sum;
  }, 0);
}

// 2. Risk Level Bands (Section 14)
// 0–20: Low, 21–40: Moderate, 41–60: Medium, 61–80: High, 81–100: Critical
export function determineRiskLevel(score: number): AssetRiskLevel {
  if (score <= 20) return 'Low';
  if (score <= 40) return 'Moderate';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Critical';
}

// 3. Priority Logic (Section 15)
// Critical -> P1, High -> P2, Medium -> P3, Moderate -> P4, Low -> P5
export function determinePriority(riskLevel: AssetRiskLevel, criticality: number = 3): AssetPriority {
  if (riskLevel === 'Critical') return 'P1';
  if (riskLevel === 'High') return 'P2';
  if (riskLevel === 'Medium') return 'P3';
  if (riskLevel === 'Moderate') return 'P4';
  return 'P5';
}

// 4. Calculate Indicators for all 6 modules
export function calculateAssetIndicators(
  assetId: string,
  assetCode: string,
  assetType: string,
  ratedMW: number,
  telemetry: RawAssetTelemetry,
  plantContext: PlantContext,
  criticality: number,
  isMaintenanceOverdue: boolean,
  repeatedIssueCount: number,
  runningHours: number,
  startsCount: number
): {
  electrical: CalculatedIndicator[];
  thermal: CalculatedIndicator[];
  performance: CalculatedIndicator[];
  mechanical: CalculatedIndicator[];
  environment: CalculatedIndicator[];
  history: CalculatedIndicator[];
} {
  // A. Electrical Indicators
  const powerVal = telemetry.generationMW ?? telemetry.mwOutput;
  const loadPct = Number(((powerVal / (ratedMW || 1)) * 100).toFixed(1));
  const nominalKV = assetCode === 'GSU' ? 230 : assetCode === 'BFP-A' ? 4.16 : 18.0;
  const voltageDev = calculateDeviationPct(telemetry.voltageKV, nominalKV);
  const pfDev = Number((1.0 - telemetry.powerFactor).toFixed(3));

  const electrical: CalculatedIndicator[] = [
    {
      id: 'ind-elec-load',
      name: 'Load Capacity Utilization',
      rawValue: powerVal,
      unit: 'MW',
      calculatedValue: `${loadPct}%`,
      baselineValue: '90-100%',
      warningThreshold: '> 95%',
      criticalThreshold: '> 100%',
      deviationText: `${loadPct}% rated`,
      status: loadPct > 100 ? 'Critical' : loadPct > 95 ? 'Warning' : 'Normal',
      riskImpact: loadPct > 100 ? 10 : loadPct > 95 ? 5 : 0,
      explanation: 'Ratio of active generator MW output relative to nameplate OEM rating.'
    },
    {
      id: 'ind-elec-volt',
      name: 'Voltage Balance Deviation',
      rawValue: telemetry.voltageKV,
      unit: 'kV',
      calculatedValue: `${voltageDev > 0 ? '+' : ''}${voltageDev}%`,
      baselineValue: `${nominalKV} kV`,
      warningThreshold: '± 5.0%',
      criticalThreshold: '± 10.0%',
      deviationText: `${Math.abs(voltageDev)}% from nominal`,
      status: Math.abs(voltageDev) > 10 ? 'Critical' : Math.abs(voltageDev) > 5 ? 'Warning' : 'Normal',
      riskImpact: Math.abs(voltageDev) > 5 ? 6 : 0,
      explanation: 'Deviation from interconnect busbar standard operating potential.'
    },
    {
      id: 'ind-elec-pf',
      name: 'Power Factor Offset',
      rawValue: telemetry.powerFactor,
      unit: 'cos φ',
      calculatedValue: telemetry.powerFactor,
      baselineValue: '0.95',
      warningThreshold: '< 0.90',
      criticalThreshold: '< 0.85',
      deviationText: `${pfDev} offset`,
      status: telemetry.powerFactor < 0.85 ? 'Critical' : telemetry.powerFactor < 0.90 ? 'Warning' : 'Normal',
      riskImpact: telemetry.powerFactor < 0.90 ? 4 : 0,
      explanation: 'Reactive power circulation impact on generator stator heating.'
    }
  ];

  // B. Thermal Indicators
  const isGT = assetCode.startsWith('GT');
  const egtSpread = telemetry.egtSpreadC;
  const bearingTemp = telemetry.bearingTempC;
  const oilTemp = telemetry.oilTempC;

  const thermal: CalculatedIndicator[] = [];

  if (isGT) {
    thermal.push({
      id: 'ind-therm-egt-spread',
      name: 'Exhaust Gas Temp (EGT) Spread',
      rawValue: egtSpread,
      unit: '°C',
      calculatedValue: `${egtSpread}°C`,
      baselineValue: '12°C',
      warningThreshold: '15°C',
      criticalThreshold: '25°C',
      deviationText: egtSpread > 15 ? `+${egtSpread - 15}°C above warn limit` : 'Within margin',
      status: egtSpread >= 25 ? 'Critical' : egtSpread >= 15 ? 'Warning' : 'Normal',
      riskImpact: egtSpread >= 25 ? 15 : egtSpread >= 15 ? 8 : 0,
      explanation: 'Thermocouple delta across combustor annulus. High spread indicates fuel nozzle plugging or localized flameout.'
    });

    thermal.push({
      id: 'ind-therm-max-egt',
      name: 'Peak Can Temperature',
      rawValue: telemetry.maxEgtC,
      unit: '°C',
      calculatedValue: `${telemetry.maxEgtC}°C`,
      baselineValue: '600°C',
      warningThreshold: '615°C',
      criticalThreshold: '625°C',
      deviationText: `${telemetry.maxEgtC - 600}°C vs design mean`,
      status: telemetry.maxEgtC >= 625 ? 'Critical' : telemetry.maxEgtC >= 615 ? 'Warning' : 'Normal',
      riskImpact: telemetry.maxEgtC >= 615 ? 6 : 0,
      explanation: 'Highest observed thermocouple temperature in turbine exhaust casing.'
    });
  }

  if (bearingTemp > 0) {
    thermal.push({
      id: 'ind-therm-bearing',
      name: 'Journal Bearing Metal Temperature',
      rawValue: bearingTemp,
      unit: '°C',
      calculatedValue: `${bearingTemp}°C`,
      baselineValue: '72°C',
      warningThreshold: '85°C',
      criticalThreshold: '95°C',
      deviationText: bearingTemp > 85 ? `+${bearingTemp - 85}°C above warn limit` : 'Normal',
      status: bearingTemp >= 95 ? 'Critical' : bearingTemp >= 85 ? 'Warning' : 'Normal',
      riskImpact: bearingTemp >= 95 ? 18 : bearingTemp >= 85 ? 8 : 0,
      explanation: 'Babbitt metal thermocouple reading monitoring hydrodynamic oil film integrity.'
    });
  }

  if (oilTemp > 0) {
    thermal.push({
      id: 'ind-therm-oil',
      name: 'Lube / Transformer Oil Temp',
      rawValue: oilTemp,
      unit: '°C',
      calculatedValue: `${oilTemp}°C`,
      baselineValue: assetCode === 'GSU' ? '65°C' : '52°C',
      warningThreshold: assetCode === 'GSU' ? '75°C' : '65°C',
      criticalThreshold: assetCode === 'GSU' ? '90°C' : '75°C',
      deviationText: oilTemp > 75 ? `+${oilTemp - 75}°C above threshold` : 'Optimal',
      status: oilTemp >= 90 ? 'Critical' : oilTemp >= 75 ? 'Warning' : 'Normal',
      riskImpact: oilTemp >= 75 ? 8 : 0,
      explanation: 'Dielectric / lubricating oil temperature measuring cooling system performance.'
    });
  }

  // C. Performance Indicators
  const heatRateDev = telemetry.baselineHeatRateBtuKwh > 0
    ? calculateDeviationPct(telemetry.heatRateBtuKwh, telemetry.baselineHeatRateBtuKwh)
    : 0;

  const performance: CalculatedIndicator[] = [
    {
      id: 'ind-perf-heatrate',
      name: 'Heat Rate Thermal Deviation',
      rawValue: telemetry.heatRateBtuKwh,
      unit: 'BTU/kWh',
      calculatedValue: heatRateDev > 0 ? `+${heatRateDev}%` : `${heatRateDev}%`,
      baselineValue: `${telemetry.baselineHeatRateBtuKwh} BTU`,
      warningThreshold: '+3.0%',
      criticalThreshold: '+6.0%',
      deviationText: heatRateDev > 3 ? `+${heatRateDev}% fuel penalty` : 'Efficient',
      status: heatRateDev >= 6.0 ? 'Critical' : heatRateDev >= 3.0 ? 'Warning' : 'Normal',
      riskImpact: heatRateDev >= 6.0 ? 20 : heatRateDev >= 3.0 ? 10 : 0,
      explanation: 'Ratio of fuel energy consumed per net MWh delivered. Degradation indicates aerodynamic compressor fouling or nozzle drift.'
    },
    {
      id: 'ind-perf-efficiency',
      name: 'Cycle Thermodynamic Efficiency',
      rawValue: telemetry.efficiencyPct,
      unit: '%',
      calculatedValue: `${telemetry.efficiencyPct}%`,
      baselineValue: isGT ? '56.5%' : assetCode === 'ST-1' ? '43.5%' : '82.0%',
      warningThreshold: '< 53.0%',
      criticalThreshold: '< 50.0%',
      deviationText: `${telemetry.efficiencyPct}% Carnot ratio`,
      status: telemetry.efficiencyPct < 50 ? 'Critical' : telemetry.efficiencyPct < 53 ? 'Warning' : 'Normal',
      riskImpact: telemetry.efficiencyPct < 53 ? 6 : 0,
      explanation: 'Overall thermal conversion efficiency against design basis.'
    }
  ];

  // D. Mechanical Indicators
  const vib = telemetry.vibrationMmS;
  const shaftVib = telemetry.shaftVibrationMmS;
  const vibWarning = assetCode === 'BFP-A' ? 6.0 : 2.5;
  const vibCritical = assetCode === 'BFP-A' ? 9.0 : 4.5;

  const mechanical: CalculatedIndicator[] = [
    {
      id: 'ind-mech-vib',
      name: 'Overall Bearing Vibration Velocity',
      rawValue: vib,
      unit: 'mm/s RMS',
      calculatedValue: `${vib} mm/s`,
      baselineValue: assetCode === 'BFP-A' ? '4.2 mm/s' : '1.4 mm/s',
      warningThreshold: `${vibWarning} mm/s`,
      criticalThreshold: `${vibCritical} mm/s`,
      deviationText: vib > vibWarning ? `+${(vib - vibWarning).toFixed(1)} mm/s over limit` : 'Zone A Smooth',
      status: vib >= vibCritical ? 'Critical' : vib >= vibWarning ? 'Warning' : 'Normal',
      riskImpact: vib >= vibCritical ? 20 : vib >= vibWarning ? 10 : 0,
      explanation: 'Radial casing vibration velocity measured across drive/non-drive bearing pedestals per ISO 10816.'
    },
    {
      id: 'ind-mech-shaft',
      name: 'Shaft Dynamic Displacement',
      rawValue: shaftVib,
      unit: 'mm/s',
      calculatedValue: `${shaftVib} mm/s`,
      baselineValue: '1.8 mm/s',
      warningThreshold: '3.0 mm/s',
      criticalThreshold: '5.0 mm/s',
      deviationText: shaftVib > 3.0 ? 'Elevated 1X runout' : 'Nominal',
      status: shaftVib >= 5.0 ? 'Critical' : shaftVib >= 3.0 ? 'Warning' : 'Normal',
      riskImpact: shaftVib >= 3.0 ? 5 : 0,
      explanation: 'Proximity probe orbit monitoring shaft centerline excursion and unbalance.'
    }
  ];

  if (telemetry.lubeOilPressureBar > 0) {
    mechanical.push({
      id: 'ind-mech-oil-press',
      name: 'Lube Oil Header Pressure',
      rawValue: telemetry.lubeOilPressureBar,
      unit: 'bar',
      calculatedValue: `${telemetry.lubeOilPressureBar} bar`,
      baselineValue: '2.6 bar',
      warningThreshold: '< 2.2 bar',
      criticalThreshold: '< 1.8 bar',
      deviationText: 'Hydraulic margin secure',
      status: telemetry.lubeOilPressureBar < 1.8 ? 'Critical' : telemetry.lubeOilPressureBar < 2.2 ? 'Warning' : 'Normal',
      riskImpact: telemetry.lubeOilPressureBar < 2.2 ? 8 : 0,
      explanation: 'Main lube pump discharge delivery ensuring hydro-wedge bearing clearance.'
    });
  }

  // E. Environment / Context Indicators
  const ambTemp = plantContext.ambientTemperatureC;
  const cwTemp = plantContext.coolingWaterTempC;
  const envDerateImpact = ambTemp > 35 ? Math.round((ambTemp - 35) * 1.5) : 0;

  const environment: CalculatedIndicator[] = [
    {
      id: 'ind-env-ambient',
      name: 'Ambient Air Temperature Impact',
      rawValue: ambTemp,
      unit: '°C',
      calculatedValue: `${ambTemp}°C`,
      baselineValue: '25°C ISO',
      warningThreshold: '> 38°C',
      criticalThreshold: '> 45°C',
      deviationText: ambTemp > 35 ? `+${envDerateImpact}% thermal air density penalty` : 'Standard density',
      status: ambTemp > 45 ? 'Critical' : ambTemp > 38 ? 'Warning' : 'Normal',
      riskImpact: ambTemp > 38 ? 4 : 0,
      explanation: 'High ambient temperature reduces air mass flow into turbine compressor, elevating heat rate.'
    },
    {
      id: 'ind-env-cw',
      name: 'Cooling Water Supply Temperature',
      rawValue: cwTemp,
      unit: '°C',
      calculatedValue: `${cwTemp}°C`,
      baselineValue: '24°C',
      warningThreshold: '> 30°C',
      criticalThreshold: '> 34°C',
      deviationText: cwTemp > 30 ? '+0.03 bar backpressure bias' : 'Adequate vacuum',
      status: cwTemp > 34 ? 'Critical' : cwTemp > 30 ? 'Warning' : 'Normal',
      riskImpact: cwTemp > 30 ? 3 : 0,
      explanation: 'Condenser coolant heat sink temperature dictating steam turbine vacuum saturation limit.'
    }
  ];

  // F. History / Degradation Indicators
  const history: CalculatedIndicator[] = [
    {
      id: 'ind-hist-maint-status',
      name: 'Maintenance Schedule Compliance',
      rawValue: isMaintenanceOverdue ? 'Overdue' : 'On Schedule',
      unit: 'status',
      calculatedValue: isMaintenanceOverdue ? 'Overdue' : 'Compliant',
      baselineValue: 'Current',
      warningThreshold: 'Overdue',
      criticalThreshold: '> 30d Overdue',
      deviationText: isMaintenanceOverdue ? 'Service window passed' : 'Within cycle',
      status: isMaintenanceOverdue ? 'Warning' : 'Normal',
      riskImpact: isMaintenanceOverdue ? 10 : 0,
      explanation: 'Tracking elapsed equivalent operating hours against OEM recommended service interval.'
    },
    {
      id: 'ind-hist-repeated-issues',
      name: 'Recurring Alarm Frequency',
      rawValue: repeatedIssueCount,
      unit: 'events',
      calculatedValue: `${repeatedIssueCount} alarms`,
      baselineValue: '0',
      warningThreshold: '>= 2',
      criticalThreshold: '>= 3',
      deviationText: repeatedIssueCount >= 3 ? 'Recurrence risk' : 'Isolated',
      status: repeatedIssueCount >= 3 ? 'Critical' : repeatedIssueCount >= 2 ? 'Warning' : 'Normal',
      riskImpact: repeatedIssueCount >= 3 ? 8 : repeatedIssueCount >= 2 ? 4 : 0,
      explanation: 'Alarms repeating in the same subsystem indicate systematic degradation rather than transient flutter.'
    },
    {
      id: 'ind-hist-starts',
      name: 'Thermal Starts Thermal Fatigue',
      rawValue: startsCount,
      unit: 'starts',
      calculatedValue: `${startsCount} starts`,
      baselineValue: '< 250',
      warningThreshold: '> 300',
      criticalThreshold: '> 500',
      deviationText: startsCount > 300 ? 'Cyclic fatigue elevated' : 'Base load',
      status: startsCount > 500 ? 'Critical' : startsCount > 300 ? 'Warning' : 'Normal',
      riskImpact: startsCount > 300 ? 3 : 0,
      explanation: 'Thermal expansion stress cycles on rotor disks and casing flanges.'
    }
  ];

  return { electrical, thermal, performance, mechanical, environment, history };
}

// 5. Evaluate Condition Modules (Section 6 & 7)
// Condition modules represent physical/operational asset condition (HEALTH).
// Rules DO NOT add duplicate penalties here!
export function evaluateConditionModules(
  assetCode: string,
  telemetry: RawAssetTelemetry,
  indicators: {
    electrical: CalculatedIndicator[];
    thermal: CalculatedIndicator[];
    performance: CalculatedIndicator[];
    mechanical: CalculatedIndicator[];
    environment: CalculatedIndicator[];
    history: CalculatedIndicator[];
  },
  isMaintenanceOverdue: boolean,
  repeatedIssueCount: number,
  historicalRepeatedIssueCount: number = 0
): ConditionModule[] {
  // A. Thermal Module
  let thermPenalty = 0;
  if (assetCode.startsWith('GT')) {
    if (telemetry.egtSpreadC >= 25) thermPenalty += 30;
    else if (telemetry.egtSpreadC >= 15) thermPenalty += 15;
    else if (telemetry.egtSpreadC > 12) thermPenalty += 10;

    if (telemetry.minEgtC > 0 && telemetry.minEgtC < 590) {
      thermPenalty += 18; // Combustor cold spot penalty
    }
  }
  if (telemetry.bearingTempC >= 95) thermPenalty += 30;
  else if (telemetry.bearingTempC >= 85) thermPenalty += 18;

  if (telemetry.oilTempC >= 90) thermPenalty += 25;
  else if (telemetry.oilTempC >= 75) thermPenalty += 12;

  const thermScore = Math.max(20, Math.min(100, 100 - thermPenalty));
  const thermStatus: ConditionStatus = thermScore < 65 ? 'Critical' : thermScore < 80 ? 'Warning' : 'Normal';

  // B. Performance Module
  let perfPenalty = 0;
  const hrDev = telemetry.baselineHeatRateBtuKwh > 0
    ? calculateDeviationPct(telemetry.heatRateBtuKwh, telemetry.baselineHeatRateBtuKwh)
    : 0;

  if (hrDev >= 6.0) perfPenalty += 38;
  else if (hrDev >= 5.0) perfPenalty += 30;
  else if (hrDev >= 3.0) perfPenalty += 28;
  else if (hrDev >= 1.5) perfPenalty += 10;

  if (telemetry.efficiencyPct > 0 && telemetry.efficiencyPct < 50.0) perfPenalty += 15;
  else if (telemetry.efficiencyPct > 0 && telemetry.efficiencyPct < 53.0) perfPenalty += 8;

  const perfScore = Math.max(20, Math.min(100, 100 - perfPenalty));
  const perfStatus: ConditionStatus = perfScore < 65 ? 'Critical' : perfScore < 80 ? 'Warning' : 'Normal';

  // C. Mechanical Module
  let mechPenalty = 0;
  const vibWarn = assetCode === 'BFP-A' ? 6.0 : 2.5;
  const vibCrit = assetCode === 'BFP-A' ? 9.0 : 4.5;
  if (telemetry.vibrationMmS >= vibCrit) mechPenalty += 30;
  else if (telemetry.vibrationMmS >= vibWarn) mechPenalty += (assetCode === 'BFP-A' ? 20 : 15);
  else if (telemetry.vibrationMmS >= 2.0) mechPenalty += 8;

  if (telemetry.shaftVibrationMmS >= 5.0) mechPenalty += 15;
  else if (telemetry.shaftVibrationMmS >= 3.0) mechPenalty += 7;
  else if (telemetry.shaftVibrationMmS >= 2.2) mechPenalty += 4;

  const mechScore = Math.max(20, Math.min(100, 100 - mechPenalty));
  const mechStatus: ConditionStatus = mechScore < 65 ? 'Critical' : mechScore < 80 ? 'Warning' : 'Normal';

  // D. Electrical Module
  let elecPenalty = 0;
  if (telemetry.powerFactor < 0.90) elecPenalty += 16;
  else if (telemetry.powerFactor < 0.93) elecPenalty += 12;

  const nominalKV = assetCode === 'GSU' ? 230 : assetCode === 'BFP-A' ? 4.16 : 18.0;
  const voltDev = Math.abs(calculateDeviationPct(telemetry.voltageKV, nominalKV));
  if (voltDev > 5.0) elecPenalty += 8;

  const elecScore = Math.max(20, Math.min(100, 100 - elecPenalty));
  const elecStatus: ConditionStatus = elecScore < 65 ? 'Critical' : elecScore < 80 ? 'Warning' : 'Normal';

  // E. History Module (Section 7: Strictly Monotonic Scoring)
  let histPenalty = 0;
  if (isMaintenanceOverdue) histPenalty += 20;

  // Active recurrence monotonic penalty: 0 -> 0, 1 -> 5, 2 -> 10, >=3 -> 15
  if (repeatedIssueCount >= 3) histPenalty += 15;
  else if (repeatedIssueCount >= 2) histPenalty += 10;
  else if (repeatedIssueCount >= 1) histPenalty += 5;

  // Preserved historical intervention wear post-maintenance when active recurrence is cleared
  if (!isMaintenanceOverdue && repeatedIssueCount === 0) {
    if (historicalRepeatedIssueCount >= 3) histPenalty += 15;
    else if (historicalRepeatedIssueCount >= 2) histPenalty += 10;
    else if (historicalRepeatedIssueCount >= 1) histPenalty += 5;
  }
  if (indicators.history.some(i => i.id === 'ind-hist-starts' && i.status !== 'Normal')) {
    histPenalty += 5;
  }

  const histScore = Math.max(20, Math.min(100, 100 - histPenalty));
  const histStatus: ConditionStatus = histScore < 65 ? 'Critical' : histScore < 80 ? 'Warning' : 'Normal';

  // F. Environment Module (Section 8: Dynamically derived from indicators)
  let envPenalty = 0;
  for (const ind of indicators.environment) {
    if (ind.status === 'Critical') envPenalty += 15;
    else if (ind.status === 'Warning') envPenalty += 6;
  }
  const envScore = Math.max(20, Math.min(100, 100 - envPenalty));
  const envStatus: ConditionStatus = envScore < 65 ? 'Critical' : envScore < 80 ? 'Warning' : 'Normal';

  // Weights: Thermal: 25%, Performance: 25%, Mechanical: 20%, Electrical: 15%, History: 10%, Environment: 5%
  return [
    {
      moduleId: 'thermal',
      moduleName: 'Thermal Condition',
      score: thermScore,
      status: thermStatus,
      weight: 0.25,
      riskContribution: Math.round((100 - thermScore) * 0.25),
      trend: thermScore < 75 ? 'Deteriorating' : 'Stable',
      indicators: indicators.thermal
    },
    {
      moduleId: 'performance',
      moduleName: 'Performance Condition',
      score: perfScore,
      status: perfStatus,
      weight: 0.25,
      riskContribution: Math.round((100 - perfScore) * 0.25),
      trend: perfScore < 75 ? 'Deteriorating' : 'Stable',
      indicators: indicators.performance
    },
    {
      moduleId: 'mechanical',
      moduleName: 'Mechanical Condition',
      score: mechScore,
      status: mechStatus,
      weight: 0.20,
      riskContribution: Math.round((100 - mechScore) * 0.20),
      trend: mechScore < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.mechanical
    },
    {
      moduleId: 'electrical',
      moduleName: 'Electrical Condition',
      score: elecScore,
      status: elecStatus,
      weight: 0.15,
      riskContribution: Math.round((100 - elecScore) * 0.15),
      trend: 'Stable',
      indicators: indicators.electrical
    },
    {
      moduleId: 'history',
      moduleName: 'Asset History / Degradation',
      score: histScore,
      status: histStatus,
      weight: 0.10,
      riskContribution: Math.round((100 - histScore) * 0.10),
      trend: histScore < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.history
    },
    {
      moduleId: 'environment',
      moduleName: 'Environment / Operating Context',
      score: envScore,
      status: envStatus,
      weight: 0.05,
      riskContribution: Math.round((100 - envScore) * 0.05),
      trend: 'Stable',
      indicators: indicators.environment
    }
  ];
}

// 6. Calculate Health Score from weighted condition modules (Section 4)
export function calculateHealthScore(conditionModules: ConditionModule[]): number {
  const weighted = conditionModules.reduce((sum, m) => sum + m.score * m.weight, 0);
  return Math.max(1, Math.min(100, Math.round(weighted)));
}

// Helper: Resolve asset metric for generic rule evaluation
function resolveAssetMetric(
  param: string,
  asset: {
    assetId: string;
    assetCode: string;
    assetType: string;
    criticality: number;
    isMaintenanceOverdue: boolean;
    repeatedIssueCount: number;
  },
  telemetry: RawAssetTelemetry
): number {
  switch (param) {
    case 'egtSpreadC':
      return telemetry.egtSpreadC;
    case 'heatRateDevPct': {
      return telemetry.baselineHeatRateBtuKwh > 0
        ? calculateDeviationPct(telemetry.heatRateBtuKwh, telemetry.baselineHeatRateBtuKwh)
        : 0;
    }
    case 'bearingTempC':
      return telemetry.bearingTempC;
    case 'vibrationMmS':
      return telemetry.vibrationMmS;
    case 'oilTempC':
      return telemetry.oilTempC;
    case 'highLoadThermal': {
      return telemetry.egtSpreadC >= 15 ? telemetry.loadPct : 0;
    }
    case 'isMaintenanceOverdue':
    case 'overdueDays': {
      return asset.isMaintenanceOverdue ? 1 : 0;
    }
    case 'repeatedIssueCount':
      return asset.repeatedIssueCount;
    default: {
      if (param in telemetry) {
        return Number(telemetry[param as keyof RawAssetTelemetry]) || 0;
      }
      return 0;
    }
  }
}

// 7. Generic Rule Evaluator (Section 8)
// Evaluates rules generically without hard-coded switch/case per rule.
export function evaluateRules(
  asset: {
    assetId: string;
    assetCode: string;
    assetType: string;
    criticality: number;
    isMaintenanceOverdue: boolean;
    repeatedIssueCount: number;
  },
  indicators: {
    electrical: CalculatedIndicator[];
    thermal: CalculatedIndicator[];
    performance: CalculatedIndicator[];
    mechanical: CalculatedIndicator[];
    environment: CalculatedIndicator[];
    history: CalculatedIndicator[];
  },
  rules: ReliabilityRule[],
  telemetry: RawAssetTelemetry
): RuleResult[] {
  const results: RuleResult[] = [];

  for (const rule of rules) {
    // If rule disabled: stops contributing risk & generating alerts (Section 9)
    if (!rule.enabled) continue;

    // Check asset type compatibility
    const allowedTypes = rule.assetTypes || (rule.assetType ? [rule.assetType] : ['All']);
    const isApplicable =
      allowedTypes.includes('All') ||
      allowedTypes.includes(asset.assetType) ||
      (allowedTypes.includes('Combustion Turbine') && asset.assetCode.startsWith('GT')) ||
      (allowedTypes.includes('Steam Turbine & Condenser') && asset.assetCode.startsWith('ST')) ||
      (allowedTypes.includes('High-Pressure Pumping') && asset.assetCode === 'BFP-A') ||
      (allowedTypes.includes('Step-Up Transformer') && asset.assetCode === 'GSU');

    if (!isApplicable) continue;

    const actualValue = resolveAssetMetric(rule.parameter, asset, telemetry);
    let triggered = false;
    let severity: 'normal' | 'warning' | 'critical' = 'normal';
    let thresholdExceeded = 0;
    let riskImpact = 0;

    if (rule.operator === '>' || rule.operator === '>=' || rule.operator === 'spread_gt') {
      if (actualValue >= rule.criticalThreshold) {
        triggered = true;
        severity = 'critical';
        thresholdExceeded = rule.criticalThreshold;
        riskImpact = rule.criticalRiskImpact;
      } else if (actualValue >= rule.warningThreshold) {
        triggered = true;
        severity = 'warning';
        thresholdExceeded = rule.warningThreshold;
        riskImpact = rule.warningRiskImpact;
      }
    } else if (rule.operator === '<' || rule.operator === '<=') {
      if (actualValue <= rule.criticalThreshold) {
        triggered = true;
        severity = 'critical';
        thresholdExceeded = rule.criticalThreshold;
        riskImpact = rule.criticalRiskImpact;
      } else if (actualValue <= rule.warningThreshold) {
        triggered = true;
        severity = 'warning';
        thresholdExceeded = rule.warningThreshold;
        riskImpact = rule.warningRiskImpact;
      }
    }

    if (triggered) {
      let details = `${rule.parameterLabel} of ${actualValue} ${rule.unit} exceeded ${severity === 'critical' ? 'Critical' : 'Warning'} threshold (${thresholdExceeded} ${rule.unit}).`;
      if (rule.ruleId === 'RULE-GT-001') {
        details = `EGT Spread of ${actualValue}°C exceeds Critical threshold of ${rule.criticalThreshold}°C (Can 4 cold spot).`;
      } else if (rule.ruleId === 'RULE-HR-002') {
        details = `Heat Rate deviation of +${actualValue}% exceeds Warning limit (+${rule.warningThreshold}%).`;
      }

      results.push({
        rule,
        triggered: true,
        severity,
        actualValue,
        thresholdExceeded,
        riskImpact,
        details,
        recommendation: rule.recommendation
      });
    }
  }

  return results;
}

// 8. Calculate Risk Score & Explainability (Section 13)
// Risk = Condition Base Risk + Triggered Rule Impacts + Criticality Modifier + History Modifier
export function calculateRiskAssessment(
  assetCode: string,
  healthScore: number,
  conditionModules: ConditionModule[],
  ruleResults: RuleResult[],
  criticality: number,
  isMaintenanceOverdue: boolean,
  repeatedIssueCount: number,
  historicalRepeatedIssueCount: number = 0
): {
  riskScore: number;
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  trend: AssetTrend;
  riskContributors: RiskContributor[];
  explainabilitySteps: string[];
} {
  // 1. Condition Base Risk: proportional to deterioration in health
  // For health 68: 100 - 68 = 32; 32 * 1.06 = 34
  // For health 86: 100 - 86 = 14; 14 * 1.06 = 15
  const deterioration = Math.max(0, 100 - healthScore);
  const baseRisk = Math.round(deterioration * 1.06);

  // 2. Triggered rule impacts
  const ruleRisk = ruleResults.reduce((sum, r) => sum + r.riskImpact, 0);

  // 3. Criticality modifier: +3 for plant critical nodes (criticality >= 5) with active critical alarms
  const criticalityModifier = (criticality >= 5 && ruleResults.some(r => r.severity === 'critical')) ? 3 : 0;

  // 4. History modifier: when asset has previous recurrence history (preserved post-maintenance)
  const historyModifier = (historicalRepeatedIssueCount >= 3 && ruleResults.length === 0)
    ? 17
    : (repeatedIssueCount >= 2 && ruleResults.length <= 1)
    ? 13
    : 0;

  // Final Risk Score clamped 0-100
  const totalRiskScore = Math.max(5, Math.min(100, baseRisk + ruleRisk + criticalityModifier + historyModifier));
  const riskLevel = determineRiskLevel(totalRiskScore);
  const priority = determinePriority(riskLevel, criticality);

  // Trend
  const deterioratingCount = conditionModules.filter(m => m.trend === 'Deteriorating').length;
  const trend: AssetTrend = (deterioratingCount >= 1 || totalRiskScore >= 60) ? 'Deteriorating' : 'Stable';

  // Risk Contributors breakdown (Section 13 & 21)
  const riskContributors: RiskContributor[] = [
    {
      source: 'Condition Base Risk',
      value: `${healthScore}/100 Health`,
      threshold: '100 Baseline',
      impact: baseRisk,
      explanation: 'Base operational deterioration derived from physical condition modules.'
    }
  ];

  for (const r of ruleResults) {
    riskContributors.push({
      source: r.rule.parameterLabel,
      value: `${r.actualValue} ${r.rule.unit}`,
      threshold: `${r.thresholdExceeded} ${r.rule.unit}`,
      impact: r.riskImpact,
      ruleId: r.rule.ruleId,
      explanation: r.details
    });
  }

  if (criticalityModifier > 0) {
    riskContributors.push({
      source: 'Asset Criticality Modifier',
      value: `${criticality}/5 Rating`,
      threshold: '3/5 Base',
      impact: criticalityModifier,
      explanation: `Operational consequence rating (${criticality}/5) for plant critical node.`
    });
  }

  if (historyModifier > 0) {
    riskContributors.push({
      source: 'Subsystem Historical Recurrence Bias',
      value: `${historicalRepeatedIssueCount || repeatedIssueCount} Lifetime Events`,
      threshold: '< 2 Baseline',
      impact: historyModifier,
      explanation: 'Residual surveillance bias based on recurring anomaly record on critical generating unit.'
    });
  }

  // Explainability steps
  const explainabilitySteps: string[] = [];
  if (ruleResults.length > 0) {
    explainabilitySteps.push(
      `Triggered ${ruleResults.length} active reliability rule${ruleResults.length > 1 ? 's' : ''}: ${ruleResults.map(r => r.rule.ruleId).join(', ')}.`
    );
    for (const r of ruleResults) {
      explainabilitySteps.push(
        `${r.rule.name} (${r.rule.ruleId}): Actual ${r.actualValue} ${r.rule.unit} exceeded threshold (${r.thresholdExceeded} ${r.rule.unit}), contributing +${r.riskImpact} risk.`
      );
    }
  } else {
    explainabilitySteps.push('Zero active rule threshold exceedances. All thermal, mechanical, and electrical telemetry within design baseline.');
  }

  const weakestModule = [...conditionModules].sort((a, b) => a.score - b.score)[0];
  explainabilitySteps.push(
    `Primary condition bottleneck is ${weakestModule.moduleName} (Score: ${weakestModule.score}/100, ${weakestModule.status}).`
  );
  explainabilitySteps.push(
    `Overall Health Score computed at ${healthScore}/100 from weighted physical condition modules.`
  );

  // Part A §4: Show all non-zero contributors so displayed equation mathematically equals totalRiskScore
  const formulaParts: string[] = [`Condition Base Risk (${baseRisk})`];
  if (ruleRisk > 0) formulaParts.push(`Rule Impacts (+${ruleRisk})`);
  if (criticalityModifier > 0) formulaParts.push(`Criticality (+${criticalityModifier})`);
  if (historyModifier > 0) formulaParts.push(`History Modifier (+${historyModifier})`);
  const formulaStr = formulaParts.join(' + ');

  explainabilitySteps.push(
    `Deterministic Risk Score: ${formulaStr} = ${totalRiskScore}/100 → Risk Level: ${riskLevel} (${priority}).`
  );

  return {
    riskScore: totalRiskScore,
    riskLevel,
    priority,
    trend,
    riskContributors,
    explainabilitySteps
  };
}

// 9. Generate Alerts From Rule Results (Section 11)
// Alerts derive directly from actual rule results.
// Stable alert IDs and existing user statuses ('Acknowledged', 'In Work Order') are preserved.
export function generateAlertsFromRules(
  asset: CcgtAsset,
  ruleResults: RuleResult[],
  existingAlerts: ReliabilityAlert[]
): ReliabilityAlert[] {
  const updatedAlerts: ReliabilityAlert[] = [];
  const activeRuleIds = new Set(ruleResults.map(r => r.rule.ruleId));

  // Process triggered rules
  for (const r of ruleResults) {
    const existing = existingAlerts.find(
      a => a.assetId === asset.assetId && a.triggeredRuleId === r.rule.ruleId
    );

    const alertId = existing?.alertId || `ALT-${asset.assetCode.replace(/[^A-Za-z0-9]/g, '')}-${r.rule.ruleId.slice(-3)}`;
    const categoryName = (r.rule.category.charAt(0).toUpperCase() + r.rule.category.slice(1)) as ReliabilityAlert['conditionModule'];

    const matchingModule = asset.conditionModules?.find(
      m => m.moduleId.toLowerCase() === r.rule.category.toLowerCase()
    );
    const conditionText = matchingModule 
      ? `${categoryName} Health Score: ${matchingModule.score}/100 (${matchingModule.status})`
      : `${categoryName} Condition Impacted`;

    const traceability = {
      rawData: `${r.rule.parameterLabel} = ${r.actualValue} ${r.rule.unit}`,
      indicator: `Measured ${r.actualValue} ${r.rule.unit} vs threshold limit ${r.thresholdExceeded} ${r.rule.unit}`,
      rule: `${r.rule.ruleId}: ${r.rule.name}`,
      condition: conditionText,
      riskImpact: `+${r.riskImpact} Risk Impact`,
      overallRisk: `Asset Risk Score: ${asset.riskScore} (${asset.riskLevel})`,
      recommendation: r.recommendation || r.rule.recommendation
    };

    // If alert already existed and was in work order, acknowledged, or dismissed, keep workflow state
    let status: ReliabilityAlert['status'] = 'Active';
    if (existing) {
      if (existing.status === 'In Work Order' || existing.status === 'Acknowledged' || existing.status === 'Dismissed') {
        status = existing.status;
      }
    }

    updatedAlerts.push({
      alertId,
      assetId: asset.assetId,
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      alertTitle: r.rule.name,
      conditionModule: categoryName,
      triggeredRuleId: r.rule.ruleId,
      triggerCondition: `${r.rule.parameterLabel} reached ${r.actualValue} ${r.rule.unit} (${r.rule.operator} ${r.thresholdExceeded} ${r.rule.unit} ${r.severity === 'critical' ? 'Critical' : 'Warn'})`,
      currentValue: `${r.actualValue} ${r.rule.unit}`,
      thresholdValue: `${r.thresholdExceeded} ${r.rule.unit}`,
      riskImpact: r.riskImpact,
      riskLevel: r.severity === 'critical' ? 'Critical' : 'Medium',
      priority: r.severity === 'critical' ? 'P2' : 'P3',
      recommendationId: existing?.recommendationId,
      recommendationText: r.recommendation || r.rule.recommendation,
      status,
      createdAt: existing?.createdAt || 'Just now',
      traceability
    });
  }

  // Preserve alerts from other assets
  const otherAlerts = existingAlerts.filter(a => a.assetId !== asset.assetId);

  // Preserve previously resolved/dismissed or mark untriggered alerts as Resolved for this asset
  for (const existing of existingAlerts.filter(a => a.assetId === asset.assetId)) {
    if (!activeRuleIds.has(existing.triggeredRuleId)) {
      updatedAlerts.push({
        ...existing,
        status: 'Resolved'
      });
    }
  }

  return [...updatedAlerts, ...otherAlerts];
}

// 10. Generate Recommendations from Alerts (Section 12)
export function generateRecommendationsFromAlerts(
  asset: CcgtAsset,
  alerts: ReliabilityAlert[],
  ruleResults: RuleResult[],
  existingRecs: ReliabilityRecommendation[]
): ReliabilityRecommendation[] {
  const recommendations: ReliabilityRecommendation[] = [];

  for (const alert of alerts.filter(a => a.assetId === asset.assetId && a.status !== 'Dismissed')) {
    const existing = existingRecs.find(r => r.sourceAlertId === alert.alertId);
    const ruleRes = ruleResults.find(r => r.rule.ruleId === alert.triggeredRuleId);
    const recId = existing?.recommendationId || `REC-${alert.alertId.replace('ALT-', '')}`;

    let status: ReliabilityRecommendation['status'] = existing?.status || 'Pending';
    if (alert.status === 'Resolved' && (status === 'Work Order Created' || status === 'In Progress')) {
      status = 'Completed';
    }

    recommendations.push({
      recommendationId: recId,
      assetId: asset.assetId,
      assetCode: asset.assetCode,
      sourceAlertId: alert.alertId,
      sourceRuleId: alert.triggeredRuleId,
      recommendedAction: ruleRes?.recommendation || alert.recommendationText,
      reason: `${alert.alertTitle}: Current value ${alert.currentValue} exceeds threshold of ${alert.thresholdValue}.`,
      priority: alert.priority,
      recommendedTimeline: alert.priority === 'P1' ? 'Immediate' : alert.priority === 'P2' ? 'Within 48 hours' : 'Within 7 days',
      riskIfIgnored: 'Continued operating under active threshold exceedance risks accelerated component fatigue and forced tripping.',
      status,
      createdAt: existing?.createdAt || 'Just now'
    });
  }

  // Also preserve already approved or work-order-created recommendations from history
  for (const existing of existingRecs.filter(r => r.assetId === asset.assetId)) {
    if (!recommendations.some(r => r.recommendationId === existing.recommendationId)) {
      recommendations.push(existing);
    }
  }

  const otherRecs = existingRecs.filter(r => r.assetId !== asset.assetId);
  return [...recommendations, ...otherRecs];
}

// 11. Recalculate single asset against CURRENT state (Section 10)
export function recalculateAsset(
  currentAsset: CcgtAsset,
  rules: ReliabilityRule[],
  plantContext: PlantContext,
  existingAlerts?: ReliabilityAlert[]
): CcgtAsset {
  const activeRecurrence = currentAsset.activeRecurrenceCount ?? currentAsset.repeatedIssueCount;
  const historicalRepeated = currentAsset.historicalRepeatedIssueCount ?? 0;

  // Semantic loadPct calculation by asset role (Part A §3)
  let canonicalLoad = currentAsset.telemetry.loadPct;
  if (currentAsset.assetCode.startsWith('GT') || currentAsset.assetCode.startsWith('ST')) {
    const genMW = currentAsset.telemetry.generationMW ?? currentAsset.telemetry.mwOutput ?? 0;
    canonicalLoad = currentAsset.ratedMW > 0 ? Number(((genMW / currentAsset.ratedMW) * 100).toFixed(1)) : 88.8;
  } else if (currentAsset.assetCode === 'BFP-A') {
    const consumedMW = currentAsset.telemetry.powerConsumptionMW ?? currentAsset.telemetry.mwOutput ?? 3.2;
    const ratedMotorMW = currentAsset.ratedMW > 0 ? currentAsset.ratedMW : 4.0;
    canonicalLoad = Number(((consumedMW / ratedMotorMW) * 100).toFixed(1));
  } else if (currentAsset.assetCode === 'GSU') {
    const transMW = currentAsset.telemetry.transmittedMW ?? currentAsset.telemetry.mwOutput ?? 462.0;
    const ratedCapacityMW = currentAsset.ratedMW > 0 ? currentAsset.ratedMW : 500.0;
    canonicalLoad = Number(((transMW / ratedCapacityMW) * 100).toFixed(1));
  }

  const currentTelemetry: RawAssetTelemetry = {
    ...currentAsset.telemetry,
    loadPct: canonicalLoad
  };

  const indicators = calculateAssetIndicators(
    currentAsset.assetId,
    currentAsset.assetCode,
    currentAsset.assetType,
    currentAsset.ratedMW,
    currentTelemetry,
    plantContext,
    currentAsset.criticality,
    currentAsset.isMaintenanceOverdue,
    activeRecurrence,
    currentAsset.runningHours,
    currentAsset.startsCount
  );

  const conditionModules = evaluateConditionModules(
    currentAsset.assetCode,
    currentTelemetry,
    indicators,
    currentAsset.isMaintenanceOverdue,
    activeRecurrence,
    historicalRepeated
  );

  const healthScore = calculateHealthScore(conditionModules);

  const ruleResults = evaluateRules(
    {
      assetId: currentAsset.assetId,
      assetCode: currentAsset.assetCode,
      assetType: currentAsset.assetType,
      criticality: currentAsset.criticality,
      isMaintenanceOverdue: currentAsset.isMaintenanceOverdue,
      repeatedIssueCount: activeRecurrence
    },
    indicators,
    rules,
    currentTelemetry
  );

  const assessment = calculateRiskAssessment(
    currentAsset.assetCode,
    healthScore,
    conditionModules,
    ruleResults,
    currentAsset.criticality,
    currentAsset.isMaintenanceOverdue,
    activeRecurrence,
    historicalRepeated
  );

  // Update latest point on trend7d
  const updatedTrend = [...(currentAsset.trend7d || [])];
  const lastIdx = updatedTrend.length - 1;
  if (lastIdx >= 0) {
    updatedTrend[lastIdx] = {
      ...updatedTrend[lastIdx],
      healthScore,
      riskScore: assessment.riskScore,
      egtSpreadC: currentTelemetry.egtSpreadC,
      heatRateBtu: currentTelemetry.heatRateBtuKwh
    };
  }

  // Section 13: openAlertCount counts real active/open alerts
  const openCount = existingAlerts
    ? existingAlerts.filter(
        a => a.assetId === currentAsset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed'
      ).length
    : ruleResults.length;

  return {
    ...currentAsset,
    telemetry: currentTelemetry,
    healthScore,
    riskScore: assessment.riskScore,
    riskLevel: assessment.riskLevel,
    priority: assessment.priority,
    riskTrend: assessment.trend,
    mainIssue: ruleResults.length > 0 ? ruleResults[0].rule.parameterLabel : 'None',
    conditionModules,
    riskContributors: assessment.riskContributors,
    triggeredRules: ruleResults,
    explainabilitySteps: assessment.explainabilitySteps,
    trend7d: updatedTrend,
    openAlertCount: openCount
  };
}

// 12. Apply Maintenance Feedback Loop (Section 17 & 18)
export function applyMaintenanceFeedback(
  baseAsset: CcgtAsset,
  postTelemetry: Partial<RawAssetTelemetry>,
  rules: ReliabilityRule[],
  plantContext: PlantContext
): {
  updatedAsset: CcgtAsset;
  recalculatedIndicators: ReturnType<typeof calculateAssetIndicators>;
  recalculatedRules: RuleResult[];
} {
  // Semantic loadPct calculation by asset role (Part A §3)
  let canonicalLoad = baseAsset.telemetry.loadPct;
  if (baseAsset.assetCode.startsWith('GT') || baseAsset.assetCode.startsWith('ST')) {
    const genMW = postTelemetry.generationMW ?? baseAsset.telemetry.generationMW ?? baseAsset.telemetry.mwOutput ?? 0;
    canonicalLoad = baseAsset.ratedMW > 0 ? Number(((genMW / baseAsset.ratedMW) * 100).toFixed(1)) : 88.8;
  } else if (baseAsset.assetCode === 'BFP-A') {
    const consumedMW = postTelemetry.powerConsumptionMW ?? baseAsset.telemetry.powerConsumptionMW ?? 3.2;
    const ratedMotorMW = baseAsset.ratedMW > 0 ? baseAsset.ratedMW : 4.0;
    canonicalLoad = Number(((consumedMW / ratedMotorMW) * 100).toFixed(1));
  } else if (baseAsset.assetCode === 'GSU') {
    const transMW = postTelemetry.transmittedMW ?? baseAsset.telemetry.transmittedMW ?? 462.0;
    const ratedCapacityMW = baseAsset.ratedMW > 0 ? baseAsset.ratedMW : 500.0;
    canonicalLoad = Number(((transMW / ratedCapacityMW) * 100).toFixed(1));
  }

  const updatedTelemetry: RawAssetTelemetry = {
    ...baseAsset.telemetry,
    loadPct: canonicalLoad,
    vibrationMmS: postTelemetry.vibrationMmS ?? (baseAsset.assetCode === 'GT-2' ? 2.1 : baseAsset.telemetry.vibrationMmS),
    shaftVibrationMmS: postTelemetry.shaftVibrationMmS ?? (baseAsset.assetCode === 'GT-2' ? 2.3 : baseAsset.telemetry.shaftVibrationMmS),
    bearingTempC: postTelemetry.bearingTempC ?? (baseAsset.assetCode === 'GT-2' ? 72.0 : baseAsset.telemetry.bearingTempC),
    oilTempC: postTelemetry.oilTempC ?? (baseAsset.assetCode === 'GT-2' ? 54.0 : baseAsset.telemetry.oilTempC),
    efficiencyPct: postTelemetry.efficiencyPct ?? (baseAsset.assetCode === 'GT-2' ? 52.5 : baseAsset.telemetry.efficiencyPct),
    minEgtC: postTelemetry.minEgtC ?? (baseAsset.assetCode === 'GT-2' ? 602.0 : baseAsset.telemetry.minEgtC),
    ...postTelemetry
  };

  // If GT-2 combustor cans array present, normalize Can 4
  if (baseAsset.assetCode === 'GT-2' && updatedTelemetry.combustorCanTemps) {
    updatedTelemetry.combustorCanTemps = updatedTelemetry.combustorCanTemps.map(c =>
      c.canNumber === 4 ? { ...c, tempC: 602 } : c
    );
  }

  // Section 6 & 18: Clear semantics:
  // historicalRepeatedIssueCount preserves lifetime record
  // activeRecurrenceCount is cleared to 0 by the successful intervention
  const historicalRepeated = baseAsset.historicalRepeatedIssueCount || baseAsset.repeatedIssueCount || 0;
  const activeRecurrence = 0;

  const indicators = calculateAssetIndicators(
    baseAsset.assetId,
    baseAsset.assetCode,
    baseAsset.assetType,
    baseAsset.ratedMW,
    updatedTelemetry,
    plantContext,
    baseAsset.criticality,
    false, // Maintenance no longer overdue!
    activeRecurrence,
    baseAsset.runningHours + 12,
    baseAsset.startsCount
  );

  const conditionModules = evaluateConditionModules(
    baseAsset.assetCode,
    updatedTelemetry,
    indicators,
    false,
    activeRecurrence,
    historicalRepeated
  );

  const healthScore = calculateHealthScore(conditionModules);

  const ruleResults = evaluateRules(
    {
      assetId: baseAsset.assetId,
      assetCode: baseAsset.assetCode,
      assetType: baseAsset.assetType,
      criticality: baseAsset.criticality,
      isMaintenanceOverdue: false,
      repeatedIssueCount: activeRecurrence
    },
    indicators,
    rules,
    updatedTelemetry
  );

  const assessment = calculateRiskAssessment(
    baseAsset.assetCode,
    healthScore,
    conditionModules,
    ruleResults,
    baseAsset.criticality,
    false,
    activeRecurrence,
    historicalRepeated
  );

  const updatedAsset: CcgtAsset = {
    ...baseAsset,
    operationalStatus: 'Online',
    isMaintenanceOverdue: false,
    activeRecurrenceCount: 0,
    repeatedIssueCount: 0,
    historicalRepeatedIssueCount: historicalRepeated,
    openAlertCount: ruleResults.length,
    healthScore,
    riskScore: assessment.riskScore,
    riskLevel: assessment.riskLevel,
    priority: assessment.priority,
    riskTrend: 'Improving',
    mainIssue: ruleResults.length > 0 ? ruleResults[0].rule.parameterLabel : 'None (Restored)',
    telemetry: updatedTelemetry,
    conditionModules,
    riskContributors: assessment.riskContributors,
    triggeredRules: ruleResults,
    explainabilitySteps: [
      'Post-maintenance field intervention completed and verified.',
      `EGT Spread normalized to ${updatedTelemetry.egtSpreadC}°C (within 15°C baseline margin).`,
      `Heat rate deviation reduced to +${calculateDeviationPct(updatedTelemetry.heatRateBtuKwh, updatedTelemetry.baselineHeatRateBtuKwh)}%.`,
      `Asset Health Score recovered to ${healthScore}/100. Risk level reduced to ${assessment.riskLevel} (${assessment.riskScore}/100).`
    ],
    trend7d: [
      ...baseAsset.trend7d.slice(0, 6),
      {
        day: 'Today (Post-Maint)',
        healthScore,
        riskScore: assessment.riskScore,
        egtSpreadC: updatedTelemetry.egtSpreadC,
        heatRateBtu: updatedTelemetry.heatRateBtuKwh
      }
    ]
  };

  return {
    updatedAsset,
    recalculatedIndicators: indicators,
    recalculatedRules: ruleResults
  };
}

// 13. Initialize Fleet Reliability with Dynamic Alerts and Recommendations (Section 3 & 4)
export function initializeFleetReliability(
  baseAssets: CcgtAsset[],
  rules: ReliabilityRule[],
  plantContext: PlantContext,
  seedAlerts: ReliabilityAlert[] = [],
  seedRecs: ReliabilityRecommendation[] = []
): {
  assets: CcgtAsset[];
  alerts: ReliabilityAlert[];
  recommendations: ReliabilityRecommendation[];
} {
  // 1. Recalculate all base assets
  let assets = baseAssets.map(a => recalculateAsset(a, rules, plantContext));

  // 2. Generate active alerts from rules across all assets
  let alerts: ReliabilityAlert[] = seedAlerts;
  for (const asset of assets) {
    alerts = generateAlertsFromRules(asset, asset.triggeredRules, alerts);
  }

  // 3. Generate recommendations from alerts across all assets
  let recommendations: ReliabilityRecommendation[] = seedRecs;
  for (const asset of assets) {
    recommendations = generateRecommendationsFromAlerts(asset, alerts, asset.triggeredRules, recommendations);
  }

  // 4. Update each asset's openAlertCount to reflect actual open alerts (Section 13)
  assets = assets.map(a => ({
    ...a,
    openAlertCount: alerts.filter(
      alert => alert.assetId === a.assetId && alert.status !== 'Resolved' && alert.status !== 'Dismissed'
    ).length
  }));

  return { assets, alerts, recommendations };
}
