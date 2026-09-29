"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Plant,
  Asset,
  AIAlert,
  ReliabilityModel,
  Deployment,
  CaseItem,
  WorkOrderItem,
  OptimizationRecommendation,
  plants,
  initialAssets,
  initialAlerts,
  initialModels,
  initialDeployments,
  initialCases,
  initialWorkOrders,
  initialOptimization
} from "@/lib/data";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

interface ReliabilityContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  selectedPlant: string;
  setSelectedPlant: (id: string) => void;
  plants: Plant[];
  
  assets: Asset[];
  alerts: AIAlert[];
  models: ReliabilityModel[];
  deployments: Deployment[];
  cases: CaseItem[];
  workOrders: WorkOrderItem[];
  optimization: OptimizationRecommendation[];

  // Filtered lists based on current plant
  filteredAssets: Asset[];
  filteredAlerts: AIAlert[];
  filteredWorkOrders: WorkOrderItem[];
  filteredDeployments: Deployment[];
  
  // High level KPIs
  fleetHealthScore: number;
  totalMonitoredAssets: number;
  assetsAtRiskCount: number;
  criticalAlertsCount: number;
  capacityAtRiskMW: number;
  downtimeAvoidedHours: number;
  maintenanceDueCount: number;
  liveGenerationMW: number;
  
  // Live Simulation state
  isLiveMonitoring: boolean;
  toggleLiveMonitoring: () => void;
  lastUpdatedText: string;
  liveTick: number;

  // Actions
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  promoteAlertToCase: (alertId: string, owner?: string, priority?: "P1" | "P2" | "P3", notes?: string) => string;
  createWorkOrder: (order: Omit<WorkOrderItem, "id">) => string;
  resolveCase: (caseId: string) => void;
  restartDeployment: (deploymentId: string) => void;
  retrainModel: (modelId: string) => void;
  triggerEmergencyHold: (assetId: string) => void;
}

const ReliabilityContext = createContext<ReliabilityContextType | null>(null);

export function ReliabilityProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [selectedPlant, setSelectedPlant] = useState<string>("all");
  const [isLiveMonitoring, setIsLiveMonitoring] = useState<boolean>(true);
  const [liveTick, setLiveTick] = useState<number>(0);
  const [secondsAgo, setSecondsAgo] = useState<number>(3);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core mutable state
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [alerts, setAlerts] = useState<AIAlert[]>(initialAlerts);
  const [models, setModels] = useState<ReliabilityModel[]>(initialModels);
  const [deployments, setDeployments] = useState<Deployment[]>(initialDeployments);
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>(initialWorkOrders);
  const [optimization, setOptimization] = useState<OptimizationRecommendation[]>(initialOptimization);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("spark-theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("spark-theme", nextTheme);
    } catch {}
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Toast helper
  const addToast = (title: string, message: string, type: ToastMessage["type"] = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Live simulation ticker: pulses every 5 seconds, seconds counter increments every second
  useEffect(() => {
    if (!isLiveMonitoring) return;

    // 1-second counter for "Updated X seconds ago"
    const secondTimer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);

    // 5-second telemetry pulse
    const pulseTimer = setInterval(() => {
      setLiveTick((t) => t + 1);
      setSecondsAgo(0);
    }, 5000);

    return () => {
      clearInterval(secondTimer);
      clearInterval(pulseTimer);
    };
  }, [isLiveMonitoring]);

  const toggleLiveMonitoring = () => {
    setIsLiveMonitoring((prev) => {
      const next = !prev;
      addToast(
        next ? "Continuous Monitoring Active" : "Monitoring Paused",
        next ? "Live telemetry stream is updating normally." : "Telemetry updates frozen for static review.",
        next ? "success" : "warning"
      );
      return next;
    });
  };

  const lastUpdatedText = isLiveMonitoring
    ? secondsAgo <= 1
      ? "Updated just now"
      : `Updated ${secondsAgo}s ago`
    : "Monitoring paused";

  // Filtered arrays
  const filteredAssets = useMemo(() => {
    if (selectedPlant === "all") return assets;
    return assets.filter((a) => a.plantId === selectedPlant);
  }, [assets, selectedPlant]);

  const filteredAlerts = useMemo(() => {
    if (selectedPlant === "all") return alerts;
    return alerts.filter((a) => a.plantId === selectedPlant);
  }, [alerts, selectedPlant]);

  const filteredWorkOrders = useMemo(() => {
    if (selectedPlant === "all") return workOrders;
    const plantObj = plants.find((p) => p.id === selectedPlant);
    if (!plantObj) return workOrders;
    return workOrders.filter((w) => w.plant.toLowerCase().includes(plantObj.location.toLowerCase()) || w.plant.includes(plantObj.name.split(" ")[0]));
  }, [workOrders, selectedPlant]);

  const filteredDeployments = useMemo(() => {
    if (selectedPlant === "all") return deployments;
    return deployments.filter((d) => d.plantId === selectedPlant);
  }, [deployments, selectedPlant]);

  // Executive KPIs
  const totalMonitoredAssets = filteredAssets.length;
  const assetsAtRiskCount = filteredAssets.filter((a) => a.risk >= 70).length;
  const criticalAlertsCount = filteredAlerts.filter((a) => a.severity === "Critical" && a.state !== "Resolved").length;
  const capacityAtRiskMW = filteredAssets.filter((a) => a.risk >= 70).reduce((s, a) => s + a.impactMW, 0);
  const downtimeAvoidedHours = 142;
  const maintenanceDueCount = filteredWorkOrders.filter((w) => w.status !== "Completed").length;

  const fleetHealthScore = Math.round(
    filteredAssets.reduce((sum, a) => sum + a.health, 0) / (filteredAssets.length || 1)
  );

  // Subtle realistic live variation (changes by +/- 1 MW on tick)
  const liveGenerationMW = 1084 + (liveTick % 3 === 0 ? 1 : liveTick % 3 === 1 ? -1 : 0);

  // Actions
  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, state: "Acknowledged" as const } : a))
    );
    addToast(
      "Alert Acknowledged",
      `Alert ${alertId} has been acknowledged. Notification cleared.`,
      "success"
    );
  };

  const promoteAlertToCase = (
    alertId: string,
    owner = "A. Mammadov",
    priority: "P1" | "P2" | "P3" = "P1",
    notes = "Case opened from AI alert evidence."
  ) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return "";

    const newCaseId = `CASE-${120 + cases.length}`;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")} Sep · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newCase: CaseItem = {
      id: newCaseId,
      alertId: alert.id,
      assetId: alert.asset,
      title: alert.title,
      owner,
      priority,
      status: "In Progress",
      age: "Just now",
      notes: notes || alert.action,
      createdAt: formattedDate
    };

    setCases((prev) => [newCase, ...prev]);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, state: "Case Open" as const } : a))
    );

    addToast(
      "Investigation Case Opened",
      `${newCaseId} created for ${alert.asset}. Assigned to ${owner}.`,
      "success"
    );

    return newCaseId;
  };

  const createWorkOrder = (orderData: Omit<WorkOrderItem, "id">) => {
    const newWoId = `WO-${8830 + workOrders.length}`;
    const newWorkOrder: WorkOrderItem = {
      ...orderData,
      id: newWoId
    };

    setWorkOrders((prev) => [newWorkOrder, ...prev]);
    addToast(
      "Work Order Scheduled",
      `${newWoId} created for ${newWorkOrder.assetId}: "${newWorkOrder.task}". Due ${newWorkOrder.due}.`,
      "success"
    );

    return newWoId;
  };

  const resolveCase = (caseId: string) => {
    const c = cases.find((x) => x.id === caseId);
    if (!c) return;

    setCases((prev) =>
      prev.map((item) => (item.id === caseId ? { ...item, status: "Resolved" as const } : item))
    );

    if (c.alertId) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === c.alertId ? { ...a, state: "Resolved" as const } : a))
      );
    }

    addToast(
      "Investigation Resolved",
      `${caseId} marked as completed. Associated alert closed.`,
      "success"
    );
  };

  const restartDeployment = (deploymentId: string) => {
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === deploymentId
          ? {
              ...d,
              state: "Running" as const,
              freshness: "Just now",
              quality: Math.min(99.5, d.quality + 2.5),
              sensorStatus: {
                ...d.sensorStatus,
                healthy: d.sensorStatus.total,
                degraded: 0,
                offline: 0
              }
            }
          : d
      )
    );
    addToast(
      "Inference Stream Restored",
      `Deployment ${deploymentId} re-connected. All sensors operational.`,
      "success"
    );
  };

  const retrainModel = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: "Retraining" as const } : m))
    );
    addToast(
      "Model Retraining Started",
      `Model ${modelId} training pipeline submitted.`,
      "info"
    );

    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === modelId
            ? {
                ...m,
                status: "Healthy" as const,
                drift: Math.max(0.8, Number((m.drift * 0.35).toFixed(1))),
                accuracy: Math.min(99.0, Number((m.accuracy + 1.2).toFixed(1))),
                precision: Math.min(98.5, Number((m.precision + 1.5).toFixed(1))),
                updated: "Just now"
              }
            : m
        )
      );
      addToast(
        "Retraining Completed",
        `Model ${modelId} validation passed. Accuracy improved.`,
        "success"
      );
    }, 2800);
  };

  const triggerEmergencyHold = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId ? { ...a, load: Math.max(50, Math.round(a.load * 0.85)) } : a
      )
    );

    addToast(
      "Generation Output Reduced",
      `Reduced load on ${assetId} to 80% to protect equipment from overheating.`,
      "warning"
    );
  };

  return (
    <ReliabilityContext.Provider
      value={{
        theme,
        toggleTheme,
        selectedPlant,
        setSelectedPlant,
        plants,
        assets,
        alerts,
        models,
        deployments,
        cases,
        workOrders,
        optimization,
        filteredAssets,
        filteredAlerts,
        filteredWorkOrders,
        filteredDeployments,
        fleetHealthScore,
        totalMonitoredAssets,
        assetsAtRiskCount,
        criticalAlertsCount,
        capacityAtRiskMW,
        downtimeAvoidedHours,
        maintenanceDueCount,
        liveGenerationMW,
        isLiveMonitoring,
        toggleLiveMonitoring,
        lastUpdatedText,
        liveTick,
        toasts,
        addToast,
        removeToast,
        acknowledgeAlert,
        promoteAlertToCase,
        createWorkOrder,
        resolveCase,
        restartDeployment,
        retrainModel,
        triggerEmergencyHold
      }}
    >
      {children}
    </ReliabilityContext.Provider>
  );
}

export function useReliability() {
  const ctx = useContext(ReliabilityContext);
  if (!ctx) {
    throw new Error("useReliability must be used within a ReliabilityProvider");
  }
  return ctx;
}
