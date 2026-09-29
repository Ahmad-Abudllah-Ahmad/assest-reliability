import React, { useState, useEffect } from 'react';
import { X, Plus, Cpu, Activity, Zap, CheckCircle2, ShieldCheck, Radio, Sparkles } from 'lucide-react';
import { MonitoredAsset } from '../types';

export interface NewMachineryData {
  name: string;
  code: string;
  category: string;
  ratedCapacity: string;
  healthScore: number;
  metricLabel: string;
  metricValue: string;
  aiSummary: string;
}

export interface MachineryPreset {
  id: string;
  label: string;
  name: string;
  code: string;
  category: string;
  ratedCapacity: string;
  healthScore: number;
  metricLabel: string;
  metricValue: string;
  aiSummary: string;
  isAiDetected: boolean;
  aiDetectionSource?: string;
}

export const DOMAIN_MACHINERY_PRESETS: Record<'power' | 'wind' | 'solar' | 'oilgas', MachineryPreset[]> = {
  power: [
    {
      id: 'gt3-ai',
      label: 'Gas Turbine GT-3 (9F.05) (AI Detection)',
      name: 'Gas Turbine GT-3 (9F.05)',
      code: 'GT-3',
      category: 'Heavy-Duty Combustion Turbine',
      ratedCapacity: '160 MW / 50 Hz',
      healthScore: 98,
      metricLabel: 'Exhaust Temp Spread',
      metricValue: '11.8 °C',
      aiSummary: 'AI auto-detected via Mark VIe SCADA bridge. Telemetry stream locked at 100 Hz. Thermodynamic combustion flame envelope operating within nominal baseline.',
      isAiDetected: true,
      aiDetectionSource: 'Mark VIe DCS Plug & Play Bus #04'
    },
    {
      id: 'bfp3-ai',
      label: 'HRSG High Pressure Feed Pump BFP-3 (AI Detection)',
      name: 'High Pressure Boiler Feed Pump BFP-3',
      code: 'BFP-3',
      category: 'Steam Cycle Rotating Machinery',
      ratedCapacity: '3,200 gpm @ 2,100 psig',
      healthScore: 96,
      metricLabel: 'Shaft Radial Vibration',
      metricValue: '1.4 mm/s',
      aiSummary: 'Plug-and-play telemetry bus detected. Mechanical seal differential pressure nominal; baseline fluid harmonics verified.',
      isAiDetected: true,
      aiDetectionSource: 'Profibus DP Telemetry Node #12'
    },
    {
      id: 'st2',
      label: 'Steam Turbine ST-2 (Intermediate/Low Pressure)',
      name: 'Steam Turbine ST-2 (ILP)',
      code: 'ST-2',
      category: 'Steam Turbine Island',
      ratedCapacity: '110 MW Subcritical',
      healthScore: 99,
      metricLabel: 'Thrust Bearing Temp',
      metricValue: '72.4 °C',
      aiSummary: 'Synchronized with main plant DCS. Rotor eccentricity and axial displacement stable within OEM specification.',
      isAiDetected: false
    },
    {
      id: 'gsu3',
      label: 'Main Step-Up Transformer GSU-3 (230kV)',
      name: 'GSU Transformer T-03 (230kV)',
      code: 'T-03',
      category: 'High Voltage Switchyard',
      ratedCapacity: '220 MVA / 230 kV',
      healthScore: 97,
      metricLabel: 'Top Oil Temperature',
      metricValue: '54.0 °C',
      aiSummary: 'Continuous dissolved gas analysis (DGA) stream active. Combustible gas generation rate within normal criteria.',
      isAiDetected: false
    },
    {
      id: 'cwp2',
      label: 'Condenser Circulating Water Pump CWP-2',
      name: 'Circulating Water Pump CWP-2',
      code: 'CWP-2',
      category: 'Condenser Cooling Circuit',
      ratedCapacity: '45,000 gpm @ 45 psig',
      healthScore: 94,
      metricLabel: 'Vibration Velocity',
      metricValue: '2.1 mm/s',
      aiSummary: 'Intake flow hydraulics balanced. Vane pass frequency harmonic amplitude within baseline limits.',
      isAiDetected: false
    }
  ],
  wind: [
    {
      id: 'wtg26-ai',
      label: 'Wind Turbine WTG-26 (Vestas V162 5.6MW) (AI Detection)',
      name: 'Wind Turbine WTG-26',
      code: 'WTG-26',
      category: 'High-Speed Planetary Drivetrain',
      ratedCapacity: '5.6 MW / 162m Rotor',
      healthScore: 99,
      metricLabel: 'High-Speed Bearing Vib',
      metricValue: '1.1 mm/s',
      aiSummary: 'AI auto-detected via fiber optic ring CMS link. Optical blade strain gauges calibrating zero-offset. Drivetrain dynamics nominal.',
      isAiDetected: true,
      aiDetectionSource: 'Ethernet Ring CMS Plug & Play Bus #02'
    },
    {
      id: 'tx03-ai',
      label: 'Substation Inter-Array Transformer TX-03 (AI Detection)',
      name: 'Array Collector Transformer TX-03',
      code: 'TX-03',
      category: 'Collector Substation Infrastructure',
      ratedCapacity: '65 MVA / 34.5 kV to 230 kV',
      healthScore: 98,
      metricLabel: 'Winding Hotspot Temp',
      metricValue: '56.2 °C',
      aiSummary: 'Plug-and-play substation telemetry ingested. Tap changer position feedback synchronized with grid dispatch curtailment algorithms.',
      isAiDetected: true,
      aiDetectionSource: 'IEC 61850 Substation Bus Link'
    },
    {
      id: 'wtg27',
      label: 'Wind Turbine WTG-27 (Direct Drive 5.0MW)',
      name: 'Wind Turbine WTG-27',
      code: 'WTG-27',
      category: 'Direct Drive Synchronous Generator',
      ratedCapacity: '5.0 MW / 145m Rotor',
      healthScore: 97,
      metricLabel: 'Nacelle Acceleration',
      metricValue: '0.85 mm/s',
      aiSummary: 'Commissioned to fleet monitoring. Permanent magnet rotor thermal gradient within 2.3°C of baseline.',
      isAiDetected: false
    },
    {
      id: 'met02',
      label: 'Ridge Met Mast 02 (Ultrasonic LiDAR Tower)',
      name: 'Ridge Met Mast 02 (LiDAR)',
      code: 'MET-02',
      category: 'Meteorological Sensing Station',
      ratedCapacity: '120m Hub-Height Profiler',
      healthScore: 100,
      metricLabel: 'Wind Inflow Shear Alpha',
      metricValue: '0.14 α',
      aiSummary: 'Dual Doppler ultrasonic sensors broadcasting 1-second turbulence intensity vectors to turbine wake controllers.',
      isAiDetected: false
    },
    {
      id: 'hpu04',
      label: 'Emergency Pitch Hydraulic Skid HPU-04',
      name: 'Pitch Hydraulic Power Skid HPU-04',
      code: 'HPU-04',
      category: 'Electro-Hydraulic Aerodynamic Safety',
      ratedCapacity: '210 bar / 3x Accumulators',
      healthScore: 95,
      metricLabel: 'System Accumulator Pressure',
      metricValue: '208 bar',
      aiSummary: 'Nitrogen pre-charge verified. Emergency feathering slew rate response test completed at 7.8 deg/s.',
      isAiDetected: false
    }
  ],
  solar: [
    {
      id: 'inv13-ai',
      label: 'Central Inverter INV-13 (SMA Sunny Central 4.4MW) (AI Detection)',
      name: 'Solar Inverter INV-13',
      code: 'INV-13',
      category: 'Utility-Scale Central Inverter',
      ratedCapacity: '4.4 MW / 1500V DC',
      healthScore: 99,
      metricLabel: 'Inverter MPPT Efficiency',
      metricValue: '98.9%',
      aiSummary: 'AI auto-detected via SunSpec Modbus TCP protocol. DC string balance verified across all 24 inputs with zero harmonic clipping.',
      isAiDetected: true,
      aiDetectionSource: 'SunSpec Modbus TCP Link #07'
    },
    {
      id: 'bess04-ai',
      label: 'BESS Container Rack 4 (LFP Battery Bank) (AI Detection)',
      name: 'Battery Energy Storage Rack BESS-04',
      code: 'BESS-04',
      category: 'Containerized Lithium Iron Phosphate',
      ratedCapacity: '5.0 MWh / 2.5 MW 2-Hour',
      healthScore: 98,
      metricLabel: 'Cell Voltage Variance',
      metricValue: '12 mV',
      aiSummary: 'AI CAN-bus gateway discovered new battery rack. Cell balancing operating at peak efficiency; thermal run-away monitoring verified.',
      isAiDetected: true,
      aiDetectionSource: 'CAN-bus BMS Gateway Link #03'
    },
    {
      id: 'trke',
      label: 'Single-Axis Smart Tracker Zone E (East Arrays)',
      name: 'Single-Axis Tracker Zone E',
      code: 'TRK-ZONE-E',
      category: 'Bifacial Tracking Subsystem',
      ratedCapacity: '1,280 Strings / 384 kWp',
      healthScore: 97,
      metricLabel: 'Backtracking Angular Error',
      metricValue: '0.2°',
      aiSummary: 'Astronomical solar algorithm tracking sun path. Drive motor torque curves within 4% of factory baseline.',
      isAiDetected: false
    },
    {
      id: 'tx04',
      label: 'Padmount Step-Up Transformer TX-04',
      name: 'Padmount Step-Up Transformer TX-04',
      code: 'TX-04',
      category: 'Medium Voltage Step-Up Unit',
      ratedCapacity: '5.0 MVA / 34.5 kV',
      healthScore: 96,
      metricLabel: 'Insulating Fluid Dielectric',
      metricValue: '68 kV',
      aiSummary: 'Continuous thermal optical fiber telemetry active. Core losses tracking manufacturer guarantee curves.',
      isAiDetected: false
    },
    {
      id: 'cb16',
      label: 'Smart Combiner Box Array CB-16',
      name: 'Smart Combiner Box Array CB-16',
      code: 'CB-16',
      category: 'PV String Aggregation & Protection',
      ratedCapacity: '32 Inputs / 1500V DC',
      healthScore: 95,
      metricLabel: 'String Current Imbalance',
      metricValue: '1.2%',
      aiSummary: 'Shunt resistor measurement telemetry stable. SPD surge protection cartridges verified intact.',
      isAiDetected: false
    }
  ],
  oilgas: [
    {
      id: 'k304-ai',
      label: 'Flash Gas Booster Compressor K-304 (AI Detection)',
      name: 'Flash Gas Compressor K-304',
      code: 'K-304',
      category: 'Centrifugal Offshore Compression',
      ratedCapacity: '8,500 HP / 650 psig',
      healthScore: 98,
      metricLabel: 'Dry Gas Seal Differential',
      metricValue: '14.2 bar',
      aiSummary: 'AI auto-detected via topside telemetry bus. Primary dry gas seal leakage stable at 1.4 Nm³/h; bearing orbit and vibration nominal.',
      isAiDetected: true,
      aiDetectionSource: 'Foundation Fieldbus Telemetry Link #08'
    },
    {
      id: 'w07-ai',
      label: 'Subsea Production Wellhead Tree W-07 (AI Detection)',
      name: 'Subsea Production Wellhead W-07',
      code: 'W-07',
      category: 'Deepwater Subsea Tree & Choke',
      ratedCapacity: '12,500 bpd Flow Envelope',
      healthScore: 97,
      metricLabel: 'Choke Differential Pressure',
      metricValue: '68 bar',
      aiSummary: 'Acoustic sand detection & P/T subsea sensor auto-synced via master control umbilical. Annulus B pressure sealed.',
      isAiDetected: true,
      aiDetectionSource: 'Subsea Umbilical Master Protocol #01'
    },
    {
      id: 'p102b',
      label: 'Main Oil Line (MOL) Export Pump P-102B',
      name: 'MOL Export Pump P-102B (Electric)',
      code: 'P-102B',
      category: 'High-Pressure Multistage Export',
      ratedCapacity: '3,500 HP / 1,450 psig',
      healthScore: 96,
      metricLabel: 'NDE Radial Vibration',
      metricValue: '1.3 mm/s',
      aiSummary: 'Dual mechanical cartridge seal pressurized. Lube oil cleanliness at ISO 4406 14/12/09.',
      isAiDetected: false
    },
    {
      id: 'v302',
      label: 'HP 3-Phase Test Separator V-302',
      name: 'HP 3-Phase Separator V-302',
      code: 'V-302',
      category: 'Primary Phase Separation Vessel',
      ratedCapacity: '25,000 bpd / 85 bar',
      healthScore: 99,
      metricLabel: 'Interface Level Stability',
      metricValue: '±1.5%',
      aiSummary: 'Nuclear density profiler and coriolis oil meter synchronized to process supervisory system.',
      isAiDetected: false
    },
    {
      id: 't402',
      label: 'TEG Gas Dehydration Contactor T-402',
      name: 'TEG Dehydration Contactor T-402',
      code: 'T-402',
      category: 'Gas Treatment & Water Dewpoint',
      ratedCapacity: '120 MMscf/d @ 75 bar',
      healthScore: 95,
      metricLabel: 'Water Dewpoint Margin',
      metricValue: '-18.0 °C',
      aiSummary: 'Lean glycol circulation flow rate matched to gas inlet moisture load. Reboiler heating tube skin temperature nominal.',
      isAiDetected: false
    }
  ]
};

interface AddMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newMachinery: NewMachineryData) => void;
  facilityType?: 'power' | 'wind' | 'solar' | 'oilgas';
}

export const AddMachineryModal: React.FC<AddMachineryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  facilityType = 'power'
}) => {
  const currentPresets = DOMAIN_MACHINERY_PRESETS[facilityType] || DOMAIN_MACHINERY_PRESETS.power;
  const initialPreset = currentPresets[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [form, setForm] = useState<NewMachineryData>({
    name: initialPreset.name,
    code: initialPreset.code,
    category: initialPreset.category,
    ratedCapacity: initialPreset.ratedCapacity,
    healthScore: initialPreset.healthScore,
    metricLabel: initialPreset.metricLabel,
    metricValue: initialPreset.metricValue,
    aiSummary: initialPreset.aiSummary
  });

  useEffect(() => {
    if (isOpen) {
      const presets = DOMAIN_MACHINERY_PRESETS[facilityType] || DOMAIN_MACHINERY_PRESETS.power;
      const first = presets[0];
      setSelectedPresetId(first.id);
      setForm({
        name: first.name,
        code: first.code,
        category: first.category,
        ratedCapacity: first.ratedCapacity,
        healthScore: first.healthScore,
        metricLabel: first.metricLabel,
        metricValue: first.metricValue,
        aiSummary: first.aiSummary
      });
    }
  }, [isOpen, facilityType]);

  const activePreset = currentPresets.find(p => p.id === selectedPresetId);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      return;
    }
    const target = currentPresets.find(p => p.id === presetId);
    if (target) {
      setForm({
        name: target.name,
        code: target.code,
        category: target.category,
        ratedCapacity: target.ratedCapacity,
        healthScore: target.healthScore,
        metricLabel: target.metricLabel,
        metricValue: target.metricValue,
        aiSummary: target.aiSummary
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    onAdd(form);
    onClose();
  };

  const getDomainAccent = () => {
    switch (facilityType) {
      case 'wind':
        return { 
          bg: 'bg-cyan-600', 
          ring: 'focus:ring-cyan-500', 
          btn: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20',
          badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20'
        };
      case 'solar':
        return { 
          bg: 'bg-amber-600', 
          ring: 'focus:ring-amber-500', 
          btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',
          badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
        };
      case 'oilgas':
        return { 
          bg: 'bg-emerald-600', 
          ring: 'focus:ring-emerald-500', 
          btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20',
          badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
        };
      default:
        return { 
          bg: 'bg-blue-600', 
          ring: 'focus:ring-blue-500', 
          btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
          badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
        };
    }
  };

  const accent = getDomainAccent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg ${accent.bg} flex items-center justify-center text-white shadow-xs`}>
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Add Machinery or Component
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Register new industrial equipment into real-time condition monitoring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          {/* Machine Profile / Telemetry Dropdown Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                Machinery Telemetry Profile *
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Domain-Specific Catalog</span>
            </div>

            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <optgroup label="✨ Plug & Play Telemetry (AI Detected)">
                {currentPresets.filter(p => p.isAiDetected).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>

              <optgroup label="⚙️ Standard Industrial Machinery Profiles">
                {currentPresets.filter(p => !p.isAiDetected).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>

              <optgroup label="✏️ Custom Machinery">
                <option value="custom">Custom / Manual Machinery Registration</option>
              </optgroup>
            </select>
          </div>

          {/* AI Detection Plug & Play Banner */}
          {activePreset?.isAiDetected && (
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 animate-fadeIn">
              <div className="h-6 w-6 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <span>Plug & Play Machine Telemetry</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      (AI Detection)
                    </span>
                  </span>
                </div>
                <p className="text-[10px] text-blue-700/80 dark:text-blue-300/80 mt-0.5 leading-relaxed">
                  AI engine caught live telemetry from <strong className="font-semibold text-blue-900 dark:text-blue-100">{activePreset.aiDetectionSource}</strong>. Operating envelope and health baseline auto-calibrated.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Machinery Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Gas Turbine GT-3"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Equipment Code / Tag *
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. GT-3"
                className="w-full font-mono bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Category / Subsystem
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Combustion Turbine"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Rated Capacity / Spec
              </label>
              <input
                type="text"
                value={form.ratedCapacity}
                onChange={(e) => setForm(prev => ({ ...prev, ratedCapacity: e.target.value }))}
                placeholder="e.g. 160 MW Rated"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Baseline Health Score ({form.healthScore}%)
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={form.healthScore}
                onChange={(e) => setForm(prev => ({ ...prev, healthScore: parseInt(e.target.value, 10) }))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer mt-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Primary Telemetry Point
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.metricLabel}
                  onChange={(e) => setForm(prev => ({ ...prev, metricLabel: e.target.value }))}
                  placeholder="Metric (e.g. Vibration)"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <input
                  type="text"
                  value={form.metricValue}
                  onChange={(e) => setForm(prev => ({ ...prev, metricValue: e.target.value }))}
                  placeholder="Value (e.g. 1.2 mm/s)"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Initial AI Reliability Diagnostic Summary
            </label>
            <textarea
              rows={2}
              value={form.aiSummary}
              onChange={(e) => setForm(prev => ({ ...prev, aiSummary: e.target.value }))}
              placeholder="Operational assessment summary..."
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-white ${accent.btn} transition cursor-pointer shadow-xs active:scale-95`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Machinery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

