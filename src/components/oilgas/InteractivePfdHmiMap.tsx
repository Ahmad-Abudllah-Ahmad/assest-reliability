import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Wrench, 
  Flame, 
  Droplets, 
  Gauge, 
  ArrowRight, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  Zap, 
  Info,
  X,
  Radio,
  Eye,
  Search,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { 
  RotatingEquipmentRul, 
  OffshoreSeparator, 
  OffshoreWellhead, 
  OffshoreStorageTank, 
  OffshoreExportSystem 
} from '../../types/oilGasTypes';
export interface HotspotItem {
  id: string;
  name: string;
  tag: string;
  category: 'compressor' | 'separator' | 'pump' | 'tank' | 'wellhead' | 'pipeline';
  left: number; // percentage
  top: number; // percentage
  width: number; // percentage
  height: number; // percentage
  status: 'critical' | 'warning' | 'optimal';
  statusLabel: string;
  rulPercent: number;
  daysRemaining: number;
  metrics: { label: string; value: string; isWarning?: boolean }[];
  aiInsight: string;
  recommendedAction: string;
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right';
  sourceData?: any;
}

interface InteractivePfdHmiMapProps {
  rotatingEquipment: RotatingEquipmentRul[];
  separators?: OffshoreSeparator[];
  wellheads?: OffshoreWellhead[];
  storageTanks?: OffshoreStorageTank[];
  onLogCaseForAsset?: (equipment: RotatingEquipmentRul) => void;
  onOpenJargonGuide?: () => void;
}

export const InteractivePfdHmiMap: React.FC<InteractivePfdHmiMapProps> = ({
  rotatingEquipment,
  separators = [],
  wellheads = [],
  storageTanks = [],
  onLogCaseForAsset,
  onOpenJargonGuide
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showOutlines, setShowOutlines] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  // Link mock data to the 13 PFD machine hotspots
  const lpCompressor = rotatingEquipment.find(r => r.tag === 'K-101') || rotatingEquipment[1];
  const hpCompressor = rotatingEquipment.find(r => r.tag === 'K-201A') || rotatingEquipment[0];
  const crudePump = rotatingEquipment.find(r => r.tag === 'P-101A') || rotatingEquipment[2];

  const sep1 = separators.find(s => s.tag === 'V-101');
  const sep2 = separators.find(s => s.tag === 'V-102');
  const sepTest = separators.find(s => s.tag === 'V-105');

  const totalStorageStock = storageTanks.reduce((acc, t) => acc + t.currentStockBbl, 0);

  const HOTSPOTS: HotspotItem[] = [
    // 1. LP Gas Compressor (K-101) - Warning State
    {
      id: 'hotspot-lp-comp',
      name: 'LP Booster Gas Compressor',
      tag: lpCompressor?.tag || 'K-101',
      category: 'compressor',
      left: 36.5,
      top: 3.5,
      width: 10.5,
      height: 18.0,
      status: 'warning',
      statusLabel: 'Seal Wear Advisory',
      rulPercent: lpCompressor?.rulPercent || 74,
      daysRemaining: 18,
      metrics: [
        { label: 'Seal Leakage', value: '1.28 scfm', isWarning: true },
        { label: 'Discharge Press.', value: '8.6 bar' },
        { label: 'Vibration RMS', value: '4.1 mm/s' },
        { label: 'Bearing Heat', value: '84.2°C' }
      ],
      aiInsight: 'Dry gas seal primary leakage rate has elevated to 1.28 scfm. Machine running safely, but seal cartridge replacement needed in 18 days.',
      recommendedAction: 'Schedule technician Marcus Vance to replace dry gas seal cartridge during scheduled Wednesday window.',
      tooltipPosition: 'bottom',
      sourceData: lpCompressor
    },

    // 2. HP Gas Compressor (K-201A) - Optimal State
    {
      id: 'hotspot-hp-comp',
      name: 'HP Export Gas Compressor Skid A',
      tag: hpCompressor?.tag || 'K-201A',
      category: 'compressor',
      left: 56.5,
      top: 3.5,
      width: 10.5,
      height: 18.0,
      status: 'optimal',
      statusLabel: 'Operating Within Envelope',
      rulPercent: hpCompressor?.rulPercent || 88,
      daysRemaining: 285,
      metrics: [
        { label: 'Discharge Press.', value: '185.0 bar' },
        { label: 'Vibration RMS', value: '3.4 mm/s' },
        { label: 'Bearing Heat', value: '78.5°C' },
        { label: 'Seal Leakage', value: '0.82 scfm' }
      ],
      aiInsight: 'Aerodynamic stage efficiency 89.2%. Gas seal nitrogen barrier pressure delta is completely normal (+2.4 bar).',
      recommendedAction: 'Continue normal 4,000-hour acoustic lube oil sampling cycle.',
      tooltipPosition: 'bottom',
      sourceData: hpCompressor
    },

    // 3. LP Suction Scrubber Separator (V-201)
    {
      id: 'hotspot-lp-sep',
      name: 'LP Compressor Suction Scrubber',
      tag: 'V-201',
      category: 'separator',
      left: 28.0,
      top: 3.5,
      width: 8.0,
      height: 19.0,
      status: 'optimal',
      statusLabel: 'Normal Liquid Separation',
      rulPercent: 94,
      daysRemaining: 420,
      metrics: [
        { label: 'Operating Press.', value: '9.2 bar' },
        { label: 'Liquid Level', value: '32.4%' },
        { label: 'Demister DP', value: '18 mbar' }
      ],
      aiInsight: 'High-efficiency vane demister prevents liquid carryover into the LP compressor suction rotor.',
      recommendedAction: 'Drain pot automated purge cycle operating normally.',
      tooltipPosition: 'bottom-right'
    },

    // 4. HP Interstage Scrubber Separator (V-202)
    {
      id: 'hotspot-hp-sep',
      name: 'HP Compressor Interstage Scrubber',
      tag: 'V-202',
      category: 'separator',
      left: 48.0,
      top: 3.5,
      width: 7.5,
      height: 19.0,
      status: 'optimal',
      statusLabel: 'High Pressure Barrier Active',
      rulPercent: 91,
      daysRemaining: 360,
      metrics: [
        { label: 'Operating Press.', value: '64.5 bar' },
        { label: 'Liquid Level', value: '28.0%' },
        { label: 'Scrubber Eff.', value: '99.4%' }
      ],
      aiInsight: 'Removes condensed heavy hydrocarbons before gas enters the final high-pressure 185-bar stage.',
      recommendedAction: 'No action needed. Automated condensate blowdown within normal range.',
      tooltipPosition: 'bottom'
    },

    // 5. Gas Custody Transfer Meter
    {
      id: 'hotspot-gas-meter',
      name: 'Gas Custody Transfer Flow Meter',
      tag: 'FM-201',
      category: 'pipeline',
      left: 67.5,
      top: 4.0,
      width: 8.5,
      height: 16.5,
      status: 'optimal',
      statusLabel: 'Fiscal Custody Certified',
      rulPercent: 97,
      daysRemaining: 510,
      metrics: [
        { label: 'Export Gas Flow', value: '148.0 MMscf/d' },
        { label: 'Gas Temp', value: '34.2°C' },
        { label: 'Sonic Speed', value: '412.4 m/s' }
      ],
      aiInsight: '8-path ultrasonic custody transfer meter. Calibration drift is within ±0.08% fiscal standard.',
      recommendedAction: 'Daily fiscal export log auto-signed and archived.',
      tooltipPosition: 'bottom'
    },

    // 6. Gas Pipeline Pig Launcher (PL-201)
    {
      id: 'hotspot-gas-pig',
      name: 'Gas Pipeline Pig Launcher & Export Trap',
      tag: 'PL-201',
      category: 'pipeline',
      left: 79.5,
      top: 5.0,
      width: 14.5,
      height: 16.5,
      status: 'optimal',
      statusLabel: '185 Bar Trunkline Active',
      rulPercent: 92,
      daysRemaining: 380,
      metrics: [
        { label: 'Line Pressure', value: '185.2 bar' },
        { label: 'Door Lock', value: 'Secured' },
        { label: 'Last Robot Run', value: '42 Days Ago' }
      ],
      aiInsight: 'Subsea gas trunkline pigging chamber ready. Internal pipeline wall integrity verified via ultrasonic caliper.',
      recommendedAction: 'Next scheduled intelligent pig run scheduled in 48 days.',
      tooltipPosition: 'bottom'
    },

    // 7. 1st Stage Production Separator (V-101)
    {
      id: 'hotspot-sep-1',
      name: '1st Stage 3-Phase Production Separator',
      tag: sep1?.tag || 'V-101',
      category: 'separator',
      left: 28.5,
      top: 34.0,
      width: 19.5,
      height: 16.5,
      status: 'optimal',
      statusLabel: 'Primary Oil/Gas Cut Healthy',
      rulPercent: 89,
      daysRemaining: 310,
      metrics: [
        { label: 'Operating Press.', value: '82.4 bar' },
        { label: 'Liquid Level', value: '56.4%' },
        { label: 'Separation Eff.', value: '98.6%' },
        { label: 'Water Cut', value: '22.8% BSW' }
      ],
      aiInsight: 'Primary seabed fluid separation chamber. Sand jetting system operating within allowable grit accumulation baseline.',
      recommendedAction: 'Maintain current weir plate automated level control.',
      tooltipPosition: 'bottom-right'
    },

    // 8. 2nd Stage Intermediate Degasser Separator (V-102)
    {
      id: 'hotspot-sep-2',
      name: '2nd Stage Degasser Separator',
      tag: sep2?.tag || 'V-102',
      category: 'separator',
      left: 49.5,
      top: 40.0,
      width: 18.5,
      height: 16.5,
      status: 'optimal',
      statusLabel: 'Low Pressure Degassing Normal',
      rulPercent: 93,
      daysRemaining: 390,
      metrics: [
        { label: 'Operating Press.', value: '24.8 bar' },
        { label: 'Oil Cleanliness', value: '99.2%' },
        { label: 'Gas Recovery', value: '33.8 MMscf/d' }
      ],
      aiInsight: 'Strips out remaining volatile light hydrocarbon vapors to stabilize crude before feeding to cargo tanks.',
      recommendedAction: 'Demulsifier chemical injection rate is optimal (18 ppm).',
      tooltipPosition: 'bottom'
    },

    // 9. Test Separator & Coriolis Skid (V-105) - Attention State
    {
      id: 'hotspot-sep-test',
      name: 'Wellhead Test Separator & Metering Skid',
      tag: sepTest?.tag || 'V-105',
      category: 'separator',
      left: 29.5,
      top: 58.0,
      width: 20.5,
      height: 16.5,
      status: 'warning',
      statusLabel: 'Sand Accumulation Advisory',
      rulPercent: 78,
      daysRemaining: 45,
      metrics: [
        { label: 'Sand Accumulation', value: '14.2%', isWarning: true },
        { label: 'Operating Press.', value: '80.2 bar' },
        { label: 'Water Cut (BSW)', value: '38.4%' },
        { label: 'Test Well Flow', value: '15,800 bpd' }
      ],
      aiInsight: 'Sand accumulation has reached 14.2% (Warning threshold: 15%). Acoustic sand detector indicates Well B-02 grain shedding.',
      recommendedAction: 'Trigger automated bottom sand jetting flush sequence before testing next subsea well.',
      tooltipPosition: 'top-left'
    },

    // 10. Main Crude Export Pump (P-101A) - Critical/Warning State
    {
      id: 'hotspot-crude-pump',
      name: 'Main Crude Oil Export Pump A',
      tag: crudePump?.tag || 'P-101A',
      category: 'pump',
      left: 71.5,
      top: 53.0,
      width: 10.5,
      height: 13.5,
      status: 'critical',
      statusLabel: 'Bearing Thermal Elevation',
      rulPercent: crudePump?.rulPercent || 62,
      daysRemaining: 12,
      metrics: [
        { label: 'Outboard Bearing', value: '86.8°C', isWarning: true },
        { label: 'Vibration RMS', value: '5.2 mm/s', isWarning: true },
        { label: 'Discharge Press.', value: '112.4 bar' },
        { label: 'Pump Throughput', value: '84,200 bpd' }
      ],
      aiInsight: 'Outboard radial bearing temperature running +7.5°C above twin pump P-101B. 1X vibration harmonics detected.',
      recommendedAction: 'Transfer primary duty to standby Pump P-101B and sample bearing lubricant for metallic wear particulates.',
      tooltipPosition: 'top'
    },

    // 11. Fiscal Oil Flow Meter (FM-101)
    {
      id: 'hotspot-oil-meter',
      name: 'Fiscal Crude Oil Metering Skid',
      tag: 'FM-101',
      category: 'pipeline',
      left: 73.0,
      top: 36.5,
      width: 8.5,
      height: 15.5,
      status: 'optimal',
      statusLabel: 'Fiscal Pipeline Certification Active',
      rulPercent: 95,
      daysRemaining: 460,
      metrics: [
        { label: 'Crude Export Rate', value: '84,200 bpd' },
        { label: 'Density (API)', value: '31.4° API' },
        { label: 'BSW Impurity', value: '0.28%' }
      ],
      aiInsight: 'Triple-meter coriolis skid measuring export flow to subsea trunkline. Water cut is well below 0.5% commercial tariff limit.',
      recommendedAction: 'Custody transfer batch report synchronized with off-taker refinery.',
      tooltipPosition: 'top'
    },

    // 12. Oil Export Pipeline Pig Launcher (PL-101)
    {
      id: 'hotspot-oil-pig',
      name: '16" Crude Pipeline Pig Launcher',
      tag: 'PL-101',
      category: 'pipeline',
      left: 83.0,
      top: 36.5,
      width: 14.5,
      height: 15.5,
      status: 'optimal',
      statusLabel: 'Subsea Pipeline Ready',
      rulPercent: 91,
      daysRemaining: 340,
      metrics: [
        { label: 'Pipeline Press.', value: '112.4 bar' },
        { label: 'Launch Barrel', value: 'Pressurized' },
        { label: 'Next Pig Run', value: 'Scheduled 16:00' }
      ],
      aiInsight: 'Autonomous internal pipe-cleaning capsule loaded. Equalizing valve open to 112 bar pipeline pressure.',
      recommendedAction: 'Retract launch pin to release cleaning robot into 16" subsea pipeline.',
      tooltipPosition: 'top'
    },

    // 13. FPSO Oil Cargo Storage Tanks (Tanks 1, 2, 3)
    {
      id: 'hotspot-tanks',
      name: 'FPSO Hull Cargo Storage Tanks (Tanks 1-3)',
      tag: 'TK-101/2/3',
      category: 'tank',
      left: 62.0,
      top: 68.0,
      width: 21.5,
      height: 22.0,
      status: 'optimal',
      statusLabel: 'Nitrogen Blanket Active',
      rulPercent: 86,
      daysRemaining: 210,
      metrics: [
        { label: 'Current Stock', value: `${totalStorageStock.toLocaleString()} bbl` },
        { label: 'Hull Fill Ratio', value: '62.7% Full' },
        { label: 'Available Room', value: '280,000 bbl' },
        { label: 'Inert Gas Press.', value: '22.5 mbar' }
      ],
      aiInsight: 'Storage inventory safely accumulating at 84,200 bpd. Shuttle tanker docking window scheduled in 36 hours.',
      recommendedAction: 'Maintain nitrogen gas blanket pressure to prevent volatile vapor accumulation.',
      tooltipPosition: 'top-left'
    },

    // 14. Subsea Wellheads 1 to 5 (Christmas Trees on Left Header)
    {
      id: 'hotspot-wellheads',
      name: 'Subsea Production Wellhead Cluster (5 Wells)',
      tag: 'WH-Cluster',
      category: 'wellhead',
      left: 1.0,
      top: 2.0,
      width: 19.5,
      height: 94.0,
      status: 'optimal',
      statusLabel: '5 Wells Flowing into Header',
      rulPercent: 88,
      daysRemaining: 290,
      metrics: [
        { label: 'Active Wells', value: '5 / 5 Online' },
        { label: 'Total Crude Flow', value: '84,200 bpd' },
        { label: 'Header Pressure', value: '142 bar' },
        { label: 'Average Choke', value: '62% Open' }
      ],
      aiInsight: '5 deepwater Christmas trees pumping from 1,850m seabed depth. Multi-phase flow into main vertical gathering manifold is stable.',
      recommendedAction: 'Well B-02 currently routed to Test Separator V-105 for routine 24h fiscal flow proving.',
      tooltipPosition: 'right'
    }
  ];

  // Filter hotspots based on user category selection
  const filteredHotspots = HOTSPOTS.filter(h => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'alerts') return h.status === 'warning' || h.status === 'critical';
    return h.category === filterCategory;
  });

  const criticalCount = HOTSPOTS.filter(h => h.status === 'critical').length;
  const warningCount = HOTSPOTS.filter(h => h.status === 'warning').length;
  const optimalCount = HOTSPOTS.filter(h => h.status === 'optimal').length;

  const activeSpotlight =
    selectedHotspot ||
    HOTSPOTS.find(h => h.id === hoveredHotspotId) ||
    HOTSPOTS.find(h => h.status === 'critical') ||
    HOTSPOTS[0];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. SCADA HMI Banner & Controls Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Interactive Process Flow Diagram (PFD) — SCADA HMI
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  1 Hz SCADA Telemetry Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hover over any machine or vessel to inspect live telemetry, RUL health, and automated AI diagnostic findings.
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Machines ({HOTSPOTS.length})
            </button>

            <button
              onClick={() => setFilterCategory('alerts')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterCategory === 'alerts'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Attention Needed ({criticalCount + warningCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('compressor')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterCategory === 'compressor'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Compressors
            </button>

            <button
              onClick={() => setFilterCategory('pump')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterCategory === 'pump'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pumps &amp; Tanks
            </button>

            <button
              onClick={() => setFilterCategory('separator')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterCategory === 'separator'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Separators
            </button>
          </div>

          {/* Toggle Outline visibility */}
          <button
            onClick={() => setShowOutlines(!showOutlines)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showOutlines
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Toggle hotspot visibility boxes"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showOutlines ? 'Hotspots Visible' : 'Hotspots Hidden'}</span>
          </button>

          {onOpenJargonGuide && (
            <button
              onClick={onOpenJargonGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Terms Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main SCADA Interface: Flow Chart on the Left, Operational KPI Cards on the Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full items-start">
        {/* LEFT COLUMN: Process Flow Diagram (PFD) Interactive SCADA HMI Graphic */}
        <div className="xl:col-span-8 2xl:col-span-9 w-full">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-950 select-none group/canvas">
            {/* Base Layer: High-Resolution Process Flow Diagram */}
            <img
              src="/pfd-diagram.jpg"
              alt="Offshore Production Process Flow Diagram (PFD)"
              className="w-full h-auto block select-none pointer-events-none"
            />

        {/* Overlay Layer: Interactive SCADA Hotspots */}
        {filteredHotspots.map((hotspot) => {
          const isCritical = hotspot.status === 'critical';
          const isWarning = hotspot.status === 'warning';
          const isOptimal = hotspot.status === 'optimal';

          // Hotspot visual styling based on alert status (per requirements)
          let hotspotBorder = 'border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/20 hover:border-emerald-400 rounded-xl';
          let beaconColor = 'bg-emerald-500';

          if (isCritical) {
            hotspotBorder = 'animate-pulse bg-red-500/40 border-2 border-red-500 shadow-lg shadow-red-500/50 rounded-xl';
            beaconColor = 'bg-red-500';
          } else if (isWarning) {
            hotspotBorder = 'animate-pulse bg-amber-500/35 border-2 border-amber-500 shadow-lg shadow-amber-500/40 rounded-xl';
            beaconColor = 'bg-amber-500';
          }

          // If outlines are disabled, make borders subtle unless hovered or in alert
          if (!showOutlines && isOptimal) {
            hotspotBorder = 'border-0 bg-transparent hover:bg-emerald-500/20 hover:border hover:border-emerald-400 rounded-xl';
          }

          // Smart tooltip positioning classes to prevent boundary clipping
          let tooltipPosClasses = 'top-full mt-2 left-1/2 -translate-x-1/2';
          if (hotspot.tooltipPosition === 'top') {
            tooltipPosClasses = 'bottom-full mb-2 left-1/2 -translate-x-1/2';
          } else if (hotspot.tooltipPosition === 'bottom') {
            tooltipPosClasses = 'top-full mt-2 left-1/2 -translate-x-1/2';
          } else if (hotspot.tooltipPosition === 'bottom-right') {
            tooltipPosClasses = 'top-full mt-2 left-0';
          } else if (hotspot.tooltipPosition === 'bottom-left') {
            tooltipPosClasses = 'top-full mt-2 right-0';
          } else if (hotspot.tooltipPosition === 'top-left') {
            tooltipPosClasses = 'bottom-full mb-2 right-0';
          } else if (hotspot.tooltipPosition === 'top-right') {
            tooltipPosClasses = 'bottom-full mb-2 left-0';
          } else if (hotspot.tooltipPosition === 'right') {
            tooltipPosClasses = 'left-full ml-3 top-1/4';
          }

          return (
            <div
              key={hotspot.id}
              onClick={() => setSelectedHotspot(hotspot)}
              onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
              onMouseLeave={() => setHoveredHotspotId(null)}
              style={{
                left: `${hotspot.left}%`,
                top: `${hotspot.top}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`
              }}
              className={`absolute rounded-xl transition-all duration-200 cursor-pointer z-10 group/hotspot ${hotspotBorder}`}
            >
              {/* Alert Beacon Badge */}
              {(isCritical || isWarning) && (
                <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 z-20">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${beaconColor}`} />
                  <span className={`relative inline-flex rounded-full h-5 w-5 ${beaconColor} text-white text-[9px] font-black items-center justify-center shadow-md`}>
                    !
                  </span>
                </span>
              )}

              {/* RUL Floating Indicator Pill on Hotspot */}
              <div className="absolute bottom-1 right-1 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold text-slate-200 pointer-events-none opacity-80 group-hover/hotspot:opacity-100 flex items-center gap-1 shadow-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${beaconColor}`} />
                <span>{hotspot.rulPercent}%</span>
              </div>

              {/* FLOATING TELEMETRY TOOLTIP CARD */}
              <div
                className={`absolute ${tooltipPosClasses} z-50 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-4 shadow-2xl text-slate-100 pointer-events-none transition-all duration-200 transform scale-95 opacity-0 group-hover/hotspot:opacity-100 group-hover/hotspot:scale-100 group-hover/hotspot:pointer-events-auto`}
              >
                {/* Tooltip Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {hotspot.tag}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[170px]">
                        {hotspot.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Category: {hotspot.category.toUpperCase()}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {hotspot.statusLabel}
                  </span>
                </div>

                {/* Remaining Useful Life (RUL) Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-blue-400" />
                      Health &amp; Remaining Life (RUL):
                    </span>
                    <strong className={`font-mono text-xs ${
                      isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {hotspot.rulPercent}% ({hotspot.daysRemaining} Days Left)
                    </strong>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hotspot.rulPercent > 80
                          ? 'bg-emerald-500'
                          : hotspot.rulPercent > 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${hotspot.rulPercent}%` }}
                    />
                  </div>
                </div>

                {/* Live Telemetry Grid (2-4 readings) */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {hotspot.metrics.map((m, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border text-xs ${
                        m.isWarning
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-slate-800/80 border-slate-750 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block truncate">
                        {m.label}
                      </span>
                      <strong className={`font-mono text-xs block ${m.isWarning ? 'text-amber-300' : 'text-white'}`}>
                        {m.value}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Plain-English AI Insight Quote */}
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-snug mb-2.5">
                  <span className="text-blue-400 font-bold block text-[10px] mb-0.5">
                    💡 AI Diagnostic Summary:
                  </span>
                  {hotspot.aiInsight}
                </div>

                {/* Action Hint */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                  <span>Click machine for diagnostics</span>
                  <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                    Inspect <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        </div>

        {/* RIGHT COLUMN: SCADA Operational KPI Cards & Active Telemetry Spotlight */}
        <div className="xl:col-span-4 2xl:col-span-3 w-full flex flex-col gap-3.5">
          {/* Card 1: System Availability */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                System Availability
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Normal
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {optimalCount} <span className="text-xs font-normal text-slate-400 font-sans">/ {HOTSPOTS.length} Systems</span>
              </div>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {((optimalCount / HOTSPOTS.length) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(optimalCount / HOTSPOTS.length) * 100}%` }}
              />
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Target: <strong className="text-slate-700 dark:text-slate-200">&ge;85.0%</strong></span>
              <span className="text-slate-400 text-[10px]">Within Guardband</span>
            </div>
          </div>

          {/* Card 2: Advisory Watch */}
          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Advisory Watch
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                Needs Attention
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
                {warningCount} <span className="text-xs font-normal text-amber-800/70 dark:text-amber-400/80 font-sans">Units</span>
              </div>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 font-mono">
                K-101, V-105
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-400">
              <span>Service Window: <strong className="text-amber-900 dark:text-amber-200">14&ndash;18 Days</strong></span>
              <span className="text-[10px]">Seal / Delta Level</span>
            </div>
          </div>

          {/* Card 3: Critical Action Required */}
          <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                Critical Action
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Immediate PTW
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">
                {criticalCount} <span className="text-xs font-normal text-rose-800/70 dark:text-rose-400/80 font-sans">Pump</span>
              </div>
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 font-mono">
                P-101A Outboard
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between text-[11px] text-rose-800 dark:text-rose-400">
              <span>Temp: <strong className="text-rose-900 dark:text-rose-200">92.4&deg;C</strong> (Limit: 85&deg;C)</span>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">RUL: 48%</span>
            </div>
          </div>

          {/* Card 4: Fleet Health Index (RUL) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fleet Health Index
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                <Activity className="h-3 w-3 text-blue-500" />
                Telemetry AI
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                84.2% <span className="text-xs font-normal text-slate-400 font-sans">RUL Avg</span>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                +4.2% Above Target
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: '84.2%' }}
              />
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Baseline: <strong className="text-slate-700 dark:text-slate-200">&gt;80.0%</strong></span>
              <span className="text-slate-400 text-[10px]">{HOTSPOTS.length} Assets Tracked</span>
            </div>
          </div>

          {/* Card 5: Active Asset Spotlight & Live Telemetry Inspector */}
          {activeSpotlight && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white ${
                    activeSpotlight.status === 'critical' 
                      ? 'bg-rose-600 shadow-sm shadow-rose-500/20' 
                      : activeSpotlight.status === 'warning' 
                      ? 'bg-amber-600 shadow-sm shadow-amber-500/20' 
                      : 'bg-emerald-600 shadow-sm shadow-emerald-500/20'
                  }`}>
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[170px]">
                      {activeSpotlight.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeSpotlight.tag} • {activeSpotlight.category.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  activeSpotlight.status === 'critical' 
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                    : activeSpotlight.status === 'warning'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}>
                  {activeSpotlight.rulPercent}% RUL
                </span>
              </div>

              {/* Sensor Readings */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeSpotlight.metrics.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750/70 border border-slate-100 dark:border-slate-700/70">
                    <span className="text-[10px] text-slate-400 block truncate">{m.label}</span>
                    <strong className={`text-xs font-mono block mt-0.5 ${m.isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {m.value}
                    </strong>
                  </div>
                ))}
              </div>

              {/* AI Diagnostic Snippet */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-slate-750 border border-blue-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                <span className="font-bold text-blue-700 dark:text-blue-400 block text-[10px] mb-0.5">
                  💡 AI Diagnostic Summary:
                </span>
                <p className="line-clamp-2">{activeSpotlight.aiInsight}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedHotspot(activeSpotlight)}
                  className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer text-center"
                >
                  Full Diagnostics
                </button>
                {onLogCaseForAsset && (
                  <button
                    onClick={() => {
                      if (activeSpotlight.sourceData) {
                        onLogCaseForAsset(activeSpotlight.sourceData);
                      }
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-xs transition cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Wrench className="h-3 w-3" />
                    <span>Create PTW</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Equipment Detail Spotlight Modal (When Hotspot Clicked) */}
      {selectedHotspot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedHotspot(null)}
        >
          <div 
            className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/90">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
                  selectedHotspot.status === 'critical' 
                    ? 'bg-rose-600' 
                    : selectedHotspot.status === 'warning' 
                    ? 'bg-amber-600' 
                    : 'bg-emerald-600'
                }`}>
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {selectedHotspot.tag}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedHotspot.name}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Category: {selectedHotspot.category.toUpperCase()} • SCADA Node
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedHotspot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* RUL Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Remaining Useful Life (RUL Health):
                  </span>
                  <strong className={`font-mono text-sm ${
                    selectedHotspot.status === 'critical'
                      ? 'text-rose-600 dark:text-rose-400'
                      : selectedHotspot.status === 'warning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {selectedHotspot.rulPercent}% ({selectedHotspot.daysRemaining} Days of Safe Runtime)
                  </strong>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedHotspot.rulPercent > 80
                        ? 'bg-emerald-500'
                        : selectedHotspot.rulPercent > 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${selectedHotspot.rulPercent}%` }}
                  />
                </div>
              </div>

              {/* Live Telemetry Sensors Grid */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Live Telemetry Readings:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedHotspot.metrics.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs ${
                        m.isWarning
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-750/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                        {m.label}
                      </span>
                      <strong className={`font-mono text-sm block mt-0.5 ${
                        m.isWarning ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {m.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plain-English AI Diagnostic Insight */}
              <div className="bg-blue-50/70 dark:bg-slate-750 p-3.5 rounded-xl border border-blue-100 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-blue-700 dark:text-blue-400 block">
                  💡 What is happening (Plain English):
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedHotspot.aiInsight}
                </p>
              </div>

              {/* AI Recommended Maintenance Action */}
              <div className="bg-amber-50/70 dark:bg-slate-750 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-400 block">
                  🛠️ Recommended Maintenance Action:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedHotspot.recommendedAction}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setSelectedHotspot(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>

              {onLogCaseForAsset && (
                <button
                  onClick={() => {
                    if (selectedHotspot.sourceData) {
                      onLogCaseForAsset(selectedHotspot.sourceData);
                    }
                    setSelectedHotspot(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition cursor-pointer"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Create Work Order / PTW</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
