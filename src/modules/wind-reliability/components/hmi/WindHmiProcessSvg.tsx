import React from 'react';
import { 
  WindAsset, 
  ReliabilityAlert, 
  isActiveAlertStatus, 
  deriveMachineHmiStatus, 
  HmiMachineStatus,
  HmiPipeInfo
} from '../../types';

interface WindHmiProcessSvgProps {
  assets: WindAsset[];
  alerts: ReliabilityAlert[];
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  statusFilter?: 'all' | 'high' | 'moderate' | 'healthy';
  hoveredPipeId?: string | null;
  onHoverPipe?: (pipe: HmiPipeInfo, event: React.MouseEvent) => void;
  onMovePipe?: (event: React.MouseEvent) => void;
  onLeavePipe?: () => void;
  onHoverNode: (nodeId: string, event: React.MouseEvent) => void;
  onLeaveNode: () => void;
  onSelectNode: (nodeId: string) => void;
  onFocusNode?: (nodeId: string, element: SVGGraphicsElement) => void;
  onBlurNode?: (nodeId: string) => void;
  onKeyDownNode?: (nodeId: string, e: React.KeyboardEvent) => void;
}

export const WIND_HMI_PIPES: HmiPipeInfo[] = [
  { id: 'pipe-wt-hdr-a', label: '690V Turbine Feeder (Group A)', type: '690V Turbine Feeder', from: 'WT-001/002/003', to: 'Converter Suite A', color: '#0284c7' },
  { id: 'pipe-wt-hdr-b', label: '690V Turbine Feeder (Group B)', type: '690V Turbine Feeder', from: 'WT-004/005/006', to: 'Converter Suite B', color: '#0284c7' },
  { id: 'pipe-pcs-tr-a', label: 'Converter Output Busway A', type: 'Converter Output', from: 'Converter Suite A', to: 'Transformer Bay A', color: '#0284c7' },
  { id: 'pipe-pcs-tr-b', label: 'Converter Output Busway B', type: 'Converter Output', from: 'Converter Suite B', to: 'Transformer Bay B', color: '#0284c7' },
  { id: 'pipe-tr-gis-a', label: '33kV Collector Feed A', type: '33kV Collector Feed', from: 'Transformer Bay A', to: '132kV GIS Bay 1', color: '#0369a1' },
  { id: 'pipe-tr-gis-b', label: '33kV Collector Feed B', type: '33kV Collector Feed', from: 'Transformer Bay B', to: '132kV GIS Bay 2', color: '#0369a1' },
  { id: 'pipe-statcom', label: 'STATCOM Reactive Support', type: 'STATCOM Reactive Support', from: 'STATCOM Skid', to: '132kV GIS Bay 3', color: '#0ea5e9' },
  { id: 'pipe-gis-grid', label: '132kV Export Corridor', type: '132kV Export', from: '132kV GIS Lineup', to: 'Utility Grid Gantry', color: '#0369a1' }
];

export const WindHmiProcessSvg: React.FC<WindHmiProcessSvgProps> = ({
  assets,
  alerts,
  hoveredNodeId,
  selectedNodeId,
  statusFilter = 'all',
  hoveredPipeId,
  onHoverPipe,
  onMovePipe,
  onLeavePipe,
  onHoverNode,
  onLeaveNode,
  onSelectNode,
  onFocusNode,
  onBlurNode,
  onKeyDownNode
}) => {
  const assetMap = React.useMemo(() => {
    const map: Record<string, { asset: WindAsset; alerts: ReliabilityAlert[]; status: HmiMachineStatus }> = {};
    assets.forEach(asset => {
      const assetAlerts = alerts.filter(a => a.assetCode === asset.assetCode && isActiveAlertStatus(a.status));
      const status = deriveMachineHmiStatus(asset, assetAlerts);
      map[asset.assetCode] = { asset, alerts: assetAlerts, status };
    });
    return map;
  }, [assets, alerts]);

  const getMachineFilterDim = (assetCode?: string) => {
    if (!assetCode) return false;
    const item = assetMap[assetCode];
    if (!item) return false;
    if (statusFilter === 'all') return false;
    if (statusFilter === 'high') return item.status !== 'high' && item.status !== 'critical';
    if (statusFilter === 'moderate') return item.status !== 'moderate';
    if (statusFilter === 'healthy') return item.status !== 'normal';
    return false;
  };

  const getStatusColor = (status?: HmiMachineStatus) => {
    switch (status) {
      case 'critical': return '#e11d48'; // rose-600
      case 'high': return '#f43f5e';     // rose-500
      case 'moderate': return '#f59e0b'; // amber-500
      case 'normal':
      default: return '#10b981';         // emerald-500
    }
  };

  const renderStatusBeacon = (x: number, y: number, status: HmiMachineStatus, label: string) => {
    const color = getStatusColor(status);
    const isPulsing = status === 'high' || status === 'critical';

    return (
      <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
        {isPulsing && (
          <circle cx="0" cy="0" r="10" fill={color} opacity="0.3" className="animate-ping" />
        )}
        <circle cx="0" cy="0" r="4.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />
      </g>
    );
  };

  return (
    <svg
      id="windSvg"
      className="w-full h-full select-none"
      viewBox="0 0 1480 680"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wndTowerMetal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="35%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="wndNacelle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f1f5f9" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="wndCabinet3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="30%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="wndTrTank3D" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="15%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="85%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="wndPipe3DBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="35%" stopColor="#0284c7" />
          <stop offset="75%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        <linearGradient id="wndConcretePad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="wndStatcomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <filter id="wndMachineryShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>

        <style>{`
          @keyframes wndSpinBlade {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes wndDashFlow {
            to { stroke-dashoffset: -40; }
          }
          @media (prefers-reduced-motion: reduce) {
            .wnd-blade-spin { animation: none !important; }
            .wnd-flow-anim { animation: none !important; }
          }
          .wnd-blade-spin {
            animation: wndSpinBlade 4.2s linear infinite;
            transform-origin: 0px 0px;
          }
          .wnd-flow-anim {
            stroke-dasharray: 6 4;
            animation: wndDashFlow 1.2s linear infinite;
          }
        `}</style>
      </defs>

      {/* ================================================================= */}
      {/* 1. INDUSTRIAL PROCESS PIPING & ELECTRICAL CONDUIT CORRIDORS       */}
      {/* ================================================================= */}
      <g id="flowLines" strokeLinejoin="round">
        {/* GROUP A: 3 Turbines merging into Header A Corridor */}
        <g stroke="url(#wndPipe3DBlue)" strokeWidth="6" fill="none">
          <path d="M 230 122 L 290 122 L 290 165" />
          <path d="M 230 212 L 290 212 L 290 165" />
          <path d="M 230 302 L 290 302 L 290 165" />
          <path d="M 290 165 L 490 165" />
        </g>
        <rect x="286" y="115" width="8" height="14" rx="1.5" fill="#334155" stroke="#cbd5e1" />
        <rect x="286" y="205" width="8" height="14" rx="1.5" fill="#334155" stroke="#cbd5e1" />
        <rect x="286" y="295" width="8" height="14" rx="1.5" fill="#334155" stroke="#cbd5e1" />
        
        {/* Animated flow pulses Group A */}
        <g className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="2.5" fill="none">
          <path d="M 230 122 L 290 122 L 290 165" />
          <path d="M 230 212 L 290 212 L 290 165" />
          <path d="M 230 302 L 290 302 L 290 165" />
          <path d="M 290 165 L 490 165" />
        </g>

        {/* GROUP B: 3 Turbines merging into Header B Corridor */}
        <g stroke="url(#wndPipe3DBlue)" strokeWidth="6" fill="none">
          <path d="M 230 432 L 290 432 L 290 475" />
          <path d="M 230 522 L 290 522 L 290 475" />
          <path d="M 230 612 L 290 612 L 290 475" />
          <path d="M 290 475 L 490 475" />
        </g>
        <rect x="286" y="425" width="8" height="14" rx="1.5" fill="#334155" stroke="#cbd5e1" />
        <rect x="286" y="515" width="8" height="14" rx="1.5" fill="#334155" stroke="#cbd5e1" />
        <rect x="286" y="605" width="8" height="14" rx="1.5" fill="#334155" stroke="#cbd5e1" />
        
        {/* Animated flow pulses Group B */}
        <g className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="2.5" fill="none">
          <path d="M 230 432 L 290 432 L 290 475" />
          <path d="M 230 522 L 290 522 L 290 475" />
          <path d="M 230 612 L 290 612 L 290 475" />
          <path d="M 290 475 L 490 475" />
        </g>

        {/* Converter Suite A to Step-Up Transformer A */}
        <path d="M 640 165 L 760 165" stroke="url(#wndPipe3DBlue)" strokeWidth="7" fill="none" />
        <path d="M 640 165 L 760 165" className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="3" fill="none" />

        {/* Converter Suite B to Step-Up Transformer B */}
        <path d="M 640 475 L 760 475" stroke="url(#wndPipe3DBlue)" strokeWidth="7" fill="none" />
        <path d="M 640 475 L 760 475" className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="3" fill="none" />

        {/* Transformer Bay A to 132kV GIS Bay 1 */}
        <path d="M 850 165 L 950 165 L 950 280 L 1020 280" stroke="#0369a1" strokeWidth="7" fill="none" />
        <path d="M 850 165 L 950 165 L 950 280 L 1020 280" className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="3.2" fill="none" />

        {/* Transformer Bay B to 132kV GIS Bay 2 */}
        <path d="M 850 475 L 950 475 L 950 340 L 1020 340" stroke="#0369a1" strokeWidth="7" fill="none" />
        <path d="M 850 475 L 950 475 L 950 340 L 1020 340" className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="3.2" fill="none" />

        {/* STATCOM Skid to Substation Bay 3 */}
        <path d="M 785 585 L 860 585 L 860 400 L 1020 400" stroke="#0ea5e9" strokeWidth="6" fill="none" />
        <path d="M 785 585 L 860 585 L 860 400 L 1020 400" className="wnd-flow-anim" stroke="#7dd3fc" strokeWidth="2.5" fill="none" />

        {/* Substation Outgoing to Utility Grid */}
        <path d="M 1170 320 L 1360 320" stroke="#0369a1" strokeWidth="7" fill="none" />
        <path d="M 1170 320 L 1360 320" className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="3.2" fill="none" />

        {/* Invisible Wide Hit Paths for Pipe Hover Tooltips (Section 55) */}
        {WIND_HMI_PIPES.map(pipe => {
          let d = '';
          if (pipe.id === 'pipe-wt-hdr-a') d = 'M 230 165 L 490 165';
          else if (pipe.id === 'pipe-wt-hdr-b') d = 'M 230 475 L 490 475';
          else if (pipe.id === 'pipe-pcs-tr-a') d = 'M 640 165 L 760 165';
          else if (pipe.id === 'pipe-pcs-tr-b') d = 'M 640 475 L 760 475';
          else if (pipe.id === 'pipe-tr-gis-a') d = 'M 850 165 L 950 165 L 950 280 L 1020 280';
          else if (pipe.id === 'pipe-tr-gis-b') d = 'M 850 475 L 950 475 L 950 340 L 1020 340';
          else if (pipe.id === 'pipe-statcom') d = 'M 785 585 L 860 585 L 860 400 L 1020 400';
          else if (pipe.id === 'pipe-gis-grid') d = 'M 1170 320 L 1360 320';

          return (
            <path
              key={pipe.id}
              d={d}
              stroke="transparent"
              strokeWidth="28"
              fill="none"
              className="cursor-pointer"
              onMouseEnter={(e) => onHoverPipe?.(pipe, e)}
              onMouseMove={onMovePipe}
              onMouseLeave={onLeavePipe}
            />
          );
        })}
      </g>

      {/* ================================================================= */}
      {/* 2. CONNECTING MACHINERY & SCHEMATIC SYMBOLS                       */}
      {/* ================================================================= */}
      <g id="windConnectingDevices">
        {/* Header A Cable Link */}
        <g transform="translate(375, 150)">
          <rect x="0" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#0284c7" strokeWidth="2" filter="url(#wndMachineryShadow)" />
          <circle cx="9" cy="10" r="4" fill="#ef4444" />
          <circle cx="21" cy="10" r="4" fill="#eab308" />
          <circle cx="15" cy="21" r="4" fill="#3b82f6" />
        </g>

        {/* Header B Cable Link */}
        <g transform="translate(375, 460)">
          <rect x="0" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#0284c7" strokeWidth="2" filter="url(#wndMachineryShadow)" />
          <circle cx="9" cy="10" r="4" fill="#ef4444" />
          <circle cx="21" cy="10" r="4" fill="#eab308" />
          <circle cx="15" cy="21" r="4" fill="#3b82f6" />
        </g>

        {/* Converter A ACB */}
        <g transform="translate(685, 148)">
          <rect x="0" y="0" width="28" height="32" rx="3.5" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
          <line x1="5" y1="5" x2="23" y2="27" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="23" y1="5" x2="5" y2="27" stroke="#38bdf8" strokeWidth="2.2" />
          <rect x="3" y="26" width="22" height="3.5" fill="#10b981" />
        </g>

        {/* Converter B ACB */}
        <g transform="translate(685, 458)">
          <rect x="0" y="0" width="28" height="32" rx="3.5" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
          <line x1="5" y1="5" x2="23" y2="27" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="23" y1="5" x2="5" y2="27" stroke="#38bdf8" strokeWidth="2.2" />
          <rect x="3" y="26" width="22" height="3.5" fill="#10b981" />
        </g>

        {/* Transformer A Pothead */}
        <g transform="translate(900, 148)">
          <polygon points="14,18 0,0 28,0" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" filter="url(#wndMachineryShadow)" />
          <line x1="14" y1="18" x2="14" y2="28" stroke="#64748b" strokeWidth="2.5" />
          <line x1="7" y1="28" x2="21" y2="28" stroke="#64748b" strokeWidth="2.5" />
          <text x="14" y="-3" fontSize="10" fontWeight="bold" fill="#f59e0b" textAnchor="middle">⚡</text>
        </g>

        {/* Transformer B Pothead */}
        <g transform="translate(900, 458)">
          <polygon points="14,18 0,0 28,0" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" filter="url(#wndMachineryShadow)" />
          <line x1="14" y1="18" x2="14" y2="28" stroke="#64748b" strokeWidth="2.5" />
          <line x1="7" y1="28" x2="21" y2="28" stroke="#64748b" strokeWidth="2.5" />
          <text x="14" y="-3" fontSize="10" fontWeight="bold" fill="#f59e0b" textAnchor="middle">⚡</text>
        </g>

        {/* STATCOM Reactor */}
        <g transform="translate(815, 572)">
          <rect x="0" y="0" width="28" height="26" rx="3.5" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
          <path d="M 4 13 Q 8 5, 12 13 Q 16 5, 20 13 T 26 13" fill="none" stroke="#7dd3fc" strokeWidth="2.2" />
        </g>

        {/* GIS Grid Intertie Disconnector */}
        <g transform="translate(1220, 295)">
          <rect x="0" y="6" width="30" height="30" rx="3.5" fill="#1e293b" stroke="#0284c7" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
          <line x1="6" y1="27" x2="24" y2="13" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          <circle cx="6" cy="27" r="2.5" fill="#ffffff" />
          <circle cx="24" cy="13" r="2.5" fill="#ffffff" />
          <circle cx="15" cy="1" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.3" />
          <circle cx="21" cy="1" r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.3" />
        </g>
      </g>

      {/* ================================================================= */}
      {/* 3. MACHINERY FLEET: 6 WIND TURBINES (WT-001 - WT-006)             */}
      {/* ================================================================= */}
      {[
        { id: 'node-turbine-1', code: 'WT-001', y: 38, speed: '4.2s' },
        { id: 'node-turbine-2', code: 'WT-002', y: 128, speed: '4.5s' },
        { id: 'node-turbine-3', code: 'WT-003', y: 218, speed: '4.1s' },
        { id: 'node-turbine-4', code: 'WT-004', y: 348, speed: '4.7s' },
        { id: 'node-turbine-5', code: 'WT-005', y: 438, speed: '4.4s' },
        { id: 'node-turbine-6', code: 'WT-006', y: 528, speed: '4.3s' }
      ].map(t => {
        const item = assetMap[t.code];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim(t.code);
        const isSelected = selectedNodeId === t.id;
        const isHovered = hoveredNodeId === t.id;

        return (
          <g
            key={t.id}
            id={t.id}
            transform={`translate(45, ${t.y})`}
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : isHovered ? 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.9))' : 'none'}
            onClick={() => onSelectNode(t.id)}
            onMouseEnter={(e) => onHoverNode(t.id, e)}
            onMouseLeave={onLeaveNode}
            tabIndex={0}
            role="button"
            aria-label={`${t.code} Wind Turbine`}
            onFocus={(e) => onFocusNode?.(t.id, e.currentTarget)}
            onBlur={() => onBlurNode?.(t.id)}
            onKeyDown={(e) => onKeyDownNode?.(t.id, e)}
          >
            {/* Transparent Hitbox */}
            <rect x="20" y="-10" width="80" height="110" fill="transparent" />

            {/* Cable Conduit from Foundation */}
            <path d="M 60 78 L 60 84 L 185 84" fill="none" stroke="url(#wndPipe3DBlue)" strokeWidth="5" />
            <path d="M 60 78 L 60 84 L 185 84" fill="none" className="wnd-flow-anim" stroke="#38bdf8" strokeWidth="2" />
            <rect x="180" y="78" width="8" height="12" rx="1.5" fill="#334155" stroke="#cbd5e1" />

            {/* Foundation Base */}
            <rect x="38" y="76" width="44" height="6" rx="2" fill="#475569" stroke="#1e293b" />
            {/* Tubular Tower */}
            <polygon points="54,76 66,76 62,28 58,28" fill="url(#wndTowerMetal)" stroke="#64748b" strokeWidth="1.2" filter="url(#wndMachineryShadow)" />
            {/* Aerodynamic Nacelle */}
            <path d="M 60 22 L 86 24 Q 90 24 90 28 Q 90 32 86 32 L 60 34 Z" fill="url(#wndNacelle)" stroke="#475569" strokeWidth="1.2" filter="url(#wndMachineryShadow)" />
            
            {/* Rear Anemometer */}
            <line x1="86" y1="24" x2="86" y2="18" stroke="#334155" strokeWidth="1.5" />
            <circle cx="86" cy="17" r="2.2" fill="#0284c7" />

            {/* ROTATING ROTOR AT HUB CONE (60, 28) */}
            <g transform="translate(60, 28)">
              <g className="wnd-blade-spin" style={{ animationDuration: t.speed }}>
                {/* Blade 1 (Up) */}
                <path d="M 0 0 C -2.5 -13.0, -0.8 -26.0, 0.0 -26.0 C 0.8 -26.0, 2.5 -13.0, 0 0 Z" fill="#ffffff" stroke="#475569" strokeWidth="1" />
                {/* Blade 2 (Down-Right) */}
                <path d="M 0 0 C 12.5 4.3, 22.9 12.4, 22.5 13.0 C 22.1 13.6, 10.0 8.7, 0 0 Z" fill="#ffffff" stroke="#475569" strokeWidth="1" />
                {/* Blade 3 (Down-Left) */}
                <path d="M 0 0 C -10.0 8.7, -22.1 13.6, -22.5 13.0 C -22.9 12.4, -12.5 4.3, 0 0 Z" fill="#ffffff" stroke="#475569" strokeWidth="1" />
                {/* Hub Cone */}
                <circle cx="0" cy="0" r="4.5" fill="#0284c7" stroke="#0f172a" strokeWidth="1.2" />
              </g>
            </g>

            {/* Status Beacon on Nacelle Tail */}
            {renderStatusBeacon(70, 21, status, t.code)}

            {/* Identification Badge */}
            <rect x="36" y="88" width="48" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#wndMachineryShadow)" />
            <text x="60" y="99" fontSize="7.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">{t.code}</text>
          </g>
        );
      })}

      {/* METEOROLOGICAL MAST (MET-01) */}
      <g
        id="node-met-mast"
        transform="translate(340, 545)"
        className="cursor-pointer"
        onClick={() => onSelectNode('node-met-mast')}
        onMouseEnter={(e) => onHoverNode('node-met-mast', e)}
        onMouseLeave={onLeaveNode}
      >
        <rect x="-6" y="-6" width="105" height="95" fill="transparent" />
        <rect x="18" y="74" width="28" height="5" rx="2" fill="#475569" stroke="#1e293b" />
        <line x1="32" y1="16" x2="32" y2="74" stroke="#334155" strokeWidth="3" />
        <line x1="14" y1="28" x2="50" y2="28" stroke="#334155" strokeWidth="2.5" />
        <circle cx="14" cy="23" r="3.8" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
        <circle cx="50" cy="23" r="3.8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
        <line x1="32" y1="16" x2="32" y2="8" stroke="#ef4444" strokeWidth="2" />
        <circle cx="32" cy="7" r="2.8" fill="#dc2626" />
        <rect x="22" y="44" width="20" height="16" rx="2" fill="#1e293b" stroke="#64748b" />
        <rect x="2" y="82" width="60" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#wndMachineryShadow)" />
        <text x="32" y="93" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">MET-01</text>
      </g>

      {/* CONVERTER SUITE A */}
      {(() => {
        const item = assetMap['PCS-A'];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim('PCS-A');
        const isSelected = selectedNodeId === 'node-converter-suite-a';

        return (
          <g
            id="node-converter-suite-a"
            transform="translate(490, 95)"
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : 'none'}
            onClick={() => onSelectNode('node-converter-suite-a')}
            onMouseEnter={(e) => onHoverNode('node-converter-suite-a', e)}
            onMouseLeave={onLeaveNode}
          >
            <polygon points="0,122 155,122 160,130 5,130" fill="url(#wndConcretePad)" stroke="#334155" />
            <polygon points="10,0 145,0 150,8 15,8" fill="#475569" stroke="#1e293b" />
            <rect x="5" y="8" width="150" height="114" rx="5" fill="url(#wndCabinet3D)" stroke="#0284c7" strokeWidth="2" filter="url(#wndMachineryShadow)" />
            {/* Bay 1 */}
            <rect x="14" y="20" width="38" height="66" rx="2" fill="#0f172a" stroke="#334155" />
            <line x1="18" y1="30" x2="48" y2="30" stroke="#38bdf8" strokeWidth="2" />
            <line x1="18" y1="36" x2="48" y2="36" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="33" cy="56" r="5" fill="#10b981" />
            <text x="33" y="78" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INCOMER</text>
            {/* Bay 2 */}
            <rect x="56" y="20" width="46" height="66" rx="2" fill="#0f172a" stroke="#0284c7" />
            <path d="M 64 42 Q 69 34, 74 42 T 84 42 T 94 42" fill="none" stroke="#10b981" strokeWidth="1.8" />
            <circle cx="67" cy="60" r="2.5" fill="#10b981" />
            <circle cx="76" cy="60" r="2.5" fill="#38bdf8" />
            <circle cx="85" cy="60" r="2.5" fill="#f59e0b" />
            <text x="79" y="72" fontSize="6" fontWeight="bold" fill="#38bdf8" textAnchor="middle">690V AC</text>
            <text x="79" y="80" fontSize="5.5" fill="#94a3b8" textAnchor="middle">IGBT CORE</text>
            {/* Bay 3 */}
            <rect x="106" y="20" width="40" height="66" rx="2" fill="#0f172a" stroke="#334155" />
            <circle cx="126" cy="46" r="10" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="126" y="78" fontSize="6" fontWeight="bold" fill="#38bdf8" textAnchor="middle">CHILLER</text>
            
            {renderStatusBeacon(145, 18, status, 'PCS-A')}
            <text x="80" y="103" fontSize="8.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">Converter Suite A (3-Bay)</text>
          </g>
        );
      })()}

      {/* CONVERTER SUITE B */}
      {(() => {
        const item = assetMap['PCS-B'];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim('PCS-B');
        const isSelected = selectedNodeId === 'node-converter-suite-b';

        return (
          <g
            id="node-converter-suite-b"
            transform="translate(490, 405)"
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : 'none'}
            onClick={() => onSelectNode('node-converter-suite-b')}
            onMouseEnter={(e) => onHoverNode('node-converter-suite-b', e)}
            onMouseLeave={onLeaveNode}
          >
            <polygon points="0,122 155,122 160,130 5,130" fill="url(#wndConcretePad)" stroke="#334155" />
            <polygon points="10,0 145,0 150,8 15,8" fill="#475569" stroke="#1e293b" />
            <rect x="5" y="8" width="150" height="114" rx="5" fill="url(#wndCabinet3D)" stroke="#0284c7" strokeWidth="2" filter="url(#wndMachineryShadow)" />
            <rect x="14" y="20" width="38" height="66" rx="2" fill="#0f172a" stroke="#334155" />
            <line x1="18" y1="30" x2="48" y2="30" stroke="#38bdf8" strokeWidth="2" />
            <line x1="18" y1="36" x2="48" y2="36" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="33" cy="56" r="5" fill="#10b981" />
            <text x="33" y="78" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INCOMER</text>
            <rect x="56" y="20" width="46" height="66" rx="2" fill="#0f172a" stroke="#0284c7" />
            <path d="M 64 42 Q 69 34, 74 42 T 84 42 T 94 42" fill="none" stroke="#10b981" strokeWidth="1.8" />
            <circle cx="67" cy="60" r="2.5" fill="#10b981" />
            <circle cx="76" cy="60" r="2.5" fill="#38bdf8" />
            <circle cx="85" cy="60" r="2.5" fill="#f59e0b" />
            <text x="79" y="72" fontSize="6" fontWeight="bold" fill="#38bdf8" textAnchor="middle">690V AC</text>
            <text x="79" y="80" fontSize="5.5" fill="#94a3b8" textAnchor="middle">IGBT CORE</text>
            <rect x="106" y="20" width="40" height="66" rx="2" fill="#0f172a" stroke="#334155" />
            <circle cx="126" cy="46" r="10" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="126" y="78" fontSize="6" fontWeight="bold" fill="#38bdf8" textAnchor="middle">CHILLER</text>
            
            {renderStatusBeacon(145, 18, status, 'PCS-B')}
            <text x="80" y="103" fontSize="8.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">Converter Suite B (3-Bay)</text>
          </g>
        );
      })()}

      {/* STEP-UP TRANSFORMER BAY A */}
      {(() => {
        const item = assetMap['TR-BAY-A'];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim('TR-BAY-A');
        const isSelected = selectedNodeId === 'node-transformer-bay-a';

        return (
          <g
            id="node-transformer-bay-a"
            transform="translate(760, 105)"
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : 'none'}
            onClick={() => onSelectNode('node-transformer-bay-a')}
            onMouseEnter={(e) => onHoverNode('node-transformer-bay-a', e)}
            onMouseLeave={onLeaveNode}
          >
            <polygon points="5,108 105,108 110,116 0,116" fill="url(#wndConcretePad)" stroke="#334155" />
            <rect x="10" y="24" width="90" height="84" rx="8" fill="url(#wndTrTank3D)" stroke="#475569" strokeWidth="2.5" filter="url(#wndMachineryShadow)" />
            {/* Radiators */}
            <g stroke="#64748b" strokeWidth="3.5" strokeLinecap="round">
              <line x1="2" y1="38" x2="10" y2="38" />
              <line x1="2" y1="52" x2="10" y2="52" />
              <line x1="2" y1="66" x2="10" y2="66" />
              <line x1="2" y1="80" x2="10" y2="80" />
              <line x1="100" y1="38" x2="108" y2="38" />
              <line x1="100" y1="52" x2="108" y2="52" />
              <line x1="100" y1="66" x2="108" y2="66" />
              <line x1="100" y1="80" x2="108" y2="80" />
            </g>
            <polygon points="35,24 38,10 44,10 47,24" fill="#cbd5e1" stroke="#475569" />
            <polygon points="63,24 66,10 72,10 75,24" fill="#cbd5e1" stroke="#475569" />
            <circle cx="55" cy="56" r="14" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
            <line x1="55" y1="56" x2="63" y2="50" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            <circle cx="55" cy="56" r="2.5" fill="#0f172a" />
            
            {renderStatusBeacon(90, 32, status, 'TR-BAY-A')}
            <text x="55" y="86" fontSize="8.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">Transformer Bay A</text>
          </g>
        );
      })()}

      {/* STEP-UP TRANSFORMER BAY B */}
      {(() => {
        const item = assetMap['TR-BAY-B'];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim('TR-BAY-B');
        const isSelected = selectedNodeId === 'node-transformer-bay-b';

        return (
          <g
            id="node-transformer-bay-b"
            transform="translate(760, 415)"
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : 'none'}
            onClick={() => onSelectNode('node-transformer-bay-b')}
            onMouseEnter={(e) => onHoverNode('node-transformer-bay-b', e)}
            onMouseLeave={onLeaveNode}
          >
            <polygon points="5,108 105,108 110,116 0,116" fill="url(#wndConcretePad)" stroke="#334155" />
            <rect x="10" y="24" width="90" height="84" rx="8" fill="url(#wndTrTank3D)" stroke="#475569" strokeWidth="2.5" filter="url(#wndMachineryShadow)" />
            <g stroke="#64748b" strokeWidth="3.5" strokeLinecap="round">
              <line x1="2" y1="38" x2="10" y2="38" />
              <line x1="2" y1="52" x2="10" y2="52" />
              <line x1="2" y1="66" x2="10" y2="66" />
              <line x1="2" y1="80" x2="10" y2="80" />
              <line x1="100" y1="38" x2="108" y2="38" />
              <line x1="100" y1="52" x2="108" y2="52" />
              <line x1="100" y1="66" x2="108" y2="66" />
              <line x1="100" y1="80" x2="108" y2="80" />
            </g>
            <polygon points="35,24 38,10 44,10 47,24" fill="#cbd5e1" stroke="#475569" />
            <polygon points="63,24 66,10 72,10 75,24" fill="#cbd5e1" stroke="#475569" />
            <circle cx="55" cy="56" r="14" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
            <line x1="55" y1="56" x2="63" y2="50" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            <circle cx="55" cy="56" r="2.5" fill="#0f172a" />
            
            {renderStatusBeacon(90, 32, status, 'TR-BAY-B')}
            <text x="55" y="86" fontSize="8.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">Transformer Bay B</text>
          </g>
        );
      })()}

      {/* STATCOM SKID */}
      {(() => {
        const item = assetMap['STAT-01'];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim('STAT-01');
        const isSelected = selectedNodeId === 'node-statcom-skid';

        return (
          <g
            id="node-statcom-skid"
            transform="translate(680, 560)"
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : 'none'}
            onClick={() => onSelectNode('node-statcom-skid')}
            onMouseEnter={(e) => onHoverNode('node-statcom-skid', e)}
            onMouseLeave={onLeaveNode}
          >
            <polygon points="0,58 110,58 114,64 4,64" fill="url(#wndConcretePad)" stroke="#334155" />
            <rect x="4" y="8" width="102" height="50" rx="4" fill="url(#wndStatcomGrad)" stroke="#0284c7" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
            <rect x="18" y="16" width="74" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text x="55" y="25" fontSize="6.5" fontWeight="bold" fill="#38bdf8" textAnchor="middle">±20 MVAR STATCOM</text>
            
            {renderStatusBeacon(96, 18, status, 'STAT-01')}
            <text x="55" y="52" fontSize="7.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">STATCOM Skid</text>
          </g>
        );
      })()}

      {/* AUX GENSET (Process context) */}
      <g
        id="node-aux-genset"
        transform="translate(905, 560)"
        className="cursor-pointer"
        onClick={() => onSelectNode('node-aux-genset')}
        onMouseEnter={(e) => onHoverNode('node-aux-genset', e)}
        onMouseLeave={onLeaveNode}
      >
        <polygon points="0,58 95,58 98,64 3,64" fill="url(#wndConcretePad)" stroke="#334155" />
        <rect x="3" y="12" width="90" height="46" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
        <line x1="10" y1="22" x2="28" y2="22" stroke="#94a3b8" strokeWidth="2" />
        <line x1="10" y1="27" x2="28" y2="27" stroke="#94a3b8" strokeWidth="2" />
        <line x1="10" y1="32" x2="28" y2="32" stroke="#94a3b8" strokeWidth="2" />
        <path d="M 18 12 L 18 6 L 22 6 L 22 12" fill="#64748b" />
        <text x="56" y="29" fontSize="6.5" fontWeight="bold" fill="#10b981" textAnchor="middle">STANDBY OK</text>
        <circle cx="82" cy="27" r="2.5" fill="#10b981" />
        <text x="48" y="50" fontSize="7" fontWeight="bold" fill="#ffffff" textAnchor="middle">Aux GenSet (2.5 MVA)</text>
      </g>

      {/* 5-BAY 132kV SF6 GIS SUBSTATION */}
      {(() => {
        const item = assetMap['GIS-132'];
        const status = item?.status ?? 'normal';
        const isDimmed = getMachineFilterDim('GIS-132');
        const isSelected = selectedNodeId === 'node-main-substation';

        return (
          <g
            id="node-main-substation"
            transform="translate(1020, 215)"
            className="cursor-pointer transition-all duration-200"
            opacity={isDimmed ? 0.35 : 1}
            filter={isSelected ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : 'none'}
            onClick={() => onSelectNode('node-main-substation')}
            onMouseEnter={(e) => onHoverNode('node-main-substation', e)}
            onMouseLeave={onLeaveNode}
          >
            <polygon points="0,175 160,175 165,185 5,185" fill="url(#wndConcretePad)" stroke="#334155" />
            <rect x="5" y="10" width="150" height="165" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" filter="url(#wndMachineryShadow)" />
            <rect x="12" y="15" width="136" height="22" rx="4" fill="url(#wndTowerMetal)" stroke="#64748b" strokeWidth="1.2" />
            <text x="80" y="29" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">132 kV SF6 GIS BUSBAR</text>
            
            {/* Bay 1 */}
            <rect x="12" y="44" width="24" height="85" rx="2" fill="#1e293b" stroke="#475569" />
            <circle cx="24" cy="56" r="4.5" fill="#0284c7" />
            <circle cx="24" cy="80" r="2" fill="#10b981" />
            <text x="24" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INC-1</text>
            <text x="24" y="115" fontSize="4.5" fill="#38bdf8" textAnchor="middle">15MW</text>

            {/* Bay 2 */}
            <rect x="40" y="44" width="24" height="85" rx="2" fill="#1e293b" stroke="#475569" />
            <circle cx="52" cy="56" r="4.5" fill="#0284c7" />
            <circle cx="52" cy="80" r="2" fill="#10b981" />
            <text x="52" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INC-2</text>
            <text x="52" y="115" fontSize="4.5" fill="#38bdf8" textAnchor="middle">15MW</text>

            {/* Bay 3 */}
            <rect x="68" y="44" width="24" height="85" rx="2" fill="#1e293b" stroke="#475569" />
            <circle cx="80" cy="56" r="4.5" fill="#0ea5e9" />
            <circle cx="80" cy="80" r="2" fill="#10b981" />
            <text x="80" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">STAT</text>
            <text x="80" y="115" fontSize="4.5" fill="#7dd3fc" textAnchor="middle">±20M</text>

            {/* Bay 4 */}
            <rect x="96" y="44" width="24" height="85" rx="2" fill="#1e293b" stroke="#475569" />
            <circle cx="108" cy="56" r="4.5" fill="#10b981" />
            <circle cx="108" cy="80" r="2" fill="#10b981" />
            <text x="108" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">TIE</text>
            <text x="108" y="115" fontSize="4.5" fill="#10b981" textAnchor="middle">OK</text>

            {/* Bay 5 */}
            <rect x="124" y="44" width="24" height="85" rx="2" fill="#1e293b" stroke="#475569" />
            <circle cx="136" cy="56" r="4.5" fill="#ef4444" />
            <circle cx="136" cy="80" r="2" fill="#10b981" />
            <text x="136" y="105" fontSize="5" fontWeight="bold" fill="#f59e0b" textAnchor="middle">OUT</text>
            <text x="136" y="115" fontSize="4.5" fill="#cbd5e1" textAnchor="middle">132kV</text>

            {renderStatusBeacon(148, 22, status, 'GIS-132')}
          </g>
        );
      })()}

      {/* UTILITY GRID TRANSMISSION TOWER */}
      <g
        id="node-utility-grid"
        transform="translate(1360, 210)"
        className="cursor-pointer"
        onClick={() => onSelectNode('node-utility-grid')}
        onMouseEnter={(e) => onHoverNode('node-utility-grid', e)}
        onMouseLeave={onLeaveNode}
      >
        <polygon points="45,10 15,185 75,185" fill="none" stroke="#1e293b" strokeWidth="4" />
        <line x1="5" y1="60" x2="85" y2="60" stroke="#1e293b" strokeWidth="4" />
        <line x1="12" y1="105" x2="78" y2="105" stroke="#1e293b" strokeWidth="4" />
        <line x1="28" y1="10" x2="62" y2="185" stroke="#475569" strokeWidth="2" />
        <line x1="62" y1="10" x2="28" y2="185" stroke="#475569" strokeWidth="2" />
        <line x1="10" y1="60" x2="10" y2="82" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="2 2" />
        <line x1="80" y1="60" x2="80" y2="82" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="2 2" />
        <circle cx="45" cy="8" r="3.5" fill="#dc2626" />
        <rect x="0" y="192" width="90" height="38" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" filter="url(#wndMachineryShadow)" />
        <text x="45" y="207" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">Utility Grid</text>
      </g>
    </svg>
  );
};
