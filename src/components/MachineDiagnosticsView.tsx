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
  return (
    <div className="h-full flex-1 flex flex-col min-h-0 animate-fadeIn">
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
