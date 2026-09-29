import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  ReferenceArea 
} from 'recharts';
import { 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Zap
} from 'lucide-react';

interface TimelinePoint {
  time: string;
  mw: number;
  target: number;
  tariff: number;
  isPeak: boolean;
  status: 'Historical' | 'Current' | 'Projected';
}

const TIMELINE_DATA: TimelinePoint[] = [
  { time: '00:00', mw: 418, target: 430, tariff: 54.0, isPeak: false, status: 'Historical' },
  { time: '02:00', mw: 408, target: 415, tariff: 48.5, isPeak: false, status: 'Historical' },
  { time: '04:00', mw: 416, target: 420, tariff: 51.0, isPeak: false, status: 'Historical' },
  { time: '06:00', mw: 438, target: 445, tariff: 65.0, isPeak: false, status: 'Historical' },
  { time: '08:00', mw: 456, target: 470, tariff: 78.5, isPeak: false, status: 'Historical' },
  { time: '10:00', mw: 460, target: 478, tariff: 82.0, isPeak: false, status: 'Historical' },
  { time: '12:00', mw: 462.1, target: 480, tariff: 84.5, isPeak: false, status: 'Current' },
  { time: '14:00', mw: 463, target: 485, tariff: 89.0, isPeak: false, status: 'Projected' },
  { time: '16:00', mw: 461, target: 490, tariff: 96.0, isPeak: false, status: 'Projected' },
  { time: '17:00', mw: 462, target: 500, tariff: 145.0, isPeak: true, status: 'Projected' },
  { time: '18:00', mw: 462, target: 500, tariff: 145.0, isPeak: true, status: 'Projected' },
  { time: '19:30', mw: 462, target: 495, tariff: 145.0, isPeak: true, status: 'Projected' },
  { time: '20:30', mw: 454, target: 465, tariff: 92.0, isPeak: false, status: 'Projected' },
  { time: '22:00', mw: 434, target: 440, tariff: 68.0, isPeak: false, status: 'Projected' },
  { time: '24:00', mw: 416, target: 425, tariff: 56.0, isPeak: false, status: 'Projected' }
];

interface GenerationTimelineCardProps {
  onNavigateToOptimizer: () => void;
  onNavigateToCatalog?: () => void;
}

export const GenerationTimelineCard: React.FC<GenerationTimelineCardProps> = ({
  onNavigateToOptimizer,
  onNavigateToCatalog
}) => {
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>(TIMELINE_DATA);
  const [currentMW, setCurrentMW] = useState<number>(461.0);

  // Live telemetry stream: generator governor micro-fluctuations every 1.6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const wave = Math.sin(now / 1400) * 0.65 + Math.cos(now / 2200) * 0.35;
      const jitter = (Math.random() - 0.5) * 0.25;
      const liveMW = parseFloat((461.0 + wave + jitter).toFixed(1));

      setCurrentMW(liveMW);
      setTimelineData(prev => prev.map(pt => {
        if (pt.status === 'Current') {
          return { ...pt, mw: liveMW };
        }
        return pt;
      }));
    }, 1600);

    return () => clearInterval(timer);
  }, []);

  const derateGap = parseFloat((480 - currentMW).toFixed(1));
  // Custom Recharts tooltip for generation timeline
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: TimelinePoint = payload[0].payload;
      const deficit = data.target - data.mw;

      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              {label} ({data.status})
            </span>
            {data.isPeak ? (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                Peak Price
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Base Tariff</span>
            )}
          </div>

          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Plant Output:</span>
              <strong className="text-blue-400">{data.mw} MW</strong>
            </div>
            <div className="flex justify-between">
              <span>Contract Target:</span>
              <strong className="text-emerald-400">{data.target} MW</strong>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Generation Deficit:</span>
              <strong>-{deficit} MW</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-200">
              <span>Grid LMP Tariff:</span>
              <strong className={data.isPeak ? "text-amber-400 font-bold" : "text-slate-100"}>
                ${data.tariff.toFixed(2)} / MWh
              </strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 2xl:p-4.5 shadow-xs flex flex-col justify-between transition-colors duration-200 min-h-0">
      
      {/* Top Section: Header, Tiles, Chart */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2.5">
            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-600/80 shadow-2xs hover:shadow-xs active:scale-90 transition-all duration-200 cursor-pointer shrink-0 group focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                title="Back to Industrial Operations Catalog"
                aria-label="Back to Catalog"
              >
                <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  24-Hour Generation vs. Contract Target & Peak Pricing
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Telemetry (1 Hz)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active schedule vs 480 MW PPA obligation & high-revenue evening tariff window
              </p>
            </div>
          </div>

          {/* Action Area: CTA Button */}
          <div className="flex items-center self-start sm:self-auto shrink-0">
            <button
              onClick={onNavigateToOptimizer}
              className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-1.5 sm:px-3.5 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer group"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Optimize Dispatch (Recover {derateGap} MW)</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>

        {/* Legend Summary Bar with live updating values & curvy sparklines */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-1.5 sm:my-2 text-xs shrink-0">
          <div className="flex items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="text-left min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block tracking-wider truncate">Live Actual Output</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-0.5 block truncate">{currentMW.toFixed(1)} MW</span>
            </div>
            <svg width="44" height="20" viewBox="0 0 44 20" className="shrink-0 overflow-visible">
              <path
                d="M 2 13 C 10 16, 16 6, 24 11 C 32 16, 36 6, 42 8"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="42" cy="8" r="2.5" fill="#3b82f6" />
            </svg>
          </div>
          <div className="flex items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="text-left min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block tracking-wider truncate">Contract Target</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mt-0.5 block truncate">480 MW Baseline</span>
            </div>
            <svg width="44" height="20" viewBox="0 0 44 20" className="shrink-0 overflow-visible">
              <path
                d="M 2 10 C 12 7, 20 12, 28 8 C 34 6, 38 10, 42 7"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="42" cy="7" r="2.5" fill="#10b981" />
            </svg>
          </div>
          <div className="flex items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="text-left min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block tracking-wider truncate">Thermal Derate</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm mt-0.5 block truncate">-{Math.round(derateGap)} MW Gap</span>
            </div>
            <svg width="44" height="20" viewBox="0 0 44 20" className="shrink-0 overflow-visible">
              <path
                d="M 2 6 C 10 7, 18 14, 26 10 C 32 15, 36 17, 42 16"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="42" cy="16" r="2.5" fill="#f43f5e" />
            </svg>
          </div>
        </div>

        {/* 24-Hour Timeline Area Chart */}
        <div className="flex-1 min-h-[130px] sm:min-h-[150px] 2xl:min-h-[170px] w-full mt-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData} margin={{ top: 16, right: 20, left: -14, bottom: 4 }}>
              <defs>
                <linearGradient id="genBlueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                className="stroke-slate-100 dark:stroke-slate-700/60" 
              />

              <XAxis 
                dataKey="time" 
                ticks={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                tickLine={false} 
              />

              <YAxis 
                domain={[200, 550]} 
                ticks={[200, 300, 400, 480, 550]}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                tickLine={false} 
                tickFormatter={(v) => `${v}M`}
              />

              {/* Amber Shaded Band for Evening Peak Window (17:00 – 19:30) */}
              <ReferenceArea 
                x1="17:00" 
                x2="19:30" 
                y1={200} 
                y2={550} 
                fill="#f59e0b" 
                fillOpacity={0.12} 
                stroke="#f59e0b" 
                strokeDasharray="3 3" 
              />

              {/* Green Dotted Benchmark Line: 480 MW Contract Target */}
              <ReferenceLine 
                y={480} 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                label={{ 
                  value: '480 MW Contract Target', 
                  position: 'insideTopLeft', 
                  fill: '#10b981', 
                  fontSize: 10, 
                  fontWeight: 'bold' 
                }} 
              />

              {/* Current Time Indicator: Soft Rose Vertical Line with live MW reading */}
              <ReferenceLine 
                x="12:00" 
                stroke="#f43f5e" 
                strokeWidth={2} 
                label={{ 
                  value: `NOW (12:00): ${currentMW.toFixed(1)} MW`, 
                  position: 'top', 
                  fill: '#f43f5e', 
                  fontSize: 10, 
                  fontWeight: 'bold' 
                }} 
              />

              {/* Plant Generation Area Curve */}
              <Area 
                type="monotone" 
                dataKey="mw" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#genBlueAreaGradient)" 
                name="Actual & Projected Generation" 
              />

              <Tooltip 
                allowEscapeViewBox={{ x: true, y: true }}
                content={<CustomTimelineTooltip />} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plain-English AI Insight Callout Box with Live Values */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 shrink-0">
        <div className="p-2 sm:p-2.5 rounded-xl border bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-snug">
              <strong className="text-slate-900 dark:text-slate-100">Generation Status: </strong>
              Plant is delivering {currentMW.toFixed(1)} MW, running {derateGap} MW below contract target due to GT-2 thermal derating. This generation deficit will cost an estimated $16,400 today, with $11,200 of that loss occurring during the 17:00–19:30 evening price spike when power sells at $145/MWh.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
