import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  AlertTriangle,
  FileCheck,
  Package
} from 'lucide-react';
import { OgCaseItem, OgCaseStatus } from '../../types/oilGasTypes';
import { OilGasPageHeader } from './OilGasPageHeader';

interface OilGasCasesViewProps {
  cases: OgCaseItem[];
  onSelectCase: (c: OgCaseItem) => void;
  onUpdateCaseStatus: (id: string, newStatus: OgCaseStatus) => void;
  onOpenCreateModal: () => void;
}

const COLUMNS: { status: OgCaseStatus; label: string; subLabel: string; badgeStyle: string }[] = [
  { status: 'Unassigned', label: '1. Safety Review', subLabel: 'Permits waiting for safety signoff', badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  { status: 'Diagnosing', label: '2. Being Investigated', subLabel: 'Technicians diagnosing machine', badgeStyle: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
  { status: 'Planned Maintenance', label: '3. Work In Progress', subLabel: 'Repair crew active on deck', badgeStyle: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
  { status: 'Closed', label: '4. Fixed & Complete', subLabel: 'Repairs finished & verified safe', badgeStyle: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' }
];

export const OilGasCasesView: React.FC<OilGasCasesViewProps> = ({
  cases,
  onSelectCase,
  onUpdateCaseStatus,
  onOpenCreateModal
}) => {
  const activeCasesCount = cases.filter(c => c.status !== 'Closed').length;

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn">
      {/* Page Title: Work Orders & PTW Safety Permits */}
      <div className="shrink-0">
        <OilGasPageHeader
          title="Work Orders & PTW Safety Permits"
          subtitle="Permit to Work (PTW) safety approval board, deck maintenance execution, and equipment repair tracking"
          icon={FileCheck}
          badgeText={`${activeCasesCount} Active`}
          badgeColor={activeCasesCount > 0 ? 'amber' : 'emerald'}
          actions={
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Work Order</span>
            </button>
          }
        />
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 2xl:gap-2.5 flex-1 min-h-0 items-stretch">
        {COLUMNS.map((col) => {
          const columnCases = cases.filter(c => c.status === col.status);

          return (
            <div
              key={col.status}
              className="w-full bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col h-full min-h-0"
            >
              {/* Column Title */}
              <div className="pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800 px-1 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border shadow-2xs ${col.badgeStyle}`}>
                    {columnCases.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{col.subLabel}</p>
              </div>

              {/* Case Cards List */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
                {columnCases.length === 0 ? (
                  <div className="h-24 flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                    <span className="text-[11px]">No active permits</span>
                  </div>
                ) : (
                  columnCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      onClick={() => onSelectCase(caseItem)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-2.5 shadow-2xs hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-[10.5px] bg-emerald-500/10 dark:bg-emerald-950/40 px-2 py-0.2 rounded border border-emerald-500/20">
                          {caseItem.id}
                        </span>
                        <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.2 rounded-full border bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          {caseItem.permitRequired}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                          {caseItem.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 font-medium truncate">
                          {caseItem.equipment}
                        </p>
                      </div>

                      {/* Diagnostic Exceedance */}
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-750/70 border border-slate-100 dark:border-slate-700/60 text-[10.5px]">
                        <span className="text-slate-400 block text-[9.5px]">{caseItem.metricName}:</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-mono text-[11px]">{caseItem.observedValue}</strong>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs gap-2 shrink-0">
                        <span className="text-slate-500 dark:text-slate-400 truncate text-[10.5px]">
                          Lead: <strong className="text-slate-700 dark:text-slate-200">{caseItem.assignee.split(' ')[0]}</strong>
                        </span>

                        <div 
                          className="relative flex-shrink-0" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={caseItem.status}
                            onChange={(e) => onUpdateCaseStatus(caseItem.id, e.target.value as OgCaseStatus)}
                            className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10.5px] font-semibold rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer pr-4 appearance-none transition"
                          >
                            <option value="Unassigned">Review</option>
                            <option value="Diagnosing">Diagnosing</option>
                            <option value="Planned Maintenance">In-Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <ChevronDown className="h-3 w-3 text-slate-400 absolute right-1 top-1.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
