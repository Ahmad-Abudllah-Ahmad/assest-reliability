import { 
  MachineAsset, 
  CaseItem, 
  CombustorCan, 
  HeatRateCurvePoint,
  MonitoredAsset,
  OptimizerTask,
  AssetMaintenanceRecord,
  UnresolvedAlertInspection,
  CompletedInspection
} from './types';

export const INITIAL_COMBUSTOR_CANS: CombustorCan[] = [
  { canNumber: 1, canLabel: 'Can 1', temperature: 602, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 2, canLabel: 'Can 2', temperature: 604, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 3, canLabel: 'Can 3', temperature: 603, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 4, canLabel: 'Can 4', temperature: 578, isAnomaly: true, statusText: 'Cold Spot (-26°C)' },
  { canNumber: 5, canLabel: 'Can 5', temperature: 604, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 6, canLabel: 'Can 6', temperature: 605, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 7, canLabel: 'Can 7', temperature: 603, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 8, canLabel: 'Can 8', temperature: 602, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 9, canLabel: 'Can 9', temperature: 604, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 10, canLabel: 'Can 10', temperature: 603, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 11, canLabel: 'Can 11', temperature: 605, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 12, canLabel: 'Can 12', temperature: 602, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 13, canLabel: 'Can 13', temperature: 604, isAnomaly: false, statusText: 'Normal' },
  { canNumber: 14, canLabel: 'Can 14', temperature: 603, isAnomaly: false, statusText: 'Normal' }
];

export const INITIAL_HEAT_RATE_DATA: HeatRateCurvePoint[] = [
  { loadMW: 320, oemDesignHeatRate: 7350, actualHeatRate: 7490, timestamp: '02:00' },
  { loadMW: 360, oemDesignHeatRate: 7120, actualHeatRate: 7260, timestamp: '04:00' },
  { loadMW: 400, oemDesignHeatRate: 6940, actualHeatRate: 7080, timestamp: '06:00' },
  { loadMW: 430, oemDesignHeatRate: 6810, actualHeatRate: 6940, timestamp: '08:00' },
  { loadMW: 450, oemDesignHeatRate: 6740, actualHeatRate: 6870, timestamp: '10:00' },
  { loadMW: 462, oemDesignHeatRate: 6700, actualHeatRate: 6820, isCurrentPoint: true, timestamp: 'Current (14:00)' },
  { loadMW: 480, oemDesignHeatRate: 6650, timestamp: 'OEM Rated' },
  { loadMW: 500, oemDesignHeatRate: 6610, timestamp: 'Peak Cap' }
];

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'CAS-001',
    title: 'Exhaust gas Cylinder variance check',
    equipment: 'Gas Turbine GT-2',
    assignee: 'Bob Smith',
    severity: 'High',
    status: 'Diagnosing',
    timestamp: '25 mins ago',
    rootCause: 'Combustor Can #4 is running 26°C below average due to fuel nozzle #4 servo valve drift, resulting in automated 18 MW derating to protect stage 1 turbine blades.',
    requiredParts: [
      'Part #GE-7F-NZ4: Replacement Nozzle O-Ring Kit',
      'Hydraulic Servo Valve (Moog G761)',
      'High-Temp Annular Gaskets'
    ],
    estimatedTime: '3.5 Hours',
    metricName: 'EGT Spread',
    observedValue: '26.0°C Spread (Can 4: 578°C)',
    thresholdValue: '18.0°C Max Allowable',
    telemetryPoints: [
      { time: '10:00', value: 16, baseline: 18, unit: '°C' },
      { time: '11:00', value: 19, baseline: 18, unit: '°C' },
      { time: '12:00', value: 22, baseline: 18, unit: '°C' },
      { time: '13:00', value: 24, baseline: 18, unit: '°C' },
      { time: '14:00', value: 26, baseline: 18, unit: '°C' }
    ]
  },
  {
    id: 'CAS-002',
    title: 'Pinion shaft gear meshing vibration',
    equipment: 'Gear Box',
    assignee: 'Alice Johnson',
    severity: 'Medium',
    status: 'Unassigned',
    timestamp: '1.5 hours ago',
    rootCause: 'High-frequency accelerometer spectrum shows 2,450 Hz gear-mesh peak with 1X sidebands, indicating early micro-pitting on intermediate reduction pinion.',
    requiredParts: [
      'High-Speed Pinion Bearing Assembly #GBX-300',
      'Synthetic ISO VG 46 Flush Fluid',
      'Shaft Laser Alignment Kit'
    ],
    estimatedTime: '6.0 Hours',
    metricName: 'Shaft Vibration',
    observedValue: '4.2 mm/s RMS',
    thresholdValue: '3.0 mm/s Advisory Limit',
    telemetryPoints: [
      { time: '10:00', value: 2.8, baseline: 3.0, unit: 'mm/s' },
      { time: '11:00', value: 3.2, baseline: 3.0, unit: 'mm/s' },
      { time: '12:00', value: 3.6, baseline: 3.0, unit: 'mm/s' },
      { time: '13:00', value: 3.9, baseline: 3.0, unit: 'mm/s' },
      { time: '14:00', value: 4.2, baseline: 3.0, unit: 'mm/s' }
    ]
  },
  {
    id: 'CAS-003',
    title: 'Lube oil metallic wear investigation',
    equipment: 'Lube Oil Skid',
    assignee: 'Charlie Davis',
    severity: 'Critical',
    status: 'Planned Maintenance',
    timestamp: '4 hours ago',
    rootCause: 'Online optical particle counter alarmed on ISO code 21/18/15. Spectrometric patch analysis verified babbitt tin-antimony alloy flakes from bearing #2 journal.',
    requiredParts: [
      '6-Micron Dual Duplex Filter Elements #HYD-6M',
      'Bearing #2 Babbitt Shell Replacements',
      'Ferrography Analytical Sampling Flasks'
    ],
    estimatedTime: '8.0 Hours',
    metricName: 'Particle Cleanliness',
    observedValue: 'ISO 21/18/15',
    thresholdValue: 'ISO 17/14/11 Target',
    telemetryPoints: [
      { time: '06:00', value: 16, baseline: 14, unit: 'ISO' },
      { time: '08:00', value: 17, baseline: 14, unit: 'ISO' },
      { time: '10:00', value: 19, baseline: 14, unit: 'ISO' },
      { time: '12:00', value: 20, baseline: 14, unit: 'ISO' },
      { time: '14:00', value: 21, baseline: 14, unit: 'ISO' }
    ]
  },
  {
    id: 'CAS-004',
    title: 'Secondary seal vent flow rate review',
    equipment: 'Flash Compressor',
    assignee: 'Alice Johnson',
    severity: 'High',
    status: 'Closed',
    timestamp: 'Yesterday',
    rootCause: 'Differential pressure regulator valve seat inspected and re-lapped. Seal leakage normalized to 1.8 Nm³/h with certified 99.2% gas containment.',
    requiredParts: [
      'Seal Regulator Diaphragm Kit #PRV-02',
      'High-Purity Viton O-Rings'
    ],
    estimatedTime: '2.0 Hours (Completed)',
    metricName: 'Vent Flow Rate',
    observedValue: '1.8 Nm³/h (Normal)',
    thresholdValue: '2.5 Nm³/h Max',
    telemetryPoints: [
      { time: 'Yesterday 08:00', value: 2.8, baseline: 2.5, unit: 'Nm³/h' },
      { time: 'Yesterday 12:00', value: 2.3, baseline: 2.5, unit: 'Nm³/h' },
      { time: 'Yesterday 16:00', value: 1.8, baseline: 2.5, unit: 'Nm³/h' }
    ]
  }
];

export const INITIAL_MACHINE_ASSETS: MachineAsset[] = [
  {
    id: 'gt-1',
    name: 'Gas Turbine 1',
    model: 'GE 7F.05 Heavy-Duty Combined Cycle',
    code: 'GT-1',
    type: 'Combustion Turbine',
    ratedMW: 160,
    currentMW: 158,
    status: 'healthy',
    statusLabel: 'Optimal',
    telemetry: [
      { label: 'Active Output', value: '158 MW', status: 'optimal', limit: '160 MW Rated' },
      { label: 'Rotor Speed', value: '3,600 RPM', status: 'optimal', limit: '3,600 ± 5 RPM' },
      { label: 'Vibration (Brg 1 & 2)', value: '1.4 mm/s RMS', status: 'normal', limit: '< 2.5 mm/s Normal' },
      { label: 'EGT Temp Spread', value: '12°C Spread', status: 'optimal', limit: '< 18°C Alarm Limit' },
      { label: 'Lube Oil Header', value: '2.6 bar, 54°C', status: 'normal', limit: '2.4 - 3.0 bar' },
      { label: 'Compressor Inlet ΔP', value: '2.8 mbar', status: 'optimal', limit: '< 5.0 mbar Clean' }
    ],
    aiRunningInsight: 'GT-1 operating at peak thermodynamic efficiency. Rotor vibration and combustor flame dynamics are well within baseline tolerance. No maintenance required.',
    advisoryActions: [
      { label: 'Export Diagnostic Package', actionType: 'export_package' },
      { label: 'Flag for Outage Inspection', actionType: 'flag_outage' }
    ],
    temperatureHistory: [
      { time: '06:00', temp: 568, benchmark: 580 },
      { time: '08:00', temp: 574, benchmark: 580 },
      { time: '10:00', temp: 581, benchmark: 580 },
      { time: '11:00', temp: 578, benchmark: 580 },
      { time: '12:00', temp: 582, benchmark: 580 },
      { time: '13:00', temp: 579, benchmark: 580 },
      { time: '14:00', temp: 581, benchmark: 580 }
    ]
  },
  {
    id: 'gt-2',
    name: 'Gas Turbine 2',
    model: 'GE 7F.05 Heavy-Duty Combined Cycle',
    code: 'GT-2',
    type: 'Combustion Turbine',
    ratedMW: 160,
    currentMW: 142,
    status: 'warning',
    statusLabel: 'Action Required',
    telemetry: [
      { label: 'Active Output', value: '142 MW (Derated)', status: 'warning', limit: '160 MW Rated' },
      { label: 'Rotor Speed', value: '3,600 RPM', status: 'optimal', limit: '3,600 ± 5 RPM' },
      { label: 'Vibration (Shaft / Brg 2)', value: '3.4 mm/s RMS', status: 'warning', limit: '< 2.5 mm/s Normal' },
      { label: 'EGT Temp Spread', value: '26°C (Alarm)', status: 'critical', limit: '< 18°C Max Limit' },
      { label: 'Can #4 Temperature', value: '578°C (Cold Spot)', status: 'critical', limit: '604°C Avg Mean' },
      { label: 'Fuel Gas Valve Drift', value: '+3.1% Drift', status: 'warning', limit: '81.1% Target' }
    ],
    aiRunningInsight: 'Combustion flame asymmetry detected in Can #4. Fuel nozzle valve drift is causing an 18 MW generation penalty ($1,230/hr). Log an investigation case to assign a field engineer.',
    advisoryActions: [
      { 
        label: 'Log Investigation Case', 
        actionType: 'log_case',
        casePayload: {
          title: 'GT-2 Can #4 Fuel nozzle clogging & EGT spread investigation',
          equipment: 'Gas Turbine GT-2',
          severity: 'High',
          metricName: 'EGT Spread',
          observedValue: '26°C (Can 4: 578°C)',
          thresholdValue: '18°C Allowable',
          rootCause: 'Fuel nozzle #4 valve actuator drift causing fuel starvation and cold combustion pocket in Can #4.'
        }
      },
      { label: 'Assign Field Engineer', actionType: 'assign_engineer' },
      { label: 'Export Diagnostic Package', actionType: 'export_package' }
    ],
    temperatureHistory: [
      { time: '06:00', temp: 571, benchmark: 580 },
      { time: '08:00', temp: 584, benchmark: 580 },
      { time: '10:00', temp: 593, benchmark: 580 },
      { time: '11:00', temp: 598, benchmark: 580 },
      { time: '12:00', temp: 604, benchmark: 580 },
      { time: '13:00', temp: 609, benchmark: 580 },
      { time: '14:00', temp: 614, benchmark: 580 }
    ]
  },
  {
    id: 'st-1',
    name: 'Steam Turbine ST-1',
    model: 'Toshiba Tandem-Compound',
    code: 'ST-1',
    type: 'Steam Turbine & Condenser',
    ratedMW: 180,
    currentMW: 162,
    status: 'warning',
    statusLabel: 'Action Required',
    telemetry: [
      { label: 'Active Output', value: '162 MW', status: 'optimal', limit: '180 MW Rated' },
      { label: 'HP Steam Inlet', value: '108 bar / 538°C', status: 'normal', limit: '110 bar / 540°C' },
      { label: 'Condenser Vacuum', value: '0.11 bar (Degraded)', status: 'warning', limit: '0.07 bar Nominal' },
      { label: 'Rotor Axial Disp', value: '+0.18 mm', status: 'normal', limit: '± 0.50 mm Trip' },
      { label: 'Condensate Dissolved O2', value: '8 ppb', status: 'optimal', limit: '< 15 ppb Spec' },
      { label: 'Hotwell Level', value: 'Normal (±10 mm)', status: 'normal', limit: '± 50 mm' }
    ],
    aiRunningInsight: 'Cooling water tube fouling is elevating condenser backpressure, causing a 1.8% efficiency loss ($380/hr in wasted fuel gas). Flag for maintenance backwash.',
    advisoryActions: [
      { 
        label: 'Log Investigation Case', 
        actionType: 'log_case',
        casePayload: {
          title: 'ST-1 Surface condenser tube bio-fouling & vacuum degradation',
          equipment: 'Steam Turbine ST-1',
          severity: 'Medium',
          metricName: 'Condenser Backpressure',
          observedValue: '0.11 bar',
          thresholdValue: '0.07 bar Design',
          rootCause: 'Cooling water tube bank bio-fouling elevating backpressure and decreasing cycle Carnot efficiency.'
        }
      },
      { label: 'Flag for Outage Inspection', actionType: 'flag_outage' },
      { label: 'Export Diagnostic Package', actionType: 'export_package' }
    ],
    temperatureHistory: [
      { time: '06:00', temp: 531, benchmark: 540 },
      { time: '08:00', temp: 536, benchmark: 540 },
      { time: '10:00', temp: 542, benchmark: 540 },
      { time: '11:00', temp: 545, benchmark: 540 },
      { time: '12:00', temp: 547, benchmark: 540 },
      { time: '13:00', temp: 549, benchmark: 540 },
      { time: '14:00', temp: 548, benchmark: 540 }
    ]
  },
  {
    id: 'gsu-1',
    name: 'Main Step-Up Transformer',
    model: 'ABB 550 MVA Three-Phase (18 kV / 230 kV)',
    code: 'GSU T-01',
    type: 'Substation Step-Up Transformer',
    ratedMW: 500,
    currentMW: 462,
    status: 'healthy',
    statusLabel: 'Healthy',
    telemetry: [
      { label: 'Top Oil Temp', value: '72°C', status: 'normal', limit: '< 85°C Warning' },
      { label: 'Winding Hotspot', value: '88°C', status: 'normal', limit: '< 110°C IEEE C57' },
      { label: 'Bushing Power Factor', value: '0.38%', status: 'optimal', limit: '< 0.50% Normal' },
      { label: 'DGA Hydrogen (H2)', value: '22 ppm', status: 'optimal', limit: '< 100 ppm Spec' },
      { label: 'DGA Acetylene (C2H2)', value: '0.1 ppm', status: 'optimal', limit: '< 2.0 ppm' },
      { label: 'Buchholz Gas Relay', value: 'Zero Gas (Normal)', status: 'optimal', limit: 'Trip Alarm' }
    ],
    aiRunningInsight: 'Transformer thermal margin is 22°C. Adequate capacity for evening peak grid surge with zero combustible dissolved gas accumulation.',
    advisoryActions: [
      { label: 'Export Diagnostic Package', actionType: 'export_package' },
      { label: 'Flag for Outage Inspection', actionType: 'flag_outage' }
    ],
    temperatureHistory: [
      { time: '06:00', temp: 62, benchmark: 75 },
      { time: '08:00', temp: 66, benchmark: 75 },
      { time: '10:00', temp: 70, benchmark: 75 },
      { time: '11:00', temp: 72, benchmark: 75 },
      { time: '12:00', temp: 74, benchmark: 75 },
      { time: '13:00', temp: 73, benchmark: 75 },
      { time: '14:00', temp: 72, benchmark: 75 }
    ]
  }
];

// All 7 Monitored Assets across the 500 MW Combined Cycle Plant
export const INITIAL_MONITORED_ASSETS: MonitoredAsset[] = [
  {
    id: 'asset-gt1',
    name: 'Gas Turbine 1',
    code: 'GT-1',
    category: 'Combustion Turbine',
    ratedCapacity: '160 MW Rated',
    healthScore: 99,
    statusText: 'Optimal',
    statusType: 'optimal',
    metrics: [
      { label: 'Active Load', value: '158 MW', status: 'optimal' },
      { label: 'Vibration', value: '1.4 mm/s', status: 'optimal' },
      { label: 'EGT Spread', value: '12°C', status: 'optimal' },
      { label: 'Lube Header', value: '2.6 bar', status: 'normal' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 97 },
      { day: 'D-5', score: 98 },
      { day: 'D-4', score: 96 },
      { day: 'D-3', score: 99 },
      { day: 'D-2', score: 98 },
      { day: 'D-1', score: 99 },
      { day: 'Today', score: 99 }
    ],
    aiSummary: 'GT-1 operating at peak thermodynamic efficiency. Flame dynamics uniform across all 14 combustor cans.'
  },
  {
    id: 'asset-gt2',
    name: 'Gas Turbine 2',
    code: 'GT-2',
    category: 'Combustion Turbine',
    ratedCapacity: '160 MW Rated',
    healthScore: 78,
    statusText: 'Degraded (Derated)',
    statusType: 'critical',
    caseId: 'CAS-001',
    metrics: [
      { label: 'Active Load', value: '142 MW (Derated)', status: 'warning' },
      { label: 'Vibration', value: '3.4 mm/s', status: 'warning' },
      { label: 'EGT Spread', value: '26°C (Alarm)', status: 'critical' },
      { label: 'Can 4 Temp', value: '578°C Cold Spot', status: 'critical' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 95 },
      { day: 'D-5', score: 93 },
      { day: 'D-4', score: 94 },
      { day: 'D-3', score: 88 },
      { day: 'D-2', score: 85 },
      { day: 'D-1', score: 81 },
      { day: 'Today', score: 78 }
    ],
    aiSummary: 'Combustion flame asymmetry in Can #4. Fuel nozzle valve actuator drift causing 18 MW generation penalty ($1,230/hr).'
  },
  {
    id: 'asset-st1',
    name: 'Steam Turbine',
    code: 'ST-1',
    category: 'Steam Cycle & Condenser',
    ratedCapacity: '180 MW Rated',
    healthScore: 82,
    statusText: 'Needs Backwash',
    statusType: 'warning',
    caseId: 'CAS-005',
    metrics: [
      { label: 'Active Load', value: '162 MW', status: 'optimal' },
      { label: 'Condenser Vacuum', value: '0.11 bar (High)', status: 'warning' },
      { label: 'Steam Inlet', value: '108 bar / 538°C', status: 'normal' },
      { label: 'Heat Rate Penalty', value: '+1.8% Fuel Loss', status: 'warning' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 94 },
      { day: 'D-5', score: 93 },
      { day: 'D-4', score: 91 },
      { day: 'D-3', score: 89 },
      { day: 'D-2', score: 86 },
      { day: 'D-1', score: 85 },
      { day: 'Today', score: 82 }
    ],
    aiSummary: 'Algae bio-fouling in cooling tubes has elevated vacuum backpressure to 0.11 bar. Recommend condenser backwash.'
  },
  {
    id: 'asset-hrsg',
    name: 'HRSG Boiler Unit 1 & 2',
    code: 'HRSG-1/2',
    category: 'Heat Recovery Steam Gen',
    ratedCapacity: 'Dual Triple-Pressure',
    healthScore: 96,
    statusText: 'Optimal',
    statusType: 'optimal',
    metrics: [
      { label: 'Steam Flow', value: '380 t/h', status: 'optimal' },
      { label: 'Drum Pressure', value: '110 bar', status: 'normal' },
      { label: 'Steam Temp', value: '540°C', status: 'optimal' },
      { label: 'Feed Water Flow', value: '388 t/h', status: 'normal' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 94 },
      { day: 'D-5', score: 96 },
      { day: 'D-4', score: 95 },
      { day: 'D-3', score: 97 },
      { day: 'D-2', score: 95 },
      { day: 'D-1', score: 98 },
      { day: 'Today', score: 96 }
    ],
    aiSummary: 'Superheater tube metal temperatures balanced. Economizer heat transfer within 98.4% of clean baseline.'
  },
  {
    id: 'asset-gsu',
    name: 'Main Step-Up Transformer',
    code: 'GSU T-01',
    category: 'Substation Step-Up (550 MVA)',
    ratedCapacity: '18 kV / 230 kV',
    healthScore: 98,
    statusText: 'Healthy',
    statusType: 'optimal',
    metrics: [
      { label: 'Winding Hotspot', value: '88°C', status: 'normal' },
      { label: 'Top Oil Temp', value: '72°C', status: 'normal' },
      { label: 'DGA Gas Status', value: 'Normal (< 25 ppm)', status: 'optimal' },
      { label: 'Power Factor', value: '0.38%', status: 'optimal' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 96 },
      { day: 'D-5', score: 98 },
      { day: 'D-4', score: 97 },
      { day: 'D-3', score: 98 },
      { day: 'D-2', score: 99 },
      { day: 'D-1', score: 97 },
      { day: 'Today', score: 98 }
    ],
    aiSummary: 'Thermal margin is 22°C. Zero combustible gas generation detected in online optical DGA monitor.'
  },
  {
    id: 'asset-bfp',
    name: 'Boiler Feed Water Pump',
    code: 'BFP-A',
    category: 'High-Pressure Pumping',
    ratedCapacity: '3.2 MW Multi-Stage',
    healthScore: 85,
    statusText: 'Active Case CAS-002',
    statusType: 'warning',
    caseId: 'CAS-002',
    metrics: [
      { label: 'Motor Current', value: '185 A', status: 'normal' },
      { label: 'Gearbox Vibration', value: '4.2 mm/s', status: 'warning' },
      { label: 'Discharge Pressure', value: '135 bar', status: 'normal' },
      { label: 'Bearing Oil Temp', value: '68°C', status: 'normal' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 93 },
      { day: 'D-5', score: 91 },
      { day: 'D-4', score: 92 },
      { day: 'D-3', score: 88 },
      { day: 'D-2', score: 87 },
      { day: 'D-1', score: 84 },
      { day: 'Today', score: 85 }
    ],
    aiSummary: 'High-frequency 2,450 Hz gear-mesh vibration spike. Standby pump BFP-B energized on warm standby.'
  },
  {
    id: 'asset-h2',
    name: 'Hydrogen Cooling Skid',
    code: 'H2-Gen',
    category: 'Generator Gas Sealing',
    ratedCapacity: '5.0 bar H2 Circuit',
    healthScore: 94,
    statusText: 'Case CAS-004 Resolved',
    statusType: 'optimal',
    caseId: 'CAS-004',
    metrics: [
      { label: 'Seal Vent Flow', value: '12 L/min', status: 'optimal' },
      { label: 'H2 Purity', value: '99.2%', status: 'optimal' },
      { label: 'Gas Pressure', value: '4.8 bar', status: 'normal' },
      { label: 'Dew Point', value: '-32°C', status: 'optimal' }
    ],
    healthTrend7d: [
      { day: 'D-6', score: 82 },
      { day: 'D-5', score: 84 },
      { day: 'D-4', score: 87 },
      { day: 'D-3', score: 89 },
      { day: 'D-2', score: 92 },
      { day: 'D-1', score: 95 },
      { day: 'Today', score: 94 }
    ],
    aiSummary: 'Differential regulator valve reseated in CAS-004. Seal vent flow normalized to nominal 1.8 Nm³/h.'
  }
];

// Ranked Priority Tasks with exact Time and Money savings from the user specification
export const INITIAL_OPTIMIZER_TASKS: OptimizerTask[] = [
  {
    id: 'task-1',
    rank: 1,
    title: 'Inspect & Calibrate GT-2 Fuel Nozzle 4',
    caseId: 'CAS-001',
    assetName: 'Gas Turbine GT-2',
    assetCode: 'GT-2',
    urgency: 'Critical (Do First)',
    urgencyLevel: 'critical',
    whyFirst: 'Peak market price ($145/MWh) begins at 17:30. Fixing the nozzle valve un-derates the unit from 142 MW back to 160 MW (+18 MW capacity).',
    timeSaved: 'Avoids 14 hours of un-derated generation loss and prevents potential blade thermal fatigue trip (48 hours outage risk avoided).',
    moneySaved: '+$29,500',
    moneySavedAmount: 29500,
    downtimeSavedHours: 48,
    assignedTech: 'Bob Smith',
    estDuration: '2.5 hrs',
    actionLabel: 'Authorize Work Order to Next Shift',
    actionToast: 'Work order CAS-001 authorized for Lead Tech Bob Smith for 15:00 execution window.',
    status: 'Pending Authorization'
  },
  {
    id: 'task-2',
    rank: 2,
    title: 'Condenser Cooling Tube Backwash Cycle (ST-1)',
    caseId: 'CAS-005',
    assetName: 'Steam Turbine ST-1',
    assetCode: 'ST-1',
    urgency: 'High (Rank 2)',
    urgencyLevel: 'high',
    whyFirst: 'Algae fouling in cooling tubes has degraded vacuum backpressure to 0.11 bar, creating a steady 1.8% thermodynamic heat rate penalty.',
    timeSaved: '0 downtime (Can be performed on-line in 40 minutes).',
    moneySaved: '+$9,120 / week',
    moneySavedAmount: 9120,
    downtimeSavedHours: 0.67,
    assignedTech: 'Water Treatment Team',
    estDuration: '45 mins',
    actionLabel: 'Queue for 14:00 Window',
    actionToast: 'Condenser online tube backwash scheduled for 14:00 water treatment window.',
    status: 'Queued'
  },
  {
    id: 'task-3',
    rank: 3,
    title: 'Lube Oil Filter Flush & Metallic Wear Sampling',
    caseId: 'CAS-003',
    assetName: 'Turbine Lube Oil Skid',
    assetCode: 'Lube Skid',
    urgency: 'High (Rank 3)',
    urgencyLevel: 'high',
    whyFirst: 'ISO cleanliness code 18/15/12 detected early ferrous particulates in reservoir before bearing damage occurs.',
    timeSaved: 'Prevents catastrophic bearing wipeout (120+ hours forced plant outage).',
    moneySaved: '+$140,000 in avoided turbine rotor overhaul',
    moneySavedAmount: 140000,
    downtimeSavedHours: 120,
    assignedTech: 'Charlie Davis',
    estDuration: '3.0 hrs',
    actionLabel: 'Schedule for Planned Window',
    actionToast: 'Lube oil filter replacement kit HYD-6M reserved in Warehouse 2 for Shift C.',
    status: 'Scheduled'
  },
  {
    id: 'task-4',
    rank: 4,
    title: 'Gearbox Pinion Mesh Alignment Verification',
    caseId: 'CAS-002',
    assetName: 'Boiler Feed Water Pump',
    assetCode: 'BFP-A',
    urgency: 'Medium (Rank 4)',
    urgencyLevel: 'medium',
    whyFirst: 'BFP-B is currently available on hot standby, meaning generation is not immediately at risk.',
    timeSaved: '4.5 hours alignment adjustment.',
    moneySaved: '+$3,200 in avoided pump replacement',
    moneySavedAmount: 3200,
    downtimeSavedHours: 4.5,
    assignedTech: 'Alice Johnson',
    estDuration: '4.0 hrs',
    actionLabel: 'Assign to Maintenance Log',
    actionToast: 'Pinion laser alignment task logged for tomorrow 08:00 rotating machinery team.',
    status: 'Assigned'
  },
  {
    id: 'task-5',
    rank: 5,
    title: 'Secondary Seal Vent Differential Pressure Verification',
    caseId: 'CAS-004',
    assetName: 'Hydrogen Cooling Skid',
    assetCode: 'H2-Gen',
    urgency: 'Low (Rank 5)',
    urgencyLevel: 'low',
    whyFirst: 'Regulator valve lapping complete; verify seal leakage remains below 2.5 Nm³/h nominal ceiling.',
    timeSaved: '2.0 hours surveillance review.',
    moneySaved: '+$1,850 in hydrogen purge conservation',
    moneySavedAmount: 1850,
    downtimeSavedHours: 2.0,
    assignedTech: 'Alice Johnson',
    estDuration: '1.5 hrs',
    actionLabel: 'Close Post-Maintenance Audit',
    actionToast: 'CAS-004 seal leak verification audit signed off by Alice Johnson.',
    status: 'Assigned'
  }
];

export const INITIAL_MAINTENANCE_RECORDS: AssetMaintenanceRecord[] = [
  {
    id: 'maint-gt1',
    assetName: 'Gas Turbine 1',
    assetTag: 'GT-1',
    eoh: '24,180 EOH / 312 Starts',
    lastMaintenanceDate: '12/10/2025',
    lastMaintenanceType: 'Hot Gas Path Inspection (HGPI) & Combustor Re-lining',
    nextServiceDate: '11/15/2026',
    nextServiceType: 'Major Turbine Overhaul (32,000 EOH Interval)',
    cycleStatus: 'on_schedule',
    cycleStatusLabel: 'On Schedule'
  },
  {
    id: 'maint-gt2',
    assetName: 'Gas Turbine 2',
    assetTag: 'GT-2',
    eoh: '26,450 EOH / 348 Starts',
    lastMaintenanceDate: '08/14/2025',
    lastMaintenanceType: 'Combustion Inspection & Fuel Nozzle Flow Calibration',
    nextServiceDate: '06/20/2026',
    nextServiceType: 'Hot Gas Path Inspection (Accelerated for Can 4 Flutter)',
    cycleStatus: 'overdue',
    cycleStatusLabel: 'Overdue / Action Required'
  },
  {
    id: 'maint-st1',
    assetName: 'Steam Turbine & Condenser',
    assetTag: 'ST-1',
    eoh: '31,200 EOH / 184 Starts',
    lastMaintenanceDate: '04/05/2025',
    lastMaintenanceType: 'Generator Rotor Retaining Ring NDT & Journal Survey',
    nextServiceDate: '09/10/2026',
    nextServiceType: 'LP Turbine Blade Laser Metrology & Valve Overhaul',
    cycleStatus: 'on_schedule',
    cycleStatusLabel: 'On Schedule'
  },
  {
    id: 'maint-hrsg',
    assetName: 'HRSG-1 Boiler Unit',
    assetTag: 'HRSG-1',
    eoh: '28,900 Operating Hours',
    lastMaintenanceDate: '10/22/2025',
    lastMaintenanceType: 'HP Economizer Tube Hydrostatic Proof Test & Ultrasonic Thickness',
    nextServiceDate: '03/18/2027',
    nextServiceType: 'Catalyst De-NOx SCR Layer Replacement',
    cycleStatus: 'on_schedule',
    cycleStatusLabel: 'On Schedule'
  },
  {
    id: 'maint-gsu',
    assetName: 'Step-Up Transformer GSU T-01',
    assetTag: 'GSU T-01',
    eoh: '42,800 Service Hours',
    lastMaintenanceDate: '01/15/2026',
    lastMaintenanceType: 'Bushing Power Factor & Dielectric Oil Reclamation',
    nextServiceDate: '01/15/2028',
    nextServiceType: 'OLTC Diverter Switch Vacuum Bottle Overhaul',
    cycleStatus: 'on_schedule',
    cycleStatusLabel: 'On Schedule'
  },
  {
    id: 'maint-bfp',
    assetName: 'Boiler Feed Pump BFP-A',
    assetTag: 'BFP-A',
    eoh: '18,400 Operating Hours',
    lastMaintenanceDate: '03/10/2025',
    lastMaintenanceType: 'Impeller Thrust Collar Clearance & Balance Drum Verification',
    nextServiceDate: '10/15/2026',
    nextServiceType: 'Mechanical Seal Replacement & High-Pressure Hydro Test',
    cycleStatus: 'due_soon',
    cycleStatusLabel: 'Due in 30 Days'
  }
];

export const INITIAL_UNRESOLVED_INSPECTIONS: UnresolvedAlertInspection[] = [
  {
    id: 'INS-101',
    title: 'GT-2 Combustor Can #4 Acoustic Vibration Flutter',
    asset: 'Gas Turbine GT-2',
    assetCode: 'GT-2',
    urgency: 'High',
    telemetryFinding: 'Transient acoustic resonance spike detected between 420 Hz – 480 Hz during evening ramp.',
    rootCauseStatus: '⚠️ Unknown — Cause Unidentified via SCADA',
    requiredInspectionType: 'On-site Borescope Optical Camera Inspection',
    inspectionDetail: 'Insert optical probe into combustion liner to visually diagnose if nozzle tip is cracked, fouled, or burnt.',
    targetWindow: 'Next Shift (Tomorrow 08:00)',
    leadInspector: 'Unassigned',
    actionLabel: 'Schedule Field Inspection',
    actionToast: 'Borescope inspection scheduled for GT-2 Can #4 tomorrow at 08:00.',
    status: 'Unscheduled'
  },
  {
    id: 'INS-102',
    title: 'Boiler Feed Pump BFP-A Lube Oil Frothing & Viscosity Drop',
    asset: 'Boiler Feed Pump BFP-A',
    assetCode: 'BFP-A',
    urgency: 'Medium',
    telemetryFinding: 'Sump level erratic fluctuations; oil pressure drop of -0.4 bar.',
    rootCauseStatus: '⚠️ Unknown — Cause Unidentified via Telemetry',
    requiredInspectionType: 'Physical Fluid Sample & Seal Spectrometry',
    inspectionDetail: 'Take physical oil draw to determine if water condensate or cooling glycol is leaking into the lube oil.',
    targetWindow: 'Today 15:30',
    leadInspector: 'Alice Johnson',
    actionLabel: 'Dispatch Technician to Sample Oil',
    actionToast: 'Technician Alice Johnson dispatched for immediate BFP-A oil draw & lab viscosity testing.',
    status: 'Scheduled'
  },
  {
    id: 'INS-103',
    title: 'GSU Transformer T-01 High-Voltage Bushing Micro-Discharge',
    asset: 'Main Step-up Transformer',
    assetCode: 'GSU T-01',
    urgency: 'High',
    telemetryFinding: 'Intermittent partial discharge pulses detected on 230kV C-phase bushing.',
    rootCauseStatus: '⚠️ Unknown — Cause Unidentified Remotely',
    requiredInspectionType: 'Thermographic Infrared (IR) Camera Survey',
    inspectionDetail: 'Scan physical bushing collar with FLIR thermal camera to check for external porcelain hairline fracture vs internal moisture.',
    targetWindow: 'Planned Outage Window',
    leadInspector: 'Charlie Davis',
    actionLabel: 'Add to Outage Checklist',
    actionToast: 'Bushing thermal survey added to high-priority Spring Outage checklist.',
    status: 'Unscheduled'
  }
];

export const INITIAL_COMPLETED_INSPECTIONS: CompletedInspection[] = [
  {
    id: 'INS-098',
    asset: 'Gas Turbine GT-1',
    inspectionDate: '09/02/2026',
    inspector: 'Bob Smith',
    inspectionType: 'Compressor Variable Stator Vane (VSV) Angular Bushing Audit',
    findings: 'All 6 vane stage torque links within OEM ±0.5° spec. Zero bushing backlash detected.',
    resultStatus: 'Passed'
  },
  {
    id: 'INS-099',
    asset: 'Hydrogen Cooling Skid (H2-Gen)',
    inspectionDate: '09/08/2026',
    inspector: 'Alice Johnson',
    inspectionType: 'Differential Pressure Soap & Bubble Gas Containment Survey',
    findings: 'Regulator valve seat lapped; vent flow stabilized to 1.8 Nm³/h. Zero external leak detected.',
    resultStatus: 'Clean'
  },
  {
    id: 'INS-100',
    asset: 'Steam Turbine ST-1',
    inspectionDate: '09/11/2026',
    inspector: 'Charlie Davis',
    inspectionType: 'Condenser Waterbox Cathodic Protection Anode Inspection',
    findings: 'Bay 2 zinc anodes consumed by 65%. Bio-slime noted in tube passes; backwash recommended.',
    resultStatus: 'Action Flagged'
  }
];

