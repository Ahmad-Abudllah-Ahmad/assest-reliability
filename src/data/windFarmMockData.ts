export type WindTurbineStatus = 'Online' | 'Curtailed' | 'Maintenance' | 'Faulted';

export interface WindTurbine {
  id: string;
  name: string;
  status: WindTurbineStatus;
  powerKw: number;
  windSpeedMs: number;
  rotorRpm: number;
  gearboxOilTempC: number;
  mainBearingTempC: number;
  generatorWindingTempC: number;
  pitchDeg: number;
  yawErrorDeg: number;
  nacelleVibrationMmS: number;
  gearboxRulDays: number;
  availabilityPct: number;
  underperforming: boolean;
  sparkline6h: number[];
  gearboxRulPct: number;
}

export interface WindPowerCurvePoint {
  windSpeed: number;
  theoreticalKw: number;
}

export interface GearboxTempTrendPoint {
  day: string;
  'WT-07': number;
  'WT-14': number;
  'WT-22': number;
}

export interface DowntimeCauseSlice {
  name: string;
  value: number;
  color: string;
}

export const WIND_RATED_KW = 3500;

export function theoreticalWindPowerKw(windSpeedMs: number): number {
  if (windSpeedMs < 3 || windSpeedMs >= 25) return 0;
  if (windSpeedMs >= 12) return WIND_RATED_KW;
  const vin3 = 27;
  const vr3 = 1728;
  const v3 = windSpeedMs ** 3;
  return Math.round(WIND_RATED_KW * ((v3 - vin3) / (vr3 - vin3)));
}

export const WIND_POWER_CURVE: WindPowerCurvePoint[] = Array.from({ length: 51 }, (_, i) => {
  const windSpeed = i * 0.5;
  return { windSpeed, theoreticalKw: theoreticalWindPowerKw(windSpeed) };
});

const STATUS_BY_INDEX: Record<number, WindTurbineStatus> = {
  3: 'Curtailed',
  11: 'Faulted',
  16: 'Curtailed',
  18: 'Maintenance'
};

const HOT_GEARBOX = new Set([7, 14, 22]);
const UNDERPERFORMING = new Set([7, 9, 14, 22]);

export const WIND_TURBINES: WindTurbine[] = Array.from({ length: 25 }, (_, i) => {
  const n = i + 1;
  const id = `WT-${String(n).padStart(2, '0')}`;
  const status = STATUS_BY_INDEX[n] ?? 'Online';
  const windSpeedMs = Number((7.2 + ((n * 17) % 40) / 10).toFixed(1));
  const theoretical = theoreticalWindPowerKw(windSpeedMs);
  const underperforming = UNDERPERFORMING.has(n);
  let powerKw = 0;
  if (status === 'Online') {
    powerKw = underperforming ? Math.round(theoretical * 0.72) : Math.round(theoretical * (0.96 + (n % 5) * 0.008));
  } else if (status === 'Curtailed') {
    powerKw = Math.round(theoretical * 0.55);
  }

  const hot = HOT_GEARBOX.has(n);
  const gearboxOilTempC = status === 'Faulted'
    ? 91.4
    : hot
      ? Number((81.5 + n * 0.08).toFixed(1))
      : Number((52 + (n % 18)).toFixed(1));

  return {
    id,
    name: `Ridge ${id}`,
    status,
    powerKw,
    windSpeedMs: status === 'Maintenance' ? 8.1 : windSpeedMs,
    rotorRpm: status === 'Faulted' || status === 'Maintenance' ? 0 : Number((9.4 + windSpeedMs * 0.55).toFixed(1)),
    gearboxOilTempC,
    mainBearingTempC: Number((44 + (n % 16) + (hot ? 12 : 0)).toFixed(1)),
    generatorWindingTempC: Number((58 + (n % 14) + (status === 'Curtailed' ? 8 : 0)).toFixed(1)),
    pitchDeg: status === 'Curtailed' ? 18.4 : status === 'Faulted' || status === 'Maintenance' ? 90 : Number((1.2 + (n % 6) * 0.4).toFixed(1)),
    yawErrorDeg: Number((0.4 + (underperforming ? 4.8 : (n % 7) * 0.3)).toFixed(1)),
    nacelleVibrationMmS: Number((1.6 + (hot ? 3.4 : (n % 8) * 0.25)).toFixed(2)),
    gearboxRulDays: hot ? 38 + n : status === 'Faulted' ? 12 : 410 - n * 7,
    availabilityPct: n <= 10
      ? [98.6, 97.2, 96.4, 91.1, 88.4, 99.1, 81.6, 94.8, 97.5, 96.1][n - 1]
      : 97.2,
    underperforming,
    sparkline6h: Array.from({ length: 6 }, (_, h) =>
      Math.max(0, Math.round(powerKw * (0.82 + ((n + h) % 7) * 0.03) * (status === 'Faulted' || status === 'Maintenance' ? 0.05 : 1)))
    ),
    gearboxRulPct: Math.max(4, Math.min(100, Math.round(((hot ? 38 + n : status === 'Faulted' ? 12 : 410 - n * 7) / 420) * 100)))
  };
});

export const WIND_AVAILABILITY_SUBSET = WIND_TURBINES.slice(0, 10).map((t) => ({
  id: t.id,
  availabilityPct: t.availabilityPct
}));

export const WIND_GEARBOX_TREND: GearboxTempTrendPoint[] = [
  { day: 'Mon', 'WT-07': 74.2, 'WT-14': 76.1, 'WT-22': 73.8 },
  { day: 'Tue', 'WT-07': 76.8, 'WT-14': 77.4, 'WT-22': 75.2 },
  { day: 'Wed', 'WT-07': 78.4, 'WT-14': 79.1, 'WT-22': 77.6 },
  { day: 'Thu', 'WT-07': 80.6, 'WT-14': 81.2, 'WT-22': 79.4 },
  { day: 'Fri', 'WT-07': 82.1, 'WT-14': 83.0, 'WT-22': 80.8 },
  { day: 'Sat', 'WT-07': 81.4, 'WT-14': 82.6, 'WT-22': 81.5 },
  { day: 'Sun', 'WT-07': 83.2, 'WT-14': 84.1, 'WT-22': 82.4 }
];

export const WIND_DOWNTIME_CAUSES: DowntimeCauseSlice[] = [
  { name: 'Gearbox Faults', value: 35, color: '#f43f5e' },
  { name: 'Pitch System', value: 20, color: '#f59e0b' },
  { name: 'Grid Issues', value: 15, color: '#3b82f6' },
  { name: 'Weather/Icing', value: 15, color: '#06b6d4' },
  { name: 'Scheduled Maintenance', value: 10, color: '#10b981' },
  { name: 'Other', value: 5, color: '#94a3b8' }
];

export const WIND_KPIS = {
  totalOutputMw: 148.5,
  capacityMw: 200,
  capacityFactorPct: 34.2,
  fleetAvailabilityPct: 96.8,
  avgWindSpeedMs: 8.4,
  mtbfHours: 1240
};

export const WIND_ROSE = [
  { dir: 'N', frequency: 7, energy: 9 },
  { dir: 'NE', frequency: 11, energy: 14 },
  { dir: 'E', frequency: 9, energy: 11 },
  { dir: 'SE', frequency: 13, energy: 16 },
  { dir: 'S', frequency: 18, energy: 22 },
  { dir: 'SW', frequency: 24, energy: 31 },
  { dir: 'W', frequency: 12, energy: 15 },
  { dir: 'NW', frequency: 6, energy: 8 }
];

export const WIND_24H_GENERATION = [
  { time: '00:00', actualMw: 92, forecastMw: 98 },
  { time: '02:00', actualMw: 88, forecastMw: 94 },
  { time: '04:00', actualMw: 101, forecastMw: 108 },
  { time: '06:00', actualMw: 118, forecastMw: 122 },
  { time: '08:00', actualMw: 131, forecastMw: 136 },
  { time: '10:00', actualMw: 142, forecastMw: 148 },
  { time: '12:00', actualMw: 148.5, forecastMw: 152 },
  { time: '14:00', actualMw: 139, forecastMw: 155 },
  { time: '16:00', actualMw: 128, forecastMw: 141 },
  { time: '18:00', actualMw: 116, forecastMw: 124 },
  { time: '20:00', actualMw: 104, forecastMw: 112 },
  { time: '22:00', actualMw: 96, forecastMw: 102 }
];

export const WIND_ANOMALIES = [
  { id: 'AN-W01', asset: 'WT-14', title: 'WT-14 gearbox oil temp rising 2°C/day above fleet avg', detail: 'Now 83.0°C. Power curve lag of 8% at 11–13 m/s. Cross-check yaw error 5.2° vs SW-dominant energy rose.', severity: 'Critical' as const },
  { id: 'AN-W02', asset: 'WT-07', title: 'WT-07 nacelle vibration matches Stage 2 inner-race spalling', detail: '4.2 mm/s RMS and climbing. Borescope window recommended within 7 days before crane slot is lost.', severity: 'High' as const },
  { id: 'AN-W03', asset: 'WT-19', title: 'WT-19 leading-edge erosion: −6% at rated wind', detail: 'Operating point sits below theoretical S-curve. Estimated $850/day lost yield until rope-access repair.', severity: 'High' as const }
];

export const WIND_INSPECTIONS = [
  { id: 'INS-W01', title: 'WT-07 Gearbox Bearing Inner Race Pitting', urgency: 'HIGH', detail: 'Vibration signature matches Stage 2 spalling pattern. Recommend borescope inspection within 7 days.' },
  { id: 'INS-W02', title: 'WT-19 Blade Leading Edge Erosion', urgency: 'HIGH', detail: 'Power curve deviation of -6% at rated speed. Drone inspection recommended.' },
  { id: 'INS-W03', title: 'WT-22 Generator Stator Overheat', urgency: 'MEDIUM', detail: 'Winding temp 12°C above fleet average during peak. Insulation resistance test needed.' },
  { id: 'INS-W04', title: 'WT-11 Transformer Oil Seepage', urgency: 'LOW', detail: 'Oil level dropped 3% over 30 days. Visual inspection scheduled.' }
];

export const WIND_MAINT_HISTORY = [
  { id: 'MH-W01', text: 'WT-07 Gearbox Oil Flush', when: '12 days ago', unknown: false },
  { id: 'MH-W02', text: 'WT-03 Pitch Actuator Calibration', when: '22 days ago', unknown: false },
  { id: 'MH-W03', text: 'Annual Blade Drone Inspection (full fleet)', when: '45 days ago', unknown: false },
  { id: 'MH-W04', text: 'WT-11 Transformer oil sample (DGA)', when: '18 days ago', unknown: false },
  { id: 'MH-W05', text: 'WT-14 Yaw encoder firmware patch', when: '9 days ago', unknown: false },
  { id: 'MH-W06', text: 'WT-22 generator cooling-fan clean', when: '31 days ago', unknown: false },
  { id: 'MH-W07', text: 'WT-22 intermittent power dip at 11 m/s — no matching fault signature in database', when: '6 days ago', unknown: true },
  { id: 'MH-W08', text: 'WT-09 night-time curtailment spike unexplained vs TSO setpoint', when: '3 days ago', unknown: true }
];

export const WIND_PARETO = [
  { cause: 'Gearbox', hours: 84, pct: 35, cumulative: 35 },
  { cause: 'Pitch System', hours: 48, pct: 20, cumulative: 55 },
  { cause: 'Grid Issues', hours: 36, pct: 15, cumulative: 70 },
  { cause: 'Weather/Icing', hours: 36, pct: 15, cumulative: 85 },
  { cause: 'Scheduled', hours: 24, pct: 10, cumulative: 95 },
  { cause: 'Other', hours: 12, pct: 5, cumulative: 100 }
];

export const WIND_AVAIL_12M = [
  { month: 'Oct', availability: 97.2 },
  { month: 'Nov', availability: 96.4 },
  { month: 'Dec', availability: 91.8 },
  { month: 'Jan', availability: 90.4 },
  { month: 'Feb', availability: 92.1 },
  { month: 'Mar', availability: 95.6 },
  { month: 'Apr', availability: 97.8 },
  { month: 'May', availability: 98.1 },
  { month: 'Jun', availability: 97.4 },
  { month: 'Jul', availability: 96.9 },
  { month: 'Aug', availability: 97.1 },
  { month: 'Sep', availability: 96.8 }
];

export const WIND_TASKS = [
  { rank: 1, title: 'Replace WT-07 Gearbox Bearing Assembly', asset: 'WT-07', caseId: 'CAS-W01', rationale: 'Vibration at 4.2 mm/s and rising. If bearing fails catastrophically, full gearbox replacement costs $320K and 14 days crane mobilization. Replacing bearing now costs $28K and 2 days.', yieldSaved: '+$292,000 (avoided catastrophic failure)', downtime: '12 days', clearance: 'safe' as const, clearanceText: 'Wind below 8 m/s — SAFE for nacelle access' },
  { rank: 2, title: 'Repair WT-19 Blade Leading Edge', asset: 'WT-19', caseId: 'CAS-W02', rationale: '6% power curve deviation at rated wind. At current wind resource, this turbine is losing ~$850/day.', yieldSaved: '+$25,500/month', downtime: '1 day (rope access team)', clearance: 'safe' as const, clearanceText: 'Wind below 10 m/s — SAFE' },
  { rank: 3, title: 'Investigate WT-22 Generator Winding', asset: 'WT-22', caseId: 'CAS-W03', rationale: 'Stator temp trending up. If insulation fails, generator rewind costs $95K.', yieldSaved: '+$95,000 (avoided rewind)', downtime: '7 days', clearance: 'lockout' as const, clearanceText: 'Turbine must be electrically isolated first' },
  { rank: 4, title: 'Recalibrate WT-03 Pitch Actuator', asset: 'WT-03', caseId: 'CAS-W04', rationale: '1.4 sec pitch lag creates overspeed risk in gusty conditions. Safety-critical.', yieldSaved: '+$4,200', downtime: '4 hrs', clearance: 'safe' as const, clearanceText: 'SAFE' },
  { rank: 5, title: 'Seal WT-11 Transformer Oil Leak', asset: 'WT-11', caseId: 'CAS-W05', rationale: 'Slow leak. Non-urgent but will degrade insulation over 6 months.', yieldSaved: '+$12,000 (avoided transformer replacement)', downtime: '3 hrs', clearance: 'safe' as const, clearanceText: 'SAFE' }
];

export const WIND_CASE_TELEMETRY: Record<string, { metricName: string; observedValue: string; thresholdValue: string; telemetryPoints: { time: string; value: number; baseline: number; unit: string }[] }> = {
  'CAS-W01': {
    metricName: 'HIGH-SPEED SHAFT VIBRATION',
    observedValue: '4.2 mm/s',
    thresholdValue: '3.0 mm/s',
    telemetryPoints: [
      { time: '10:00', value: 2.1, baseline: 3.0, unit: 'mm/s' },
      { time: '11:00', value: 2.6, baseline: 3.0, unit: 'mm/s' },
      { time: '12:00', value: 3.2, baseline: 3.0, unit: 'mm/s' },
      { time: '13:00', value: 3.8, baseline: 3.0, unit: 'mm/s' },
      { time: '14:00', value: 4.2, baseline: 3.0, unit: 'mm/s' }
    ]
  },
  'WT-07': {
    metricName: 'HIGH-SPEED SHAFT VIBRATION',
    observedValue: '4.2 mm/s',
    thresholdValue: '3.0 mm/s',
    telemetryPoints: [
      { time: '10:00', value: 2.1, baseline: 3.0, unit: 'mm/s' },
      { time: '11:00', value: 2.6, baseline: 3.0, unit: 'mm/s' },
      { time: '12:00', value: 3.2, baseline: 3.0, unit: 'mm/s' },
      { time: '13:00', value: 3.8, baseline: 3.0, unit: 'mm/s' },
      { time: '14:00', value: 4.2, baseline: 3.0, unit: 'mm/s' }
    ]
  },
  'CAS-W14': {
    metricName: 'YAW ALIGNMENT ERROR',
    observedValue: '12.4 °',
    thresholdValue: '5.0 °',
    telemetryPoints: [
      { time: '00:00', value: 2.4, baseline: 5.0, unit: '°' },
      { time: '06:00', value: 4.8, baseline: 5.0, unit: '°' },
      { time: '12:00', value: 8.2, baseline: 5.0, unit: '°' },
      { time: '18:00', value: 10.9, baseline: 5.0, unit: '°' },
      { time: '23:00', value: 12.4, baseline: 5.0, unit: '°' }
    ]
  },
  'WT-14': {
    metricName: 'YAW ALIGNMENT ERROR',
    observedValue: '12.4 °',
    thresholdValue: '5.0 °',
    telemetryPoints: [
      { time: '00:00', value: 2.4, baseline: 5.0, unit: '°' },
      { time: '06:00', value: 4.8, baseline: 5.0, unit: '°' },
      { time: '12:00', value: 8.2, baseline: 5.0, unit: '°' },
      { time: '18:00', value: 10.9, baseline: 5.0, unit: '°' },
      { time: '23:00', value: 12.4, baseline: 5.0, unit: '°' }
    ]
  },
  'CAS-W03P': {
    metricName: 'BLADE PITCH RESPONSE TIME',
    observedValue: '1420 ms',
    thresholdValue: '600 ms',
    telemetryPoints: [
      { time: '08:00', value: 480, baseline: 600, unit: 'ms' },
      { time: '10:00', value: 520, baseline: 600, unit: 'ms' },
      { time: '12:00', value: 780, baseline: 600, unit: 'ms' },
      { time: '14:00', value: 1150, baseline: 600, unit: 'ms' },
      { time: '16:00', value: 1420, baseline: 600, unit: 'ms' }
    ]
  },
  'WT-03': {
    metricName: 'BLADE PITCH RESPONSE TIME',
    observedValue: '1420 ms',
    thresholdValue: '600 ms',
    telemetryPoints: [
      { time: '08:00', value: 480, baseline: 600, unit: 'ms' },
      { time: '10:00', value: 520, baseline: 600, unit: 'ms' },
      { time: '12:00', value: 780, baseline: 600, unit: 'ms' },
      { time: '14:00', value: 1150, baseline: 600, unit: 'ms' },
      { time: '16:00', value: 1420, baseline: 600, unit: 'ms' }
    ]
  },
  'CAS-W03': {
    metricName: 'GENERATOR STATOR TEMPERATURE',
    observedValue: '86.4 °C',
    thresholdValue: '78.0 °C',
    telemetryPoints: [
      { time: '08:00', value: 71.2, baseline: 78.0, unit: '°C' },
      { time: '10:00', value: 74.6, baseline: 78.0, unit: '°C' },
      { time: '12:00', value: 79.1, baseline: 78.0, unit: '°C' },
      { time: '14:00', value: 83.8, baseline: 78.0, unit: '°C' },
      { time: '16:00', value: 86.4, baseline: 78.0, unit: '°C' }
    ]
  },
  'CAS-W02': {
    metricName: 'POWER CURVE DEVIATION',
    observedValue: '6.4 %',
    thresholdValue: '3.0 %',
    telemetryPoints: [
      { time: '08:00', value: 1.8, baseline: 3.0, unit: '%' },
      { time: '10:00', value: 2.9, baseline: 3.0, unit: '%' },
      { time: '12:00', value: 4.1, baseline: 3.0, unit: '%' },
      { time: '14:00', value: 5.6, baseline: 3.0, unit: '%' },
      { time: '16:00', value: 6.4, baseline: 3.0, unit: '%' }
    ]
  },
  'CAS-W05': {
    metricName: 'TRANSFORMER OIL LOSS RATE',
    observedValue: '3.4 L/day',
    thresholdValue: '1.0 L/day',
    telemetryPoints: [
      { time: 'Mon', value: 0.4, baseline: 1.0, unit: 'L/day' },
      { time: 'Tue', value: 0.8, baseline: 1.0, unit: 'L/day' },
      { time: 'Wed', value: 1.6, baseline: 1.0, unit: 'L/day' },
      { time: 'Thu', value: 2.5, baseline: 1.0, unit: 'L/day' },
      { time: 'Fri', value: 3.4, baseline: 1.0, unit: 'L/day' }
    ]
  }
};

export const WIND_CASES = [
  { id: 'CAS-W14', column: 'new' as const, title: 'WT-14 Yaw Misalignment', severity: 'HIGH', detail: 'Consistent 12° yaw error over 72 hrs. AI estimates 8% energy loss. Root cause: yaw motor encoder drift.', asset: 'WT-14', assignee: 'Unassigned', ...WIND_CASE_TELEMETRY['CAS-W14'] },
  { id: 'CAS-W03P', column: 'new' as const, title: 'WT-03 Pitch Actuator Lag', severity: 'HIGH', detail: 'Blade 2 pitch response delayed 1.4 sec vs Blades 1 & 3. Overspeed risk in gusts >18 m/s.', asset: 'WT-03', assignee: 'Unassigned', ...WIND_CASE_TELEMETRY['CAS-W03P'] },
  { id: 'CAS-W01', column: 'investigating' as const, title: 'WT-07 Gearbox Bearing Degradation', severity: 'CRITICAL', detail: 'Vibration at 4.2 mm/s, oil temp at 82°C. 89% probability inner race pitting. Borescope ordered.', asset: 'WT-07', assignee: 'Sarah J.', ...WIND_CASE_TELEMETRY['CAS-W01'] },
  { id: 'CAS-W03', column: 'investigating' as const, title: 'WT-22 Generator Winding Overheat', severity: 'MEDIUM', detail: 'Stator temp 12°C above fleet avg. Insulation resistance test pending.', asset: 'WT-22', assignee: 'Mike T.', ...WIND_CASE_TELEMETRY['CAS-W03'] },
  { id: 'CAS-W02', column: 'scheduled' as const, title: 'WT-19 Blade Leading Edge Erosion', severity: 'MEDIUM', detail: 'Rope access team scheduled for next low-wind window.', asset: 'WT-19', assignee: 'Rope Team A', ...WIND_CASE_TELEMETRY['CAS-W02'] },
  { id: 'CAS-W05', column: 'scheduled' as const, title: 'WT-11 Transformer Oil Leak', severity: 'LOW', detail: 'Gasket replacement parts ordered. ETA 5 days.', asset: 'WT-11', assignee: 'Sarah J.', ...WIND_CASE_TELEMETRY['CAS-W05'] }
];
