import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/20'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/20'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/20'
                : 'bg-slate-900/95 border-blue-500/40 text-slate-100 shadow-blue-950/20'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {isWarning && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="h-4 w-4 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-semibold text-white truncate">
                  {toast.title}
                </h4>
                <span className="text-[10px] text-gray-500 font-mono">
                  {toast.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-200 p-0.5 rounded transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
