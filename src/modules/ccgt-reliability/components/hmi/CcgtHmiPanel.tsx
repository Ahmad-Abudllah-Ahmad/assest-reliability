import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Layers, 
  Filter,
  Maximize2
} from 'lucide-react';
import { useCcgtReliability } from '../../CcgtReliabilityContext';
import { CcgtAsset, ReliabilityAlert, isActiveAlertStatus, HmiPipeInfo } from '../../types';
import { CCGT_PROCESS_NODES, MachineLayoutNode } from './hmiLayoutConfig';
import { CcgtHmiProcessSvg } from './CcgtHmiProcessSvg';
import { CcgtHmiHoverCard } from './CcgtHmiHoverCard';

interface CcgtHmiPanelProps {
  onTraceAlert: (alert: ReliabilityAlert) => void;
  onInspectAsset?: (asset: CcgtAsset) => void;
  onNavigateToCases?: () => void;
  selectedAssetCode?: string | null;
  onClearSelection?: () => void;
}

export const CcgtHmiPanel: React.FC<CcgtHmiPanelProps> = ({
  onTraceAlert,
  onInspectAsset,
  onNavigateToCases,
  selectedAssetCode,
  onClearSelection
}) => {
  const { assets, alerts, recommendations } = useCcgtReliability();

  // Machine Hover and selection state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Process Pipe Hover state
  const [hoveredPipe, setHoveredPipe] = useState<HmiPipeInfo | null>(null);
  const [pipeTooltipPos, setPipeTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter state (All, High/Critical, Moderate, Healthy)
  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'moderate' | 'healthy'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smart repositioning helper to completely eliminate clipping
  const calculatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();

    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    const cardWidth = 350;
    const cardHeight = 460;
    const padding = 12;

    // Horizontal placement:
    // If the node/cursor is past 55% of the container width or card extends past right edge,
    // open to the left of the node
    let x: number;
    if (cursorX + cardWidth + 24 > rect.width) {
      x = cursorX - cardWidth - 16;
    } else {
      x = cursorX + 16;
    }

    // Vertical placement:
    // If the node/cursor is in the lower half (> 45% container height, e.g. GT-2 at ~66%),
    // open ABOVE the node so the card is never clipped at the bottom!
    let y: number;
    if (cursorY > rect.height * 0.45) {
      y = cursorY - cardHeight - 16;
    } else {
      y = cursorY + 14;
    }

    // Strict boundary clamping within container
    x = Math.max(padding, Math.min(rect.width - cardWidth - padding, x));
    y = Math.max(padding, Math.min(rect.height - cardHeight - padding, y));

    return { x, y };
  }, []);

  // Sync external selection if provided
  useEffect(() => {
    if (selectedAssetCode) {
      const targetNode = Object.values(CCGT_PROCESS_NODES).find(n => n.assetCode === selectedAssetCode);
      if (targetNode) {
        setSelectedNodeId(targetNode.id);
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // Approximate position based on node relative coordinates (viewBox is 1560x740)
          const scaleX = rect.width / 1560;
          const scaleY = rect.height / 740;
          const nodeCenterX = (targetNode.x + targetNode.width / 2) * scaleX;
          const nodeCenterY = (targetNode.y + targetNode.height / 2) * scaleY;
          const pos = calculatePosition(rect.left + nodeCenterX, rect.top + nodeCenterY);
          setTooltipPos(pos);
        }
      }
    }
  }, [selectedAssetCode, calculatePosition]);

  // Active node to show in card: either pinned (selected) or hovered
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const activeNodeKey = Object.keys(CCGT_PROCESS_NODES).find(
    k => CCGT_PROCESS_NODES[k].id === activeNodeId
  );
  const activeNode = activeNodeKey ? CCGT_PROCESS_NODES[activeNodeKey] : null;

  // Correlate with current live asset & alerts using single consistent definition of active alerts
  const activeAsset = activeNode?.assetCode
    ? assets.find(a => a.assetCode === activeNode.assetCode)
    : undefined;

  const activeAlerts = activeAsset
    ? alerts.filter(a => a.assetCode === activeAsset.assetCode && isActiveAlertStatus(a.status))
    : [];

  // Active counts for legend and filter pills
  const criticalRiskCount = assets.filter(a => a.riskLevel === 'Critical').length;
  const highRiskCount = assets.filter(a => a.riskLevel === 'High').length;
  const moderateRiskCount = assets.filter(a => a.riskLevel === 'Moderate' || a.riskLevel === 'Medium').length;
  const healthyCount = assets.filter(a => a.riskLevel === 'Low' || (a.riskScore <= 20 && a.riskLevel !== 'Moderate' && a.riskLevel !== 'High' && a.riskLevel !== 'Critical')).length;
  const activeAlertsTotal = alerts.filter(a => isActiveAlertStatus(a.status)).length;

  // Safe hover handling with hover-intent delay
  const handleHoverNode = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const pos = calculatePosition(event.clientX, event.clientY);
    setTooltipPos(pos);
    setHoveredNodeId(nodeId);
    // Dismiss pipe tooltip if machine hovered
    setHoveredPipe(null);
  }, [calculatePosition]);

  const handleLeaveNode = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(null);
    }, 280); // 280ms grace window to move pointer into hover card
  }, []);

  // Pipe hover handlers with smooth tracking and viewport clamping
  const handleHoverPipe = useCallback((pipe: HmiPipeInfo, event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 160;
    const tooltipHeight = 44;

    let x = event.clientX - rect.left + 12;
    let y = event.clientY - rect.top + 12;

    if (x + tooltipWidth > rect.width - 8) {
      x = event.clientX - rect.left - tooltipWidth - 12;
    }
    if (y + tooltipHeight > rect.height - 8) {
      y = event.clientY - rect.top - tooltipHeight - 12;
    }

    x = Math.max(8, x);
    y = Math.max(8, y);

    setPipeTooltipPos({ x, y });
    setHoveredPipe(pipe);
  }, []);

  const handleMovePipe = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !hoveredPipe) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 160;
    const tooltipHeight = 44;

    let x = event.clientX - rect.left + 12;
    let y = event.clientY - rect.top + 12;

    if (x + tooltipWidth > rect.width - 8) {
      x = event.clientX - rect.left - tooltipWidth - 12;
    }
    if (y + tooltipHeight > rect.height - 8) {
      y = event.clientY - rect.top - tooltipHeight - 12;
    }

    x = Math.max(8, x);
    y = Math.max(8, y);

    setPipeTooltipPos({ x, y });
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

  // Keyboard accessibility focus/blur/keys for monitored assets
  const handleFocusNode = useCallback((nodeId: string, element: SVGGraphicsElement) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();

    const clientX = elRect.left + elRect.width / 2;
    const clientY = elRect.top + elRect.height;
    const pos = calculatePosition(clientX, clientY);

    setTooltipPos(pos);
    setHoveredNodeId(nodeId);
  }, [calculatePosition]);

  const handleBlurNode = useCallback((nodeId: string) => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(prev => (prev === nodeId ? null : prev));
    }, 200);
  }, []);

  const handleKeyDownNode = useCallback((nodeId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectNode(nodeId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedNodeId(null);
      setHoveredNodeId(null);
      onClearSelection?.();
    }
  }, [handleSelectNode, onClearSelection]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-xs w-full flex-1 flex flex-col gap-2 relative min-h-0">
      
      {/* HMI Top Toolbar: Title, Legend, and Compact Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Combined Cycle Process Flow &amp; Reliability HMI
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive process schematic • Hover or use Tab/Enter on monitored assets to inspect live alerts &amp; trace explainability
            </p>
          </div>
        </div>

        {/* Dynamic Status Legend & Compact Visual Filter Buttons (affects only HMI visual emphasis) */}
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
              title="Show all assets"
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
              title="Filter High and Critical risk assets"
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
              title="Filter Moderate risk assets"
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
              title="Filter Healthy nominal assets"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Normal ({healthyCount})</span>
            </button>
          </div>

          {/* Quick Active Alerts Badge */}
          <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {activeAlertsTotal} Active Alerts
          </span>
        </div>
      </div>

      {/* Process Flow Canvas Container (Outer container has overflow: visible to allow hover card & tooltip to render without clipping) */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 min-h-[360px] h-[calc(100vh-210px)] max-h-[760px] bg-slate-50/60 dark:bg-slate-900/40 rounded-lg border border-slate-200/80 dark:border-slate-700/70 shadow-inner flex items-center justify-center select-none"
      >
        {/* SVG schematic enclosed in overflow-hidden boundary */}
        <div className="w-full h-full overflow-hidden rounded-lg flex items-center justify-center">
          <CcgtHmiProcessSvg
            assets={assets}
            alerts={alerts}
            hoveredNodeId={hoveredNodeId}
            selectedNodeId={selectedNodeId}
            statusFilter={statusFilter}
            onHoverNode={handleHoverNode}
            onLeaveNode={handleLeaveNode}
            onSelectNode={handleSelectNode}
            onFocusNode={handleFocusNode}
            onBlurNode={handleBlurNode}
            onKeyDownNode={handleKeyDownNode}
            hoveredPipeId={hoveredPipe?.id}
            onHoverPipe={handleHoverPipe}
            onMovePipe={handleMovePipe}
            onLeavePipe={handleLeavePipe}
          />
        </div>

        {/* Floating Process Pipe Tooltip (z-40) */}
        {hoveredPipe && !activeNode && (
          <div
            className="absolute z-40 pointer-events-none transition-all duration-75 ease-out"
            style={{
              left: `${pipeTooltipPos.x}px`,
              top: `${pipeTooltipPos.y}px`
            }}
          >
            <div className="bg-slate-900/95 text-white px-2.5 py-1.5 rounded-md shadow-lg border border-slate-700/80 backdrop-blur-xs flex flex-col gap-0.5 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: hoveredPipe.color }}
                />
                <span className="text-xs font-semibold tracking-wide text-slate-100 whitespace-nowrap">
                  {hoveredPipe.type}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap pl-3.5">
                {hoveredPipe.from} → {hoveredPipe.to}
              </div>
            </div>
          </div>
        )}

        {/* Floating Interactive Hover Card Layer (z-50, unrestricted overflow) */}
        {activeNode && (
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`
            }}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          >
            <CcgtHmiHoverCard
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

