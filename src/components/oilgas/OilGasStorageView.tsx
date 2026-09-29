import React, { useState } from 'react';
import { 
  Database, 
  Anchor, 
  Navigation, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Gauge, 
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { StorageLogisticsChart } from './StorageLogisticsChart';
import { OilGasPageHeader } from './OilGasPageHeader';
import { StorageExportPoint, OffshoreStorageTank, OffshoreExportSystem } from '../../types/oilGasTypes';

interface OilGasStorageViewProps {
  storageData: StorageExportPoint[];
  tanks: OffshoreStorageTank[];
  exportSystem: OffshoreExportSystem;
}

export const OilGasStorageView: React.FC<OilGasStorageViewProps> = ({
  storageData,
  tanks,
  exportSystem
}) => {
  const [activePigStep, setActivePigStep] = useState(2);

  const pigChecklist = [
    { step: 1, title: 'Chamber Depressurized Safely', status: 'Completed', detail: 'Pressure lowered to 0 bar for opening' },
    { step: 2, title: 'Cleaning & Ultrasonic Robot Loaded', status: 'Completed', detail: '16" inspection robot placed inside launcher' },
    { step: 3, title: 'Safety Hatch Door Bolted Shut', status: 'Active (Securing)', detail: 'Double safety door locked before pressurizing' },
    { step: 4, title: 'Match Pipeline Pressure (112 bar)', status: 'Pending Verification', detail: 'Balancing pressure so door does not slam' },
    { step: 5, title: 'Launch Robot into Undersea Pipeline', status: 'Scheduled 16:00', detail: 'Oil flow pushes robot along the 16" seabed pipe' }
  ];

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn">
      {/* Page Title: Storage & Export Logistics */}
      <div className="shrink-0">
        <OilGasPageHeader
          title="Storage & Export Logistics"
          subtitle="Floating hull cargo tank monitoring, shuttle tanker offloading schedule, and subsea pipeline pigging"
          icon={Database}
          badgeText="Cargo Ops Active"
          badgeColor="blue"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
        {/* 1. Storage & Export Logistics ComposedChart */}
        <StorageLogisticsChart
          data={storageData}
          tanks={tanks}
          exportSystem={exportSystem}
        />

        {/* 2. Tanks Deep Dive & Subsea Pig Launcher Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: Storage Cargo Tank Conditions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                FPSO Cargo Storage Tanks (750k bbl Capacity)
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Inert Gas Blanket Active
            </span>
          </div>

          <div className="space-y-3">
            {tanks.map((tank) => (
              <div 
                key={tank.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{tank.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
                      {tank.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {tank.currentStockBbl.toLocaleString()} bbl ({tank.fillPercentage}%)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <div>Ullage: <strong className="text-slate-800 dark:text-slate-200 font-mono">{tank.ullageMeters}m</strong></div>
                  <div>Temp: <strong className="text-slate-800 dark:text-slate-200 font-mono">{tank.tankTemperatureC}°C</strong></div>
                  <div>Inert Press: <strong className="text-slate-800 dark:text-slate-200 font-mono">{tank.inertGasPressureMbar} mbar</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Subsea Pig Launcher Valve Operations */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pipe Cleaning & Inspection Robot (PIG Launcher)
                </h3>
                <p className="text-[11px] text-slate-500">Autonomous robot pushed through undersea pipe by oil pressure</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              16&quot; Ultrasonic Robot
            </span>
          </div>

          <div className="space-y-2.5">
            {pigChecklist.map((item) => (
              <div 
                key={item.step}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                  item.status.includes('Completed')
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                    : item.status.includes('Active')
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    item.status.includes('Completed')
                      ? 'bg-emerald-600 text-white'
                      : item.status.includes('Active')
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.step}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {item.detail}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.status.includes('Completed')
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                    : item.status.includes('Active')
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-500/10'
                    : 'text-slate-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
            <span>Last Inspection: {exportSystem.lastPigInspectionDate}</span>
            <span className="font-mono text-emerald-600">Corrosion Rate: {exportSystem.corrosionRateMmPerYear} mm/yr</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
