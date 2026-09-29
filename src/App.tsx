import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  Layers,
  Wrench,
  Download,
  Zap,
  Anchor,
  Droplets,
  Waves,
  Wind,
  Sun,
  BotMessageSquare
} from 'lucide-react';
import { LeftHoverNav } from './components/LeftHoverNav';
import { FacilityCatalog } from './components/FacilityCatalog';
import { Header } from './components/Header';
import { PlainEnglishModal } from './components/PlainEnglishModal';
import { MachineDiagnosticsView } from './components/MachineDiagnosticsView';
import { MonitoredAssetsView } from './components/MonitoredAssetsView';
import { MaintenanceInspectionsView } from './components/MaintenanceInspectionsView';
import { CasesBoardView } from './components/CasesBoardView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { InvestigationDrawer } from './components/InvestigationDrawer';
import { CreateCaseModal } from './components/CreateCaseModal';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { InspectionReportModal } from './components/InspectionReportModal';
import { Toast } from './components/Toast';
import { WindFarmView } from './components/renewables/WindFarmView';
import { SolarFarmView } from './components/renewables/SolarFarmView';
import { ContingencyScenario } from './components/PowerAssetFamilyCard';

// Offshore Oil & Gas Views & Data
import { OilGasHeader } from './components/oilgas/OilGasHeader';
import { OilGasOverviewView } from './components/oilgas/OilGasOverviewView';
import { OilGasEnvironmentalView } from './components/oilgas/OilGasEnvironmentalView';
import { OilGasStorageView } from './components/oilgas/OilGasStorageView';
import { OilGasAssetsView } from './components/oilgas/OilGasAssetsView';
import { OilGasCasesView } from './components/oilgas/OilGasCasesView';
import { OilGasPageHeader } from './components/oilgas/OilGasPageHeader';

import { 
  INITIAL_MACHINE_ASSETS, 
  INITIAL_CASES, 
  INITIAL_COMBUSTOR_CANS, 
  INITIAL_HEAT_RATE_DATA,
  INITIAL_MONITORED_ASSETS,
  INITIAL_OPTIMIZER_TASKS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_UNRESOLVED_INSPECTIONS,
  INITIAL_COMPLETED_INSPECTIONS
} from './mockData';

import {
  INITIAL_PRODUCTION_PULSE,
  INITIAL_GHG_EMISSIONS,
  INITIAL_STORAGE_LOGISTICS,
  INITIAL_ROTATING_RUL,
  INITIAL_WELLHEADS,
  INITIAL_SEPARATORS,
  INITIAL_STORAGE_TANKS,
  INITIAL_EXPORT_SYSTEM,
  INITIAL_FLARE_SYSTEM,
  INITIAL_OG_CASES
} from './data/oilGasMockData';

import { 
  ActiveTab, 
  MachineAsset, 
  CaseItem, 
  CaseStatus, 
  CaseSeverity, 
  ToastMessage,
  CombustorCan,
  HeatRateCurvePoint,
  MonitoredAsset,
  OptimizerTask,
  AssetMaintenanceRecord,
  UnresolvedAlertInspection,
  CompletedInspection
} from './types';

import { 
  OgActiveTab, 
  ProductionPulsePoint, 
  GhgEmissionRecord, 
  StorageExportPoint, 
  RotatingEquipmentRul, 
  OffshoreWellhead, 
  OffshoreSeparator, 
  OffshoreStorageTank, 
  OffshoreExportSystem, 
  OffshoreFlareSystem, 
  OgCaseItem,
  OgCaseStatus
} from './types/oilGasTypes';

export function App() {
  // Top-Level Facility Router State ('power' | 'oilgas' | 'catalog')
  const [activeFacility, setActiveFacility] = useState<'catalog' | 'power' | 'oilgas'>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'power' || hash === 'oilgas' || hash === 'catalog') return hash as any;
    }
    return 'power'; // Defaults directly to Power Generation Dashboard
  });

  // Facility-specific Navigation Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [ogActiveTab, setOgActiveTab] = useState<OgActiveTab>('overview');
  const [powerSourceTab, setPowerSourceTab] = useState<'gas' | 'wind' | 'solar'>('gas');

  // Synchronize routing with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'power' || hash === 'oilgas' || hash === 'catalog') {
        setActiveFacility(hash);
      } else if (hash === 'wind' || hash === 'solar' || hash === 'gas') {
        setActiveFacility('power');
        setPowerSourceTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectFacility = (facility: 'power' | 'oilgas', source?: 'gas' | 'wind' | 'solar') => {
    setActiveFacility(facility);
    if (source) {
      setPowerSourceTab(source);
      window.location.hash = source;
    } else {
      window.location.hash = facility;
    }
  };

  const handleBackToCatalog = () => {
    setActiveFacility('catalog');
    window.location.hash = 'catalog';
  };

  // Power Plant Global Real-time Surveillance KPIs
  const [currentMW, setCurrentMW] = useState<number>(462);
  const [targetMW, setTargetMW] = useState<number>(480);
  const [heatRate, setHeatRate] = useState<number>(6820);
  const [gridFrequency, setGridFrequency] = useState<number>(60.01);

  // SCADA Sync Surveillance
  const [isSyncingScada, setIsSyncingScada] = useState<boolean>(false);
  const [lastSyncSeconds, setLastSyncSeconds] = useState<number>(4);

  // Theme State (Dark / Light mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Core Power Data Stores
  const [machineAssets, setMachineAssets] = useState<MachineAsset[]>(INITIAL_MACHINE_ASSETS);
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [combustorCans, setCombustorCans] = useState<CombustorCan[]>(INITIAL_COMBUSTOR_CANS);
  const [heatRateData, setHeatRateData] = useState<HeatRateCurvePoint[]>(INITIAL_HEAT_RATE_DATA);
  const [monitoredAssets, setMonitoredAssets] = useState<MonitoredAsset[]>(INITIAL_MONITORED_ASSETS);
  const [optimizerTasks, setOptimizerTasks] = useState<OptimizerTask[]>(INITIAL_OPTIMIZER_TASKS);

  // Maintenance & Inspections Data Store (Power)
  const [maintenanceRecords, setMaintenanceRecords] = useState<AssetMaintenanceRecord[]>(INITIAL_MAINTENANCE_RECORDS);
  const [unresolvedInspections, setUnresolvedInspections] = useState<UnresolvedAlertInspection[]>(INITIAL_UNRESOLVED_INSPECTIONS);
  const [completedInspections, setCompletedInspections] = useState<CompletedInspection[]>(INITIAL_COMPLETED_INSPECTIONS);

  // Core Offshore Oil & Gas Data Stores
  const [ogPulseData, setOgPulseData] = useState<ProductionPulsePoint[]>(INITIAL_PRODUCTION_PULSE);
  const [ogGhgData, setOgGhgData] = useState<GhgEmissionRecord[]>(INITIAL_GHG_EMISSIONS);
  const [ogStorageData, setOgStorageData] = useState<StorageExportPoint[]>(INITIAL_STORAGE_LOGISTICS);
  const [ogRotatingEquipment, setOgRotatingEquipment] = useState<RotatingEquipmentRul[]>(INITIAL_ROTATING_RUL);
  const [ogWellheads, setOgWellheads] = useState<OffshoreWellhead[]>(INITIAL_WELLHEADS);
  const [ogSeparators, setOgSeparators] = useState<OffshoreSeparator[]>(INITIAL_SEPARATORS);
  const [ogTanks, setOgTanks] = useState<OffshoreStorageTank[]>(INITIAL_STORAGE_TANKS);
  const [ogExportSystem, setOgExportSystem] = useState<OffshoreExportSystem>(INITIAL_EXPORT_SYSTEM);
  const [ogFlareSystem, setOgFlareSystem] = useState<OffshoreFlareSystem>(INITIAL_FLARE_SYSTEM);
  const [ogCases, setOgCases] = useState<OgCaseItem[]>(INITIAL_OG_CASES);

  // Modals & Drawers
  const [selectedAsset, setSelectedAsset] = useState<MachineAsset | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [selectedInspectionReport, setSelectedInspectionReport] = useState<CompletedInspection | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // Active Contingency Trip Simulation State
  const [simulatedScenario, setSimulatedScenario] = useState<ContingencyScenario | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [{ id, type, title, message }, ...prev].slice(0, 4));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Real-time grid frequency micro-jitter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds(prev => prev + 1);
      setGridFrequency(60.0 + (Math.random() - 0.48) * 0.02);
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  // Action: SCADA Handshake Sync
  const handleSyncScada = () => {
    setIsSyncingScada(true);
    const facilityName = activeFacility === 'power' ? 'Power Station' : 'FPSO Platform';
    addToast('info', `Syncing ${facilityName} Telemetry`, 'Reconciling multi-channel SCADA & DCS analog stream...');

    setTimeout(() => {
      setIsSyncingScada(false);
      setLastSyncSeconds(0);
      setGridFrequency(60.00);
      addToast('success', `${facilityName} Synchronized`, 'All telemetry, vibration spectra, and pressure sensors refreshed.');
    }, 1000);
  };

  // Action: Advisory Actions from Asset Card
  const handleAdvisoryAction = (
    actionType: string, 
    asset: MachineAsset, 
    casePayload?: any
  ) => {
    if (actionType === 'log_case') {
      const existingCase = cases.find(c => c.equipment === asset.name);
      if (existingCase) {
        setActiveTab('cases');
        setSelectedCase(existingCase);
        addToast('info', 'Opening Existing Work Order', `Navigated to open case ${existingCase.id} on the Cases Board.`);
        return;
      }

      const newCaseId = `CAS-00${cases.length + 1}`;
      const newCase: CaseItem = {
        id: newCaseId,
        title: casePayload?.title || `Diagnostic inspection for ${asset.name}`,
        equipment: asset.name,
        assignee: 'Bob Smith',
        severity: casePayload?.severity || (asset.status === 'critical' ? 'Critical' : 'High'),
        status: 'Diagnosing',
        timestamp: 'Just now',
        rootCause: casePayload?.rootCause || asset.aiRunningInsight,
        requiredParts: ['Standard Diagnostic Kit', 'Thermocouple Replacement Bundle'],
        estimatedTime: '2.5 Hours',
        metricName: casePayload?.metricName || 'Sensor Variance',
        observedValue: casePayload?.observedValue || 'Alert Limit Exceeded',
        thresholdValue: casePayload?.thresholdValue || 'Nominal Range',
        telemetryPoints: asset.temperatureHistory.map(h => ({
          time: h.time,
          value: h.temp,
          baseline: h.benchmark,
          unit: '°C'
        }))
      };

      setCases(prev => [newCase, ...prev]);
      setActiveTab('cases');
      setSelectedCase(newCase);
      addToast('success', `Investigation Case Logged (${newCaseId})`, `Work order ticket generated for ${asset.name}. Assigned to Bob Smith.`);
    } else if (actionType === 'assign_engineer') {
      addToast('info', 'Field Engineer Dispatched', `Bob Smith (Thermal Specialist) dispatched to ${asset.name}.`);
    } else if (actionType === 'export_package') {
      addToast('success', 'Diagnostic Package Exported', `Generated full SCADA CSV & telemetry trace for ${asset.name}.`);
    }
  };

  // Action: Log EGT Combustor Case
  const handleLogEgtCase = () => {
    const existingCase = cases.find(c => c.id === 'CAS-001');
    if (existingCase) {
      setActiveTab('cases');
      setSelectedCase(existingCase);
      addToast('info', 'Viewing Existing Ticket', 'Opening CAS-001 on Cases Board.');
    } else {
      const newCase: CaseItem = {
        id: 'CAS-001',
        title: 'Exhaust gas Cylinder variance check',
        equipment: 'Gas Turbine GT-2',
        assignee: 'Bob Smith',
        severity: 'High',
        status: 'Diagnosing',
        timestamp: 'Just now',
        rootCause: 'Combustor Can 4 is running 26°C below average due to fuel nozzle 4 servo valve drift, resulting in automated 18 MW derating.',
        requiredParts: ['Part #GE-7F-NZ4: Replacement Nozzle O-Ring Kit', 'Hydraulic Servo Valve (Moog G761)', 'High-Temp Annular Gaskets'],
        estimatedTime: '3.5 Hours',
        metricName: 'EGT Spread',
        observedValue: '26.0°C Spread (Can 4: 578°C)',
        thresholdValue: '18.0°C Max Allowable',
        telemetryPoints: [
          { time: '10:00', value: 16, baseline: 18, unit: '°C' },
          { time: '11:00', value: 19, baseline: 18, unit: '°C' },
          { time: '12:00', value: 22, baseline: 18, unit: '°C' },
          { time: '13:00', value: 24, baseline: 18, unit: '°C' },
          { time: '14:00', value: 26, baseline: 18, unit: '°C' }
        ]
      };
      setCases(prev => [newCase, ...prev]);
      setActiveTab('cases');
      setSelectedCase(newCase);
      addToast('success', 'Case Logged (CAS-001)', 'Combustor EGT Can 4 investigation ticket created.');
    }
  };

  // Action: Log Heat Rate Case
  const handleLogHeatRateCase = () => {
    const existingCase = cases.find(c => c.id === 'CAS-005');
    if (existingCase) {
      setActiveTab('cases');
      setSelectedCase(existingCase);
      addToast('info', 'Viewing Existing Ticket', 'Opening CAS-005 on Cases Board.');
    } else {
      const newCase: CaseItem = {
        id: 'CAS-005',
        title: 'ST-1 Surface condenser tube bio-fouling & vacuum degradation',
        equipment: 'Steam Turbine ST-1',
        assignee: 'Water Treatment Team',
        severity: 'Medium',
        status: 'Diagnosing',
        timestamp: 'Just now',
        rootCause: 'Cooling water tube bank bio-fouling elevating backpressure to 0.11 bar (0.07 bar design), causing +120 BTU/kWh penalty.',
        requiredParts: ['Condenser Tube Scraping Bullets (x200)', 'Citric Acid Descaling Wash Skid'],
        estimatedTime: '45 Mins',
        metricName: 'Condenser Vacuum',
        observedValue: '0.11 bar (Degraded)',
        thresholdValue: '0.07 bar Design',
        telemetryPoints: [
          { time: '10:00', value: 0.08, baseline: 0.07, unit: 'bar' },
          { time: '11:00', value: 0.09, baseline: 0.07, unit: 'bar' },
          { time: '12:00', value: 0.10, baseline: 0.07, unit: 'bar' },
          { time: '13:00', value: 0.11, baseline: 0.07, unit: 'bar' },
          { time: '14:00', value: 0.11, baseline: 0.07, unit: 'bar' }
        ]
      };
      setCases(prev => [newCase, ...prev]);
      setActiveTab('cases');
      setSelectedCase(newCase);
      addToast('success', 'Case Logged (CAS-005)', 'ST-1 Condenser vacuum investigation case registered.');
    }
  };

  // Action: Update Case Status
  const handleUpdateCaseStatus = (id: string, newStatus: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
    }
    addToast('info', 'Status Updated', `Case ${id} moved to "${newStatus}".`);
  };

  // Action: Add New Machinery / Component
  const handleAddMonitoredAsset = (newAsset: MonitoredAsset) => {
    setMonitoredAssets(prev => [newAsset, ...prev]);
    addToast('success', 'Machinery Registered', `${newAsset.name} (${newAsset.code}) added to monitored fleet.`);
  };

  // Action: Update Case Severity
  const handleUpdateCaseSeverity = (id: string, newSeverity: CaseSeverity) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, severity: newSeverity } : c));
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase(prev => prev ? { ...prev, severity: newSeverity } : null);
    }
    addToast('info', 'Severity Updated', `Case ${id} priority set to "${newSeverity}".`);
  };

  // Action: Update O&G Case Status
  const handleUpdateOgCaseStatus = (id: string, newStatus: OgCaseStatus) => {
    setOgCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase(prev => prev ? { ...prev, status: newStatus as CaseStatus } : null);
    }
    addToast('info', 'PTW Status Updated', `Offshore Work Order ${id} updated to "${newStatus}".`);
  };

  // Action: Dispatch Work Order from Drawer
  const handleDispatchWorkOrder = (caseItem: CaseItem) => {
    handleUpdateCaseStatus(caseItem.id, 'Planned Maintenance');
    setSelectedCase(null);
    addToast(
      'success',
      `Work Order Dispatched (WO-${caseItem.id.replace('CAS-', '').replace('OG-', '')})`,
      `Notification sent to ${caseItem.assignee}. Required spare parts reserved.`
    );
  };

  // Action: Create Custom Case from Modal
  const handleCreateCustomCase = (caseData: Omit<CaseItem, 'id' | 'timestamp' | 'telemetryPoints'>) => {
    const newCaseId = activeFacility === 'power' ? `CAS-00${cases.length + 1}` : `OG-00${ogCases.length + 1}`;
    
    if (activeFacility === 'power') {
      const newCase: CaseItem = {
        id: newCaseId,
        ...caseData,
        timestamp: 'Just now',
        telemetryPoints: [
          { time: '10:00', value: 100, baseline: 100, unit: '%' },
          { time: '11:00', value: 102, baseline: 100, unit: '%' },
          { time: '12:00', value: 105, baseline: 100, unit: '%' }
        ]
      };
      setCases(prev => [newCase, ...prev]);
    } else {
      const newOgCase: OgCaseItem = {
        id: newCaseId,
        title: caseData.title,
        equipment: caseData.equipment,
        equipmentTag: 'OFFSHORE-PTW',
        severity: caseData.severity,
        assignee: caseData.assignee,
        status: caseData.status as OgCaseStatus,
        timestamp: 'Just now',
        rootCause: caseData.rootCause || 'Manual offshore permit logged by control room.',
        permitRequired: 'Cold Work Permit',
        requiredParts: caseData.requiredParts && caseData.requiredParts.length > 0 ? caseData.requiredParts : ['General Maintenance Kit'],
        estimatedTime: caseData.estimatedTime || '3.0 Hours',
        metricName: caseData.metricName || 'Offshore Surveillance',
        observedValue: caseData.observedValue || 'Manual PTW',
        thresholdValue: caseData.thresholdValue || 'Safe Operating Envelope',
        telemetryPoints: [
          { time: '08:00', value: 50, baseline: 50, unit: 'bar' },
          { time: '12:00', value: 55, baseline: 50, unit: 'bar' }
        ]
      };
      setOgCases(prev => [newOgCase, ...prev]);
    }

    addToast('success', `Case Created (${newCaseId})`, `Work order ticket "${caseData.title}" logged successfully.`);
  };

  // Action: Schedule Unresolved Inspection
  const handleScheduleInspection = (inspection: UnresolvedAlertInspection | string) => {
    const inspectionId = typeof inspection === 'string' ? inspection : inspection.id;
    setUnresolvedInspections(prev => prev.map(item => {
      if (item.id === inspectionId) {
        return { ...item, status: 'Scheduled' as const };
      }
      return item;
    }));
    addToast('success', `Inspection Scheduled (${inspectionId})`, 'Assigned to Lead Inspector for execution during next window.');
  };

  // Action: View Inspection Report
  const handleViewReport = (inspection: CompletedInspection) => {
    setSelectedInspectionReport(inspection);
  };

  // Action: Download Signed Inspection Dossier
  const handleDownloadReportPdf = (inspection: CompletedInspection) => {
    const reportContent = `
================================================================================
SPARK AI STATION — CERTIFIED MECHANICAL INTEGRITY & NDT AUDIT DOSSIER
================================================================================
Report Tracking ID: ${inspection.id}
Target Asset:       ${inspection.asset}
Inspection Date:    ${inspection.inspectionDate}
Lead Inspector:     ${inspection.inspector} (ISO 9712 Level III Mechanical Integrity)
Audit Status:       ${inspection.resultStatus.toUpperCase()} - NERC & OSHA COMPLIANT
Generated At:       ${new Date().toLocaleString()}
Surveillance Mode:  DCS Read-Only Integrity Record
--------------------------------------------------------------------------------

FIELD SCOPE & METHODOLOGY:
${inspection.inspectionType}
Conducted in strict accordance with ASME Section V & API-670 Standard Surveillance Guidelines.

METALLURGICAL & DIAGNOSTIC FINDINGS:
"${inspection.findings}"

VERIFICATION & CERTIFICATE SIGN-OFF:
Digital Certificate Hash: SHA256:${inspection.id.toLowerCase()}8f94d1b72a4e
Signed & Authenticated for Spark AI Block 1 Combined Cycle Facility.
================================================================================
`.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inspection-Report-${inspection.id}-${inspection.asset.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    addToast('success', `Report Dossier Downloaded (#${inspection.id})`, `Audit file for ${inspection.asset} saved successfully.`);
  };

  // Action: Export Shift Priority Brief
  const handleExportPriorityBrief = () => {
    const briefContent = `
SPARK AI STATION — 500 MW COMBINED CYCLE BLOCK 1
SHIFT PRIORITY & MAINTENANCE DISPATCH BRIEF
Generated: ${new Date().toLocaleString()}
Surveillance Regime: Read-Only SCADA & DCS Advisory

EXECUTIVE SUMMARY:
- Total Potential Weekly Financial Savings: $48,600 / week
- Total Unplanned Downtime Avoided: 34.5 Hours
- Primary Operational Bottleneck: GT-2 Can 4 Thermal Spread before 17:30 peak ($145/MWh LMP)

RANKED PRIORITY SEQUENCE:
1. Inspect & Calibrate GT-2 Fuel Nozzle 4 (Case CAS-001) | Avoids 14h derate + 48h trip risk | Savings: +$29,500 | Tech: Bob Smith
2. Condenser Cooling Tube Backwash Cycle (ST-1) | 0 downtime online | Savings: +$9,120/week | Tech: Water Treatment Team
3. Lube Oil Filter Flush & Metallic Wear Sampling (Case CAS-003) | Avoids 120h forced outage | Savings: +$140,000 | Tech: Charlie Davis
4. Gearbox Pinion Mesh Alignment Verification (Case CAS-002) | 4.5h avoided outage | Savings: +$3,200 | Tech: Alice Johnson
5. Secondary Seal Vent Pressure Audit (Case CAS-004) | 2.0h audit | Savings: +$1,850 | Tech: Alice Johnson
    `.trim();

    const blob = new Blob([briefContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Spark-AI-Shift-Priority-Brief-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    addToast('success', 'Shift Priority Brief Exported', 'Shift priority brief document generated and ready for shift handover.');
  };

  // Action: Execute Optimizer Task
  const handleExecuteOptimizerTask = (task: OptimizerTask) => {
    setOptimizerTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return { ...t, status: 'Authorized' as const };
      }
      return t;
    }));
    addToast('success', `Task Authorized (#${task.rank})`, task.actionToast);
  };

  // Action: Monitored Asset Deep Dive Modal
  const handleSelectMonitoredAsset = (asset: MonitoredAsset) => {
    const targetMachineAsset = machineAssets.find(m => m.id === asset.id);
    if (targetMachineAsset) {
      setSelectedAsset(targetMachineAsset);
    } else {
      addToast('info', `Asset Selected: ${asset.name}`, `Opening telemetry overview for ${asset.category} (${asset.code}).`);
    }
  };

  // Action: Log Case from Monitored Asset Card
  const handleLogCaseFromMonitoredAsset = (asset: MonitoredAsset) => {
    const existingCase = cases.find(c => c.equipment.includes(asset.code) || c.equipment.includes(asset.name));
    if (existingCase) {
      setActiveTab('cases');
      setSelectedCase(existingCase);
      addToast('info', 'Viewing Existing Ticket', `Opening ${existingCase.id} on Cases Board.`);
    } else {
      const newCaseId = `CAS-00${cases.length + 1}`;
      const newCase: CaseItem = {
        id: newCaseId,
        title: `Mechanical anomaly investigation for ${asset.name}`,
        equipment: `${asset.name} (${asset.code})`,
        assignee: 'Alice Johnson',
        severity: asset.healthScore < 80 ? 'Critical' : 'High',
        status: 'Diagnosing',
        timestamp: 'Just now',
        rootCause: asset.aiSummary,
        requiredParts: ['Inspection Gasket Pack', 'Vibration Transducer Probe'],
        estimatedTime: '2.0 Hours',
        metricName: 'Asset Health Score',
        observedValue: `${asset.healthScore}% (${asset.statusText})`,
        thresholdValue: '90% Target Baseline',
        telemetryPoints: asset.healthTrend7d.map(h => ({
          time: h.day,
          value: h.score,
          baseline: 90,
          unit: '%'
        }))
      };

      setCases(prev => [newCase, ...prev]);
      setActiveTab('cases');
      setSelectedCase(newCase);
      addToast('success', `Case Logged (${newCaseId})`, `Work order ticket registered for ${asset.name}.`);
    }
  };

  // Action: Navigate from Diagnostics to Task Optimizer
  const handleNavigateToOptimizer = () => {
    setActiveTab('cases');
  };

  // Action: Toggle Contingency Simulation
  const handleToggleSimulateScenario = (scenario: ContingencyScenario) => {
    if (simulatedScenario && simulatedScenario.id === scenario.id) {
      setSimulatedScenario(null);
      setCurrentMW(462);
      addToast('info', 'Contingency Simulation Deactivated', `Restored normal plant baseline dispatch (462 MW).`);
    } else {
      setSimulatedScenario(scenario);
      setCurrentMW(scenario.totalDropTo);
      addToast('warning', `Contingency Simulation Active: ${scenario.code} Trip`, `Simulating sudden loss of ${scenario.directLossMW} MW. Total output depressed to ${scenario.totalDropTo} MW.`);
    }
  };

  // Action: Log Emergency Contingency Risk Case
  const handleLogEmergencyCase = (scenario: ContingencyScenario) => {
    const existingCase = cases.find(c => c.id === 'CAS-006' || c.title.includes(scenario.code));
    if (existingCase) {
      setActiveTab('cases');
      setSelectedCase(existingCase);
      addToast('info', 'Viewing Existing Ticket', `Opening emergency contingency case ${existingCase.id} on Cases Board.`);
    } else {
      const newCaseId = `CAS-006`;
      const newCase: CaseItem = {
        id: newCaseId,
        title: `${scenario.code} Contingency Risk Mitigations & Fast Reserve Activation`,
        equipment: scenario.name,
        assignee: 'Chief Shift Engineer',
        severity: 'Critical',
        status: 'Diagnosing',
        timestamp: 'Just now',
        rootCause: scenario.failureDescription,
        requiredParts: ['NERC BAL-002 Compliance Log', 'Hydro Peaker #2 Telemetry Link', 'Duct Burner Actuator Spares'],
        estimatedTime: '1.0 Hour',
        metricName: 'Generation Drop',
        observedValue: `-${scenario.directLossMW + scenario.cascadingLossMW} MW Total Deficit`,
        thresholdValue: 'Full Load (462 MW)',
        telemetryPoints: [
          { time: '10:00', value: 462, baseline: 480, unit: 'MW' },
          { time: '11:00', value: 462, baseline: 480, unit: 'MW' },
          { time: '12:00', value: 462, baseline: 480, unit: 'MW' },
          { time: '13:00', value: scenario.totalDropTo, baseline: 480, unit: 'MW' }
        ]
      };

      setCases(prev => [newCase, ...prev]);
      setActiveTab('cases');
      setSelectedCase(newCase);
      addToast('warning', `Emergency Risk Case Logged (${newCaseId})`, `Created high-priority contingency work order for ${scenario.code} failure simulation on Cases Board.`);
    }
  };

  // Action: Log Case for O&G Rotating Equipment
  const handleLogOgCaseForAsset = (equipment: RotatingEquipmentRul) => {
    const existingCase = ogCases.find(c => c.equipmentTag === equipment.tag);
    if (existingCase) {
      setOgActiveTab('cases');
      setSelectedCase(existingCase as unknown as CaseItem);
      addToast('info', 'Opening Existing Work Order', `Navigated to open permit ${existingCase.id} for ${equipment.name}.`);
      return;
    }

    const newCaseId = `OG-00${ogCases.length + 1}`;
    const newOgCase: OgCaseItem = {
      id: newCaseId,
      title: `${equipment.name} Predictive RUL & Vibration Remediation`,
      equipment: equipment.name,
      equipmentTag: equipment.tag,
      assignee: 'Marcus Vance (Senior Rotating Equipment Lead)',
      severity: equipment.rulPercent < 70 ? 'Critical' : 'High',
      status: 'Diagnosing',
      timestamp: 'Just now',
      rootCause: equipment.diagnosticFinding,
      permitRequired: 'Cold Work Permit',
      requiredParts: ['Acoustic Vibration Accelerometer', 'Bearing Synthetic Lube Flush Kit', 'Precision Alignment Shims'],
      estimatedTime: '3.5 Hours',
      metricName: 'RUL Status',
      observedValue: `${equipment.rulPercent}% RUL (${equipment.vibrationRmsMmS} mm/s RMS)`,
      thresholdValue: '80% RUL Minimum',
      telemetryPoints: [
        { time: '08:00', value: 85, baseline: 80, unit: '%' },
        { time: '10:00', value: 80, baseline: 80, unit: '%' },
        { time: '12:00', value: 76, baseline: 80, unit: '%' },
        { time: '14:00', value: equipment.rulPercent, baseline: 80, unit: '%' }
      ]
    };

    setOgCases(prev => [newOgCase, ...prev]);
    setOgActiveTab('cases');
    setSelectedCase(newOgCase as unknown as CaseItem);
    addToast('success', `Offshore Work Order Created (${newCaseId})`, `Permit to work generated for ${equipment.name}.`);
  };

  // Copilot Action Execution
  const handleCopilotAction = (actionLabel: string, casePayload?: any) => {
    if (actionLabel.includes('Condenser') || actionLabel.includes('Backwash')) {
      handleLogHeatRateCase();
    } else {
      const newCaseId = activeFacility === 'power' ? `CAS-00${cases.length + 1}` : `OG-00${ogCases.length + 1}`;
      const newCase: CaseItem = {
        id: newCaseId,
        title: casePayload?.title || actionLabel,
        equipment: casePayload?.equipment || (activeFacility === 'power' ? 'Spark AI Block 1 Asset' : 'FPSO Leviathan Alpha Asset'),
        assignee: 'Bob Smith',
        severity: casePayload?.severity || 'High',
        status: 'Diagnosing',
        timestamp: 'Just now',
        rootCause: 'Created via AI Copilot diagnostic inquiry.',
        requiredParts: ['Standard Diagnostic Kit'],
        estimatedTime: '2.5 Hours',
        metricName: 'Operating Limit',
        observedValue: 'Alert Exceedance',
        thresholdValue: 'Design Spec',
        telemetryPoints: [
          { time: '10:00', value: 100, baseline: 100, unit: '%' },
          { time: '11:00', value: 105, baseline: 100, unit: '%' },
          { time: '12:00', value: 108, baseline: 100, unit: '%' }
        ]
      };
      setCases(prev => [newCase, ...prev]);
      if (activeFacility === 'power') setActiveTab('cases');
      setSelectedCase(newCase);
      addToast('success', `Ticket Logged via AI Copilot (${newCaseId})`, `Work order ticket registered.`);
    }
  };

  const openCases = cases.filter(c => c.status !== 'Closed');
  const openOgCases = ogCases.filter(c => c.status !== 'Closed');

  // VIEW 1: HOME CATALOG LANDING PAGE
  if (activeFacility === 'catalog') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <FacilityCatalog onSelectFacility={handleSelectFacility} />
        <Toast toasts={toasts} onDismiss={removeToast} />

        {/* Floating Circular Chatbot Button (Bottom Right) */}
        {!isCopilotOpen && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="relative h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-500/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 group"
              title="Open Plant Copilot (AI SCADA)"
              aria-label="Open Plant Copilot"
            >
              <BotMessageSquare className="h-6 w-6 text-white transition-transform duration-200 group-hover:scale-110" />

              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>

              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 border border-slate-700/80 flex items-center gap-1.5">
                <span>Plant Copilot</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/60">
                  AI SCADA
                </span>
              </span>
            </button>
          </div>
        )}

        <AiCopilotDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          onExecuteAction={handleCopilotAction}
          onOpenJargonGuide={() => setIsGlossaryOpen(true)}
        />

        <PlainEnglishModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
          defaultCategory="Power Plant"
        />
      </div>
    );
  }

  const isSingleScreenDashboard = (
    activeFacility === 'power' || activeFacility === 'oilgas'
  );

  // VIEW 2: FACILITY COCKPIT (Power Generation vs Offshore Oil & Gas)
  return (
    <div className={`bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased transition-colors duration-200 ${
      isSingleScreenDashboard ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen pb-24'
    }`}>
      
      {/* Sleek Left-Side Hover-Expanding Navigation Dock */}
      <LeftHoverNav
        facility={activeFacility}
        activeTab={activeFacility === 'power' ? activeTab : ogActiveTab}
        onTabChange={(tab) => {
          if (activeFacility === 'power') {
            setActiveTab(tab as ActiveTab);
          } else {
            setOgActiveTab(tab as OgActiveTab);
          }
        }}
        onNavigateToCatalog={handleBackToCatalog}
        openCasesCount={activeFacility === 'power' ? openCases.length : openOgCases.length}
        unresolvedInspectionsCount={unresolvedInspections.filter(i => i.status === 'Unscheduled').length}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenJargonGuide={() => setIsGlossaryOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className={`flex-1 w-full max-w-[2100px] mx-auto transition-all ${
        isSingleScreenDashboard
          ? 'p-2 sm:p-2.5 2xl:p-3 pb-20 sm:pb-20 lg:pb-20 h-full max-h-screen overflow-hidden flex flex-col min-h-0'
          : 'p-4 sm:p-6 2xl:p-8 space-y-6 2xl:space-y-8'
      }`}>
        
        {/* ========================================================================= */}
        {/* FACILITY A: POWER GENERATION FACILITY                                    */}
        {/* ========================================================================= */}
        {activeFacility === 'power' && (
          <>
            {powerSourceTab === 'gas' && (
          <>
            {/* Page 1: Plant Overview & EDA Charts */}
            {(activeTab === 'overview' || activeTab === 'diagnostics') && (
              <MachineDiagnosticsView
                assets={machineAssets}
                combustorCans={combustorCans}
                heatRateData={heatRateData}
                currentMW={currentMW}
                targetMW={targetMW}
                heatRate={heatRate}
                currentMargin={4120}
                fleetHealthPct={88}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
                onAdvisoryAction={handleAdvisoryAction}
                onLogEgtCase={handleLogEgtCase}
                onLogHeatRateCase={handleLogHeatRateCase}
                onNavigateToOptimizer={handleNavigateToOptimizer}
                onNavigateToCatalog={handleBackToCatalog}
                onLogEmergencyCase={handleLogEmergencyCase}
                simulatedScenario={simulatedScenario}
                onToggleSimulateScenario={handleToggleSimulateScenario}
                onOpenJargonGuide={() => setIsGlossaryOpen(true)}
                onOpenCase={(caseId) => {
                  const targetCase = cases.find(c => c.id === caseId);
                  setActiveTab('cases');
                  if (targetCase) setSelectedCase(targetCase);
                }}
              />
            )}

            {/* Page 2: All Monitored Assets Directory */}
            {activeTab === 'assets' && (
              <MonitoredAssetsView
                assets={monitoredAssets}
                onSelectAsset={handleSelectMonitoredAsset}
                onLogCase={handleLogCaseFromMonitoredAsset}
                onNavigateToCatalog={handleBackToCatalog}
                onAddAsset={handleAddMonitoredAsset}
              />
            )}

            {/* Page 3: Maintenance Records & Asset Inspections */}
            {activeTab === 'maintenance' && (
              <MaintenanceInspectionsView
                maintenanceRecords={maintenanceRecords}
                unresolvedInspections={unresolvedInspections}
                completedInspections={completedInspections}
                onScheduleInspection={handleScheduleInspection}
                onViewReport={handleViewReport}
                onNavigateToCatalog={handleBackToCatalog}
              />
            )}


            {/* Page 5: Cases & Work Orders Kanban Board */}
            {activeTab === 'cases' && (
              <CasesBoardView
                cases={cases}
                onOpenCreateModal={() => setIsCreateCaseOpen(true)}
                onSelectCase={(c) => setSelectedCase(c)}
                onUpdateCaseStatus={handleUpdateCaseStatus}
                onUpdateCaseSeverity={handleUpdateCaseSeverity}
                onNavigateToCatalog={handleBackToCatalog}
              />
            )}
          </>
            )}

            {powerSourceTab === 'wind' && (
              <WindFarmView activeTab={activeTab} setActiveTab={setActiveTab} onNavigateToCatalog={handleBackToCatalog} />
            )}

            {powerSourceTab === 'solar' && (
              <SolarFarmView activeTab={activeTab} setActiveTab={setActiveTab} onNavigateToCatalog={handleBackToCatalog} />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* FACILITY B: OFFSHORE OIL & GAS PRODUCTION DASHBOARD                      */}
        {/* ========================================================================= */}
        {activeFacility === 'oilgas' && (
          <>
            {/* Page 1: Production Overview & The Production Pulse */}
            {ogActiveTab === 'overview' && (
              <OilGasOverviewView
                pulseData={ogPulseData}
                wellheads={ogWellheads}
                separators={ogSeparators}
                rotatingEquipment={ogRotatingEquipment}
                storageTanks={ogTanks}
                onNavigateToTab={(tab) => setOgActiveTab(tab)}
                onSelectCase={(caseId) => {
                  const targetCase = ogCases.find(c => c.id === caseId);
                  setOgActiveTab('cases');
                  if (targetCase) setSelectedCase(targetCase as unknown as CaseItem);
                }}
                onLogEmergencyCase={() => {
                  addToast('warning', 'ESD Drill Notification', 'Emergency Shutdown drill advisory logged in offshore control room.');
                }}
                onOpenJargonGuide={() => setIsGlossaryOpen(true)}
              />
            )}

            {/* Page 2: Production Wellheads & 3-Phase Separation */}
            {ogActiveTab === 'production' && (
              <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-3 animate-fadeIn">
                <div className="shrink-0">
                  <OilGasPageHeader
                    title="Subsea Wellheads & 3-Phase Separation"
                    subtitle="Subsea production manifolds, seabed choke valves, and high-pressure separation trains"
                    icon={Droplets}
                    badgeText="4 Wells Online"
                    badgeColor="emerald"
                    onNavigateToCatalog={handleBackToCatalog}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                  {/* Detailed Wellheads List */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-xs flex flex-col min-h-0">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-2.5 shrink-0">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          Subsea Production Wellheads (Manifolds North &amp; South)
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        {ogWellheads.reduce((acc, w) => acc + w.dailyCrudeBpd, 0).toLocaleString()} bpd
                      </span>
                    </div>

                    <div className="space-y-2 mt-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                      {ogWellheads.map((well) => (
                        <div key={well.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{well.wellName} ({well.slotNumber})</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{well.dailyCrudeBpd.toLocaleString()} bpd</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                            <div>Casing: <strong className="text-slate-800 dark:text-slate-200 font-mono">{well.casingPressurePsi} psi</strong></div>
                            <div>Tubing: <strong className="text-slate-800 dark:text-slate-200 font-mono">{well.tubingHeadPressurePsi} psi</strong></div>
                            <div>Choke: <strong className="text-slate-800 dark:text-slate-200 font-mono">{well.chokeValvePct}%</strong></div>
                            <div>BSW: <strong className="text-slate-800 dark:text-slate-200 font-mono">{well.bswCutPct}%</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Separators List */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-xs flex flex-col min-h-0">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-2.5 shrink-0">
                      <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-cyan-600" />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          Production Separators &amp; Test Metering Vessels
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-blue-600">3 Units Online</span>
                    </div>

                    <div className="space-y-2 mt-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                      {ogSeparators.map((sep) => (
                        <div key={sep.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{sep.tag} • {sep.name}</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{sep.operatingPressureBar} bar</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                            <div>Liq Level: <strong className="text-slate-800 dark:text-slate-200 font-mono">{sep.liquidLevelPct}%</strong></div>
                            <div>Oil Level: <strong className="text-slate-800 dark:text-slate-200 font-mono">{sep.oilLevelPct}%</strong></div>
                            <div>Water Cut: <strong className="text-slate-800 dark:text-slate-200 font-mono">{sep.waterCutBswPct}%</strong></div>
                            <div>Gas Out: <strong className="text-slate-800 dark:text-slate-200 font-mono">{sep.gasOutletRateMmscfd} MMscf/d</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: Asset Health & RUL */}
            {ogActiveTab === 'assets' && (
              <OilGasAssetsView
                equipmentList={ogRotatingEquipment}
                separators={ogSeparators}
                wellheads={ogWellheads}
                storageTanks={ogTanks}
                onLogCaseForAsset={handleLogOgCaseForAsset}
                onOpenJargonGuide={() => setIsGlossaryOpen(true)}
              />
            )}

            {/* Page 4: Storage & Export Logistics */}
            {ogActiveTab === 'storage' && (
              <OilGasStorageView
                storageData={ogStorageData}
                tanks={ogTanks}
                exportSystem={ogExportSystem}
              />
            )}

            {/* Page 5: GHG Emissions & Flare Stack */}
            {ogActiveTab === 'environmental' && (
              <OilGasEnvironmentalView
                ghgData={ogGhgData}
                flareSystem={ogFlareSystem}
              />
            )}

            {/* Page 6: Cases & PTW Safety Permits */}
            {ogActiveTab === 'cases' && (
              <OilGasCasesView
                cases={ogCases}
                onSelectCase={(c) => setSelectedCase(c as unknown as CaseItem)}
                onUpdateCaseStatus={handleUpdateOgCaseStatus}
                onOpenCreateModal={() => setIsCreateCaseOpen(true)}
              />
            )}
          </>
        )}

      </main>

      {/* Shared Modals & Slide-out Drawers */}
      <AssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onAdvisoryAction={handleAdvisoryAction}
      />

      <InvestigationDrawer
        selectedCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdateStatus={handleUpdateCaseStatus}
        onDispatchAction={handleDispatchWorkOrder}
      />

      <CreateCaseModal
        isOpen={isCreateCaseOpen}
        onClose={() => setIsCreateCaseOpen(false)}
        onSubmit={handleCreateCustomCase}
      />

      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onExecuteAction={handleCopilotAction}
        onOpenJargonGuide={() => setIsGlossaryOpen(true)}
      />

      <InspectionReportModal
        inspection={selectedInspectionReport}
        onClose={() => setSelectedInspectionReport(null)}
        onDownloadPdf={handleDownloadReportPdf}
      />

      {/* Jargon Buster / Plain-English Terms Guide Modal */}
      <PlainEnglishModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        defaultCategory={activeFacility === 'power' ? 'Power Plant' : 'Oil & Gas'}
      />

      {/* Top Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Floating Circular Chatbot Button (Bottom Right) */}
      {!isCopilotOpen && (
        <div className="fixed bottom-3.5 sm:bottom-4 right-4 sm:right-6 z-40">
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="relative h-12 w-12 sm:h-13 sm:w-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-500/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 group"
            title="Open Plant Copilot (AI SCADA)"
            aria-label="Open Plant Copilot"
          >
            <BotMessageSquare className="h-6 w-6 text-white transition-transform duration-200 group-hover:scale-110" />

            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </span>

            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 border border-slate-700/80 flex items-center gap-1.5">
              <span>Plant Copilot</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/60">
                AI SCADA
              </span>
            </span>
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
