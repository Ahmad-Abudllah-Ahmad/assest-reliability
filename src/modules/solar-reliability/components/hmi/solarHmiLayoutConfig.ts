export interface SolarHmiNodeCoord {
  id: string;
  tag: string;
  name: string;
  assetCode: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'pv_array' | 'combiner' | 'inverter' | 'transformer' | 'bess' | 'switchgear' | 'main_tr' | 'grid' | 'met_mast' | 'inline_link';
}

export const SOLAR_HMI_NODES: Record<string, SolarHmiNodeCoord> = {
  'node-pv-block-1a': {
    id: 'node-pv-block-1a',
    tag: 'PV-ROW-1A',
    name: 'PV Array 1A (String Row 1)',
    assetCode: 'PV-ROW-1A',
    x: 25,
    y: 18,
    width: 140,
    height: 75,
    kind: 'pv_array'
  },
  'node-pv-block-1b': {
    id: 'node-pv-block-1b',
    tag: 'PV-ROW-1B',
    name: 'PV Array 1B (String Row 2)',
    assetCode: 'PV-ROW-1B',
    x: 25,
    y: 103,
    width: 140,
    height: 75,
    kind: 'pv_array'
  },
  'node-pv-block-2a': {
    id: 'node-pv-block-2a',
    tag: 'PV-ROW-2A',
    name: 'PV Array 2A (String Row 3)',
    assetCode: 'PV-ROW-2A',
    x: 25,
    y: 188,
    width: 140,
    height: 75,
    kind: 'pv_array'
  },
  'node-pv-block-2b': {
    id: 'node-pv-block-2b',
    tag: 'PV-ROW-2B',
    name: 'PV Array 2B (String Row 4)',
    assetCode: 'PV-ROW-2B',
    x: 25,
    y: 273,
    width: 140,
    height: 75,
    kind: 'pv_array'
  },
  'node-pv-block-3a': {
    id: 'node-pv-block-3a',
    tag: 'PV-ROW-3A',
    name: 'PV Array 3A (String Row 5)',
    assetCode: 'PV-ROW-3A',
    x: 25,
    y: 358,
    width: 140,
    height: 75,
    kind: 'pv_array'
  },
  'node-pv-block-3b': {
    id: 'node-pv-block-3b',
    tag: 'PV-ROW-3B',
    name: 'PV Array 3B (String Row 6)',
    assetCode: 'PV-ROW-3B',
    x: 25,
    y: 443,
    width: 140,
    height: 75,
    kind: 'pv_array'
  },
  'node-meteo-mast': {
    id: 'node-meteo-mast',
    tag: 'MET-01',
    name: 'Solar Meteorological Station Mast',
    assetCode: 'MET-01',
    x: 25,
    y: 540,
    width: 140,
    height: 80,
    kind: 'met_mast'
  },
  'node-combiner-1': {
    id: 'node-combiner-1',
    tag: 'COMB-01',
    name: 'DC Combiner Box CB-01',
    assetCode: 'PV-ROW-1A',
    x: 225,
    y: 25,
    width: 90,
    height: 75,
    kind: 'combiner'
  },
  'node-combiner-2': {
    id: 'node-combiner-2',
    tag: 'COMB-02',
    name: 'DC Combiner Box CB-02',
    assetCode: 'PV-ROW-1B',
    x: 225,
    y: 110,
    width: 90,
    height: 75,
    kind: 'combiner'
  },
  'node-combiner-3': {
    id: 'node-combiner-3',
    tag: 'COMB-03',
    name: 'DC Combiner Box CB-03',
    assetCode: 'PV-ROW-2A',
    x: 225,
    y: 195,
    width: 90,
    height: 75,
    kind: 'combiner'
  },
  'node-combiner-4': {
    id: 'node-combiner-4',
    tag: 'COMB-04',
    name: 'DC Combiner Box CB-04',
    assetCode: 'PV-ROW-2B',
    x: 225,
    y: 280,
    width: 90,
    height: 75,
    kind: 'combiner'
  },
  'node-combiner-5': {
    id: 'node-combiner-5',
    tag: 'COMB-05',
    name: 'DC Combiner Box CB-05',
    assetCode: 'PV-ROW-3A',
    x: 225,
    y: 365,
    width: 90,
    height: 75,
    kind: 'combiner'
  },
  'node-combiner-6': {
    id: 'node-combiner-6',
    tag: 'COMB-06',
    name: 'DC Combiner Box CB-06',
    assetCode: 'PV-ROW-3B',
    x: 225,
    y: 450,
    width: 90,
    height: 75,
    kind: 'combiner'
  },
  'node-bess-skid': {
    id: 'node-bess-skid',
    tag: 'BESS-01',
    name: 'Utility Battery Storage (20 MWh / 10 MW)',
    assetCode: 'BESS-01',
    x: 210,
    y: 540,
    width: 155,
    height: 90,
    kind: 'bess'
  },
  'node-inverter-1': {
    id: 'node-inverter-1',
    tag: 'INV-01',
    name: 'Central Inverter Station 01 (Dual PCS Skid)',
    assetCode: 'INV-01',
    x: 420,
    y: 45,
    width: 140,
    height: 120,
    kind: 'inverter'
  },
  'node-inverter-2': {
    id: 'node-inverter-2',
    tag: 'INV-02',
    name: 'Central Inverter Station 02 (Dual PCS Skid)',
    assetCode: 'INV-02',
    x: 420,
    y: 215,
    width: 140,
    height: 120,
    kind: 'inverter'
  },
  'node-inverter-3': {
    id: 'node-inverter-3',
    tag: 'INV-03',
    name: 'Central Inverter Station 03 (Dual PCS Skid)',
    assetCode: 'INV-03',
    x: 420,
    y: 385,
    width: 140,
    height: 120,
    kind: 'inverter'
  },
  'node-transformer-1': {
    id: 'node-transformer-1',
    tag: 'TR-01',
    name: 'Padmount Step-Up Transformer TR-01 (0.8 / 33 kV)',
    assetCode: 'TR-01',
    x: 670,
    y: 45,
    width: 110,
    height: 115,
    kind: 'transformer'
  },
  'node-transformer-2': {
    id: 'node-transformer-2',
    tag: 'TR-02',
    name: 'Padmount Step-Up Transformer TR-02 (0.8 / 33 kV)',
    assetCode: 'TR-02',
    x: 670,
    y: 215,
    width: 110,
    height: 115,
    kind: 'transformer'
  },
  'node-transformer-3': {
    id: 'node-transformer-3',
    tag: 'TR-03',
    name: 'Padmount Step-Up Transformer TR-03 (0.8 / 33 kV)',
    assetCode: 'TR-03',
    x: 670,
    y: 385,
    width: 110,
    height: 115,
    kind: 'transformer'
  },
  'node-main-substation': {
    id: 'node-main-substation',
    tag: 'SWG-33KV',
    name: '5-Bay 33 kV Metal-Clad MV Switchgear Lineup',
    assetCode: 'SWG-33KV',
    x: 880,
    y: 205,
    width: 160,
    height: 235,
    kind: 'switchgear'
  },
  'node-substation-main-tr': {
    id: 'node-substation-main-tr',
    tag: 'MAIN-TR-130MVA',
    name: 'Main Substation Step-Up Transformer (33 / 132 kV)',
    assetCode: 'MAIN-TR-130MVA',
    x: 1095,
    y: 295,
    width: 120,
    height: 150,
    kind: 'main_tr'
  },
  'node-solar-grid': {
    id: 'node-solar-grid',
    tag: 'GRID-132KV',
    name: 'High-Voltage Utility Grid Intertie Gantry',
    assetCode: 'GRID-132KV',
    x: 1360,
    y: 210,
    width: 95,
    height: 240,
    kind: 'grid'
  }
};
