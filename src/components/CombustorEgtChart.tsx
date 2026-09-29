import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { AlertTriangle, Wrench, ArrowRight } from 'lucide-react';
import { CombustorCan } from '../types';

interface CombustorEgtChartProps {
  data: CombustorCan[];
  onLogCase: () => void;
}

export const CombustorEgtChart: React.FC<CombustorEgtChartProps> = ({
  data,
  onLogCase
}) => {
  const meanTemp = 603;
  const spreadTolerance = 18;
  const lowerLimit = meanTemp - spreadTolerance; // 585°C
  const upperLimit = meanTemp + spreadTolerance; // 621°C

  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 2xl:p-4.5 shadow-xs flex flex-col justify-between transition-colors duration-200 min-h-0">
      {/* Top Section: Header, Metrics, Chart */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Combustor EGT Spread — GT-2
              </h3>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Annular thermocouple array across Cans 1–14 • Alarm trip limit: ±18°C from mean
            </p>
          </div>
        </div>

        {/* Dynamic Metric Tiles Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-1.5 text-xs shrink-0">
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Spread Anomaly</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px] sm:text-xs mt-0.5 block">26.0°C Spread</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Array Mean EGT</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs mt-0.5 block">603°C</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Allowable Band</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs mt-0.5 block">585°C – 621°C</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Can 4 Deviation</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px] sm:text-xs mt-0.5 block">578°C (-26°C)</span>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="flex-1 min-h-[95px] sm:min-h-[110px] 2xl:min-h-[130px] w-full pt-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 14, right: 14, left: -22, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="canLabel" 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={{ stroke: '#64748b', opacity: 0.3 }} 
              />
              <YAxis 
                domain={[560, 630]} 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={{ stroke: '#64748b', opacity: 0.3 }}
                unit="°"
              />
              <Tooltip
                allowEscapeViewBox={{ x: true, y: true }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CombustorCan;
                    const diff = item.temperature - meanTemp;
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100">
                        <div className="font-bold">{item.canLabel} Thermocouple</div>
                        <div className="text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between gap-3">
                          <span>Temperature:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.temperature}°C</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
                          <span>Spread vs Mean:</span>
                          <span className={`font-mono font-bold ${item.isAnomaly ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {diff > 0 ? `+${diff}°C` : `${diff}°C`}
                          </span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-semibold">
                          {item.isAnomaly ? (
                            <span className="text-rose-600 dark:text-rose-400">🚨 Cold Spot Anomaly (Derate Triggered)</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">✓ Within Normal ±18°C Band</span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Reference Lines */}
              <ReferenceLine 
                y={meanTemp} 
                stroke="#64748b" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ value: 'Mean: 603°C', fill: '#64748b', fontSize: 9, position: 'insideTopRight' }} 
              />
              <ReferenceLine 
                y={lowerLimit} 
                stroke="#f43f5e" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
                label={{ value: '-18°C Alarm', fill: '#f43f5e', fontSize: 8.5, position: 'insideBottomRight' }} 
              />
              <ReferenceLine 
                y={upperLimit} 
                stroke="#f43f5e" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
                label={{ value: '+18°C Alarm', fill: '#f43f5e', fontSize: 8.5, position: 'insideTopRight' }} 
              />

              <Bar dataKey="temperature" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell 
                    key={`can-${entry.canNumber}`} 
                    fill={entry.isAnomaly ? '#f43f5e' : '#2563eb'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight Callout & Advisory Action Button */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 shrink-0">
        <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-slate-800 dark:text-slate-200 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-[11px] leading-snug">
            <span className="font-bold text-amber-950 dark:text-amber-300">⚠️ EGT Spread Exceedance: </span>
            Can #4 is running 26°C below average due to fuel nozzle #4 servo valve drift. Plant DCS has initiated automated 18 MW derating to protect stage 1 turbine blades.
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            Workflow: Collaborative Condition Monitoring
          </span>
          <button
            onClick={onLogCase}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer group shrink-0"
          >
            <Wrench className="h-3 w-3" />
            <span>Log Case for Can 4</span>
            <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
