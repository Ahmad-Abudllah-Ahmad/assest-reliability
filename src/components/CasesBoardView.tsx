import React, { useState } from 'react';
import { 
  Plus, 
  ChevronDown, 
  Layers, 
  ArrowLeft,
  GripVertical
} from 'lucide-react';
import { CaseItem, CaseStatus, CaseSeverity } from '../types';

interface CasesBoardViewProps {
  cases: CaseItem[];
  onOpenCreateModal: () => void;
  onSelectCase: (c: CaseItem) => void;
  onUpdateCaseStatus: (id: string, newStatus: CaseStatus) => void;
  onUpdateCaseSeverity?: (id: string, newSeverity: CaseSeverity) => void;
  onNavigateToCatalog?: () => void;
}

interface ColumnConfig {
  status: CaseStatus;
  label: string;
  badgeStyle: string;
  headerBorder: string;
}

const COLUMNS: ColumnConfig[] = [
  { 
    status: 'Unassigned', 
    label: 'UNASSIGNED', 
    badgeStyle: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    headerBorder: 'border-slate-300 dark:border-slate-700' 
  },
  { 
    status: 'Diagnosing', 
    label: 'DIAGNOSING', 
    badgeStyle: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    headerBorder: 'border-blue-400 dark:border-blue-700' 
  },
  { 
    status: 'Planned Maintenance', 
    label: 'PLANNED MAINTENANCE', 
    badgeStyle: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    headerBorder: 'border-amber-400 dark:border-amber-700' 
  },
  { 
    status: 'Closed', 
    label: 'CLOSED', 
    badgeStyle: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    headerBorder: 'border-emerald-400 dark:border-emerald-700' 
  },
];

const SEVERITY_WEIGHT: Record<CaseSeverity, number> = {
  'Critical': 4,
  'High': 3,
  'Medium': 2,
  'Low': 1,
};

export const CasesBoardView: React.FC<CasesBoardViewProps> = ({
  cases,
  onOpenCreateModal,
  onSelectCase,
  onUpdateCaseStatus,
  onUpdateCaseSeverity,
  onNavigateToCatalog
}) => {
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<CaseStatus | null>(null);

  const getSeverityBadge = (severity: CaseSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      case 'Low':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn select-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 2xl:p-3 shadow-xs shrink-0">
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
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Cases Board
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              Investigate machine condition alerts, assign engineers, and drag tasks across workflow stages
            </p>
          </div>
        </div>

        {/* Quick Action: Log New Case */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log New Case</span>
          </button>
        </div>
      </div>

      {/* 4 Distinct Workflow Columns with Drag and Drop Support */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 2xl:gap-3 items-stretch">
        {COLUMNS.map((col) => {
          // Sort tasks within stack by severity weight in real time (Critical -> High -> Medium -> Low)
          const columnCases = cases
            .filter(c => c.status === col.status)
            .sort((a, b) => {
              const weightDiff = (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
              if (weightDiff !== 0) return weightDiff;
              return a.id.localeCompare(b.id);
            });

          const isOverThisCol = dragOverColumn === col.status;

          return (
            <div 
              key={col.status} 
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverColumn !== col.status) {
                  setDragOverColumn(col.status);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  if (dragOverColumn === col.status) {
                    setDragOverColumn(null);
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const caseId = e.dataTransfer.getData('text/plain') || draggedCaseId;
                if (caseId) {
                  onUpdateCaseStatus(caseId, col.status);
                }
                setDraggedCaseId(null);
                setDragOverColumn(null);
              }}
              className={`w-full bg-slate-100/70 dark:bg-slate-900/60 border rounded-2xl p-2.5 flex flex-col h-full min-h-0 transition-all duration-200 ${
                isOverThisCol
                  ? 'ring-2 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 scale-[1.008]'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800 px-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border shadow-xs ${col.badgeStyle}`}>
                    {columnCases.length}
                  </span>
                </div>
              </div>

              {/* Cases Cards List */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
                {columnCases.length === 0 ? (
                  <div className={`h-28 flex flex-col items-center justify-center text-xs border-2 border-dashed rounded-xl p-3 text-center transition-colors ${
                    isOverThisCol 
                      ? 'border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 font-semibold' 
                      : 'text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                  }`}>
                    <span>No cases in this stage</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {isOverThisCol ? 'Drop task here to move stage' : 'Drag task here or select stage to transfer'}
                    </span>
                  </div>
                ) : (
                  columnCases.map((caseItem) => {
                    const isBeingDragged = draggedCaseId === caseItem.id;

                    return (
                      <div
                        key={caseItem.id}
                        draggable={true}
                        onDragStart={(e) => {
                          setDraggedCaseId(caseItem.id);
                          e.dataTransfer.setData('text/plain', caseItem.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDraggedCaseId(null);
                          setDragOverColumn(null);
                        }}
                        onClick={() => onSelectCase(caseItem)}
                        className={`w-full bg-white dark:bg-slate-800 border rounded-xl p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col justify-between space-y-2 group ${
                          isBeingDragged
                            ? 'opacity-40 scale-95 border-dashed border-blue-500 shadow-xl'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {/* Top Row: Green Case ID Badge (CAS-002 removed per user request) & Severity Dropdown */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors shrink-0" />
                            {caseItem.id !== 'CAS-002' ? (
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-[11px] bg-emerald-500/10 dark:bg-emerald-950/40 px-2 py-0.2 rounded-md border border-emerald-500/20">
                                {caseItem.id}
                              </span>
                            ) : (
                              <div />
                            )}
                          </div>

                          {/* Interactive Priority/Severity Dropdown: changes move task up/down in real time */}
                          <div 
                            className="relative flex-shrink-0" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              aria-label={`Change severity for ${caseItem.id}`}
                              value={caseItem.severity}
                              onChange={(e) => onUpdateCaseSeverity?.(caseItem.id, e.target.value as CaseSeverity)}
                              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border cursor-pointer appearance-none pr-4.5 transition focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs ${getSeverityBadge(caseItem.severity)}`}
                              title="Click to change task severity (moves task up/down in real time)"
                            >
                              <option value="Critical" className="bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 font-bold">Critical</option>
                              <option value="High" className="bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold">High</option>
                              <option value="Medium" className="bg-white dark:bg-slate-800 text-yellow-700 dark:text-yellow-300 font-semibold">Medium</option>
                              <option value="Low" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">Low</option>
                            </select>
                            <ChevronDown className="h-2.5 w-2.5 text-current absolute right-1.5 top-1.5 pointer-events-none opacity-70" />
                          </div>
                        </div>

                        {/* Middle: Bold Font Title & Equipment Subtitle */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {caseItem.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                            <span>{caseItem.equipment}</span>
                          </p>
                        </div>

                        {/* Footer: Assignee & Inline Status Dropdown Selector */}
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-500 dark:text-slate-400 truncate font-medium text-[11px]">
                            By: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{caseItem.assignee}</strong>
                          </span>

                          {/* Inline Status Dropdown Selector */}
                          <div 
                            className="relative flex-shrink-0" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              aria-label={`Change status for ${caseItem.id}`}
                              value={caseItem.status}
                              onChange={(e) => onUpdateCaseStatus(caseItem.id, e.target.value as CaseStatus)}
                              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer pr-5 appearance-none transition"
                            >
                              <option value="Unassigned">Unassigned</option>
                              <option value="Diagnosing">Diagnosing</option>
                              <option value="Planned Maintenance">Planned Maint</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
