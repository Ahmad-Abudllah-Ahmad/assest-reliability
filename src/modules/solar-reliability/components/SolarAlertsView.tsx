import React from 'react';
import { SolarHmiPanel } from './hmi/SolarHmiPanel';

interface SolarAlertsViewProps {
  onNavigateToCases?: () => void;
}

export const SolarAlertsView: React.FC<SolarAlertsViewProps> = ({ onNavigateToCases }) => {
  return (
    <div className="h-full flex-1 flex flex-col min-h-0 animate-fadeIn select-none">
      <SolarHmiPanel onNavigateToCases={onNavigateToCases} />
    </div>
  );
};
