import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldAlert, 
  Zap,
  ArrowRight,
  Sun
} from 'lucide-react';
import { useSolarReliability } from '../SolarReliabilityContext';
import { SolarAsset } from '../types';

interface SolarAssetsViewProps {
  onNavigateToCatalog?: () => void;
}

export const SolarAssetsView: React.FC<SolarAssetsViewProps> = () => {
  const { assets, setSelectedAsset } = useSolarReliability();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.mainIssue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = 
      selectedRiskFilter === 'all' || 
      asset.riskLevel.toLowerCase() === selectedRiskFilter.toLowerCase();

    const matchesType = 
      selectedTypeFilter === 'all' || 
      asset.assetType.toLowerCase() === selectedTypeFilter.toLowerCase();

    return matchesSearch && matchesRisk && matchesType;
  });

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3 animate-fadeIn select-none">
      
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search solar assets by tag, name, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Risk Level Filter */}
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750/70 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>

          {/* Asset Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750/70 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
          >
            <option value="all">All Asset Types</option>
            <option value="pv array">PV Array</option>
            <option value="inverter pcs">Inverter PCS</option>
            <option value="step-up transformer">Step-Up Transformer</option>
            <option value="bess">BESS</option>
            <option value="mv switchgear">MV Switchgear</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-2xs font-bold' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-2xs font-bold' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xs overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/70 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="pb-2.5">Asset Code &amp; Name</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">Output / Load</th>
                <th className="pb-2.5">Health</th>
                <th className="pb-2.5">Risk Score</th>
                <th className="pb-2.5">Criticality</th>
                <th className="pb-2.5">Trend</th>
                <th className="pb-2.5">Main Subsystem Issue</th>
                <th className="pb-2.5 text-center">Priority</th>
                <th className="pb-2.5">Next Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.assetId}
                  onClick={() => setSelectedAsset(asset)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition cursor-pointer"
                >
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {asset.assetCode}
                      </span>
                      <span className="truncate max-w-[200px]">{asset.assetName}</span>
                    </div>
                  </td>

                  <td className="py-3 text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[11px] font-mono">
                      {asset.assetType}
                    </span>
                  </td>

                  <td className="py-3 font-mono font-semibold text-sky-600 dark:text-sky-400">
                    {asset.telemetry.activePowerOutputMW} MW
                  </td>

                  <td className="py-3 font-mono font-bold">
                    <span className={asset.healthScore < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                      {asset.healthScore}%
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold ${
                        asset.riskScore >= 60 ? 'text-rose-600' : asset.riskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {asset.riskScore}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                        asset.riskLevel === 'Critical' || asset.riskLevel === 'High'
                          ? 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                          : asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      }`}>
                        {asset.riskLevel}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 font-mono text-slate-500">
                    {'★'.repeat(asset.criticality)}{'☆'.repeat(5 - asset.criticality)}
                  </td>

                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 w-fit ${
                      asset.riskTrend === 'deteriorating'
                        ? 'bg-rose-500/10 text-rose-600'
                        : asset.riskTrend === 'improving'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {asset.riskTrend === 'deteriorating' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="capitalize">{asset.riskTrend}</span>
                    </span>
                  </td>

                  <td className="py-3 text-slate-700 dark:text-slate-300 max-w-[240px] truncate" title={asset.mainIssue}>
                    {asset.mainIssue}
                  </td>

                  <td className="py-3 text-center">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      asset.priority === 'P1' ? 'bg-rose-500/10 text-rose-600' : asset.priority === 'P2' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {asset.priority}
                    </span>
                  </td>

                  <td className="py-3 font-mono text-slate-500">
                    {asset.nextMaintenanceDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pr-0.5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.assetId}
              onClick={() => setSelectedAsset(asset)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {asset.assetCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{asset.assetType}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                    {asset.assetName}
                  </h4>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  asset.riskLevel === 'Critical' || asset.riskLevel === 'High'
                    ? 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                    : asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate'
                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                }`}>
                  {asset.priority} • {asset.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-750 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Health</span>
                  <span className={`font-mono font-bold ${asset.healthScore < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {asset.healthScore}%
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-750 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Risk</span>
                  <span className={`font-mono font-bold ${asset.riskScore >= 60 ? 'text-rose-600' : asset.riskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {asset.riskScore}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-750 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Output</span>
                  <span className="font-mono font-bold text-sky-600">
                    {asset.telemetry.activePowerOutputMW} MW
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-750 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                {asset.mainIssue}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                <span>Next Maint: {asset.nextMaintenanceDate}</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span>Dossier</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
