import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Database, ArrowUpRight, Anchor, Navigation, ShieldCheck, Gauge } from 'lucide-react';
import { StorageExportPoint, OffshoreStorageTank, OffshoreExportSystem } from '../../types/oilGasTypes';

interface StorageLogisticsChartProps {
  data: StorageExportPoint[];
  tanks: OffshoreStorageTank[];
  exportSystem: OffshoreExportSystem;
}

export const StorageLogisticsChart: React.FC<StorageLogisticsChartProps> = ({
  data,
  tanks,
  exportSystem
}) => {
  const totalStorageCapacity = tanks.reduce((acc, t) => acc + t.cargoCapacityBbl, 0);
  const currentTotalStock = tanks.reduce((acc, t) => acc + t.currentStockBbl, 0);
  const overallFillPct = ((currentTotalStock / totalStorageCapacity) * 100).toFixed(1);

  return (
    <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & Overall FPSO Inventory */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Storage & Export Logistics (Tanks 1–3 & Pipeline Flow)
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <Anchor className="h-3 w-3" />
              FPSO Hull Cargo System
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic tracking of crude accumulation across Tanks 1, 2, and 3 with pipeline export discharge drawdowns.
          </p>
        </div>

        {/* Global Inventory Chips */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Crude in Stock
            </span>
            <span className="font-mono font-extrabold text-base text-slate-900 dark:text-slate-100">
              {currentTotalStock.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 750k bbl</span>
            </span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
              Global Fill Ratio
            </span>
            <span className="font-mono font-extrabold text-base text-emerald-700 dark:text-emerald-300">
              {overallFillPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 3 Tank Visual Fill Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {tanks.map((tank) => (
          <div 
            key={tank.id}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {tank.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  Empty Room: {tank.ullageMeters}m • Safety Gas: Safe ({tank.inertGasPressureMbar} mbar)
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                {tank.fillPercentage}%
              </span>
            </div>

            {/* Visual Tank Fill Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  tank.fillPercentage > 80 
                    ? 'bg-amber-500' 
                    : tank.fillPercentage > 50 
                    ? 'bg-blue-600' 
                    : 'bg-emerald-500'
                }`} 
                style={{ width: `${tank.fillPercentage}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span>{tank.currentStockBbl.toLocaleString()} bbl stored</span>
              <span>Total Room: {(tank.cargoCapacityBbl / 1000).toFixed(0)}k bbl</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plain-English Graph Explainer */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <span>💡 How to read this storage & export graph:</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
            <strong className="text-slate-800 dark:text-slate-200">Blue Shaded Area:</strong> Total crude stored in hull tanks (Left Axis: Barrels)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <strong className="text-slate-800 dark:text-slate-200">Purple Dashed Line:</strong> Oil pumped out through 16&quot; undersea pipe (Right Axis: Barrels/day)
          </span>
        </div>
      </div>

      {/* Main ComposedChart: Area (Storage Fill) + Bar / Line (Export Flow) */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
            
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              tickLine={false} 
            />

            {/* Left Y-Axis: Total Storage Inventory (bbl) */}
            <YAxis 
              yAxisId="storage"
              stroke="#64748b" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              tickLine={false}
              domain={[300000, 550000]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k bbl`}
            />

            {/* Right Y-Axis: Export Pipeline Flow (bpd) */}
            <YAxis 
              yAxisId="flow"
              orientation="right"
              stroke="#10b981" 
              tick={{ fontSize: 11, fill: '#10b981' }} 
              tickLine={false}
              domain={[60000, 130000]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k bpd`}
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
              formatter={(value: any, name: any) => {
                if (name === 'Total Storage Stock (bbl)') return [`${Number(value).toLocaleString()} bbl`, 'Total Storage'];
                if (name === 'Export Pipeline Flow (bpd)') return [`${Number(value).toLocaleString()} bpd`, 'Pipeline Export Rate'];
                return [value, name];
              }}
            />

            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
            />

            <ReferenceLine 
              yAxisId="storage"
              y={500000} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: 'Tanker Dispatch Threshold (500k)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} 
            />

            {/* Area: Rising cumulative tank volume */}
            <Area
              yAxisId="storage"
              type="monotone"
              dataKey="totalStorageBbl"
              name="Total Storage Stock (bbl)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#storageGradient)"
            />

            {/* Bar/Line: Overlaid Export Pipeline Flow */}
            <Bar
              yAxisId="flow"
              dataKey="exportPipelineFlowBpd"
              name="Export Pipeline Flow (bpd)"
              fill="#10b981"
              opacity={0.3}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            <Line
              yAxisId="flow"
              type="monotone"
              dataKey="exportPipelineFlowBpd"
              name="Export Flow Trend"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Subsea Pipeline & Pig Launcher Status Strip */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {exportSystem.pipelineName} ({exportSystem.diameterInches}&quot; Subsea Trunkline • {exportSystem.lengthMiles} Miles)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400">
            Inlet Pressure: <strong className="text-slate-800 dark:text-slate-200">{exportSystem.inletPressureBar} bar</strong>
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Pig Launcher: {exportSystem.pigLauncherStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
