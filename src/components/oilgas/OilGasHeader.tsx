import React from 'react';
import { 
  Anchor, 
  Wind, 
  Waves, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle, 
  Activity, 
  Flame,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface OilGasHeaderProps {
  onSyncScada: () => void;
  isSyncing: boolean;
  onNavigateToCatalog: () => void;
  onOpenJargonGuide?: () => void;
}

export const OilGasHeader: React.FC<OilGasHeaderProps> = ({
  onSyncScada,
  isSyncing,
  onNavigateToCatalog,
  onOpenJargonGuide
}) => {
  return (
    <header className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* Top Banner: Platform Identity + Ocean Metocean Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Platform Identity */}
        <div className="flex items-center gap-3">
          {onNavigateToCatalog && (
            <button
              onClick={onNavigateToCatalog}
              className="h-9 w-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-600/80 shadow-2xs hover:shadow-xs active:scale-90 transition-all duration-200 cursor-pointer shrink-0 group focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              title="Back to Industrial Operations Catalog"
              aria-label="Back to Catalog"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
          )}
          <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30 flex-shrink-0">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Offshore Oil & Gas Platform (FPSO Leviathan Alpha)
              </h1>
              <span className="text-slate-400 font-normal text-xs">•</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gulf Deepwater (1,850m Sea Depth)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Safety Systems Active • All Systems Normal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              4 Subsea Wells ➔ Oil & Gas Separation ➔ Gas Pipeline Export ➔ 750,000 Barrels Hull Storage
            </p>
          </div>
        </div>

        {/* Ocean Weather Status + Quick Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <Waves className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-500">Sea Waves:</span>
            <strong className="font-mono text-slate-800 dark:text-slate-200">1.8m (Calm)</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <Wind className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-500">Wind:</span>
            <strong className="font-mono text-slate-800 dark:text-slate-200">14 knots (Gentle)</strong>
          </div>

          {onOpenJargonGuide && (
            <button
              onClick={onOpenJargonGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
              title="Click to view plain English definitions of all acronyms and terms"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Plain-English Guide</span>
            </button>
          )}

          <button
            onClick={onSyncScada}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Sensor Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
