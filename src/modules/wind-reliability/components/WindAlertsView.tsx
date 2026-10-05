import React from 'react';
import { useWindReliability } from '../WindReliabilityContext';
import { WindHmiPanel } from './hmi/WindHmiPanel';

interface WindAlertsViewProps {
  onNavigateToCases?: () => void;
}

export const WindAlertsView: React.FC<WindAlertsViewProps> = ({
  onNavigateToCases
}) => {
  const {
    setSelectedAlert,
    setSelectedAsset
  } = useWindReliability();

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 animate-fadeIn select-none overflow-hidden">
      <WindHmiPanel 
        onTraceAlert={(alert) => setSelectedAlert(alert)}
        onInspectAsset={(asset) => setSelectedAsset(asset)}
        onNavigateToCases={onNavigateToCases}
      />
    </div>
  );
};
