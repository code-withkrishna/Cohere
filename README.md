# COHERE

## Critical Component & Production Continuity Engine

COHERE is an agentic supply-chain resilience engine for SAP Hackfest 2026. It protects manufacturing production continuity when critical component disruptions occur across multi-plant manufacturing environments through a deterministic five-stage recovery lifecycle:

**01 Sense → 02 Trace → 03 Simulate → 04 Govern → 05 Verify**

---

### Demo Scenario: Toyota × DENSO Contextualized Synthetic Demonstration

> **IMPORTANT DISCLAIMER — SIMULATED SCENARIO • SYNTHETIC DATA**  
> Real company relationships (**Toyota Motor Corporation** as OEM/Customer and **DENSO** as primary Tier-1 supplier) are used **only as contextual grounding** so evaluators and operators immediately grasp the multi-tier automotive supply-chain scenario. The disruption, component identifier (`VCP-204`), assembly plants, order values, recovery options, and operational metrics shown in the prototype are **synthetic demonstration data**.  
> *Do not interpret this scenario as an actual event experienced by Toyota Motor Corporation or DENSO.*

#### Scenario Flow:
1. **Sense**: Senses normal Toyota vehicle assembly operations across plants (Chennai-01 baseline 3.4d, Hyderabad-02 baseline 8.2d).
2. **Trace**: Senses simulated Tier-1 supplier disruption (**DENSO** unavailable for **VCP-204 — Vehicle Control Processor** for 18 days). Traces blast radius through **V-BOM-204 (Vehicle Control Assembly)** to assembly plant **Chennai-01** (3.4-day runway to line stop) and 4 committed customer production orders totaling **₹58.7 lakh** in synthetic exposure.
3. **Simulate**: Deterministic scenario engine evaluates 4 recovery options (Wait for DENSO, Switch to Alternate Supplier Beta Components, Transfer Inventory from Hyderabad-02 to Chennai-01, Use VCP-204B Substitute). Identifies **Transfer Inventory** as optimal feasible recommendation with **+1.4 days** recovery buffer (3.4d runway − 2.0d transfer time = +1.4d).
4. **Govern**: Enforces a strict **Human Approval Gate** before executing any procurement, logistics, or inventory movements.
5. **Verify**: Verifies post-execution Digital Twin transformation (Chennai-01 runway: 3.4d → 5.4d; Hyderabad-02 runway: 8.2d → 6.2d; 4/4 orders protected; continuity status: **PROTECTED**) and records an immutable backend audit trail.

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

- **Backend**: Python 3.11+ / FastAPI with deterministic business rules and digital twin state manager.
- **Frontend**: Google Stitch-designed UI with dark navy aesthetic, mint green accents, interactive topology matrices, scenario cards, and Digital Twin transformation views.
- **Enterprise Direction**: SAP operational data + events (conceptual alignment with SAP IBP, SAP S/4HANA, SAP Transportation Management, and SAP Business Network / Ariba).
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
- Disruption impact and dependency graph creation (`DENSO` → `VCP-204` → `V-BOM-204` → `PL-01` → orders)
- Deterministic runway and recovery buffer arithmetic (`3.4 - 2.0 = +1.4 days`)
- Feasibility constraints and recommendation ranking
- Human approval authorization enforcement
- Digital Twin transformation accuracy (`Chennai: 5.4d`, `Hyderabad: 6.2d`, `4/4 orders protected`)
- Idempotent recovery execution protection
- Demo state reset

#### Frontend Build & Type Check
```bash
cd frontend
npm run build
```

---

### Core Design Principles

1. **Deterministic Core**: Arithmetic calculations (runway days, recovery buffers, financial exposure, inventory transfers) are strictly deterministic and enforced by the backend engine.
2. **Human-in-the-Loop Governance**: Real operational interventions pause at an explicit approval gate before execution can proceed.
3. **Idempotency**: Execution requests are strictly idempotent to prevent duplicate order dispatches or corrupted twin states.
4. **Transparent Audit Trail**: Every event across detection, tracing, simulation, governance, and execution is recorded with timestamps and responsible agent actors.

---

> **Hackfest Disclosure**: Prototype developed for SAP Hackfest 2026. Real company relationships are used only as contextual grounding. The disruption, component identifier, plants, order values, recovery options, and operational metrics shown in the prototype are synthetic demonstration data.
