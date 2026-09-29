import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface OilGasPageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  badgeText?: string;
  badgeColor?: string;
  actions?: React.ReactNode;
  onNavigateToCatalog?: () => void;
}

export const OilGasPageHeader: React.FC<OilGasPageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor = 'emerald',
  actions,
  onNavigateToCatalog
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {onNavigateToCatalog && (
          <button
            onClick={onNavigateToCatalog}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-600/80 shadow-2xs hover:shadow-xs active:scale-90 transition-all duration-200 cursor-pointer shrink-0 group focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Back to Industrial Operations Catalog"
            aria-label="Back to Catalog"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            {badgeText && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                badgeColor === 'emerald'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : badgeColor === 'amber'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    badgeColor === 'emerald' ? 'bg-emerald-400' : badgeColor === 'amber' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    badgeColor === 'emerald' ? 'bg-emerald-500' : badgeColor === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                </span>
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
