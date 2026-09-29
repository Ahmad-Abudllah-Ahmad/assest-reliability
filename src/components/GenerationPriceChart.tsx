import React, { useState } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Clock, 
  DollarSign, 
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { GenerationPoint } from '../types';

interface GenerationPriceChartProps {
  data: GenerationPoint[];
  onScheduleRamp: () => void;
  isRampScheduled: boolean;
}

export const GenerationPriceChart: React.FC<GenerationPriceChartProps> = ({
  data,
  onScheduleRamp,
  isRampScheduled
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs">
          <div className="text-slate-500 font-bold border-b border-slate-100 pb-1 mb-2">
            Time: {label}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-slate-900">
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors duration-200">
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Power Generation vs. Market Electricity Price (Next 12 Hours)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dual-axis trend displaying plant MW delivery against real-time LMP spot market pricing ($/MWh).
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Plant Output (MW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">LMP Price ($/MWh)</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
              <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              Peak: 17:00–19:00
            </div>
          </div>
        </div>

        {/* Recharts Area/Line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mwFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false} 
              />
              
              {/* Left Y Axis: MW Output */}
              <YAxis 
                yAxisId="mw"
                stroke="#3b82f6" 
                tick={{ fontSize: 11, fill: '#3b82f6' }} 
                tickLine={false} 
                domain={[420, 520]}
                unit=" MW"
              />

              {/* Right Y Axis: Market Price ($/MWh) */}
              <YAxis 
                yAxisId="price"
                orientation="right"
                stroke="#d97706" 
                tick={{ fontSize: 11, fill: '#d97706' }} 
                tickLine={false} 
                domain={[30, 160]}
                unit=" $"
              />

              <Tooltip content={<CustomChartTooltip />} />

              {/* Highlight Peak Window (17:00 to 19:00) */}
              <ReferenceArea 
                yAxisId="mw"
                x1="17:00" 
                x2="19:00" 
                fill="#f59e0b" 
                fillOpacity={0.14} 
                stroke="#f59e0b"
                strokeDasharray="3 3"
              />

              {/* MW Output Line and Area */}
              <Area 
                yAxisId="mw"
                type="monotone" 
                dataKey="projectedMW" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                fill="url(#mwFill)" 
                name="Plant Generation (MW)"
                dot={{ r: 3, fill: '#3b82f6' }}
              />

              {/* Market LMP Price Line */}
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="priceLMP" 
                stroke="#d97706" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#d97706' }}
                name="Market Price ($/MWh)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Highlighted Embedded AI Insight Box */}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Opportunity Alert
              </span>
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded border border-emerald-500/20">
                +$15,600 Potential Spot Profit
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              Grid power price spikes to <strong>$145/MWh at 17:30</strong>. Increasing plant output from <strong>462 MW to 495 MW</strong> during this 2-hour window will capture an additional <strong>+$15,600 in spot profit</strong>.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onScheduleRamp}
          disabled={isRampScheduled}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
            isRampScheduled
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30'
          }`}
        >
          {isRampScheduled ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Peak Ramp Scheduled (+495 MW)</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Schedule Peak Ramp-Up (Earn +$15.6K)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
