import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Droplets, Flame, Waves, RefreshCw } from 'lucide-react';
import { ProductionPulsePoint } from '../../types/oilGasTypes';

interface ProductionPulseChartProps {
  data: ProductionPulsePoint[];
  className?: string;
}

export const ProductionPulseChart: React.FC<ProductionPulseChartProps> = ({ data, className }) => {
  const [pulseData, setPulseData] = useState<ProductionPulsePoint[]>(data);
  const [isLive, setIsLive] = useState(true);

  // Real-time micro-fluctuation simulation (FPSO offshore wellhead flow dynamics)
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setPulseData(prev => {
        const lastIdx = prev.length - 1;
        const current = prev[lastIdx];
        const jitterCrude = (Math.random() - 0.49) * 220;
        const jitterGas = (Math.random() - 0.49) * 0.45;
        const jitterWater = (Math.random() - 0.49) * 90;

        const updatedLast: ProductionPulsePoint = {
          ...current,
          crudeOilBpd: Math.round(84200 + jitterCrude),
          exportGasMmscfd: parseFloat((148.0 + jitterGas).toFixed(1)),
          producedWaterBpd: Math.round(26100 + jitterWater)
        };

        const next = [...prev];
        next[lastIdx] = updatedLast;
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const latest = pulseData[pulseData.length - 1];

  return (
    <div className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 2xl:p-3.5 shadow-xs flex flex-col justify-between ${className || ''}`}>
      {/* Header & Metric Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/80 pb-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              The Production Pulse — 24-Hour Offshore Stream
            </h2>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live (1 Hz)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            Real-time multi-phase flow rates from Subsea Manifolds North & South into FPSO trains.
          </p>
        </div>

        {/* 3 Live KPI Chips */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2 py-1">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <Droplets className="h-2.5 w-2.5 text-emerald-600" />
              Crude Oil
            </div>
            <div className="font-mono font-extrabold text-xs text-emerald-950 dark:text-emerald-100">
              {latest.crudeOilBpd.toLocaleString()} <span className="text-[9px] font-normal text-emerald-700 dark:text-emerald-400">bbl/d</span>
            </div>
          </div>

          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <Flame className="h-2.5 w-2.5 text-amber-600" />
              Export Gas
            </div>
            <div className="font-mono font-extrabold text-xs text-amber-950 dark:text-amber-100">
              {latest.exportGasMmscfd} <span className="text-[9px] font-normal text-amber-700 dark:text-amber-400">MMscf/d</span>
            </div>
          </div>

          <div className="bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-lg px-2 py-1">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
              <Waves className="h-2.5 w-2.5 text-cyan-600" />
              Produced Water
            </div>
            <div className="font-mono font-extrabold text-xs text-cyan-950 dark:text-cyan-100">
              {latest.producedWaterBpd.toLocaleString()} <span className="text-[9px] font-normal text-cyan-700 dark:text-cyan-400">bbl/d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plain-English Graph Explainer */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
        <span className="font-semibold text-slate-700 dark:text-slate-300">💡 24h Trend:</span>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-slate-700 dark:text-slate-300">Crude Oil</strong> (Target: 85k bbl/d)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-slate-700 dark:text-slate-300">Export Gas</strong> (MMscf/d)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <strong className="text-slate-700 dark:text-slate-300">Produced Water</strong> (bbl/d)
          </span>
        </div>
      </div>

      {/* Main 3-Line Recharts Canvas */}
      <div className="flex-1 min-h-0 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pulseData} margin={{ top: 6, right: 20, left: 0, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
            
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tick={{ fontSize: 9.5, fill: '#64748b' }} 
              tickLine={false} 
            />

            {/* Left Y-Axis: Liquids (Crude Oil & Water in bbl/d) */}
            <YAxis 
              yAxisId="liquids"
              stroke="#64748b" 
              tick={{ fontSize: 9.5, fill: '#64748b' }} 
              tickLine={false}
              domain={[20000, 95000]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />

            {/* Right Y-Axis: Gas (MMscf/d) */}
            <YAxis 
              yAxisId="gas"
              orientation="right"
              stroke="#f59e0b" 
              tick={{ fontSize: 9.5, fill: '#f59e0b' }} 
              tickLine={false}
              domain={[130, 160]}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#f8fafc',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(value: any, name: any) => {
                if (name === 'Crude Oil (bbl/d)') return [`${Number(value).toLocaleString()} bbl/d`, 'Crude Oil'];
                if (name === 'Export Gas (MMscf/d)') return [`${value} MMscf/d`, 'Export Gas'];
                if (name === 'Produced Water (bbl/d)') return [`${Number(value).toLocaleString()} bbl/d`, 'Produced Water'];
                return [value, name];
              }}
            />

            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '4px', fontSize: '10px', fontWeight: 600 }}
            />

            <ReferenceLine 
              yAxisId="liquids"
              y={85000} 
              stroke="#10b981" 
              strokeDasharray="4 4" 
              label={{ value: 'Daily Target (85k)', fill: '#10b981', fontSize: 9, position: 'insideTopLeft' }} 
            />

            {/* Line 1: Crude Oil (Emerald) */}
            <Line
              yAxisId="liquids"
              type="monotone"
              dataKey="crudeOilBpd"
              name="Crude Oil (bbl/d)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#059669' }}
            />

            {/* Line 2: Export Gas (Amber, Right Axis) */}
            <Line
              yAxisId="gas"
              type="monotone"
              dataKey="exportGasMmscfd"
              name="Export Gas (MMscf/d)"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="2 2"
              dot={{ r: 2.5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#d97706' }}
            />

            {/* Line 3: Produced Water (Cyan / Slate) */}
            <Line
              yAxisId="liquids"
              type="monotone"
              dataKey="producedWaterBpd"
              name="Produced Water (bbl/d)"
              stroke="#06b6d4"
              strokeWidth={1.75}
              dot={{ r: 2, fill: '#06b6d4' }}
              activeDot={{ r: 4, fill: '#0891b2' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Diagnostic Bar */}
      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 gap-1 shrink-0">
        <span className="flex items-center gap-1 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          BSW Water-Cut: <strong className="text-slate-800 dark:text-slate-200">23.6%</strong> • GOR: <strong className="text-slate-800 dark:text-slate-200">1,757 scf/bbl</strong>
        </span>
        <span className="font-mono text-[9.5px]">
          Flowline Loss: &lt;0.01% • Choke ΔP: 620 psi
        </span>
      </div>
    </div>
  );
};
