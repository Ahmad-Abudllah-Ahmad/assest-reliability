import React from 'react';
import { 
  Factory, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ChevronRight, 
  Flame, 
  Thermometer, 
  Layers
} from 'lucide-react';
import { PlantAsset } from '../types';

interface FleetAssetCardsProps {
  assets: PlantAsset[];
  onSelectAsset: (asset: PlantAsset) => void;
}

export const FleetAssetCards: React.FC<FleetAssetCardsProps> = ({
  assets,
  onSelectAsset
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Factory className="h-4 w-4 text-slate-700" />
              Fleet Health & Critical Assets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live DCS telemetry per unit. Click any asset to inspect temperature trend.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            4 Units Online
          </span>
        </div>

        {/* 4 Asset Cards */}
        <div className="space-y-2.5">
          {assets.map((asset) => {
            const isWarning = asset.status === 'warning';

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 group ${
                  isWarning
                    ? 'bg-amber-50/50 hover:bg-amber-50 border-amber-200 shadow-xs'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isWarning ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {asset.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {asset.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full flex items-center gap-1 ${
                        isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {asset.statusLabel}
                      </span>
                    </div>

                    {/* Primary & Secondary Telemetry */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 flex-wrap">
                      {asset.currentMW > 0 && (
                        <span className="font-mono font-semibold text-slate-900">
                          {asset.currentMW} MW <span className="text-slate-400 font-normal">({asset.ratedMW} rated)</span>
                        </span>
                      )}
                      <span>•</span>
                      <span>{asset.primaryMetric}: <strong className="text-slate-800 font-mono">{asset.primaryValue}</strong></span>
                      <span>•</span>
                      <span>{asset.secondaryMetric}: <strong className={isWarning ? 'text-amber-800 font-mono' : 'text-slate-800 font-mono'}>{asset.secondaryValue}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="flex items-center text-slate-400 group-hover:text-blue-600 transition flex-shrink-0">
                  <span className="text-[11px] font-medium hidden sm:inline mr-1">Details</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Summary Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Combined Plant Efficiency: <strong>56.4% Thermal</strong></span>
        <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => onSelectAsset(assets[1])}>
          Review GT-2 Anomaly →
        </span>
      </div>
    </div>
  );
};
