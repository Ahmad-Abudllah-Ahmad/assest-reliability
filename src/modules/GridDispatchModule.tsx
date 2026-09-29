import React from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Zap, 
  BatteryCharging, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  Gauge, 
  Play, 
  Pause,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GridDispatchModule: React.FC = () => {
  const { 
    demandData, 
    bessStatus, 
    generationMix, 
    recommendations, 
    openEvidenceModal,
    approveRecommendation,
    toggleBessMode,
    forceBessDischarge,
    forceBessCharge,
    addToast
  } = useApp();

  const primaryRec = recommendations.find(r => r.id === 'REC-701') || recommendations[0];

  // Custom Chart Tooltip
  const CustomDemandTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B1220] border border-gray-700/80 p-3 rounded-xl shadow-2xl text-xs font-mono">
          <div className="text-gray-400 font-sans font-bold border-b border-gray-800 pb-1 mb-2">
            Time: {label}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span style={{ color: entry.color }} className="capitalize text-[11px]">
                  {entry.name}:
                </span>
                <span className="font-bold text-gray-200">
                  {entry.value} {entry.name.includes('Price') ? '$/MWh' : 'MW'}
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
      {/* Module Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500 fill-blue-500" />
              Grid Dispatch & Peak Load Optimizer
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-950 text-blue-400 border border-blue-800/60 uppercase">
              Real-Time AC Power Flow
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            AI-forecasted demand curve vs. real-time telemetry, locational marginal pricing (LMP), and BESS economic arbitrage.
          </p>
        </div>

        {/* Quick Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBessMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              bessStatus.autoMode
                ? 'bg-blue-950/80 border-blue-600/60 text-blue-300'
                : 'bg-gray-800 border-gray-700 text-gray-300'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Mode: {bessStatus.autoMode ? 'Autonomous' : 'Manual'}</span>
          </button>

          <button
            onClick={() => {
              addToast({
                type: 'info',
                title: 'Demand Curve Recalibrated',
                message: 'Incorporated latest ERCOT/PJM weather radar and industrial load shifts.'
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Recalibrate</span>
          </button>
        </div>
      </div>

      {/* Top 3 High-Signal Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Peak Demand & Margin */}
        <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-4 shadow-lg hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">
              Projected Peak Demand
            </span>
            <span className="text-emerald-400 text-[11px] font-mono font-semibold">
              At 18:00
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              640.0
            </span>
            <span className="text-sm font-semibold text-gray-400">MW</span>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
              +18.2% vs Baseline
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
            <span>Spinning Cushion:</span>
            <span className="font-mono text-gray-200 font-semibold">+42.5 MW (Safe)</span>
          </div>
        </div>

        {/* Metric 2: BESS State & Arbitrage */}
        <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-4 shadow-lg hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">
              BESS State of Charge
            </span>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
              bessStatus.state === 'DISCHARGING'
                ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                : bessStatus.state === 'CHARGING'
                ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                : 'bg-gray-800 text-gray-300'
            }`}>
              {bessStatus.state}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tracking-tight text-purple-400 font-mono">
              {bessStatus.socPercent}%
            </span>
            <span className="text-sm font-semibold text-gray-400">
              ({bessStatus.currentStorageMWh} / {bessStatus.capacityMWh} MWh)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
            <span>Today Arbitrage Profit:</span>
            <span className="font-mono text-emerald-400 font-bold">+${bessStatus.todayArbitrageSavings.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 3: Peak LMP Market Pricing */}
        <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-4 shadow-lg hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">
              Locational Marginal Price
            </span>
            <span className="text-amber-400 text-[11px] font-mono font-semibold">
              Ramping Spike
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tracking-tight text-amber-400 font-mono">
              $148.00
            </span>
            <span className="text-sm font-semibold text-gray-400">/ MWh</span>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
              High Arbitrage
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
            <span>Day Low (Solar Midday):</span>
            <span className="font-mono text-gray-200 font-semibold">$38.60 / MWh</span>
          </div>
        </div>
      </div>

      {/* Main Chart Section: Demand vs AI Day-Ahead Forecast */}
      <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-4 md:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Real-Time MW Demand vs. AI Day-Ahead Forecast
            </h3>
            <p className="text-[11px] text-gray-400">
              Shaded confidence envelope reflects 95% Bayesian probabilistic load boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-gray-300">Actual (MW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block" />
              <span className="text-gray-300">AI Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-gray-300">LMP ($/MWh)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={demandData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="actualMwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke="#6B7280" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                tickLine={false} 
              />
              
              <YAxis 
                yAxisId="mw"
                stroke="#6B7280" 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                tickLine={false} 
                domain={[200, 750]}
              />

              <YAxis 
                yAxisId="price"
                orientation="right"
                stroke="#D97706" 
                tick={{ fontSize: 11, fill: '#F59E0B' }} 
                tickLine={false} 
                domain={[0, 180]}
              />

              <Tooltip content={<CustomDemandTooltip />} />

              {/* Upper Confidence Band */}
              <Area 
                yAxisId="mw"
                type="monotone" 
                dataKey="upperBand" 
                stroke="transparent" 
                fill="url(#confidenceBand)" 
                name="Upper Bound (95%)"
              />

              {/* Lower Confidence Band (inverted or reference) */}
              <Area 
                yAxisId="mw"
                type="monotone" 
                dataKey="lowerBand" 
                stroke="transparent" 
                fill="transparent" 
                name="Lower Bound (95%)"
              />

              {/* Forecast Line */}
              <Line 
                yAxisId="mw"
                type="monotone" 
                dataKey="forecastMW" 
                stroke="#06B6D4" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#06B6D4' }} 
                name="AI Forecast (MW)"
              />

              {/* Actual MW Curve */}
              <Area 
                yAxisId="mw"
                type="monotone" 
                dataKey="actualMW" 
                stroke="#3B82F6" 
                strokeWidth={2.5} 
                fill="url(#actualMwGrad)" 
                name="Actual MW Demand"
              />

              {/* LMP Price Line */}
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="lmpPrice" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                dot={false}
                name="LMP Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Section: Generation Mix + BESS Actuation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Generation Mix Breakdown */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800/90 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Active Generation Mix (525 MW Total Load)
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              44.7% Clean Energy
            </span>
          </div>

          {/* Progress Stack Bar */}
          <div className="h-3 w-full rounded-full bg-gray-800 overflow-hidden flex">
            {generationMix.map((item, idx) => (
              <div 
                key={idx}
                style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-500"
                title={`${item.name}: ${item.valueMW} MW (${item.percent}%)`}
              />
            ))}
          </div>

          {/* Detailed Item Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {generationMix.map((item, idx) => (
              <div 
                key={idx}
                className="bg-gray-900/70 border border-gray-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-gray-700 transition"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-xs text-gray-300 font-medium truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-base font-bold text-white">
                    {item.valueMW} <span className="text-[11px] font-normal text-gray-400">MW</span>
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    {item.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BESS Control & Fast Actuation Panel */}
        <div className="bg-[#111827] border border-gray-800/90 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BatteryCharging className="h-4 w-4 text-purple-400" />
                BESS Power Dispatch
              </h3>
              <span className="text-xs font-mono text-purple-300 font-semibold">
                100 MWh LFP
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              Direct SCADA inverter inverter commands for peak load shifting and fast frequency response.
            </p>

            {/* Visual SOC Tube */}
            <div className="mt-4 bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Charge Level:</span>
                <span className="text-white font-bold">{bessStatus.socPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${bessStatus.socPercent}%` }} 
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono pt-0.5">
                <span>Min Reserve (20%)</span>
                <span>Max Ceiling (95%)</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={forceBessDischarge}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition active:scale-98"
            >
              <Zap className="h-4 w-4" />
              Force 25 MW Peak Discharge
            </button>

            <button
              onClick={forceBessCharge}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-900 hover:bg-gray-800 border border-gray-700 transition"
            >
              <BatteryCharging className="h-3.5 w-3.5 text-blue-400" />
              Force Solar Absorption Charge
            </button>
          </div>
        </div>

      </div>

      {/* Actionable AI Dispatch Recommendation Card */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-gray-900 border border-blue-600/40 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-blue-400">
                RECOMMENDED DISPATCH ({primaryRec.id})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                +${primaryRec.financialSavingsPerHour}/hr Arbitrage
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                {primaryRec.confidenceScore}% AI Confidence
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">
              {primaryRec.title}
            </h4>
            <p className="text-xs text-gray-300 mt-0.5 leading-snug">
              {primaryRec.actionProposed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-center">
          <button
            onClick={() => openEvidenceModal(primaryRec)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-200 bg-gray-900/90 hover:bg-gray-800 border border-gray-700 transition"
          >
            Review Evidence
          </button>
          
          <button
            onClick={() => approveRecommendation(primaryRec.id)}
            disabled={primaryRec.status === 'APPROVED'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition ${
              primaryRec.status === 'APPROVED'
                ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
            }`}
          >
            {primaryRec.status === 'APPROVED' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Dispatched</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Execute Load Shift</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
