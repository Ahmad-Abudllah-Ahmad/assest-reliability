import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine
} from 'recharts';
import { HeatRateCurvePoint } from '../types';

interface HeatRateCurveChartProps {
  data: HeatRateCurvePoint[];
  onLogCase: () => void;
}

export const HeatRateCurveChart: React.FC<HeatRateCurveChartProps> = ({
  data,
  onLogCase
}) => {
  const currentPoint = data.find(d => d.isCurrentPoint) || data[5];
  const deltaBtu = (currentPoint.actualHeatRate || 6820) - currentPoint.oemDesignHeatRate;

  // Custom dot renderer for actual operating points to highlight the current 462 MW point
  const renderActualDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.actualHeatRate) return null;

    if (payload.isCurrentPoint) {
      return (
        <g key={`dot-current-${payload.loadMW}`}>
          <circle cx={cx} cy={cy} r={8} fill="#f43f5e" fillOpacity={0.25} className="animate-ping" />
          <circle cx={cx} cy={cy} r={6} fill="#f43f5e" stroke="#ffffff" strokeWidth={2} />
        </g>
      );
    }

    return (
      <circle 
        key={`dot-${payload.loadMW}`} 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill="#3b82f6" 
        stroke="#ffffff" 
        strokeWidth={1.5} 
      />
    );
  };

  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 2xl:p-4.5 shadow-xs flex flex-col justify-between transition-colors duration-200 min-h-0">
      {/* Top Section: Header, Metrics, Chart */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between gap-1.5 pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Cycle Heat Rate Curve
          </h3>
        </div>

        {/* Recharts Composed Chart */}
        <div className="flex-1 min-h-[140px] sm:min-h-[160px] 2xl:min-h-[180px] w-full pt-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 14, right: 14, left: -14, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="loadMW" 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={{ stroke: '#64748b', opacity: 0.3 }} 
                unit=" MW"
                domain={[300, 520]}
              />
              <YAxis 
                domain={[6500, 7600]} 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={{ stroke: '#64748b', opacity: 0.3 }} 
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                allowEscapeViewBox={{ x: true, y: true }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as HeatRateCurvePoint;
                    const oem = item.oemDesignHeatRate;
                    const actual = item.actualHeatRate;
                    const delta = actual ? actual - oem : null;

                    return (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100">
                        <div className="font-bold flex items-center justify-between gap-3">
                          <span>Operating Point: {item.loadMW} MW</span>
                          {item.isCurrentPoint && (
                            <span className="bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/20">
                              CURRENT
                            </span>
                          )}
                        </div>
                        {item.timestamp && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 font-mono">Timestamp: {item.timestamp}</div>
                        )}
                        <div className="text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between gap-3">
                          <span>OEM Design Curve:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{oem.toLocaleString()} BTU/kWh</span>
                        </div>
                        {actual && (
                          <div className="text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
                            <span>Actual Operating:</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{actual.toLocaleString()} BTU/kWh</span>
                          </div>
                        )}
                        {delta !== null && (
                          <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] flex items-center justify-between gap-3">
                            <span className="text-slate-500 dark:text-slate-400">Cycle Efficiency Delta:</span>
                            <span className={`font-mono font-bold ${delta > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {delta > 0 ? `+${delta} BTU (+${((delta / oem) * 100).toFixed(1)}%)` : `${delta} BTU`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Reference Line for Current MW */}
              <ReferenceLine 
                x={462} 
                stroke="#f43f5e" 
                strokeDasharray="4 4" 
                label={{ value: '462 MW', fill: '#f43f5e', fontSize: 9, position: 'insideTopLeft' }} 
              />

              {/* OEM Design Line */}
              <Line 
                type="monotone" 
                dataKey="oemDesignHeatRate" 
                stroke="#64748b" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={false}
                name="OEM Design Curve"
              />

              {/* Actual Heat Rate Line & Dots */}
              <Line 
                type="monotone" 
                dataKey="actualHeatRate" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                dot={renderActualDot}
                connectNulls
                name="24h Operating Telemetry"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
