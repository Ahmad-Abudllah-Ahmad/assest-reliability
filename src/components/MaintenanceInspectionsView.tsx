import React, { useState } from 'react';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  FileText, 
  Download, 
  UserCheck, 
  Camera, 
  FlaskConical, 
  Activity, 
  Eye, 
  ShieldAlert, 
  ChevronRight,
  ClipboardCheck,
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { 
  AssetMaintenanceRecord, 
  UnresolvedAlertInspection, 
  CompletedInspection 
} from '../types';

interface MaintenanceInspectionsViewProps {
  maintenanceRecords: AssetMaintenanceRecord[];
  unresolvedInspections: UnresolvedAlertInspection[];
  completedInspections: CompletedInspection[];
  onScheduleInspection: (inspection: UnresolvedAlertInspection) => void;
  onViewReport: (inspection: CompletedInspection) => void;
  onNavigateToCatalog?: () => void;
}

export const MaintenanceInspectionsView: React.FC<MaintenanceInspectionsViewProps> = ({
  maintenanceRecords,
  unresolvedInspections,
  completedInspections,
  onScheduleInspection,
  onViewReport,
  onNavigateToCatalog
}) => {
  const [activeInspectionTab, setActiveInspectionTab] = useState<'all' | 'high' | 'medium'>('all');

  const getCycleStatusBadge = (status: 'on_schedule' | 'due_soon' | 'overdue', label: string) => {
    switch (status) {
      case 'on_schedule':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {label}
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {label}
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            {label}
          </span>
        );
    }
  };

  const filteredInspections = unresolvedInspections.filter(i => {
    if (activeInspectionTab === 'high' && i.urgency !== 'High') return false;
    if (activeInspectionTab === 'medium' && i.urgency !== 'Medium') return false;
    return true;
  });

  // Render Section A: Overhaul Schedule Table
  const renderScheduleTable = (compact = false) => (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs flex flex-col min-h-0 overflow-hidden">
      <div className="px-2.5 py-1 2xl:py-1.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Section A: Asset Maintenance Records &amp; Overhaul Schedule
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-750 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {maintenanceRecords.length} Assets Tracked
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700/60 text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-1 px-2.5 sm:px-3">Asset Tag &amp; Subsystem</th>
              <th className="py-1 px-2.5 sm:px-3">EOH</th>
              <th className="py-1 px-2.5 sm:px-3">Last Maintenance Done</th>
              <th className="py-1 px-2.5 sm:px-3">Next Scheduled Service</th>
              <th className="py-1 px-2.5 sm:px-3 text-right">Cycle Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200 font-medium">
            {maintenanceRecords.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                <td className="py-0.5 2xl:py-1 px-2.5 sm:px-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] sm:text-[11.5px] leading-tight">
                    {rec.assetName}
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 inline-block">
                    {rec.assetTag}
                  </span>
                </td>
                <td className="py-0.5 2xl:py-1 px-2.5 sm:px-3 font-mono text-[11px]">
                  {rec.eoh}
                </td>
                <td className="py-0.5 2xl:py-1 px-2.5 sm:px-3 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[9px] font-mono">{rec.lastMaintenanceDate}</div>
                  <div className="text-slate-700 dark:text-slate-300 text-[10px] leading-tight">{rec.lastMaintenanceType}</div>
                </td>
                <td className="py-0.5 2xl:py-1 px-2.5 sm:px-3 text-xs">
                  <div className="text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold">{rec.nextServiceDate}</div>
                  <div className="text-slate-900 dark:text-slate-100 text-[10px] font-semibold leading-tight">{rec.nextServiceType}</div>
                </td>
                <td className="py-0.5 2xl:py-1 px-2.5 sm:px-3 text-right">
                  {getCycleStatusBadge(rec.cycleStatus, rec.cycleStatusLabel)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Section B: Inspection Queue Cards
  const renderInspectionQueue = () => (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs flex flex-col min-h-0 overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Section B: Unresolved Alerts Queue ({filteredInspections.length})
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-750 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setActiveInspectionTab('all')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              activeInspectionTab === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All (3)
          </button>
          <button
            onClick={() => setActiveInspectionTab('high')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              activeInspectionTab === 'high'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            High (2)
          </button>
          <button
            onClick={() => setActiveInspectionTab('medium')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              activeInspectionTab === 'medium'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Med (1)
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2">
        {filteredInspections.map((alert) => {
          const isHigh = alert.urgency === 'High';

          return (
            <div
              key={alert.id}
              className={`bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs gap-1 sm:gap-1.5 ${
                filteredInspections.length === 3 ? 'flex-1 min-h-0' : 'flex-initial'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[9.5px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 shrink-0">
                    {alert.id}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    Asset: <strong className="text-slate-800 dark:text-slate-200">{alert.asset}</strong>
                  </span>
                </div>

                <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                  isHigh
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20'
                }`}>
                  {alert.urgency}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 shrink-0">
                {alert.title}
              </h4>

              {/* Sensor Finding & Root Cause Combined Container */}
              <div className="p-1 sm:p-1.5 rounded bg-white dark:bg-slate-750/90 border border-slate-200/80 dark:border-slate-700 text-[9.5px] sm:text-[10px] leading-snug space-y-0.5 sm:space-y-1">
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="text-[8.5px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                    Sensor Telemetry Finding
                  </span>
                  <span className="line-clamp-2">{alert.telemetryFinding}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5 sm:pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[9px] sm:text-[9.5px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Root Cause:</span>
                  <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                    {alert.rootCauseStatus}
                  </span>
                </div>
              </div>

              {/* Inspection Type & Detail */}
              <div className="text-[9.5px] sm:text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium shrink-0 min-w-0">
                {alert.id === 'INS-101' && <Camera className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                {alert.id === 'INS-102' && <FlaskConical className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                {alert.id === 'INS-103' && <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">{alert.requiredInspectionType}:</span>
                <span className="truncate">{alert.inspectionDetail}</span>
              </div>

              {/* Window, Inspector & Action Button */}
              <div className="pt-1 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 shrink-0">
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {alert.targetWindow} • {alert.leadInspector}
                </div>

                <button
                  onClick={() => onScheduleInspection(alert)}
                  className="flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-md text-[9.5px] sm:text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-2xs transition cursor-pointer shrink-0 active:scale-95"
                >
                  <Wrench className="h-2.5 w-2.5" />
                  <span>{alert.actionLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Section C: Completed History Table
  const renderHistoryTable = (compact = false) => (
    <div className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs flex flex-col min-h-0 overflow-hidden">
      <div className="px-2.5 sm:px-3 py-1 2xl:py-1.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Section C: Completed Inspection History Log
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-750 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {completedInspections.length} Archived Logs
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700/60 text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-1 px-2.5 sm:px-3">Log ID</th>
              <th className="py-1 px-2.5 sm:px-3">Target Asset</th>
              <th className="py-1 px-2.5 sm:px-3">Date</th>
              <th className="py-1 px-2.5 sm:px-3">Inspector</th>
              <th className="py-1 px-2.5 sm:px-3">Survey Findings Summary</th>
              <th className="py-1 px-2.5 sm:px-3 text-right">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200 font-medium">
            {completedInspections.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onViewReport(item)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition cursor-pointer group"
              >
                <td className="py-1 2xl:py-1.5 px-2.5 sm:px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  {item.id}
                </td>
                <td className="py-1 2xl:py-1.5 px-2.5 sm:px-3 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] group-hover:text-blue-600 transition-colors">
                  {item.asset}
                </td>
                <td className="py-1 2xl:py-1.5 px-2.5 sm:px-3 font-mono text-slate-500 dark:text-slate-400 text-[10px]">
                  {item.inspectionDate}
                </td>
                <td className="py-1 2xl:py-1.5 px-2.5 sm:px-3 font-medium text-slate-700 dark:text-slate-300 text-[10.5px]">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    {item.inspector}
                  </span>
                </td>
                <td className="py-1 2xl:py-1.5 px-2.5 sm:px-3 text-[10.5px] leading-snug">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{item.inspectionType}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[9.5px] sm:text-[10px] leading-normal">{item.findings}</div>
                </td>
                <td className="py-1 2xl:py-1.5 px-2.5 sm:px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewReport(item);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                  >
                    <Download className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-1.5 2xl:gap-2.5 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 sm:py-2 shadow-xs flex items-center justify-between gap-2.5 shrink-0">
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
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Maintenance Records &amp; Physical Asset Inspections
          </h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 2xl:gap-2.5 flex-1 min-h-0">
        {/* Left Column (7 cols): Section A Overhaul Table + Section C Audit Table */}
        <div className="lg:col-span-7 flex flex-col gap-1.5 2xl:gap-2.5 min-h-0 h-full">
          <div className="flex-[1.4_1.4_0%] min-h-0 flex flex-col">
            {renderScheduleTable(true)}
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {renderHistoryTable(true)}
          </div>
        </div>

        {/* Right Column (5 cols): Section B Inspection Queue */}
        <div className="lg:col-span-5 h-full min-h-0 flex flex-col">
          {renderInspectionQueue()}
        </div>
      </div>
    </div>
  );
};
