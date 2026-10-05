import React, { useState, useMemo } from 'react';
import { 
  Factory, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  LayoutGrid, 
  List, 
  TrendingDown, 
  Calendar,
  Layers,
  Clock,
  Wind
} from 'lucide-react';
import { useWindReliability } from '../WindReliabilityContext';
import { WindAsset, AssetRiskLevel } from '../types';

interface WindAssetsViewProps {
  onNavigateToCatalog?: () => void;
}

export const WindAssetsView: React.FC<WindAssetsViewProps> = ({
  onNavigateToCatalog
}) => {
  const { assets, setSelectedAsset } = useWindReliability();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterTrend, setFilterTrend] = useState<string>('all');
  const [filterMaintenance, setFilterMaintenance] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchSearch =
        asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterType === 'all' || asset.assetType === filterType;
      const matchRisk = filterRisk === 'all' || asset.riskLevel === filterRisk;
      const matchTrend = filterTrend === 'all' || asset.riskTrend === filterTrend;
      const matchMaint =
        filterMaintenance === 'all' ||
        (filterMaintenance === 'overdue' && asset.isMaintenanceOverdue) ||
        (filterMaintenance === 'ok' && !asset.isMaintenanceOverdue);

      return matchSearch && matchType && matchRisk && matchTrend && matchMaint;
    });
  }, [assets, searchQuery, filterType, filterRisk, filterTrend, filterMaintenance]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(assets.map(a => a.assetType)));
  }, [assets]);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3 animate-fadeIn select-none">
      {/* Controls & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Wind Fleet Condition Matrix ({filteredAssets.length} of {assets.length} Units)
            </span>
          </div>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search turbine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 sm:w-52"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs font-bold' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs font-bold' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none"
        >
          <option value="all">All Asset Types</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none"
        >
          <option value="all">All Risk Levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Moderate">Moderate</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterTrend}
          onChange={(e) => setFilterTrend(e.target.value)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none"
        >
          <option value="all">All Trends</option>
          <option value="Improving">Improving</option>
          <option value="Stable">Stable</option>
          <option value="Deteriorating">Deteriorating</option>
        </select>

        <select
          value={filterMaintenance}
          onChange={(e) => setFilterMaintenance(e.target.value)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none"
        >
          <option value="all">All Maintenance Status</option>
          <option value="overdue">Overdue Only</option>
          <option value="ok">On Schedule</option>
        </select>
      </div>

      {/* Main Content: Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 z-10">
                <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Output / Load</th>
                  <th className="py-2.5 px-3 text-center">Health</th>
                  <th className="py-2.5 px-3 text-center">Risk</th>
                  <th className="py-2.5 px-3 text-center">Criticality</th>
                  <th className="py-2.5 px-3">Trend</th>
                  <th className="py-2.5 px-3">Main Issue</th>
                  <th className="py-2.5 px-3 text-center">Priority</th>
                  <th className="py-2.5 px-3">Next Maint.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredAssets.map((asset) => {
                  const isHighRisk = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';
                  const isModerateRisk = asset.riskLevel === 'Moderate' || asset.riskLevel === 'Medium';

                  return (
                    <tr
                      key={asset.assetId}
                      onClick={() => setSelectedAsset(asset)}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-750/60 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {asset.assetCode}
                          </span>
                          <span className="truncate max-w-[140px]">{asset.assetName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{asset.assetType}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {((asset.telemetry.activePowerKw || 0) / 1000).toFixed(1)} MW
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono font-bold ${asset.healthScore < 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {asset.healthScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isHighRisk 
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' 
                            : isModerateRisk 
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          {asset.riskScore} ({asset.riskLevel})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {asset.criticality}/5
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[11px] font-medium flex items-center gap-1 ${
                          asset.riskTrend === 'Deteriorating' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                        }`}>
                          {asset.riskTrend}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[240px] truncate" title={asset.mainIssue}>
                        {asset.mainIssue}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {asset.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[11px] ${asset.isMaintenanceOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}`}>
                          {asset.isMaintenanceOverdue ? 'Overdue' : asset.nextMaintenanceDate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pr-1">
          {filteredAssets.map((asset) => {
            const isHighRisk = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';

            return (
              <div
                key={asset.assetId}
                onClick={() => setSelectedAsset(asset)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {asset.assetCode}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{asset.assetName}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHighRisk 
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    }`}>
                      {asset.riskLevel} ({asset.riskScore})
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                    {asset.mainIssue}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Health</span>
                    <span className="font-mono text-xs font-bold">{asset.healthScore}/100</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Power</span>
                    <span className="font-mono text-xs font-bold">{((asset.telemetry.activePowerKw || 0) / 1000).toFixed(1)} MW</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Priority</span>
                    <span className="font-mono text-xs font-bold">{asset.priority}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
