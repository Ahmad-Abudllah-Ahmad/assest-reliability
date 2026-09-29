import React from 'react';
import { MachineAsset, CombustorCan, HeatRateCurvePoint } from '../types';
import { CombustorEgtChart } from './CombustorEgtChart';
import { HeatRateCurveChart } from './HeatRateCurveChart';
import { PowerAssetFamilyCard, ContingencyScenario } from './PowerAssetFamilyCard';
import { GenerationTimelineCard } from './GenerationTimelineCard';

interface MachineDiagnosticsViewProps {
  assets: MachineAsset[];
  combustorCans: CombustorCan[];
  heatRateData: HeatRateCurvePoint[];
  currentMW?: number;
  targetMW?: number;
  heatRate?: number;
  currentMargin?: number;
  fleetHealthPct?: number;
  onSelectAsset: (asset: MachineAsset) => void;
  onAdvisoryAction: (
    actionType: 'log_case' | 'assign_engineer' | 'export_package' | 'flag_outage',
    asset: MachineAsset,
    casePayload?: any
  ) => void;
  onLogEgtCase: () => void;
  onLogHeatRateCase: () => void;
  onNavigateToOptimizer: () => void;
  onNavigateToCatalog?: () => void;
  onLogEmergencyCase: (scenario: ContingencyScenario) => void;
  simulatedScenario?: ContingencyScenario | null;
  onToggleSimulateScenario: (scenario: ContingencyScenario) => void;
  onOpenJargonGuide?: () => void;
  onOpenCase?: (caseId: string) => void;
}

export const MachineDiagnosticsView: React.FC<MachineDiagnosticsViewProps> = ({
  assets,
  combustorCans,
  heatRateData,
  currentMW = 462,
  targetMW = 480,
  heatRate = 6820,
  currentMargin = 4120,
  fleetHealthPct = 88,
  onSelectAsset,
  onAdvisoryAction,
  onLogEgtCase,
  onLogHeatRateCase,
  onNavigateToOptimizer,
  onNavigateToCatalog,
  onLogEmergencyCase,
  simulatedScenario,
  onToggleSimulateScenario,
  onOpenJargonGuide,
  onOpenCase
}) => {
  const TOP_METRICS = [
    {
      label: 'Live Actual Output',
      value: '461.0 MW',
      color: '#3b82f6',
      valClass: 'text-blue-600 dark:text-blue-400',
      path: 'M 2 11 C 7 14, 12 5, 18 9 C 24 13, 27 5, 32 7'
    },
    {
      label: 'Contract Target',
      value: '480 MW Baseline',
      color: '#10b981',
      valClass: 'text-emerald-600 dark:text-emerald-400',
      path: 'M 2 8 C 8 6, 16 10, 22 7 C 27 5, 29 8, 32 6'
    },
    {
      label: 'Thermal Derate',
      value: '-19 MW Gap',
      color: '#f43f5e',
      valClass: 'text-rose-600 dark:text-rose-400',
      path: 'M 2 5 C 8 6, 14 12, 20 9 C 25 13, 28 14, 32 13'
    },
    {
      label: 'Spread Anomaly',
      value: '26.0°C Spread',
      color: '#f43f5e',
      valClass: 'text-rose-600 dark:text-rose-400',
      path: 'M 2 11 C 7 10, 12 12, 17 6 C 22 2, 27 9, 32 3'
    },
    {
      label: 'Array Mean EGT',
      value: '603°C',
      color: '#3b82f6',
      valClass: 'text-slate-900 dark:text-slate-100',
      path: 'M 2 8 C 7 10, 13 5, 19 8 C 24 7, 27 9, 32 7'
    },
    {
      label: 'Allowable Band',
      value: '585°C – 621°C',
      color: '#10b981',
      valClass: 'text-slate-900 dark:text-slate-100',
      path: 'M 2 7 C 7 5, 13 8, 19 6 C 24 8, 27 6, 32 7'
    },
    {
      label: 'Can 4 Deviation',
      value: '578°C (-26°C)',
      color: '#f43f5e',
      valClass: 'text-rose-600 dark:text-rose-400',
      path: 'M 2 5 C 7 6, 13 11, 19 9 C 24 12, 27 13, 32 12'
    },
    {
      label: 'Current Load',
      value: '462 MW',
      color: '#3b82f6',
      valClass: 'text-slate-900 dark:text-slate-100',
      path: 'M 2 11 C 8 13, 15 6, 21 9 C 26 12, 28 6, 32 5'
    },
    {
      label: 'OEM Target',
      value: '6,700 BTU',
      color: '#10b981',
      valClass: 'text-slate-900 dark:text-slate-100',
      path: 'M 2 6 C 8 5, 15 9, 21 7 C 26 8, 28 6, 32 7'
    },
    {
      label: 'Actual Rate',
      value: '6,820 BTU',
      color: '#f43f5e',
      valClass: 'text-rose-600 dark:text-rose-400',
      path: 'M 2 11 C 8 12, 15 7, 21 9 C 26 5, 28 4, 32 3'
    }
  ];

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 animate-fadeIn">
      {/* Top Section: Executive Live Telemetry Row (All 10 metrics aligned horizontally with curvy sparklines) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-1.5 2xl:gap-2 mb-2.5 2xl:mb-3 shrink-0">
        {TOP_METRICS.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-2 shadow-2xs flex flex-col justify-between min-h-[58px]"
          >
            <span className="text-[9px] 2xl:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate block">
              {metric.label}
            </span>
            <div className="flex items-center justify-between gap-1 mt-1">
              <span className={`font-mono font-bold text-[11px] 2xl:text-xs truncate ${metric.valClass}`}>
                {metric.value}
              </span>
              <svg width="34" height="16" viewBox="0 0 34 16" className="shrink-0 overflow-visible">
                <path
                  d={metric.path}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy={metric.path.slice(-1)} r="2" fill={metric.color} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Asymmetric Master-Detail Executive Grid */}
      <div className="h-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 2xl:gap-4 items-stretch min-h-0">
        
        {/* Left Column (lg:col-span-8): Two Stacked Wide Cards */}
        <div className="lg:col-span-8 flex flex-col gap-3 2xl:gap-4 h-full min-h-0">
          {/* Card 1 (Top Wide): 24-Hour Generation Timeline & Dispatch Target */}
          <div className="flex-[1.08] min-h-0 flex flex-col">
            <GenerationTimelineCard 
              onNavigateToOptimizer={onNavigateToOptimizer} 
              onNavigateToCatalog={onNavigateToCatalog}
            />
          </div>

          {/* Card 2 (Bottom Wide): Engineering Exploratory Data Analysis (EDA) */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 2xl:gap-4 items-stretch">
            {/* EDA Graph 1: Combustor Exhaust Temp Annulus Spread */}
            <div className="h-full min-h-0 flex flex-col">
              <CombustorEgtChart 
                data={combustorCans} 
                onLogCase={onLogEgtCase} 
              />
            </div>

            {/* EDA Graph 2: Operational Heat Rate vs MW Load Curve */}
            <div className="h-full min-h-0 flex flex-col">
              <HeatRateCurveChart 
                data={heatRateData} 
                onLogCase={onLogHeatRateCase} 
              />
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-4): Tall Executive Asset Family & Contingency Side Panel */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0">
          <PowerAssetFamilyCard 
            onLogEmergencyCase={onLogEmergencyCase} 
            simulatedScenario={simulatedScenario}
            onToggleSimulateScenario={onToggleSimulateScenario}
          />
        </div>
      </div>
    </div>
  );
};
