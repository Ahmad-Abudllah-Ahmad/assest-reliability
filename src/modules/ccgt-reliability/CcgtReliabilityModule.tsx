import React from 'react';
import { CcgtReliabilityProvider, useCcgtReliability } from './CcgtReliabilityContext';
import { CcgtCommandCenterView } from './components/CcgtCommandCenterView';
import { CcgtAssetsView } from './components/CcgtAssetsView';
import { CcgtAssetDetailModal } from './components/CcgtAssetDetailModal';
import { CcgtAlertsView } from './components/CcgtAlertsView';
import { CcgtAlertTraceModal } from './components/CcgtAlertTraceModal';
import { CcgtWorkOrdersView } from './components/CcgtWorkOrdersView';
import { CcgtWorkOrderDetailModal } from './components/CcgtWorkOrderDetailModal';
import { CcgtCompleteMaintenanceModal } from './components/CcgtCompleteMaintenanceModal';
import { CcgtRulesView } from './components/CcgtRulesView';

interface CcgtReliabilityModuleProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onNavigateToCatalog?: () => void;
}

const CcgtReliabilityInner: React.FC<CcgtReliabilityModuleProps> = ({
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
  } = useCcgtReliability();

  return (
    <>
      {/* Page 1: Command Center */}
      {(activeTab === 'overview' || activeTab === 'diagnostics') && (
        <CcgtCommandCenterView
          onNavigateToTab={onTabChange}
          onNavigateToCatalog={onNavigateToCatalog}
        />
      )}

      {/* Page 2: Assets */}
      {activeTab === 'assets' && (
        <CcgtAssetsView onNavigateToCatalog={onNavigateToCatalog} />
      )}

      {/* Page 3: Alerts & Recommendations */}
      {activeTab === 'alerts' && (
        <CcgtAlertsView onNavigateToCases={() => onTabChange('cases')} />
      )}

      {/* Page 4: Work Orders & Maintenance */}
      {(activeTab === 'cases' || activeTab === 'maintenance') && (
        <CcgtWorkOrdersView />
      )}

      {/* Page 5: Rules & Thresholds Engine */}
      {activeTab === 'rules' && (
        <CcgtRulesView />
      )}

      {/* Modals & Slide-out Drawers */}
      <CcgtAssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onNavigateToTab={onTabChange}
      />

      <CcgtAlertTraceModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onNavigateToCases={() => onTabChange('cases')}
      />

      <CcgtWorkOrderDetailModal
        workOrder={selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        onOpenCompleteModal={(wo) => setCompletingWorkOrder(wo)}
      />

      <CcgtCompleteMaintenanceModal
        workOrder={completingWorkOrder}
        onClose={() => setCompletingWorkOrder(null)}
      />
    </>
  );
};

export const CcgtReliabilityModule: React.FC<CcgtReliabilityModuleProps> = (props) => {
  return (
    <CcgtReliabilityProvider>
      <CcgtReliabilityInner {...props} />
    </CcgtReliabilityProvider>
  );
};
