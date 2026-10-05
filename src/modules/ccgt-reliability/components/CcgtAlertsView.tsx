import React from 'react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { CcgtHmiPanel } from './hmi/CcgtHmiPanel';

interface CcgtAlertsViewProps {
  onNavigateToCases?: () => void;
}

export const CcgtAlertsView: React.FC<CcgtAlertsViewProps> = ({
  onNavigateToCases
}) => {
  const {
    setSelectedAlert,
    setSelectedAsset
  } = useCcgtReliability();

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 animate-fadeIn select-none overflow-hidden">
      {/* PRIMARY FULL-PAGE EXPERIENCE: CCGT PROCESS FLOW & RELIABILITY HMI */}
      <CcgtHmiPanel 
        onTraceAlert={(alert) => setSelectedAlert(alert)}
        onInspectAsset={(asset) => setSelectedAsset(asset)}
        onNavigateToCases={onNavigateToCases}
      />
    </div>
  );
};


