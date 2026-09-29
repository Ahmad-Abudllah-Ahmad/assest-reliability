import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sliders, 
  Snowflake, 
  RotateCcw,
  Zap,
  DollarSign,
  Clock,
  ArrowRight
} from 'lucide-react';
import { RecommendationCard } from '../types';

interface AiRecommendationHubProps {
  recommendations: RecommendationCard[];
  onExecuteRecommendation: (rec: RecommendationCard) => void;
}

export const AiRecommendationHub: React.FC<AiRecommendationHubProps> = ({
  recommendations,
  onExecuteRecommendation
}) => {
  return (
    <section aria-label="Action-Oriented AI Recommendation Hub" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Transparent AI Recommendation Hub (Action-Oriented Workflows)
          </h2>
          <p className="text-xs text-slate-500">
            Real-time prescriptive operational adjustments with transparent observations, root causes, and one-click execution.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
          3 Active Prescriptions
        </span>
      </div>

      {/* 3 High-Impact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const isBlue = rec.badgeColor === 'blue';
          const isEmerald = rec.badgeColor === 'emerald';
          const isAmber = rec.badgeColor === 'amber';

          return (
            <div
              key={rec.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition ${
                rec.isExecuted 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : isAmber 
                  ? 'border-amber-200 hover:border-amber-300' 
                  : isBlue 
                  ? 'border-blue-200 hover:border-blue-300' 
                  : 'border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge & Title */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isAmber
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : isBlue
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
                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {rec.title}
                  </h3>
                </div>

                {/* Structured Transparent AI Reasoning */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  
                  {/* What AI Observed */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                      👁️ What AI Observed:
                    </span>
                    <p className="text-slate-600 leading-snug">
                      {rec.observed}
                    </p>
                  </div>

                  {/* Root Cause */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                      🔍 Root Cause:
                    </span>
                    <p className="text-slate-600 leading-snug">
                      {rec.rootCause}
                    </p>
                  </div>

                  {/* Impact / Financial Opportunity */}
                  <div className={`p-2.5 rounded-lg border ${
                    isAmber 
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                      : isBlue
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="font-bold block text-[11px] mb-0.5">
                      {rec.impactLabel === 'Financial Opportunity' ? '💰 Financial Opportunity:' : '⚠️ ' + rec.impactLabel + ':'}
                    </span>
                    <p className="font-medium leading-snug">
                      {rec.impactValue}
                    </p>
                  </div>

                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => onExecuteRecommendation(rec)}
                  disabled={rec.isExecuted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    rec.isExecuted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                      : isAmber
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/20'
                      : isBlue
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
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
          );
        })}
      </div>
    </section>
  );
};
