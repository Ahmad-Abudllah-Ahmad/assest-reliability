import React, { useState, useRef, useCallback } from 'react';
import { 
  Sun, 
  Activity, 
  ShieldAlert, 
  Filter, 
  Maximize2, 
  RotateCcw, 
  Pin, 
  Info,
  Zap,
  BatteryCharging
} from 'lucide-react';
import { SolarAsset, ReliabilityAlert } from '../../types';
import { useSolarReliability } from '../../SolarReliabilityContext';
import { SolarHmiProcessSvg } from './SolarHmiProcessSvg';
import { SolarHmiHoverCard } from './SolarHmiHoverCard';

interface SolarHmiPanelProps {
  onNavigateToCases?: () => void;
}

export const SolarHmiPanel: React.FC<SolarHmiPanelProps> = ({ onNavigateToCases }) => {
  const {
    assets,
    alerts,
    plantOutputMW,
    plantContext,
    setSelectedAsset,
    setSelectedAlert,
    createWorkOrderFromRecommendation
  } = useSolarReliability();

  // Filter state for HMI: 'all' | 'high_critical' | 'moderate' | 'normal'
  const [riskFilter, setRiskFilter] = useState<'all' | 'high_critical' | 'moderate' | 'normal'>('all');

  // Hover card interaction state
  const [hoveredAsset, setHoveredAsset] = useState<SolarAsset | null>(null);
  const [pinnedAsset, setPinnedAsset] = useState<SolarAsset | null>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number }>({ x: 300, y: 150 });

  // Pipe label tooltip state
  const [pipeTooltip, setPipeTooltip] = useState<{ label: string; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeDisplayAsset = pinnedAsset || hoveredAsset;

  const handleHoverNode = useCallback((asset: SolarAsset, event: React.MouseEvent<SVGGElement>) => {
    if (pinnedAsset) return; // Keep pinned asset fixed

    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;

    let x = event.clientX - container.left + 20;
    let y = event.clientY - container.top + 20;

    // Clamping to avoid overflow
    if (x + 380 > container.width) x = event.clientX - container.left - 400;
    if (y + 320 > container.height) y = event.clientY - container.top - 330;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    setCardPosition({ x, y });
    setHoveredAsset(asset);
  }, [pinnedAsset]);

  const handleLeaveNode = useCallback(() => {
    if (!pinnedAsset) {
      setHoveredAsset(null);
    }
  }, [pinnedAsset]);

  const handleSelectNode = useCallback((asset: SolarAsset) => {
    if (pinnedAsset?.assetCode === asset.assetCode) {
      setPinnedAsset(null);
    } else {
      setPinnedAsset(asset);
    }
  }, [pinnedAsset]);

  const handleHoverPipe = useCallback((label: string, event: React.MouseEvent<SVGElement>) => {
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;

    let x = event.clientX - container.left + 15;
    let y = event.clientY - container.top - 25;
    if (x + 220 > container.width) x = container.width - 230;
    if (y < 10) y = 15;

    setPipeTooltip({ label, x, y });
  }, []);

  const handleLeavePipe = useCallback(() => {
    setPipeTooltip(null);
  }, []);

  const handleOpenTrace = (asset: SolarAsset) => {
    const alert = alerts.find(a => a.assetCode === asset.assetCode);
    if (alert) {
      setSelectedAlert(alert);
    } else {
      setSelectedAsset(asset);
    }
  };

  const handleLogWorkOrder = (asset: SolarAsset) => {
    const alert = alerts.find(a => a.assetCode === asset.assetCode);
    if (alert) {
      createWorkOrderFromRecommendation(alert.recommendationId);
      if (onNavigateToCases) onNavigateToCases();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2.5 animate-fadeIn select-none">
      
      {/* Top SCADA Process Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Sun className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              SOLAR COMPLEX PROCESS FLOW &amp; RELIABILITY HMI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold border border-emerald-500/20">
                SCADA PFD LIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              6 Tracker String Arrays • 6 Combiners • 3 Inverter PCS Skids • 3 Transformers • 5-Bay Switchgear • BESS • 132kV Gantry
            </p>
          </div>
        </div>

        {/* Realtime KPI Strip */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-750/70 border border-slate-200/80 dark:border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-500 text-[11px]">Plant Total:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
              {plantOutputMW} MW
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-750/70 border border-slate-200/80 dark:border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">POA Irradiance:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
              {plantContext.planeOfArrayIrradiancePoa} W/m²
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-750/70 border border-slate-200/80 dark:border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <BatteryCharging className="h-3.5 w-3.5 text-sky-500" />
            <span className="text-slate-500 text-[11px]">BESS SoC:</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">
              88.4% (+10MW)
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 min-h-[500px] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-slate-800"
      >
        {/* Animated Process SVG */}
        <SolarHmiProcessSvg
          assets={assets}
          selectedAssetCode={activeDisplayAsset?.assetCode || null}
          onSelectNode={handleSelectNode}
          onHoverNode={handleHoverNode}
          onLeaveNode={handleLeaveNode}
          onHoverPipe={handleHoverPipe}
          onLeavePipe={handleLeavePipe}
        />

        {/* Floating Pipe Connection Tooltip */}
        {pipeTooltip && !activeDisplayAsset && (
          <div 
            className="absolute z-20 pointer-events-none px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-mono border border-amber-400/50 shadow-xl backdrop-blur-xs transition-all duration-100"
            style={{ left: `${pipeTooltip.x}px`, top: `${pipeTooltip.y}px` }}
          >
            {pipeTooltip.label}
          </div>
        )}

        {/* Live Reliability Hover Card */}
        {activeDisplayAsset && (
          <div 
            className="absolute z-30 transition-all duration-150 animate-fadeIn"
            style={{ left: `${cardPosition.x}px`, top: `${cardPosition.y}px` }}
          >
            <SolarHmiHoverCard
              asset={activeDisplayAsset}
              isPinned={!!pinnedAsset}
              onTogglePin={() => setPinnedAsset(pinnedAsset ? null : activeDisplayAsset)}
              onClose={() => {
                setPinnedAsset(null);
                setHoveredAsset(null);
              }}
              onOpenTrace={handleOpenTrace}
              onOpenDetail={(a) => setSelectedAsset(a)}
              onLogWorkOrder={handleLogWorkOrder}
            />
          </div>
        )}
      </div>

      {/* HMI Footer Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-4 py-2 rounded-xl shrink-0 shadow-2xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-sm" />
            <span>1.5kV DC Strings &amp; Combiner Trunks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sky-500 rounded-sm" />
            <span>800V AC Inverter Busways &amp; 33kV Feeders</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-cyan-400 rounded-sm" />
            <span>BESS Bidirectional Link (+10 MW Charging)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-600 rounded-sm" />
            <span>132kV High Voltage Grid Export</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          IEC 61850 Substation Bus • DNP3 Over IP • 500ms Deterministic Cycle
        </div>
      </div>

    </div>
  );
};
