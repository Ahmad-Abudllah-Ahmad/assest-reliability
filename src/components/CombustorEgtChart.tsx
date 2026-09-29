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
        <div className="flex items-center justify-between gap-1.5 pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Combustor EGT Spread — GT-2
          </h3>
        </div>

        {/* Recharts Bar Chart */}
        <div className="flex-1 min-h-[140px] sm:min-h-[160px] 2xl:min-h-[180px] w-full pt-1 relative">
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
    </div>
  );
};
