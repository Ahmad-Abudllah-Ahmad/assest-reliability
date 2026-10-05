import React, { useState } from 'react';
import { 
  KanbanSquare, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  ArrowRight,
  GripVertical,
  Check
} from 'lucide-react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { WorkOrderRecord } from '../types';

interface ColumnConfig {
  stage: WorkOrderRecord['stage'];
  label: string;
  badgeStyle: string;
  headerBorder: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    stage: 'Unassigned',
    label: 'UNASSIGNED',
    badgeStyle: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    headerBorder: 'border-slate-300 dark:border-slate-700'
  },
  {
    stage: 'Diagnosing',
    label: 'DIAGNOSING',
    badgeStyle: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    headerBorder: 'border-blue-400 dark:border-blue-700'
  },
  {
    stage: 'Planned Maintenance',
    label: 'PLANNED MAINTENANCE',
    badgeStyle: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    headerBorder: 'border-amber-400 dark:border-amber-700'
  },
  {
    stage: 'Closed',
    label: 'CLOSED & VERIFIED',
    badgeStyle: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    headerBorder: 'border-emerald-400 dark:border-emerald-700'
  }
];

export const CcgtWorkOrdersView: React.FC = () => {
  const {
    workOrders,
    setSelectedWorkOrder,
    setCompletingWorkOrder,
    updateWorkOrderStage
  } = useCcgtReliability();

  const [draggedWoNumber, setDraggedWoNumber] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WorkOrderRecord['stage'] | null>(null);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3 animate-fadeIn select-none">
      
      {/* Compact Utility Row (Page Title Banner Removed per Part C & H) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <KanbanSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Maintenance Execution Kanban
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Alert → Prescriptive Recommendation → Approval → Execution → Feedback Loop
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {workOrders.filter(w => w.stage !== 'Closed').length} Active Work Orders
          </span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 2xl:gap-3 items-stretch">
        {COLUMNS.map((col) => {
          const columnOrders = workOrders.filter(w => w.stage === col.stage);
          const isOver = dragOverColumn === col.stage;

          return (
            <div
              key={col.stage}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(col.stage);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedWoNumber) {
                  updateWorkOrderStage(draggedWoNumber, col.stage);
                  setDraggedWoNumber(null);
                  setDragOverColumn(null);
                }
              }}
              className={`rounded-xl border p-2.5 flex flex-col min-h-0 transition-colors ${
                isOver 
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-400' 
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${col.headerBorder} shrink-0`}>
                <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                  {col.label}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${col.badgeStyle}`}>
                  {columnOrders.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
                {columnOrders.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-slate-400 text-xs italic border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    No tickets in this stage
                  </div>
                ) : (
                  columnOrders.map((wo) => {
                    const isClosed = wo.stage === 'Closed';

                    return (
                      <div
                        key={wo.woNumber}
                        draggable
                        onDragStart={() => setDraggedWoNumber(wo.woNumber)}
                        onClick={() => setSelectedWorkOrder(wo)}
                        className="bg-slate-50 dark:bg-slate-750/70 border border-slate-200/90 dark:border-slate-700 rounded-xl p-3 space-y-2 shadow-2xs hover:shadow-sm hover:border-blue-400 transition cursor-grab active:cursor-grabbing"
                      >
                        {/* Top Card Row */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {wo.woNumber}
                          </span>
                          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            wo.priority === 'P1' || wo.priority === 'P2' 
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          }`}>
                            {wo.priority} • {wo.riskLevel}
                          </span>
                        </div>

                        {/* Title & Asset */}
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold block">
                            {wo.assetCode} — {wo.assetName}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5">
                            {wo.issueTitle}
                          </h4>
                        </div>

                        {/* Telemetry Indicator Summary */}
                        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200/80 dark:border-slate-700 truncate">
                          Source: {wo.sourceTelemetrySummary || wo.sourceAlertId}
                        </div>

                        {/* Footer Card Info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[90px]">{wo.assignedEngineer}</span>
                          </span>

                          <span className="flex items-center gap-1 text-[10px] font-mono">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{wo.dueDate}</span>
                          </span>
                        </div>

                        {/* Complete Maintenance CTA button if not closed */}
                        {!isClosed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCompletingWorkOrder(wo);
                            }}
                            className="w-full mt-1 py-1 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Complete &amp; Record Feedback</span>
                          </button>
                        )}
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
