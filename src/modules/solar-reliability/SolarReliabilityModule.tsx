import React from 'react';
import { SolarReliabilityProvider, useSolarReliability } from './SolarReliabilityContext';
import { SolarCommandCenterView } from './components/SolarCommandCenterView';
import { SolarAssetsView } from './components/SolarAssetsView';
import { SolarAssetDetailModal } from './components/SolarAssetDetailModal';
import { SolarAlertsView } from './components/SolarAlertsView';
import { SolarAlertTraceModal } from './components/SolarAlertTraceModal';
import { SolarWorkOrdersView } from './components/SolarWorkOrdersView';
import { SolarWorkOrderDetailModal } from './components/SolarWorkOrderDetailModal';
import { SolarCompleteMaintenanceModal } from './components/SolarCompleteMaintenanceModal';
import { SolarRulesView } from './components/SolarRulesView';

export interface SolarReliabilityModuleProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onNavigateToCatalog?: () => void;
}

const SolarReliabilityInner: React.FC<SolarReliabilityModuleProps> = ({
  activeTab,
  onTabChange,
  onNavigateToCatalog
}) => {
  const {
    selectedAsset,
    setSelectedAsset,
    selectedAlert,
    setSelectedAlert,
    selectedWorkOrder,
    setSelectedWorkOrder,
    completingWorkOrder,
    setCompletingWorkOrder
  } = useSolarReliability();

  return (
    <>
      {/* Page 1: Solar Reliability Command Center */}
      {(activeTab === 'overview' || activeTab === 'diagnostics') && (
        <SolarCommandCenterView
          onNavigateToTab={onTabChange}
          onNavigateToCatalog={onNavigateToCatalog}
        />
      )}

      {/* Page 2: Assets */}
      {activeTab === 'assets' && (
        <SolarAssetsView onNavigateToCatalog={onNavigateToCatalog} />
      )}

      {/* Page 3: Alerts & Recommendations with Interactive HMI */}
      {activeTab === 'alerts' && (
        <SolarAlertsView onNavigateToCases={() => onTabChange('cases')} />
      )}

      {/* Page 4: Work Orders & Maintenance */}
      {(activeTab === 'cases' || activeTab === 'maintenance') && (
        <SolarWorkOrdersView />
      )}

      {/* Page 5: Rules & Thresholds Engine */}
      {activeTab === 'rules' && (
        <SolarRulesView />
      )}

      {/* Modals & Technical Dossiers */}
      <SolarAssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onNavigateToTab={onTabChange}
      />

      <SolarAlertTraceModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onNavigateToCases={() => onTabChange('cases')}
      />

      <SolarWorkOrderDetailModal
        workOrder={selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onOpenCompleteModal={(wo) => setCompletingWorkOrder(wo)}
      />

      <SolarCompleteMaintenanceModal
        workOrder={completingWorkOrder}
        onClose={() => setCompletingWorkOrder(null)}
      />
    </>
  );
};

export const SolarReliabilityModule: React.FC<SolarReliabilityModuleProps> = (props) => {
  return (
    <SolarReliabilityProvider>
      <SolarReliabilityInner {...props} />
    </SolarReliabilityProvider>
  );
};
