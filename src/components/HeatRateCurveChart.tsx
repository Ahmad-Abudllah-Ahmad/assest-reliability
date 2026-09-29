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
import { Sparkles, Wrench, ArrowRight } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Cycle Heat Rate Curve
              </h3>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              OEM benchmark vs. 24h actual operating telemetry points
            </p>
          </div>
        </div>

        {/* Legend / Metrics Banner aligned horizontally with curvy sparklines */}
        <div className="grid grid-cols-3 gap-1.5 my-1.5 text-xs shrink-0">
          <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <div className="text-left min-w-0">
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">Current Load</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs mt-0.5 block truncate">462 MW</span>
            </div>
            <svg width="40" height="18" viewBox="0 0 40 18" className="shrink-0 overflow-visible">
              <path
                d="M 2 13 C 10 16, 18 7, 26 11 C 32 14, 35 7, 38 6"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="38" cy="6" r="2" fill="#3b82f6" />
            </svg>
          </div>
          <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <div className="text-left min-w-0">
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">OEM Target</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs mt-0.5 block truncate">6,700 BTU</span>
            </div>
            <svg width="40" height="18" viewBox="0 0 40 18" className="shrink-0 overflow-visible">
              <path
                d="M 2 7 C 10 6, 18 11, 26 8 C 32 10, 35 7, 38 9"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="38" cy="9" r="2" fill="#10b981" />
            </svg>
          </div>
          <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-lg p-1.5">
            <div className="text-left min-w-0">
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider truncate">Actual Rate</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px] sm:text-xs mt-0.5 block truncate">6,820 BTU</span>
            </div>
            <svg width="40" height="18" viewBox="0 0 40 18" className="shrink-0 overflow-visible">
              <path
                d="M 2 13 C 10 14, 18 8, 26 11 C 32 6, 35 5, 38 4"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="38" cy="4" r="2" fill="#f43f5e" />
            </svg>
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div className="flex-1 min-h-[95px] sm:min-h-[110px] 2xl:min-h-[130px] w-full pt-1 relative">
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

      {/* AI Insight Callout & Advisory Action Button */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 shrink-0">
        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-900/60 text-slate-800 dark:text-slate-200 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-[11px] leading-snug">
            <span className="font-bold text-blue-950 dark:text-blue-300">💡 Heat Rate Degradation: </span>
            Plant is burning +1.8% excess fuel ($380/hr penalty) primarily caused by ST-1 condenser vacuum degradation (0.11 bar vs. 0.07 bar design).
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            Root Cause: Condenser Bio-Fouling
          </span>
          <button
            onClick={onLogCase}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer group shrink-0"
          >
            <Wrench className="h-3 w-3" />
            <span>Log Case</span>
            <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
