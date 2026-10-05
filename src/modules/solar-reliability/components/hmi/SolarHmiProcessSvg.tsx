import React from 'react';
import { SolarAsset } from '../../types';

interface SolarHmiProcessSvgProps {
  assets: SolarAsset[];
  selectedAssetCode: string | null;
  onSelectNode: (asset: SolarAsset) => void;
  onHoverNode: (asset: SolarAsset, event: React.MouseEvent<SVGGElement>) => void;
  onLeaveNode: () => void;
  onHoverPipe: (label: string, event: React.MouseEvent<SVGElement>) => void;
  onLeavePipe: () => void;
}

export const SolarHmiProcessSvg: React.FC<SolarHmiProcessSvgProps> = ({
  assets,
  selectedAssetCode,
  onSelectNode,
  onHoverNode,
  onLeaveNode,
  onHoverPipe,
  onLeavePipe
}) => {
  const getAsset = (code: string): SolarAsset | undefined => {
    return assets.find(a => a.assetCode === code);
  };

  const getStatusBadgeColor = (asset?: SolarAsset) => {
    if (!asset) return '#10b981';
    if (asset.riskLevel === 'Critical' || asset.riskLevel === 'High') return '#ef4444';
    if (asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate') return '#f59e0b';
    return '#10b981';
  };

  const inv2 = getAsset('INV-02');
  const pv3a = getAsset('PV-ROW-3A');

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
      <style>{`
        @keyframes solFanSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes solFlowDash {
          to { stroke-dashoffset: -40; }
        }
        @keyframes solBeaconBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .sol-fan {
          animation: solFanSpin 1.4s linear infinite;
        }
        .sol-flow-line {
          stroke-dasharray: 6 4;
          animation: solFlowDash 1.2s linear infinite;
        }
        .sol-beacon {
          animation: solBeaconBlink 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sol-fan, .sol-flow-line, .sol-beacon {
            animation: none !important;
          }
        }
        .sol-node {
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .sol-node:hover {
          filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.95)) brightness(1.05);
        }
        .sol-pipe-hit {
          cursor: pointer;
          stroke: transparent;
          fill: none;
        }
        .sol-pipe-hit:hover + .sol-pipe-visual,
        .sol-pipe-hit:hover {
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.9));
        }
      `}</style>

      <svg 
        id="solarHmiSvg" 
        className="w-full h-full block" 
        viewBox="0 0 1480 680" 
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pvCellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#172554" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="solarSkidMetal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <linearGradient id="combiner3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="bessContainerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="40%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>

          <linearGradient id="pipe3DAmber" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="pipe3DBlueSolar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="35%" stopColor="#0284c7" />
            <stop offset="75%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>

          <linearGradient id="concretePadSolar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <filter id="machineryShadowSolar" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. PROCESS POWER LINES WITH INVISIBLE HIT PATHS */}
        <g id="solarFlowLinesGroup" strokeLinejoin="round">
          
          {/* PV Strings to Combiners (DC 1.5kV) */}
          <g stroke="url(#pipe3DAmber)" strokeWidth="5" fill="none">
            <path d="M 155 60 L 225 60" />
            <path d="M 155 145 L 225 145" />
            <path d="M 155 230 L 225 230" />
            <path d="M 155 315 L 225 315" />
            <path d="M 155 400 L 225 400" />
            <path d="M 155 485 L 225 485" />
          </g>
          <g className="sol-flow-line" stroke="#fef08a" strokeWidth="2" fill="none">
            <path d="M 155 60 L 225 60" />
            <path d="M 155 145 L 225 145" />
            <path d="M 155 230 L 225 230" />
            <path d="M 155 315 L 225 315" />
            <path d="M 155 400 L 225 400" />
            <path d="M 155 485 L 225 485" />
          </g>
          {/* Hit path for PV DC String Feed */}
          <path 
            d="M 155 60 L 225 60 M 155 145 L 225 145 M 155 230 L 225 230 M 155 315 L 225 315 M 155 400 L 225 400 M 155 485 L 225 485"
            strokeWidth="20"
            className="sol-pipe-hit"
            onMouseEnter={(e) => onHoverPipe('PV DC String Feed (1,500V DC • 9.2A per string)', e)}
            onMouseLeave={onLeavePipe}
          />

          {/* Combiners to Inverters (DC 1.5 kV Bus Trunking) */}
          <g stroke="url(#pipe3DAmber)" strokeWidth="6" fill="none">
            <path d="M 315 60 L 360 60 L 360 95 L 420 95" />
            <path d="M 315 145 L 360 145 L 360 95" />
            <path d="M 315 230 L 360 230 L 360 265 L 420 265" />
            <path d="M 315 315 L 360 315 L 360 265" />
            <path d="M 315 400 L 360 400 L 360 435 L 420 435" />
            <path d="M 315 485 L 360 485 L 360 435" />
          </g>
          <g className="sol-flow-line" stroke="#fef08a" strokeWidth="2.5" fill="none">
            <path d="M 315 60 L 360 60 L 360 95 L 420 95" />
            <path d="M 315 145 L 360 145 L 360 95" />
            <path d="M 315 230 L 360 230 L 360 265 L 420 265" />
            <path d="M 315 315 L 360 315 L 360 265" />
            <path d="M 315 400 L 360 400 L 360 435 L 420 435" />
            <path d="M 315 485 L 360 485 L 360 435" />
          </g>
          {/* Hit path for DC Collector Trunk */}
          <path 
            d="M 315 60 L 360 60 L 360 95 L 420 95 M 315 230 L 360 230 L 360 265 L 420 265 M 315 400 L 360 400 L 360 435 L 420 435"
            strokeWidth="22"
            className="sol-pipe-hit"
            onMouseEnter={(e) => onHoverPipe('1.5kV DC Collector Trunk (14.0 kA Aggregated Busway)', e)}
            onMouseLeave={onLeavePipe}
          />

          {/* Inverters to Step-Up Transformers (AC 800V Flanged Busway) */}
          <g stroke="url(#pipe3DBlueSolar)" strokeWidth="7" fill="none">
            <path d="M 555 95 L 670 95" />
            <path d="M 555 265 L 670 265" />
            <path d="M 555 435 L 670 435" />
          </g>
          <g className="sol-flow-line" stroke="#38bdf8" strokeWidth="2.5" fill="none">
            <path d="M 555 95 L 670 95" />
            <path d="M 555 265 L 670 265" />
            <path d="M 555 435 L 670 435" />
          </g>
          {/* Hit path for Inverter AC Output */}
          <path 
            d="M 555 95 L 670 95 M 555 265 L 670 265 M 555 435 L 670 435"
            strokeWidth="24"
            className="sol-pipe-hit"
            onMouseEnter={(e) => onHoverPipe('Inverter AC Output (800V AC • 30.5 kA Heavy Busway)', e)}
            onMouseLeave={onLeavePipe}
          />

          {/* BESS Container Power Link: Charging State Flow (Switchgear -> BESS) */}
          <g stroke="url(#pipe3DBlueSolar)" strokeWidth="6" fill="none">
            <path d="M 880 410 L 850 410 L 850 585 L 375 585" />
          </g>
          <g className="sol-flow-line" stroke="#38bdf8" strokeWidth="2" fill="none">
            <path d="M 880 410 L 850 410 L 850 585 L 375 585" />
          </g>
          {/* Hit path for BESS Power Link */}
          <path 
            d="M 880 410 L 850 410 L 850 585 L 375 585"
            strokeWidth="22"
            className="sol-pipe-hit"
            onMouseEnter={(e) => onHoverPipe('33kV BESS Power Link (Charging State: +10.0 MW from Switchgear Bay 4)', e)}
            onMouseLeave={onLeavePipe}
          />

          {/* Transformers to 33 kV MV Switchgear Lineup (33 kV Feeders) */}
          <g stroke="url(#pipe3DBlueSolar)" strokeWidth="7" fill="none">
            <path d="M 770 95 L 840 95 L 840 230 L 880 230" />
            <path d="M 770 265 L 880 265" />
            <path d="M 770 435 L 840 435 L 840 335 L 880 335" />
          </g>
          <g className="sol-flow-line" stroke="#38bdf8" strokeWidth="2.5" fill="none">
            <path d="M 770 95 L 840 95 L 840 230 L 880 230" />
            <path d="M 770 265 L 880 265" />
            <path d="M 770 435 L 840 435 L 840 335 L 880 335" />
          </g>
          {/* Hit path for 33kV Collector Feed */}
          <path 
            d="M 770 95 L 840 95 L 840 230 L 880 230 M 770 265 L 880 265 M 770 435 L 840 435 L 840 335 L 880 335"
            strokeWidth="24"
            className="sol-pipe-hit"
            onMouseEnter={(e) => onHoverPipe('33kV Medium Voltage Collector Feed (738A per transformer)', e)}
            onMouseLeave={onLeavePipe}
          />

          {/* MV Switchgear to Main Substation Step-Up Transformer (33 kV Collector Bus) */}
          <g stroke="url(#pipe3DBlueSolar)" strokeWidth="8" fill="none">
            <path d="M 1030 285 L 1065 285 L 1065 385 L 1105 385" />
          </g>
          <g className="sol-flow-line" stroke="#38bdf8" strokeWidth="3" fill="none">
            <path d="M 1030 285 L 1065 285 L 1065 385 L 1105 385" />
          </g>

          {/* Main Substation Transformer to Utility Grid Gantry Tower (132 kV Lines) */}
          <g stroke="#38bdf8" strokeWidth="3.5" fill="none">
            <path d="M 1210 350 L 1260 350 L 1260 280 L 1355 280" />
            <path d="M 1210 365 L 1260 365 L 1260 295 L 1355 295" />
            <path d="M 1210 380 L 1260 380 L 1260 310 L 1355 310" />
          </g>
          <g className="sol-flow-line" stroke="#7dd3fc" strokeWidth="2.5" fill="none">
            <path d="M 1210 350 L 1260 350 L 1260 280 L 1355 280" />
            <path d="M 1210 365 L 1260 365 L 1260 295 L 1355 295" />
            <path d="M 1210 380 L 1260 380 L 1260 310 L 1355 310" />
          </g>
          {/* Hit path for 132kV Grid Export */}
          <path 
            d="M 1210 365 L 1260 365 L 1260 295 L 1355 295"
            strokeWidth="30"
            className="sol-pipe-hit"
            onMouseEnter={(e) => onHoverPipe('132kV High Voltage Grid Export (124.6 MW Active Export • 551A)', e)}
            onMouseLeave={onLeavePipe}
          />
        </g>

        {/* 2. PV TRACKER ARRAYS (ROW 1 TO 6) */}
        {[
          { code: 'PV-ROW-1A', label: 'PV Array 1A (String Row 1)', y: 18 },
          { code: 'PV-ROW-1B', label: 'PV Array 1B (String Row 2)', y: 103 },
          { code: 'PV-ROW-2A', label: 'PV Array 2A (String Row 3)', y: 188 },
          { code: 'PV-ROW-2B', label: 'PV Array 2B (String Row 4)', y: 273 },
          { code: 'PV-ROW-3A', label: 'PV Array 3A (String Row 5)', y: 358 },
          { code: 'PV-ROW-3B', label: 'PV Array 3B (String Row 6)', y: 443 }
        ].map((item) => {
          const asset = getAsset(item.code);
          const isSelected = selectedAssetCode === item.code;
          const statusColor = getStatusBadgeColor(asset);

          return (
            <g
              key={item.code}
              id={`node-${item.code.toLowerCase()}`}
              className="sol-node"
              transform={`translate(25, ${item.y})`}
              onClick={() => asset && onSelectNode(asset)}
              onMouseEnter={(e) => asset && onHoverNode(asset, e)}
              onMouseLeave={onLeaveNode}
            >
              <rect x="0" y="0" width="130" height="85" fill="transparent" />
              {/* Tracker torque tube & piers */}
              <line x1="18" y1="52" x2="18" y2="70" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <line x1="112" y1="42" x2="112" y2="70" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="62" x2="118" y2="52" stroke="#64748b" strokeWidth="2.5" />
              
              {/* Bifacial Silicon Modules */}
              <polygon 
                points="10,24 112,12 124,52 20,64" 
                fill="url(#pvCellGrad)" 
                stroke={isSelected ? '#f59e0b' : '#38bdf8'} 
                strokeWidth={isSelected ? '2.5' : '1.8'} 
                filter="url(#machineryShadowSolar)" 
              />
              <line x1="35" y1="21" x2="47" y2="61" stroke="#93c5fd" strokeWidth="1.2" />
              <line x1="62" y1="18" x2="74" y2="58" stroke="#93c5fd" strokeWidth="1.2" />
              <line x1="88" y1="15" x2="100" y2="55" stroke="#93c5fd" strokeWidth="1.2" />
              
              {/* Motor Slew Drive Center */}
              <circle cx="66" cy="38" r="3.5" fill="#f59e0b" stroke="#d97706" />

              {/* Status Beacon */}
              <circle cx="120" cy="20" r="3" fill={statusColor} className={statusColor !== '#10b981' ? 'sol-beacon' : ''} />

              {/* Tag Pill */}
              <rect x="15" y="68" width="110" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="url(#machineryShadowSolar)" />
              <text x="70" y="79" fontSize="7.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">{item.label}</text>
            </g>
          );
        })}

        {/* METEO MAST MET-01 (x=25, y=540) */}
        <g id="node-met-mast" className="sol-node" transform="translate(25, 540)">
          <line x1="22" y1="75" x2="22" y2="15" stroke="#334155" strokeWidth="3" />
          <line x1="12" y1="75" x2="32" y2="75" stroke="#0f172a" strokeWidth="3" />
          <line x1="10" y1="25" x2="34" y2="25" stroke="#475569" strokeWidth="2" />
          <ellipse cx="12" cy="22" rx="4" ry="2.5" fill="#f59e0b" stroke="#b45309" />
          <circle cx="22" cy="6" r="3" fill="#38bdf8" />
          <rect x="38" y="24" width="95" height="18" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" filter="url(#machineryShadowSolar)" />
          <text x="90" y="36" fontSize="7.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">Meteo Mast (MET-01)</text>
        </g>

        {/* 3. COMBINER BOXES CB-01 .. CB-06 (x=225) */}
        {[
          { code: 'PV-ROW-1A', num: '01', y: 25 },
          { code: 'PV-ROW-1B', num: '02', y: 110 },
          { code: 'PV-ROW-2A', num: '03', y: 195 },
          { code: 'PV-ROW-2B', num: '04', y: 280 },
          { code: 'PV-ROW-3A', num: '05', y: 365 },
          { code: 'PV-ROW-3B', num: '06', y: 450 }
        ].map((item) => {
          return (
            <g key={item.num} id={`node-combiner-${item.num}`} className="sol-node" transform={`translate(225, ${item.y})`}>
              <polygon points="0,0 88,0 92,6 4,6" fill="#e2e8f0" stroke="#cbd5e1" />
              <rect x="0" y="6" width="88" height="70" rx="4" fill="url(#combiner3D)" stroke="#f59e0b" strokeWidth="2" filter="url(#machineryShadowSolar)" />
              <rect x="8" y="12" width="72" height="40" rx="2" fill="#0f172a" />
              <line x1="15" y1="18" x2="15" y2="36" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="23" y1="18" x2="23" y2="36" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="31" y1="18" x2="31" y2="36" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="62" cy="26" r="7" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
              <line x1="58" y1="26" x2="66" y2="26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <rect x="15" y="40" width="20" height="9" rx="1.5" fill="#10b981" />
              <text x="25" y="47" fontSize="5.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">SPD OK</text>
              <text x="44" y="62" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">Combiner CB-{item.num}</text>
            </g>
          );
        })}

        {/* 4. BESS BATTERY STORAGE CONTAINER (x=210, y=540) */}
        {(() => {
          const bessAsset = getAsset('BESS-01');
          const isSelected = selectedAssetCode === 'BESS-01';
          const statusColor = getStatusBadgeColor(bessAsset);

          return (
            <g 
              id="node-bess-skid" 
              className="sol-node" 
              transform="translate(210, 540)"
              onClick={() => bessAsset && onSelectNode(bessAsset)}
              onMouseEnter={(e) => bessAsset && onHoverNode(bessAsset, e)}
              onMouseLeave={onLeaveNode}
            >
              <polygon points="0,78 150,78 155,84 5,84" fill="url(#concretePadSolar)" stroke="#334155" />
              <rect 
                x="5" 
                y="8" 
                width="145" 
                height="70" 
                rx="4" 
                fill="url(#bessContainerGrad)" 
                stroke={isSelected ? '#f59e0b' : '#0284c7'} 
                strokeWidth={isSelected ? '2.5' : '2'} 
                filter="url(#machineryShadowSolar)" 
              />
              <rect x="25" y="0" width="35" height="8" rx="1.5" fill="#64748b" stroke="#334155" />
              <rect x="90" y="0" width="35" height="8" rx="1.5" fill="#64748b" stroke="#334155" />
              <line x1="35" y1="12" x2="35" y2="60" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="65" y1="12" x2="65" y2="60" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="95" y1="12" x2="95" y2="60" stroke="#0284c7" strokeWidth="1.5" />
              <rect x="15" y="16" width="50" height="20" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="40" y="29" fontSize="6.5" fontWeight="bold" fill="#38bdf8" textAnchor="middle">88.4% SoC</text>
              <circle cx="135" cy="22" r="3.5" fill={statusColor} />
              <text x="77" y="66" fontSize="8" fontWeight="bold" fill="#ffffff" textAnchor="middle">BESS Unit (20 MWh / 10 MW)</text>
            </g>
          );
        })()}

        {/* 5. INVERTER SKIDS (INV-01, INV-02, INV-03) (x=420) */}
        {[
          { code: 'INV-01', label: 'Inverter Skid INV-01', power: '42.2 MW • 30.5 kA', eff: '98.6% Eff', y: 45 },
          { code: 'INV-02', label: 'Inverter Skid INV-02', power: '39.8 MW • 29.0 kA', eff: '94.2% Deficit', y: 215 },
          { code: 'INV-03', label: 'Inverter Skid INV-03', power: '41.9 MW • 30.2 kA', eff: '98.6% Eff', y: 385 }
        ].map((item) => {
          const asset = getAsset(item.code);
          const isSelected = selectedAssetCode === item.code;
          const statusColor = getStatusBadgeColor(asset);

          return (
            <g
              key={item.code}
              id={`node-${item.code.toLowerCase()}`}
              className="sol-node"
              transform={`translate(420, ${item.y})`}
              onClick={() => asset && onSelectNode(asset)}
              onMouseEnter={(e) => asset && onHoverNode(asset, e)}
              onMouseLeave={onLeaveNode}
            >
              <polygon points="0,105 135,105 140,112 5,112" fill="url(#concretePadSolar)" stroke="#334155" />
              <polygon points="10,0 125,0 130,8 15,8" fill="#64748b" stroke="#334155" />
              <rect 
                x="5" 
                y="8" 
                width="130" 
                height="97" 
                rx="5" 
                fill="url(#solarSkidMetal)" 
                stroke={isSelected ? '#f59e0b' : item.code === 'INV-02' && statusColor !== '#10b981' ? '#ef4444' : '#334155'} 
                strokeWidth={isSelected || (item.code === 'INV-02' && statusColor !== '#10b981') ? '2.5' : '2.2'} 
                filter="url(#machineryShadowSolar)" 
              />
              <circle cx="38" cy="35" r="16" fill="#0f172a" stroke="#64748b" />
              <circle cx="102" cy="35" r="16" fill="#0f172a" stroke="#64748b" />
              
              {/* Rotating Fans */}
              <g className="sol-fan" style={{ transformOrigin: '38px 35px' }}>
                <line x1="38" y1="21" x2="38" y2="49" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="24" y1="35" x2="52" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
              </g>
              <g className="sol-fan" style={{ transformOrigin: '102px 35px' }}>
                <line x1="102" y1="21" x2="102" y2="49" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="88" y1="35" x2="116" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
              </g>

              {/* Status beacon */}
              <circle cx="120" cy="18" r="3.5" fill={statusColor} className={statusColor !== '#10b981' ? 'sol-beacon' : ''} />

              <rect x="30" y="58" width="80" height="22" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
              <path d="M 35 69 Q 50 62, 70 69 T 105 69" fill="none" stroke={item.code === 'INV-02' && statusColor !== '#10b981' ? '#ef4444' : '#10b981'} strokeWidth="1.6" />
              <text x="70" y="77" fontSize="6.5" fontWeight="bold" fill={item.code === 'INV-02' && statusColor !== '#10b981' ? '#f87171' : '#38bdf8'} textAnchor="middle">
                800V AC • {item.eff}
              </text>
              <text x="70" y="93" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">{item.label}</text>
              <text x="70" y="102" fontSize="7.5" fontWeight="bold" fill="#0284c7" textAnchor="middle">{item.power}</text>
            </g>
          );
        })}

        {/* 6. STEP-UP TRANSFORMERS (TR-01, TR-02, TR-03) (x=670) */}
        {[
          { code: 'TR-01', label: 'Transformer TR-01', y: 45 },
          { code: 'TR-02', label: 'Transformer TR-02', y: 215 },
          { code: 'TR-03', label: 'Transformer TR-03', y: 385 }
        ].map((item) => {
          const asset = getAsset(item.code);
          const isSelected = selectedAssetCode === item.code;
          const statusColor = getStatusBadgeColor(asset);

          return (
            <g
              key={item.code}
              id={`node-${item.code.toLowerCase()}`}
              className="sol-node"
              transform={`translate(670, ${item.y})`}
              onClick={() => asset && onSelectNode(asset)}
              onMouseEnter={(e) => asset && onHoverNode(asset, e)}
              onMouseLeave={onLeaveNode}
            >
              <polygon points="5,98 100,98 105,105 0,105" fill="url(#concretePadSolar)" stroke="#334155" />
              <rect 
                x="10" 
                y="14" 
                width="90" 
                height="84" 
                rx="6" 
                fill="#334155" 
                stroke={isSelected ? '#f59e0b' : '#475569'} 
                strokeWidth={isSelected ? '2.5' : '2.2'} 
                filter="url(#machineryShadowSolar)" 
              />
              <g stroke="#64748b" strokeWidth="3" strokeLinecap="round">
                <line x1="2" y1="28" x2="10" y2="28" />
                <line x1="2" y1="42" x2="10" y2="42" />
                <line x1="2" y1="56" x2="10" y2="56" />
                <line x1="2" y1="70" x2="10" y2="70" />
              </g>
              <polygon points="40,14 42,4 46,4 48,14" fill="#94a3b8" />
              <polygon points="60,14 62,4 66,4 68,14" fill="#94a3b8" />
              <circle cx="55" cy="46" r="13" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
              <line x1="55" y1="46" x2="62" y2="40" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
              <circle cx="55" cy="46" r="2" fill="#0f172a" />
              <circle cx="85" cy="22" r="3" fill={statusColor} />
              <text x="55" y="74" fontSize="8.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">{item.label}</text>
            </g>
          );
        })}

        {/* 7. 5-BAY 33 kV MV SWITCHGEAR ROOM (x=880, y=205) */}
        {(() => {
          const swgAsset = getAsset('SWG-33KV');
          const isSelected = selectedAssetCode === 'SWG-33KV';
          const statusColor = getStatusBadgeColor(swgAsset);

          return (
            <g 
              id="node-main-substation" 
              className="sol-node" 
              transform="translate(880, 205)"
              onClick={() => swgAsset && onSelectNode(swgAsset)}
              onMouseEnter={(e) => swgAsset && onHoverNode(swgAsset, e)}
              onMouseLeave={onLeaveNode}
            >
              <polygon points="0,215 150,215 157,225 7,225" fill="url(#concretePadSolar)" stroke="#334155" />
              <rect 
                x="7" 
                y="10" 
                width="145" 
                height="205" 
                rx="6" 
                fill="#0f172a" 
                stroke={isSelected ? '#f59e0b' : '#38bdf8'} 
                strokeWidth={isSelected ? '3' : '2.5'} 
                filter="url(#machineryShadowSolar)" 
              />
              
              <rect x="14" y="16" width="131" height="18" rx="2" fill="#1e293b" />
              <line x1="20" y1="25" x2="139" y2="25" stroke="#38bdf8" strokeWidth="3" />
              <text x="80" y="22" fontSize="6.5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">33 kV COLLECTOR BUS</text>

              {/* Bay 1: INC 1 */}
              <rect x="14" y="38" width="24" height="120" rx="2" fill="#1e293b" stroke="#475569" />
              <rect x="17" y="44" width="18" height="18" fill="#0284c7" />
              <circle cx="26" cy="72" r="3" fill="#10b981" />
              <text x="26" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INC 1</text>
              <text x="26" y="115" fontSize="4.5" fill="#38bdf8" textAnchor="middle">42MW</text>

              {/* Bay 2: INC 2 */}
              <rect x="40" y="38" width="24" height="120" rx="2" fill="#1e293b" stroke="#475569" />
              <rect x="43" y="44" width="18" height="18" fill="#0284c7" />
              <circle cx="52" cy="72" r="3" fill="#10b981" />
              <text x="52" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INC 2</text>
              <text x="52" y="115" fontSize="4.5" fill="#38bdf8" textAnchor="middle">40MW</text>

              {/* Bay 3: INC 3 */}
              <rect x="66" y="38" width="24" height="120" rx="2" fill="#1e293b" stroke="#475569" />
              <rect x="69" y="44" width="18" height="18" fill="#0284c7" />
              <circle cx="78" cy="72" r="3" fill="#10b981" />
              <text x="78" y="105" fontSize="5" fontWeight="bold" fill="#94a3b8" textAnchor="middle">INC 3</text>
              <text x="78" y="115" fontSize="4.5" fill="#38bdf8" textAnchor="middle">42MW</text>

              {/* Bay 4: BESS */}
              <rect x="92" y="38" width="24" height="120" rx="2" fill="#1e293b" stroke="#475569" />
              <rect x="95" y="44" width="18" height="18" fill="#0369a1" />
              <circle cx="104" cy="72" r="3" fill="#10b981" />
              <text x="104" y="105" fontSize="5" fontWeight="bold" fill="#38bdf8" textAnchor="middle">BESS</text>
              <text x="104" y="115" fontSize="4.5" fill="#10b981" textAnchor="middle">+10MW</text>

              {/* Bay 5: Outgoing Line */}
              <rect x="118" y="38" width="24" height="120" rx="2" fill="#1e293b" stroke="#475569" />
              <rect x="120" y="44" width="19" height="18" fill="#dc2626" />
              <circle cx="130" cy="72" r="3" fill="#10b981" />
              <text x="130" y="105" fontSize="5" fontWeight="bold" fill="#f59e0b" textAnchor="middle">OUT</text>
              <text x="130" y="115" fontSize="4.5" fill="#cbd5e1" textAnchor="middle">132kV</text>

              <rect x="14" y="166" width="131" height="28" rx="3" fill="#1e293b" />
              <text x="80" y="184" fontSize="8.5" fontWeight="bold" fill="#38bdf8" textAnchor="middle">125.8 MW TOTAL</text>
              <circle cx="138" cy="20" r="3.5" fill={statusColor} />
              <text x="80" y="207" fontSize="9.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">5-Bay 33 kV Switchgear</text>
            </g>
          );
        })()}

        {/* 8. MAIN 33/132 kV SUBSTATION STEP-UP TRANSFORMER (x=1095, y=295) */}
        {(() => {
          const mainTrAsset = getAsset('MAIN-TR-130MVA');
          const isSelected = selectedAssetCode === 'MAIN-TR-130MVA';
          const statusColor = getStatusBadgeColor(mainTrAsset);

          return (
            <g 
              id="node-substation-main-tr" 
              className="sol-node" 
              transform="translate(1095, 295)"
              onClick={() => mainTrAsset && onSelectNode(mainTrAsset)}
              onMouseEnter={(e) => mainTrAsset && onHoverNode(mainTrAsset, e)}
              onMouseLeave={onLeaveNode}
            >
              <polygon points="0,135 110,135 115,144 5,144" fill="url(#concretePadSolar)" stroke="#334155" />
              <rect 
                x="8" 
                y="35" 
                width="102" 
                height="100" 
                rx="8" 
                fill="#1e293b" 
                stroke={isSelected ? '#f59e0b' : '#38bdf8'} 
                strokeWidth={isSelected ? '3' : '2.2'} 
                filter="url(#machineryShadowSolar)" 
              />
              <rect x="25" y="15" width="65" height="16" rx="4" fill="#475569" stroke="#334155" />
              <line x1="57" y1="31" x2="57" y2="35" stroke="#64748b" strokeWidth="4" />
              <rect x="53" y="30" width="8" height="6" fill="#f59e0b" />
              <polygon points="35,15 37,2 41,2 43,15" fill="#e2e8f0" stroke="#94a3b8" />
              <polygon points="57,15 59,2 63,2 65,15" fill="#e2e8f0" stroke="#94a3b8" />
              <polygon points="79,15 81,2 85,2 87,15" fill="#e2e8f0" stroke="#94a3b8" />
              <circle cx="59" cy="65" r="14" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
              <line x1="59" y1="65" x2="67" y2="58" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
              <circle cx="59" cy="65" r="2" fill="#0f172a" />
              <circle cx="95" cy="45" r="3.5" fill={statusColor} />
              <text x="59" y="95" fontSize="8.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">Main Substation TR</text>
            </g>
          );
        })()}

        {/* 9. HIGH-VOLTAGE UTILITY GRID GANTRY (x=1360, y=210) */}
        {(() => {
          const gridAsset = getAsset('GRID-132KV');
          const isSelected = selectedAssetCode === 'GRID-132KV';

          return (
            <g 
              id="node-solar-grid" 
              className="sol-node" 
              transform="translate(1360, 210)"
              onClick={() => gridAsset && onSelectNode(gridAsset)}
              onMouseEnter={(e) => gridAsset && onHoverNode(gridAsset, e)}
              onMouseLeave={onLeaveNode}
            >
              <polygon points="45,10 15,185 75,185" fill="none" stroke="#1e293b" strokeWidth="4" />
              <line x1="5" y1="60" x2="85" y2="60" stroke="#1e293b" strokeWidth="4" />
              <line x1="12" y1="105" x2="78" y2="105" stroke="#1e293b" strokeWidth="4" />
              <line x1="28" y1="10" x2="62" y2="185" stroke="#475569" strokeWidth="2" />
              <line x1="62" y1="10" x2="28" y2="185" stroke="#475569" strokeWidth="2" />
              <line x1="10" y1="60" x2="10" y2="82" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="2 2" />
              <line x1="80" y1="60" x2="80" y2="82" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="2 2" />
              <circle cx="45" cy="8" r="3.5" fill="#dc2626" className="sol-beacon" />

              <rect 
                x="0" 
                y="192" 
                width="90" 
                height="38" 
                rx="5" 
                fill="#ffffff" 
                stroke={isSelected ? '#f59e0b' : '#cbd5e1'} 
                strokeWidth={isSelected ? '2.5' : '1.8'} 
                filter="url(#machineryShadowSolar)" 
              />
              <text x="45" y="207" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">Utility Grid</text>
              <text x="45" y="222" fontSize="8" fontWeight="bold" fill="#0284c7" textAnchor="middle">132 kV Synced</text>
            </g>
          );
        })()}

      </svg>
    </div>
  );
};
