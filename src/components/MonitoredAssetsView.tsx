import React, { useState } from 'react';
import { 
  Factory, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  Activity, 
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Zap,
  Gauge,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Plus
} from 'lucide-react';
import { MonitoredAsset } from '../types';
import { AddMachineryModal, NewMachineryData } from './AddMachineryModal';

interface MonitoredAssetsViewProps {
  assets: MonitoredAsset[];
  onSelectAsset: (asset: MonitoredAsset) => void;
  onLogCase: (asset: MonitoredAsset) => void;
  onNavigateToCatalog?: () => void;
  onAddAsset?: (newAsset: MonitoredAsset) => void;
}

const SHOW_EQUIPMENT_THUMBNAILS = true;

function getAssetThumbnail(id: string, category: string): string {
  if (id === 'asset-gt1' || id === 'asset-gt2' || category.toLowerCase().includes('combustion')) {
    return '/images/thumbnails/gas-turbine-3d.png';
  }
  if (id === 'asset-st1' || category.toLowerCase().includes('steam cycle') || category.toLowerCase().includes('steam turbine')) {
    return '/images/thumbnails/steam-turbine-3d.png';
  }
  if (id === 'asset-hrsg' || category.toLowerCase().includes('heat recovery')) {
    return '/images/thumbnails/hrsg-boiler-3d.png';
  }
  if (id === 'asset-gsu' || category.toLowerCase().includes('substation') || category.toLowerCase().includes('transformer')) {
    return '/images/thumbnails/transformer-gsu-3d.png';
  }
  if (id === 'asset-bfp' || category.toLowerCase().includes('pumping') || category.toLowerCase().includes('feed water')) {
    return '/images/thumbnails/boiler-feed-pump-3d.png';
  }
  if (id === 'asset-h2' || category.toLowerCase().includes('hydrogen') || category.toLowerCase().includes('gas sealing')) {
    return '/images/thumbnails/hydrogen-skid-3d.png';
  }
  return '/images/thumbnails/gas-turbine-3d.png';
}

export const MonitoredAssetsView: React.FC<MonitoredAssetsViewProps> = ({
  assets,
  onSelectAsset,
  onLogCase,
  onNavigateToCatalog,
  onAddAsset
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddNewMachinery = (data: NewMachineryData) => {
    const statusType = data.healthScore < 80 ? 'critical' : data.healthScore < 90 ? 'warning' : 'optimal';
    const statusText = statusType === 'optimal' ? 'Optimal' : statusType === 'warning' ? 'Under Advisory' : 'Critical Advisory';
    
    const newAsset: MonitoredAsset = {
      id: `asset-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: data.name,
      code: data.code,
      category: data.category || 'Combustion Turbine',
      ratedCapacity: data.ratedCapacity || '160 MW Rated',
      healthScore: data.healthScore,
      statusText,
      statusType,
      metrics: [
        { label: data.metricLabel || 'Active Load', value: data.metricValue || '156 MW', status: statusType },
        { label: 'Vibration', value: '1.2 mm/s', status: 'optimal' },
        { label: 'EGT Spread', value: '14°C', status: 'optimal' },
        { label: 'Lube Header', value: '2.5 bar', status: 'normal' }
      ],
      healthTrend7d: [
        { day: 'D-6', score: data.healthScore },
        { day: 'D-5', score: data.healthScore },
        { day: 'D-4', score: data.healthScore },
        { day: 'D-3', score: data.healthScore },
        { day: 'D-2', score: data.healthScore },
        { day: 'D-1', score: data.healthScore },
        { day: 'Today', score: data.healthScore }
      ],
      aiSummary: data.aiSummary || `${data.name} (${data.code}) successfully provisioned into active telemetry monitoring.`
    };

    onAddAsset?.(newAsset);
  };

  const filteredAssets = assets.filter(asset => {
    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.code.toLowerCase().includes(q) ||
        asset.category.toLowerCase().includes(q) ||
        asset.aiSummary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Simple SVG Sparkline Renderer for 7-day health trend
  const renderSparkline = (trend: { day: string; score: number }[]) => {
    if (!trend || trend.length === 0) return null;
    const min = 70;
    const max = 100;
    const width = 120;
    const height = 32;

    const points = trend.map((t, idx) => {
      const x = (idx / (trend.length - 1)) * width;
      const y = height - ((t.score - min) / (max - min)) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    const lastScore = trend[trend.length - 1].score;
    const strokeColor = lastScore >= 90 ? '#10b981' : lastScore >= 80 ? '#f59e0b' : '#f43f5e';

    return (
      <div className="flex items-center gap-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {trend.map((t, idx) => {
            const x = (idx / (trend.length - 1)) * width;
            const y = height - ((t.score - min) / (max - min)) * (height - 6) - 3;
            if (idx === trend.length - 1) {
              return (
                <circle 
                  key={idx} 
                  cx={x} 
                  cy={y} 
                  r="3.5" 
                  fill={strokeColor} 
                  stroke="#ffffff" 
                  strokeWidth={1.5} 
                />
              );
            }
            return null;
          })}
        </svg>
        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {lastScore}%
        </span>
      </div>
    );
  };

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn">
      {/* Search & Header Bar */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Monitored Assets ({filteredAssets.length})
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, name, fault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs shadow-blue-600/20 transition cursor-pointer active:scale-95 shrink-0"
            title="Add New Machinery or Component"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Machinery / Component</span>
          </button>
        </div>
      </div>

      {/* Assets Grid: 4 cards in a row on desktop */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 2xl:gap-2.5">
          {filteredAssets.map((asset) => {
            const isAttention = asset.healthScore < 90;
            const isCritical = asset.healthScore < 80;
            const isExpanded = expandedAssetId === asset.id;

            return (
              <div
                key={asset.id}
                onClick={() => setExpandedAssetId(prev => prev === asset.id ? null : asset.id)}
                className={`w-full bg-white dark:bg-slate-800 border rounded-xl p-2.5 2xl:p-3 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer group ${
                  isExpanded
                    ? 'ring-2 ring-blue-500/40 border-blue-400 dark:border-blue-500 shadow-md'
                    : isCritical 
                    ? 'border-rose-300/80 dark:border-rose-900/60 hover:border-rose-400' 
                    : isAttention 
                    ? 'border-amber-300/80 dark:border-amber-900/60 bg-amber-500/5 dark:bg-amber-950/20 hover:border-amber-400' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-1.5 border-b border-slate-100 dark:border-slate-700/60 pb-1.5">
                    <div className="flex gap-2 min-w-0">
                      {SHOW_EQUIPMENT_THUMBNAILS && (
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700/80 p-0.5 overflow-hidden flex items-center justify-center shadow-xs group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
                          <img 
                            src={getAssetThumbnail(asset.id, asset.category)} 
                            alt={asset.name} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                            {asset.code}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {asset.name}
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {asset.category} • {asset.ratedCapacity}
                        </p>
                      </div>
                    </div>

                    {/* Health Score Pill */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border flex items-center gap-1 ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                          : isAttention
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isCritical ? 'bg-rose-500' : isAttention ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        {asset.healthScore}%
                      </span>
                    </div>
                  </div>

                  {/* IN-CARD TELEMETRY: Toggle between Compact Chips and Expanded Full Data */}
                  {isExpanded ? (
                    <div className="my-2 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-1">
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Activity className="h-3 w-3" />
                          Live Telemetry
                        </span>
                        <span className="text-[9px] text-slate-400">Click to collapse</span>
                      </div>

                      <div className="space-y-1">
                        {asset.metrics.map((m, idx) => (
                          <div
                            key={idx}
                            className={`p-1.5 rounded border text-[10px] flex items-center justify-between gap-1.5 ${
                              m.status === 'critical'
                                ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200'
                                : m.status === 'warning'
                                ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-[10px] font-medium truncate">{m.label}</span>
                            <span className="font-mono font-bold text-[10px] shrink-0">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 my-2">
                      {asset.metrics.map((m, idx) => (
                        <div 
                          key={idx}
                          className={`p-1.5 rounded-lg border flex flex-col justify-between min-h-[38px] ${
                            m.status === 'critical'
                              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200'
                              : m.status === 'warning'
                              ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200'
                              : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                          title={`${m.label}: ${m.value}`}
                        >
                          <span className="text-[9.5px] text-slate-400 font-medium truncate block leading-tight">
                            {m.label}
                          </span>
                          <span className="font-mono font-bold text-[10.5px] mt-0.5 text-slate-900 dark:text-slate-100 truncate block">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 7-Day Trend Sparkline Strip */}
                  <div className="py-1 px-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">7D Trend</span>
                    {renderSparkline(asset.healthTrend7d)}
                  </div>

                  {/* AI Summary Callout */}
                  <div className={`p-1.5 rounded-lg border text-[10px] leading-snug line-clamp-2 ${
                    isAttention 
                      ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20 text-slate-800 dark:text-slate-200' 
                      : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold mr-1">AI:</strong>
                    {asset.aiSummary}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAsset(asset);
                    }}
                    className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open Deep Diagnostic Modal"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Diagnostics</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedAssetId(prev => prev === asset.id ? null : asset.id);
                      }}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <span>{isExpanded ? 'Less' : 'More'}</span>
                      {isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogCase(asset);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold transition cursor-pointer ${
                        asset.caseId
                          ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Wrench className="h-2.5 w-2.5" />
                      <span>{asset.caseId ? asset.caseId : 'Log'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Add Machinery / Component Modal */}
      <AddMachineryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewMachinery}
        facilityType="power"
      />
    </div>
  );
};
