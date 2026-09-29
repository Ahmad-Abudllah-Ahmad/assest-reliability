import React from 'react';
import { 
  Leaf, 
  Flame, 
  Wind, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Download,
  Gauge,
  Sparkles
} from 'lucide-react';
import { GhgEmissionsChart } from './GhgEmissionsChart';
import { OilGasPageHeader } from './OilGasPageHeader';
import { GhgEmissionRecord, OffshoreFlareSystem } from '../../types/oilGasTypes';

interface OilGasEnvironmentalViewProps {
  ghgData: GhgEmissionRecord[];
  flareSystem: OffshoreFlareSystem;
}

export const OilGasEnvironmentalView: React.FC<OilGasEnvironmentalViewProps> = ({
  ghgData,
  flareSystem
}) => {
  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn">
      {/* Page Title: GHG Emissions & Environmental Compliance */}
      <div className="shrink-0">
        <OilGasPageHeader
          title="GHG Emissions & Flare Systems"
          subtitle="Environmental compliance, continuous flare combustion monitoring, and carbon intensity tracking"
          icon={Leaf}
          badgeText="Clean Ops • 98.4% Eff"
          badgeColor="emerald"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
        {/* 1. GHG Emissions Breakdown Chart */}
        <GhgEmissionsChart data={ghgData} />

        {/* 2. Flare Stack & Combustion Efficiency Operational View */}
        <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
                <Flame className="h-4 w-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Offshore Flare Stack & Gas Conservation Surveillance
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time monitoring of HP & LP flare tips, sonic purge velocities, and pilot thermocouple verification.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zero Routine Flaring Compliant
          </span>
        </div>

        {/* 4 Flare Telemetry Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">HP Production Flare</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
              {flareSystem.hpFlareRateMmscfd} <span className="text-xs font-normal text-slate-500">MMscf/d</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Purge Gas Velocity: {flareSystem.purgeGasVelocityMs} m/s
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Combustion Efficiency</span>
            <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 mt-1">
              {flareSystem.combustionEfficiencyPct}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Target: &gt; 98.0% (Optical Sensor)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pilot Burner Array</span>
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {flareSystem.pilotFlameStatus}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Tip Temp: 685°C Normal
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Flare CO₂e</span>
            <span className="font-mono font-bold text-base text-amber-600 dark:text-amber-400 mt-1">
              {flareSystem.dailyCo2eTonnes} <span className="text-xs font-normal text-slate-500">t CO₂e</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Ceiling: {flareSystem.regulatoryCeilingTonnes} t (Under Ceiling)
            </span>
          </div>
        </div>

        {/* CEMS Continuous Emissions Log Callout */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>AI CEMS Continuous Surveillance:</strong> Vapor Recovery Unit (VRU) suction is active. Fugitive seal gas is being routed back to 1st stage compression, saving an estimated <strong>14.2 tonnes CO₂e/day</strong>.
            </span>
          </div>

          <button
            onClick={() => alert('Official Offshore Environmental Audit Report generated.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 transition cursor-pointer shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            <span>Export ESG Audit File</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
