import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Layers, 
  Filter,
  Wind
} from 'lucide-react';
import { useWindReliability } from '../../WindReliabilityContext';
import { WindAsset, ReliabilityAlert, isActiveAlertStatus, HmiPipeInfo } from '../../types';
import { WIND_PROCESS_NODES, WindMachineLayoutNode } from './windHmiLayoutConfig';
import { WindHmiProcessSvg, WIND_HMI_PIPES } from './WindHmiProcessSvg';
import { WindHmiHoverCard } from './WindHmiHoverCard';

interface WindHmiPanelProps {
  onTraceAlert: (alert: ReliabilityAlert) => void;
  onInspectAsset?: (asset: WindAsset) => void;
  onNavigateToCases?: () => void;
  selectedAssetCode?: string | null;
  onClearSelection?: () => void;
}

export const WindHmiPanel: React.FC<WindHmiPanelProps> = ({
  onTraceAlert,
  onInspectAsset,
  onNavigateToCases,
  selectedAssetCode,
  onClearSelection
}) => {
  const { assets, alerts, recommendations } = useWindReliability();

  // Machine hover and selection
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Process pipe hover
  const [hoveredPipe, setHoveredPipe] = useState<HmiPipeInfo | null>(null);
  const [pipeTooltipPos, setPipeTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'moderate' | 'healthy'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();

    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    const cardWidth = 340;
    const cardHeight = 440;
    const padding = 12;

    let targetX = cursorX + 16;
    let targetY = cursorY + 16;

    if (targetX + cardWidth > rect.width - padding) {
      targetX = cursorX - cardWidth - 16;
    }
    if (targetX < padding) {
      targetX = padding;
    }

    if (targetY + cardHeight > rect.height - padding) {
      targetY = cursorY - cardHeight - 16;
    }
    if (targetY < padding) {
      targetY = padding;
    }

    return {
      x: Math.round(targetX),
      y: Math.round(targetY)
    };
  }, []);

  const activeNodeId = hoveredNodeId || selectedNodeId;
  const activeNodeKey = Object.keys(WIND_PROCESS_NODES).find(
    k => WIND_PROCESS_NODES[k].id === activeNodeId
  );
  const activeNode = activeNodeKey ? WIND_PROCESS_NODES[activeNodeKey] : null;

  const activeAsset = activeNode?.assetCode
    ? assets.find(a => a.assetCode === activeNode.assetCode)
    : undefined;

  const activeAlerts = activeAsset
    ? alerts.filter(a => a.assetCode === activeAsset.assetCode && isActiveAlertStatus(a.status))
    : [];

  const criticalRiskCount = assets.filter(a => a.riskLevel === 'Critical').length;
  const highRiskCount = assets.filter(a => a.riskLevel === 'High').length;
  const moderateRiskCount = assets.filter(a => a.riskLevel === 'Moderate' || a.riskLevel === 'Medium').length;
  const healthyCount = assets.filter(a => a.riskLevel === 'Low').length;
  const activeAlertsTotal = alerts.filter(a => isActiveAlertStatus(a.status)).length;

  const handleHoverNode = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const pos = calculatePosition(event.clientX, event.clientY);
    setTooltipPos(pos);
    setHoveredNodeId(nodeId);
    setHoveredPipe(null);
  }, [calculatePosition]);

  const handleLeaveNode = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(null);
    }, 280);
  }, []);

  const handleHoverPipe = useCallback((pipe: HmiPipeInfo, event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 180;
    const tooltipHeight = 44;

    let x = event.clientX - rect.left + 12;
    let y = event.clientY - rect.top + 12;

    if (x + tooltipWidth > rect.width - 8) {
      x = event.clientX - rect.left - tooltipWidth - 12;
    }
    if (y + tooltipHeight > rect.height - 8) {
      y = event.clientY - rect.top - tooltipHeight - 12;
    }

    setPipeTooltipPos({ x: Math.max(8, x), y: Math.max(8, y) });
    setHoveredPipe(pipe);
  }, []);

  const handleMovePipe = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !hoveredPipe) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 180;
    const tooltipHeight = 44;

    let x = event.clientX - rect.left + 12;
    let y = event.clientY - rect.top + 12;

    if (x + tooltipWidth > rect.width - 8) {
      x = event.clientX - rect.left - tooltipWidth - 12;
    }
    if (y + tooltipHeight > rect.height - 8) {
      y = event.clientY - rect.top - tooltipHeight - 12;
    }

    setPipeTooltipPos({ x: Math.max(8, x), y: Math.max(8, y) });
  }, [hoveredPipe]);

  const handleLeavePipe = useCallback(() => {
    setHoveredPipe(null);
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(null);
    }, 150);
  }, []);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => {
      if (prev === nodeId) {
        onClearSelection?.();
        return null;
      }
      return nodeId;
    });
  }, [onClearSelection]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-xs w-full flex-1 flex flex-col gap-2 relative min-h-0 select-none">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Wind Farm Process Flow &amp; Reliability HMI
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              6× 5.2MW DFIG Turbines • Dual Collector Headers • 132kV Substation Intertie • Live Anomaly Diagnostics
            </p>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700 text-[11px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Filter:</span>
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({assets.length})
            </button>

            <button
              onClick={() => setStatusFilter('high')}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'high'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>High/Crit ({highRiskCount + criticalRiskCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('moderate')}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'moderate'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Moderate ({moderateRiskCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('healthy')}
              className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'healthy'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Normal ({healthyCount})</span>
            </button>
          </div>

          <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {activeAlertsTotal} Active Alerts
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 min-h-[380px] h-[calc(100vh-210px)] max-h-[760px] bg-slate-50/60 dark:bg-slate-900/40 rounded-lg border border-slate-200/80 dark:border-slate-700/70 shadow-inner flex items-center justify-center select-none"
      >
        <div className="w-full h-full overflow-hidden rounded-lg flex items-center justify-center">
          <WindHmiProcessSvg
            assets={assets}
            alerts={alerts}
            hoveredNodeId={hoveredNodeId}
            selectedNodeId={selectedNodeId}
            statusFilter={statusFilter}
            onHoverNode={handleHoverNode}
            onLeaveNode={handleLeaveNode}
            onSelectNode={handleSelectNode}
            hoveredPipeId={hoveredPipe?.id}
            onHoverPipe={handleHoverPipe}
            onMovePipe={handleMovePipe}
            onLeavePipe={handleLeavePipe}
          />
        </div>

        {/* Pipe Hover Tooltip (Section 23 & 55) */}
        {hoveredPipe && !activeNode && (
          <div
            className="absolute z-40 pointer-events-none transition-all duration-75 ease-out"
            style={{ left: `${pipeTooltipPos.x}px`, top: `${pipeTooltipPos.y}px` }}
          >
            <div className="bg-slate-900/95 text-white px-2.5 py-1.5 rounded-md shadow-lg border border-slate-700/80 backdrop-blur-xs flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hoveredPipe.color }} />
                <span className="text-xs font-semibold tracking-wide text-slate-100 whitespace-nowrap">
                  {hoveredPipe.label}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap pl-3.5">
                {hoveredPipe.from} → {hoveredPipe.to}
              </div>
            </div>
          </div>
        )}

        {/* Machine Interactive Hover Card (z-50) */}
        {activeNode && (
          <div
            className="absolute z-50 pointer-events-auto"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          >
            <WindHmiHoverCard
              node={activeNode}
              asset={activeAsset}
              alerts={activeAlerts}
              recommendations={recommendations}
              onTrace={onTraceAlert}
              onInspectAsset={onInspectAsset}
              onNavigateToCases={onNavigateToCases}
              onClose={() => {
                setSelectedNodeId(null);
                onClearSelection?.();
              }}
              isPinned={selectedNodeId === activeNode.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};
