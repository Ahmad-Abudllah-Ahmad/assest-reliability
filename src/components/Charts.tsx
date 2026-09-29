"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  AreaChart,
  Area,
  Legend,
  Cell
} from "recharts";
import { 
  portfolioTrendData, 
  signalEvidenceData, 
  OptimizationRecommendation,
  Asset
} from "@/lib/data";
import { useReliability } from "@/context/ReliabilityContext";

const gridColor = "var(--chart-grid)";
const axisColor = "var(--chart-axis)";

const tooltipStyle = {
  backgroundColor: "var(--chart-tooltip-bg)",
  borderColor: "var(--chart-tooltip-border)",
  borderRadius: "10px",
  color: "var(--text)",
  fontSize: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  padding: "10px 14px"
};

// Color helper based on risk / status
function getRiskColor(risk: number) {
  if (risk >= 85) return "#f43f5e"; // red
  if (risk >= 70) return "#f59e0b"; // amber
  if (risk >= 50) return "#38bdf8"; // blue
  return "#10b981"; // green
}

function getStatusColor(status: string) {
  switch (status) {
    case "Critical": return "#f43f5e";
    case "High": return "#f59e0b";
    case "Watch": return "#38bdf8";
    case "Nominal": return "#10b981";
    default: return "#38bdf8";
  }
}

// 1. Risk Exposure Horizontal Bar Chart
export function RiskExposureChart() {
  const { filteredAssets } = useReliability();
  const sorted = [...filteredAssets].sort((a, b) => b.risk - a.risk);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 24, top: 10, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis 
          type="number" 
          domain={[0, 100]} 
          tick={{ fill: axisColor, fontSize: 11 }} 
          axisLine={false} 
          tickLine={false}
          unit="%"
        />
        <YAxis 
          type="category" 
          dataKey="id" 
          width={60} 
          tick={{ fill: axisColor, fontSize: 11, fontWeight: 600 }} 
          axisLine={false} 
          tickLine={false}
        />
        <Tooltip 
          contentStyle={tooltipStyle} 
          formatter={(v: any, _: any, item: any) => [
            `${v}% Risk (${item.payload.impactMW} MW exposure)`, 
            item.payload.name
          ]}
        />
        <ReferenceLine x={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "High Risk Threshold", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} />
        <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
          {sorted.map((entry) => (
            <Cell key={entry.id} fill={getRiskColor(entry.risk)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// 2. Health vs Load Scatter Plot (With Color-Coded Dots & Real Names)
export function HealthLoadScatter() {
  const { filteredAssets } = useReliability();

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as Asset;
      return (
        <div style={tooltipStyle}>
          <div className="font-bold text-[var(--text)]">{data.id} · {data.name}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{data.plant} ({data.family})</div>
          <div className="mt-2 space-y-1 text-xs border-t border-[var(--panel-border)] pt-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Operating Load:</span>
              <span className="font-semibold text-white">{data.load}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Asset Health:</span>
              <span className="font-semibold" style={{ color: getRiskColor(100 - data.health) }}>
                {data.health}/100 ({data.status})
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Generation Exposure:</span>
              <span className="font-semibold text-[var(--teal)]">{data.impactMW} MW</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid stroke={gridColor} />
        <XAxis 
          type="number" 
          dataKey="load" 
          name="Load" 
          unit="%" 
          domain={[60, 100]} 
          tick={{ fill: axisColor, fontSize: 11 }} 
          label={{ value: "Operating Load (%)", position: "insideBottom", offset: -5, fill: axisColor, fontSize: 11 }}
        />
        <YAxis 
          type="number" 
          dataKey="health" 
          name="Health" 
          unit="/100" 
          domain={[40, 100]} 
          tick={{ fill: axisColor, fontSize: 11 }} 
          label={{ value: "Health Index (/100)", angle: -90, position: "insideLeft", offset: 12, fill: axisColor, fontSize: 11 }}
        />
        <ZAxis type="number" dataKey="impactMW" range={[120, 600]} name="MW Exposure" />
        <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
        <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Health Warning Band", fill: "#f59e0b", fontSize: 10 }} />
        <ReferenceLine x={85} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: "Baseload Range (> 85%)", fill: "#38bdf8", fontSize: 10 }} />
        <Scatter data={filteredAssets}>
          {filteredAssets.map((entry) => (
            <Cell key={entry.id} fill={getStatusColor(entry.status)} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// 3. 14-Day Fleet Reliability & MW Exposure Trend
export function PortfolioTrend() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={portfolioTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} />
        <YAxis 
          yAxisId="left" 
          tick={{ fill: axisColor, fontSize: 11 }} 
          axisLine={false} 
          unit=" MW"
          domain={[250, 550]}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          domain={[0, 6]} 
          tick={{ fill: axisColor, fontSize: 11 }} 
          axisLine={false} 
          label={{ value: "High Risk Count", angle: 90, position: "insideRight", offset: 10, fill: axisColor, fontSize: 10 }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "var(--text-muted)" }} />
        <Area 
          yAxisId="left" 
          type="monotone" 
          dataKey="exposureMW" 
          stroke="#f43f5e" 
          fill="url(#exposureGradient)" 
          strokeWidth={2.5} 
          name="Generation Capacity at Risk (MW)" 
        />
        <Line 
          yAxisId="right" 
          type="stepAfter" 
          dataKey="highRiskAssets" 
          stroke="#34d399" 
          strokeWidth={2.5} 
          dot={{ r: 3, fill: "#34d399" }} 
          name="High-Risk Assets" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// 4. Evidence Package Multi-Signal Chart with Legend & Thresholds
export function EvidenceChart({
  primarySignal = "Vibration mm/s",
  secondarySignal = "Exhaust Spread °C"
}: {
  primarySignal?: string;
  secondarySignal?: string;
}) {
  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={signalEvidenceData} margin={{ top: 15, right: 24, left: 0, bottom: 5 }}>
          <CartesianGrid stroke={gridColor} />
          <XAxis dataKey="time" tick={{ fill: axisColor, fontSize: 11 }} />
          <YAxis 
            yAxisId="v" 
            domain={[0, 7.5]} 
            tick={{ fill: axisColor, fontSize: 11 }}
            unit=" mm/s"
            label={{ value: primarySignal, angle: -90, position: "insideLeft", offset: 12, fill: "#38bdf8", fontSize: 11 }}
          />
          <YAxis 
            yAxisId="t" 
            orientation="right" 
            domain={[10, 55]} 
            tick={{ fill: axisColor, fontSize: 11 }}
            unit=" °C"
            label={{ value: secondarySignal, angle: 90, position: "insideRight", offset: 12, fill: "#f59e0b", fontSize: 11 }}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: "11px" }} />
          <ReferenceLine 
            yAxisId="v" 
            y={2.8} 
            stroke="#f43f5e" 
            strokeDasharray="4 4" 
            label={{ value: "Vibration Trip Limit (2.8 mm/s)", fill: "#f43f5e", fontSize: 10, position: "insideTopLeft" }} 
          />
          <ReferenceLine 
            yAxisId="t" 
            y={22.0} 
            stroke="#f59e0b" 
            strokeDasharray="4 4" 
            label={{ value: "Exhaust Spread Limit (22°C)", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} 
          />
          <Line 
            yAxisId="v" 
            type="monotone" 
            dataKey="vibration" 
            stroke="#38bdf8" 
            strokeWidth={2.4} 
            dot={false} 
            name="Vibration (mm/s)" 
          />
          <Line 
            yAxisId="t" 
            type="monotone" 
            dataKey="exhaustSpread" 
            stroke="#f59e0b" 
            strokeWidth={2.4} 
            dot={false} 
            name="Exhaust Spread (°C)" 
          />
          <Line 
            yAxisId="t" 
            type="monotone" 
            dataKey="bearingTemp" 
            stroke="#e879f9" 
            strokeWidth={1.8} 
            strokeDasharray="3 3"
            dot={false} 
            name="Bearing Temp (°C)" 
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-2 pt-1 border-t border-[var(--panel-border-subtle)]">
        <span>Anomaly Window: 17:00 – Present (+42% dynamic departure)</span>
        <span className="font-semibold text-rose-500">Persistent Uncharacteristic Oscillation</span>
      </div>
    </div>
  );
}

// 5. Maintenance Optimization Decision Scatter Matrix
export function OptimizeScatter() {
  const { optimization } = useReliability();

  const CustomOptimizeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as OptimizationRecommendation;
      return (
        <div style={tooltipStyle}>
          <div className="font-bold text-[var(--text)]">{data.assetId} · {data.assetName}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{data.plant} — {data.category}</div>
          <div className="mt-2 space-y-1 text-xs border-t border-[var(--panel-border)] pt-1.5">
            <div><span className="text-[var(--text-muted)]">Recommendation: </span><span className="font-medium text-white">{data.recommendation}</span></div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">Maintenance Effort:</span>
              <span className="font-semibold text-white">{data.effortHours} hours</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">Risk Index:</span>
              <span className="font-semibold text-rose-400">{data.risk}/100</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">MW Exposure:</span>
              <span className="font-semibold text-[var(--teal)]">{data.exposureMW} MW</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">Downtime Avoided:</span>
              <span className="font-semibold text-emerald-400">{data.downtimeHoursAvoided} h (${(data.financialRiskUSD / 1000).toFixed(0)}k)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 15, right: 24, bottom: 12, left: 0 }}>
        <CartesianGrid stroke={gridColor} />
        <XAxis 
          type="number" 
          dataKey="effortHours" 
          name="Maintenance Effort" 
          unit=" h" 
          domain={[0, 8]}
          tick={{ fill: axisColor, fontSize: 11 }}
          label={{ value: "Maintenance Effort (Hours)", position: "insideBottom", offset: -5, fill: axisColor, fontSize: 11 }}
        />
        <YAxis 
          type="number" 
          dataKey="risk" 
          name="Risk" 
          unit="%" 
          domain={[55, 100]} 
          tick={{ fill: axisColor, fontSize: 11 }}
          label={{ value: "Failure Risk (%)", angle: -90, position: "insideLeft", offset: 12, fill: axisColor, fontSize: 11 }}
        />
        <ZAxis type="number" dataKey="exposureMW" range={[150, 650]} name="MW Exposure" />
        <Tooltip content={<CustomOptimizeTooltip />} cursor={{ strokeDasharray: "3 3" }} />
        <ReferenceLine x={3.0} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: "Quick-Win Boundary (< 3h)", fill: "#38bdf8", fontSize: 10 }} />
        <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "Critical Risk Threshold", fill: "#f43f5e", fontSize: 10 }} />
        <Scatter data={optimization}>
          {optimization.map((entry) => (
            <Cell key={entry.assetId} fill={entry.effortHours <= 3 ? "#34d399" : "#f43f5e"} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// 6. Live Telemetry Streaming Sparkline Chart
export function LiveTelemetryChart({
  data,
  dataKey,
  color = "#34d399",
  unit = ""
}: {
  data: any[];
  dataKey: string;
  color?: string;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="2 2" />
        <XAxis dataKey="time" tick={{ fill: axisColor, fontSize: 10 }} />
        <YAxis tick={{ fill: axisColor, fontSize: 10 }} domain={["auto", "auto"]} unit={unit} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2.5} 
          dot={{ r: 3, fill: color }} 
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// 7. Mini Condition Factor Bar Chart for Asset Detail
export function MiniBars({ data }: { data: { name: string; value: number; unit?: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }} />
        <YAxis tick={{ fill: axisColor, fontSize: 11 }} domain={[0, 100]} unit="%" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Condition Stress"]} />
        <Bar dataKey="value" radius={[5, 5, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={`bar-${idx}`} fill={getRiskColor(entry.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
