export type InverterStatus = 'Online' | 'Fault' | 'Derated';
export type TrackerStatus = 'Tracking' | 'Stowed' | 'Manual';
export type MotorHealth = 'Healthy' | 'Degraded';

export interface SolarInverter {
  id: string;
  name: string;
  status: InverterStatus;
  acPowerKw: number;
  dcVoltageV: number;
  dcCurrentA: number;
  internalTempC: number;
  efficiencyPct: number;
  rulMonths: number;
  dailyEnergyMwh: number;
  expectedDailyMwh: number;
  sparkline6h: number[];
}

export interface SolarTrackerZone {
  id: string;
  name: string;
  tiltDeg: number;
  trackingStatus: TrackerStatus;
  motorHealth: MotorHealth;
}

export interface BessAsset {
  id: string;
  name: string;
  socPct: number;
  powerMw: number;
  mode: 'Charging' | 'Discharging' | 'Idle';
  cellTempC: number;
  cycleCount: number;
  ratedCycles: number;
}

export interface SolarGenerationPoint {
  time: string;
  actualMw: number;
  expectedMw: number;
}

export interface SolarPrPoint {
  day: string;
  prPct: number;
}

export interface BessSocPoint {
  time: string;
  socPct: number;
  chargePct: number | null;
  dischargePct: number | null;
}

export const SOLAR_INVERTERS: SolarInverter[] = [
  { id: 'INV-01', name: 'Central Inverter 01', status: 'Online', acPowerKw: 7840, dcVoltageV: 1182, dcCurrentA: 682, internalTempC: 46.2, efficiencyPct: 97.6, rulMonths: 74, dailyEnergyMwh: 58.4, expectedDailyMwh: 59.1, sparkline6h: [6120, 7010, 7480, 7840, 7790, 7840] },
  { id: 'INV-02', name: 'Central Inverter 02', status: 'Online', acPowerKw: 7710, dcVoltageV: 1174, dcCurrentA: 674, internalTempC: 47.8, efficiencyPct: 97.4, rulMonths: 71, dailyEnergyMwh: 57.1, expectedDailyMwh: 58.4, sparkline6h: [5980, 6880, 7320, 7650, 7710, 7710] },
  { id: 'INV-03', name: 'Central Inverter 03', status: 'Derated', acPowerKw: 6120, dcVoltageV: 1098, dcCurrentA: 581, internalTempC: 56.4, efficiencyPct: 95.1, rulMonths: 28, dailyEnergyMwh: 44.2, expectedDailyMwh: 58.0, sparkline6h: [5400, 5680, 5910, 6050, 6120, 6120] },
  { id: 'INV-04', name: 'Central Inverter 04', status: 'Derated', acPowerKw: 6480, dcVoltageV: 1124, dcCurrentA: 602, internalTempC: 57.8, efficiencyPct: 91.2, rulMonths: 4, dailyEnergyMwh: 41.6, expectedDailyMwh: 59.2, sparkline6h: [7100, 6820, 6610, 6520, 6480, 6480] },
  { id: 'INV-05', name: 'Central Inverter 05', status: 'Online', acPowerKw: 7688, dcVoltageV: 1176, dcCurrentA: 671, internalTempC: 48.6, efficiencyPct: 97.2, rulMonths: 66, dailyEnergyMwh: 56.8, expectedDailyMwh: 57.9, sparkline6h: [5880, 6790, 7280, 7610, 7688, 7688] },
  { id: 'INV-06', name: 'Central Inverter 06', status: 'Fault', acPowerKw: 0, dcVoltageV: 42, dcCurrentA: 0, internalTempC: 38.2, efficiencyPct: 0, rulMonths: 9, dailyEnergyMwh: 6.4, expectedDailyMwh: 58.2, sparkline6h: [4200, 1800, 400, 0, 0, 0] },
  { id: 'INV-07', name: 'Central Inverter 07', status: 'Online', acPowerKw: 7812, dcVoltageV: 1184, dcCurrentA: 679, internalTempC: 46.9, efficiencyPct: 97.5, rulMonths: 69, dailyEnergyMwh: 58.0, expectedDailyMwh: 58.8, sparkline6h: [6040, 6960, 7420, 7780, 7812, 7812] },
  { id: 'INV-08', name: 'Central Inverter 08', status: 'Online', acPowerKw: 7210, dcVoltageV: 1168, dcCurrentA: 640, internalTempC: 58.0, efficiencyPct: 96.1, rulMonths: 54, dailyEnergyMwh: 52.4, expectedDailyMwh: 57.4, sparkline6h: [5900, 6800, 7100, 7250, 7210, 7210] },
  { id: 'INV-09', name: 'Central Inverter 09', status: 'Online', acPowerKw: 7888, dcVoltageV: 1188, dcCurrentA: 685, internalTempC: 44.8, efficiencyPct: 97.7, rulMonths: 77, dailyEnergyMwh: 59.1, expectedDailyMwh: 59.4, sparkline6h: [6180, 7090, 7560, 7888, 7860, 7888] },
  { id: 'INV-10', name: 'Central Inverter 10', status: 'Online', acPowerKw: 7740, dcVoltageV: 1179, dcCurrentA: 676, internalTempC: 47.1, efficiencyPct: 97.3, rulMonths: 72, dailyEnergyMwh: 57.6, expectedDailyMwh: 58.5, sparkline6h: [6010, 6920, 7380, 7700, 7740, 7740] }
];

export const SOLAR_TRACKERS: SolarTrackerZone[] = [
  { id: 'ZONE-A', name: 'Tracker Zone A', tiltDeg: 28.4, trackingStatus: 'Tracking', motorHealth: 'Healthy' },
  { id: 'ZONE-B', name: 'Tracker Zone B', tiltDeg: 15.0, trackingStatus: 'Stowed', motorHealth: 'Degraded' },
  { id: 'ZONE-C', name: 'Tracker Zone C', tiltDeg: 12.6, trackingStatus: 'Stowed', motorHealth: 'Degraded' },
  { id: 'ZONE-D', name: 'Tracker Zone D', tiltDeg: 26.8, trackingStatus: 'Manual', motorHealth: 'Healthy' }
];

export const SOLAR_BESS: BessAsset = {
  id: 'BESS-01',
  name: 'Block 1 Battery Energy Storage',
  socPct: 68,
  powerMw: -12.4,
  mode: 'Discharging',
  cellTempC: 31.6,
  cycleCount: 1847,
  ratedCycles: 6000
};

function bellMw(hour: number, peak = 78.4): number {
  const noon = 12.5;
  const sigma = 3.05;
  const v = Math.exp(-((hour - noon) ** 2) / (2 * sigma ** 2));
  if (hour < 6 || hour > 20) return 0;
  return Number((peak * v).toFixed(2));
}

export const SOLAR_GENERATION_CURVE: SolarGenerationPoint[] = Array.from({ length: 29 }, (_, i) => {
  const hour = 6 + i * 0.5;
  const h = Math.floor(hour);
  const m = hour % 1 === 0 ? '00' : '30';
  const time = `${String(h).padStart(2, '0')}:${m}`;
  const expectedMw = bellMw(hour, 81.2);
  const cloudDip = hour >= 14 && hour <= 15.5 ? 0.86 : 1;
  const soiling = 0.968;
  const actualMw = Number((bellMw(hour, 78.4) * cloudDip * soiling).toFixed(2));
  return { time, actualMw, expectedMw };
});

export const SOLAR_PR_TREND: SolarPrPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const soilingDrag = i * 0.085;
  const weekendWash = day === 22 ? 2.4 : 0;
  const cloudHit = day === 11 || day === 19 ? 6.2 : 0;
  const prPct = Number((86.8 - soilingDrag + weekendWash - cloudHit + ((day % 4) - 1.5) * 0.35).toFixed(1));
  return { day: `${day}`, prPct };
});

export const SOLAR_BESS_SOC: BessSocPoint[] = (
  [
    { time: '00:00', soc: 72 },
    { time: '02:00', soc: 61 },
    { time: '04:00', soc: 48 },
    { time: '06:00', soc: 41 },
    { time: '08:00', soc: 46 },
    { time: '10:00', soc: 58 },
    { time: '12:00', soc: 74 },
    { time: '14:00', soc: 88 },
    { time: '16:00', soc: 91 },
    { time: '18:00', soc: 79 },
    { time: '20:00', soc: 71 },
    { time: '22:00', soc: 69 },
    { time: '24:00', soc: 68 }
  ] as { time: string; soc: number }[]
).map((row, idx, arr) => {
  const prev = idx === 0 ? row.soc : arr[idx - 1].soc;
  const charging = row.soc >= prev;
  return {
    time: row.time,
    socPct: row.soc,
    chargePct: charging ? row.soc : null,
    dischargePct: charging ? null : row.soc
  };
});

export const SOLAR_KPIS = {
  totalOutputMw: 72.3,
  capacityMwp: 100,
  performanceRatioPct: 82.4,
  specificYield: 4.8,
  soilingLossPct: 3.2,
  inverterAvailabilityPct: 98.1
};

export const SOLAR_INVERTER_AVG_MWH =
  SOLAR_INVERTERS.reduce((acc, inv) => acc + inv.dailyEnergyMwh, 0) / SOLAR_INVERTERS.length;

export const SOLAR_ANOMALIES = [
  { id: 'AN-S01', asset: 'INV-04', title: 'INV-04 efficiency dropped to 91.2%', detail: 'Linear decline from 97.1% over 45 days. AI predicts DC-link capacitor failure in 18 days.', severity: 'Critical' as const },
  { id: 'AN-S02', asset: 'Zone B', title: 'Zone B tracker stalled at 15° (rows 7–12)', detail: 'Motor controller unresponsive since 09:00. Zone losing ~22% energy until rows are released.', severity: 'High' as const },
  { id: 'AN-S03', asset: 'String 7A-12', title: 'String 7A-12 DC voltage 18% below neighbors', detail: 'Thermal imaging confirms 3 hotspot cells. Arc-fault risk if string remains paralleled.', severity: 'High' as const }
];

export const SOLAR_WATERFALL = [
  { name: 'Nameplate', display: 100, base: 0, amount: 100, fill: '#3b82f6' },
  { name: 'Aging −0.6', display: -0.6, base: 99.4, amount: 0.6, fill: '#fb7185' },
  { name: 'Soiling −3.2', display: -3.2, base: 96.2, amount: 3.2, fill: '#fb7185' },
  { name: 'Inverter −1.8', display: -1.8, base: 94.4, amount: 1.8, fill: '#fb7185' },
  { name: 'Clipping −0.9', display: -0.9, base: 93.5, amount: 0.9, fill: '#fb7185' },
  { name: 'Wiring −0.4', display: -0.4, base: 93.1, amount: 0.4, fill: '#fb7185' },
  { name: 'GII vs STC', display: -20.8, base: 72.3, amount: 20.8, fill: '#fb7185' },
  { name: 'Net 72.3 MW', display: 72.3, base: 0, amount: 72.3, fill: '#10b981' }
];

export const SOLAR_STRING_SPREAD = [
  { inv: 'INV-01', min: 1164, max: 1196, outlier: false },
  { inv: 'INV-02', min: 1158, max: 1190, outlier: false },
  { inv: 'INV-03', min: 1072, max: 1128, outlier: false },
  { inv: 'INV-04', min: 1098, max: 1188, outlier: false },
  { inv: 'INV-05', min: 1160, max: 1192, outlier: false },
  { inv: 'INV-06', min: 38, max: 96, outlier: true },
  { inv: 'INV-07', min: 1166, max: 1194, outlier: false },
  { inv: 'INV-08', min: 1148, max: 1182, outlier: false },
  { inv: 'INV-09', min: 1170, max: 1198, outlier: false },
  { inv: 'INV-10', min: 980, max: 1191, outlier: true }
];

export const SOLAR_INSPECTIONS = [
  { id: 'INS-S01', title: 'INV-04 DC-Link Capacitor Degradation', urgency: 'CRITICAL', detail: 'Efficiency dropped from 97.1% to 91.2% over 45 days. AI predicts total failure in 18 days.' },
  { id: 'INS-S02', title: 'Zone B Tracker Row 7-12 Stall', urgency: 'HIGH', detail: 'Stuck at 15° since 09:00. Motor controller unresponsive. 22% zone energy loss.' },
  { id: 'INS-S03', title: 'String 7A-12 Hotspot Damage', urgency: 'HIGH', detail: 'DC voltage 18% below neighbors. Thermal imaging confirms 3 cells with hotspots.' },
  { id: 'INS-S04', title: 'BESS Rack 3 Cell Imbalance', urgency: 'MEDIUM', detail: 'Cells 14-18 showing 0.15V deviation. SOC drift accelerating.' }
];

export const SOLAR_MAINT_HISTORY = [
  { id: 'MH-S01', text: 'Zone A Panel Cleaning', when: '5 days ago', unknown: false },
  { id: 'MH-S02', text: 'INV-02 Fan Replacement', when: '18 days ago', unknown: false },
  { id: 'MH-S03', text: 'Annual Thermal Imaging Drone Scan', when: '42 days ago', unknown: false },
  { id: 'MH-S04', text: 'BESS Firmware Update v3.2', when: '30 days ago', unknown: false },
  { id: 'MH-S05', text: 'INV-07 DC fuse swap (combiner 3)', when: '11 days ago', unknown: false },
  { id: 'MH-S06', text: 'Zone D tracker encoder recalibration', when: '21 days ago', unknown: false },
  { id: 'MH-S07', text: 'Zone C afternoon output 9% below model — no inverter, soiling, or tracker fault detected', when: '4 days ago', unknown: true },
  { id: 'MH-S08', text: 'INV-09 brief 480 V AC flicker at 12:18 — no grid event logged at POI', when: '2 days ago', unknown: true }
];

export const SOLAR_PR_12M = [
  { month: 'Oct', prPct: 86.2 },
  { month: 'Nov', prPct: 85.4 },
  { month: 'Dec', prPct: 83.1 },
  { month: 'Jan', prPct: 82.6 },
  { month: 'Feb', prPct: 83.8 },
  { month: 'Mar', prPct: 84.9 },
  { month: 'Apr', prPct: 85.7 },
  { month: 'May', prPct: 84.4 },
  { month: 'Jun', prPct: 83.2 },
  { month: 'Jul', prPct: 82.8 },
  { month: 'Aug', prPct: 82.1 },
  { month: 'Sep', prPct: 82.4 }
];

export const SOLAR_FAILURE_DONUT = [
  { name: 'Inverter Faults', value: 40, color: '#f43f5e' },
  { name: 'Panel Defects', value: 25, color: '#f59e0b' },
  { name: 'Tracker Issues', value: 15, color: '#3b82f6' },
  { name: 'BESS Alerts', value: 10, color: '#8b5cf6' },
  { name: 'Wiring/Combiner', value: 10, color: '#94a3b8' }
];

export const SOLAR_TASKS = [
  { rank: 1, title: 'Emergency Replace INV-04 DC-Link Capacitors', asset: 'INV-04', caseId: 'CAS-S01', rationale: 'INV-04 handles 10 MWp of strings. At 91.2% efficiency it is losing 880 kWh/day vs fleet avg. Full failure in 18 days would shut down 10% of the farm.', yieldSaved: '+$12,600/day restored to full efficiency', downtime: 'Prevents 10% farm shutdown', clearance: 'lockout' as const, clearanceText: 'DC strings must be isolated — schedule for nightfall or cloudy day' },
  { rank: 2, title: 'Repair Zone B Tracker Controller (Rows 7-12)', asset: 'Zone B', caseId: 'CAS-S02', rationale: '12 tracker rows stuck. Zone B losing 22% output. Each hour of delay costs $340.', yieldSaved: '+$8,160/day', downtime: '0 (can repair while farm operates)', clearance: 'safe' as const, clearanceText: 'SAFE — mechanical access only' },
  { rank: 3, title: 'Replace Hotspot Panels on String 7A-12', asset: 'String 7A-12', caseId: 'CAS-S03', rationale: '3 damaged cells pulling entire string down. Risk of arc fault and fire if left unrepaired.', yieldSaved: '+$1,200/day', downtime: '2 hrs per panel swap', clearance: 'lockout' as const, clearanceText: 'DC string must be disconnected' },
  { rank: 4, title: 'Rebalance BESS Rack 3 Cells', asset: 'BESS-01', caseId: 'CAS-S04', rationale: 'Cell imbalance reduces effective capacity by 8%. Left unchecked, accelerates degradation of healthy cells.', yieldSaved: '+$3,200/month in dispatch capacity', downtime: '4 hrs (software rebalance)', clearance: 'safe' as const, clearanceText: 'SAFE — BMS access only' },
  { rank: 5, title: 'Schedule Zone D Panel Cleaning', asset: 'Zone D', caseId: 'CAS-S05', rationale: 'Soiling at 6.1% loss. Cleaning cost: $1,800. Energy recovery: $3,900 over next 14 days. Net ROI: +$2,100.', yieldSaved: '+$3,900 over 14 days', downtime: '0 (cleaning during operation)', clearance: 'safe' as const, clearanceText: 'SAFE' }
];

export const SOLAR_CASE_TELEMETRY: Record<string, { metricName: string; observedValue: string; thresholdValue: string; telemetryPoints: { time: string; value: number; baseline: number; unit: string }[] }> = {
  'CAS-S01': {
    metricName: 'INVERTER CONVERSION EFFICIENCY',
    observedValue: '91.2 %',
    thresholdValue: '96.0 %',
    telemetryPoints: [
      { time: '06:00', value: 96.2, baseline: 96.0, unit: '%' },
      { time: '09:00', value: 95.1, baseline: 96.0, unit: '%' },
      { time: '12:00', value: 93.8, baseline: 96.0, unit: '%' },
      { time: '15:00', value: 92.4, baseline: 96.0, unit: '%' },
      { time: '18:00', value: 91.2, baseline: 96.0, unit: '%' }
    ]
  },
  'INV-04': {
    metricName: 'INVERTER CONVERSION EFFICIENCY',
    observedValue: '91.2 %',
    thresholdValue: '96.0 %',
    telemetryPoints: [
      { time: '06:00', value: 96.2, baseline: 96.0, unit: '%' },
      { time: '09:00', value: 95.1, baseline: 96.0, unit: '%' },
      { time: '12:00', value: 93.8, baseline: 96.0, unit: '%' },
      { time: '15:00', value: 92.4, baseline: 96.0, unit: '%' },
      { time: '18:00', value: 91.2, baseline: 96.0, unit: '%' }
    ]
  },
  'CAS-S08': {
    metricName: 'INVERTER INTERNAL TEMPERATURE',
    observedValue: '58.4 °C',
    thresholdValue: '55.0 °C',
    telemetryPoints: [
      { time: '06:00', value: 42.1, baseline: 55.0, unit: '°C' },
      { time: '09:00', value: 46.5, baseline: 55.0, unit: '°C' },
      { time: '12:00', value: 52.3, baseline: 55.0, unit: '°C' },
      { time: '15:00', value: 57.8, baseline: 55.0, unit: '°C' },
      { time: '18:00', value: 58.4, baseline: 55.0, unit: '°C' }
    ]
  },
  'INV-08': {
    metricName: 'INVERTER INTERNAL TEMPERATURE',
    observedValue: '58.4 °C',
    thresholdValue: '55.0 °C',
    telemetryPoints: [
      { time: '06:00', value: 42.1, baseline: 55.0, unit: '°C' },
      { time: '09:00', value: 46.5, baseline: 55.0, unit: '°C' },
      { time: '12:00', value: 52.3, baseline: 55.0, unit: '°C' },
      { time: '15:00', value: 57.8, baseline: 55.0, unit: '°C' },
      { time: '18:00', value: 58.4, baseline: 55.0, unit: '°C' }
    ]
  },
  'CAS-S02': {
    metricName: 'TRACKER ANGULAR DEVIATION',
    observedValue: '21.0 °',
    thresholdValue: '3.0 °',
    telemetryPoints: [
      { time: '07:00', value: 0.8, baseline: 3.0, unit: '°' },
      { time: '09:00', value: 4.2, baseline: 3.0, unit: '°' },
      { time: '12:00', value: 12.6, baseline: 3.0, unit: '°' },
      { time: '15:00', value: 18.4, baseline: 3.0, unit: '°' },
      { time: '18:00', value: 21.0, baseline: 3.0, unit: '°' }
    ]
  },
  'Zone B': {
    metricName: 'TRACKER ANGULAR DEVIATION',
    observedValue: '21.0 °',
    thresholdValue: '3.0 °',
    telemetryPoints: [
      { time: '07:00', value: 0.8, baseline: 3.0, unit: '°' },
      { time: '09:00', value: 4.2, baseline: 3.0, unit: '°' },
      { time: '12:00', value: 12.6, baseline: 3.0, unit: '°' },
      { time: '15:00', value: 18.4, baseline: 3.0, unit: '°' },
      { time: '18:00', value: 21.0, baseline: 3.0, unit: '°' }
    ]
  },
  'CAS-S03': {
    metricName: 'STRING DC VOLTAGE',
    observedValue: '928 V',
    thresholdValue: '1,100 V',
    telemetryPoints: [
      { time: '08:00', value: 1148, baseline: 1100, unit: 'V' },
      { time: '10:00', value: 1130, baseline: 1100, unit: 'V' },
      { time: '12:00', value: 985, baseline: 1100, unit: 'V' },
      { time: '14:00', value: 935, baseline: 1100, unit: 'V' },
      { time: '16:00', value: 928, baseline: 1100, unit: 'V' }
    ]
  },
  'String 7A-12': {
    metricName: 'STRING DC VOLTAGE',
    observedValue: '928 V',
    thresholdValue: '1,100 V',
    telemetryPoints: [
      { time: '08:00', value: 1148, baseline: 1100, unit: 'V' },
      { time: '10:00', value: 1130, baseline: 1100, unit: 'V' },
      { time: '12:00', value: 985, baseline: 1100, unit: 'V' },
      { time: '14:00', value: 935, baseline: 1100, unit: 'V' },
      { time: '16:00', value: 928, baseline: 1100, unit: 'V' }
    ]
  },
  'CAS-S04': {
    metricName: 'MAX CELL VOLTAGE DELTA',
    observedValue: '148 mV',
    thresholdValue: '50 mV',
    telemetryPoints: [
      { time: '00:00', value: 18, baseline: 50, unit: 'mV' },
      { time: '06:00', value: 32, baseline: 50, unit: 'mV' },
      { time: '12:00', value: 68, baseline: 50, unit: 'mV' },
      { time: '18:00', value: 112, baseline: 50, unit: 'mV' },
      { time: '22:00', value: 148, baseline: 50, unit: 'mV' }
    ]
  },
  'BESS-01': {
    metricName: 'MAX CELL VOLTAGE DELTA',
    observedValue: '148 mV',
    thresholdValue: '50 mV',
    telemetryPoints: [
      { time: '00:00', value: 18, baseline: 50, unit: 'mV' },
      { time: '06:00', value: 32, baseline: 50, unit: 'mV' },
      { time: '12:00', value: 68, baseline: 50, unit: 'mV' },
      { time: '18:00', value: 112, baseline: 50, unit: 'mV' },
      { time: '22:00', value: 148, baseline: 50, unit: 'mV' }
    ]
  },
  'CAS-S05': {
    metricName: 'ZONE D SOILING LOSS',
    observedValue: '6.1 %',
    thresholdValue: '5.0 %',
    telemetryPoints: [
      { time: 'Day 1', value: 2.1, baseline: 5.0, unit: '%' },
      { time: 'Day 4', value: 3.4, baseline: 5.0, unit: '%' },
      { time: 'Day 8', value: 4.6, baseline: 5.0, unit: '%' },
      { time: 'Day 11', value: 5.5, baseline: 5.0, unit: '%' },
      { time: 'Day 14', value: 6.1, baseline: 5.0, unit: '%' }
    ]
  },
  'Zone D': {
    metricName: 'ZONE D SOILING LOSS',
    observedValue: '6.1 %',
    thresholdValue: '5.0 %',
    telemetryPoints: [
      { time: 'Day 1', value: 2.1, baseline: 5.0, unit: '%' },
      { time: 'Day 4', value: 3.4, baseline: 5.0, unit: '%' },
      { time: 'Day 8', value: 4.6, baseline: 5.0, unit: '%' },
      { time: 'Day 11', value: 5.5, baseline: 5.0, unit: '%' },
      { time: 'Day 14', value: 6.1, baseline: 5.0, unit: '%' }
    ]
  }
};

export const SOLAR_CASES = [
  { id: 'CAS-S08', column: 'new' as const, title: 'INV-08 Cooling Fan Failure', severity: 'MEDIUM', detail: 'Internal temp at 58°C, fan RPM at 0. Thermal derate will begin at 60°C.', asset: 'INV-08', assignee: 'Unassigned', ...SOLAR_CASE_TELEMETRY['CAS-S08'] },
  { id: 'CAS-S05', column: 'new' as const, title: 'Zone D Soiling Threshold Exceeded', severity: 'LOW', detail: 'Soiling sensor reads 6.1% loss. AI recommends cleaning — ROI positive in 2 days.', asset: 'Zone D', assignee: 'Unassigned', ...SOLAR_CASE_TELEMETRY['CAS-S05'] },
  { id: 'CAS-S01', column: 'investigating' as const, title: 'INV-04 Capacitor Degradation', severity: 'CRITICAL', detail: 'Efficiency declining linearly. Capacitor ESR values confirm aging. Replacement parts sourced.', asset: 'INV-04', assignee: 'David L.', ...SOLAR_CASE_TELEMETRY['CAS-S01'] },
  { id: 'CAS-S03', column: 'investigating' as const, title: 'String 7A-12 Hotspot Damage', severity: 'HIGH', detail: 'Thermal drone scan completed. 3 panels confirmed for replacement.', asset: 'String 7A-12', assignee: 'Elena R.', ...SOLAR_CASE_TELEMETRY['CAS-S03'] },
  { id: 'CAS-S02', column: 'scheduled' as const, title: 'Zone B Tracker Repair', severity: 'HIGH', detail: 'Field technician dispatched. Controller replacement part in transit. ETA: tomorrow.', asset: 'Zone B', assignee: 'Tech Crew 1', ...SOLAR_CASE_TELEMETRY['CAS-S02'] },
  { id: 'CAS-S04', column: 'scheduled' as const, title: 'BESS Rack 3 Cell Rebalance', severity: 'MEDIUM', detail: 'Scheduled for next maintenance window (Thursday night).', asset: 'BESS-01', assignee: 'David L.', ...SOLAR_CASE_TELEMETRY['CAS-S04'] }
];
