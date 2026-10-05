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
  Clock
} from 'lucide-react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { CcgtAsset, AssetRiskLevel } from '../types';

interface CcgtAssetsViewProps {
  onNavigateToCatalog?: () => void;
}

export const CcgtAssetsView: React.FC<CcgtAssetsViewProps> = ({
  onNavigateToCatalog
}) => {
  const { assets, setSelectedAsset } = useCcgtReliability();

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
      
      {/* Compact Controls & Search Row (Page Title Banner Removed per Part C & H) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Condition Matrix ({filteredAssets.length} of {assets.length} Units)
            </span>
          </div>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset..."
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
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Filters:
        </span>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2 py-1"
        >
          <option value="all">All Types</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Risk Filter */}
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2 py-1"
        >
          <option value="all">All Risk Levels</option>
          <option value="Low">Low Risk (0-20)</option>
          <option value="Moderate">Moderate Risk (21-40)</option>
          <option value="Medium">Medium Risk (41-60)</option>
          <option value="High">High Risk (61-80)</option>
          <option value="Critical">Critical Risk (81-100)</option>
        </select>

        {/* Trend Filter */}
        <select
          value={filterTrend}
          onChange={(e) => setFilterTrend(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2 py-1"
        >
          <option value="all">All Trends</option>
          <option value="Stable">Stable</option>
          <option value="Deteriorating">Deteriorating</option>
          <option value="Improving">Improving</option>
        </select>

        {/* Maintenance Filter */}
        <select
          value={filterMaintenance}
          onChange={(e) => setFilterMaintenance(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2 py-1"
        >
          <option value="all">All Maintenance</option>
          <option value="overdue">Overdue Only</option>
          <option value="ok">On Schedule</option>
        </select>
      </div>

      {/* Main Content: Table or Grid */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xs overflow-y-auto">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/70 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-2.5">Asset</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Current Output / Load</th>
                  <th className="pb-2.5">Health</th>
                  <th className="pb-2.5">Risk Level</th>
                  <th className="pb-2.5 text-center">Criticality</th>
                  <th className="pb-2.5">Trend</th>
                  <th className="pb-2.5 text-center">Open Alerts</th>
                  <th className="pb-2.5">Next Maintenance</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredAssets.map((asset) => {
                  const isRiskHigh = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';
                  const isRiskMed = asset.riskLevel === 'Medium' || asset.riskLevel === 'Moderate';

                  return (
                    <tr
                      key={asset.assetId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 p-0.5 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                            <img src={asset.thumbnail} alt={asset.assetName} className="h-full w-full object-contain" />
                          </div>
                          <div>
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold block text-xs">
                              {asset.assetCode}
                            </span>
                            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                              {asset.assetName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {asset.assetType}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        {asset.telemetry.generationMW !== undefined
                          ? `${asset.telemetry.generationMW} MW Gen`
                          : asset.telemetry.powerConsumptionMW !== undefined
                          ? `${asset.telemetry.powerConsumptionMW} MW Aux`
                          : asset.telemetry.transmittedMW !== undefined
                          ? `${asset.telemetry.transmittedMW} MW Xfmr`
                          : `${asset.telemetry.mwOutput} MW`} ({asset.telemetry.loadPct}%)
                      </td>
                      <td className="py-3">
                        <span className={`font-mono font-bold text-xs ${
                          asset.healthScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                          asset.healthScore >= 80 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {asset.healthScore}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isRiskHigh ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                          isRiskMed ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          {asset.riskLevel} ({asset.riskScore})
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {asset.criticality}/5
                      </td>
                      <td className="py-3 text-[11px]">
                        <span className={`flex items-center gap-1 ${
                          asset.riskTrend === 'Deteriorating' ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {asset.riskTrend === 'Deteriorating' ? <TrendingDown className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          {asset.riskTrend}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {asset.openAlertCount > 0 ? (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            {asset.openAlertCount} Alerts
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">0</span>
                        )}
                      </td>
                      <td className="py-3 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{asset.nextMaintenanceDate}</span>
                          {asset.isMaintenanceOverdue && (
                            <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase bg-rose-50 dark:bg-rose-950/60 px-1 rounded">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          asset.operationalStatus === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          asset.operationalStatus === 'Derated' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {asset.operationalStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset(asset);
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition flex items-center gap-1 ml-auto"
                        >
                          <span>Diagnostics</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.assetId}
                onClick={() => setSelectedAsset(asset)}
                className="bg-slate-50 dark:bg-slate-750/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-3 hover:border-blue-500 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                      <img src={asset.thumbnail} alt={asset.assetName} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {asset.assetCode}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {asset.assetName}
                      </h4>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    asset.riskLevel === 'High' ? 'bg-rose-500/10 text-rose-700 border-rose-500/30' :
                    asset.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  }`}>
                    {asset.riskLevel} ({asset.riskScore})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <div>Health: <strong className="font-mono text-slate-800 dark:text-slate-200">{asset.healthScore}/100</strong></div>
                  <div>Load: <strong className="font-mono text-slate-800 dark:text-slate-200">{asset.telemetry.loadPct}%</strong></div>
                  <div>Power: <strong className="font-mono text-slate-800 dark:text-slate-200">
                    {asset.telemetry.generationMW !== undefined
                      ? `${asset.telemetry.generationMW} MW Gen`
                      : asset.telemetry.powerConsumptionMW !== undefined
                      ? `${asset.telemetry.powerConsumptionMW} MW Aux`
                      : asset.telemetry.transmittedMW !== undefined
                      ? `${asset.telemetry.transmittedMW} MW Xfmr`
                      : `${asset.telemetry.mwOutput} MW`}
                  </strong></div>
                  <div>Priority: <strong className="font-mono text-slate-800 dark:text-slate-200">{asset.priority}</strong></div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>Trend: <strong className={asset.riskTrend === 'Deteriorating' ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>{asset.riskTrend}</strong></span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                    Condition Detail <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
