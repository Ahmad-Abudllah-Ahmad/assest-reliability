import React from 'react';
import { 
  Droplets, 
  Wind, 
  Cpu, 
  Database, 
  Leaf, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight,
  Info
} from 'lucide-react';

interface OilGasExecutiveKpisProps {
  totalCrudeBpd: number;
  exportGasMmscfd: number;
  averageRulPct: number;
  storageLevelBbl: number;
  storageCapacityBbl: number;
  dailyCo2eTonnes: number;
  onOpenJargonGuide?: () => void;
}

export const OilGasExecutiveKpis: React.FC<OilGasExecutiveKpisProps> = ({
  totalCrudeBpd,
  exportGasMmscfd,
  averageRulPct,
  storageLevelBbl,
  storageCapacityBbl,
  dailyCo2eTonnes,
  onOpenJargonGuide
}) => {
  const targetCrude = 80000;
  const targetGas = 140.0;
  const fillPct = ((storageLevelBbl / storageCapacityBbl) * 100).toFixed(1);
  const crudeDelta = (((totalCrudeBpd - targetCrude) / targetCrude) * 100).toFixed(1);
  const gasDelta = (((exportGasMmscfd - targetGas) / targetGas) * 100).toFixed(1);

  return (
    <section 
      aria-label="Executive Offshore KPIs" 
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 2xl:gap-3 shrink-0"
    >
      {/* 1. Daily Crude Oil Output */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition">
        <div>
          <div className="flex items-center justify-between text-[10px] 2xl:text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] 2xl:text-[11px] truncate">
              Daily Oil Output
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-full text-[10px] border border-emerald-500/20 truncate">
              ▲ +{crudeDelta}% Target
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1 2xl:mt-1.5">
            <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {totalCrudeBpd.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">bbl/d</span>
          </div>

          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            Pumping crude from deep seabed wells
          </p>
        </div>

        {/* AI Insight Footer */}
        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Goal: 80k bpd</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-2.5 w-2.5" /> 4 Wells Active
          </span>
        </div>
      </div>

      {/* 2. Export Gas Pipeline Flow */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700 transition">
        <div>
          <div className="flex items-center justify-between text-[10px] 2xl:text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] 2xl:text-[11px] truncate">
              Export Gas Flow
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full text-[10px] border border-amber-500/20 truncate">
              ▲ +{gasDelta}% Clean
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1 2xl:mt-1.5">
            <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {exportGasMmscfd.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">MMscf/d</span>
          </div>

          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            Natural gas piped ashore for commercial sale
          </p>
        </div>

        {/* AI Insight Footer */}
        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Pipeline: 185 bar</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">16&quot; Active</span>
        </div>
      </div>

      {/* 3. Machinery Reliability & Health (RUL) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition">
        <div>
          <div className="flex items-center justify-between text-[10px] 2xl:text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] 2xl:text-[11px] truncate">
              Machine Health (RUL)
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full text-[10px] border border-amber-500/20 truncate">
              1 Needs Watch
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1 2xl:mt-1.5">
            <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {averageRulPct}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Safe Health</span>
          </div>

          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            Remaining useful life before compressor parts replacement
          </p>
        </div>

        {/* AI Insight Footer */}
        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">K-101 Watch (74%)</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">Plan Seal Visit</span>
        </div>
      </div>

      {/* 4. Hull Storage Capacity */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition">
        <div>
          <div className="flex items-center justify-between text-[10px] 2xl:text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] 2xl:text-[11px] truncate">
              Storage Tanks Fill
            </span>
            <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded-full text-[10px] border border-purple-500/20 truncate">
              {fillPct}% Full
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1 2xl:mt-1.5">
            <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {storageLevelBbl.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">bbl</span>
          </div>

          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            Crude in ship tanks • 280k bbl headroom
          </p>
        </div>

        {/* AI Insight Footer */}
        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Max: 750k bbl</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Safe Headroom</span>
        </div>
      </div>

      {/* 5. Clean Emissions & Flare */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between hover:border-cyan-300 dark:hover:border-cyan-700 transition">
        <div>
          <div className="flex items-center justify-between text-[10px] 2xl:text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] 2xl:text-[11px] truncate">
              Daily Emissions
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-full text-[10px] border border-emerald-500/20 truncate">
              Compliant
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1 2xl:mt-1.5">
            <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {dailyCo2eTonnes.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">t CO₂e</span>
          </div>

          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            Footprint from generators and safety systems
          </p>
        </div>

        {/* AI Insight Footer */}
        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Target: &lt;1,400 t</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Zero Flare Waste</span>
        </div>
      </div>
    </section>
  );
};
