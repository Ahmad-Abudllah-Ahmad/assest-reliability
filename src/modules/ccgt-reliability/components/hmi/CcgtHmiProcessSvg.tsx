import React from 'react';
import { 
  CcgtAsset, 
  ReliabilityAlert, 
  isActiveAlertStatus, 
  deriveMachineHmiStatus, 
  HmiMachineStatus,
  HmiPipeInfo,
  CCGT_HMI_PIPES
} from '../../types';

interface CcgtHmiProcessSvgProps {
  assets: CcgtAsset[];
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

export const CcgtHmiProcessSvg: React.FC<CcgtHmiProcessSvgProps> = ({
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
  // Map monitored asset status from live reliability state using unified isActiveAlertStatus and 4 distinct visual states
  const assetMap = React.useMemo(() => {
    const map: Record<string, { asset: CcgtAsset; alerts: ReliabilityAlert[]; status: HmiMachineStatus }> = {};
    assets.forEach(asset => {
      const assetAlerts = alerts.filter(a => a.assetCode === asset.assetCode && isActiveAlertStatus(a.status));
      const status = deriveMachineHmiStatus(asset, assetAlerts);
      map[asset.assetCode] = { asset, alerts: assetAlerts, status };
    });
    return map;
  }, [assets, alerts]);

  const gt1State = assetMap['GT-1'];
  const gt2State = assetMap['GT-2'];
  const st1State = assetMap['ST-1'];
  const bfpState = assetMap['BFP-A'];
  const gsuState = assetMap['GSU'];

  const gt1Status = gt1State?.status ?? 'normal';
  const gt2Status = gt2State?.status ?? 'normal';
  const st1Status = st1State?.status ?? 'normal';
  const bfpStatus = bfpState?.status ?? 'normal';
  const gsuStatus = gsuState?.status ?? 'normal';

  // Live telemetry labels (no hardcoded operational fallbacks)
  const gt1MW = gt1State?.asset.telemetry.generationMW;
  const gt1Label = gt1MW !== undefined && gt1MW !== null ? `GT-1 (${gt1MW} MW)` : 'GT-1';

  const gt2MW = gt2State?.asset.telemetry.generationMW;
  const gt2Label = gt2MW !== undefined && gt2MW !== null ? `GT-2 (${gt2MW} MW)` : 'GT-2';

  const st1MW = st1State?.asset.telemetry.generationMW;
  const st1Label = st1MW !== undefined && st1MW !== null ? `ST-1 (${st1MW} MW)` : 'ST-1';

  const bfpMW = bfpState?.asset.telemetry.powerConsumptionMW;
  const bfpLabel = bfpMW !== undefined && bfpMW !== null ? `BFP-A (${bfpMW} MW)` : 'BFP-A';

  const gsuMW = gsuState?.asset.telemetry.transmittedMW;
  const gsuLabel = gsuMW !== undefined && gsuMW !== null ? `GSU (${gsuMW} MW)` : 'GSU';

  // Helper for status beacon pulse animations
  const getBeaconClass = (status: HmiMachineStatus) => {
    if (status === 'critical') return 'hmi-beacon-pulse-crit';
    if (status === 'high') return 'hmi-beacon-pulse-high';
    if (status === 'moderate') return 'hmi-beacon-pulse-mod';
    return '';
  };

  // Helper for node styling classes supporting 4 visual states and visual statusFilter dimming
  const getNodeClass = (nodeId: string, status?: HmiMachineStatus) => {
    const isSelected = selectedNodeId === nodeId;
    const isHovered = hoveredNodeId === nodeId;
    let base = "cursor-pointer transition-all duration-200 outline-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
    
    if (status === 'critical') {
      base += " hmi-pulse-crit";
    } else if (status === 'high') {
      base += " hmi-pulse-high";
    } else if (status === 'moderate') {
      base += " hmi-pulse-mod";
    }

    if (isHovered) {
      base += " drop-shadow-[0_0_12px_rgba(37,99,235,0.8)] filter brightness-105";
    }
    if (isSelected) {
      base += " drop-shadow-[0_0_16px_rgba(37,99,235,1)] filter brightness-110";
    }

    if (statusFilter !== 'all') {
      const isMatched =
        (statusFilter === 'high' && (status === 'critical' || status === 'high')) ||
        (statusFilter === 'moderate' && status === 'moderate') ||
        (statusFilter === 'healthy' && status === 'normal');
      if (!isMatched) {
        base += " opacity-30 saturate-50";
      }
    }

    return base;
  };

  return (
    <svg
      id="ccgtHmiSvgCanvas"
      className="w-full h-full block"
      viewBox="0 0 1560 740"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Live CSS animations for continuous SVG directional flow and restrained machine risk pulses */}
        <style>{`
          @keyframes hmiFlowDash {
            to {
              stroke-dashoffset: -28;
            }
          }
          @keyframes hmiFlowElectrical {
            to {
              stroke-dashoffset: -26;
            }
          }
          @keyframes hmiFlowSteam {
            to {
              stroke-dashoffset: -26;
            }
          }
          @keyframes hmiFlowFeedwater {
            to {
              stroke-dashoffset: -24;
            }
          }
          @keyframes hmiFlowCondensate {
            to {
              stroke-dashoffset: -26;
            }
          }
          @keyframes hmiFlowCooling {
            to {
              stroke-dashoffset: -28;
            }
          }

          .hmi-flow-electrical {
            animation: hmiFlowElectrical 0.85s linear infinite;
          }
          .hmi-flow-steam {
            animation: hmiFlowSteam 1.3s linear infinite;
          }
          .hmi-flow-reheat {
            animation: hmiFlowSteam 1.4s linear infinite;
          }
          .hmi-flow-flue {
            animation: hmiFlowDash 1.5s linear infinite;
          }
          .hmi-flow-fuel {
            animation: hmiFlowDash 1.8s linear infinite;
          }
          .hmi-flow-feedwater {
            animation: hmiFlowFeedwater 2.0s linear infinite;
          }
          .hmi-flow-cooling {
            animation: hmiFlowCooling 2.4s linear infinite;
          }
          .hmi-flow-condensate {
            animation: hmiFlowCondensate 3.0s linear infinite;
          }

          /* Machine Risk Glow Pulses (derived from live engine status) */
          @keyframes hmiPulseModerateGlow {
            0%, 100% {
              filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.45));
            }
            50% {
              filter: drop-shadow(0 0 9px rgba(245, 158, 11, 0.85));
            }
          }
          @keyframes hmiPulseHighGlow {
            0%, 100% {
              filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.55));
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(239, 68, 68, 0.95));
            }
          }
          @keyframes hmiPulseCriticalGlow {
            0%, 100% {
              filter: drop-shadow(0 0 7px rgba(220, 38, 38, 0.7));
            }
            50% {
              filter: drop-shadow(0 0 18px rgba(220, 38, 38, 1));
            }
          }

          @keyframes hmiBeaconPulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.3);
            }
          }

          .hmi-pulse-mod {
            animation: hmiPulseModerateGlow 2.4s ease-in-out infinite;
          }
          .hmi-pulse-high {
            animation: hmiPulseHighGlow 1.6s ease-in-out infinite;
          }
          .hmi-pulse-crit {
            animation: hmiPulseCriticalGlow 1.1s ease-in-out infinite;
          }

          .hmi-beacon-pulse-mod {
            animation: hmiBeaconPulse 2.2s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .hmi-beacon-pulse-high {
            animation: hmiBeaconPulse 1.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .hmi-beacon-pulse-crit {
            animation: hmiBeaconPulse 1.0s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }

          /* Accessibility: Respect Reduced Motion */
          @media (prefers-reduced-motion: reduce) {
            .hmi-flow-electrical,
            .hmi-flow-steam,
            .hmi-flow-reheat,
            .hmi-flow-flue,
            .hmi-flow-fuel,
            .hmi-flow-feedwater,
            .hmi-flow-cooling,
            .hmi-flow-condensate,
            .hmi-pulse-mod,
            .hmi-pulse-high,
            .hmi-pulse-crit,
            .hmi-beacon-pulse-mod,
            .hmi-beacon-pulse-high,
            .hmi-beacon-pulse-crit {
              animation: none !important;
            }
          }
        `}</style>

        {/* Metal and component gradients */}
        <linearGradient id="hmiMetalCasing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="40%" stop-color="#334155" />
          <stop offset="70%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        <linearGradient id="hmiMetalCasingBright" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#cbd5e1" />
          <stop offset="35%" stop-color="#ffffff" />
          <stop offset="70%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#94a3b8" />
        </linearGradient>

        <linearGradient id="hmiCombustorFlame" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="40%" stop-color="#f59e0b" />
          <stop offset="80%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>

        <linearGradient id="hmiFlueGasHot" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ea580c" />
          <stop offset="50%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>

        <linearGradient id="hmiHrsgTower" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="30%" stop-color="#334155" />
          <stop offset="70%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        <linearGradient id="hmiSteamDrumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#dc2626" />
          <stop offset="40%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </linearGradient>

        <linearGradient id="hmiStCylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="35%" stop-color="#475569" />
          <stop offset="70%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>

        <linearGradient id="hmiGenHousingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="35%" stop-color="#0369a1" />
          <stop offset="70%" stop-color="#075985" />
          <stop offset="100%" stop-color="#0c4a6e" />
        </linearGradient>

        <linearGradient id="hmiPumpGradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669" />
          <stop offset="50%" stop-color="#047857" />
          <stop offset="100%" stop-color="#064e3b" />
        </linearGradient>

        <linearGradient id="hmiPumpGradWarn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706" />
          <stop offset="50%" stop-color="#b45309" />
          <stop offset="100%" stop-color="#78350f" />
        </linearGradient>

        <linearGradient id="hmiCondenserGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="40%" stop-color="#172554" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        <linearGradient id="hmiDeaeratorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="40%" stop-color="#0369a1" />
          <stop offset="100%" stop-color="#0c4a6e" />
        </linearGradient>

        <linearGradient id="hmiConcreteFoundation" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="50%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>

        <linearGradient id="hmiTransformerTank" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="30%" stop-color="#475569" />
          <stop offset="70%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>

        <filter id="hmiGlowSubtle" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.18" />
        </filter>
      </defs>

      {/* ================================================================= */}
      {/* 1. PROCESS PIPING & CONNECTORS LAYER (BACKGROUND)                */}
      {/* ================================================================= */}
      <g id="hmiPipelines" strokeLinecap="round" strokeLinejoin="round">
        {/* Natural Gas Lines (Gold/Amber) - Flow Skid -> GT-1 & GT-2 */}
        <g
          id="pipe-fuel-gas"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-fuel-gas' ? 'brightness(1.4) drop-shadow(0 0 6px #f59e0b)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-fuel-gas' ? 0.65 : 1
          }}
        >
          <g stroke="#d97706" strokeWidth={hoveredPipeId === 'pipe-fuel-gas' ? '6' : '4.5'} fill="none" opacity="0.85">
            <path d="M 80 340 L 80 120 L 195 120" />
            <path d="M 80 340 L 80 550 L 195 550" />
          </g>
          <g stroke="#fbbf24" strokeWidth={hoveredPipeId === 'pipe-fuel-gas' ? '3' : '2.2'} strokeDasharray="8 6" fill="none" className="hmi-flow-fuel">
            <path d="M 80 340 L 80 120 L 195 120" />
            <path d="M 80 340 L 80 550 L 195 550" />
          </g>
          <g
            stroke="transparent"
            strokeWidth="16"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-fuel-gas'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          >
            <path d="M 80 340 L 80 120 L 195 120" />
            <path d="M 80 340 L 80 550 L 195 550" />
          </g>
        </g>

        {/* Flue Gas Exhaust Ducts (Orange) - Flow GT-1/GT-2 -> HRSG-1/HRSG-2 */}
        <g
          id="pipe-flue-gt1"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-flue-gt1' ? 'brightness(1.4) drop-shadow(0 0 8px #f97316)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-flue-gt1' ? 0.65 : 1
          }}
        >
          <path d="M 330 120 L 415 120" stroke="url(#hmiFlueGasHot)" strokeWidth={hoveredPipeId === 'pipe-flue-gt1' ? '28' : '26'} fill="none" opacity="0.85" />
          <path d="M 330 120 L 415 120" stroke="#fef08a" strokeWidth={hoveredPipeId === 'pipe-flue-gt1' ? '4' : '3'} strokeDasharray="9 6" fill="none" className="hmi-flow-flue" />
          <path
            d="M 330 120 L 415 120"
            stroke="transparent"
            strokeWidth="28"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-flue-gt1'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          />
        </g>

        <g
          id="pipe-flue-gt2"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-flue-gt2' ? 'brightness(1.4) drop-shadow(0 0 8px #f97316)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-flue-gt2' ? 0.65 : 1
          }}
        >
          <path d="M 330 550 L 415 550" stroke="url(#hmiFlueGasHot)" strokeWidth={hoveredPipeId === 'pipe-flue-gt2' ? '28' : '26'} fill="none" opacity="0.85" />
          <path d="M 330 550 L 415 550" stroke="#fef08a" strokeWidth={hoveredPipeId === 'pipe-flue-gt2' ? '4' : '3'} strokeDasharray="9 6" fill="none" className="hmi-flow-flue" />
          <path
            d="M 330 550 L 415 550"
            stroke="transparent"
            strokeWidth="28"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-flue-gt2'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          />
        </g>

        {/* HP Main Steam Lines (Crimson Red) - Flow HRSGs -> Steam Turbine HP */}
        <g
          id="pipe-hp-steam"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-hp-steam' ? 'brightness(1.4) drop-shadow(0 0 6px #ef4444)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-hp-steam' ? 0.65 : 1
          }}
        >
          <g stroke="#b91c1c" strokeWidth={hoveredPipeId === 'pipe-hp-steam' ? '8' : '6.5'} fill="none" opacity="0.9">
            <path d="M 530 85 L 750 85 L 750 295 L 870 295" />
            <path d="M 530 515 L 750 515 L 750 305 L 870 305" />
          </g>
          <g stroke="#fca5a5" strokeWidth={hoveredPipeId === 'pipe-hp-steam' ? '3.5' : '2.5'} strokeDasharray="8 5" fill="none" className="hmi-flow-steam">
            <path d="M 530 85 L 750 85 L 750 295 L 870 295" />
            <path d="M 530 515 L 750 515 L 750 305 L 870 305" />
          </g>
          <g
            stroke="transparent"
            strokeWidth="18"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-hp-steam'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          >
            <path d="M 530 85 L 750 85 L 750 295 L 870 295" />
            <path d="M 530 515 L 750 515 L 750 305 L 870 305" />
          </g>
        </g>

        {/* Hot Reheat Steam Lines (Purple) - Flow HRSGs -> Steam Turbine IP */}
        <g
          id="pipe-reheat-steam"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-reheat-steam' ? 'brightness(1.4) drop-shadow(0 0 6px #a855f7)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-reheat-steam' ? 0.65 : 1
          }}
        >
          <g stroke="#7e22ce" strokeWidth={hoveredPipeId === 'pipe-reheat-steam' ? '7' : '5.5'} fill="none" opacity="0.85">
            <path d="M 500 105 L 720 105 L 720 320 L 920 320" />
            <path d="M 500 535 L 720 535 L 720 320 L 920 320" />
          </g>
          <g stroke="#e9d5ff" strokeWidth={hoveredPipeId === 'pipe-reheat-steam' ? '3' : '2.2'} strokeDasharray="8 5" fill="none" className="hmi-flow-reheat">
            <path d="M 500 105 L 720 105 L 720 320 L 920 320" />
            <path d="M 500 535 L 720 535 L 720 320 L 920 320" />
          </g>
          <g
            stroke="transparent"
            strokeWidth="18"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-reheat-steam'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          >
            <path d="M 500 105 L 720 105 L 720 320 L 920 320" />
            <path d="M 500 535 L 720 535 L 720 320 L 920 320" />
          </g>
        </g>

        {/* Feedwater Lines (Blue/Cyan) - Flow Deaerator -> BFP -> HRSGs */}
        <g
          id="pipe-feedwater"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-feedwater' ? 'brightness(1.4) drop-shadow(0 0 6px #38bdf8)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-feedwater' ? 0.65 : 1
          }}
        >
          <path d="M 240 330 L 240 365" stroke="#0284c7" strokeWidth={hoveredPipeId === 'pipe-feedwater' ? '7.5' : '6'} fill="none" />
          <path d="M 240 365 L 210 395" stroke="#0284c7" strokeWidth={hoveredPipeId === 'pipe-feedwater' ? '6.5' : '5'} fill="none" />
          <path d="M 240 365 L 290 395" stroke="#0284c7" strokeWidth={hoveredPipeId === 'pipe-feedwater' ? '6.5' : '5'} fill="none" />
          <g stroke="#7dd3fc" strokeWidth={hoveredPipeId === 'pipe-feedwater' ? '3' : '2.2'} strokeDasharray="7 5" fill="none" className="hmi-flow-feedwater">
            <path d="M 240 330 L 240 365" />
            <path d="M 240 365 L 210 395" />
            <path d="M 240 365 L 290 395" />
          </g>

          <g stroke="#0369a1" strokeWidth={hoveredPipeId === 'pipe-feedwater' ? '7' : '5.5'} fill="none">
            <path d="M 210 425 L 210 445 L 370 445 L 370 170 L 430 170" />
            <path d="M 290 425 L 290 445 L 370 445 L 370 600 L 430 600" />
          </g>
          <g stroke="#7dd3fc" strokeWidth={hoveredPipeId === 'pipe-feedwater' ? '3' : '2.2'} strokeDasharray="7 5" fill="none" className="hmi-flow-feedwater">
            <path d="M 210 425 L 210 445 L 370 445 L 370 170 L 430 170" />
            <path d="M 290 425 L 290 445 L 370 445 L 370 600 L 430 600" />
          </g>

          <g
            stroke="transparent"
            strokeWidth="18"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-feedwater'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          >
            <path d="M 240 330 L 240 365 L 210 395" />
            <path d="M 240 365 L 290 395" />
            <path d="M 210 425 L 210 445 L 370 445 L 370 170 L 430 170" />
            <path d="M 290 425 L 290 445 L 370 445 L 370 600 L 430 600" />
          </g>
        </g>

        {/* Condensate Return Line (Royal Blue) - Flow Condenser -> Deaerator */}
        <g
          id="pipe-condensate"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-condensate' ? 'brightness(1.4) drop-shadow(0 0 6px #3b82f6)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-condensate' ? 0.65 : 1
          }}
        >
          <path d="M 1000 420 L 1000 455 L 610 455 L 610 320 L 290 320" stroke="#1d4ed8" strokeWidth={hoveredPipeId === 'pipe-condensate' ? '6' : '4.5'} fill="none" />
          <path d="M 1000 420 L 1000 455 L 610 455 L 610 320 L 290 320" stroke="#93c5fd" strokeWidth={hoveredPipeId === 'pipe-condensate' ? '3' : '2.2'} strokeDasharray="7 6" fill="none" className="hmi-flow-condensate">
            <path d="M 1000 420 L 1000 455 L 610 455 L 610 320 L 290 320" />
          </path>
          <path
            d="M 1000 420 L 1000 455 L 610 455 L 610 320 L 290 320"
            stroke="transparent"
            strokeWidth="16"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-condensate'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          />
        </g>

        {/* Cooling Water Loop (Deep Cyan) - Flow Condenser <-> Cooling Tower */}
        <g
          id="pipe-cooling-water"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-cooling-water' ? 'brightness(1.4) drop-shadow(0 0 6px #14b8a6)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-cooling-water' ? 0.65 : 1
          }}
        >
          <g stroke="#0f766e" strokeWidth={hoveredPipeId === 'pipe-cooling-water' ? '8' : '6.5'} fill="none">
            <path d="M 1020 405 L 1020 640 L 920 640" />
            <path d="M 920 670 L 1040 670 L 1040 405" />
          </g>
          <g stroke="#5eead4" strokeWidth={hoveredPipeId === 'pipe-cooling-water' ? '3.2' : '2.5'} strokeDasharray="8 6" fill="none" className="hmi-flow-cooling">
            <path d="M 1020 405 L 1020 640 L 920 640" />
            <path d="M 920 670 L 1040 670 L 1040 405" />
          </g>
          <g
            stroke="transparent"
            strokeWidth="18"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-cooling-water'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          >
            <path d="M 1020 405 L 1020 640 L 920 640" />
            <path d="M 920 670 L 1040 670 L 1040 405" />
          </g>
        </g>

        {/* Heavy Power Busducts (Emerald) - Flow Gen 1, Gen 2, ST Gen -> GSU */}
        <g
          id="pipe-power"
          className="transition-all duration-200"
          style={{
            filter: hoveredPipeId === 'pipe-power' ? 'brightness(1.4) drop-shadow(0 0 8px #10b981)' : undefined,
            opacity: hoveredPipeId && hoveredPipeId !== 'pipe-power' ? 0.65 : 1
          }}
        >
          <path d="M 310 120 L 310 50 L 1230 50 L 1230 250" stroke="#047857" strokeWidth={hoveredPipeId === 'pipe-power' ? '6.5' : '5'} fill="none" />
          <path d="M 310 50 L 1230 50 L 1230 250" stroke="#a7f3d0" strokeWidth={hoveredPipeId === 'pipe-power' ? '3.2' : '2.4'} strokeDasharray="8 5" fill="none" className="hmi-flow-electrical" />

          <path d="M 310 550 L 310 690 L 1230 690 L 1230 330" stroke="#047857" strokeWidth={hoveredPipeId === 'pipe-power' ? '6.5' : '5'} fill="none" />
          <path d="M 310 690 L 1230 690 L 1230 330" stroke="#a7f3d0" strokeWidth={hoveredPipeId === 'pipe-power' ? '3.2' : '2.4'} strokeDasharray="8 5" fill="none" className="hmi-flow-electrical" />

          <path d="M 1080 300 L 1220 300" stroke="#047857" strokeWidth={hoveredPipeId === 'pipe-power' ? '7' : '5.5'} fill="none" />
          <path d="M 1080 300 L 1220 300" stroke="#a7f3d0" strokeWidth={hoveredPipeId === 'pipe-power' ? '3.2' : '2.5'} strokeDasharray="8 5" fill="none" className="hmi-flow-electrical" />

          {/* GSU to 400kV GIS & Grid */}
          <path d="M 1300 300 L 1380 300" stroke="#059669" strokeWidth={hoveredPipeId === 'pipe-power' ? '7.5' : '6'} fill="none" />
          <path d="M 1300 300 L 1380 300" stroke="#a7f3d0" strokeWidth={hoveredPipeId === 'pipe-power' ? '3.5' : '2.8'} strokeDasharray="8 5" fill="none" className="hmi-flow-electrical" />

          <path d="M 1460 300 L 1510 300" stroke="#059669" strokeWidth={hoveredPipeId === 'pipe-power' ? '8.5' : '7'} fill="none" />
          <path d="M 1460 300 L 1510 300" stroke="#a7f3d0" strokeWidth={hoveredPipeId === 'pipe-power' ? '3.8' : '3'} strokeDasharray="8 5" fill="none" className="hmi-flow-electrical" />

          <g
            stroke="transparent"
            strokeWidth="18"
            fill="none"
            pointerEvents="stroke"
            className="cursor-pointer"
            onMouseEnter={(e) => onHoverPipe?.(CCGT_HMI_PIPES['pipe-power'], e)}
            onMouseMove={onMovePipe}
            onMouseLeave={onLeavePipe}
          >
            <path d="M 310 120 L 310 50 L 1230 50 L 1230 250" />
            <path d="M 310 550 L 310 690 L 1230 690 L 1230 330" />
            <path d="M 1080 300 L 1220 300" />
            <path d="M 1300 300 L 1380 300" />
            <path d="M 1460 300 L 1510 300" />
          </g>
        </g>
      </g>

      {/* ================================================================= */}
      {/* 2. SUPPORTING PROCESS CONTEXT EQUIPMENT (NEUTRAL)                 */}
      {/* ================================================================= */}

      {/* 2.1 Fuel Gas Skid */}
      <g
        id="node-fuel-skid"
        className={getNodeClass('node-fuel-skid')}
        transform="translate(35, 295)"
        onMouseEnter={(e) => onHoverNode('node-fuel-skid', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-fuel-skid')}
      >
        <rect x="0" y="70" width="80" height="8" rx="2" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <rect x="10" y="20" width="18" height="50" rx="4" fill="url(#hmiMetalCasing)" stroke="#ca8a04" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <rect x="34" y="20" width="18" height="50" rx="4" fill="url(#hmiMetalCasing)" stroke="#ca8a04" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <rect x="58" y="32" width="18" height="38" rx="3" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
        <circle cx="20" cy="12" r="6" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
        <line x1="20" y1="12" x2="23" y2="9" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="4" y="80" width="72" height="15" rx="3" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="40" y="91" fontSize="8" fontWeight="bold" fill="#854d0e" textAnchor="middle">NG-SKID</text>
      </g>

      {/* 2.2 HRSG-1 */}
      <g
        id="node-hrsg-1"
        className={getNodeClass('node-hrsg-1')}
        transform="translate(425, 45)"
        onMouseEnter={(e) => onHoverNode('node-hrsg-1', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-hrsg-1')}
      >
        <rect x="-10" y="-10" width="130" height="155" fill="transparent" />
        <polygon points="0,128 105,128 110,136 5,136" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <rect x="5" y="15" width="95" height="114" rx="4" fill="url(#hmiHrsgTower)" stroke="#0284c7" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <g stroke="#38bdf8" strokeWidth="1.5">
          <line x1="16" y1="35" x2="16" y2="115" strokeDasharray="2 3" />
          <line x1="28" y1="35" x2="28" y2="115" strokeDasharray="2 3" />
          <line x1="40" y1="35" x2="40" y2="115" strokeDasharray="2 3" />
          <line x1="52" y1="35" x2="52" y2="115" strokeDasharray="2 3" />
          <line x1="64" y1="35" x2="64" y2="115" strokeDasharray="2 3" />
          <line x1="76" y1="35" x2="76" y2="115" strokeDasharray="2 3" />
          <line x1="88" y1="35" x2="88" y2="115" strokeDasharray="2 3" />
        </g>
        <rect x="25" y="0" width="55" height="15" rx="7" fill="url(#hmiSteamDrumGrad)" stroke="#fca5a5" strokeWidth="1.4" />
        <text x="52" y="11" fontSize="7" fontWeight="bold" fill="#ffffff" textAnchor="middle">HP DRUM</text>
        <path d="M 85 15 L 85 -5 L 98 -5 L 98 15" fill="#475569" stroke="#64748b" strokeWidth="1.2" />
        <rect x="8" y="136" width="90" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="53" y="147.5" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">HRSG-1</text>
      </g>

      {/* 2.3 HRSG-2 */}
      <g
        id="node-hrsg-2"
        className={getNodeClass('node-hrsg-2')}
        transform="translate(425, 480)"
        onMouseEnter={(e) => onHoverNode('node-hrsg-2', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-hrsg-2')}
      >
        <rect x="-10" y="-10" width="130" height="155" fill="transparent" />
        <polygon points="0,128 105,128 110,136 5,136" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <rect x="5" y="15" width="95" height="114" rx="4" fill="url(#hmiHrsgTower)" stroke="#0284c7" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <g stroke="#38bdf8" strokeWidth="1.5">
          <line x1="16" y1="35" x2="16" y2="115" strokeDasharray="2 3" />
          <line x1="28" y1="35" x2="28" y2="115" strokeDasharray="2 3" />
          <line x1="40" y1="35" x2="40" y2="115" strokeDasharray="2 3" />
          <line x1="52" y1="35" x2="52" y2="115" strokeDasharray="2 3" />
          <line x1="64" y1="35" x2="64" y2="115" strokeDasharray="2 3" />
          <line x1="76" y1="35" x2="76" y2="115" strokeDasharray="2 3" />
          <line x1="88" y1="35" x2="88" y2="115" strokeDasharray="2 3" />
        </g>
        <rect x="25" y="0" width="55" height="15" rx="7" fill="url(#hmiSteamDrumGrad)" stroke="#fca5a5" strokeWidth="1.4" />
        <text x="52" y="11" fontSize="7" fontWeight="bold" fill="#ffffff" textAnchor="middle">HP DRUM</text>
        <path d="M 85 15 L 85 -5 L 98 -5 L 98 15" fill="#475569" stroke="#64748b" strokeWidth="1.2" />
        <rect x="8" y="136" width="90" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="53" y="147.5" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">HRSG-2</text>
      </g>

      {/* 2.4 Deaerator */}
      <g
        id="node-deaerator"
        className={getNodeClass('node-deaerator')}
        transform="translate(195, 275)"
        onMouseEnter={(e) => onHoverNode('node-deaerator', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-deaerator')}
      >
        <rect x="-8" y="-8" width="105" height="85" fill="transparent" />
        <line x1="15" y1="35" x2="15" y2="55" stroke="#64748b" strokeWidth="3" />
        <line x1="75" y1="35" x2="75" y2="55" stroke="#64748b" strokeWidth="3" />
        <line x1="10" y1="55" x2="80" y2="55" stroke="#475569" strokeWidth="3" />
        <rect x="5" y="12" width="80" height="26" rx="13" fill="url(#hmiDeaeratorGrad)" stroke="#0284c7" strokeWidth="1.6" filter="url(#hmiGlowSubtle)" />
        <rect x="35" y="0" width="20" height="16" rx="4" fill="url(#hmiDeaeratorGrad)" stroke="#0284c7" strokeWidth="1.6" />
        <text x="45" y="27" fontSize="7" fontWeight="bold" fill="#ffffff" textAnchor="middle">DEAERATOR</text>
        <rect x="5" y="60" width="80" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="45" y="71.5" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">DEAERATOR</text>
      </g>

      {/* 2.5 BFP-B (Standby Pump - Process Context) */}
      <g
        id="node-bfp-b"
        className={getNodeClass('node-bfp-b')}
        transform="translate(265, 365)"
        onMouseEnter={(e) => onHoverNode('node-bfp-b', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-bfp-b')}
      >
        <rect x="-8" y="-8" width="80" height="75" fill="transparent" />
        <rect x="2" y="48" width="70" height="6" rx="2" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <rect x="6" y="20" width="26" height="28" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="10" y1="26" x2="28" y2="26" stroke="#475569" strokeWidth="1.5" />
        <line x1="10" y1="32" x2="28" y2="32" stroke="#475569" strokeWidth="1.5" />
        <line x1="10" y1="38" x2="28" y2="38" stroke="#475569" strokeWidth="1.5" />
        <rect x="32" y="30" width="6" height="8" rx="1.5" fill="#38bdf8" stroke="#0284c7" />
        <rect x="38" y="16" width="30" height="34" rx="5" fill="url(#hmiPumpGradNormal)" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="53" cy="33" r="11" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="53" cy="33" r="4" fill="#ffffff" />
        <path d="M 45 16 L 45 4 L 52 4 L 52 16" fill="#047857" stroke="#10b981" strokeWidth="1.2" />
        <rect x="2" y="56" width="70" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="37" y="67.5" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">BFP-B</text>
      </g>

      {/* 2.6 Condenser */}
      <g
        id="node-condenser"
        className={getNodeClass('node-condenser')}
        transform="translate(945, 360)"
        onMouseEnter={(e) => onHoverNode('node-condenser', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-condenser')}
      >
        <rect x="-8" y="-8" width="105" height="75" fill="transparent" />
        <rect x="10" y="10" width="85" height="44" rx="10" fill="url(#hmiCondenserGrad)" stroke="#1d4ed8" strokeWidth="2" filter="url(#hmiGlowSubtle)" />
        <g stroke="#38bdf8" strokeWidth="1" opacity="0.7">
          <line x1="20" y1="20" x2="84" y2="20" strokeDasharray="3 2" />
          <line x1="20" y1="28" x2="84" y2="28" strokeDasharray="3 2" />
          <line x1="20" y1="36" x2="84" y2="36" strokeDasharray="3 2" />
          <line x1="20" y1="44" x2="84" y2="44" strokeDasharray="3 2" />
        </g>
        <rect x="30" y="46" width="45" height="5" rx="2" fill="#0284c7" />
        <rect x="8" y="58" width="88" height="16" rx="3" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="52" y="69.5" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">COND-01</text>
      </g>

      {/* 2.7 Cooling Tower */}
      <g
        id="node-cooling-tower"
        className={getNodeClass('node-cooling-tower')}
        transform="translate(835, 595)"
        onMouseEnter={(e) => onHoverNode('node-cooling-tower', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-cooling-tower')}
      >
        <rect x="-8" y="-8" width="105" height="85" fill="transparent" />
        <rect x="10" y="62" width="80" height="8" rx="2" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <path d="M 18 62 Q 32 30, 30 10 L 70 10 Q 68 30, 82 62 Z" fill="#334155" stroke="#0ea5e9" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <rect x="30" y="8" width="40" height="4" fill="#0284c7" />
        <rect x="10" y="74" width="80" height="15" rx="3" fill="#ffffff" stroke="#0ea5e9" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="50" y="85" fontSize="7" fontWeight="bold" fill="#0369a1" textAnchor="middle">COOLING TOWER</text>
      </g>

      {/* 2.8 400kV GIS Switchgear */}
      <g
        id="node-switchgear"
        className={getNodeClass('node-switchgear')}
        transform="translate(1365, 210)"
        onMouseEnter={(e) => onHoverNode('node-switchgear', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-switchgear')}
      >
        <rect x="-8" y="-8" width="95" height="175" fill="transparent" />
        <polygon points="0,150 82,150 86,158 4,158" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <rect x="4" y="10" width="76" height="140" rx="5" fill="#1e293b" stroke="#059669" strokeWidth="2" filter="url(#hmiGlowSubtle)" />
        <rect x="10" y="16" width="64" height="20" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
        <text x="42" y="29" fontSize="6.5" fontWeight="bold" fill="#34d399" textAnchor="middle">400kV SF6 BUS</text>
        <rect x="10" y="42" width="18" height="60" rx="2" fill="#0f172a" stroke="#059669" />
        <rect x="33" y="42" width="18" height="60" rx="2" fill="#0f172a" stroke="#059669" />
        <rect x="56" y="42" width="18" height="60" rx="2" fill="#0f172a" stroke="#059669" />
        <rect x="0" y="160" width="84" height="16" rx="3" fill="#ffffff" stroke="#059669" strokeWidth="1.2" filter="url(#hmiGlowSubtle)" />
        <text x="42" y="171.5" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">400kV GIS</text>
      </g>

      {/* 2.9 National Grid Gantry */}
      <g
        id="node-grid"
        className={getNodeClass('node-grid')}
        transform="translate(1480, 190)"
        onMouseEnter={(e) => onHoverNode('node-grid', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-grid')}
      >
        <polygon points="40,10 10,180 70,180" fill="none" stroke="#334155" strokeWidth="3" />
        <line x1="2" y1="55" x2="78" y2="55" stroke="#334155" strokeWidth="3" />
        <line x1="8" y1="100" x2="72" y2="100" stroke="#334155" strokeWidth="3" />
        <line x1="22" y1="10" x2="58" y2="180" stroke="#64748b" strokeWidth="1.5" />
        <line x1="58" y1="10" x2="22" y2="180" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="40" cy="8" r="3" fill="#ef4444" />
        <rect x="-2" y="188" width="84" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#hmiGlowSubtle)" />
        <text x="40" y="200" fontSize="7.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">NATIONAL GRID</text>
        <text x="40" y="210" fontSize="6.5" fontWeight="bold" fill="#059669" textAnchor="middle">400 kV INTERTIE</text>
      </g>

      {/* ================================================================= */}
      {/* 3. MONITORED RELIABILITY ASSETS (WITH DYNAMIC STATUS HIGHLIGHT)   */}
      {/* ================================================================= */}

      {/* 3.1 GT-1 (Gas Turbine 1) */}
      <g
        id="node-gt-1"
        className={getNodeClass('node-gt-1', gt1Status)}
        transform="translate(130, 60)"
        tabIndex={0}
        role="button"
        aria-label={`Gas Turbine 1 (GT-1) - Status: ${gt1Status}${gt1MW !== undefined && gt1MW !== null ? `, Generation: ${gt1MW} MW` : ''}`}
        onMouseEnter={(e) => onHoverNode('node-gt-1', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-gt-1')}
        onFocus={(e) => onFocusNode?.('node-gt-1', e.currentTarget)}
        onBlur={() => onBlurNode?.('node-gt-1')}
        onKeyDown={(e) => onKeyDownNode?.('node-gt-1', e)}
      >
        <rect x="-10" y="-10" width="220" height="135" fill="transparent" />
        <polygon points="0,96 195,96 200,104 5,104" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        
        {/* Air Inlet */}
        <rect x="8" y="10" width="34" height="85" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <line x1="12" y1="25" x2="38" y2="25" stroke="#475569" strokeWidth="1.5" />
        <line x1="12" y1="35" x2="38" y2="35" stroke="#475569" strokeWidth="1.5" />
        <line x1="12" y1="45" x2="38" y2="45" stroke="#475569" strokeWidth="1.5" />
        <line x1="12" y1="55" x2="38" y2="55" stroke="#475569" strokeWidth="1.5" />
        <text x="25" y="88" fontSize="6.5" fontWeight="bold" fill="#cbd5e1" textAnchor="middle">INLET</text>

        {/* Compressor */}
        <polygon points="42,32 78,40 78,74 42,82" fill="url(#hmiMetalCasingBright)" stroke="#475569" strokeWidth="1.5" filter="url(#hmiGlowSubtle)" />

        {/* Combustor */}
        <rect x="78" y="34" width="28" height="46" rx="4" fill="url(#hmiCombustorFlame)" stroke="#b45309" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <circle cx="92" cy="57" r="6" fill="#fbbf24" opacity="0.9" />
        <circle cx="92" cy="57" r="3" fill="#ffffff" />

        {/* Turbine Expander */}
        <polygon points="106,42 136,32 136,82 106,72" fill="url(#hmiFlueGasHot)" stroke="#9a3412" strokeWidth="1.5" filter="url(#hmiGlowSubtle)" />
        <rect x="42" y="54" width="138" height="6" fill="#e2e8f0" stroke="#475569" />

        {/* Generator */}
        <rect x="142" y="32" width="46" height="54" rx="4" fill="url(#hmiGenHousingGrad)" stroke="#0284c7" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <circle cx="165" cy="59" r="14" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
        <text x="165" y="63.5" fontSize="11" fontWeight="bold" fill="#38bdf8" textAnchor="middle">G</text>

        {/* Status Indicator Beacon */}
        <circle
          cx="192" cy="18"
          r={gt1Status === 'critical' ? 5.5 : gt1Status === 'high' ? 5 : gt1Status === 'moderate' ? 4.5 : 4}
          className={getBeaconClass(gt1Status)}
          fill={gt1Status === 'critical' ? '#dc2626' : gt1Status === 'high' ? '#ef4444' : gt1Status === 'moderate' ? '#f59e0b' : '#10b981'}
          stroke={gt1Status === 'critical' ? '#ffffff' : gt1Status === 'high' ? '#fca5a5' : gt1Status === 'moderate' ? '#fde68a' : 'none'}
          strokeWidth={gt1Status !== 'normal' ? 1.2 : 0}
        />

        {/* Nameplate */}
        <rect
          x="36" y="106" width="128" height="18" rx="3" fill="#ffffff"
          stroke={gt1Status === 'critical' ? '#dc2626' : gt1Status === 'high' ? '#ef4444' : gt1Status === 'moderate' ? '#f59e0b' : '#10b981'}
          strokeWidth={gt1Status === 'critical' ? 2 : gt1Status === 'high' ? 1.8 : 1.4}
          filter="url(#hmiGlowSubtle)"
        />
        <text x="100" y="118.5" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
          {gt1Label}
        </text>
      </g>

      {/* 3.B GT-2 (Gas Turbine 2 - Primary Alert Scenario) */}
      <g
        id="node-gt-2"
        className={getNodeClass('node-gt-2', gt2Status)}
        transform="translate(130, 490)"
        tabIndex={0}
        role="button"
        aria-label={`Gas Turbine 2 (GT-2) - Status: ${gt2Status}${gt2MW !== undefined && gt2MW !== null ? `, Generation: ${gt2MW} MW` : ''}`}
        onMouseEnter={(e) => onHoverNode('node-gt-2', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-gt-2')}
        onFocus={(e) => onFocusNode?.('node-gt-2', e.currentTarget)}
        onBlur={() => onBlurNode?.('node-gt-2')}
        onKeyDown={(e) => onKeyDownNode?.('node-gt-2', e)}
      >
        <rect x="-10" y="-10" width="220" height="135" fill="transparent" />
        <polygon points="0,96 195,96 200,104 5,104" fill="url(#hmiConcreteFoundation)" stroke="#475569" />

        <rect x="8" y="10" width="34" height="85" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <line x1="12" y1="25" x2="38" y2="25" stroke="#475569" strokeWidth="1.5" />
        <line x1="12" y1="35" x2="38" y2="35" stroke="#475569" strokeWidth="1.5" />
        <line x1="12" y1="45" x2="38" y2="45" stroke="#475569" strokeWidth="1.5" />
        <line x1="12" y1="55" x2="38" y2="55" stroke="#475569" strokeWidth="1.5" />
        <text x="25" y="88" fontSize="6.5" fontWeight="bold" fill="#cbd5e1" textAnchor="middle">INLET</text>

        <polygon points="42,32 78,40 78,74 42,82" fill="url(#hmiMetalCasingBright)" stroke="#475569" strokeWidth="1.5" filter="url(#hmiGlowSubtle)" />

        {/* Combustor Casing */}
        <rect
          x="78" y="34" width="28" height="46" rx="4"
          fill="url(#hmiCombustorFlame)"
          stroke={gt2Status === 'critical' ? '#dc2626' : gt2Status === 'high' ? '#ef4444' : gt2Status === 'moderate' ? '#f59e0b' : '#b45309'}
          strokeWidth={gt2Status === 'critical' || gt2Status === 'high' ? 2.5 : 1.8}
        />
        <circle cx="92" cy="57" r="7" fill="#f87171" />
        <circle cx="92" cy="57" r="3" fill="#ffffff" />

        <polygon points="106,42 136,32 136,82 106,72" fill="url(#hmiFlueGasHot)" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="42" y="54" width="138" height="6" fill="#e2e8f0" stroke="#475569" />

        <rect x="142" y="32" width="46" height="54" rx="4" fill="url(#hmiGenHousingGrad)" stroke={gt2Status === 'critical' ? '#dc2626' : gt2Status === 'high' ? '#ef4444' : '#f59e0b'} strokeWidth="2" />
        <circle cx="165" cy="59" r="14" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
        <text x="165" y="63.5" fontSize="11" fontWeight="bold" fill="#f59e0b" textAnchor="middle">G</text>

        {/* Status Indicator Beacon */}
        <circle
          cx="192" cy="18"
          r={gt2Status === 'critical' ? 5.5 : gt2Status === 'high' ? 5 : gt2Status === 'moderate' ? 4.5 : 4}
          className={getBeaconClass(gt2Status)}
          fill={gt2Status === 'critical' ? '#dc2626' : gt2Status === 'high' ? '#ef4444' : gt2Status === 'moderate' ? '#f59e0b' : '#10b981'}
          stroke={gt2Status === 'critical' ? '#ffffff' : gt2Status === 'high' ? '#fca5a5' : gt2Status === 'moderate' ? '#fde68a' : 'none'}
          strokeWidth={gt2Status !== 'normal' ? 1.2 : 0}
        />

        {/* Nameplate */}
        <rect
          x="36" y="106" width="128" height="18" rx="3" fill="#ffffff"
          stroke={gt2Status === 'critical' ? '#dc2626' : gt2Status === 'high' ? '#ef4444' : gt2Status === 'moderate' ? '#f59e0b' : '#10b981'}
          strokeWidth={gt2Status === 'critical' ? 2 : gt2Status === 'high' ? 1.8 : 1.4}
          filter="url(#hmiGlowSubtle)"
        />
        <text x="100" y="118.5" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
          {gt2Label}
        </text>
      </g>

      {/* 3.3 ST-1 (Steam Turbine Train) */}
      <g
        id="node-st-1"
        className={getNodeClass('node-st-1', st1Status)}
        transform="translate(830, 235)"
        tabIndex={0}
        role="button"
        aria-label={`Steam Turbine 1 (ST-1) - Status: ${st1Status}${st1MW !== undefined && st1MW !== null ? `, Generation: ${st1MW} MW` : ''}`}
        onMouseEnter={(e) => onHoverNode('node-st-1', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-st-1')}
        onFocus={(e) => onFocusNode?.('node-st-1', e.currentTarget)}
        onBlur={() => onBlurNode?.('node-st-1')}
        onKeyDown={(e) => onKeyDownNode?.('node-st-1', e)}
      >
        <rect x="-10" y="-10" width="280" height="145" fill="transparent" />
        <polygon points="0,105 260,105 265,115 5,115" fill="url(#hmiConcreteFoundation)" stroke="#475569" />

        {/* HP Cylinder */}
        <path d="M 12 36 L 44 42 L 44 80 L 12 86 Z" fill="url(#hmiStCylinderGrad)" stroke="#f87171" strokeWidth="2" filter="url(#hmiGlowSubtle)" />
        <text x="28" y="64" fontSize="6.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">HP</text>

        {/* Bearing Pedestal #1 & #2 */}
        <rect
          x="44" y="50" width="16" height="24" rx="2"
          fill="#78350f"
          stroke={st1Status === 'critical' ? '#dc2626' : st1Status === 'high' ? '#ef4444' : st1Status === 'moderate' ? '#f59e0b' : '#64748b'}
          strokeWidth="1.8"
        />
        <circle cx="52" cy="62" r="4" fill={st1Status === 'critical' ? '#dc2626' : st1Status === 'high' ? '#ef4444' : st1Status === 'moderate' ? '#f59e0b' : '#10b981'} />

        {/* IP Cylinder */}
        <path d="M 60 40 L 98 44 L 98 78 L 60 82 Z" fill="url(#hmiStCylinderGrad)" stroke="#d8b4fe" strokeWidth="1.8" filter="url(#hmiGlowSubtle)" />
        <text x="79" y="64" fontSize="6.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">IP</text>

        {/* LP Cylinder */}
        <path d="M 112 44 L 168 34 L 168 88 L 112 78 Z" fill="url(#hmiStCylinderGrad)" stroke="#38bdf8" strokeWidth="2" filter="url(#hmiGlowSubtle)" />
        <text x="140" y="64" fontSize="7.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">LP TURBINE</text>

        {/* Generator */}
        <rect x="184" y="34" width="58" height="58" rx="4" fill="url(#hmiGenHousingGrad)" stroke="#0284c7" strokeWidth="2" filter="url(#hmiGlowSubtle)" />
        <circle cx="213" cy="63" r="16" fill="#0f172a" stroke="#0284c7" strokeWidth="1.8" />
        <text x="213" y="68" fontSize="12" fontWeight="bold" fill="#38bdf8" textAnchor="middle">G</text>

        {/* Status Indicator */}
        <circle
          cx="250" cy="20"
          r={st1Status === 'critical' ? 5.5 : st1Status === 'high' ? 5 : st1Status === 'moderate' ? 4.5 : 4}
          className={getBeaconClass(st1Status)}
          fill={st1Status === 'critical' ? '#dc2626' : st1Status === 'high' ? '#ef4444' : st1Status === 'moderate' ? '#f59e0b' : '#10b981'}
          stroke={st1Status === 'critical' ? '#ffffff' : st1Status === 'high' ? '#fca5a5' : st1Status === 'moderate' ? '#fde68a' : 'none'}
          strokeWidth={st1Status !== 'normal' ? 1.2 : 0}
        />

        {/* Nameplate */}
        <rect
          x="55" y="117" width="150" height="18" rx="3" fill="#ffffff"
          stroke={st1Status === 'critical' ? '#dc2626' : st1Status === 'high' ? '#ef4444' : st1Status === 'moderate' ? '#f59e0b' : '#10b981'}
          strokeWidth={st1Status === 'critical' ? 2 : st1Status === 'high' ? 1.8 : 1.4}
          filter="url(#hmiGlowSubtle)"
        />
        <text x="130" y="130" fontSize="8.5" fontWeight="bold" fill="#0f172a" textAnchor="middle">
          {st1Label}
        </text>
      </g>

      {/* 3.4 BFP-A (Boiler Feed Pump Train A) */}
      <g
        id="node-bfp-a"
        className={getNodeClass('node-bfp-a', bfpStatus)}
        transform="translate(170, 365)"
        tabIndex={0}
        role="button"
        aria-label={`Boiler Feed Pump A (BFP-A) - Status: ${bfpStatus}${bfpMW !== undefined && bfpMW !== null ? `, Power Consumption: ${bfpMW} MW` : ''}`}
        onMouseEnter={(e) => onHoverNode('node-bfp-a', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-bfp-a')}
        onFocus={(e) => onFocusNode?.('node-bfp-a', e.currentTarget)}
        onBlur={() => onBlurNode?.('node-bfp-a')}
        onKeyDown={(e) => onKeyDownNode?.('node-bfp-a', e)}
      >
        <rect x="-8" y="-8" width="80" height="75" fill="transparent" />
        <rect x="2" y="48" width="70" height="6" rx="2" fill="url(#hmiConcreteFoundation)" stroke="#475569" />

        <rect
          x="6" y="20" width="26" height="28" rx="3" fill="#1e293b"
          stroke={bfpStatus === 'critical' ? '#dc2626' : bfpStatus === 'high' ? '#ef4444' : bfpStatus === 'moderate' ? '#f59e0b' : '#475569'}
          strokeWidth="1.8" filter="url(#hmiGlowSubtle)"
        />
        <line x1="10" y1="26" x2="28" y2="26" stroke="#475569" strokeWidth="1.5" />
        <line x1="10" y1="32" x2="28" y2="32" stroke="#475569" strokeWidth="1.5" />
        <line x1="10" y1="38" x2="28" y2="38" stroke="#475569" strokeWidth="1.5" />

        <rect x="32" y="30" width="6" height="8" rx="1.5" fill="#f59e0b" stroke="#b45309" />
        <rect
          x="38" y="16" width="30" height="34" rx="5"
          fill={bfpStatus === 'critical' || bfpStatus === 'high' || bfpStatus === 'moderate' ? 'url(#hmiPumpGradWarn)' : 'url(#hmiPumpGradNormal)'}
          stroke={bfpStatus === 'critical' ? '#dc2626' : bfpStatus === 'high' ? '#ef4444' : bfpStatus === 'moderate' ? '#f59e0b' : '#10b981'}
          strokeWidth="2"
        />
        <circle cx="53" cy="33" r="11" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="53" cy="33" r="4" fill="#ffffff" />

        <circle
          cx="70" cy="12"
          r={bfpStatus === 'critical' ? 5.5 : bfpStatus === 'high' ? 5 : bfpStatus === 'moderate' ? 4.5 : 4}
          className={getBeaconClass(bfpStatus)}
          fill={bfpStatus === 'critical' ? '#dc2626' : bfpStatus === 'high' ? '#ef4444' : bfpStatus === 'moderate' ? '#f59e0b' : '#10b981'}
          stroke={bfpStatus === 'critical' ? '#ffffff' : bfpStatus === 'high' ? '#fca5a5' : bfpStatus === 'moderate' ? '#fde68a' : 'none'}
          strokeWidth={bfpStatus !== 'normal' ? 1.2 : 0}
        />

        <rect
          x="0" y="56" width="74" height="18" rx="3" fill="#ffffff"
          stroke={bfpStatus === 'critical' ? '#dc2626' : bfpStatus === 'high' ? '#ef4444' : bfpStatus === 'moderate' ? '#f59e0b' : '#10b981'}
          strokeWidth={bfpStatus === 'critical' ? 2 : bfpStatus === 'high' ? 1.8 : 1.4}
          filter="url(#hmiGlowSubtle)"
        />
        <text x="37" y="68" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">
          {bfpLabel}
        </text>
      </g>

      {/* 3.5 GSU (Main Step-Up Transformer System) */}
      <g
        id="node-gsu"
        className={getNodeClass('node-gsu', gsuStatus)}
        transform="translate(1225, 250)"
        tabIndex={0}
        role="button"
        aria-label={`Main Step-Up Transformer (GSU) - Status: ${gsuStatus}${gsuMW !== undefined && gsuMW !== null ? `, Transmitted: ${gsuMW} MW` : ''}`}
        onMouseEnter={(e) => onHoverNode('node-gsu', e)}
        onMouseLeave={onLeaveNode}
        onClick={() => onSelectNode('node-gsu')}
        onFocus={(e) => onFocusNode?.('node-gsu', e.currentTarget)}
        onBlur={() => onBlurNode?.('node-gsu')}
        onKeyDown={(e) => onKeyDownNode?.('node-gsu', e)}
      >
        <polygon points="0,60 65,60 68,66 3,66" fill="url(#hmiConcreteFoundation)" stroke="#475569" />
        <rect
          x="6" y="14" width="54" height="46" rx="5"
          fill="url(#hmiTransformerTank)"
          stroke={gsuStatus === 'critical' ? '#dc2626' : gsuStatus === 'high' ? '#ef4444' : gsuStatus === 'moderate' ? '#f59e0b' : '#059669'}
          strokeWidth="1.8" filter="url(#hmiGlowSubtle)"
        />
        <line x1="2" y1="24" x2="6" y2="24" stroke="#64748b" strokeWidth="2.5" />
        <line x1="2" y1="34" x2="6" y2="34" stroke="#64748b" strokeWidth="2.5" />
        <line x1="2" y1="44" x2="6" y2="44" stroke="#64748b" strokeWidth="2.5" />
        <line x1="60" y1="24" x2="64" y2="24" stroke="#64748b" strokeWidth="2.5" />
        <line x1="60" y1="34" x2="64" y2="34" stroke="#64748b" strokeWidth="2.5" />
        <line x1="60" y1="44" x2="64" y2="44" stroke="#64748b" strokeWidth="2.5" />

        <polygon points="20,14 23,2 27,2 30,14" fill="#cbd5e1" stroke="#475569" />
        <polygon points="36,14 39,2 43,2 46,14" fill="#cbd5e1" stroke="#475569" />

        <circle
          cx="62" cy="10"
          r={gsuStatus === 'critical' ? 5.5 : gsuStatus === 'high' ? 5 : gsuStatus === 'moderate' ? 4.5 : 4}
          className={getBeaconClass(gsuStatus)}
          fill={gsuStatus === 'critical' ? '#dc2626' : gsuStatus === 'high' ? '#ef4444' : gsuStatus === 'moderate' ? '#f59e0b' : '#10b981'}
          stroke={gsuStatus === 'critical' ? '#ffffff' : gsuStatus === 'high' ? '#fca5a5' : gsuStatus === 'moderate' ? '#fde68a' : 'none'}
          strokeWidth={gsuStatus !== 'normal' ? 1.2 : 0}
        />

        <rect
          x="-3" y="68" width="74" height="18" rx="3" fill="#ffffff"
          stroke={gsuStatus === 'critical' ? '#dc2626' : gsuStatus === 'high' ? '#ef4444' : gsuStatus === 'moderate' ? '#f59e0b' : '#059669'}
          strokeWidth={gsuStatus === 'critical' ? 2 : gsuStatus === 'high' ? 1.8 : 1.2}
          filter="url(#hmiGlowSubtle)"
        />
        <text x="34" y="80" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">
          {gsuLabel}
        </text>
      </g>

    </svg>
  );
};
