"use client";

import React from "react";
import Link from "next/link";
import { Severity } from "@/lib/data";
import { useReliability } from "@/context/ReliabilityContext";
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  X,
  TrendingUp,
  TrendingDown
} from "@/components/Icons";

export function PageTitle({
  eyebrow,
  title,
  body,
  action,
  liveBadge
}: {
  eyebrow?: string;
  title: string;
  body: string;
  action?: React.ReactNode;
  liveBadge?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[var(--panel-border)] pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          {eyebrow && <span className="label text-[var(--teal)]">{eyebrow}</span>}
          {liveBadge && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
              LIVE TELEMETRY
            </span>
          )}
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
          {body}
        </p>
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Metric({
  label,
  value,
  unit,
  detail,
  tone = "teal",
  trend,
  icon
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail: string;
  tone?: "teal" | "red" | "amber" | "blue" | "green";
  trend?: { text: string; positive?: boolean };
  icon?: React.ReactNode;
}) {
  const toneColor = {
    teal: "var(--teal)",
    red: "var(--red)",
    amber: "var(--amber)",
    blue: "var(--blue)",
    green: "var(--green)"
  }[tone];

  return (
    <div className="card p-4 flex flex-col justify-between hover:border-[var(--text-dim)] transition-colors">
      <div>
        <div className="flex items-center justify-between">
          <span className="label">{label}</span>
          <div className="flex items-center gap-1.5">
            {icon && <span className="text-[var(--text-muted)]">{icon}</span>}
            <span className="h-2 w-2 rounded-full" style={{ background: toneColor }} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="kpi text-3xl font-bold text-[var(--text)] tracking-tight">{value}</span>
          {unit && <span className="text-sm font-semibold text-[var(--text-muted)]">{unit}</span>}
        </div>
      </div>
      <div className="mt-3 pt-2.5 border-t border-[var(--panel-border-subtle)] flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)] leading-normal line-clamp-1">{detail}</p>
        {trend && (
          <span className={`text-[11px] font-semibold flex items-center gap-0.5 ml-2 shrink-0 ${trend.positive ? "text-emerald-500" : "text-amber-500"}`}>
            {trend.positive ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function Status({ s }: { s: Severity }) {
  const icon = {
    Critical: <AlertOctagon className="w-3 h-3" />,
    High: <AlertTriangle className="w-3 h-3" />,
    Watch: <Activity className="w-3 h-3" />,
    Nominal: <CheckCircle2 className="w-3 h-3" />
  }[s];

  const cls = {
    Critical: "badge-critical",
    High: "badge-high",
    Watch: "badge-watch",
    Nominal: "badge-nominal"
  }[s];

  return (
    <span className={`badge ${cls}`}>
      {icon}
      {s}
    </span>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  action
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-[var(--panel-border)] px-4 py-3.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--teal)] px-3.5 py-2 text-xs font-bold text-[#05201d] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--panel-hover)] hover:border-[var(--text-dim)] disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

export function PrimaryLink({
  href,
  children,
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--teal)] px-3.5 py-2 text-xs font-bold text-[#05201d] transition-all hover:brightness-110 active:scale-95 ${className}`}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--panel-hover)] hover:border-[var(--text-dim)] ${className}`}
    >
      {children}
    </Link>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative z-10 w-full max-w-xl rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-[var(--panel-border)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text)]">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--panel-hover)] hover:text-[var(--text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useReliability();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const borderCls = {
          success: "border-emerald-500/40 bg-emerald-950/90 text-emerald-200",
          info: "border-sky-500/40 bg-sky-950/90 text-sky-200",
          warning: "border-amber-500/40 bg-amber-950/90 text-amber-200",
          error: "border-rose-500/40 bg-rose-950/90 text-rose-200"
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all ${borderCls}`}
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold">{toast.title}</div>
              <div className="mt-0.5 text-xs opacity-90 leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded p-1 opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
