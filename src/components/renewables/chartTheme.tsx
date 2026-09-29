import React from 'react';

export const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderColor: '#334155',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#f8fafc',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
};

export function MiniSpark({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = 72;
  const h = 22;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - 2 - ((v - min) / (max - min || 1)) * (h - 4);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export function severityPill(severity: string) {
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-bold';
  if (s === 'HIGH') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-bold';
  if (s === 'MEDIUM') return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20 font-semibold';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-medium';
}

export function heatCell(ok: boolean, warn: boolean, crit: boolean) {
  if (crit) return 'bg-rose-500/80 text-white';
  if (warn) return 'bg-amber-400/80 text-amber-950';
  if (ok) return 'bg-emerald-500/70 text-white';
  return 'bg-slate-200 dark:bg-slate-700 text-slate-600';
}
