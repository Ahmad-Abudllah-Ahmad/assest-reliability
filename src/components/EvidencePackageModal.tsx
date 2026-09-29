import React from 'react';
import { 
  X, 
  ShieldAlert, 
  TrendingUp, 
  Scale, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  ArrowRight, 
  Zap, 
  DollarSign,
  Info,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EvidencePackageModal: React.FC = () => {
  const { activeEvidenceModal, closeEvidenceModal, approveRecommendation } = useApp();

  if (!activeEvidenceModal) return null;

  const rec = activeEvidenceModal;
  const ev = rec.evidence;

  const handleExecute = () => {
    approveRecommendation(rec.id);
    closeEvidenceModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0E1524] border border-gray-700/80 rounded-2xl shadow-2xl text-gray-100 p-5 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-950/80 border border-blue-600/50 flex items-center justify-center text-blue-400 mt-0.5 flex-shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  {rec.id}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {rec.assetName}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                  {rec.category}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {ev.sensitivity.confidencePct}% AI Confidence
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {rec.title}
              </h2>
            </div>
          </div>

          <button
            onClick={closeEvidenceModal}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 mt-5 text-sm">

          {/* Root Cause & Proposed Action Box */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Proposed Action & SCADA Command
            </div>
            <p className="text-gray-200 text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-gray-800">
              {rec.actionProposed}
            </p>
            <div className="text-[11px] text-gray-400 pt-1">
              <strong className="text-gray-300">Root Cause Diagnostics:</strong> {ev.rootCause}
            </div>
          </div>

          {/* Section 1: The "Why" - Primary Drivers */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              The "Why" — Primary Telemetry & Market Drivers
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {ev.primaryDrivers.map((driver, idx) => (
                <div 
                  key={idx} 
                  className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-3 text-xs text-gray-300 flex items-start gap-2"
                >
                  <div className="h-5 w-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Side-by-Side Trade-off Analysis */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              Trade-off Analysis: Status Quo vs. AI Recommendation
            </div>
            <div className="overflow-x-auto border border-gray-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-900/90 text-gray-400 font-semibold border-b border-gray-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Decision Dimension</th>
                    <th className="p-3 text-gray-400">Do Nothing (Status Quo)</th>
                    <th className="p-3 text-blue-400">AI Recommended Action</th>
                    <th className="p-3 text-emerald-400">Net Operational Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {ev.tradeOffs.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition">
                      <td className="p-3 font-sans font-medium text-gray-300">
                        {row.metric}
                      </td>
                      <td className="p-3 text-gray-400">
                        {row.statusQuo}
                      </td>
                      <td className="p-3 text-blue-300 font-semibold">
                        {row.recommended}
                      </td>
                      <td className={`p-3 font-bold ${row.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {row.benefit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Market Economics & Sensor Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Economic Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Economic Arbitrage & Savings Matrix
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase">LMP Pricing Spread</div>
                  <div className="font-mono text-gray-200 font-semibold mt-0.5">{ev.marketEconomics.lmpSpread}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase">Displaced Energy Fuel</div>
                  <div className="font-mono text-emerald-400 font-semibold mt-0.5">{ev.marketEconomics.fuelSavings}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase">Asset Wear Factor</div>
                  <div className="font-mono text-amber-400 font-semibold mt-0.5">{ev.marketEconomics.assetWearCost}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase">Net Hourly Arbitrage</div>
                  <div className="font-mono text-emerald-300 font-bold mt-0.5">{ev.marketEconomics.netBenefitHourly}</div>
                </div>
              </div>
            </div>

            {/* Risk & Rollback Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Risk Sensitivity & Rollback Protocol
              </div>
              <div className="text-xs text-gray-300 space-y-2">
                <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Rollback Protocol Time:</span>
                  <span className="font-mono text-gray-200 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-400" />
                    Within {ev.sensitivity.rollbackTimeMinutes} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Fail-Safe Rollback Trigger:</span>
                  <span className="font-mono text-amber-300">SCADA RTU Watchdog Auto-Trip</span>
                </div>
                <div className="text-[11px] text-gray-400 pt-1">
                  Reversible via single operator override or automated busbar breaker reclosure.
                </div>
              </div>
            </div>

          </div>

          {/* Sensor Signals Table */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-400" />
              Direct Sensor Signal Evidence
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ev.sensitivity.sensorSignals.map((sig, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-900/70 border border-gray-800 rounded-xl p-3 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-gray-400 text-[11px] truncate">{sig.name}</div>
                    <div className="font-mono text-base font-bold text-white mt-1">{sig.value}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">{sig.threshold}</span>
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${
                      sig.status === 'ANOMALOUS' 
                        ? 'bg-red-950 text-red-300 border border-red-800/60' 
                        : sig.status === 'ELEVATED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {sig.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
          <button
            onClick={closeEvidenceModal}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition"
          >
            Close Dossier
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecute}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              Execute Recommendation Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
