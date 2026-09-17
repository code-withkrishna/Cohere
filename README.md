# COHERE

## Critical Component & Production Continuity Engine

COHERE is an agentic supply-chain resilience prototype for SAP Hackfest 2026. It demonstrates a focused recovery workflow:

**Disruption → Impact Graph → Time-to-Line-Stop → Recovery Scenarios → Compliance → Human Approval → Execution → Recovery Verification → Audit Trail**

### Demo scenario

An electronics manufacturer loses access to critical component **MC-204** from its primary supplier for 18 days. COHERE traces affected plants, production orders and customer orders, calculates the production runway, generates deterministic recovery options, applies policy guardrails, requests human approval for high-impact actions, executes the approved recovery plan and records an audit trail.

### Architecture

- **FastAPI** backend
- Deterministic business/decision engine for critical calculations
- Lightweight agent-style orchestration layer
- Vanilla HTML/CSS/JS frontend for a zero-build demo
- Synthetic enterprise data designed for the SAP Hackfest presentation

### Run locally

```bash
cd backend
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open http://127.0.0.1:8000

### Demo flow

1. Start from the green **Normal Operations** state.
2. Click **Simulate Supplier Failure**.
3. Review the impact graph and time-to-line-stop.
4. Generate recovery scenarios.
5. Inspect the recommended plan and governance checks.
6. Click **Approve Recovery**.
7. Show execution status and audit trail.
8. Use **Reset Demo** to repeat the scenario.

### Design principle

The LLM is not trusted with critical arithmetic or policy enforcement. Inventory runway, recovery timing, cost, feasibility and approval thresholds are deterministic. An LLM can later be added for disruption interpretation, explanations and orchestration without becoming the source of truth for business constraints.

> Prototype for SAP Hackfest 2026. Synthetic data only; no production SAP credentials or customer data are used.
