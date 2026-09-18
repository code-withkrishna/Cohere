# COHERE

## Critical Component & Production Continuity Engine

COHERE is an agentic supply-chain resilience engine for SAP Hackfest 2026. It protects production continuity when critical component disruptions occur across multi-plant manufacturing environments through a deterministic five-stage recovery lifecycle:

**01 Sense → 02 Trace → 03 Simulate → 04 Govern → 05 Verify**

---

### Demo Scenario

An electronics manufacturer loses access to critical component **MC-204 (Control Processor)** from its primary supplier (**Alpha Components**) for **18 days**. 

COHERE:
1. **Senses** normal manufacturing operations and component inventory baselines.
2. **Traces** the disruption blast radius across Bill-of-Materials (BOM-204), exposed assembly plants (Chennai-01, Hyderabad-02, Bengaluru-03), and 4 customer orders totaling ₹58.7 lakh in order value.
3. **Simulates** deterministic recovery options (Wait for Supplier, Switch to Alternate Beta Components, Transfer Inventory from Hyderabad-02 to Chennai-01, Component Substitution) and identifies the optimal strategy with positive runway buffer (+1.4 days).
4. **Governs** high-impact interventions through an explicit **Human Approval Gate** before any procurement or inventory movements occur.
5. **Verifies** post-execution Digital Twin state (Chennai-01 runway restored 3.4d → 5.4d; Hyderabad-02 balanced 8.2d → 6.2d; 4/4 orders protected; continuity status marked **PROTECTED**) and records an immutable backend audit trail.

---

### System Architecture

```
                                 COHERE PLATFORM
                                 
   ┌────────────────────────────────────────────────────────────────────────┐
   │                       Google Stitch Presentation Layer                 │
   │               (React 18 • TypeScript • Tailwind CSS • Vite)            │
   │                                                                        │
   │   [01 SENSE]  →  [02 TRACE]  →  [03 SIMULATE]  →  [04 GOVERN]  →  [05 VERIFY]
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ REST API (/api/*)
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                           FastAPI Backend                              │
   │                                                                        │
   │   • Disruption Simulation Engine        • Deterministic Recovery Math  │
   │   • Multi-tier Dependency Graph         • Policy & Compliance Checks   │
   │   • Human Approval Authorization Gate   • Digital Twin State Manager   │
   │   • Synchronized Audit Logging Engine   • Idempotent Execution         │
   └────────────────────────────────────────────────────────────────────────┘
```

- **Backend**: Python 3.11+ / FastAPI with deterministic business logic.
- **Frontend**: Google Stitch-designed UI with dark navy aesthetic, mint green accents, interactive topology matrices, scenario cards, and Digital Twin transformation views.
- **Unified Single-Server Deployment**: FastAPI serves the compiled React application directly from `frontend/dist` on port 8000.

---

### Getting Started

#### Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- Node.js 18+ and npm

#### 1. Quick Start (Single Command - Backend & Frontend)

```bash
# 1. Build the frontend (one time or after frontend edits)
cd frontend
npm install
npm run build
cd ..

# 2. Run the FastAPI application
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Open your browser at **http://127.0.0.1:8000**

---

#### 2. Frontend Development Mode (Vite Hot-Reload)

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn main:app --port 8000

# Terminal 2: Frontend Dev Server (Proxies /api -> localhost:8000)
cd frontend
npm run dev
```

Open your browser at **http://localhost:3000**

---

### Running Verification Tests

#### Backend Automated Test Suite
```bash
cd backend
pytest -v
```
All 9 test suites validate:
- Disruption impact and dependency graph creation
- Deterministic runway and recovery buffer arithmetic
- Feasibility constraints and recommendation ranking
- Human approval authorization enforcement
- Digital Twin transformation accuracy
- Idempotent recovery execution protection
- Demo state reset

#### Frontend Build & Type Check
```bash
cd frontend
npm run build
npm run lint
```

---

### Core Design Principles

1. **Deterministic Core**: Arithmetic calculations (runway days, recovery buffers, financial exposure, inventory transfers) are strictly deterministic and enforced by the backend engine.
2. **Human-in-the-Loop Governance**: Real operational interventions pause at an explicit approval gate before execution can proceed.
3. **Idempotency**: Execution requests are strictly idempotent to prevent duplicate order dispatches or corrupted twin states.
4. **Transparent Audit Trail**: Every event across detection, tracing, simulation, governance, and execution is recorded with timestamps and responsible agent actors.

---

> **Hackfest Disclosure**: Prototype developed for SAP Hackfest 2026. Uses synthetic manufacturing matrices and deterministic simulation data; no live SAP production credentials or sensitive enterprise customer data are accessed.
