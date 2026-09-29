import React, { useState, useEffect } from 'react';
import { X, Plus, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CaseItem, CaseSeverity, CaseStatus } from '../types';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCase: Omit<CaseItem, 'id' | 'timestamp' | 'telemetryPoints'>) => void;
  equipmentOptions?: string[];
  engineerOptions?: string[];
  defaultEquipment?: string;
  defaultAssignee?: string;
  titlePlaceholder?: string;
}

const DEFAULT_EQUIPMENT_OPTIONS = [
  'Gas Turbine GT-1',
  'Gas Turbine GT-2',
  'Steam Turbine ST-1',
  'GSU Step-Up Transformer T-01',
  'Boiler Feed Pump BFP-1',
  'Turbine Lube Oil Skid'
];

const DEFAULT_ENGINEER_OPTIONS = [
  'Bob Smith',
  'Alice Johnson',
  'Charlie Davis',
  'Unassigned'
];

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentOptions,
  engineerOptions,
  defaultEquipment,
  defaultAssignee,
  titlePlaceholder
}) => {
  const activeEquipList = equipmentOptions || DEFAULT_EQUIPMENT_OPTIONS;
  const activeEngList = engineerOptions || DEFAULT_ENGINEER_OPTIONS;

  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState(defaultEquipment || activeEquipList[0]);
  const [severity, setSeverity] = useState<CaseSeverity>('High');
  const [assignee, setAssignee] = useState(defaultAssignee || activeEngList[0]);
  const [status, setStatus] = useState<CaseStatus>('Unassigned');
  const [rootCause, setRootCause] = useState('');
  const [parts, setParts] = useState('');
  const [metricName, setMetricName] = useState('Exhaust Temperature Spread');
  const [observedValue, setObservedValue] = useState('26°C');
  const [thresholdValue, setThresholdValue] = useState('18°C');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setEquipment(defaultEquipment || (equipmentOptions && equipmentOptions[0]) || DEFAULT_EQUIPMENT_OPTIONS[1]);
      setSeverity('High');
      setAssignee(defaultAssignee || (engineerOptions && engineerOptions[0]) || DEFAULT_ENGINEER_OPTIONS[0]);
      setStatus('Unassigned');
      setRootCause('');
      setParts('');
    }
  }, [isOpen, defaultEquipment, defaultAssignee, equipmentOptions, engineerOptions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      equipment,
      severity,
      assignee,
      status,
      rootCause: rootCause || 'Preliminary anomaly flagged by operator visual & acoustic walk-through.',
      requiredParts: parts ? parts.split(',').map(p => p.trim()) : ['Standard Diagnostic Multimeter Kit', 'Thermal Imaging Camera'],
      estimatedTime: '2.5 Hours',
      metricName,
      observedValue,
      thresholdValue
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Log New Machinery Investigation Case
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Creates an interactive work order ticket in the Cases Board
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Case Investigation Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder || "e.g. GT-2 Nozzle valve drift & combustion asymmetry"}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Target Machinery
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {activeEquipList.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as CaseSeverity)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Critical">Critical (Immediate Trip Risk)</option>
                <option value="High">High (Derate / Thermal Limit)</option>
                <option value="Medium">Medium (Efficiency / Wear)</option>
                <option value="Low">Low (Routine Check)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Lead Reliability Engineer
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {activeEngList.map((eng) => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Initial Board Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Diagnosing">Diagnosing</option>
                <option value="Planned Maintenance">Planned Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Diagnostic Notes & Symptoms
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Observed temperature spread, vibration frequency harmonics, or actuator drift..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Spare Parts Kit (Comma separated)
            </label>
            <input
              type="text"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="e.g. Replacement Nozzle Kit #GE-7F, Servo Valve O-Rings"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Case Ticket</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
