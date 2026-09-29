import React from 'react';
import { 
  X, 
  Sparkles, 
  Wrench, 
  Activity, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { CaseItem, CaseStatus } from '../types';

interface InvestigationDrawerProps {
  selectedCase: CaseItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: CaseStatus) => void;
  onDispatchAction: (caseItem: CaseItem) => void;
}

export const InvestigationDrawer: React.FC<InvestigationDrawerProps> = ({
  selectedCase,
  onClose,
  onUpdateStatus,
  onDispatchAction
}) => {
  if (!selectedCase) return null;

  const isClosed = selectedCase.status === 'Closed';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full sm:w-[540px] md:w-[600px] h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl animate-slideLeft text-slate-900 dark:text-slate-100 rounded-l-2xl sm:rounded-l-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/90 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {selectedCase.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Equipment: <strong className="text-slate-700 dark:text-slate-300">{selectedCase.equipment}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Section 1: AI-Extracted Telemetry Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Incident SCADA Telemetry Stream ({selectedCase.metricName})
              </span>
              <span className="font-mono text-xs">
                Observed: <strong className="text-rose-600 dark:text-rose-400">{selectedCase.observedValue}</strong> (Limit: {selectedCase.thresholdValue})
              </span>
            </div>

            {(() => {
              const baselineVal = selectedCase.telemetryPoints[0]?.baseline || 18;
              const values = selectedCase.telemetryPoints.map(p => p.value);
              const maxVal = Math.max(...values, baselineVal);
              const minVal = Math.min(...values, baselineVal);
              const unit = selectedCase.telemetryPoints[0]?.unit || 'MW';
              // Headroom: if values are MW (e.g. 480 MW in CAS-005), use [220, 520] for 40 MW breathing room above 480
              const yDomain: [number, number] = maxVal > 100 
                ? [220, 520] 
                : [Math.max(0, Math.floor(minVal * 0.7)), Math.ceil(maxVal * 1.35)];

              return (
                <div className="h-52 w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pt-3 pb-2 px-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedCase.telemetryPoints} margin={{ top: 28, right: 24, left: -10, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} domain={yDomain} />
                      <Tooltip 
                        allowEscapeViewBox={{ x: true, y: true }}
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          color: '#f8fafc',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                        }} 
                      />
                      <ReferenceLine 
                        y={baselineVal} 
                        stroke="#f43f5e" 
                        strokeDasharray="4 4" 
                        label={{ 
                          value: `Trip Threshold (${baselineVal} ${unit})`.trim(), 
                          fill: "#f43f5e", 
                          fontSize: 10, 
                          position: "top", 
                          offset: 6 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2.5} 
                        dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: '#2563eb' }}
                        name="Sensor Value" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>

          {/* Section 2: AI Root Cause Hypothesis */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              AI Root Cause Hypothesis & Physics Model
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedCase.rootCause}
            </p>
          </div>

          {/* Section 3: Required Tools & Spare Parts Kit */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              Required Tools & Pre-Requisitioned Spare Parts
            </div>
            <div className="space-y-1.5">
              {selectedCase.requiredParts.map((part, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{part}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    In Stock (Whse 2)
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              aria-label="Change case status"
              value={selectedCase.status}
              onChange={(e) => onUpdateStatus(selectedCase.id, e.target.value as CaseStatus)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Unassigned">Unassigned</option>
              <option value="Diagnosing">Diagnosing</option>
              <option value="Planned Maintenance">Planned Maintenance</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <button
            onClick={() => onDispatchAction(selectedCase)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition cursor-pointer"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Dispatch Work Order WO-{selectedCase.id.replace('CAS-', '')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
