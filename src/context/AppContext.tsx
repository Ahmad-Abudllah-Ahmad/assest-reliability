import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ModuleId,
  FacilityId,
  DemandPoint,
  BessStatus,
  GenerationMixItem,
  FleetAsset,
  HeatRatePoint,
  Scope1Emissions,
  Recommendation,
  ChatMessage,
  ToastNotification,
  ReasoningStep
} from '../types';
import {
  FACILITIES,
  INITIAL_DEMAND_CURVE,
  INITIAL_BESS_STATUS,
  INITIAL_GENERATION_MIX,
  INITIAL_FLEET_ASSETS,
  INITIAL_HEAT_RATE_DATA,
  INITIAL_EMISSIONS,
  INITIAL_RECOMMENDATIONS
} from '../lib/mockData';

interface AppContextType {
  activeModule: ModuleId;
  setActiveModule: (mod: ModuleId) => void;
  facilityId: FacilityId;
  setFacilityId: (id: FacilityId) => void;
  demandData: DemandPoint[];
  bessStatus: BessStatus;
  generationMix: GenerationMixItem[];
  fleetAssets: FleetAsset[];
  heatRateData: HeatRatePoint[];
  emissions: Scope1Emissions;
  recommendations: Recommendation[];
  activeEvidenceModal: Recommendation | null;
  openEvidenceModal: (rec: Recommendation) => void;
  closeEvidenceModal: () => void;
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  executeAction: (actionId: string, payload?: any) => void;
  approveRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  simulateRecommendation: (id: string) => void;
  batchApprove: (ids: string[]) => void;
  syncScada: () => void;
  isScadaSyncing: boolean;
  lastScadaSyncSeconds: number;
  gridFrequency: number;
  busVoltage: number;
  toggleBessMode: () => void;
  forceBessDischarge: () => void;
  forceBessCharge: () => void;
  reduceUnit2Thermal: () => void;
  scheduleDiagnosticWorkOrder: (assetId: string) => void;
  optimizeAirFuelRatio: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('dispatch');
  const [facilityId, setFacilityId] = useState<FacilityId>('unit-4-main');
  
  const [demandData, setDemandData] = useState<DemandPoint[]>(INITIAL_DEMAND_CURVE);
  const [bessStatus, setBessStatus] = useState<BessStatus>(INITIAL_BESS_STATUS);
  const [generationMix, setGenerationMix] = useState<GenerationMixItem[]>(INITIAL_GENERATION_MIX);
  const [fleetAssets, setFleetAssets] = useState<FleetAsset[]>(INITIAL_FLEET_ASSETS);
  const [heatRateData, setHeatRateData] = useState<HeatRatePoint[]>(INITIAL_HEAT_RATE_DATA);
  const [emissions, setEmissions] = useState<Scope1Emissions>(INITIAL_EMISSIONS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<Recommendation | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  
  const [isScadaSyncing, setIsScadaSyncing] = useState<boolean>(false);
  const [lastScadaSyncSeconds, setLastScadaSyncSeconds] = useState<number>(3);
  const [gridFrequency, setGridFrequency] = useState<number>(60.01);
  const [busVoltage, setBusVoltage] = useState<number>(138.2);

  // Initial AI Assistant messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "👋 **VOLTFLOW AI Dispatcher Online**. I'm continuously monitoring SCADA telemetry, day-ahead LMP spreads, and equipment thermal margins across your fleet.\n\nHow can I assist your dispatch operations right now?",
      timestamp: 'Just now',
      actionButtons: [
        { label: 'Analyze Transformer T-04 Spurt', actionId: 'analyze-xfmr', variant: 'warning' },
        { label: 'Optimize Peak Shaving (18:00)', actionId: 'optimize-peak', variant: 'primary' },
        { label: 'Check Scope 1 Compliance', actionId: 'check-carbon', variant: 'emerald' }
      ]
    }
  ]);

  // Toast Helper
  const addToast = (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast: ToastNotification = { ...toast, id, timestamp: now };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    
    // Auto dismiss after 4.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // SCADA Sync Counter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastScadaSyncSeconds(prev => prev + 1);
      
      // subtle micro jitter on frequency and voltage to simulate live grid
      setGridFrequency(prev => {
        const jitter = (Math.random() - 0.5) * 0.01;
        return Number((60.0 + jitter).toFixed(2));
      });
      setBusVoltage(prev => {
        const jitter = (Math.random() - 0.5) * 0.15;
        return Number((138.2 + jitter).toFixed(1));
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const syncScada = () => {
    setIsScadaSyncing(true);
    addToast({
      type: 'info',
      title: 'Syncing SCADA Telemetry',
      message: 'Querying 420 substation RTUs and edge gateways across the interconnect...'
    });

    setTimeout(() => {
      setIsScadaSyncing(false);
      setLastScadaSyncSeconds(0);
      setGridFrequency(60.00);
      setBusVoltage(138.1);
      addToast({
        type: 'success',
        title: 'SCADA Telemetry Synced',
        message: 'All 1,840 analog telemetry points reconciled with zero packet loss.'
      });
    }, 1400);
  };

  // Recommendation Actions
  const approveRecommendation = (id: string) => {
    const rec = recommendations.find(r => r.id === id);
    if (!rec) return;

    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    
    // Apply immediate business impact
    if (id === 'REC-701') {
      setBessStatus(prev => ({ ...prev, state: 'DISCHARGING', powerMW: 25, todayArbitrageSavings: prev.todayArbitrageSavings + 2750 }));
    } else if (id === 'REC-702') {
      setFleetAssets(prev => prev.map(a => a.id === 'xfmr-04' ? { ...a, windingTempC: 84.1, failureRiskPercent: 18.2, status: 'OPTIMAL' } : a));
    } else if (id === 'REC-703') {
      setEmissions(prev => ({ ...prev, noxPpm: 8.4, airFuelRatioOptimized: true, scope1Intensity: 0.364 }));
    }

    addToast({
      type: 'success',
      title: `Action Executed: ${rec.id}`,
      message: `Dispatched: "${rec.title}". Real-time telemetry adjusting accordingly.`
    });
  };

  const rejectRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    addToast({
      type: 'warning',
      title: `Proposal Rejected (${id})`,
      message: 'Logged operator rejection reason: Manual override active.'
    });
  };

  const simulateRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'SIMULATING' } : r));
    addToast({
      type: 'info',
      title: `Running Dispatch Simulation: ${id}`,
      message: 'Running dynamic AC power flow and transient stability solver...'
    });

    setTimeout(() => {
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'NEEDS_APPROVAL' } : r));
      addToast({
        type: 'success',
        title: `Simulation Verified: ${id}`,
        message: 'Convergence reached in 280ms. Voltage and thermal margins fully confirmed.'
      });
    }, 1800);
  };

  const batchApprove = (ids: string[]) => {
    ids.forEach(id => approveRecommendation(id));
  };

  // Specific one-click domain actions
  const toggleBessMode = () => {
    setBessStatus(prev => {
      const nextMode = !prev.autoMode;
      addToast({
        type: 'info',
        title: `BESS Control Mode: ${nextMode ? 'Automated Arbitrage' : 'Manual Dispatch'}`,
        message: nextMode ? 'AI peak shaving algorithms resumed.' : 'Manual operator setpoints locked.'
      });
      return { ...prev, autoMode: nextMode };
    });
  };

  const forceBessDischarge = () => {
    setBessStatus(prev => ({ ...prev, state: 'DISCHARGING', powerMW: 25, socPercent: Math.max(15, prev.socPercent - 1) }));
    addToast({
      type: 'success',
      title: 'BESS Setpoint Injected: 25 MW Discharge',
      message: 'Injecting 25 MW into 138kV bus. Peak tariff offset active.'
    });
  };

  const forceBessCharge = () => {
    setBessStatus(prev => ({ ...prev, state: 'CHARGING', powerMW: -20, socPercent: Math.min(95, prev.socPercent + 1) }));
    addToast({
      type: 'info',
      title: 'BESS Setpoint Injected: 20 MW Charge',
      message: 'Absorbing surplus solar generation at $38.60/MWh.'
    });
  };

  const reduceUnit2Thermal = () => {
    setFleetAssets(prev => prev.map(a => a.id === 'gt-02' ? {
      ...a,
      status: 'OPTIMAL',
      currentLoadMW: 130,
      windingTempC: 78.4,
      failureRiskPercent: 14.5
    } : a));
    addToast({
      type: 'success',
      title: 'Gas Turbine #2 Setpoint Reduced',
      message: 'Throttled from 142 MW to 130 MW. Exhaust thermocouple normalized to 78.4°C.'
    });
  };

  const scheduleDiagnosticWorkOrder = (assetId: string) => {
    const asset = fleetAssets.find(a => a.id === assetId);
    addToast({
      type: 'success',
      title: `CMMS Work Order Created: #WO-8910`,
      message: `Diagnostic crew dispatched for ${asset?.name || assetId}. Priority: Urgent.`
    });
  };

  const optimizeAirFuelRatio = () => {
    setEmissions(prev => ({
      ...prev,
      airFuelRatioOptimized: true,
      noxPpm: 8.4,
      scope1Intensity: 0.364
    }));
    addToast({
      type: 'success',
      title: 'Air-to-Fuel Ratio Optimized',
      message: 'Trim set to -1.8%. Flame temperature controlled to Low-NOx mode.'
    });
  };

  // AI Assistant Reasoning Engine
  const sendChatMessage = (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Determine intent
    const lower = userText.toLowerCase();
    let steps: ReasoningStep[] = [];
    let assistantReply = '';
    let actionButtons: ChatMessage['actionButtons'] = [];

    if (lower.includes('transformer') || lower.includes('t-04') || lower.includes('temperature') || lower.includes('spike')) {
      steps = [
        { step: 1, label: 'Ingesting SCADA sensor stream for Substation T-04...', status: 'active' },
        { step: 2, label: 'Comparing winding temperature (98.4°C) against IEEE C57 thermal loading curve...', status: 'pending' },
        { step: 3, label: 'Detected top-oil temperature ramp rate exceeding +1.8°C/hr...', status: 'pending' },
        { step: 4, label: 'Calculating remaining insulation life and load-shedding trade-offs...', status: 'pending' }
      ];
      assistantReply = `### Diagnostic Verdict: Severe Winding Thermal Surge on T-04\n\n**Root Cause**: Elevated ambient temperature (34°C) coupled with continuous 91.4% nameplate load on Feeder 7.\n\n- **Current Winding Temp**: \`98.4°C\` (Safe continuous limit: \`85.0°C\`)\n- **Failure Risk**: \`74.2%\` probability of Buchholz gas relay trip within 4 hours if unmitigated\n- **Projected Impact**: Loss of 320 MW distribution capacity + potential $1.4M core rewinding damage.\n\n**Recommended Countermeasures**:`;
      actionButtons = [
        { label: 'Transfer 12 MW Load to Feeder 3', actionId: 'exec-load-transfer', variant: 'primary' },
        { label: 'Dispatch Cooling Fan Inspection', actionId: 'exec-fan-inspection', variant: 'secondary' }
      ];
    } else if (lower.includes('peak') || lower.includes('shaving') || lower.includes('bess') || lower.includes('18:00')) {
      steps = [
        { step: 1, label: 'Evaluating Day-Ahead ISO Locational Marginal Pricing (LMP)...', status: 'active' },
        { step: 2, label: 'Identified projected peak pricing at 18:00 ($148.00/MWh) vs current $38.60/MWh...', status: 'pending' },
        { step: 3, label: 'Evaluating BESS cell thermal state (31.4°C) and degradation cycle cost...', status: 'pending' },
        { step: 4, label: 'Formulating optimal 25 MW discharge schedule with peak shaving cushion...', status: 'pending' }
      ];
      assistantReply = `### Optimization Plan: Evening Peak Arbitrage & Shaving\n\n**Economic Opportunity**: Locational Marginal Pricing will ramp from \`$65.00/MWh\` at 14:00 to a peak of \`$148.00/MWh\` at 18:00.\n\n- **Current BESS SOC**: \`78% (78 MWh stored)\`\n- **Recommended Discharge**: 25 MW sustained for 2.5 hours starting at 17:15\n- **Net Financial Gain**: \`+$8,250\` (after subtracting $420 battery cycle wear)\n- **Feeder Relief**: Lowers feeder peak congestion by \`15.4%\`.\n\n**One-Click Actions**:`;
      actionButtons = [
        { label: 'Execute 25 MW BESS Peak Discharge', actionId: 'exec-bess-discharge', variant: 'emerald' },
        { label: 'Lock Automated Arbitrage Schedule', actionId: 'exec-bess-auto', variant: 'primary' }
      ];
    } else if (lower.includes('carbon') || lower.includes('scope 1') || lower.includes('nox') || lower.includes('emission')) {
      steps = [
        { step: 1, label: 'Auditing real-time stack CEMS telemetry on Gas Turbines 1 & 2...', status: 'active' },
        { step: 2, label: 'Current Scope 1 intensity is 0.382 tCO2e/MWh (Cap: 0.420 tCO2e/MWh)...', status: 'pending' },
        { step: 3, label: 'NOx output at 12.8 ppm nearing 15.0 ppm regulatory compliance margin...', status: 'pending' },
        { step: 4, label: 'Simulating fuel gas premix pressure and air-to-fuel trim adjustment...', status: 'pending' }
      ];
      assistantReply = `### Environmental Audit & Combustion Tuning\n\n**Current Status**: Operating within permits, but NOx margins are narrowing during peak thermal loading.\n\n- **Scope 1 Carbon Intensity**: \`0.382 tCO2e/MWh\` (91% of allowable cap)\n- **NOx Level**: \`12.8 ppm\` (Cap: 15.0 ppm)\n- **Predicted Benefit**: Trimming fuel control valve by \`-1.8%\` lowers NOx to \`8.4 ppm\` and saves \`+$480/hr\` in fuel efficiency.\n\n**Action Triggers**:`;
      actionButtons = [
        { label: 'Optimize Air-to-Fuel Ratio for Low-NOx', actionId: 'exec-opt-nox', variant: 'emerald' },
        { label: 'Export Certified CEMS Carbon Report', actionId: 'exec-export-carbon', variant: 'secondary' }
      ];
    } else {
      steps = [
        { step: 1, label: 'Querying facility active telemetry vectors...', status: 'active' },
        { step: 2, label: 'Scanning generation mix and transformer thermal margins...', status: 'pending' },
        { step: 3, label: 'Evaluating grid frequency stability at 60.01 Hz...', status: 'pending' },
        { step: 4, label: 'Synthesizing actionable executive recommendations...', status: 'pending' }
      ];
      assistantReply = `### Facility Status Synthesis: ${FACILITIES.find(f => f.id === facilityId)?.name}\n\n- **Grid Stability**: Normal (\`60.01 Hz\`, \`138.2 kV\`).\n- **Generation Output**: \`412 MW\` aggregate active delivery.\n- **Primary Operational Alert**: Substation Transformer T-04 winding hotspot (\`98.4°C\`).\n- **Actionable Advice**: Transfer 12 MW from Feeder 7 to avoid trip, and prepare BESS for the 18:00 LMP pricing spike.`;
      actionButtons = [
        { label: 'View T-04 Evidence Package', actionId: 'view-rec-702', variant: 'warning' },
        { label: 'Optimize Dispatch', actionId: 'nav-dispatch', variant: 'primary' }
      ];
    }

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reasoningSteps: steps,
      actionButtons: []
    };

    setChatMessages(prev => [...prev, userMsg, initialAssistantMsg]);

    // Animate reasoning steps progressively
    steps.forEach((_, idx) => {
      setTimeout(() => {
        setChatMessages(currentList => currentList.map(msg => {
          if (msg.id !== assistantMsgId) return msg;
          const updatedSteps = (msg.reasoningSteps || []).map((st, i) => {
            if (i < idx) return { ...st, status: 'done' as const };
            if (i === idx) return { ...st, status: 'active' as const };
            return st;
          });
          return { ...msg, reasoningSteps: updatedSteps };
        }));
      }, (idx + 1) * 600);
    });

    // Complete reasoning and output message
    setTimeout(() => {
      setChatMessages(currentList => currentList.map(msg => {
        if (msg.id !== assistantMsgId) return msg;
        const allDone = (msg.reasoningSteps || []).map(st => ({ ...st, status: 'done' as const }));
        return {
          ...msg,
          reasoningSteps: allDone,
          text: assistantReply,
          actionButtons
        };
      }));
    }, (steps.length + 1) * 600);
  };

  // Execution from inside AI Chatbot
  const executeAction = (actionId: string, payload?: any) => {
    if (actionId === 'analyze-xfmr') {
      sendChatMessage('Analyze Transformer T-04 temperature spike');
    } else if (actionId === 'optimize-peak') {
      sendChatMessage('Optimize peak shaving for tomorrow 18:00');
    } else if (actionId === 'check-carbon') {
      sendChatMessage('Check Scope 1 emissions compliance risk');
    } else if (actionId === 'exec-load-transfer') {
      approveRecommendation('REC-702');
    } else if (actionId === 'exec-fan-inspection') {
      scheduleDiagnosticWorkOrder('xfmr-04');
    } else if (actionId === 'exec-bess-discharge') {
      forceBessDischarge();
    } else if (actionId === 'exec-bess-auto') {
      toggleBessMode();
    } else if (actionId === 'exec-opt-nox') {
      optimizeAirFuelRatio();
    } else if (actionId === 'exec-export-carbon') {
      addToast({
        type: 'success',
        title: 'CEMS Carbon Report Generated',
        message: 'EPA 40 CFR Part 75 compliant PDF downloaded for facility archives.'
      });
    } else if (actionId === 'view-rec-702') {
      const rec = recommendations.find(r => r.id === 'REC-702');
      if (rec) setActiveEvidenceModal(rec);
    } else if (actionId === 'nav-dispatch') {
      setActiveModule('dispatch');
    }

    // Mark button in chat as executed
    setChatMessages(prev => prev.map(msg => {
      if (msg.actionButtons?.some(btn => btn.actionId === actionId)) {
        return { ...msg, executedAction: actionId };
      }
      return msg;
    }));
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        facilityId,
        setFacilityId,
        demandData,
        bessStatus,
        generationMix,
        fleetAssets,
        heatRateData,
        emissions,
        recommendations,
        activeEvidenceModal,
        openEvidenceModal: (rec) => setActiveEvidenceModal(rec),
        closeEvidenceModal: () => setActiveEvidenceModal(null),
        toasts,
        addToast,
        removeToast,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        chatMessages,
        sendChatMessage,
        executeAction,
        approveRecommendation,
        rejectRecommendation,
        simulateRecommendation,
        batchApprove,
        syncScada,
        isScadaSyncing,
        lastScadaSyncSeconds,
        gridFrequency,
        busVoltage,
        toggleBessMode,
        forceBessDischarge,
        forceBessCharge,
        reduceUnit2Thermal,
        scheduleDiagnosticWorkOrder,
        optimizeAirFuelRatio
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
