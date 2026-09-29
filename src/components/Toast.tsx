import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastItem } from '../types';

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white dark:bg-slate-900 transition transform duration-200 animate-slideDown ${
              isSuccess 
                ? 'border-emerald-200 dark:border-emerald-800 shadow-emerald-500/10' 
                : isWarning 
                ? 'border-amber-200 dark:border-amber-800 shadow-amber-500/10' 
                : 'border-blue-200 dark:border-blue-800 shadow-blue-500/10'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              {t.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
