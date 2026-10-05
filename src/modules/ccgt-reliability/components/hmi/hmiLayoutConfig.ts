import React from 'react';

export interface MachineLayoutNode {
  id: string; // DOM id e.g. "node-gt-1"
  assetCode?: string; // e.g. "GT-1" if it's a monitored asset
  label: string;
  name: string;
  sublabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: 'monitored' | 'process';
  equipmentType: 'gas-turbine' | 'steam-turbine' | 'pump' | 'transformer' | 'hrsg' | 'condenser' | 'deaerator' | 'cooling-tower' | 'fuel-skid' | 'switchgear' | 'grid';
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const CCGT_PROCESS_NODES: Record<string, MachineLayoutNode> = {
  'GT-1': {
    id: 'node-gt-1',
    assetCode: 'GT-1',
    label: 'GT-1',
    name: 'Gas Turbine 1 Generator Train',
    sublabel: 'Combustion Turbine & Generator',
    x: 140,
    y: 65,
    width: 200,
    height: 110,
    category: 'monitored',
    equipmentType: 'gas-turbine',
    tooltipPlacement: 'bottom'
  },
  'GT-2': {
    id: 'node-gt-2',
    assetCode: 'GT-2',
    label: 'GT-2',
    name: 'Gas Turbine 2 Generator Train',
    sublabel: 'Combustion Turbine & Generator',
    x: 140,
    y: 505,
    width: 200,
    height: 110,
    category: 'monitored',
    equipmentType: 'gas-turbine',
    tooltipPlacement: 'top'
  },
  'ST-1': {
    id: 'node-st-1',
    assetCode: 'ST-1',
    label: 'ST-1',
    name: 'Steam Turbine Generator Train',
    sublabel: 'HP / IP / LP Cylinders & Generator',
    x: 840,
    y: 235,
    width: 260,
    height: 120,
    category: 'monitored',
    equipmentType: 'steam-turbine',
    tooltipPlacement: 'top'
  },
  'BFP-A': {
    id: 'node-bfp-a',
    assetCode: 'BFP-A',
    label: 'BFP-A',
    name: 'Boiler Feed Pump Train A',
    sublabel: 'Multi-Stage High Pressure Feed Pump',
    x: 175,
    y: 375,
    width: 85,
    height: 80,
    category: 'monitored',
    equipmentType: 'pump',
    tooltipPlacement: 'right'
  },
  'GSU': {
    id: 'node-gsu',
    assetCode: 'GSU',
    label: 'GSU',
    name: 'Main Step-Up Transformer System',
    sublabel: 'Generator Step-Up Station (18-20kV / 400kV)',
    x: 1230,
    y: 250,
    width: 75,
    height: 85,
    category: 'monitored',
    equipmentType: 'transformer',
    tooltipPlacement: 'left'
  },
  // Supporting process context equipment (neutral, identification only)
  'HRSG-1': {
    id: 'node-hrsg-1',
    label: 'HRSG-1',
    name: 'Heat Recovery Steam Generator 1',
    sublabel: 'Triple-Pressure Drum & Superheaters (Process Context)',
    x: 430,
    y: 45,
    width: 110,
    height: 145,
    category: 'process',
    equipmentType: 'hrsg',
    tooltipPlacement: 'bottom'
  },
  'HRSG-2': {
    id: 'node-hrsg-2',
    label: 'HRSG-2',
    name: 'Heat Recovery Steam Generator 2',
    sublabel: 'Triple-Pressure Drum & Superheaters (Process Context)',
    x: 430,
    y: 485,
    width: 110,
    height: 145,
    category: 'process',
    equipmentType: 'hrsg',
    tooltipPlacement: 'top'
  },
  'BFP-B': {
    id: 'node-bfp-b',
    label: 'BFP-B',
    name: 'Boiler Feed Pump Train B',
    sublabel: 'Standby Redundant Feed Pump (Process Context)',
    x: 275,
    y: 375,
    width: 85,
    height: 80,
    category: 'process',
    equipmentType: 'pump',
    tooltipPlacement: 'right'
  },
  'DEAERATOR': {
    id: 'node-deaerator',
    label: 'DEA-01',
    name: 'Deaerator & Feedwater Storage Tank',
    sublabel: 'Dissolved O2 Stripper & Feed Header (Process Context)',
    x: 200,
    y: 275,
    width: 105,
    height: 65,
    category: 'process',
    equipmentType: 'deaerator',
    tooltipPlacement: 'bottom'
  },
  'CONDENSER': {
    id: 'node-condenser',
    label: 'COND-01',
    name: 'Surface Condenser & Vacuum Hotwell',
    sublabel: 'Steam Condensation & Condensate Return (Process Context)',
    x: 950,
    y: 365,
    width: 105,
    height: 75,
    category: 'process',
    equipmentType: 'condenser',
    tooltipPlacement: 'bottom'
  },
  'COOLING-TOWER': {
    id: 'node-cooling-tower',
    label: 'CW-01',
    name: 'Circulating Water Cooling Tower',
    sublabel: 'Heat Rejection Basin & Circulation Loop (Process Context)',
    x: 840,
    y: 605,
    width: 105,
    height: 85,
    category: 'process',
    equipmentType: 'cooling-tower',
    tooltipPlacement: 'top'
  },
  'FUEL-SKID': {
    id: 'node-fuel-skid',
    label: 'NG-SKID',
    name: 'Natural Gas Fuel Conditioning Skid',
    sublabel: 'Pressure Regulating & Separation (Process Context)',
    x: 35,
    y: 295,
    width: 80,
    height: 95,
    category: 'process',
    equipmentType: 'fuel-skid',
    tooltipPlacement: 'right'
  },
  'SWITCHGEAR': {
    id: 'node-switchgear',
    label: 'GIS-400',
    name: '400kV SF6 Gas-Insulated Switchgear',
    sublabel: 'High Voltage Bus & Bays (Process Context)',
    x: 1370,
    y: 215,
    width: 85,
    height: 165,
    category: 'process',
    equipmentType: 'switchgear',
    tooltipPlacement: 'left'
  },
  'GRID': {
    id: 'node-grid',
    label: 'GRID-400',
    name: 'National Interconnection Grid',
    sublabel: 'High Voltage Power Transmission Intertie',
    x: 1485,
    y: 195,
    width: 70,
    height: 200,
    category: 'process',
    equipmentType: 'grid',
    tooltipPlacement: 'left'
  }
};
