import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Leaf, ShieldCheck, AlertCircle, Wind, Flame, Zap, Gauge } from 'lucide-react';
import { GhgEmissionRecord } from '../../types/oilGasTypes';

interface GhgEmissionsChartProps {
  data: GhgEmissionRecord[];
}

export const GhgEmissionsChart: React.FC<GhgEmissionsChartProps> = ({ data }) => {
  const totalTonnes = data.reduce((acc, curr) => acc + curr.tonnesCo2ePerDay, 0);
  const carbonIntensity = (totalTonnes * 1000 / 84200).toFixed(1); // kg CO2e per barrel of oil equivalent

  return (
    <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Leaf className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              GHG Emissions Breakdown (Tonnes CO₂e / Day)
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              EPA Subpart W & OPRED Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Continuous CEMS & optical sonic measurement across FPSO thermal combustion, flare stack, and process seals.
          </p>
        </div>

        {/* Carbon Intensity Summary Pill */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Total Daily Pollution
            </span>
            <span className="font-mono font-extrabold text-base text-slate-900 dark:text-slate-100">
              {totalTonnes.toFixed(1)} <span className="text-xs font-normal text-slate-500">Tons CO₂/day</span>
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200 dark:border-slate-700" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Pollution Per Barrel
            </span>
            <span className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
              {carbonIntensity} <span className="text-xs font-normal">kg CO₂/barrel</span>
            </span>
          </div>
        </div>
      </div>

      {/* Plain-English Explainer */}
      <div className="bg-emerald-50/70 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-950 dark:text-emerald-200">
          <span>💡 Where do the platform&apos;s emissions come from?</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300">
          <strong className="text-slate-800 dark:text-slate-200">73% Turbogenerators:</strong> Gas burned to create electricity for the ship • <strong className="text-slate-800 dark:text-slate-200">15% Safety Flare:</strong> Emergency pressure relief burner • <strong className="text-slate-800 dark:text-slate-200">12% Process Vents:</strong> Normal tank breathing. Carbon intensity of 14.8 kg/barrel beats global target (&lt;18 kg).
        </p>
      </div>

      {/* Grid: BarChart breakdown + Donut proportion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
        {/* Left 2 Cols: Categorized Bar Chart */}
        <div className="lg:col-span-2 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} horizontal={false} />
              
              <XAxis 
                type="number" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false} 
                unit=" t" 
              />

              <YAxis 
                type="category" 
                dataKey="category" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false}
                width={150}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value: any, name: any, item: any) => [
                  `${value} Tonnes CO₂e/day (${item.payload.percentage}%)`,
                  item.payload.source
                ]}
              />

              <Bar dataKey="tonnesCo2ePerDay" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Col: Donut Composition */}
        <div className="h-64 flex flex-col items-center justify-center relative">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="tonnesCo2ePerDay"
              >
                {data.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dominant Contributor</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Turbogenerators (62.4%)</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {data.map((item, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.category}
              </span>
              <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-slate-100">
                {item.tonnesCo2ePerDay} t
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {item.mitigationStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
