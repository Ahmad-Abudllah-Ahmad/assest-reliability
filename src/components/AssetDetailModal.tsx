import React from 'react';
import { 
  X, 
  Thermometer, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Download, 
  UserPlus, 
  Flag 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MachineAsset } from '../types';

interface AssetDetailModalProps {
  asset: MachineAsset | null;
  onClose: () => void;
  onAdvisoryAction: (
    actionType: 'log_case' | 'assign_engineer' | 'export_package' | 'flag_outage',
    asset: MachineAsset,
    casePayload?: any
  ) => void;
}

function getMachineAssetThumbnail(asset: MachineAsset): string {
  if (asset.id.includes('gt') || asset.type.toLowerCase().includes('combustion')) {
    return '/images/thumbnails/gas-turbine-3d.png';
  }
  if (asset.id.includes('st') || asset.type.toLowerCase().includes('steam')) {
    return '/images/thumbnails/steam-turbine-3d.png';
  }
  if (asset.id.includes('hrsg') || asset.name.toLowerCase().includes('hrsg')) {
    return '/images/thumbnails/hrsg-boiler-3d.png';
  }
  if (asset.id.includes('gsu') || asset.name.toLowerCase().includes('transformer')) {
    return '/images/thumbnails/transformer-gsu-3d.png';
  }
  if (asset.id.includes('bfp') || asset.name.toLowerCase().includes('pump')) {
    return '/images/thumbnails/boiler-feed-pump-3d.png';
  }
  if (asset.id.includes('h2') || asset.name.toLowerCase().includes('hydrogen')) {
    return '/images/thumbnails/hydrogen-skid-3d.png';
  }
  return '/images/thumbnails/gas-turbine-3d.png';
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onAdvisoryAction
}) => {
  if (!asset) return null;

  const isWarning = asset.status === 'warning' || asset.status === 'critical';

  // Calculate dynamic Y-axis range so curve dynamics are clearly visible
  const temps = asset.temperatureHistory.map(t => t.temp);
  const benchmarks = asset.temperatureHistory.map(t => t.benchmark);
  const allVals = [...temps, ...benchmarks];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const pad = Math.max(8, Math.round((maxVal - minVal) * 0.35));
  const yDomain: [number, number] = [Math.max(0, Math.floor(minVal - pad)), Math.ceil(maxVal + pad)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col p-6 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-1 overflow-hidden flex items-center justify-center shadow-xs">
              <img 
                src={getMachineAssetThumbnail(asset)} 
                alt={asset.name} 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {asset.name} ({asset.code})
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isWarning
                    ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                }`}>
                  {asset.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {asset.model} • {asset.currentMW > 0 ? `${asset.currentMW} MW Load` : 'Main Substation Asset'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="space-y-4 my-4 overflow-y-auto pr-1">
          
          {/* Temperature Trend Section */}
          <div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Historical Thermal Trend vs. Baseline Benchmark
              </span>
              <div className="flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-blue-600" /> Measured (°C)
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Baseline (°C)
                </span>
              </div>
            </div>

            <div className="h-52 w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pt-3 pb-2 px-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asset.temperatureHistory} margin={{ top: 24, right: 24, left: -10, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} domain={yDomain} unit="°C" />
                  <Tooltip 
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                  />
                  <Line type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Baseline" />
                  <Line type="monotone" dataKey="temp" stroke={isWarning ? '#f59e0b' : '#3b82f6'} strokeWidth={2.5} dot={{ r: 4, fill: isWarning ? '#f59e0b' : '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} name="Exhaust Temp" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full Telemetry Parameters Grid (Completely displayed, no cutoffs) */}
          {asset.telemetry && asset.telemetry.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Live Monitored Telemetry Parameters
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {asset.telemetry.length} Sensors Online
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {asset.telemetry.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                      t.status === 'critical'
                        ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 text-rose-800 dark:text-rose-200'
                        : t.status === 'warning'
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 text-amber-800 dark:text-amber-200'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        {t.label}
                      </span>
                      {t.limit && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono mt-0.5">
                          Limit: {t.limit}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs shrink-0 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {t.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plain-English Diagnostic Callout */}
          <div className={`p-4 rounded-xl border ${
            isWarning 
              ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/20 text-slate-800 dark:text-slate-200' 
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Plain-English AI Diagnostics & Physics Model
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {asset.aiRunningInsight}
            </p>
          </div>

        </div>

        {/* Modal Footer Advisory Actions - Aligned in one single line */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-end gap-2.5 flex-nowrap overflow-x-auto">
          {asset.advisoryActions.map((action, idx) => {
            const cleanLabel = action.label.replace(/^[+\-±•]\s*/, '');
            return (
              <button
                key={idx}
                onClick={() => {
                  onClose();
                  onAdvisoryAction(action.actionType, asset, action.casePayload);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                  action.actionType === 'log_case'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {action.actionType === 'log_case' && <Wrench className="h-3.5 w-3.5" />}
                {action.actionType === 'assign_engineer' && <UserPlus className="h-3.5 w-3.5" />}
                {action.actionType === 'export_package' && <Download className="h-3.5 w-3.5" />}
                {action.actionType === 'flag_outage' && <Flag className="h-3.5 w-3.5" />}
                <span>{cleanLabel}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
