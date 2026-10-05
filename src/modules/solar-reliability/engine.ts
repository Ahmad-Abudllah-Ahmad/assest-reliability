// Deterministic Reliability Engine for Solar Generation

import {
  SolarAsset,
  RawSolarTelemetry,
  SolarPlantContext,
  CalculatedIndicator,
  ConditionModuleScore,
  ReliabilityRule,
  TriggeredRule,
  ReliabilityAlert,
  PrescriptiveRecommendation,
  AssetHistoryEvent,
  MaintenanceOutcomeInput,
  AssetRiskLevel,
  AssetPriority,
  AssetTrend
} from './types';

// =========================================================================
// 1. CALCULATE DETERMINISTIC INDICATORS FROM RAW SCADA TELEMETRY
// =========================================================================
export function calculateSolarAssetIndicators(
  asset: SolarAsset,
  context: SolarPlantContext
): Record<string, CalculatedIndicator> {
  const tel = asset.telemetry;
  const indicators: Record<string, CalculatedIndicator> = {};

  // For PV Arrays
  if (asset.assetType === 'PV Array') {
    const poa = tel.poaIrradianceWpM2 ?? context.planeOfArrayIrradiancePoa;
    // Expected MW = (POA / 1000) * Rated Capacity MW * Temp Derate Factor (approx 0.96)
    const expectedMW = Number(((poa / 1000) * asset.ratedMW * 0.96).toFixed(2));
    const actualMW = tel.activePowerOutputMW;
    const powerDeficitPct = expectedMW > 0 ? Number((((actualMW - expectedMW) / expectedMW) * 100).toFixed(1)) : 0;
    
    indicators['power_curve_dev'] = {
      key: 'power_curve_dev',
      label: 'Array Yield Deviation',
      currentValue: powerDeficitPct,
      unit: '%',
      benchmarkValue: 0,
      deviation: powerDeficitPct,
      status: powerDeficitPct < -10 ? 'critical' : powerDeficitPct < -5 ? 'warning' : 'normal',
      formulaExplanation: 'Actual DC output vs expected generation based on POA irradiance'
    };

    const trackerDev = tel.trackerTiltAngleDeg !== undefined && tel.expectedTiltAngleDeg !== undefined
      ? Number(Math.abs(tel.trackerTiltAngleDeg - tel.expectedTiltAngleDeg).toFixed(1))
      : 0;

    indicators['tracker_tilt_dev'] = {
      key: 'tracker_tilt_dev',
      label: 'Tracker Tilt Deviation',
      currentValue: trackerDev,
      unit: '°',
      benchmarkValue: 0,
      deviation: trackerDev,
      status: trackerDev > 6 ? 'critical' : trackerDev > 3 ? 'warning' : 'normal',
      formulaExplanation: 'Absolute difference between actual tracker angle and astronomical sun position'
    };

    const modTemp = tel.moduleTempC ?? 34.0;
    const ambTemp = context.ambientTemperatureC ?? 30.0;
    const tempDelta = Number((modTemp - ambTemp).toFixed(1));

    indicators['module_temp_delta'] = {
      key: 'module_temp_delta',
      label: 'Module Temperature Rise',
      currentValue: tempDelta,
      unit: '°C',
      benchmarkValue: 5.0,
      deviation: tempDelta - 5.0,
      status: tempDelta > 15 ? 'critical' : tempDelta > 10 ? 'warning' : 'normal',
      formulaExplanation: 'Cell temperature above ambient. Elevated rise indicates hotspots or soiling'
    };
  }

  // For Inverter PCS Stations
  if (asset.assetType === 'Inverter PCS') {
    const dcIn = tel.dcInputPowerMW ?? (tel.activePowerOutputMW / 0.985);
    const acOut = tel.activePowerOutputMW;
    const eff = dcIn > 0 ? Number(((acOut / dcIn) * 100).toFixed(1)) : 98.6;

    indicators['inverter_efficiency'] = {
      key: 'inverter_efficiency',
      label: 'Conversion Efficiency',
      currentValue: eff,
      unit: '%',
      benchmarkValue: 98.6,
      deviation: Number((eff - 98.6).toFixed(1)),
      status: eff < 95.0 ? 'critical' : eff < 97.0 ? 'warning' : 'normal',
      formulaExplanation: 'AC Power Export divided by DC Power Input'
    };

    const igbtTemp = tel.igbtTempC ?? 48.0;
    indicators['inverter_igbt_temp'] = {
      key: 'inverter_igbt_temp',
      label: 'IGBT Junction Temperature',
      currentValue: igbtTemp,
      unit: '°C',
      benchmarkValue: 48.0,
      deviation: Number((igbtTemp - 48.0).toFixed(1)),
      status: igbtTemp >= 75 ? 'critical' : igbtTemp >= 65 ? 'warning' : 'normal',
      formulaExplanation: 'Maximum thermocouple reading across silicon switching bridges'
    };

    const thd = tel.thdPercent ?? 1.4;
    indicators['inverter_thd'] = {
      key: 'inverter_thd',
      label: 'Total Harmonic Distortion (THD)',
      currentValue: thd,
      unit: '%',
      benchmarkValue: 1.5,
      deviation: Number((thd - 1.5).toFixed(1)),
      status: thd > 3.0 ? 'warning' : 'normal',
      formulaExplanation: 'Harmonic content IEEE 519 compliance (< 2.5% rated)'
    };
  }

  // For Step-Up Transformers
  if (asset.assetType === 'Step-Up Transformer' || asset.assetType === 'Main Substation TR') {
    const topOil = tel.topOilTempC ?? 62.0;
    indicators['transformer_oil_temp'] = {
      key: 'transformer_oil_temp',
      label: 'Top Oil Temperature',
      currentValue: topOil,
      unit: '°C',
      benchmarkValue: 60.0,
      deviation: Number((topOil - 60.0).toFixed(1)),
      status: topOil >= 80 ? 'critical' : topOil >= 72 ? 'warning' : 'normal',
      formulaExplanation: 'Mineral oil dielectric temperature (Warning: 72°C, Trip: 90°C)'
    };

    const loadPct = tel.transformerLoadingPct ?? 82.0;
    indicators['transformer_load'] = {
      key: 'transformer_load',
      label: 'Transformer MVA Loading',
      currentValue: loadPct,
      unit: '%',
      benchmarkValue: 80.0,
      deviation: Number((loadPct - 80.0).toFixed(1)),
      status: loadPct > 95 ? 'critical' : loadPct > 88 ? 'warning' : 'normal',
      formulaExplanation: 'Continuous thermal loading percentage of nameplate MVA capacity'
    };
  }

  // For BESS
  if (asset.assetType === 'BESS') {
    const soc = tel.bessSocPct ?? 88.0;
    const cellTemp = tel.bessCellMaxTempC ?? 24.2;

    indicators['bess_soc'] = {
      key: 'bess_soc',
      label: 'Battery State of Charge (SoC)',
      currentValue: soc,
      unit: '%',
      benchmarkValue: 85.0,
      deviation: Number((soc - 85.0).toFixed(1)),
      status: soc < 10 || soc > 98 ? 'warning' : 'normal',
      formulaExplanation: 'Current usable chemical energy state vs total battery capacity'
    };

    indicators['bess_cell_temp'] = {
      key: 'bess_cell_temp',
      label: 'Battery Cell Max Temp',
      currentValue: cellTemp,
      unit: '°C',
      benchmarkValue: 24.0,
      deviation: Number((cellTemp - 24.0).toFixed(1)),
      status: cellTemp >= 35 ? 'critical' : cellTemp >= 28 ? 'warning' : 'normal',
      formulaExplanation: 'Maximum thermocouple reading across prismatic LFP battery racks'
    };
  }

  // History & Maintenance Indicators (Common to all)
  const hoursSinceMaint = asset.hoursSinceMaintenance;
  indicators['hours_since_maintenance'] = {
    key: 'hours_since_maintenance',
    label: 'Hours Since Last Overhaul',
    currentValue: hoursSinceMaint,
    unit: 'hrs',
    benchmarkValue: 4000,
    deviation: hoursSinceMaint - 4000,
    status: asset.isMaintenanceOverdue ? 'critical' : hoursSinceMaint > 4500 ? 'warning' : 'normal',
    formulaExplanation: 'Operating hours since documented field service sign-off'
  };

  const repeatedCount = asset.repeatedIssueCount;
  indicators['repeated_issue_count'] = {
    key: 'repeated_issue_count',
    label: 'Repeated Incident Frequency',
    currentValue: repeatedCount,
    unit: 'events',
    benchmarkValue: 0,
    deviation: repeatedCount,
    status: repeatedCount >= 3 ? 'critical' : repeatedCount >= 1 ? 'warning' : 'normal',
    formulaExplanation: 'Recurring unresolved alarms within rolling 90-day maintenance window'
  };

  return indicators;
}

// =========================================================================
// 2. EVALUATE 6 SOLAR CONDITION MODULES (0-100)
// =========================================================================
export function evaluateSolarConditionModules(
  asset: SolarAsset,
  indicators: Record<string, CalculatedIndicator>,
  context: SolarPlantContext
): SolarAsset['conditionModules'] {
  const tel = asset.telemetry;

  // A. DC ELECTRICAL (Weight: 0.25)
  let dcScore = 100;
  const dcContributors: string[] = [];
  if (asset.assetType === 'PV Array') {
    if (indicators['tracker_tilt_dev']?.status === 'critical') {
      dcScore -= 30;
      dcContributors.push('Tracker drive misalignment > 6°');
    } else if (indicators['tracker_tilt_dev']?.status === 'warning') {
      dcScore -= 15;
      dcContributors.push('Minor tracker drive tracking lag');
    }
  }
  if (asset.assetType === 'Combiner Box') {
    if (tel.spdStatusOk === false) {
      dcScore -= 40;
      dcContributors.push('Surge Protection Device (SPD) tripped');
    }
  }
  dcScore = Math.max(20, Math.min(100, dcScore));

  // B. CONVERSION / AC ELECTRICAL (Weight: 0.25)
  let acScore = 100;
  const acContributors: string[] = [];
  if (asset.assetType === 'Inverter PCS') {
    const eff = indicators['inverter_efficiency'];
    if (eff?.status === 'critical') {
      acScore -= 40;
      acContributors.push(`Efficiency severe deficit: ${eff.currentValue}% (< 95%)`);
    } else if (eff?.status === 'warning') {
      acScore -= 20;
      acContributors.push(`Efficiency degradation: ${eff.currentValue}%`);
    }
    if (indicators['inverter_thd']?.status === 'warning') {
      acScore -= 10;
      acContributors.push('Elevated harmonic distortion (THD)');
    }
  }
  if (asset.assetType === 'Step-Up Transformer' || asset.assetType === 'Main Substation TR') {
    const load = indicators['transformer_load'];
    if (load?.status === 'critical') {
      acScore -= 30;
      acContributors.push('Transformer overload > 95% rated');
    } else if (load?.status === 'warning') {
      acScore -= 15;
      acContributors.push('High transformer continuous loading');
    }
  }
  acScore = Math.max(20, Math.min(100, acScore));

  // C. THERMAL CONDITION (Weight: 0.20)
  let thermalScore = 100;
  const thermalContributors: string[] = [];
  if (asset.assetType === 'Inverter PCS') {
    const igbt = indicators['inverter_igbt_temp'];
    if (igbt?.status === 'critical') {
      thermalScore -= 45;
      thermalContributors.push(`IGBT thermal threshold exceedance: ${igbt.currentValue}°C`);
    } else if (igbt?.status === 'warning') {
      thermalScore -= 20;
      thermalContributors.push(`Elevated IGBT heat sink temp: ${igbt.currentValue}°C`);
    }
  }
  if (asset.assetType === 'PV Array') {
    const delta = indicators['module_temp_delta'];
    if (delta?.status === 'critical') {
      thermalScore -= 30;
      thermalContributors.push(`Module temp delta +${delta.currentValue}°C above ambient`);
    }
  }
  if (asset.assetType === 'Step-Up Transformer' || asset.assetType === 'Main Substation TR') {
    const oil = indicators['transformer_oil_temp'];
    if (oil?.status === 'critical') {
      thermalScore -= 35;
      thermalContributors.push(`Top oil temperature critical: ${oil.currentValue}°C`);
    } else if (oil?.status === 'warning') {
      thermalScore -= 15;
      thermalContributors.push(`Top oil temperature warning: ${oil.currentValue}°C`);
    }
  }
  if (asset.assetType === 'BESS') {
    const btemp = indicators['bess_cell_temp'];
    if (btemp?.status === 'critical') {
      thermalScore -= 40;
      thermalContributors.push(`BESS cell thermal limit exceedance: ${btemp.currentValue}°C`);
    }
  }
  thermalScore = Math.max(20, Math.min(100, thermalScore));

  // D. PERFORMANCE CONDITION (Weight: 0.15)
  let perfScore = 100;
  const perfContributors: string[] = [];
  if (asset.assetType === 'PV Array') {
    const dev = indicators['power_curve_dev'];
    if (dev?.status === 'critical') {
      perfScore -= 40;
      perfContributors.push(`Array generation underperformance: ${dev.currentValue}%`);
    } else if (dev?.status === 'warning') {
      perfScore -= 20;
      perfContributors.push(`Yield deficit: ${dev.currentValue}%`);
    }
  }
  perfScore = Math.max(20, Math.min(100, perfScore));

  // E. ENVIRONMENT / SOLAR RESOURCE (Weight: 0.05)
  let envScore = 100;
  const envContributors: string[] = [];
  if (context.ambientTemperatureC > 40) {
    envScore -= 20;
    envContributors.push('High ambient temperature derating');
  }
  if (context.windSpeedMps > 15) {
    envScore -= 25;
    envContributors.push('Elevated wind load near tracker stow threshold');
  }

  // F. HISTORY / DEGRADATION (Weight: 0.10)
  let histScore = 100;
  const histContributors: string[] = [];
  if (asset.isMaintenanceOverdue) {
    histScore -= 30;
    histContributors.push('Scheduled preventive maintenance overhaul overdue');
  }
  if (asset.repeatedIssueCount > 0) {
    histScore -= Math.min(40, asset.repeatedIssueCount * 15);
    histContributors.push(`${asset.repeatedIssueCount} recurrent fault instances on this unit`);
  }
  histScore = Math.max(20, Math.min(100, histScore));

  return {
    dcElectrical: {
      moduleName: 'dc_electrical',
      label: 'DC Electrical & Collection',
      score: dcScore,
      weight: 0.25,
      status: dcScore < 70 ? 'critical' : dcScore < 85 ? 'warning' : 'optimal',
      contributors: dcContributors
    },
    conversionAc: {
      moduleName: 'conversion_ac',
      label: 'Conversion & AC Electrical',
      score: acScore,
      weight: 0.25,
      status: acScore < 70 ? 'critical' : acScore < 85 ? 'warning' : 'optimal',
      contributors: acContributors
    },
    thermal: {
      moduleName: 'thermal',
      label: 'Thermal Management',
      score: thermalScore,
      weight: 0.20,
      status: thermalScore < 70 ? 'critical' : thermalScore < 85 ? 'warning' : 'optimal',
      contributors: thermalContributors
    },
    performance: {
      moduleName: 'performance',
      label: 'Yield & Performance Ratio',
      score: perfScore,
      weight: 0.15,
      status: perfScore < 70 ? 'critical' : perfScore < 85 ? 'warning' : 'optimal',
      contributors: perfContributors
    },
    environment: {
      moduleName: 'environment',
      label: 'Solar Resource & Weather',
      score: envScore,
      weight: 0.05,
      status: envScore < 75 ? 'warning' : 'optimal',
      contributors: envContributors
    },
    history: {
      moduleName: 'history',
      label: 'Maintenance History & Degradation',
      score: histScore,
      weight: 0.10,
      status: histScore < 70 ? 'critical' : histScore < 85 ? 'warning' : 'optimal',
      contributors: histContributors
    }
  };
}

// =========================================================================
// 3. HEALTH SCORE CALCULATION
// =========================================================================
export function calculateSolarHealthScore(
  modules: SolarAsset['conditionModules']
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.values(modules).forEach((m) => {
    weightedSum += m.score * m.weight;
    totalWeight += m.weight;
  });

  const finalScore = Math.round(weightedSum / totalWeight);
  return Math.max(0, Math.min(100, finalScore));
}

// =========================================================================
// 4. EVALUATE CONFIGURED RELIABILITY RULES
// =========================================================================
export function evaluateSolarRules(
  asset: SolarAsset,
  indicators: Record<string, CalculatedIndicator>,
  rules: ReliabilityRule[]
): TriggeredRule[] {
  const triggered: TriggeredRule[] = [];
  const applicableRules = rules.filter(
    (r) => r.isEnabled && (r.assetType === asset.assetType || r.assetType === 'PV Array')
  );

  for (const rule of applicableRules) {
    const indicator = indicators[rule.parameterKey];
    if (!indicator) continue;

    const val = indicator.currentValue;
    let isCritical = false;
    let isWarning = false;

    if (rule.comparisonOperator === '>') {
      if (val >= rule.criticalThreshold) isCritical = true;
      else if (val >= rule.warningThreshold) isWarning = true;
    } else if (rule.comparisonOperator === '<') {
      if (val <= rule.criticalThreshold) isCritical = true;
      else if (val <= rule.warningThreshold) isWarning = true;
    }

    if (isCritical || isWarning) {
      const severity = isCritical ? 'critical' : 'warning';
      const riskImpact = isCritical ? rule.criticalRiskImpact : rule.warningRiskImpact;
      const thresh = isCritical ? rule.criticalThreshold : rule.warningThreshold;

      triggered.push({
        ruleId: rule.ruleId,
        ruleName: rule.name,
        severity,
        parameterKey: rule.parameterKey,
        parameterLabel: indicator.label,
        currentValue: val,
        thresholdValue: thresh,
        unit: rule.unit,
        riskImpact,
        priority: rule.priority,
        recommendationTemplate: getRecommendationTemplate(rule.ruleId, asset.assetCode),
        triggeredAt: 'Active Telemetry Cycle'
      });
    }
  }

  return triggered;
}

function getRecommendationTemplate(ruleId: string, assetCode: string): string {
  switch (ruleId) {
    case 'RULE-INV-001':
      return `Perform diagnostic inspection on ${assetCode} PCS liquid cooling loop, clean heat-sink fins, and re-torque IGBT electrical bus bars.`;
    case 'RULE-INV-002':
      return `Inspect ${assetCode} IGBT gate driver firing signals and measure AC filtering capacitors for loss factor.`;
    case 'RULE-PV-001':
      return `Perform drone thermal inspection or string IV-curve tracer sweep on ${assetCode} to locate diode bypasses or localized soiling.`;
    case 'RULE-PV-002':
      return `Inspect single-axis tracker drive slew motor, limit switches, and torque tube bearings on ${assetCode}.`;
    case 'RULE-TR-001':
      return `Service cooling radiator fans on ${assetCode} and take dielectric oil sample for dissolved gas analysis (DGA).`;
    case 'RULE-BESS-001':
      return `Inspect ${assetCode} container HVAC chiller operation and check thermal interface pads on highest-temp rack.`;
    default:
      return `Execute standard diagnostic service on ${assetCode} according to reliability guidelines.`;
  }
}

// =========================================================================
// 5. DETERMINISTIC RISK ENGINE
// =========================================================================
export function calculateSolarRiskAssessment(
  asset: SolarAsset,
  healthScore: number,
  triggeredRules: TriggeredRule[]
): { riskScore: number; riskLevel: AssetRiskLevel; priority: AssetPriority } {
  // Base Risk from health degradation (0 - 35 pts)
  const conditionBaseRisk = (100 - healthScore) * 0.35;

  // Add rule impacts (capped at 45 pts)
  let ruleImpactSum = 0;
  triggeredRules.forEach((r) => {
    ruleImpactSum += r.riskImpact;
  });
  const ruleImpactScore = Math.min(45, ruleImpactSum);

  // Criticality multiplier (1-5 criticality adds up to 10 pts)
  const criticalityModifier = asset.criticality * 2.0;

  // Recurrence modifier (adds up to 10 pts)
  const recurrenceModifier = Math.min(10, asset.repeatedIssueCount * 3.5);

  const rawRisk = conditionBaseRisk + ruleImpactScore + criticalityModifier + recurrenceModifier;
  const riskScore = Math.max(0, Math.min(100, Math.round(rawRisk)));

  let riskLevel: AssetRiskLevel = 'Low';
  if (riskScore >= 75) riskLevel = 'Critical';
  else if (riskScore >= 60) riskLevel = 'High';
  else if (riskScore >= 40) riskLevel = 'Medium';
  else if (riskScore >= 25) riskLevel = 'Moderate';

  let priority: AssetPriority = 'P4';
  if (riskScore >= 70 || triggeredRules.some((r) => r.priority === 'P1')) {
    priority = 'P1';
  } else if (riskScore >= 50 || triggeredRules.some((r) => r.priority === 'P2')) {
    priority = 'P2';
  } else if (riskScore >= 28) {
    priority = 'P3';
  }

  return { riskScore, riskLevel, priority };
}

// =========================================================================
// 6. GENERATE DETERMINISTIC ALERTS & RECOMMENDATIONS
// =========================================================================
export function generateSolarAlertsFromRules(
  asset: SolarAsset,
  triggeredRules: TriggeredRule[]
): ReliabilityAlert[] {
  return triggeredRules.map((rule, idx) => {
    const alertId = `ALT-SOL-${asset.assetCode}-${rule.ruleId.replace('RULE-', '')}`;
    const recId = `REC-SOL-${asset.assetCode}-${rule.ruleId.replace('RULE-', '')}`;

    return {
      alertId,
      assetId: asset.assetId,
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      alertTitle: `${rule.parameterLabel} ${rule.severity === 'critical' ? 'Exceedance' : 'Warning'}`,
      conditionModule: rule.parameterKey.includes('temp') || rule.parameterKey.includes('igbt') ? 'Thermal' : 'Conversion & AC',
      triggeredRuleId: rule.ruleId,
      triggerCondition: `${rule.parameterLabel} reached ${rule.currentValue} ${rule.unit} (${rule.severity === 'critical' ? 'Critical' : 'Warning'} threshold: ${rule.thresholdValue} ${rule.unit})`,
      currentValue: `${rule.currentValue} ${rule.unit}`,
      thresholdValue: `${rule.thresholdValue} ${rule.unit}`,
      riskImpact: rule.riskImpact,
      riskLevel: asset.riskLevel,
      priority: rule.priority,
      recommendationId: recId,
      recommendationText: rule.recommendationTemplate,
      status: 'Active',
      createdAt: '14:30 SCADA Telemetry Stream',
      traceability: {
        rawData: `Sensors on ${asset.assetCode} measured ${rule.parameterKey} = ${rule.currentValue} ${rule.unit}`,
        indicator: `${rule.parameterLabel} = ${rule.currentValue} ${rule.unit} (Deviation detected)`,
        rule: `${rule.ruleId}: ${rule.ruleName}`,
        conditionModule: `Condition decreased to ${asset.conditionModules.thermal.score}/100`,
        conditionImpact: `Health index dropped by ${Math.round(rule.riskImpact * 0.7)} pts`,
        riskImpact: `Asset risk increased by +${rule.riskImpact} pts`,
        overallRisk: `Asset overall risk escalated to ${asset.riskScore}/100 (${asset.riskLevel})`,
        recommendation: rule.recommendationTemplate
      }
    };
  });
}

export function generateSolarRecommendationsFromAlerts(
  alerts: ReliabilityAlert[]
): PrescriptiveRecommendation[] {
  return alerts.map((alert) => ({
    recommendationId: alert.recommendationId,
    sourceAlertId: alert.alertId,
    assetId: alert.assetId,
    assetCode: alert.assetCode,
    assetName: alert.assetName,
    actionType: alert.alertTitle.includes('Thermal') || alert.alertTitle.includes('IGBT') ? 'Thermal Check' : 'Inspect & Service',
    recommendationText: alert.recommendationText,
    riskReductionEstimate: Math.round(alert.riskImpact * 1.5),
    estimatedEffortHours: 3.5,
    priority: alert.priority,
    requiredParts: alert.assetCode.startsWith('INV') 
      ? ['Thermal Interface Compound', 'Coolant Filter Cartridge', 'IGBT Gate Driver Board']
      : ['PV In-line Fuse', 'Tracker Slew Drive Seal', 'Connector Kit'],
    riskIfIgnored: 'Sustained thermal degradation may cause component burnout, inverter emergency trip, and energy yield loss.',
    status: 'Pending',
    createdAt: alert.createdAt
  }));
}

// =========================================================================
// 7. FULL RECALCULATION PIPELINE FOR A SINGLE ASSET
// =========================================================================
export function recalculateSolarAsset(
  asset: SolarAsset,
  rules: ReliabilityRule[],
  context: SolarPlantContext
): SolarAsset {
  const indicators = calculateSolarAssetIndicators(asset, context);
  const conditionModules = evaluateSolarConditionModules(asset, indicators, context);
  const healthScore = calculateSolarHealthScore(conditionModules);
  const triggeredRules = evaluateSolarRules(asset, indicators, rules);
  const { riskScore, riskLevel, priority } = calculateSolarRiskAssessment(asset, healthScore, triggeredRules);

  const mainIssue = triggeredRules.length > 0 
    ? `${triggeredRules[0].parameterLabel} ${triggeredRules[0].severity === 'critical' ? 'Critical' : 'Elevated'}`
    : 'All subsystems within nominal operational parameters';

  let riskTrend: AssetTrend = 'stable';
  if (riskScore >= 60) riskTrend = 'deteriorating';
  else if (riskScore <= 25) riskTrend = 'improving';

  return {
    ...asset,
    healthScore,
    riskScore,
    riskLevel,
    priority,
    riskTrend,
    mainIssue,
    indicators,
    conditionModules,
    triggeredRules,
    openAlertCount: triggeredRules.length
  };
}

// =========================================================================
// 8. APPLY MAINTENANCE OUTCOME FEEDBACK LOOP
// =========================================================================
export function applySolarMaintenanceFeedback(
  asset: SolarAsset,
  outcome: MaintenanceOutcomeInput,
  rules: ReliabilityRule[],
  context: SolarPlantContext
): {
  updatedAsset: SolarAsset;
  historyEvents: AssetHistoryEvent[];
} {
  const beforeHealth = asset.healthScore;
  const beforeRisk = asset.riskScore;

  // 1. Update only raw SCADA telemetry
  const updatedTelemetry: RawSolarTelemetry = {
    ...asset.telemetry,
    ...outcome.postMaintenanceTelemetry
  };

  const stagedAsset: SolarAsset = {
    ...asset,
    telemetry: updatedTelemetry,
    isMaintenanceOverdue: false,
    hoursSinceMaintenance: 0,
    repeatedIssueCount: 0,
    lastMaintenanceDate: new Date().toISOString().split('T')[0]
  };

  // 2. Run the exact same deterministic pipeline
  const updatedAsset = recalculateSolarAsset(stagedAsset, rules, context);

  // 3. Create historical events
  const historyEvents: AssetHistoryEvent[] = [
    {
      id: `evt-${Date.now()}-1`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assetCode: asset.assetCode,
      eventType: 'maintenance_completed',
      headline: `Maintenance Completed via ${outcome.woNumber}`,
      details: outcome.actualAction,
      badge: 'Work Order Closed'
    },
    {
      id: `evt-${Date.now()}-2`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assetCode: asset.assetCode,
      eventType: 'risk_normalized',
      headline: `Health Restored to ${updatedAsset.healthScore}/100, Risk Dropped to ${updatedAsset.riskScore}/100`,
      details: `Raw telemetry verified: IGBT temp restored to ${updatedAsset.telemetry.igbtTempC ?? 48}°C. Health improved by +${updatedAsset.healthScore - beforeHealth} pts; Risk decreased by -${beforeRisk - updatedAsset.riskScore} pts.`,
      badge: 'Reliability Recalculated'
    }
  ];

  return { updatedAsset, historyEvents };
}
