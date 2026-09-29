import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  Zap, 
  Wrench, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export interface ContingencyScenario {
  id: 'gt1' | 'gt2' | 'st1';
  code: string;
  name: string;
  color: string;
  activeMW: number;
  percentage: number;
  directLossMW: number;
  cascadingLossMW: number;
  totalDropFrom: number;
  totalDropTo: number;
  percentageLost: number;
  revenueLossPerHour: number;
  riskBadge: string;
  riskSeverity: 'critical' | 'high' | 'moderate';
  failureDescription: string;
}

const SCENARIOS: Record<string, ContingencyScenario> = {
  gt1: {
    id: 'gt1',
    code: 'GT-1',
    name: 'Gas Turbine 1',
    color: '#2563eb', // Primary Cobalt Blue
    activeMW: 158.0,
    percentage: 34,
    directLossMW: 158,
    cascadingLossMW: 60,
    totalDropFrom: 462,
    totalDropTo: 244,
    percentageLost: 47.2,
    revenueLossPerHour: 14920,
    riskBadge: '🚨 HIGH RISK — Causes Contract Breach',
    riskSeverity: 'critical',
    failureDescription: 'Immediate GT-1 trip cuts 158 MW directly and starves HRSG-1 of high-temperature flue exhaust, reducing steam cycle production by 60 MW.'
  },
  gt2: {
    id: 'gt2',
    code: 'GT-2',
    name: 'Gas Turbine 2',
    color: '#f59e0b', // Warm Amber
    activeMW: 142.0,
    percentage: 31,
    directLossMW: 142,
    cascadingLossMW: 55,
    totalDropFrom: 462,
    totalDropTo: 265,
    percentageLost: 42.6,
    revenueLossPerHour: 13480,
    riskBadge: '🚨 HIGH RISK — Causes Contract Breach',
    riskSeverity: 'critical',
    failureDescription: 'Immediate GT-2 shutdown drops 142 MW immediately. Loss of exhaust heat into HRSG-2 depresses steam turbine output by -55 MW.'
  },
  st1: {
    id: 'st1',
    code: 'ST-1',
    name: 'Steam Turbine Cycle',
    color: '#10b981', // Emerald Green
    activeMW: 162.0,
    percentage: 35,
    directLossMW: 162,
    cascadingLossMW: 0,
    totalDropFrom: 462,
    totalDropTo: 300,
    percentageLost: 35.1,
    revenueLossPerHour: 11100,
    riskBadge: '⚠️ MODERATE RISK — Generation Below Target',
    riskSeverity: 'moderate',
    failureDescription: 'ST-1 trip eliminates 162 MW of steam power. Gas Turbines GT-1 and GT-2 continue operating in bypass mode with 0 MW cascading loss.'
  }
};

interface PowerAssetFamilyCardProps {
  onLogEmergencyCase: (scenario: ContingencyScenario) => void;
  simulatedScenario?: ContingencyScenario | null;
  onToggleSimulateScenario: (scenario: ContingencyScenario) => void;
}

export const PowerAssetFamilyCard: React.FC<PowerAssetFamilyCardProps> = ({
  onLogEmergencyCase,
  simulatedScenario,
  onToggleSimulateScenario
}) => {
  // GT-2 selected by default per design specification
  const [selectedAssetId, setSelectedAssetId] = useState<'gt1' | 'gt2' | 'st1'>('gt2');

  const chartData = [
    { 
      id: 'gt1', 
      name: 'Gas Turbine 1 (GT-1)', 
      mw: 158.0, 
      ratedMW: 165,
      capacityPct: 96,
      percentage: 34, 
      color: '#2563eb',
      status: 'Baseload Normal',
      statusType: 'normal' as const,
      telemetry: '603°C Mean EGT • 2.1 mm/s RMS vibration'
    },
    { 
      id: 'gt2', 
      name: 'Gas Turbine 2 (GT-2)', 
      mw: 142.0, 
      ratedMW: 165,
      capacityPct: 86,
      percentage: 31, 
      color: '#f59e0b',
      status: 'Advisory Active (-18 MW Derate)',
      statusType: 'warning' as const,
      telemetry: '578°C Can #4 (-26°C spread) • Servo drift'
    },
    { 
      id: 'st1', 
      name: 'Steam Turbine Cycle (ST-1)', 
      mw: 162.0, 
      ratedMW: 170,
      capacityPct: 95,
      percentage: 35, 
      color: '#10b981',
      status: 'Combined Cycle Steam Active',
      statusType: 'normal' as const,
      telemetry: '0.11 bar Condenser backpressure • 42 bar HP'
    }
  ];

  const currentScenario = SCENARIOS[selectedAssetId];

  // Custom tooltip for donut chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-slate-100">{data.name}</span>
          </div>
          <div className="space-y-0.5 text-slate-300 font-mono text-[11px]">
            <div>Active Generation: <strong className="text-white">{data.mw.toFixed(1)} MW</strong></div>
            <div>Rated Capacity: <strong className="text-slate-300">{data.ratedMW} MW ({data.capacityPct}%)</strong></div>
            <div>Share of Output: <strong className="text-blue-400">{data.percentage}%</strong></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 2xl:p-4.5 shadow-xs flex flex-col justify-between transition-colors duration-200 min-h-0 overflow-hidden">
      
      {/* Top Header & Content Container */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Active Power Distribution
              </h3>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Prime mover breakdown & contingency impact
            </p>
          </div>

          <span className="text-[10px] sm:text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
            3 Online
          </span>
        </div>

        {/* Donut Chart: Scaled Centered Gauge */}
        <div className="relative flex items-center justify-center py-0.5 shrink-0">
          <div className="w-full max-w-[150px] 2xl:max-w-[175px] h-[100px] 2xl:h-[120px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="mw"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={48}
                  paddingAngle={3}
                  stroke="none"
                  onClick={(entry: any) => setSelectedAssetId((entry.id || entry.payload?.id) as any)}
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell 
                      key={entry.id} 
                      fill={entry.color}
                      stroke={selectedAssetId === entry.id ? '#ffffff' : 'none'}
                      strokeWidth={selectedAssetId === entry.id ? 2.5 : 0}
                      className="transition-all duration-200 hover:opacity-90 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Cutout Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className={`text-base 2xl:text-lg font-black font-mono tracking-tight leading-none ${
                simulatedScenario ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-900 dark:text-slate-100'
              }`}>
                {simulatedScenario ? `${simulatedScenario.totalDropTo} MW` : '462 MW'}
              </span>
              <span className="text-[8px] 2xl:text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 leading-tight">
                {simulatedScenario ? 'Simulated' : '96% Fleet Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Stacked Asset Rows with Real-Time Capacity Progress & Telemetry */}
        <div className="border-t border-b border-slate-100 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-700/60 shrink-0">
          {chartData.map((slice) => {
            const isSelected = selectedAssetId === slice.id;
            return (
              <button
                key={slice.id}
                onClick={() => setSelectedAssetId(slice.id as any)}
                className={`w-full text-left py-1 px-2 transition cursor-pointer rounded-lg ${
                  isSelected 
                    ? 'bg-slate-100/90 dark:bg-slate-700/40 text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-600' 
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="h-6 w-6 shrink-0 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 overflow-hidden flex items-center justify-center shadow-2xs">
                      <img 
                        src={
                          slice.id === 'st1' 
                            ? '/images/thumbnails/steam-turbine-3d.png' 
                            : '/images/thumbnails/gas-turbine-3d.png'
                        } 
                        alt={slice.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span 
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: slice.color }} 
                        />
                        <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                          {slice.name}
                        </span>
                        <span className={`text-[9px] font-semibold px-1 py-0.2 rounded shrink-0 ${
                          slice.statusType === 'warning'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        }`}>
                          {slice.statusType === 'warning' ? 'Derated' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono flex items-center gap-1 shrink-0 ml-1">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                      {slice.mw} MW
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans">({slice.percentage}%)</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full bg-slate-200/70 dark:bg-slate-700/60 rounded-full h-1 mt-1 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{ width: `${slice.capacityPct}%`, backgroundColor: slice.color }} 
                  />
                </div>

                {/* Micro Telemetry line */}
                <div className="flex items-center justify-between mt-0.5 text-[8.5px] text-slate-400 dark:text-slate-500 font-mono">
                  <span className="truncate mr-1">{slice.telemetry}</span>
                  <span className="shrink-0">{slice.capacityPct}% rated</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Contingency Drilldown Box */}
        <div className="my-1.5 p-2 sm:p-2.5 rounded-xl border bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {currentScenario.code} Contingency Risk Analysis
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
              currentScenario.riskSeverity === 'critical'
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
            }`}>
              {currentScenario.riskBadge.split('—')[0]}
            </span>
          </div>

          {/* 2x2 Metric Grid */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 block font-medium">Direct Power Lost</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[10.5px] mt-0.5 block">-{currentScenario.directLossMW} MW</span>
            </div>

            <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 block font-medium">Cascading Steam</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[10.5px] mt-0.5 block">
                {currentScenario.cascadingLossMW > 0 ? `-${currentScenario.cascadingLossMW} MW` : '0 MW (Bypass)'}
              </span>
            </div>

            <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 block font-medium">Total Plant Output</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[10.5px] mt-0.5 block">
                {currentScenario.totalDropFrom} ➔ {currentScenario.totalDropTo} MW
              </span>
            </div>

            <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 block font-medium">Revenue Loss / Hr</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[10.5px] mt-0.5 block">
                -${currentScenario.revenueLossPerHour.toLocaleString()}/hr
              </span>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-600 dark:text-slate-400 leading-tight">
            <span className="font-bold text-slate-700 dark:text-slate-300">Physics: </span>
            {currentScenario.failureDescription}
          </p>

          {/* SOP Mitigation Action Protocols */}
          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Operator SOP Response Protocol:
            </span>
            <div className="grid grid-cols-1 gap-1 text-[9.5px]">
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="truncate">Auto-signal Hydro Peaker #2 for 25 MW fast reserve</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="truncate">Ramp HRSG duct burners for +35 MW supplemental steam</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span className="truncate">Issue 15-minute ISO warning notice to waive Tier-2 penalties</span>
              </div>
            </div>
          </div>

          {/* NERC Compliance Status */}
          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                NERC BAL-002: <span className="text-emerald-600 dark:text-emerald-400 font-bold">+45 MW Reserve</span>
              </span>
              <span className="font-mono text-[9px] text-slate-400">Recovery: 42m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action CTA Buttons */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 shrink-0">
        <button
          onClick={() => onToggleSimulateScenario(currentScenario)}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
            simulatedScenario?.id === currentScenario.id
              ? 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white border border-slate-600'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
          }`}
        >
          {simulatedScenario?.id === currentScenario.id ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Reset Simulation (Restore 462 MW)</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              <span>Simulate {currentScenario.code} Trip ({currentScenario.totalDropTo} MW)</span>
            </>
          )}
        </button>

        <button
          onClick={() => onLogEmergencyCase(currentScenario)}
          className="w-full flex items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
        >
          <Wrench className="h-3 w-3" />
          <span>Log Emergency Risk Case</span>
        </button>
      </div>
    </div>
  );
};
