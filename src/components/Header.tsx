import { 
  Zap, 
  Activity, 
  RefreshCw, 
  Flame, 
  ClipboardList, 
  Sparkles,
  Sun,
  Moon,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { CaseItem } from '../types';

interface HeaderProps {
  gridFrequency: number;
  currentMW: number;
  targetMW: number;
  heatRate: number;
  cases: CaseItem[];
  isSyncingScada: boolean;
  onSyncScada: () => void;
  lastSyncSeconds: number;
  onOpenCopilot: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenJargonGuide?: () => void;
  simulatedScenario?: {
    code: string;
    name: string;
    totalDropTo: number;
    directLossMW: number;
    cascadingLossMW: number;
  } | null;
  onResetSimulation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gridFrequency,
  currentMW,
  targetMW,
  heatRate,
  cases,
  isSyncingScada,
  onSyncScada,
  lastSyncSeconds,
  onOpenCopilot,
  isDarkMode,
  onToggleTheme,
  onOpenJargonGuide,
  simulatedScenario,
  onResetSimulation
}) => {
  const openCases = cases.filter(c => c.status !== 'Closed');
  const criticalCount = openCases.filter(c => c.severity === 'Critical').length;
  const highCount = openCases.filter(c => c.severity === 'High').length;
  const medCount = openCases.filter(c => c.severity === 'Medium').length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs transition-colors duration-200">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Plant Name & Live Grid Badge */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 flex-shrink-0">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Spark AI
              </h1>
              <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">•</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                500 MW Combined Cycle Block 1
              </span>
              {simulatedScenario ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20 animate-pulse">
                  <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                  Contingency Sim Active ({simulatedScenario.code} Trip)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online (Grid Synchronized: {gridFrequency.toFixed(2)} Hz)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global KPIs & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
          
          {/* Net Output Pill */}
          <div className={`border rounded-xl px-3.5 py-1.5 text-xs flex items-center shadow-2xs transition-colors ${
            simulatedScenario 
              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 dark:border-rose-500/30' 
              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
          }`}>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium mr-1.5">Net Output:</span>
            <span className={`font-mono font-bold text-xs ${simulatedScenario ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {currentMW} MW
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">/ {targetMW} MW</span>
            {simulatedScenario && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 ml-1.5">
                (-{simulatedScenario.directLossMW + simulatedScenario.cascadingLossMW} MW)
              </span>
            )}
          </div>

          {/* Quick Simulation Reset Button */}
          {simulatedScenario && onResetSimulation && (
            <button
              onClick={onResetSimulation}
              title="Reset contingency simulation to live SCADA streams"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-500/20 transition cursor-pointer animate-pulse"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Live (462 MW)</span>
            </button>
          )}

          {/* Heat Rate Pill */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-1.5 text-xs flex items-center shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium mr-1.5">Heat Rate:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">{heatRate.toLocaleString()}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">BTU/kWh</span>
          </div>

          {/* Open Diagnostics Pill */}
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl px-3.5 py-1.5 text-xs flex items-center shadow-2xs">
            <span className="font-semibold mr-1.5 text-xs">Open Cases:</span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">{openCases.length}</span>
            <span className="text-xs text-amber-800/80 dark:text-amber-400/80 ml-1.5 hidden sm:inline">
              ({criticalCount} Crit, {highCount} High, {medCount} Med)
            </span>
          </div>


          {/* Sync SCADA Button */}
          <button
            onClick={onSyncScada}
            disabled={isSyncingScada}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isSyncingScada 
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Force telemetry sync with Plant DCS"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingScada ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Sync SCADA</span>
            <span className="text-[11px] font-mono text-slate-400">({lastSyncSeconds}s)</span>
          </button>

          {/* Dark / Light Mode Sun/Moon Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Operator Avatar */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-700">
            <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              SJ
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
