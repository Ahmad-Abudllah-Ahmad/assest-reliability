"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReliability } from "@/context/ReliabilityContext";
import { ToastContainer } from "@/components/UI";
import {
  Gauge,
  Activity,
  AlertOctagon,
  Cpu,
  FileText,
  Wrench,
  Sliders,
  Layers,
  Database,
  Settings,
  Sun,
  Moon,
  ChevronRight,
  ShieldAlert
} from "@/components/Icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeTone?: "red" | "amber" | "blue";
}

const PIN_STORAGE_KEY = "spark-sidebar-pinned";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    theme,
    toggleTheme,
    selectedPlant,
    setSelectedPlant,
    plants,
    alerts,
    cases,
    assetsAtRiskCount,
    isLiveMonitoring,
    toggleLiveMonitoring,
    lastUpdatedText
  } = useReliability();

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load pinned state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PIN_STORAGE_KEY);
      if (saved === "true") {
        setPinned(true);
      }
    } catch {}
  }, []);

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem(PIN_STORAGE_KEY, String(next));
    } catch {}
  };

  const isExpanded = pinned || hovered;

  const activeAlertsCount = alerts.filter((a) => a.state !== "Acknowledged" && a.state !== "Resolved").length;
  const activeCasesCount = cases.filter((c) => c.status !== "Resolved").length;

  const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
    {
      title: "Operations",
      items: [
        { href: "/", label: "Plant Overview", icon: <Gauge className="w-4 h-4" /> },
        { href: "/operations", label: "Live Telemetry", icon: <Activity className="w-4 h-4" /> },
        { href: "/alerts", label: "AI Reliability Alerts", icon: <AlertOctagon className="w-4 h-4" />, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined, badgeTone: "red" },
        { href: "/assets", label: "Equipment Health", icon: <Cpu className="w-4 h-4" /> }
      ]
    },
    {
      title: "Maintenance & Planning",
      items: [
        { href: "/cases", label: "Investigation Cases", icon: <FileText className="w-4 h-4" />, badge: activeCasesCount > 0 ? activeCasesCount : undefined, badgeTone: "blue" },
        { href: "/work-orders", label: "Work Orders Queue", icon: <Wrench className="w-4 h-4" /> },
        { href: "/optimize", label: "Maintenance Optimization", icon: <Sliders className="w-4 h-4" /> }
      ]
    },
    {
      title: "System & Models",
      items: [
        { href: "/models", label: "Reliability AI Models", icon: <Layers className="w-4 h-4" /> },
        { href: "/deployments", label: "Sensor Deployments", icon: <Database className="w-4 h-4" /> },
        { href: "/architecture", label: "System Design", icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation:
          - Unpinned: 68px icon rail. On hover, smoothly expands to 240px floating over content.
          - Pinned: stays 240px wide and smoothly offsets layout.
      */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--panel-border)] bg-[var(--panel)] transition-all duration-250 ease-out ${
          isExpanded
            ? "w-[240px] shadow-2xl"
            : "w-[68px]"
        } ${mobileOpen ? "translate-x-0 !w-[260px]" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--panel-border)] shrink-0">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--teal)] text-[#05201d] font-black text-sm shadow-sm">
              SR
            </div>
            {isExpanded && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="text-xs font-black tracking-wider text-[var(--teal)] uppercase">
                  SPARK RELIABILITY
                </div>
                <div className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Power & Generation
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-[var(--text-muted)] hover:text-white"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* High Risk Callout (Expanded only) */}
        {isExpanded && assetsAtRiskCount > 0 && (
          <div className="m-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="label text-[10px] text-rose-300">Attention Required</span>
              <span className="h-2 w-2 rounded-full bg-rose-500 pulse-dot" />
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <div className="kpi text-lg font-black text-white">
                {assetsAtRiskCount} <span className="text-xs font-normal text-rose-200">at-risk units</span>
              </div>
              <Link href="/alerts" className="text-xs text-[var(--teal)] hover:underline font-bold">
                Review →
              </Link>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 space-y-4 px-2.5 py-3 overflow-y-auto overflow-x-hidden" aria-label="Main Navigation">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx}>
              {isExpanded && (
                <div className="px-2 mb-1 label text-[10px] text-[var(--text-dim)] font-bold">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={!isExpanded ? item.label : undefined}
                      className={`flex items-center ${
                        isExpanded ? "justify-between" : "justify-center"
                      } rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                        active
                          ? "bg-[var(--teal)]/15 text-[var(--teal-text)] border border-[var(--teal)]/30 font-bold"
                          : "text-[var(--text-muted)] hover:bg-[var(--panel-hover)] hover:text-[var(--text)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={active ? "text-[var(--teal)]" : "text-[var(--text-dim)] shrink-0"}>
                          {item.icon}
                        </span>
                        {isExpanded && <span className="truncate">{item.label}</span>}
                      </div>

                      {isExpanded && item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                            item.badgeTone === "red"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : item.badgeTone === "amber"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="border-t border-[var(--panel-border)] p-2.5 space-y-2 bg-[var(--bg-subtle)] shrink-0">
          <div className="flex items-center justify-between gap-1.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--panel-hover)] transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
              {isExpanded && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
            </button>

            {/* Desktop Pin / Unpin Button */}
            <button
              onClick={togglePin}
              className={`hidden lg:flex items-center justify-center rounded-lg border p-2 text-xs transition-colors ${
                pinned
                  ? "bg-[var(--teal)]/15 border-[var(--teal)] text-[var(--teal-text)]"
                  : "border-[var(--panel-border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              title={pinned ? "Sidebar is pinned (stays expanded)" : "Pin sidebar to keep expanded"}
            >
              <span className="text-[11px] font-bold">{pinned ? "Pinned" : "Pin"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          pinned ? "lg:pl-[240px]" : "lg:pl-[68px]"
        }`}
      >
        {/* Clean Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--panel-border)] bg-[var(--panel)]/95 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg border border-[var(--panel-border)] p-2 text-[var(--text-muted)]"
              aria-label="Open mobile menu"
            >
              ☰
            </button>

            {/* Live Monitoring Indicator & Natural Ticking Clock */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleLiveMonitoring}
                className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs hover:border-[var(--teal)] transition-colors"
                title={isLiveMonitoring ? "Click to pause updates" : "Click to resume live updates"}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLiveMonitoring ? "bg-emerald-500 pulse-dot" : "bg-amber-500"
                  }`}
                />
                <span className="font-bold text-[var(--text)] text-[11px]">
                  {isLiveMonitoring ? "Monitoring Active" : "Paused"}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                  · {lastUpdatedText}
                </span>
              </button>
            </div>
          </div>

          {/* Plant Selector & Open Alerts Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Functional Plant Filter */}
            <select
              aria-label="Filter Generation Plant"
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--teal)] cursor-pointer"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--panel)] text-[var(--text)]">
                  {p.name}
                </option>
              ))}
            </select>

            {/* Quick Action Link */}
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all whitespace-nowrap"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{activeAlertsCount} Alerts</span>
            </Link>
          </div>
        </header>

        {/* Page Main View */}
        <main className="grid-bg flex-1 p-4 lg:p-6 min-w-0">
          {children}
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
