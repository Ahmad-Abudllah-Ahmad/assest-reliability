import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface FacilityCatalogProps {
  onSelectFacility: (facility: 'power' | 'oilgas', source?: 'gas' | 'wind' | 'solar') => void;
}

type ModalityId = 'gas' | 'wind' | 'solar';

interface ModalityData {
  id: ModalityId;
  title: string;
  description: string;
  bgImage: string;
  metrics: {
    label: string;
    value: string;
    color: string;
  }[];
}

const MODALITIES: ModalityData[] = [
  {
    id: 'gas',
    title: 'Gas Combined Cycle (CCGT)',
    description: 'Surveillance of heavy-duty gas turbines, combustor EGT thermal spread arrays, steam condenser vacuum backpressure curves, and NERC BAL-002 contingency reserve compliance.',
    bgImage: '/images/power-plant.png',
    metrics: [
      { label: 'Load', value: '462.0 MW', color: 'text-cyan-300' },
      { label: 'Heat Rate', value: '6,820 BTU', color: 'text-amber-300' },
      { label: 'Yield', value: '+$48.6K', color: 'text-emerald-300' }
    ]
  },
  {
    id: 'wind',
    title: 'Wind Turbine Fleet',
    description: 'Active aerodynamic pitch control, wake deficit sector management, gearbox vibration spectral analysis, and grid interconnect reactive power dispatch.',
    bgImage: '/images/wind-farm.png',
    metrics: [
      { label: 'Load', value: '104.2 MW', color: 'text-emerald-300' },
      { label: 'Wind Speed', value: '9.4 m/s', color: 'text-teal-300' },
      { label: 'Cap. Factor', value: '41.8%', color: 'text-cyan-300' }
    ]
  },
  {
    id: 'solar',
    title: 'Solar PV Array',
    description: 'Single-axis tracking astronomical positioning, central inverter thermal mapping, high-resolution string MPPT efficiency monitoring, and soiling loss diagnostics.',
    bgImage: '/images/solar-farm.png',
    metrics: [
      { label: 'Current Gen', value: '38.4 MW', color: 'text-amber-300' },
      { label: 'Irradiance', value: '890 W/m²', color: 'text-yellow-300' },
      { label: 'Inverter Eff', value: '98.6%', color: 'text-emerald-300' }
    ]
  }
];

export const FacilityCatalog: React.FC<FacilityCatalogProps> = ({ onSelectFacility }) => {
  const [viewMode, setViewMode] = useState<'catalog' | 'power_tabs'>('power_tabs');

  // Maintain clean light mode across document
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleEnterPowerCockpit = (source: 'gas' | 'wind' | 'solar' = 'gas') => {
    onSelectFacility('power', source);
  };

  const handleEnterOilGasCockpit = () => {
    onSelectFacility('oilgas');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-start selection:bg-blue-600 selection:text-white font-sans antialiased p-4 sm:p-8 2xl:p-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto w-full space-y-8 py-6">
        
        {/* Header with Aligned Circular Back Arrow Button */}
        <div className="flex items-center justify-center gap-4 py-4 max-w-6xl mx-auto w-full">
          {viewMode === 'power_tabs' && (
            <button 
              type="button"
              onClick={() => setViewMode('catalog')}
              className="h-11 w-11 rounded-full flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Back to Catalog"
              aria-label="Back to Catalog"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-slate-900 text-center">
            Enterprise Industrial Operations Catalog
          </h1>
        </div>

        {/* VIEW 1: CATALOG OVERVIEW (Thin & Tall Cards, No White Backgrounds Below Components) */}
        {viewMode === 'catalog' && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-2 max-w-4xl mx-auto w-full">
            
            {/* Card 1: Power Generation Facility */}
            <button 
              type="button"
              onClick={() => setViewMode('power_tabs')}
              className="text-left w-full max-w-[390px] h-[580px] group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300 cursor-pointer border border-slate-300/80 hover:border-blue-500 bg-slate-950 flex flex-col justify-between shrink-0"
            >
              {/* Full Background Image */}
              <img 
                src="/images/power-plant.png" 
                alt="Power Generation Facility"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Scrim Overlay for Clean Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-slate-950/85 pointer-events-none" />

              {/* Card Content Overlay - No White Background Below Components */}
              <div className="relative z-10 p-7 flex flex-col justify-between h-full w-full">
                
                {/* Title & Description Directly on Image */}
                <div className="space-y-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-300 transition-colors drop-shadow-md">
                    Power Generation Facility
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal drop-shadow-sm">
                    Surveillance of heavy-duty gas turbines, combustor EGT thermal spread arrays, steam condenser backpressure curves, and NERC BAL-002 contingency reserve compliance.
                  </p>
                </div>

                {/* 3 Metrics Directly on Image */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">Load</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300 block mt-0.5 truncate">462.0 MW</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">Heat Rate</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-amber-300 block mt-0.5 truncate">6,820 BTU</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">Yield</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-emerald-300 block mt-0.5 truncate">+$48.6K</span>
                  </div>
                </div>

              </div>
            </button>

            {/* Card 2: Offshore Oil & Gas Production */}
            <button 
              type="button"
              onClick={handleEnterOilGasCockpit}
              className="text-left w-full max-w-[390px] h-[580px] group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300 cursor-pointer border border-slate-300/80 hover:border-emerald-500 bg-slate-950 flex flex-col justify-between shrink-0"
            >
              {/* Full Background Image */}
              <img 
                src="/images/oil-gas.png" 
                alt="Offshore Oil & Gas Production"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Scrim Overlay for Clean Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-slate-950/85 pointer-events-none" />

              {/* Card Content Overlay - No White Background Below Components */}
              <div className="relative z-10 p-7 flex flex-col justify-between h-full w-full">
                
                {/* Title & Description Directly on Image */}
                <div className="space-y-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors drop-shadow-md">
                    Offshore Oil &amp; Gas Production
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal drop-shadow-sm">
                    Subsea production wellheads, 3-phase separation trains, LP &amp; HP gas compression, 750,000 bbl cargo storage tanks, flare stack efficiency, and 16&quot; subsea pipeline export.
                  </p>
                </div>

                {/* 3 Metrics Directly on Image */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">Crude</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-emerald-300 block mt-0.5 truncate">84.2k bpd</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">Export</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-amber-300 block mt-0.5 truncate">148 MMscfd</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">CO₂e</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-blue-300 block mt-0.5 truncate">14.2 kg/boe</span>
                  </div>
                </div>

              </div>
            </button>

          </div>
        )}

        {/* VIEW 2: REVEALED POWER GENERATION MODALITIES (Pill Switcher Removed, No White Backgrounds) */}
        {viewMode === 'power_tabs' && (
          <div className="space-y-6 pt-2">

            {/* Grid of Modalities: All 3 Modalities (Gas, Wind, Solar) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
              {MODALITIES.map((modality) => (
                <button 
                  type="button"
                  key={modality.id}
                  onClick={() => handleEnterPowerCockpit(modality.id)}
                  className="text-left w-full h-[580px] group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300 cursor-pointer border border-slate-300/80 hover:border-blue-500 bg-slate-950 flex flex-col justify-between"
                >
                  {/* Full Background Image */}
                  <img 
                    src={modality.bgImage} 
                    alt={modality.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Scrim Overlay for Clean Text Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-slate-950/85 pointer-events-none" />

                  {/* Card Content Overlay - No White Background Below Components */}
                  <div className="relative z-10 p-6 flex flex-col justify-between h-full w-full">
                    
                    {/* Title & Description Directly on Image */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors drop-shadow-md">
                        {modality.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal drop-shadow-sm">
                        {modality.description}
                      </p>
                    </div>

                    {/* 3 Metrics Directly on Image */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {modality.metrics.map((metric, idx) => (
                        <div key={idx} className="p-2 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-sm">
                          <span className="text-[10px] uppercase font-bold text-slate-300 block truncate">
                            {metric.label}
                          </span>
                          <span className={`font-mono font-bold text-xs sm:text-sm ${metric.color} block mt-0.5 truncate`}>
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                </button>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
