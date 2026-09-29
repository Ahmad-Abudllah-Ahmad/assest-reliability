import React from 'react';
import { 
  LineChart, 
  Line, 
  ComposedChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Leaf, 
  Flame, 
  TrendingDown, 
  Sliders, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Gauge, 
  AlertTriangle,
  RotateCcw,
  Wind
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CarbonEfficiencyModule: React.FC = () => {
  const { 
    heatRateData, 
    emissions, 
    optimizeAirFuelRatio, 
    addToast 
  } = useApp();

  const CustomHeatRateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B1220] border border-gray-700/80 p-3 rounded-xl shadow-2xl text-xs font-mono">
          <div className="text-gray-400 font-sans font-bold border-b border-gray-800 pb-1 mb-2">
            Turbine Load: {label}%
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span style={{ color: entry.color }} className="text-[11px]">
                  {entry.name}:
                </span>
                <span className="font-bold text-gray-200">
                  {entry.value} {entry.name.includes('Efficiency') ? '%' : 'BTU/kWh'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-500" />
              Efficiency, Heat Rate & Carbon Accounting
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
              Scope 1 CEMS Compliance & Low-NOx
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time heat rate degradation curves, EPA 40 CFR Part 75 carbon ledger, and automated fuel combustor tuning.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              addToast({
                type: 'success',
                title: 'Carbon Accounting Ledger Exported',
                message: 'Verified 1,420.5 metric tons CO2e audited for EPA emissions allowance compliance.'
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition"
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Export Carbon Report</span>
          </button>

          <button
            onClick={optimizeAirFuelRatio}
            disabled={emissions.airFuelRatioOptimized}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md transition ${
              emissions.airFuelRatioOptimized
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {emissions.airFuelRatioOptimized ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>Low-NOx Mode Locked</span>
              </>
            ) : (
              <>
                <Sliders className="h-3.5 w-3.5" />
                <span>Optimize Air-to-Fuel Ratio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top 3 High-Signal Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Scope 1 Intensity */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
              Scope 1 Real-Time Intensity
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              emissions.scope1Intensity < emissions.regulatoryCap 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
            }`}>
              {emissions.scope1Intensity < emissions.regulatoryCap ? 'COMPLIANT' : 'EXCEEDED'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {emissions.scope1Intensity}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">tCO2e/MWh</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>Regulatory Limit Cap:</span>
            <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{emissions.regulatoryCap} tCO2e/MWh</span>
          </div>
        </div>

        {/* Metric 2: NOx Emissions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
              NOx Stack Concentration
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              emissions.noxPpm <= 10.0
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
            }`}>
              {emissions.noxPpm <= 10.0 ? 'OPTIMIZED' : 'WARNING'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-3xl font-black tracking-tight font-mono ${
              emissions.noxPpm <= 10.0 ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {emissions.noxPpm}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">ppm</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>Air-to-Fuel Valve Trim:</span>
            <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
              {emissions.airFuelRatioOptimized ? '-1.8% (Low-NOx)' : '0.0% (Nominal)'}
            </span>
          </div>
        </div>

        {/* Metric 3: Clean Energy Offset Credits */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
              Clean Energy Offset Value
            </span>
            <span className="text-emerald-500 text-[10px] font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              LEDGER AUDITED
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black tracking-tight text-emerald-500 font-mono">
              ${emissions.carbonCreditsUSD.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">USD</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>Clean Energy Generation:</span>
            <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{emissions.cleanEnergyPercent}% Total Fleet</span>
          </div>
        </div>

      </div>

      {/* Main Graph: Heat Rate vs. Thermal Efficiency Curve */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              Turbine Heat Rate vs. Thermal Efficiency Curve
            </h3>
            <p className="text-[11px] text-gray-400">
              Compares actual measured fuel consumption (BTU/kWh) vs. original OEM design baseline across load percentages.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="text-gray-300">Actual Heat Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-500 inline-block" />
              <span className="text-gray-400">Design Baseline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-gray-300">Efficiency (%)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={heatRateData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              
              <XAxis 
                dataKey="loadPercent" 
                stroke="#6B7280" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                tickFormatter={(v) => `${v}% Load`}
                tickLine={false} 
              />
              
              <YAxis 
                yAxisId="heatRate"
                stroke="#F59E0B" 
                tick={{ fontSize: 11, fill: '#F59E0B' }} 
                tickLine={false} 
                domain={[8000, 11000]}
              />

              <YAxis 
                yAxisId="efficiency"
                orientation="right"
                stroke="#10B981" 
                tick={{ fontSize: 11, fill: '#10B981' }} 
                tickLine={false} 
                domain={[25, 45]}
              />

              <Tooltip content={<CustomHeatRateTooltip />} />

              {/* Design Heat Rate Baseline Line */}
              <Line 
                yAxisId="heatRate"
                type="monotone" 
                dataKey="designHeatRate" 
                stroke="#6B7280" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={false} 
                name="Design Baseline"
              />

              {/* Actual Heat Rate Curve */}
              <Line 
                yAxisId="heatRate"
                type="monotone" 
                dataKey="actualHeatRate" 
                stroke="#F59E0B" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#F59E0B' }} 
                name="Actual Heat Rate"
              />

              {/* Thermal Efficiency Line */}
              <Line 
                yAxisId="efficiency"
                type="monotone" 
                dataKey="thermalEfficiencyPercent" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#10B981' }} 
                name="Thermal Efficiency"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Scope 1 Ledger & Fuel-to-Power Ratio Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Clean Energy Offset & Compliance Ledger */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-500" />
              Clean Energy Offset Ledger (Daily Audit)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              EPA Part 75 CEMS
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Solar PV Generation Avoided Carbon:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">-482.4 tCO2e</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Wind Generation Displaced Peakers:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">-624.1 tCO2e</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">BESS Arbitrage Carbon Net Balance:</span>
              <span className="text-purple-500 dark:text-purple-400 font-bold">-78.0 tCO2e</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20">
              <span className="text-slate-700 dark:text-slate-200 font-semibold">Total Verified Offsets:</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">-1,184.5 tCO2e ($14,850)</span>
            </div>
          </div>
        </div>

        {/* Fuel-to-Power Combustion Optimizer Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-400" />
                Air-to-Fuel Stoichiometric Optimization
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Low-NOx Mode
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              Trims fuel gas pressure to lower combustor flame peak temperature, drastically curtailing thermal NOx emissions without sacrificing base MW capacity.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 block">EXPECTED NOX DROP</span>
                <span className="text-emerald-400 font-bold text-base mt-0.5 block">-34.4%</span>
              </div>
              <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 block">FUEL COST SAVINGS</span>
                <span className="text-emerald-400 font-bold text-base mt-0.5 block">+$480 / hr</span>
              </div>
            </div>
          </div>

          <button
            onClick={optimizeAirFuelRatio}
            disabled={emissions.airFuelRatioOptimized}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition ${
              emissions.airFuelRatioOptimized
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30'
            }`}
          >
            {emissions.airFuelRatioOptimized ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Stoichiometry Calibrated (Optimal)</span>
              </>
            ) : (
              <>
                <Sliders className="h-4 w-4" />
                <span>Apply Fuel Trim for Low-NOx Mode</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
