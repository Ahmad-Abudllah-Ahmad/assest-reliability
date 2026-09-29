import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Download, 
  Wrench, 
  TrendingUp, 
  Layers, 
  ArrowLeft 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { OptimizerTask } from '../types';

interface TaskOptimizerViewProps {
  tasks: OptimizerTask[];
  onExecuteTaskAction: (task: OptimizerTask) => void;
  onOpenCase: (caseId: string) => void;
  onExportBrief: () => void;
  onNavigateToCatalog?: () => void;
}

interface TaskTelemetryMeta {
  metric: string;
  unit: string;
  target: number;
  thresholdLabel: string;
  strokeColor: string;
  data: { time: string; value: number }[];
}

const TASK_TELEMETRY: Record<string, TaskTelemetryMeta> = {
  'task-1': {
    metric: 'Combustor Can #4 EGT Variance',
    unit: '°C',
    target: 18,
    thresholdLabel: 'Trip Limit: 18°C',
    strokeColor: '#3b82f6',
    data: [
      { time: '13:00', value: 16.2 },
      { time: '13:30', value: 19.4 },
      { time: '14:00', value: 23.1 },
      { time: '14:30', value: 26.0 },
      { time: '15:00', value: 21.8 },
      { time: '15:30', value: 18.2 },
      { time: '16:00', value: 16.5 },
      { time: 'Now', value: 15.2 }
    ]
  },
  'task-2': {
    metric: 'Condenser Vacuum Backpressure',
    unit: 'bar',
    target: 0.08,
    thresholdLabel: 'Target: 0.08 bar',
    strokeColor: '#06b6d4',
    data: [
      { time: '13:00', value: 0.062 },
      { time: '13:30', value: 0.084 },
      { time: '14:00', value: 0.108 },
      { time: '14:30', value: 0.114 },
      { time: '15:00', value: 0.088 },
      { time: '15:30', value: 0.065 },
      { time: '16:00', value: 0.054 },
      { time: 'Now', value: 0.048 }
    ]
  },
  'task-3': {
    metric: 'Lube Oil ISO Particulate Index',
    unit: 'ISO',
    target: 14,
    thresholdLabel: 'Target: ISO 14',
    strokeColor: '#8b5cf6',
    data: [
      { time: '13:00', value: 15.5 },
      { time: '13:30', value: 18.2 },
      { time: '14:00', value: 21.0 },
      { time: '14:30', value: 20.2 },
      { time: '15:00', value: 17.0 },
      { time: '15:30', value: 14.5 },
      { time: '16:00', value: 13.1 },
      { time: 'Now', value: 12.0 }
    ]
  },
  'task-4': {
    metric: 'Pinion Mesh Radial Vibration',
    unit: 'mm/s',
    target: 3.0,
    thresholdLabel: 'Limit: 3.0 mm/s',
    strokeColor: '#f59e0b',
    data: [
      { time: '13:00', value: 2.6 },
      { time: '13:30', value: 3.4 },
      { time: '14:00', value: 4.2 },
      { time: '14:30', value: 3.8 },
      { time: '15:00', value: 3.1 },
      { time: '15:30', value: 2.6 },
      { time: '16:00', value: 2.2 },
      { time: 'Now', value: 1.9 }
    ]
  },
  'task-5': {
    metric: 'Secondary Seal Vent Leakage',
    unit: 'Nm³/h',
    target: 2.5,
    thresholdLabel: 'Limit: 2.5 Nm³/h',
    strokeColor: '#10b981',
    data: [
      { time: '13:00', value: 2.8 },
      { time: '13:30', value: 2.7 },
      { time: '14:00', value: 2.45 },
      { time: '14:30', value: 2.15 },
      { time: '15:00', value: 1.95 },
      { time: '15:30', value: 1.85 },
      { time: '16:00', value: 1.80 },
      { time: 'Now', value: 1.76 }
    ]
  }
};

export const TaskOptimizerView: React.FC<TaskOptimizerViewProps> = ({
  tasks,
  onExecuteTaskAction,
  onOpenCase: _onOpenCase,
  onExportBrief,
  onNavigateToCatalog
}) => {
  const [liveTick, setLiveTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTick((t) => (t + 1) % 1000);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const sortedTasks = [...tasks].sort((a, b) => a.rank - b.rank);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn">
      {/* Executive Header & KPI Ribbon (shrink-0) */}
      <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs space-y-2 shrink-0">
        {/* Title, Back, and Export Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="h-7 w-7 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-600/80 shadow-2xs hover:shadow-xs active:scale-90 transition-all duration-200 cursor-pointer shrink-0 group focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                title="Back to Industrial Operations Catalog"
                aria-label="Back to Catalog"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Task Optimizer &amp; Priority Schedule
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportBrief}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0"
            >
              <Download className="h-3 w-3 text-slate-500" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Executive Metric Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-600" />
                Savings
              </span>
              <div className="font-mono font-extrabold text-sm text-emerald-950 dark:text-emerald-100 mt-0.5">
                $48,600 <span className="text-[10px] font-normal text-emerald-700">/ wk</span>
              </div>
            </div>
            <span className="text-[9.5px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
              +$29.5K GT-2
            </span>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" />
                Downtime Avoided
              </span>
              <div className="font-mono font-extrabold text-sm text-blue-950 dark:text-blue-100 mt-0.5">
                34.5 Hours
              </div>
            </div>
            <span className="text-[9.5px] font-medium text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
              5 Interventions
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700 rounded-lg p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider flex items-center gap-1">
                <Layers className="h-3 w-3 text-slate-500" />
                Active Tasks
              </span>
              <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                5 Tasks
              </div>
            </div>
            <span className="text-[9.5px] font-medium text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
              1 Crit • 2 High
            </span>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300 tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-amber-600" />
                Optimization ROI
              </span>
              <div className="font-mono font-extrabold text-sm text-amber-950 dark:text-amber-100 mt-0.5">
                6.8x Return
              </div>
            </div>
            <span className="text-[9.5px] font-medium text-amber-800 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
              Per Maint Hr
            </span>
          </div>
        </div>
      </div>

      {/* Ranked Tasks 2-Column Grid (flex-1 min-h-0 overflow-y-auto) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 2xl:gap-2.5">
          {sortedTasks.map((task) => {
            const isRank1 = task.rank === 1;
            const tele = TASK_TELEMETRY[task.id] || TASK_TELEMETRY['task-1'];
            
            // Add subtle dynamic micro-fluctuation to the latest point
            const liveData = tele.data.map((d, i) => {
              if (i === tele.data.length - 1) {
                const delta = Math.sin(liveTick + task.rank) * (tele.target * 0.035);
                return { 
                  ...d, 
                  value: Number((d.value + delta).toFixed(tele.unit === 'bar' ? 3 : 1)) 
                };
              }
              return d;
            });
            const currentVal = liveData[liveData.length - 1].value;

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-800 border rounded-xl p-2.5 sm:p-3 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isRank1
                    ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Task Header: Rank + Title only */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/80 pb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isRank1
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300'
                      }`}>
                        {task.rank}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {task.title.replace(/#/g, '')}
                      </h3>
                    </div>
                  </div>

                  {/* AI Ranking Rationale Box */}
                  <div className="my-1.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-0.5">
                      <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>AI Rationale:</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug font-medium line-clamp-2">
                      {task.whyFirst.replace(/#/g, '')}
                    </p>
                  </div>

                  {/* Live Curvy Optimization & Telemetry Line Chart */}
                  <div className="my-2 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10.5px] mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                          {tele.metric}
                        </span>
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>Live: <strong className="text-blue-600 dark:text-blue-400 font-bold">{currentVal} {tele.unit}</strong></span>
                        <span>•</span>
                        <span className="text-slate-400 dark:text-slate-500">{tele.thresholdLabel}</span>
                      </div>
                    </div>

                    <div className="h-20 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveData} margin={{ top: 4, right: 6, left: 6, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`grad-${task.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={tele.strokeColor} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={tele.strokeColor} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <ReferenceLine
                            y={tele.target}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            strokeOpacity={0.6}
                          />
                          <XAxis 
                            dataKey="time" 
                            stroke="#94a3b8" 
                            tick={{ fontSize: 9.5, fill: '#94a3b8' }} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: '#f8fafc',
                              padding: '4px 8px'
                            }}
                            formatter={(val: any) => [`${val ?? 0} ${tele.unit}`, tele.metric]}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={tele.strokeColor}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#grad-${task.id})`}
                            dot={{ r: 2.5, fill: tele.strokeColor, strokeWidth: 1, stroke: '#ffffff' }}
                            activeDot={{ r: 4.5, fill: '#2563eb' }}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate">
                    Action logs to plant DCS ledger
                  </span>

                  <button
                    onClick={() => onExecuteTaskAction(task)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-2xs transition cursor-pointer shrink-0"
                  >
                    <Wrench className="h-3 w-3" />
                    <span>{task.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
