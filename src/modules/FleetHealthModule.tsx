import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Factory, 
  Activity, 
  AlertTriangle, 
  Flame, 
  Thermometer, 
  Zap, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  Wrench, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FleetAsset } from '../types';

export const FleetHealthModule: React.FC = () => {
  const { 
    fleetAssets, 
    gridFrequency, 
    busVoltage, 
    reduceUnit2Thermal, 
    scheduleDiagnosticWorkOrder, 
    openEvidenceModal,
    recommendations 
  } = useApp();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('xfmr-04');
  const selectedAsset = fleetAssets.find(a => a.id === selectedAssetId) || fleetAssets[0];

  const t04Rec = recommendations.find(r => r.id === 'REC-702') || recommendations[0];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Factory className="h-5 w-5 text-amber-500" />
              Generation Fleet & Transformer Health
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-950 text-amber-300 border border-amber-800/60 uppercase">
              Predictive Reliability & Telemetry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time equipment thermal stress, IEEE C57 loss-of-life curves, and multivariate predictive fault risk scores.
          </p>
        </div>

        {/* Global Asset Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={reduceUnit2Thermal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/70 hover:bg-amber-900 border border-amber-800/60 text-amber-200 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span>Reduce Unit 2 Thermal Setpoint</span>
          </button>

          <button
            onClick={() => scheduleDiagnosticWorkOrder('xfmr-04')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Schedule Diagnostic Work Order</span>
          </button>
        </div>
      </div>

      {/* 4 Core Telemetry Cards with Embedded Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Grid Frequency */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                Grid Frequency
              </span>
              <span className="text-emerald-500 text-[10px] font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                NOMINAL
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {gridFrequency.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">Hz</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Tolerance: ±0.05 Hz (60.00 Hz base)
            </div>
          </div>

          {/* Mini Sparkline */}
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { v: 59.97 }, { v: 60.03 }, { v: 59.98 }, { v: 60.02 }, { v: 59.99 }, { v: 60.01 }, { v: gridFrequency }
              ]}>
                <Area type="monotone" dataKey="v" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 2: Bus Voltage */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                Substation Bus Voltage
              </span>
              <span className="text-blue-500 text-[10px] font-mono font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                138 kV BUS
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black tracking-tight text-blue-500 font-mono">
                {busVoltage.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">kV</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Target: 138.0 kV (1.001 p.u.)
            </div>
          </div>

          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { v: 137.9 }, { v: 138.2 }, { v: 138.0 }, { v: 138.3 }, { v: 138.1 }, { v: 138.4 }, { v: busVoltage }
              ]}>
                <Area type="monotone" dataKey="v" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 3: Heat Rate */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                Fleet Avg Heat Rate
              </span>
              <span className="text-amber-500 text-[10px] font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                ELEVATED
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black tracking-tight text-amber-500 font-mono">
                8,720
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">BTU/kWh</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Baseline: 8,450 BTU/kWh (+3.2%)
            </div>
          </div>

          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { v: 8580 }, { v: 8660 }, { v: 8620 }, { v: 8710 }, { v: 8690 }, { v: 8740 }, { v: 8720 }
              ]}>
                <Area type="monotone" dataKey="v" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 4: Transformer Winding Temp */}
        <div className="bg-white dark:bg-slate-800 border border-rose-500/30 rounded-2xl p-4 shadow-sm hover:border-rose-500/50 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-rose-500 dark:text-rose-400">
                Transformer Winding Temp
              </span>
              <span className="text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                CRITICAL
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                98.4
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">°C</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Warning threshold: &gt;85.0°C (IEEE C57)
            </div>
          </div>

          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { v: 84.2 }, { v: 87.8 }, { v: 86.5 }, { v: 91.2 }, { v: 94.8 }, { v: 93.6 }, { v: 98.4 }
              ]}>
                <Area type="monotone" dataKey="v" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Fleet Asset Roster & Deep Diagnostic Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Asset Cards List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Active Generation Fleet & Transmission Units
            </h3>
            <span className="text-[11px] text-gray-400">
              5 Monitored Critical Assets
            </span>
          </div>

          <div className="space-y-2.5">
            {fleetAssets.map((asset) => {
              const isSelected = asset.id === selectedAssetId;
              const isCritical = asset.status === 'CRITICAL';
              const isWarning = asset.status === 'WARNING';

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isCritical
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                            : isWarning
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                        }`}
                      >
                        {isCritical ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : isWarning ? (
                          <Flame className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">
                            {asset.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {asset.unitTag}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              isCritical
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 animate-pulse'
                                : isWarning
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {asset.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                          <span>Risk: <strong className={isCritical ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>{asset.failureRiskPercent}% (30d)</strong></span>
                          <span>•</span>
                          <span>Failure Mode: <span className="text-slate-700 dark:text-slate-300">{asset.failureMode}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Stats */}
                    <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px]">CURRENT LOAD</div>
                        <div className="font-bold text-slate-900 dark:text-white">{asset.currentLoadMW} MW</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px]">THERMAL</div>
                        <div className={`font-bold ${asset.windingTempC && asset.windingTempC > 85 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {asset.windingTempC ? `${asset.windingTempC}°C` : 'Norm'}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition ${isSelected ? 'text-blue-500 translate-x-1' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Diagnostic Dossier Panel for Selected Asset */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Asset Forensic Dossier
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedAsset.name}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedAsset.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              }`}>
                {selectedAsset.status}
              </span>
            </div>

            {/* Risk Gauge Bar */}
            <div className="mt-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">30-Day Fault Probability:</span>
                <span className={`font-bold ${selectedAsset.failureRiskPercent > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {selectedAsset.failureRiskPercent}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedAsset.failureRiskPercent > 50 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedAsset.failureRiskPercent}%` }} 
                />
              </div>
              <div className="text-[10px] text-gray-400 flex justify-between">
                <span>Degradation Rate: {selectedAsset.degradationRate}</span>
                <span>Days to Service: {selectedAsset.daysToMaintenance}d</span>
              </div>
            </div>

            {/* Key Telemetry Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-3">
              <div className="bg-black/30 p-2 rounded-lg border border-gray-800/80">
                <span className="text-[10px] text-gray-500 block">WINDING TEMP</span>
                <span className="text-white font-bold">{selectedAsset.windingTempC || 72.0}°C</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-gray-800/80">
                <span className="text-[10px] text-gray-500 block">TOP-OIL TEMP</span>
                <span className="text-white font-bold">{selectedAsset.topOilTempC || 62.5}°C</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-gray-800/80">
                <span className="text-[10px] text-gray-500 block">RADIAL VIBRATION</span>
                <span className="text-white font-bold">{selectedAsset.vibrationMms || 1.2} mm/s</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-gray-800/80">
                <span className="text-[10px] text-gray-500 block">VOLTAGE BUS</span>
                <span className="text-blue-300 font-bold">{selectedAsset.busVoltageKV || 138.0} kV</span>
              </div>
            </div>

            {/* Diagnostic Narrative */}
            <div className="mt-3 p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-[11px] text-gray-300 space-y-1">
              <div className="font-semibold text-blue-400 flex items-center gap-1">
                <Info className="h-3 w-3" />
                AI Physics-Informed Diagnostic
              </div>
              <p className="leading-snug text-gray-400">
                Multivariate thermal sensor analysis reveals high loss-of-life acceleration factor on {selectedAsset.name}. Immediate load shed or oil cooling fan overhaul recommended.
              </p>
            </div>
          </div>

          {/* Action Buttons inside Dossier */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => openEvidenceModal(t04Rec)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/70 border border-blue-700/60 transition"
            >
              <Info className="h-3.5 w-3.5" />
              View Explainable Evidence Dossier
            </button>

            <button
              onClick={() => scheduleDiagnosticWorkOrder(selectedAsset.id)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/30"
            >
              <Wrench className="h-3.5 w-3.5" />
              Dispatch Inspection for {selectedAsset.name}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
