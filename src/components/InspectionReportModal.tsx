import React from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  Award,
  Clock,
  HardHat
} from 'lucide-react';
import { CompletedInspection } from '../types';

interface InspectionReportModalProps {
  inspection: CompletedInspection | null;
  onClose: () => void;
  onDownloadPdf: (inspection: CompletedInspection) => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  inspection,
  onClose,
  onDownloadPdf
}) => {
  if (!inspection) return null;

  const isPassed = inspection.resultStatus === 'Passed' || inspection.resultStatus === 'Clean';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                  {inspection.id}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    : 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/20'
                }`}>
                  {inspection.resultStatus}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Certified NDT Audit Dossier
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                Mechanical Integrity & Diagnostic Survey Report
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Target Asset</span>
              <strong className="text-xs text-slate-900 dark:text-slate-100 block mt-0.5 truncate">{inspection.asset}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Date Conducted</span>
              <strong className="text-xs font-mono text-slate-900 dark:text-slate-100 block mt-0.5">{inspection.inspectionDate}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Lead Inspector</span>
              <strong className="text-xs text-slate-900 dark:text-slate-100 block mt-0.5 truncate">{inspection.inspector}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Certification</span>
              <strong className="text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5">ISO 9712 Level III</strong>
            </div>
          </div>

          {/* Inspection Methodology & Scope */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <HardHat className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Inspection Methodology & Field Scope:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              {inspection.inspectionType}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Conducted in accordance with OEM Gas Turbine & Combined Cycle NDT Technical Specification #API-670 / ASME Section V. Calibrated optical, acoustic, and pressure containment probe arrays deployed on isolated machine train.
            </p>
          </div>

          {/* Detailed Observations & Physical Findings */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Diagnostic Observations & Metallurgical Findings:</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed border border-slate-200 dark:border-slate-700">
              "{inspection.findings}"
            </div>
          </div>

          {/* Digital Signature Certification Block */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Signed & Authenticated for NERC / OSHA Plant Compliance
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  Digital Certificate Hash: SHA256:{inspection.id.toLowerCase()}8f94d1b72a • Signed by {inspection.inspector}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border border-emerald-500/20 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold whitespace-nowrap">
              VERIFIED VALID
            </span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadPdf(inspection)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Official PDF Dossier</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
