import React from 'react';
import { 
  Zap, 
  Flame, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

interface ExecutiveKpisProps {
  currentMW: number;
  targetMW: number;
  heatRate: number;
  currentMargin: number;
  fleetHealthPct: number;
  onOpenJargonGuide?: () => void;
}

export const ExecutiveKpis: React.FC<ExecutiveKpisProps> = ({
  currentMW,
  targetMW,
  heatRate,
  currentMargin,
  fleetHealthPct
}) => {
  const capacityPct = ((currentMW / targetMW) * 100).toFixed(1);

  return (
    <section aria-label="Executive KPIs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* Card 1: Power Output */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300">
              Electricity Output
            </span>
            <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full text-[11px] border border-blue-500/20">
              {capacityPct}% of Target
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {currentMW}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">MW</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">/ {targetMW} MW Target</span>
          </div>
        </div>
      </div>

      {/* Card 2: Fuel Efficiency (Heat Rate) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500 transition">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300">
              Fuel Efficiency
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full text-[11px] border border-amber-500/20">
              Burning +1.8% Extra Gas
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {heatRate.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">BTU/kWh (Heat Rate)</span>
          </div>
        </div>
      </div>

      {/* Card 3: Current Margin */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-500 transition">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300">
              Net Profit / Hour
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px] border border-emerald-500/20">
              Profitable (+12%)
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2.5">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              +${currentMargin.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ hour net</span>
          </div>
        </div>
      </div>

      {/* Card 4: Fleet Health */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition">
        <div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300">
              Machine Reliability
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full text-[11px] border border-amber-500/20">
              1 Needs Attention
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {fleetHealthPct}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Safe Health</span>
          </div>
        </div>
      </div>

    </section>
  );
};
