from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = FastAPI(title="COHERE", version="0.2.0", description="Critical Component & Production Continuity Engine")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


SUPPLIERS = [
    {"id": "SUP-001", "name": "Alpha Components", "status": "disrupted", "lead_time_days": 18, "unit_cost": 10.0, "capacity": 0, "compliance": "PASS"},
    {"id": "SUP-002", "name": "Beta Components", "status": "active", "lead_time_days": 4, "unit_cost": 10.8, "capacity": 8000, "compliance": "PASS"},
    {"id": "SUP-003", "name": "Gamma Components", "status": "active", "lead_time_days": 7, "unit_cost": 10.3, "capacity": 2500, "compliance": "PASS"},
]

COMPONENTS = [
    {"id": "MC-101", "name": "Power Module", "critical": False},
    {"id": "MC-204", "name": "Control Processor", "critical": True},
    {"id": "MC-305", "name": "Display Driver", "critical": False},
    {"id": "MC-411", "name": "Connectivity Module", "critical": False},
]

BOM = {
    "AlphaPhone": ["MC-101", "MC-204", "MC-305"],
    "AlphaTablet": ["MC-101", "MC-204", "MC-411"],
    "AlphaRouter": ["MC-204", "MC-411"],
}

PLANTS = [
    {"id": "PL-01", "name": "Chennai-01", "inventory_days": 3.4, "products": ["AlphaPhone", "AlphaTablet"]},
    {"id": "PL-02", "name": "Hyderabad-02", "inventory_days": 8.2, "products": ["AlphaRouter", "AlphaPhone"]},
    {"id": "PL-03", "name": "Bengaluru-03", "inventory_days": 5.6, "products": ["AlphaTablet", "AlphaRouter"]},
]

ORDERS = [
    {"id": "ORD-291", "plant": "PL-01", "product": "AlphaPhone", "quantity": 900, "value": 1850000, "status": "at_risk"},
    {"id": "ORD-292", "plant": "PL-01", "product": "AlphaTablet", "quantity": 650, "value": 1420000, "status": "at_risk"},
    {"id": "ORD-301", "plant": "PL-02", "product": "AlphaPhone", "quantity": 500, "value": 1020000, "status": "at_risk"},
    {"id": "ORD-318", "plant": "PL-03", "product": "AlphaTablet", "quantity": 720, "value": 1580000, "status": "at_risk"},
]

POLICIES = {"approval_cost_threshold": 25000, "high_risk_route_approval": True}

state: dict[str, Any] = {
    "disrupted": False,
    "approved": False,
    "executed": False,
    "audit": [],
    "selected_strategy": None,
}


class ApprovalRequest(BaseModel):
    strategy_id: str


class SimulationRequest(BaseModel):
    strategy_id: str


def audit(event: str, detail: str, actor: str = "COHERE") -> None:
    state["audit"].insert(0, {"timestamp": now(), "event": event, "detail": detail, "actor": actor})


def impact() -> dict[str, Any]:
    if not state["disrupted"]:
        return {
            "severity": "NORMAL", "component": "MC-204", "component_name": "Control Processor",
            "supplier": "Alpha Components", "supplier_recovery_days": 0, "inventory_days": 21,
            "line_stop_days": 21, "affected_plants": 0, "affected_orders": 0,
            "affected_order_value": 0, "confidence": 99, "plants": [], "orders": [],
        }
    affected_plants = [p for p in PLANTS if any("MC-204" in BOM[x] for x in p["products"])]
    affected_orders = [o for o in ORDERS if "MC-204" in BOM[o["product"]]]
    return {
        "severity": "CRITICAL", "component": "MC-204", "component_name": "Control Processor",
        "supplier": "Alpha Components", "supplier_recovery_days": 18, "inventory_days": 3.4,
        "line_stop_days": 3.4, "affected_plants": len(affected_plants), "affected_orders": len(affected_orders),
        "affected_order_value": sum(o["value"] for o in affected_orders), "confidence": 96,
        "plants": [p["name"] for p in affected_plants], "orders": [o["id"] for o in affected_orders],
    }


def impact_graph() -> dict[str, Any]:
    i = impact()
    if not state["disrupted"]:
        return {"nodes": [], "edges": []}
    plants = [p for p in PLANTS if p["name"] in i["plants"]]
    orders = [o for o in ORDERS if o["id"] in i["orders"]]
    nodes = [
        {"id": "SUP-001", "label": "Alpha Components", "type": "supplier", "status": "DISRUPTED"},
        {"id": "MC-204", "label": "MC-204 • Control Processor", "type": "component", "status": "CRITICAL"},
    ]
    edges = [{"source": "SUP-001", "target": "MC-204", "label": "supplies"}]
    for plant in plants:
        nodes.append({"id": plant["id"], "label": plant["name"], "type": "plant", "status": f"{plant['inventory_days']}d runway"})
        edges.append({"source": "MC-204", "target": plant["id"], "label": "BOM dependency"})
    for order in orders:
        nodes.append({"id": order["id"], "label": order["id"], "type": "order", "status": f"₹{order['value']:,}"})
        edges.append({"source": order["plant"], "target": order["id"], "label": "fulfills"})
    return {"nodes": nodes, "edges": edges}


def generate_scenarios() -> list[dict[str, Any]]:
    if not state["disrupted"]:
        return []
    return [
        {"id": "WAIT", "name": "Wait for Primary Supplier", "recovery_days": 18, "cost_delta": 0, "line_stop_risk": "HIGH", "compliance": "PASS", "feasible": False, "reason": "Recovery arrives after production runway expires."},
        {"id": "ALT_SUPPLIER", "name": "Switch to Beta Components", "recovery_days": 4, "cost_delta": 42000, "line_stop_risk": "LOW", "compliance": "PASS", "feasible": True, "reason": "Qualified alternate supplier has available capacity and clears compliance."},
        {"id": "TRANSFER", "name": "Transfer Inventory to Chennai-01", "recovery_days": 2, "cost_delta": 18000, "line_stop_risk": "LOW", "compliance": "PASS", "feasible": True, "reason": "Move existing MC-204 stock from Hyderabad-02 before Chennai-01 reaches zero."},
        {"id": "SUBSTITUTE", "name": "Use MC-204B Substitute", "recovery_days": 3, "cost_delta": 15000, "line_stop_risk": "MEDIUM", "compliance": "REVIEW", "feasible": False, "reason": "Engineering qualification is required before production use."},
    ]


def recommendation() -> dict[str, Any] | None:
    scenarios = [s for s in generate_scenarios() if s["feasible"]]
    if not scenarios:
        return None
    return sorted(scenarios, key=lambda s: (s["recovery_days"], s["cost_delta"]))[0]


@app.get("/")
def root():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "cohere", "version": "0.2.0"}


@app.get("/api/state")
def get_state():
    rec = recommendation()
    return {
        "disrupted": state["disrupted"], "approved": state["approved"], "executed": state["executed"],
        "selected_strategy": state["selected_strategy"], "impact": impact(), "impact_graph": impact_graph(),
        "scenarios": generate_scenarios(), "recommendation": rec, "policies": POLICIES, "audit": state["audit"],
    }


@app.post("/api/disruptions/simulate")
def simulate_disruption():
    state.update({"disrupted": True, "approved": False, "executed": False, "selected_strategy": None, "audit": []})
    audit("DISRUPTION_DETECTED", "Alpha Components reports an 18-day interruption for critical component MC-204.", "Disruption Agent")
    audit("IMPACT_ANALYSIS", "3 plants and 4 customer orders are exposed; production runway is 3.4 days.", "Impact Agent")
    return get_state()


@app.post("/api/recovery/generate")
def generate_recovery():
    if not state["disrupted"]:
        return get_state()
    scenarios = generate_scenarios()
    rec = recommendation()
    audit("SCENARIOS_GENERATED", f"Generated {len(scenarios)} recovery scenarios; {sum(s['feasible'] for s in scenarios)} are feasible.", "Scenario Agent")
    if rec:
        audit("RECOMMENDATION", f"Recommended {rec['name']} with {rec['recovery_days']} day recovery and ₹{rec['cost_delta']:,} incremental cost.", "Recovery Agent")
    return get_state()


@app.post("/api/recovery/simulate")
def simulate_recovery(req: SimulationRequest):
    strategy = next((s for s in generate_scenarios() if s["id"] == req.strategy_id), None)
    if not strategy:
        return {"ok": False, "error": "Unknown recovery strategy."}
    buffer = round(impact()["line_stop_days"] - strategy["recovery_days"], 1)
    return {
        "ok": True,
        "strategy": strategy,
        "recovery_buffer_days": buffer,
        "line_stop_avoided": buffer >= 0,
        "decision": "CONTINUITY MAINTAINED" if buffer > 0 else "LINE STOP RISK",
    }


@app.post("/api/recovery/approve")
def approve_recovery(req: ApprovalRequest):
    strategy = next((s for s in generate_scenarios() if s["id"] == req.strategy_id), None)
    if not strategy or not strategy["feasible"]:
        return {"ok": False, "error": "Strategy is not currently feasible."}
    state["selected_strategy"] = strategy
    state["approved"] = True
    needs_threshold = strategy["cost_delta"] > POLICIES["approval_cost_threshold"]
    detail = "Policy check flagged cost above the approval threshold. Human authorization recorded." if needs_threshold else "Policy and compliance checks passed. Cost is within the configured threshold."
    audit("COMPLIANCE_CHECK", detail, "Compliance Agent")
    audit("HUMAN_APPROVAL", f"Recovery approved: {strategy['name']}.", "Supply Planner")
    return {"ok": True, **get_state()}


@app.post("/api/recovery/execute")
def execute_recovery():
    if not state["approved"]:
        return {"ok": False, "error": "Human approval is required before execution."}
    state["executed"] = True
    strategy = state["selected_strategy"]
    buffer = impact()["line_stop_days"] - strategy["recovery_days"]
    audit("EXECUTION", f"Executed recovery plan: {strategy['name']}. Inventory, procurement and production actions were simulated.", "Execution Agent")
    audit("RECOVERY_VERIFIED", f"Production continuity restored with a +{buffer:.1f}-day recovery buffer.", "Verification Agent")
    return {"ok": True, **get_state()}


@app.post("/api/reset")
def reset_demo():
    state.update({"disrupted": False, "approved": False, "executed": False, "selected_strategy": None, "audit": []})
    audit("DEMO_RESET", "Scenario returned to normal operations.", "System")
    return get_state()
