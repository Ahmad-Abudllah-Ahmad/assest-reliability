import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Zap, 
  DollarSign, 
  CheckCircle2, 
  Sliders, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
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
import { GenerationPoint, RecommendationItem } from '../types';

interface AiOptimizationViewProps {
  generationData: GenerationPoint[];
  recommendations: RecommendationItem[];
  isRampScheduled: boolean;
  onScheduleRamp: () => void;
  onExecuteRecommendation: (rec: RecommendationItem) => void;
}

export const AiOptimizationView: React.FC<AiOptimizationViewProps> = ({
  generationData,
  recommendations,
  isRampScheduled,
  onScheduleRamp,
  onExecuteRecommendation
}) => {
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
    <div className="space-y-6 animate-fadeIn">
      {/* Chart Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Day-Ahead Electricity Price (LMP) vs. Dispatched Generation Curve
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies merchant price arbitrage spikes and automated AGC dispatch ramp opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
              <span className="text-slate-700 font-medium">Plant Output (MW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-700 font-medium">Market Price ($/MWh)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800 text-[11px] font-medium">
              <Clock className="h-3 w-3 text-amber-600" />
              Peak: 17:00–19:00
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={generationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mwFillOpt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false} 
              />
              
              <YAxis 
                yAxisId="mw"
                stroke="#2563eb" 
                tick={{ fontSize: 11, fill: '#2563eb' }} 
                tickLine={false} 
                domain={[420, 520]}
                unit=" MW"
              />

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

              <ReferenceArea 
                yAxisId="mw"
                x1="17:00" 
                x2="19:00" 
                fill="#fef3c7" 
                fillOpacity={0.45} 
                stroke="#f59e0b"
                strokeDasharray="3 3"
              />

              <Area 
                yAxisId="mw"
                type="monotone" 
                dataKey="projectedMW" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                fill="url(#mwFillOpt)" 
                name="Plant Generation (MW)"
                dot={{ r: 3, fill: '#2563eb' }}
              />

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

        {/* Opportunity Alert Card */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50/50 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Opportunity Alert
                </span>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded border border-emerald-200">
                  +$15,600 Potential Spot Profit
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Grid power price spikes to <strong>$145/MWh at 17:30</strong>. Increasing plant output from <strong>462 MW to 495 MW</strong> during this 2-hour window will capture an additional <strong>+$15,600 in spot profit</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onScheduleRamp}
            disabled={isRampScheduled}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              isRampScheduled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30'
            }`}
          >
            {isRampScheduled ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Peak Ramp Scheduled (+495 MW)</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Schedule Peak Ramp-Up (Save/Earn +$15.6K)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Transparent AI Reasoning Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Action-Oriented AI Prescriptions
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Strict Transparent AI Reasoning (Observation • Root Cause • Trade-off)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition ${
                rec.isExecuted 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : rec.badgeColor === 'amber'
                  ? 'border-amber-200 hover:border-amber-300'
                  : rec.badgeColor === 'blue'
                  ? 'border-blue-200 hover:border-blue-300'
                  : 'border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      rec.badgeColor === 'amber'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : rec.badgeColor === 'blue'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {rec.tag}
                    </span>
                    {rec.isExecuted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Executed
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {rec.title}
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                      👁️ What AI Observed:
                    </span>
                    <p className="text-slate-600 leading-snug">
                      {rec.observed}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                      🔍 Root Cause:
                    </span>
                    <p className="text-slate-600 leading-snug">
                      {rec.rootCause}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200">
                    <span className="font-bold block text-[11px] mb-0.5 text-slate-900">
                      💰 Financial & Reliability Impact:
                    </span>
                    <p className="font-medium text-slate-700 leading-snug">
                      {rec.impactValue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => onExecuteRecommendation(rec)}
                  disabled={rec.isExecuted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    rec.isExecuted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20'
                  }`}
                >
                  {rec.isExecuted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Action Dispatched via SCADA</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>{rec.actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
