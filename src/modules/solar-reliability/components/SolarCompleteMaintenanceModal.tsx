import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Wrench, 
  Thermometer, 
  Activity, 
  Sparkles,
  Sun
} from 'lucide-react';
import { useSolarReliability } from '../SolarReliabilityContext';
import { WorkOrderRecord, MaintenanceOutcomeInput } from '../types';

interface SolarCompleteMaintenanceModalProps {
  workOrder: WorkOrderRecord | null;
  onClose: () => void;
}

export const SolarCompleteMaintenanceModal: React.FC<SolarCompleteMaintenanceModalProps> = ({
  workOrder,
  onClose
}) => {
  const { completeMaintenanceOutcome } = useSolarReliability();

  if (!workOrder) return null;

  const isInv = workOrder.assetCode.startsWith('INV');
  const isInv2 = workOrder.assetCode === 'INV-02';
  const isPV = workOrder.assetCode.startsWith('PV');
  const isTR = workOrder.assetCode.startsWith('TR');
  const isBESS = workOrder.assetCode === 'BESS-01';

  const getDefaultAction = () => {
    if (isInv2) {
      return 'Liquid cooling loop backflushed, chiller filter cartridge #SOL-INV-CF02 replaced, and Dow Corning TC-5688 thermal interface paste reapplied on all 6 IGBT bridge modules. Busbar connection torques verified.';
    }
    if (isPV) {
      return 'Tracker drive slew gear backlash adjusted, digital inclinometer zero calibrated, and string fuse connection terminals re-torqued.';
    }
    if (isTR) {
      return 'Padmount transformer cooling radiator fan contactor serviced and dielectric oil tested within normal bounds.';
    }
    if (isBESS) {
      return 'Container HVAC air filters serviced, chiller setpoint calibrated, and thermal sensor connections verified.';
    }
    return 'Corrective field service completed according to manufacturer technical guidelines.';
  };

  const getDefaultRootCause = () => {
    if (isInv2) {
      return 'Sediment accumulation in PCS chiller filter restricted coolant flow rate, causing dry-out and thermal degradation of IGBT silicone heatsink paste.';
    }
    if (isPV) {
      return 'Drive linkage bushing play causing slight mechanical lag during afternoon tracking sweep.';
    }
    return 'Normal operational wear and thermal cycling.';
  };

  const getDefaultParts = () => {
    if (isInv2) {
      return 'Thermal Interface Compound Dow Corning TC-5688, Coolant Filter Cartridge #SOL-INV-CF02, Viton O-Ring Seal Kit';
    }
    if (isPV) {
      return 'Inclinometer Reference Sensor #INC-PV-01, Heavy Duty EP2 Grease';
    }
    return 'Gasket seal kit, alignment shims';
  };

  const [actualAction, setActualAction] = useState(getDefaultAction());
  const [rootCauseFindings, setRootCauseFindings] = useState(getDefaultRootCause());
  const [partsReplacedText, setPartsReplacedText] = useState(getDefaultParts());
  const [engineerNotes, setEngineerNotes] = useState(
    isInv2
      ? 'Post-service test run at 42MW load verified for 45 minutes. Inverter conversion efficiency restored to 98.5% and IGBT junction temperature normalized to 48.5°C.'
      : 'Post-service verification confirmed operational parameters returned to nominal baseline limits.'
  );

  // Post-maintenance telemetry inputs (Pre-filled with restored values)
  const [postIgbtTemp, setPostIgbtTemp] = useState<number>(isInv2 ? 48.5 : 48.0);
  const [postEfficiency, setPostEfficiency] = useState<number>(isInv2 ? 98.5 : 98.6);
  const [postActivePower, setPostActivePower] = useState<number>(isInv2 ? 42.1 : 42.0);
  const [postTrackerTilt, setPostTrackerTilt] = useState<number>(24.6);
  const [postModuleTemp, setPostModuleTemp] = useState<number>(34.2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = partsReplacedText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const outcomeInput: MaintenanceOutcomeInput = {
      woNumber: workOrder.woNumber,
      actualAction,
      rootCauseFindings,
      partsReplaced: parts,
      engineerNotes,
      postMaintenanceTelemetry: {
        igbtTempC: postIgbtTemp,
        inverterEfficiencyPct: postEfficiency,
        activePowerOutputMW: postActivePower,
        trackerTiltAngleDeg: postTrackerTilt,
        moduleTempC: postModuleTemp,
        coolingStatusOk: true
      }
    };

    completeMaintenanceOutcome(outcomeInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {workOrder.woNumber}
              </span>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                {workOrder.assetName} ({workOrder.assetCode})
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              Record Maintenance Outcome &amp; Recalculate Reliability
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Updates raw telemetry, triggers the deterministic reliability pipeline, resolves cleared alerts, and commits to history.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Action Completed */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Actual Maintenance Action Completed <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={actualAction}
              onChange={(e) => setActualAction(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans text-xs"
            />
          </div>

          {/* Root Cause Findings */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Root Cause Findings Identified in Field <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={rootCauseFindings}
              onChange={(e) => setRootCauseFindings(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans text-xs"
            />
          </div>

          {/* Parts Replaced */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Parts &amp; Consumables Replaced (comma-separated)
            </label>
            <input
              type="text"
              value={partsReplacedText}
              onChange={(e) => setPartsReplacedText(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans text-xs"
            />
          </div>

          {/* Post-Maintenance Telemetry Inputs */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                Post-Maintenance SCADA Verification Telemetry
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Simulated Restoration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isInv && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      IGBT Junction Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postIgbtTemp}
                      onChange={(e) => setPostIgbtTemp(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Nominal baseline: &lt; 55°C (Warn: 65°C)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Conversion Efficiency (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postEfficiency}
                      onChange={(e) => setPostEfficiency(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Nominal baseline: &gt; 98.0%</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Active Power Export (MW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postActivePower}
                      onChange={(e) => setPostActivePower(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Nominal: 42.0 MW</span>
                  </div>
                </>
              )}

              {isPV && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Tracker Tilt Angle (°)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={postTrackerTilt}
                    onChange={(e) => setPostTrackerTilt(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400">Target Ephemeris: 24.6°</span>
                </div>
              )}
            </div>
          </div>

          {/* Engineer Field Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Sign-Off Engineer Field Notes &amp; Verification Remarks
            </label>
            <textarea
              rows={2}
              value={engineerNotes}
              onChange={(e) => setEngineerNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply Feedback &amp; Recalculate Pipeline</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
