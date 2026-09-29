import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Wrench,
  Bot,
  HelpCircle,
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';

export interface PlainEnglishInsightItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  plainEnglishSummary: string;
  financialOrTimeImpact: string;
  aiRecommendation: string;
  actionButtonText: string;
  caseId?: string;
  onActionClick: () => void;
}

interface PlainEnglishAiInsightsProps {
  facilityName: string;
  insights: PlainEnglishInsightItem[];
  onOpenJargonGuide?: () => void;
  onAskCopilot?: (question: string) => void;
}

export const PlainEnglishAiInsights: React.FC<PlainEnglishAiInsightsProps> = ({
  facilityName,
  insights,
  onOpenJargonGuide,
  onAskCopilot
}) => {
  return (
    <section 
      aria-label="AI Operator Intelligence in Plain English"
      className="w-full bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-800/90 dark:via-slate-800 dark:to-slate-800/80 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Spark AI Intelligence Center — Plain English Insights
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                Zero Jargon
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live automated diagnostics for <span className="font-semibold text-slate-700 dark:text-slate-300">{facilityName}</span> translated into everyday language.
            </p>
          </div>
        </div>

        {onOpenJargonGuide && (
          <button
            onClick={onOpenJargonGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition cursor-pointer self-start sm:self-auto"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Need Help? Terms Glossary</span>
          </button>
        )}
      </div>

      {/* 3 Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item) => {
          const isCrit = item.severity === 'critical';
          const isWarn = item.severity === 'warning';

          const cardBorder = isCrit 
            ? 'border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20' 
            : isWarn 
            ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20' 
            : 'border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800/80';

          const badgeBg = isCrit
            ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
            : isWarn
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';

          return (
            <div 
              key={item.id}
              className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3.5 transition hover:shadow-md ${cardBorder}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badgeBg}`}>
                    {isCrit ? '⚠️ High Priority' : isWarn ? '⚡ Attention Recommended' : '💡 Optimization Tip'}
                  </span>
                  {item.caseId && (
                    <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {item.caseId}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {item.title}
                </h3>
              </div>

              {/* 3 Clear Sections: What Happened -> Impact -> Recommendation */}
              <div className="space-y-2 text-xs">
                {/* 1. What Happened */}
                <div className="bg-white/80 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    What is happening (Simple Words)
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {item.plainEnglishSummary}
                  </p>
                </div>

                {/* 2. Impact */}
                <div className="bg-white/80 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Money / Downtime Impact
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                      {item.financialOrTimeImpact}
                    </strong>
                  </div>
                </div>

                {/* 3. Recommendation */}
                <div className="bg-white/80 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block mb-0.5">
                    What AI recommends you do next
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {item.aiRecommendation}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={item.onActionClick}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer mt-1"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>{item.actionButtonText}</span>
                <ArrowRight className="h-3 w-3 ml-auto" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
