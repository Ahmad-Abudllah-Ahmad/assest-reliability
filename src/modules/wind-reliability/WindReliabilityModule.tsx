import React from 'react';
import { WindReliabilityProvider, useWindReliability } from './WindReliabilityContext';
import { WindCommandCenterView } from './components/WindCommandCenterView';
import { WindAssetsView } from './components/WindAssetsView';
import { WindAssetDetailModal } from './components/WindAssetDetailModal';
import { WindAlertsView } from './components/WindAlertsView';
import { WindAlertTraceModal } from './components/WindAlertTraceModal';
import { WindWorkOrdersView } from './components/WindWorkOrdersView';
import { WindWorkOrderDetailModal } from './components/WindWorkOrderDetailModal';
import { WindCompleteMaintenanceModal } from './components/WindCompleteMaintenanceModal';
import { WindRulesView } from './components/WindRulesView';

export interface WindReliabilityModuleProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onNavigateToCatalog?: () => void;
}

const WindReliabilityInner: React.FC<WindReliabilityModuleProps> = ({
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
  } = useWindReliability();

  return (
    <>
      {/* Page 1: Wind Reliability Command Center */}
      {(activeTab === 'overview' || activeTab === 'diagnostics') && (
        <WindCommandCenterView
          onNavigateToTab={onTabChange}
          onNavigateToCatalog={onNavigateToCatalog}
        />
      )}

      {/* Page 2: Assets */}
      {activeTab === 'assets' && (
        <WindAssetsView onNavigateToCatalog={onNavigateToCatalog} />
      )}

      {/* Page 3: Alerts & Recommendations with Interactive HMI */}
      {activeTab === 'alerts' && (
        <WindAlertsView onNavigateToCases={() => onTabChange('cases')} />
      )}

      {/* Page 4: Work Orders & Maintenance */}
      {(activeTab === 'cases' || activeTab === 'maintenance') && (
        <WindWorkOrdersView />
      )}

      {/* Page 5: Rules & Thresholds Engine */}
      {activeTab === 'rules' && (
        <WindRulesView />
      )}

      {/* Modals & Technical Dossiers */}
      <WindAssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onNavigateToTab={onTabChange}
      />

      <WindAlertTraceModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onNavigateToCases={() => onTabChange('cases')}
      />

      <WindWorkOrderDetailModal
        workOrder={selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onOpenCompleteModal={(wo) => setCompletingWorkOrder(wo)}
      />

      <WindCompleteMaintenanceModal
        workOrder={completingWorkOrder}
        onClose={() => setCompletingWorkOrder(null)}
      />
    </>
  );
};

export const WindReliabilityModule: React.FC<WindReliabilityModuleProps> = (props) => {
  return (
    <WindReliabilityProvider>
      <WindReliabilityInner {...props} />
    </WindReliabilityProvider>
  );
};
