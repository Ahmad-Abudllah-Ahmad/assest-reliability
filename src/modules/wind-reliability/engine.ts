import {
  WindPlantContext,
  ReliabilityRule,
  RawWindTelemetry,
  WindAsset,
  CalculatedIndicator,
  ConditionModule,
  RuleResult,
  RiskContributor,
  AssetRiskLevel,
  AssetPriority,
  AssetTrend,
  ConditionStatus,
  ReliabilityAlert,
  ReliabilityRecommendation,
  MaintenanceOutcomeInput
} from './types';

// Helper: Percentage deviation
export function calculateDeviationPct(current: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Number((((current - baseline) / baseline) * 100).toFixed(1));
}

// 1. Plant Generation MW Calculation: sum generating wind turbines (WT-001 to WT-006)
export function calculateWindPlantGenerationMW(assets: WindAsset[]): number {
  return assets.reduce((sum, a) => {
    if (a.assetCode.startsWith('WT-')) {
      const mw = (a.telemetry.activePowerKw || 0) / 1000;
      return sum + mw;
    }
    return sum;
  }, 0);
}

// 2. Risk Level Bands (Section 14: 0–20 Low, 21–40 Moderate, 41–60 Medium, 61–80 High, 81–100 Critical)
export function determineRiskLevel(score: number): AssetRiskLevel {
  if (score <= 20) return 'Low';
  if (score <= 40) return 'Moderate';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Critical';
}

// 3. Priority Logic
export function determinePriority(riskLevel: AssetRiskLevel, criticality: number = 3): AssetPriority {
  if (riskLevel === 'Critical') return 'P1';
  if (riskLevel === 'High') return 'P2';
  if (riskLevel === 'Medium') return 'P3';
  if (riskLevel === 'Moderate') return 'P4';
  return 'P5';
}

// Helper: Theoretical power curve expected power at wind speed
export function calculateExpectedWindPowerKw(windSpeedMs: number, ratedKw = 5200): number {
  if (windSpeedMs < 3.0 || windSpeedMs > 25.0) return 0;
  if (windSpeedMs >= 12.0) return ratedKw;
  // Cubic wind power curve interpolation between cut-in (3 m/s) and rated (12 m/s)
  const ratio = (windSpeedMs - 3.0) / (12.0 - 3.0);
  return Math.round(ratedKw * Math.pow(ratio, 2.4));
}

// 4. Calculate Indicators for all 6 Wind Condition Modules
export function calculateWindAssetIndicators(
  assetId: string,
  assetCode: string,
  assetType: string,
  ratedMW: number,
  telemetry: RawWindTelemetry,
  plantContext: WindPlantContext,
  criticality: number,
  isMaintenanceOverdue: boolean,
  repeatedIssueCount: number,
  runningHours: number,
  startsCount: number
): {
  mechanical: CalculatedIndicator[];
  electrical: CalculatedIndicator[];
  performance: CalculatedIndicator[];
  thermal: CalculatedIndicator[];
  environment: CalculatedIndicator[];
  history: CalculatedIndicator[];
} {
  const isTurbine = assetCode.startsWith('WT-');
  const ratedKw = (ratedMW || 5.2) * 1000;
  const loadPct = Number(((telemetry.activePowerKw / ratedKw) * 100).toFixed(1));

  // A. Mechanical Indicators
  const pitchSpread = Math.max(telemetry.bladePitchA, telemetry.bladePitchB, telemetry.bladePitchC) -
                      Math.min(telemetry.bladePitchA, telemetry.bladePitchB, telemetry.bladePitchC);
  const yawMisalignment = Math.abs(telemetry.yawHeadingDeg - plantContext.windDirectionDeg);

  const mechanical: CalculatedIndicator[] = [
    {
      id: 'ind-mech-vib',
      name: 'Nacelle / Drive-End Vibration RMS',
      rawValue: telemetry.vibrationMmS,
      unit: 'mm/s',
      calculatedValue: `${telemetry.vibrationMmS} mm/s`,
      baselineValue: '1.2 - 2.0 mm/s',
      warningThreshold: '>= 3.2 mm/s',
      criticalThreshold: '>= 4.5 mm/s',
      deviationText: telemetry.vibrationMmS >= 4.5 ? 'Severe high-frequency harmonics' : telemetry.vibrationMmS >= 3.2 ? 'Elevated bearing wear' : 'Nominal RMS',
      status: telemetry.vibrationMmS >= 4.5 ? 'Critical' : telemetry.vibrationMmS >= 3.2 ? 'Warning' : 'Normal',
      riskImpact: telemetry.vibrationMmS >= 4.5 ? 22 : telemetry.vibrationMmS >= 3.2 ? 14 : 0,
      explanation: 'Accelerometric surveillance of high-speed shaft and planetary stage bearing vibrations.'
    },
    {
      id: 'ind-mech-bearing-temp',
      name: 'Gearbox Main Bearing Temperature',
      rawValue: telemetry.gearboxBearingTempC,
      unit: '°C',
      calculatedValue: `${telemetry.gearboxBearingTempC}°C`,
      baselineValue: '65 - 72°C',
      warningThreshold: '>= 78°C',
      criticalThreshold: '>= 88°C',
      deviationText: telemetry.gearboxBearingTempC >= 88 ? 'Thermal friction run-away' : telemetry.gearboxBearingTempC >= 78 ? '+10°C bearing thermal bias' : 'Adequate hydrodynamic lubrication',
      status: telemetry.gearboxBearingTempC >= 88 ? 'Critical' : telemetry.gearboxBearingTempC >= 78 ? 'Warning' : 'Normal',
      riskImpact: telemetry.gearboxBearingTempC >= 88 ? 20 : telemetry.gearboxBearingTempC >= 78 ? 12 : 0,
      explanation: 'Continuous RTD sensor monitoring at input journal bearing and planetary carrier ring.'
    },
    {
      id: 'ind-mech-pitch-spread',
      name: 'Independent Pitch Blade Spread',
      rawValue: Number(pitchSpread.toFixed(2)),
      unit: 'deg',
      calculatedValue: `${pitchSpread.toFixed(2)}°`,
      baselineValue: '< 0.3°',
      warningThreshold: '>= 0.8°',
      criticalThreshold: '>= 1.5°',
      deviationText: pitchSpread >= 1.5 ? 'Aerodynamic rotor imbalance' : pitchSpread >= 0.8 ? 'Minor asymmetric pitch load' : 'Synchronized pitch',
      status: pitchSpread >= 1.5 ? 'Critical' : pitchSpread >= 0.8 ? 'Warning' : 'Normal',
      riskImpact: pitchSpread >= 1.5 ? 12 : pitchSpread >= 0.8 ? 6 : 0,
      explanation: 'Asymmetric pitch discrepancy between Blade A, B, and C inducing cyclic aerodynamic fatigue.'
    },
    {
      id: 'ind-mech-hyd-press',
      name: 'Hydraulic Pitch Actuation Pressure',
      rawValue: telemetry.hydraulicPitchPressureBar,
      unit: 'bar',
      calculatedValue: `${telemetry.hydraulicPitchPressureBar} bar`,
      baselineValue: '190 bar',
      warningThreshold: '< 175 bar',
      criticalThreshold: '< 160 bar',
      deviationText: telemetry.hydraulicPitchPressureBar < 160 ? 'Accumulator bleed down' : telemetry.hydraulicPitchPressureBar < 175 ? 'Low hydraulic reserve' : 'Full feathering authority',
      status: telemetry.hydraulicPitchPressureBar < 160 ? 'Critical' : telemetry.hydraulicPitchPressureBar < 175 ? 'Warning' : 'Normal',
      riskImpact: telemetry.hydraulicPitchPressureBar < 160 ? 15 : telemetry.hydraulicPitchPressureBar < 175 ? 8 : 0,
      explanation: 'Main hydraulic accumulator charge pressure safeguarding high-speed aerodynamic feathering.'
    }
  ];

  // B. Electrical Indicators
  const electrical: CalculatedIndicator[] = [
    {
      id: 'ind-elec-stator',
      name: 'Generator Stator Winding Temp',
      rawValue: telemetry.generatorStatorTempC,
      unit: '°C',
      calculatedValue: `${telemetry.generatorStatorTempC}°C`,
      baselineValue: '75 - 85°C',
      warningThreshold: '>= 95°C',
      criticalThreshold: '>= 110°C',
      deviationText: telemetry.generatorStatorTempC >= 110 ? 'Class F insulation exceedance' : telemetry.generatorStatorTempC >= 95 ? 'Elevated copper resistive heating' : 'Normal thermal dissipation',
      status: telemetry.generatorStatorTempC >= 110 ? 'Critical' : telemetry.generatorStatorTempC >= 95 ? 'Warning' : 'Normal',
      riskImpact: telemetry.generatorStatorTempC >= 110 ? 18 : telemetry.generatorStatorTempC >= 95 ? 10 : 0,
      explanation: 'PT100 RTD embedded elements in the DFIG stator core monitoring insulation stress.'
    },
    {
      id: 'ind-elec-load',
      name: 'Generator Load Capacity Utilization',
      rawValue: telemetry.activePowerKw,
      unit: 'kW',
      calculatedValue: `${loadPct}%`,
      baselineValue: '85 - 100%',
      warningThreshold: '> 102%',
      criticalThreshold: '> 108%',
      deviationText: `${loadPct}% rated nameplate`,
      status: loadPct > 108 ? 'Critical' : loadPct > 102 ? 'Warning' : 'Normal',
      riskImpact: loadPct > 108 ? 10 : loadPct > 102 ? 5 : 0,
      explanation: 'Turbine active power export compared with generator continuous 5.2 MW rating.'
    },
    {
      id: 'ind-elec-converter',
      name: 'Full-Scale Converter IGBT Temp',
      rawValue: telemetry.converterIgbtTempC,
      unit: '°C',
      calculatedValue: `${telemetry.converterIgbtTempC}°C`,
      baselineValue: '65 - 75°C',
      warningThreshold: '>= 82°C',
      criticalThreshold: '>= 92°C',
      deviationText: telemetry.converterIgbtTempC >= 92 ? 'Semiconductor junction stress' : telemetry.converterIgbtTempC >= 82 ? 'Chiller loop heat soak' : 'Cooling loop nominal',
      status: telemetry.converterIgbtTempC >= 92 ? 'Critical' : telemetry.converterIgbtTempC >= 82 ? 'Warning' : 'Normal',
      riskImpact: telemetry.converterIgbtTempC >= 92 ? 14 : telemetry.converterIgbtTempC >= 82 ? 7 : 0,
      explanation: 'Back-to-back 4-quadrant IGBT pulse-width modulation junction heat monitoring.'
    }
  ];

  // C. Performance Indicators
  const expectedKw = calculateExpectedWindPowerKw(telemetry.windSpeedMs, ratedKw);
  const powerCurveDevPct = expectedKw > 0
    ? Number((((expectedKw - telemetry.activePowerKw) / expectedKw) * 100).toFixed(1))
    : 0;

  const performance: CalculatedIndicator[] = [
    {
      id: 'ind-perf-power-curve',
      name: 'Power Curve Deviation',
      rawValue: powerCurveDevPct,
      unit: '%',
      calculatedValue: `${powerCurveDevPct > 0 ? '-' : '+'}${Math.abs(powerCurveDevPct)}%`,
      baselineValue: '± 3.0%',
      warningThreshold: '>= 8.0%',
      criticalThreshold: '>= 15.0%',
      deviationText: powerCurveDevPct >= 15 ? 'Severe aerodynamic underperformance' : powerCurveDevPct >= 8 ? 'Yaw / blade surface drag loss' : 'Conforms to power curve',
      status: powerCurveDevPct >= 15 ? 'Critical' : powerCurveDevPct >= 8 ? 'Warning' : 'Normal',
      riskImpact: powerCurveDevPct >= 15 ? 16 : powerCurveDevPct >= 8 ? 8 : 0,
      explanation: 'Discrepancy between actual MW generation and calibrated IEC 61400-12 power curve at prevailing wind speed.'
    },
    {
      id: 'ind-perf-yaw',
      name: 'Nacelle Yaw Inflow Misalignment',
      rawValue: Number(yawMisalignment.toFixed(1)),
      unit: 'deg',
      calculatedValue: `${yawMisalignment.toFixed(1)}°`,
      baselineValue: '< 3.0°',
      warningThreshold: '>= 8.0°',
      criticalThreshold: '>= 14.0°',
      deviationText: yawMisalignment >= 14 ? 'High cos²(θ) power capture loss' : yawMisalignment >= 8 ? 'Moderate yaw offset' : 'Rotor aligned with wind vector',
      status: yawMisalignment >= 14 ? 'Critical' : yawMisalignment >= 8 ? 'Warning' : 'Normal',
      riskImpact: yawMisalignment >= 14 ? 14 : yawMisalignment >= 8 ? 7 : 0,
      explanation: 'Angle delta between nacelle ultrasonic wind sensor heading and physical yaw brake position.'
    }
  ];

  // D. Thermal Indicators
  const thermal: CalculatedIndicator[] = [
    {
      id: 'ind-therm-oil',
      name: 'Gearbox Sump Lubricating Oil Temp',
      rawValue: telemetry.gearboxOilTempC,
      unit: '°C',
      calculatedValue: `${telemetry.gearboxOilTempC}°C`,
      baselineValue: '60 - 68°C',
      warningThreshold: '>= 74°C',
      criticalThreshold: '>= 82°C',
      deviationText: telemetry.gearboxOilTempC >= 82 ? 'Oil viscosity breakdown risk' : telemetry.gearboxOilTempC >= 74 ? 'High oil cooler heat load' : 'Adequate cooling margin',
      status: telemetry.gearboxOilTempC >= 82 ? 'Critical' : telemetry.gearboxOilTempC >= 74 ? 'Warning' : 'Normal',
      riskImpact: telemetry.gearboxOilTempC >= 82 ? 14 : telemetry.gearboxOilTempC >= 74 ? 7 : 0,
      explanation: 'Forced-circulation synthetic ISO VG 320 sump temperature.'
    },
    {
      id: 'ind-therm-main-brg',
      name: 'Main Low-Speed Rotor Bearing Temp',
      rawValue: telemetry.mainBearingTempC,
      unit: '°C',
      calculatedValue: `${telemetry.mainBearingTempC}°C`,
      baselineValue: '50 - 58°C',
      warningThreshold: '>= 66°C',
      criticalThreshold: '>= 74°C',
      deviationText: telemetry.mainBearingTempC >= 74 ? 'Spherical roller friction' : telemetry.mainBearingTempC >= 66 ? 'Elevated main bearing temp' : 'Normal main bearing load',
      status: telemetry.mainBearingTempC >= 74 ? 'Critical' : telemetry.mainBearingTempC >= 66 ? 'Warning' : 'Normal',
      riskImpact: telemetry.mainBearingTempC >= 74 ? 12 : telemetry.mainBearingTempC >= 66 ? 6 : 0,
      explanation: 'Spherical roller thrust bearing supporting primary 126m rotor gravitational and thrust loads.'
    }
  ];

  // E. Environment / Wind Resource Indicators
  const environment: CalculatedIndicator[] = [
    {
      id: 'ind-env-wind-speed',
      name: 'Prevailing Wind Velocity',
      rawValue: telemetry.windSpeedMs,
      unit: 'm/s',
      calculatedValue: `${telemetry.windSpeedMs} m/s`,
      baselineValue: '8 - 14 m/s',
      warningThreshold: '> 22.0 m/s',
      criticalThreshold: '> 25.0 m/s',
      deviationText: telemetry.windSpeedMs > 25 ? 'High-wind storm cut-out' : telemetry.windSpeedMs > 22 ? 'Near cut-out feathering boundary' : 'Safe operating regime',
      status: telemetry.windSpeedMs > 25 ? 'Critical' : telemetry.windSpeedMs > 22 ? 'Warning' : 'Normal',
      riskImpact: telemetry.windSpeedMs > 25 ? 10 : 0,
      explanation: 'Hub-height anemometer wind speed reference.'
    },
    {
      id: 'ind-env-ti',
      name: 'Turbulence Intensity (TI)',
      rawValue: telemetry.turbulenceIntensityPct,
      unit: '%',
      calculatedValue: `${telemetry.turbulenceIntensityPct}%`,
      baselineValue: '< 10%',
      warningThreshold: '>= 14%',
      criticalThreshold: '>= 18%',
      deviationText: telemetry.turbulenceIntensityPct >= 18 ? 'Extreme cyclic fatigue gusting' : telemetry.turbulenceIntensityPct >= 14 ? 'High turbulence terrain wake' : 'Clean laminar inflow',
      status: telemetry.turbulenceIntensityPct >= 18 ? 'Critical' : telemetry.turbulenceIntensityPct >= 14 ? 'Warning' : 'Normal',
      riskImpact: telemetry.turbulenceIntensityPct >= 18 ? 8 : telemetry.turbulenceIntensityPct >= 14 ? 4 : 0,
      explanation: 'Standard deviation of wind speed divided by mean velocity over a 10-minute sampling window.'
    }
  ];

  // F. History / Degradation Indicators
  const history: CalculatedIndicator[] = [
    {
      id: 'ind-hist-maint',
      name: 'Maintenance Schedule Compliance',
      rawValue: isMaintenanceOverdue ? 'Overdue' : 'On Schedule',
      unit: 'status',
      calculatedValue: isMaintenanceOverdue ? 'Overdue' : 'Compliant',
      baselineValue: 'Current',
      warningThreshold: 'Overdue',
      criticalThreshold: '> 30d Overdue',
      deviationText: isMaintenanceOverdue ? 'Semi-annual lube service window expired' : 'Within maintenance window',
      status: isMaintenanceOverdue ? 'Warning' : 'Normal',
      riskImpact: isMaintenanceOverdue ? 10 : 0,
      explanation: 'Tracking equivalent full load operating hours against OEM service milestone.'
    },
    {
      id: 'ind-hist-recurrence',
      name: 'Historical Recurring Alarm Record',
      rawValue: repeatedIssueCount,
      unit: 'events',
      calculatedValue: `${repeatedIssueCount} alarms`,
      baselineValue: '0',
      warningThreshold: '>= 2',
      criticalThreshold: '>= 3',
      deviationText: repeatedIssueCount >= 3 ? 'Known chronic subsystem anomaly' : 'Isolated transient event',
      status: repeatedIssueCount >= 3 ? 'Critical' : repeatedIssueCount >= 2 ? 'Warning' : 'Normal',
      riskImpact: repeatedIssueCount >= 3 ? 8 : repeatedIssueCount >= 2 ? 4 : 0,
      explanation: 'Multi-week chronic alarm persistence on turbine drivetrain components.'
    }
  ];

  return { mechanical, electrical, performance, thermal, environment, history };
}

// 5. Evaluate Condition Modules from calculated indicators
export function evaluateWindConditionModules(indicators: {
  mechanical: CalculatedIndicator[];
  electrical: CalculatedIndicator[];
  performance: CalculatedIndicator[];
  thermal: CalculatedIndicator[];
  environment: CalculatedIndicator[];
  history: CalculatedIndicator[];
}): ConditionModule[] {
  const calcModuleScore = (inds: CalculatedIndicator[], base = 100): { score: number; status: ConditionStatus } => {
    let penalty = 0;
    let worst: ConditionStatus = 'Normal';
    for (const ind of inds) {
      if (ind.status === 'Critical') {
        penalty += ind.riskImpact * 1.5;
        worst = 'Critical';
      } else if (ind.status === 'Warning') {
        penalty += ind.riskImpact * 1.0;
        if (worst !== 'Critical') worst = 'Warning';
      }
    }
    const score = Math.max(15, Math.min(100, Math.round(base - penalty)));
    return { score, status: worst };
  };

  const mech = calcModuleScore(indicators.mechanical);
  const elec = calcModuleScore(indicators.electrical);
  const perf = calcModuleScore(indicators.performance);
  const therm = calcModuleScore(indicators.thermal);
  const env = calcModuleScore(indicators.environment);
  const hist = calcModuleScore(indicators.history);

  return [
    {
      moduleId: 'mechanical',
      moduleName: 'Mechanical Condition',
      score: mech.score,
      status: mech.status,
      weight: 0.30,
      riskContribution: Math.round((100 - mech.score) * 0.30),
      trend: mech.score < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.mechanical
    },
    {
      moduleId: 'performance',
      moduleName: 'Aerodynamic Performance',
      score: perf.score,
      status: perf.status,
      weight: 0.20,
      riskContribution: Math.round((100 - perf.score) * 0.20),
      trend: perf.score < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.performance
    },
    {
      moduleId: 'thermal',
      moduleName: 'Thermal Condition',
      score: therm.score,
      status: therm.status,
      weight: 0.20,
      riskContribution: Math.round((100 - therm.score) * 0.20),
      trend: therm.score < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.thermal
    },
    {
      moduleId: 'electrical',
      moduleName: 'Electrical / Conversion',
      score: elec.score,
      status: elec.status,
      weight: 0.15,
      riskContribution: Math.round((100 - elec.score) * 0.15),
      trend: elec.score < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.electrical
    },
    {
      moduleId: 'history',
      moduleName: 'Asset History / Degradation',
      score: hist.score,
      status: hist.status,
      weight: 0.10,
      riskContribution: Math.round((100 - hist.score) * 0.10),
      trend: hist.score < 80 ? 'Deteriorating' : 'Stable',
      indicators: indicators.history
    },
    {
      moduleId: 'environment',
      moduleName: 'Wind Resource & Environment',
      score: env.score,
      status: env.status,
      weight: 0.05,
      riskContribution: Math.round((100 - env.score) * 0.05),
      trend: 'Stable',
      indicators: indicators.environment
    }
  ];
}

// 6. Calculate Overall Health Score (Weighted)
export function calculateHealthScore(conditionModules: ConditionModule[]): number {
  const weighted = conditionModules.reduce((sum, m) => sum + m.score * m.weight, 0);
  return Math.max(1, Math.min(100, Math.round(weighted)));
}

// Helper: Resolve metric for rule evaluation
function resolveWindMetric(param: string, asset: WindAsset, telemetry: RawWindTelemetry, plantContext: WindPlantContext): number {
  switch (param) {
    case 'vibrationMmS':
      return telemetry.vibrationMmS;
    case 'gearboxBearingTempC':
      return telemetry.gearboxBearingTempC;
    case 'generatorStatorTempC':
      return telemetry.generatorStatorTempC;
    case 'converterIgbtTempC':
      return telemetry.converterIgbtTempC;
    case 'yawMisalignmentDeg':
      return Math.abs(telemetry.yawHeadingDeg - plantContext.windDirectionDeg);
    case 'pitchSpreadDeg':
      return Math.max(telemetry.bladePitchA, telemetry.bladePitchB, telemetry.bladePitchC) -
             Math.min(telemetry.bladePitchA, telemetry.bladePitchB, telemetry.bladePitchC);
    case 'powerCurveUnderperformancePct': {
      const expKw = calculateExpectedWindPowerKw(telemetry.windSpeedMs, (asset.ratedMW || 5.2) * 1000);
      return expKw > 0 ? Math.max(0, Number((((expKw - telemetry.activePowerKw) / expKw) * 100).toFixed(1))) : 0;
    }
    case 'hydraulicPitchPressureBar':
      return telemetry.hydraulicPitchPressureBar;
    case 'gearboxOilTempC':
      return telemetry.gearboxOilTempC;
    case 'isMaintenanceOverdue':
      return asset.isMaintenanceOverdue ? 1 : 0;
    case 'repeatedIssueCount':
      return asset.activeRecurrenceCount ?? asset.repeatedIssueCount;
    case 'highTurbulenceMechanicalWarning': {
      const isMechWarn = telemetry.vibrationMmS >= 3.0 || telemetry.gearboxBearingTempC >= 75;
      return (telemetry.turbulenceIntensityPct >= 14 && isMechWarn) ? telemetry.turbulenceIntensityPct : 0;
    }
    default:
      return 0;
  }
}

// 7. Evaluate Rules
export function evaluateWindRules(
  asset: WindAsset,
  rules: ReliabilityRule[],
  telemetry: RawWindTelemetry,
  plantContext: WindPlantContext
): RuleResult[] {
  const results: RuleResult[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.assetTypes && !rule.assetTypes.includes('All') && !rule.assetTypes.includes(asset.assetType)) {
      continue;
    }

    const actualValue = resolveWindMetric(rule.parameter, asset, telemetry, plantContext);
    let triggered = false;
    let severity: 'normal' | 'warning' | 'critical' = 'normal';
    let thresholdExceeded = 0;
    let riskImpact = 0;

    if (rule.operator === '>' || rule.operator === '>=') {
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
      const details = `${rule.parameterLabel} of ${actualValue} ${rule.unit} exceeded ${severity === 'critical' ? 'Critical' : 'Warning'} threshold (${thresholdExceeded} ${rule.unit}).`;
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

// 8. Calculate Risk Assessment
export function calculateWindRiskAssessment(
  assetCode: string,
  healthScore: number,
  conditionModules: ConditionModule[],
  ruleResults: RuleResult[],
  criticality: number,
  isMaintenanceOverdue: boolean,
  repeatedIssueCount: number,
  historicalRepeatedIssueCount = 0
): {
  riskScore: number;
  riskLevel: AssetRiskLevel;
  priority: AssetPriority;
  trend: AssetTrend;
  riskContributors: RiskContributor[];
  explainabilitySteps: string[];
} {
  const deterioration = Math.max(0, 100 - healthScore);
  const baseRisk = Math.round(deterioration * 1.05);
  const ruleRisk = ruleResults.reduce((sum, r) => sum + r.riskImpact, 0);
  const criticalityModifier = (criticality >= 5 && ruleResults.some(r => r.severity === 'critical')) ? 4 : 0;
  const historyModifier = (historicalRepeatedIssueCount >= 3 && ruleResults.length === 0)
    ? 15
    : (repeatedIssueCount >= 2 && ruleResults.length <= 1)
    ? 10
    : 0;

  const totalRiskScore = Math.max(5, Math.min(100, baseRisk + ruleRisk + criticalityModifier + historyModifier));
  const riskLevel = determineRiskLevel(totalRiskScore);
  const priority = determinePriority(riskLevel, criticality);

  const deterioratingCount = conditionModules.filter(m => m.trend === 'Deteriorating').length;
  const trend: AssetTrend = (deterioratingCount >= 1 || totalRiskScore >= 60) ? 'Deteriorating' : 'Stable';

  const riskContributors: RiskContributor[] = [
    {
      source: 'Condition Base Risk',
      value: `${healthScore}/100 Health`,
      threshold: '100 Baseline',
      impact: baseRisk,
      explanation: 'Base operational deterioration derived from physical wind turbine condition modules.'
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
      source: 'Turbine Criticality Modifier',
      value: `${criticality}/5 Rating`,
      threshold: '3/5 Base',
      impact: criticalityModifier,
      explanation: `Operational impact rating (${criticality}/5) for primary generating turbine.`
    });
  }

  if (historyModifier > 0) {
    riskContributors.push({
      source: 'Historical Recurrence Bias',
      value: `${historicalRepeatedIssueCount || repeatedIssueCount} Events`,
      threshold: '< 2 Baseline',
      impact: historyModifier,
      explanation: 'Surveillance bias based on recurring anomaly record.'
    });
  }

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
    explainabilitySteps.push('Zero active rule exceedances. Drivetrain vibration, temperatures, and power curve within design margins.');
  }

  const weakestModule = [...conditionModules].sort((a, b) => a.score - b.score)[0];
  explainabilitySteps.push(
    `Primary condition bottleneck is ${weakestModule.moduleName} (Score: ${weakestModule.score}/100, ${weakestModule.status}).`
  );
  explainabilitySteps.push(
    `Overall Health Score computed at ${healthScore}/100 from weighted condition modules.`
  );

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

// 9. Generate Alerts from Rule Results
export function generateWindAlertsFromRules(
  asset: WindAsset,
  ruleResults: RuleResult[],
  existingAlerts: ReliabilityAlert[]
): ReliabilityAlert[] {
  const updatedAlerts: ReliabilityAlert[] = [];
  const activeRuleIds = new Set(ruleResults.map(r => r.rule.ruleId));

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

  const otherAlerts = existingAlerts.filter(a => a.assetId !== asset.assetId);

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

// 10. Generate Recommendations from Alerts
export function generateWindRecommendationsFromAlerts(
  asset: WindAsset,
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
      riskIfIgnored: 'Continued operating under drivetrain vibration & thermal friction risks bearing seizure and multi-week nacelle overhaul.',
      status,
      createdAt: existing?.createdAt || 'Just now'
    });
  }

  for (const existing of existingRecs.filter(r => r.assetId === asset.assetId)) {
    if (!recommendations.some(r => r.recommendationId === existing.recommendationId)) {
      recommendations.push(existing);
    }
  }

  const otherRecs = existingRecs.filter(r => r.assetId !== asset.assetId);
  return [...recommendations, ...otherRecs];
}

// 11. Recalculate single Wind Asset against current state
export function recalculateWindAsset(
  currentAsset: WindAsset,
  rules: ReliabilityRule[],
  plantContext: WindPlantContext,
  existingAlerts?: ReliabilityAlert[]
): WindAsset {
  const activeRecurrence = currentAsset.activeRecurrenceCount ?? currentAsset.repeatedIssueCount;
  const historicalRepeated = currentAsset.historicalRepeatedIssueCount ?? 0;

  const indicators = calculateWindAssetIndicators(
    currentAsset.assetId,
    currentAsset.assetCode,
    currentAsset.assetType,
    currentAsset.ratedMW,
    currentAsset.telemetry,
    plantContext,
    currentAsset.criticality,
    currentAsset.isMaintenanceOverdue,
    activeRecurrence,
    currentAsset.runningHours,
    currentAsset.startsCount
  );

  const conditionModules = evaluateWindConditionModules(indicators);
  const healthScore = calculateHealthScore(conditionModules);

  const triggeredRules = evaluateWindRules(
    currentAsset,
    rules,
    currentAsset.telemetry,
    plantContext
  );

  const riskAssessment = calculateWindRiskAssessment(
    currentAsset.assetCode,
    healthScore,
    conditionModules,
    triggeredRules,
    currentAsset.criticality,
    currentAsset.isMaintenanceOverdue,
    activeRecurrence,
    historicalRepeated
  );

  let mainIssue = 'Nominal aerodynamic & mechanical condition';
  if (triggeredRules.length > 0) {
    const highestCrit = triggeredRules.find(r => r.severity === 'critical') || triggeredRules[0];
    mainIssue = highestCrit.details;
  } else if (healthScore < 85) {
    const weakestModule = [...conditionModules].sort((a, b) => a.score - b.score)[0];
    mainIssue = `${weakestModule.moduleName} under baseline (${weakestModule.score}/100)`;
  }

  const openCount = existingAlerts
    ? existingAlerts.filter(a => a.assetId === currentAsset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed').length
    : triggeredRules.length;

  return {
    ...currentAsset,
    healthScore,
    riskScore: riskAssessment.riskScore,
    riskLevel: riskAssessment.riskLevel,
    priority: riskAssessment.priority,
    riskTrend: riskAssessment.trend,
    mainIssue,
    conditionModules,
    riskContributors: riskAssessment.riskContributors,
    triggeredRules,
    explainabilitySteps: riskAssessment.explainabilitySteps,
    openAlertCount: openCount
  };
}

// 12. Apply Maintenance Feedback Loop (Updates ONLY telemetry, reruns engine)
export function applyWindMaintenanceFeedback(
  asset: WindAsset,
  postTelemetry: Partial<RawWindTelemetry>,
  rules: ReliabilityRule[],
  plantContext: WindPlantContext
): {
  updatedAsset: WindAsset;
  recalculatedRules: RuleResult[];
} {
  const updatedTelemetry: RawWindTelemetry = {
    ...asset.telemetry,
    ...postTelemetry
  };

  const indicators = calculateWindAssetIndicators(
    asset.assetId,
    asset.assetCode,
    asset.assetType,
    asset.ratedMW,
    updatedTelemetry,
    plantContext,
    asset.criticality,
    false, // Maintenance completed -> reset overdue flag
    0,     // Clear active recurring alarms
    asset.runningHours,
    asset.startsCount
  );

  const conditionModules = evaluateWindConditionModules(indicators);
  const healthScore = calculateHealthScore(conditionModules);

  const recalculatedRules = evaluateWindRules(
    asset,
    rules,
    updatedTelemetry,
    plantContext
  );

  const historicalRecurrence = Math.max(
    asset.historicalRepeatedIssueCount ?? 0,
    asset.repeatedIssueCount
  );

  const riskAssessment = calculateWindRiskAssessment(
    asset.assetCode,
    healthScore,
    conditionModules,
    recalculatedRules,
    asset.criticality,
    false,
    0,
    historicalRecurrence
  );

  let mainIssue = 'Post-maintenance verified. Drivetrain telemetry restored to nominal.';
  if (recalculatedRules.length > 0) {
    const highestCrit = recalculatedRules.find(r => r.severity === 'critical') || recalculatedRules[0];
    mainIssue = highestCrit.details;
  }

  const updatedAsset: WindAsset = {
    ...asset,
    telemetry: updatedTelemetry,
    healthScore,
    riskScore: riskAssessment.riskScore,
    riskLevel: riskAssessment.riskLevel,
    priority: riskAssessment.priority,
    riskTrend: 'Improving',
    mainIssue,
    conditionModules,
    riskContributors: riskAssessment.riskContributors,
    triggeredRules: recalculatedRules,
    explainabilitySteps: riskAssessment.explainabilitySteps,
    isMaintenanceOverdue: false,
    hoursSinceMaintenance: 0,
    activeRecurrenceCount: 0,
    historicalRepeatedIssueCount: historicalRecurrence,
    lastMaintenanceDate: 'Today'
  };

  return { updatedAsset, recalculatedRules };
}

// 13. Initialize Wind Fleet State
export function initializeWindFleetReliability(
  baseAssets: WindAsset[],
  rules: ReliabilityRule[],
  plantContext: WindPlantContext
): {
  assets: WindAsset[];
  alerts: ReliabilityAlert[];
  recommendations: ReliabilityRecommendation[];
} {
  let fleetAlerts: ReliabilityAlert[] = [];
  let fleetRecs: ReliabilityRecommendation[] = [];

  const recalculatedAssets = baseAssets.map(asset => {
    const recalculated = recalculateWindAsset(asset, rules, plantContext);
    const assetAlerts = generateWindAlertsFromRules(recalculated, recalculated.triggeredRules, fleetAlerts);
    fleetAlerts = assetAlerts;
    const assetRecs = generateWindRecommendationsFromAlerts(recalculated, assetAlerts, recalculated.triggeredRules, fleetRecs);
    fleetRecs = assetRecs;

    return {
      ...recalculated,
      openAlertCount: assetAlerts.filter(a => a.assetId === asset.assetId && a.status !== 'Resolved' && a.status !== 'Dismissed').length
    };
  });

  return {
    assets: recalculatedAssets,
    alerts: fleetAlerts,
    recommendations: fleetRecs
  };
}
