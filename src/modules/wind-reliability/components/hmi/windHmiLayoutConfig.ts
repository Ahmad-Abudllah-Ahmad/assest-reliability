export interface WindMachineLayoutNode {
  id: string; // DOM id e.g. "node-turbine-1"
  assetCode?: string; // e.g. "WT-001"
  label: string;
  name: string;
  sublabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'monitored' | 'process';
  equipmentType: 'wind-turbine' | 'converter-suite' | 'transformer' | 'statcom' | 'switchgear' | 'grid' | 'met-mast' | 'genset';
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const WIND_PROCESS_NODES: Record<string, WindMachineLayoutNode> = {
  'WT-001': {
    id: 'node-turbine-1',
    assetCode: 'WT-001',
    label: 'WT-001',
    name: 'Wind Turbine Generator A1',
    sublabel: '5.2 MW DFIG Wind Turbine',
    x: 45,
    y: 38,
    width: 100,
    height: 100,
    category: 'monitored',
    equipmentType: 'wind-turbine',
    tooltipPlacement: 'right'
  },
  'WT-002': {
    id: 'node-turbine-2',
    assetCode: 'WT-002',
    label: 'WT-002',
    name: 'Wind Turbine Generator A2',
    sublabel: '5.2 MW DFIG Wind Turbine',
    x: 45,
    y: 128,
    width: 100,
    height: 100,
    category: 'monitored',
    equipmentType: 'wind-turbine',
    tooltipPlacement: 'right'
  },
  'WT-003': {
    id: 'node-turbine-3',
    assetCode: 'WT-003',
    label: 'WT-003',
    name: 'Wind Turbine Generator A3',
    sublabel: '5.2 MW DFIG Wind Turbine',
    x: 45,
    y: 218,
    width: 100,
    height: 100,
    category: 'monitored',
    equipmentType: 'wind-turbine',
    tooltipPlacement: 'right'
  },
  'WT-004': {
    id: 'node-turbine-4',
    assetCode: 'WT-004',
    label: 'WT-004',
    name: 'Wind Turbine Generator B1',
    sublabel: '5.2 MW DFIG Wind Turbine',
    x: 45,
    y: 348,
    width: 100,
    height: 100,
    category: 'monitored',
    equipmentType: 'wind-turbine',
    tooltipPlacement: 'right'
  },
  'WT-005': {
    id: 'node-turbine-5',
    assetCode: 'WT-005',
    label: 'WT-005',
    name: 'Wind Turbine Generator B2',
    sublabel: '5.2 MW DFIG Wind Turbine',
    x: 45,
    y: 438,
    width: 100,
    height: 100,
    category: 'monitored',
    equipmentType: 'wind-turbine',
    tooltipPlacement: 'right'
  },
  'WT-006': {
    id: 'node-turbine-6',
    assetCode: 'WT-006',
    label: 'WT-006',
    name: 'Wind Turbine Generator B3',
    sublabel: '5.2 MW DFIG Wind Turbine',
    x: 45,
    y: 528,
    width: 100,
    height: 100,
    category: 'monitored',
    equipmentType: 'wind-turbine',
    tooltipPlacement: 'right'
  },
  'MET-01': {
    id: 'node-met-mast',
    label: 'MET-01',
    name: 'Meteorological Mast Station',
    sublabel: 'Sonic Anemometer & 3D Wind Vector Mast',
    x: 340,
    y: 545,
    width: 90,
    height: 90,
    category: 'process',
    equipmentType: 'met-mast',
    tooltipPlacement: 'top'
  },
  'PCS-A': {
    id: 'node-converter-suite-a',
    assetCode: 'PCS-A',
    label: 'PCS-A',
    name: 'Converter Suite A (3-Bay)',
    sublabel: 'Full-Scale 4-Quadrant DFIG Converter System',
    x: 490,
    y: 95,
    width: 160,
    height: 130,
    category: 'monitored',
    equipmentType: 'converter-suite',
    tooltipPlacement: 'bottom'
  },
  'PCS-B': {
    id: 'node-converter-suite-b',
    assetCode: 'PCS-B',
    label: 'PCS-B',
    name: 'Converter Suite B (3-Bay)',
    sublabel: 'Full-Scale 4-Quadrant DFIG Converter System',
    x: 490,
    y: 405,
    width: 160,
    height: 130,
    category: 'monitored',
    equipmentType: 'converter-suite',
    tooltipPlacement: 'top'
  },
  'TR-BAY-A': {
    id: 'node-transformer-bay-a',
    assetCode: 'TR-BAY-A',
    label: 'TR-BAY-A',
    name: 'Step-Up Transformer Bay A',
    sublabel: '33/132 kV Substation Step-Up Unit',
    x: 760,
    y: 105,
    width: 110,
    height: 115,
    category: 'monitored',
    equipmentType: 'transformer',
    tooltipPlacement: 'left'
  },
  'TR-BAY-B': {
    id: 'node-transformer-bay-b',
    assetCode: 'TR-BAY-B',
    label: 'TR-BAY-B',
    name: 'Step-Up Transformer Bay B',
    sublabel: '33/132 kV Substation Step-Up Unit',
    x: 760,
    y: 415,
    width: 110,
    height: 115,
    category: 'monitored',
    equipmentType: 'transformer',
    tooltipPlacement: 'left'
  },
  'STAT-01': {
    id: 'node-statcom-skid',
    assetCode: 'STAT-01',
    label: 'STAT-01',
    name: 'STATCOM Skid (±20 MVAR)',
    sublabel: 'Dynamic Reactive Power Grid Support',
    x: 680,
    y: 560,
    width: 110,
    height: 65,
    category: 'monitored',
    equipmentType: 'statcom',
    tooltipPlacement: 'top'
  },
  'GENSET-01': {
    id: 'node-aux-genset',
    label: 'GENSET-01',
    name: 'Aux GenSet (2.5 MVA)',
    sublabel: 'Emergency Black-Start Auxiliary Unit',
    x: 905,
    y: 560,
    width: 95,
    height: 60,
    category: 'process',
    equipmentType: 'genset',
    tooltipPlacement: 'top'
  },
  'GIS-132': {
    id: 'node-main-substation',
    assetCode: 'GIS-132',
    label: 'GIS-132',
    name: '5-Bay 132kV SF6 GIS Switchgear',
    sublabel: 'High Voltage Gas-Insulated Substation Lineup',
    x: 1020,
    y: 215,
    width: 165,
    height: 185,
    category: 'monitored',
    equipmentType: 'switchgear',
    tooltipPlacement: 'left'
  },
  'GRID-TIE': {
    id: 'node-utility-grid',
    label: 'GRID-TIE',
    name: 'High-Voltage Utility Grid Gantry',
    sublabel: '132kV Transmission Intertie & Pylon',
    x: 1360,
    y: 210,
    width: 90,
    height: 220,
    category: 'process',
    equipmentType: 'grid',
    tooltipPlacement: 'left'
  }
};
