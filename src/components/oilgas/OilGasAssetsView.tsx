import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  ShieldAlert,
  Layers,
  BarChart3,
  MapPin,
  HelpCircle,
  Radio,
  Plus
} from 'lucide-react';
import { AssetRulRadialChart } from './AssetRulRadialChart';
import { InteractivePfdHmiMap } from './InteractivePfdHmiMap';
import { OilGasPageHeader } from './OilGasPageHeader';
import { AddMachineryModal, NewMachineryData } from '../AddMachineryModal';
import { 
  RotatingEquipmentRul, 
  OffshoreSeparator, 
  OffshoreWellhead, 
  OffshoreStorageTank 
} from '../../types/oilGasTypes';

interface OilGasAssetsViewProps {
  equipmentList: RotatingEquipmentRul[];
  separators?: OffshoreSeparator[];
  wellheads?: OffshoreWellhead[];
  storageTanks?: OffshoreStorageTank[];
  onLogCaseForAsset: (equipment: RotatingEquipmentRul) => void;
  onOpenJargonGuide?: () => void;
  onAddEquipment?: (newEquipment: RotatingEquipmentRul) => void;
}

export const OilGasAssetsView: React.FC<OilGasAssetsViewProps> = ({
  equipmentList,
  separators = [],
  wellheads = [],
  storageTanks = [],
  onLogCaseForAsset,
  onOpenJargonGuide,
  onAddEquipment
}) => {
  const [viewMode, setViewMode] = useState<'pfd' | 'radials' | 'cards'>('pfd');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customEquipment, setCustomEquipment] = useState<RotatingEquipmentRul[]>([]);

  const handleAddNewEquipment = (data: NewMachineryData) => {
    const status = data.healthScore < 80 ? 'critical' : data.healthScore < 90 ? 'warning' : 'optimal';
    const newEq: RotatingEquipmentRul = {
      id: `eq-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      tag: data.code,
      name: data.name,
      category: (data.category as any) || 'Gas Compression',
      rulPercent: data.healthScore,
      hoursToService: Math.round((data.healthScore / 100) * 8760),
      designLifeHours: 50000,
      vibrationRmsMmS: 1.2,
      vibrationLimitMmS: 4.5,
      bearingTempC: 58,
      bearingTempLimitC: 85,
      dischargePressureBar: 32,
      dischargePressureRatingBar: 45,
      status,
      statusLabel: status === 'optimal' ? 'Optimal Performance' : status === 'warning' ? 'Under Advisory' : 'Critical Anomaly',
      diagnosticFinding: data.aiSummary || 'Equipment telemetry commissioned and within normal baseline.',
      recommendedAction: 'Continue baseline vibration and thermal survey log.'
    };
    setCustomEquipment(prev => [newEq, ...prev]);
    onAddEquipment?.(newEq);
  };

  const allEquipment = [...customEquipment, ...equipmentList];

  const filteredEquipment = allEquipment.filter(e => {
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2 2xl:gap-2.5 animate-fadeIn">
      {/* Page Title: Machinery Health & Remaining Useful Life (RUL) */}
      <div className="shrink-0">
        <OilGasPageHeader
          title="Machinery Health & Remaining Useful Life (RUL)"
          subtitle="Interactive SCADA Human-Machine Interface (HMI) and predictive maintenance dashboard"
          icon={Cpu}
          badgeText="SCADA HMI Active"
          badgeColor="emerald"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setViewMode('pfd')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'pfd'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  <span>Interactive PFD Map</span>
                </button>

                <button
                  onClick={() => setViewMode('radials')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'radials'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>RUL Radial Analytics</span>
                </button>

                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Telemetry Cards</span>
                </button>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs shadow-emerald-600/20 transition cursor-pointer active:scale-95 shrink-0"
                title="Add Machinery"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Machinery</span>
              </button>
            </div>
          }
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {/* VIEW 1: SCADA Process Flow Diagram (PFD) Interactive HMI Map (PRIMARY VIEW) */}
        {viewMode === 'pfd' && (
          <InteractivePfdHmiMap
            rotatingEquipment={equipmentList}
            separators={separators}
            wellheads={wellheads}
            storageTanks={storageTanks}
            onLogCaseForAsset={onLogCaseForAsset}
            onOpenJargonGuide={onOpenJargonGuide}
          />
        )}

        {/* VIEW 2: Asset Health & RUL RadialBarChart & Spotlight */}
        {viewMode === 'radials' && (
          <AssetRulRadialChart
            equipmentList={equipmentList}
            onLogCaseForAsset={onLogCaseForAsset}
          />
        )}

        {/* VIEW 3: Critical Rotating Equipment Directory Cards */}
        {viewMode === 'cards' && (
          <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Heavy Machinery Health &amp; Maintenance Schedule (RUL)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Continuous monitoring of machine wear, vibration, and days left before parts replacement.
                </p>
              </div>
            </div>
            {/* Equipment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEquipment.map((eq) => {
                const isAttention = eq.status === 'warning';
                return (
                  <div
                    key={eq.id}
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-2.5 bg-white dark:bg-slate-800 ${
                      isAttention
                        ? 'border-amber-300 dark:border-amber-800/80 bg-amber-500/5 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                              {eq.tag}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {eq.name}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            {eq.category} • Expected Life: {eq.designLifeHours.toLocaleString()} hrs
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          eq.status === 'optimal'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                        }`}>
                          RUL: {eq.rulPercent}% ({eq.hoursToService.toLocaleString()} hrs)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/80 text-xs">
                      <span className="text-[11px] text-slate-500">Service Due: <strong className="font-mono text-slate-800 dark:text-slate-200">{Math.round(eq.hoursToService / 24)} days</strong> ({eq.hoursToService.toLocaleString()} hrs)</span>
                      <button
                        onClick={() => onLogCaseForAsset(eq)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-800 transition"
                      >
                        <Wrench className="h-3 w-3" />
                        <span>Log PTW Order</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Machinery / Component Modal */}
      <AddMachineryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewEquipment}
        facilityType="oilgas"
      />
    </div>
  );
};

