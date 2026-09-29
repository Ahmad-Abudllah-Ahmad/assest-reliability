import React, { useState, useEffect } from 'react';
import { X, Plus, Cpu, Activity, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MonitoredAsset } from '../types';

export interface NewMachineryData {
  name: string;
  code: string;
  category: string;
  ratedCapacity: string;
  healthScore: number;
  metricLabel: string;
  metricValue: string;
  aiSummary: string;
}

interface AddMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newMachinery: NewMachineryData) => void;
  facilityType?: 'power' | 'wind' | 'solar' | 'oilgas';
}

export const AddMachineryModal: React.FC<AddMachineryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  facilityType = 'power'
}) => {
  const getDefaultValues = () => {
    switch (facilityType) {
      case 'wind':
        return {
          name: 'Wind Turbine WTG-09',
          code: 'WTG-09',
          category: 'High-Speed Planetary Drivetrain',
          ratedCapacity: '4.2 MW Rated',
          healthScore: 98,
          metricLabel: 'Gearbox Vibration',
          metricValue: '1.2 mm/s',
          aiSummary: 'New turbine commissioned. Aerodynamic pitch and generator bearings operating in nominal range.'
        };
      case 'solar':
        return {
          name: 'Solar Inverter INV-09',
          code: 'INV-09',
          category: 'Central Inverter & MPPT',
          ratedCapacity: '3.5 MW / 1500V DC',
          healthScore: 99,
          metricLabel: 'MPPT Efficiency',
          metricValue: '98.8%',
          aiSummary: 'IGBT bridge temperatures balanced. Zero harmonic clipping detected.'
        };
      case 'oilgas':
        return {
          name: 'Flash Gas Compressor C-103',
          code: 'C-103',
          category: 'Centrifugal Gas Compression',
          ratedCapacity: '12,500 HP / 450 psig',
          healthScore: 97,
          metricLabel: 'Discharge Pressure',
          metricValue: '448 psig',
          aiSummary: 'Dry gas seals operating within normal leakage envelope. Lube oil differential pressure nominal.'
        };
      default:
        return {
          name: 'Gas Turbine 3',
          code: 'GT-3',
          category: 'Combustion Turbine',
          ratedCapacity: '160 MW Rated',
          healthScore: 98,
          metricLabel: 'Active Load',
          metricValue: '156 MW',
          aiSummary: 'Commissioned into active telemetry fleet. Thermodynamic efficiency baseline verified.'
        };
    }
  };

  const [form, setForm] = useState(getDefaultValues);

  useEffect(() => {
    if (isOpen) {
      setForm(getDefaultValues());
    }
  }, [isOpen, facilityType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    onAdd(form);
    onClose();
  };

  const getDomainAccent = () => {
    switch (facilityType) {
      case 'wind':
        return { bg: 'bg-cyan-600', ring: 'focus:ring-cyan-500', btn: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20' };
      case 'solar':
        return { bg: 'bg-amber-600', ring: 'focus:ring-amber-500', btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' };
      case 'oilgas':
        return { bg: 'bg-emerald-600', ring: 'focus:ring-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' };
      default:
        return { bg: 'bg-blue-600', ring: 'focus:ring-blue-500', btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' };
    }
  };

  const accent = getDomainAccent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg ${accent.bg} flex items-center justify-center text-white shadow-xs`}>
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Add Machinery or Component
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Register new industrial equipment into real-time condition monitoring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Machinery Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Gas Turbine 3"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Equipment Code / Tag *
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. GT-3"
                className="w-full font-mono bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Category / Subsystem
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Combustion Turbine"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Rated Capacity / Spec
              </label>
              <input
                type="text"
                value={form.ratedCapacity}
                onChange={(e) => setForm(prev => ({ ...prev, ratedCapacity: e.target.value }))}
                placeholder="e.g. 160 MW Rated"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Baseline Health Score ({form.healthScore}%)
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={form.healthScore}
                onChange={(e) => setForm(prev => ({ ...prev, healthScore: parseInt(e.target.value, 10) }))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer mt-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Primary Telemetry Point
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.metricLabel}
                  onChange={(e) => setForm(prev => ({ ...prev, metricLabel: e.target.value }))}
                  placeholder="Metric (e.g. Vibration)"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <input
                  type="text"
                  value={form.metricValue}
                  onChange={(e) => setForm(prev => ({ ...prev, metricValue: e.target.value }))}
                  placeholder="Value (e.g. 1.2 mm/s)"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Initial AI Reliability Diagnostic Summary
            </label>
            <textarea
              rows={2}
              value={form.aiSummary}
              onChange={(e) => setForm(prev => ({ ...prev, aiSummary: e.target.value }))}
              placeholder="Operational assessment summary..."
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-white ${accent.btn} transition cursor-pointer shadow-xs active:scale-95`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Machinery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
