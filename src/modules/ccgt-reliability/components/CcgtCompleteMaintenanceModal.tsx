import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Wrench, 
  Thermometer, 
  Activity, 
  Flame, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { WorkOrderRecord, MaintenanceOutcomeInput } from '../types';

interface CcgtCompleteMaintenanceModalProps {
  workOrder: WorkOrderRecord | null;
  onClose: () => void;
}

export const CcgtCompleteMaintenanceModal: React.FC<CcgtCompleteMaintenanceModalProps> = ({
  workOrder,
  onClose
}) => {
  const { completeMaintenanceOutcome } = useCcgtReliability();

  if (!workOrder) return null;

  const isGT = workOrder.assetCode.startsWith('GT');
  const isST = workOrder.assetCode.startsWith('ST');
  const isBFP = workOrder.assetCode === 'BFP-A';
  const isGSU = workOrder.assetCode === 'GSU';

  // Section 20: Asset-specific default actions, root cause findings, and parts
  const getDefaultAction = () => {
    if (workOrder.assetCode === 'GT-2') {
      return 'Borescope inspection performed. Can #4 fuel nozzle orifice dismounted, ultrasonic cleaned, and re-torqued. Fuel valve actuator re-zeroed.';
    }
    if (isGT) {
      return 'Hot gas path inspection complete. Combustor liners checked and nozzle guide clearances verified.';
    }
    if (isST) {
      return 'Journal bearing #2 inspected and wipe checked. Lube oil filter elements replaced, oil cooler backwashed, journal bearing clearance calibrated.';
    }
    if (isBFP) {
      return 'Boiler feed pump flexible coupling realigned and dynamically balanced. Inboard bearing replaced and mechanical seal serviced.';
    }
    if (isGSU) {
      return 'Main step-up transformer cooling bank fan motor replaced. Oil circulating pump circuit breaker serviced and dielectric oil tested.';
    }
    return 'Corrective service completed per OEM maintenance manual specifications.';
  };

  const getDefaultRootCause = () => {
    if (workOrder.assetCode === 'GT-2') {
      return 'Micro-debris contamination partially occluded nozzle #4 primary swirl vane port, causing fuel flow starvation and localized cold pocket.';
    }
    if (isST) {
      return 'Varnish accumulation on bearing tilt-pad shoes causing localized oil film shear heating.';
    }
    if (isBFP) {
      return 'Elastomeric drive coupling fatigue induced angular misalignment and elevated casing vibration.';
    }
    if (isGSU) {
      return 'Cooling radiator fan contactor trip under heavy ambient temperature and continuous full-load transmission.';
    }
    return 'Normal operational wear and thermal cycling.';
  };

  const getDefaultParts = () => {
    if (workOrder.assetCode === 'GT-2') {
      return 'Fuel Nozzle Gasket Pack #G-7F-04, Actuator Viton O-Rings, Swirl Baffle Lock Pins';
    }
    if (isST) {
      return 'Journal Bearing Tilt Pads, Labyrinth Oil Seal, Synthetic Lube Oil ISO VG 32';
    }
    if (isBFP) {
      return 'Elastomer Coupling Insert, Radial Sleeve Bearing, Mechanical Seal Gasket';
    }
    if (isGSU) {
      return 'Radiator Fan Motor 1.5kW, Thermal Overload Relay, Insulating Oil Sample Kit';
    }
    return 'Gasket seal kit, alignment shims';
  };

  // Form states with realistic default outcomes
  const [actualAction, setActualAction] = useState(getDefaultAction());
  const [rootCauseFindings, setRootCauseFindings] = useState(getDefaultRootCause());
  const [partsReplacedText, setPartsReplacedText] = useState(getDefaultParts());
  const [engineerNotes, setEngineerNotes] = useState(
    isGT
      ? 'Post-maintenance hot-fire conducted for 30 minutes at rated load. Annulus temperature spread normalized and vibration stable.'
      : 'Post-service functional check verified operational parameters returned to nominal baseline limits.'
  );

  // Post-maintenance telemetry inputs (Pre-filled with simulated restored values)
  const [postEgtSpread, setPostEgtSpread] = useState<number>(14.0); // 28°C -> 14°C
  const [postHeatRate, setPostHeatRate] = useState<number>(10005); // Heat rate dev +2.1% (down from +5.4%)
  const [postBearingTemp, setPostBearingTemp] = useState<number>(isST ? 74.0 : 72.0);
  const [postVibration, setPostVibration] = useState<number>(isBFP ? 3.4 : (isST ? 1.8 : 2.1));
  const [postOilTemp, setPostOilTemp] = useState<number>(isGSU ? 62.0 : 51.0);
  const [postWindingTemp, setPostWindingTemp] = useState<number>(72.0);
  const [postDischargePressure, setPostDischargePressure] = useState<number>(170.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = partsReplacedText.split(',').map(p => p.trim()).filter(Boolean);

    const outcome: MaintenanceOutcomeInput = {
      woNumber: workOrder.woNumber,
      actualAction,
      rootCauseFindings,
      partsReplaced: parts,
      engineerNotes,
      postMaintenanceTelemetry: {
        egtSpreadC: isGT ? postEgtSpread : undefined,
        heatRateBtuKwh: isGT ? postHeatRate : undefined,
        bearingTempC: isGT || isST || isBFP ? postBearingTemp : undefined,
        vibrationMmS: isGT || isST || isBFP ? postVibration : undefined,
        oilTempC: isGSU || isST ? postOilTemp : undefined,
        windingTempC: isGSU ? postWindingTemp : undefined,
        dischargePressureBar: isBFP ? postDischargePressure : undefined,
      }
    };

    completeMaintenanceOutcome(outcome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-855/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {workOrder.woNumber}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  {workOrder.assetName} ({workOrder.assetCode})
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Record Maintenance Outcome &amp; Trigger Feedback Recalculation
              </h3>
            </div>
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
          
          {/* Section: Before vs After Telemetry Preview */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
            <div className="flex items-center justify-between text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Maintenance Feedback Loop Simulation
              </span>
              <span className="text-[10px] font-mono">DCS Closed-Loop Sync</span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Entering post-maintenance test telemetry will automatically recalculate indicators, evaluate rules, reduce risk scores, and restore plant health metrics.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {isGT && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">EGT Spread</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.egtSpreadC}°C</span>
                      <span>→</span>
                      <input
                        type="number"
                        value={postEgtSpread}
                        onChange={(e) => setPostEgtSpread(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Heat Rate</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">+5.4%</span>
                      <span>→</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">+2.1%</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Bearing Temp</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={postBearingTemp}
                        onChange={(e) => setPostBearingTemp(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Predicted Risk</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.riskScore}</span>
                      <span>→</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">~32 (Mod)</span>
                    </div>
                  </div>
                </>
              )}

              {isST && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Bearing Temp</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.bearingTempC}°C</span>
                      <span>→</span>
                      <input
                        type="number"
                        value={postBearingTemp}
                        onChange={(e) => setPostBearingTemp(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Vibration</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.vibrationMmS}</span>
                      <span>→</span>
                      <input
                        type="number"
                        step="0.1"
                        value={postVibration}
                        onChange={(e) => setPostVibration(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">mm/s</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Lube Oil Temp</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={postOilTemp}
                        onChange={(e) => setPostOilTemp(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Predicted Risk</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.riskScore}</span>
                      <span>→</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">~18 (Low)</span>
                    </div>
                  </div>
                </>
              )}

              {isBFP && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Vibration</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.vibrationMmS}</span>
                      <span>→</span>
                      <input
                        type="number"
                        step="0.1"
                        value={postVibration}
                        onChange={(e) => setPostVibration(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">mm/s</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Discharge Press</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={postDischargePressure}
                        onChange={(e) => setPostDischargePressure(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">bar</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Bearing Temp</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={postBearingTemp}
                        onChange={(e) => setPostBearingTemp(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Predicted Risk</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.riskScore}</span>
                      <span>→</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">~15 (Low)</span>
                    </div>
                  </div>
                </>
              )}

              {isGSU && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Oil Temp</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={postOilTemp}
                        onChange={(e) => setPostOilTemp(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Winding Temp</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={postWindingTemp}
                        onChange={(e) => setPostWindingTemp(Number(e.target.value))}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-12 bg-slate-50 dark:bg-slate-800 border rounded px-1 py-0.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Transmitted MW</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">462 MW</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Predicted Risk</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-rose-600 line-through text-[11px]">{workOrder.beforeReading.riskScore}</span>
                      <span>→</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">~12 (Low)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Actual Corrective Action Taken *
              </label>
              <textarea
                rows={2}
                value={actualAction}
                onChange={(e) => setActualAction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Physical Root Cause Diagnostic Findings *
              </label>
              <textarea
                rows={2}
                value={rootCauseFindings}
                onChange={(e) => setRootCauseFindings(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Parts &amp; Components Replaced (comma separated)
              </label>
              <input
                type="text"
                value={partsReplacedText}
                onChange={(e) => setPartsReplacedText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Field Engineer Verification Notes
              </label>
              <textarea
                rows={2}
                value={engineerNotes}
                onChange={(e) => setEngineerNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
              <span>Submit &amp; Execute Feedback Recalculation</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
