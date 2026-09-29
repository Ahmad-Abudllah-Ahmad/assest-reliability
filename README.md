# Spark Reliability — Enterprise AI Reliability Platform (Power & Generation)

Standalone Next.js 15 enterprise platform for predictive asset reliability, multi-signal anomaly diagnosis, and condition-based maintenance optimization across power generation and grid facilities.

---

## What Spark Reliability Does

Spark Reliability continuously monitors critical plant equipment, predicts mechanical and thermal degradation mechanisms before protective relay trips occur, and guides engineering teams from detection to completed work orders.

### The Complete Traceable Workflow:
$$\text{Plant Equipment} \longrightarrow \text{Sensors \& Edge Ingestion} \longrightarrow \text{Multivariate AI Anomaly Models} \longrightarrow \text{Health \& Risk Scoring} \longrightarrow \text{Root Cause Evidence Dossier} \longrightarrow \text{Prescriptive Action} \longrightarrow \text{CMMS Work Order Execution}$$

---

## Key Enterprise UX Capabilities

1. **Executive Command Center (`/`)**:
   - 6 key reconciled KPIs: Monitored Fleet, Assets At Risk (≥ 70/100), Critical AI Alerts, Generation Capacity At Risk (MW), Predicted Downtime Avoided, Maintenance Backlog.
   - **AI Priority Action Queue**: Ranked actionable cards answering: *What is at risk? Why? How serious? What action must happen next?*
   - Real interactive action triggers: Investigate Evidence, Acknowledge, Open Case, Issue Dispatch Hold.

2. **Real-Time Live Telemetry Monitor (`/operations`)**:
   - Live streaming telemetry clock ticking with 1 Hz / 3s refresh.
   - Real-time sparkline telemetry charts for acoustic pressure, radial vibration, and top oil temperature.
   - Dynamic simulation triggers: Pause/Resume Stream, Inject Grid Transient.

3. **Asset Intelligence Registry (`/assets` & `/assets/[id]`)**:
   - Dual-view switcher: **Asset Intelligence Cards** (with failure windows, health gauges, and failure mode tags) and **Technical Telemetry Table**.
   - Full text search, multi-severity filters, and sorting by Risk, Health, Load, or MW Exposure.
   - **Asset Detail Dossier (`/assets/[id]`)**: Live sensor operating parameters with baselines, condition stress factor bars, maintenance history, and working modal to schedule CMMS work orders.

4. **AI Reliability Events & Forensic Evidence Package (`/alerts` & `/alerts/[id]`)**:
   - Filterable, searchable triage queue ranked by failure probability and curtailment impact.
   - **Deep Engineering Investigation (`/alerts/[id]`)**:
     - 24-hour multi-sensor evidence chart with dual Y-axes, safety thresholds, and explicit legends.
     - Equipment family signal breakdown (Gas Turbine, Generator, Transformer, Pump, Switchgear).
     - Probabilistic failure mode distribution (e.g. 91% Combustion Dynamic Instability, 6% Sensor Fault, 3% Transient).
     - Chronological sensor departure logs.
     - Working modals to Promote to Case and Schedule Work Order.

5. **Operational MLOps & Deployments (`/models` & `/deployments`)**:
   - Model inventory tracking Accuracy, Precision, Recall, F1 Score, and Feature Drift %.
   - Interactive SHAP feature importance breakdown and simulated retraining pipeline.
   - Realistic deployment health tracking sensor channels (Healthy, Degraded, Offline) with pipeline restart tools.

6. **Closed-Loop Maintenance Execution (`/cases` & `/work-orders` & `/optimize`)**:
   - Cases and work orders update and persist across the application in real time.
   - **Maintenance Optimization (`/optimize`)**: Decision tradeoff matrix (Effort vs. Risk) with an interactive scenario simulator demonstrating MW risk reduction from quick-win actions.

7. **Theme System**:
   - Native support for **Dark Mode** (industrial control room palette) and **Light Mode** (high-contrast office/engineering daylight palette) with instant toggle and local storage persistence.

---

## Application Routes

- `/` — Fleet reliability command center & AI priority queue
- `/operations` — Live supervisory telemetry stream & real-time transient monitor
- `/alerts` — AI reliability events triage queue
- `/alerts/[id]` — Forensic evidence package & diagnosis workflow
- `/assets` — Asset intelligence registry (Cards & Table view)
- `/assets/[id]` — Single asset dossier, operating parameters, & maintenance log
- `/cases` — Investigation cases tracking ownership and root cause
- `/work-orders` — Maintenance execution queue with material readiness & outage constraints
- `/optimize` — Maintenance optimization decision matrix & scenario simulation
- `/models` — Reliability model performance, SHAP features & retraining pipeline
- `/deployments` — Industrial edge deployment health & sensor channel diagnostics
- `/architecture` — Interactive 5-layer physical-to-operational reference architecture

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To run production build verification:
```bash
npm run build
npm start
```
