import React, { useState } from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
  PolarAngleAxis
} from 'recharts';
import { Cpu, Activity, AlertTriangle, CheckCircle2, Wrench, Shield, ArrowRight } from 'lucide-react';
import { RotatingEquipmentRul } from '../../types/oilGasTypes';

interface AssetRulRadialChartProps {
  equipmentList: RotatingEquipmentRul[];
  onLogCaseForAsset?: (equipment: RotatingEquipmentRul) => void;
}

export const AssetRulRadialChart: React.FC<AssetRulRadialChartProps> = ({
  equipmentList,
  onLogCaseForAsset
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(equipmentList[0]?.id || '');

  // Prepare RadialBar data format
  const radialData = equipmentList.map((item) => ({
    name: item.name,
    tag: item.tag,
    rulPercent: item.rulPercent,
    fill: item.rulPercent > 80 ? '#10b981' : item.rulPercent > 70 ? '#3b82f6' : '#f59e0b',
    hoursToService: item.hoursToService
  }));

  const selectedAsset = equipmentList.find(e => e.id === selectedAssetId) || equipmentList[0];

  return (
    <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Critical Rotating Machinery — Remaining Useful Life (RUL)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              Predictive Physics AI
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time degradation modeling for LP & HP Gas Compressors and Main Crude Export Pumps.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Optimal (&gt;80%)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Normal (70–80%)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Action Watch (&lt;70%)</span>
        </div>
      </div>

      {/* Plain-English Helper Banner */}
      <div className="bg-indigo-50/70 dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-950 dark:text-indigo-200">
          <span>💡 What does &quot;RUL&quot; mean?</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-slate-100">Remaining Useful Life (Equipment Health %):</strong> 100% is a brand new machine. Above 80% is healthy. Below 70% means a part (like a seal or bearing) is wearing down and should be scheduled for routine maintenance.
        </p>
      </div>

      {/* Main Content Grid: Radial Chart + Diagnostic Spotlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column: RadialBarChart */}
        <div className="lg:col-span-5 h-72 w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="25%"
              outerRadius="95%"
              barSize={14}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: '#334155', opacity: 0.15 }}
                dataKey="rulPercent"
                cornerRadius={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(val: any, name: any, item: any) => [
                  `${val}% RUL (${item.payload.hoursToService.toLocaleString()} hrs remaining)`,
                  item.payload.name
                ]}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center text in radial ring */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {selectedAsset.rulPercent}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              RUL ({selectedAsset.tag})
            </span>
          </div>
        </div>

        {/* Right Column: Deep Diagnostic Spotlight Card for Selected Asset */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {selectedAsset.tag}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedAsset.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedAsset.category} • Design Life: {selectedAsset.designLifeHours.toLocaleString()} hrs
              </p>
            </div>

            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              selectedAsset.status === 'optimal'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
            }`}>
              {selectedAsset.statusLabel}
            </span>
          </div>

          {/* 4 Sensor Telemetry Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Vibration RMS</span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5 block">
                {selectedAsset.vibrationRmsMmS} mm/s
              </span>
              <span className="text-[9px] text-slate-400">Limit: {selectedAsset.vibrationLimitMmS} mm/s</span>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Bearing Temp</span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5 block">
                {selectedAsset.bearingTempC}°C
              </span>
              <span className="text-[9px] text-slate-400">Limit: {selectedAsset.bearingTempLimitC}°C</span>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                {selectedAsset.sealLeakageScfm !== undefined ? 'Seal Leakage' : 'Discharge Head'}
              </span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5 block">
                {selectedAsset.sealLeakageScfm !== undefined 
                  ? `${selectedAsset.sealLeakageScfm} scfm` 
                  : `${selectedAsset.dischargePressureBar} bar`}
              </span>
              <span className="text-[9px] text-slate-400">
                {selectedAsset.sealLeakageLimitScfm !== undefined 
                  ? `Limit: ${selectedAsset.sealLeakageLimitScfm} scfm` 
                  : `Rating: ${selectedAsset.dischargePressureRatingBar} bar`}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hours to Overhaul</span>
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {selectedAsset.hoursToService.toLocaleString()} hrs
              </span>
              <span className="text-[9px] text-slate-400">RUL: {selectedAsset.rulPercent}%</span>
            </div>
          </div>

          {/* AI Physics Diagnostic Callout */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
            <span className="font-bold text-blue-800 dark:text-blue-300 block mb-0.5">
              Predictive Maintenance Advisory:
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedAsset.diagnosticFinding}
            </p>
          </div>

          {/* Selector Switcher for Machinery */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {equipmentList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedAssetId(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedAssetId === item.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.tag}
                </button>
              ))}
            </div>

            {onLogCaseForAsset && (
              <button
                onClick={() => onLogCaseForAsset(selectedAsset)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer"
              >
                <Wrench className="h-3 w-3" />
                <span>Log Maintenance Order</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
