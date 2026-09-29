import React, { useState } from 'react';
import { 
  ArrowRight, 
  Wrench, 
  AlertTriangle 
} from 'lucide-react';
import { ProductionPulseChart } from './ProductionPulseChart';
import { OilGasExecutiveKpis } from './OilGasExecutiveKpis';
import { 
  ProductionPulsePoint, 
  OffshoreWellhead, 
  OffshoreSeparator, 
  RotatingEquipmentRul,
  OffshoreStorageTank 
} from '../../types/oilGasTypes';

interface OilGasOverviewViewProps {
  pulseData: ProductionPulsePoint[];
  wellheads: OffshoreWellhead[];
  separators: OffshoreSeparator[];
  rotatingEquipment: RotatingEquipmentRul[];
  storageTanks: OffshoreStorageTank[];
  onNavigateToTab: (tab: any) => void;
  onSelectCase: (caseId: string) => void;
  onLogEmergencyCase: () => void;
  onOpenJargonGuide?: () => void;
}

export const OilGasOverviewView: React.FC<OilGasOverviewViewProps> = ({
  pulseData,
  wellheads,
  separators,
  rotatingEquipment,
  storageTanks,
  onNavigateToTab,
  onSelectCase,
  onLogEmergencyCase: _onLogEmergencyCase,
  onOpenJargonGuide
}) => {
  const [opSection, setOpSection] = useState<'wells' | 'separators'>('wells');

  const totalWellCrude = wellheads.reduce((acc, w) => acc + w.dailyCrudeBpd, 0);
  const totalStorageStock = storageTanks.reduce((acc, t) => acc + t.currentStockBbl, 0);
  const avgRul = Math.round(
    rotatingEquipment.reduce((acc, r) => acc + r.rulPercent, 0) / (rotatingEquipment.length || 1)
  );

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3.5 animate-fadeIn">
      {/* 1. North Star Executive KPI Row */}
      <OilGasExecutiveKpis
        totalCrudeBpd={totalWellCrude}
        exportGasMmscfd={148.0}
        averageRulPct={avgRul}
        storageLevelBbl={totalStorageStock}
        storageCapacityBbl={750000}
        dailyCo2eTonnes={1248}
        onOpenJargonGuide={onOpenJargonGuide}
      />

      {/* 2. Middle Section: Production Pulse Chart (8 cols) & Operational Station (4 cols) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 2xl:gap-3.5">
        {/* Left Column (8 cols): Production Pulse Chart */}
        <div className="lg:col-span-8 h-full min-h-0 flex flex-col">
          <ProductionPulseChart data={pulseData} className="h-full flex-1 min-h-0" />
        </div>

        {/* Right Column (4 cols): Live Alert + Operational Telemetry */}
        <div className="lg:col-span-4 h-full min-h-0 flex flex-col gap-2.5 2xl:gap-3.5">
          {/* Card 1: AI Plain-English Advisory Callout */}
          <div className="shrink-0 p-3 2xl:p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex flex-col justify-between gap-2 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                  AI Plain-English Alert (Work Order OG-001)
                </strong>
                <span className="text-slate-600 dark:text-slate-300">
                  Gas Compressor K-101 seal leak (1.28 scfm). Safe today; replacement needed within 18 days.
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectCase('OG-001')}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-xs transition cursor-pointer"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Review Work Order (OG-001)</span>
            </button>
          </div>

          {/* Card 2: Operational Sections (Wellheads & Separators) */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-0.5 rounded-lg">
                <button
                  onClick={() => setOpSection('wells')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    opSection === 'wells'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Subsea Wells ({wellheads.length})
                </button>
                <button
                  onClick={() => setOpSection('separators')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    opSection === 'separators'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Separators ({separators.length})
                </button>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                {opSection === 'wells' ? '4/4 Flowing' : '3 Safe'}
              </span>
            </div>

            {/* List Body */}
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 py-1.5 overflow-hidden">
              {opSection === 'wells' ? (
                wellheads.map((well) => (
                  <div
                    key={well.id}
                    className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">{well.wellName}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
                          {well.slotNumber}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Choke: {well.chokeValvePct}% • BSW: {well.bswCutPct}%
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {well.dailyCrudeBpd.toLocaleString()} bpd
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                separators.map((sep) => (
                  <div
                    key={sep.id}
                    className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">{sep.tag}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">{sep.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Pressure: {sep.operatingPressureBar} bar (Limit: {sep.pressureLimitBar})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        {sep.efficiencyPct}% Clean
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        Level: {sep.liquidLevelPct}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigateToTab('production')}
              className="w-full text-center text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1 shrink-0 flex items-center justify-center gap-1"
            >
              Open Production Network Details <ArrowRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Facility Flow (5-Stage Simple Diagram) */}
      <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2.5 2xl:p-3 shadow-xs shrink-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1 shrink-0">
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
            Facility Flow Step-by-Step (From Seabed Wells to Export)
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">
            4 Production Trains Active • All Operating Normally
          </span>
        </div>

        {/* 5-Stage Simple Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {/* Stage 1: Underwater Wells */}
          <div 
            onClick={() => onNavigateToTab('production')}
            className="p-2 2xl:p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase text-slate-400">Step 1: Seabed Wells</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="my-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                  4 Subsea Wells
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {totalWellCrude.toLocaleString()} bpd
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 truncate">Pumping crude oil from seabed</p>
            </div>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 group-hover:text-blue-500 font-medium">
              View Wells <ArrowRight className="h-2 w-2" />
            </span>
          </div>

          {/* Stage 2: Oil & Water Separator */}
          <div 
            onClick={() => onNavigateToTab('production')}
            className="p-2 2xl:p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase text-slate-400">Step 2: Clean & Separate</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="my-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                  Separators
                </span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                  82.4 bar • 98.6%
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 truncate">Removes water and sand</p>
            </div>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 group-hover:text-blue-500 font-medium">
              View Vessels <ArrowRight className="h-2 w-2" />
            </span>
          </div>

          {/* Stage 3: Gas Compression */}
          <div 
            onClick={() => onNavigateToTab('assets')}
            className="p-2 2xl:p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase text-slate-400">Step 3: Gas Pressurizer</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>
            <div className="my-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                  Gas Compressors
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                  185 bar • K-101
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 truncate">Pressurizes gas for export</p>
            </div>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 group-hover:text-blue-500 font-medium">
              Check Machines <ArrowRight className="h-2 w-2" />
            </span>
          </div>

          {/* Stage 4: Ship Storage Tanks */}
          <div 
            onClick={() => onNavigateToTab('storage')}
            className="p-2 2xl:p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase text-slate-400">Step 4: Ship Storage</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="my-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                  Hull Cargo Tanks
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  470,000 bbl
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 truncate">62.7% full • Safe headroom</p>
            </div>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 group-hover:text-blue-500 font-medium">
              View Tanks <ArrowRight className="h-2 w-2" />
            </span>
          </div>

          {/* Stage 5: Undersea Pipeline Export */}
          <div 
            onClick={() => onNavigateToTab('storage')}
            className="p-2 2xl:p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase text-slate-400">Step 5: Pipeline Export</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="my-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate">
                  16&quot; Undersea Pipe
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                  84,200 bpd
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 truncate">Pumping oil ashore</p>
            </div>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 group-hover:text-blue-500 font-medium">
              Inspect Pipeline <ArrowRight className="h-2 w-2" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
