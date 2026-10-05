import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Wrench, 
  Thermometer, 
  Activity, 
  RotateCcw,
  Sparkles,
  Wind
} from 'lucide-react';
import { useWindReliability } from '../WindReliabilityContext';
import { WorkOrderRecord, MaintenanceOutcomeInput } from '../types';

interface WindCompleteMaintenanceModalProps {
  workOrder: WorkOrderRecord | null;
  onClose: () => void;
}

export const WindCompleteMaintenanceModal: React.FC<WindCompleteMaintenanceModalProps> = ({
  workOrder,
  onClose
}) => {
  const { completeMaintenanceOutcome } = useWindReliability();

  if (!workOrder) return null;

  const isWT = workOrder.assetCode.startsWith('WT');
  const isWT4 = workOrder.assetCode === 'WT-004';
  const isWT5 = workOrder.assetCode === 'WT-005';
  const isPCS = workOrder.assetCode.startsWith('PCS');
  const isTR = workOrder.assetCode.startsWith('TR');

  const getDefaultAction = () => {
    if (isWT4) {
      return 'Gearbox high-speed shaft bearing flushed, lubricated with ISO VG 320 synthetic oil, and laser alignment re-zeroed. Oil filter element replaced and debris screen inspected.';
    }
    if (isWT5) {
      return 'Nacelle yaw drive gear backlash adjusted, yaw position encoder recalibrated to true wind heading, and pitch asymmetric calibration completed.';
    }
    if (isPCS) {
      return 'Inverter IGBT power module thermal interface heat-sink repasted, liquid cooling circuit de-aerated, and chiller filter elements cleaned.';
    }
    if (isTR) {
      return 'Padmount transformer radiator cooling fan contactor serviced and oil dielectric sample tested within normal bounds.';
    }
    return 'Corrective field service completed according to turbine manufacturer technical specifications.';
  };

  const getDefaultRootCause = () => {
    if (isWT4) {
      return 'Degraded lubrication grease film causing localized dry contact friction on gearbox IMS/HSS bearings and elevated vibration.';
    }
    if (isWT5) {
      return 'Yaw wind tracking optical encoder zero drift offset by +9.5 degrees, causing persistent aerodynamic yaw misalignment.';
    }
    if (isPCS) {
      return 'IGBT heatsink thermal interface compound dry-out under sustained high-load ambient heat.';
    }
    return 'Normal operational wear and thermal cycling.';
  };

  const getDefaultParts = () => {
    if (isWT4) {
      return 'Castrol Optigear Synthetic X 320 (20L), Gearbox Micron Filter Cartridge #WND-GB-04, Shaft Grounding Ring';
    }
    if (isWT5) {
      return 'Optical Absolute Yaw Position Encoder #ENC-240, Yaw Brake Lining Puck Pack';
    }
    if (isPCS) {
      return 'Thermal Interface Phase-Change Pad, 690V AC Fast-Blow Fuse Link, Chiller Pre-Filter';
    }
    return 'Lubricant pack, seal gasket kit';
  };

  const [actualAction, setActualAction] = useState(getDefaultAction());
  const [rootCauseFindings, setRootCauseFindings] = useState(getDefaultRootCause());
  const [partsReplacedText, setPartsReplacedText] = useState(getDefaultParts());
  const [engineerNotes, setEngineerNotes] = useState(
    isWT4
      ? 'Post-service test run conducted at 11.5 m/s wind speed for 45 minutes. Gearbox bearing temperature normalized to 68.4°C and vibration dropped from 3.8 mm/s to 1.5 mm/s RMS.'
      : 'Post-service diagnostic verification verified operational parameters returned to nominal baseline limits.'
  );

  // Post-maintenance telemetry inputs (Pre-filled with restored values)
  const [postGearboxBearingTemp, setPostGearboxBearingTemp] = useState<number>(isWT4 ? 68.4 : 67.5);
  const [postVibration, setPostVibration] = useState<number>(isWT4 ? 1.5 : 1.4);
  const [postYawHeading, setPostYawHeading] = useState<number>(isWT5 ? 248.0 : 248.5);
  const [postPitchSpread, setPostPitchSpread] = useState<number>(0.1);
  const [postStatorTemp, setPostStatorTemp] = useState<number>(77.0);

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
        gearboxBearingTempC: postGearboxBearingTemp,
        vibrationMmS: postVibration,
        yawHeadingDeg: postYawHeading,
        bladePitchA: 1.2,
        bladePitchB: 1.2,
        bladePitchC: 1.2,
        generatorStatorTempC: postStatorTemp
      }
    };

    completeMaintenanceOutcome(outcomeInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
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
              {isWT && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Gearbox Bearing Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postGearboxBearingTemp}
                      onChange={(e) => setPostGearboxBearingTemp(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Nominal baseline: &lt; 72°C (Warn: 75°C)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Vibration RMS (mm/s)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postVibration}
                      onChange={(e) => setPostVibration(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Nominal baseline: &lt; 2.0 mm/s (Warn: 2.5 mm/s)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Nacelle Yaw Heading (°)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postYawHeading}
                      onChange={(e) => setPostYawHeading(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Aligned with Wind Direction (248° WSW)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Generator Stator Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={postStatorTemp}
                      onChange={(e) => setPostStatorTemp(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">Nominal baseline: &lt; 85°C</span>
                  </div>
                </>
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
