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

app = FastAPI(title="COHERE", version="0.3.0", description="Critical Component & Production Continuity Engine")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


SUPPLIERS = [
    {"id": "SUP-001", "name": "Alpha Components", "status": "active", "lead_time_days": 18, "unit_cost": 10.0, "capacity": 0, "compliance": "PASS"},
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

BASE_PLANTS = [
    {"id": "PL-01", "name": "Chennai-01", "inventory_days": 3.4, "products": ["AlphaPhone", "AlphaTablet"]},
    {"id": "PL-02", "name": "Hyderabad-02", "inventory_days": 8.2, "products": ["AlphaRouter", "AlphaPhone"]},
    {"id": "PL-03", "name": "Bengaluru-03", "inventory_days": 5.6, "products": ["AlphaTablet", "AlphaRouter"]},
]

BASE_ORDERS = [
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
    "twin": {
        "chennai_inventory_days": 3.4,
        "hyderabad_inventory_days": 8.2,
        "inventory_transfer_days": 0,
        "orders_protected": 0,
        "continuity": "NORMAL",
    },
}


class ApprovalRequest(BaseModel):
    strategy_id: str


class SimulationRequest(BaseModel):
    strategy_id: str


def audit(event: str, detail: str, actor: str = "COHERE") -> None:
    state["audit"].insert(0, {"timestamp": now(), "event": event, "detail": detail, "actor": actor})


def plant_data() -> list[dict[str, Any]]:
    result = [dict(p) for p in BASE_PLANTS]
    by_id = {p["id"]: p for p in result}
    by_id["PL-01"]["inventory_days"] = state["twin"]["chennai_inventory_days"]
    by_id["PL-02"]["inventory_days"] = state["twin"]["hyderabad_inventory_days"]
    return result


def order_data() -> list[dict[str, Any]]:
    result = [dict(o) for o in BASE_ORDERS]
    if state["executed"]:
        for order in result:
            order["status"] = "protected"
    return result


def impact() -> dict[str, Any]:
    if not state["disrupted"]:
        return {
            "severity": "NORMAL", "component": "MC-204", "component_name": "Control Processor",
            "supplier": "Alpha Components", "supplier_recovery_days": 0, "inventory_days": 21,
            "line_stop_days": 21, "affected_plants": 0, "affected_orders": 0,
            "affected_order_value": 0, "confidence": 99, "plants": [], "orders": [],
        }
    plants = plant_data()
    orders = order_data()
    affected_plants = [p for p in plants if any("MC-204" in BOM[x] for x in p["products"])]
    affected_orders = [o for o in orders if "MC-204" in BOM[o["product"]]]
    runway = plants[0]["inventory_days"]
    return {
        "severity": "RECOVERED" if state["executed"] else "CRITICAL", "component": "MC-204", "component_name": "Control Processor",
        "supplier": "Alpha Components", "supplier_recovery_days": 18, "inventory_days": runway,
        "line_stop_days": runway, "affected_plants": 0 if state["executed"] else len(affected_plants),
        "affected_orders": 0 if state["executed"] else len(affected_orders),
        "affected_order_value": 0 if state["executed"] else sum(o["value"] for o in affected_orders),
        "confidence": 99 if state["executed"] else 96,
        "plants": [p["name"] for p in affected_plants], "orders": [o["id"] for o in affected_orders],
    }


def impact_graph() -> dict[str, Any]:
    if not state["disrupted"]:
        return {"nodes": [], "edges": []}
    plants = plant_data()
    orders = order_data()
    nodes = [
        {"id": "SUP-001", "label": "Alpha Components", "type": "supplier", "status": "DISRUPTED"},
        {"id": "MC-204", "label": "MC-204 • Control Processor", "type": "component", "status": "RECOVERED" if state["executed"] else "CRITICAL"},
    ]
    edges = [{"source": "SUP-001", "target": "MC-204", "label": "supplies"}]
    for plant in plants:
        nodes.append({"id": plant["id"], "label": plant["name"], "type": "plant", "status": f"{plant['inventory_days']}d runway"})
        edges.append({"source": "MC-204", "target": plant["id"], "label": "BOM dependency"})
    for order in orders:
        if "MC-204" in BOM[order["product"]]:
            nodes.append({"id": order["id"], "label": order["id"], "type": "order", "status": "PROTECTED" if state["executed"] else f"₹{order['value']:,}"})
            edges.append({"source": order["plant"], "target": order["id"], "label": "fulfills"})
    return {"nodes": nodes, "edges": edges}


def generate_scenarios() -> list[dict[str, Any]]:
    if not state["disrupted"] or state["executed"]:
        return []
    runway = round(impact()["line_stop_days"], 1)
    catalog = [
        {
            "id": "WAIT",
            "name": "Wait for Primary Supplier",
            "recovery_days": 18,
            "cost_delta": 0,
            "line_stop_risk": "HIGH",
            "compliance": "PASS",
            "reason": "Recovery arrives after production runway expires.",
        },
        {
            "id": "ALT_SUPPLIER",
            "name": "Switch to Beta Components",
            "recovery_days": 3,
            "cost_delta": 42000,
            "line_stop_risk": "LOW",
            "compliance": "PASS",
            "reason": "Qualified alternate supplier with expedited delivery clears compliance.",
        },
        {
            "id": "TRANSFER",
            "name": "Transfer Inventory to Chennai-01",
            "recovery_days": 2,
            "cost_delta": 18000,
            "line_stop_risk": "LOW",
            "compliance": "PASS",
            "reason": "Move existing MC-204 stock from Hyderabad-02 before Chennai-01 reaches zero.",
        },
        {
            "id": "SUBSTITUTE",
            "name": "Use MC-204B Substitute",
            "recovery_days": 3,
            "cost_delta": 15000,
            "line_stop_risk": "MEDIUM",
            "compliance": "REVIEW",
            "reason": "Engineering qualification is required before production use.",
        },
    ]
    scenarios = []
    for s in catalog:
        buffer = round(runway - s["recovery_days"], 1)
        time_viable = buffer >= 0
        compliance_viable = s["compliance"] == "PASS"
        feasible = time_viable and compliance_viable
        risk = s["line_stop_risk"]
        reason = s["reason"]
        if not time_viable:
            risk = "HIGH"
            reason = f"Recovery arrives after production runway expires ({s['recovery_days']}d > {runway}d)."
        elif not compliance_viable:
            risk = "MEDIUM"
            reason = "Engineering qualification is required before production use."
        scenarios.append({
            "id": s["id"],
            "name": s["name"],
            "recovery_days": s["recovery_days"],
            "cost_delta": s["cost_delta"],
            "line_stop_risk": risk,
            "compliance": s["compliance"],
            "feasible": feasible,
            "reason": reason,
        })
    return scenarios


def recommendation() -> dict[str, Any] | None:
    scenarios = [s for s in generate_scenarios() if s["feasible"]]
    return sorted(scenarios, key=lambda s: (s["recovery_days"], s["cost_delta"]))[0] if scenarios else None


@app.get("/")
def root():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "cohere", "version": "0.3.0"}


@app.get("/api/state")
def get_state():
    return {
        "disrupted": state["disrupted"], "approved": state["approved"], "executed": state["executed"],
        "selected_strategy": state["selected_strategy"], "impact": impact(), "impact_graph": impact_graph(),
        "scenarios": generate_scenarios(), "recommendation": recommendation(), "policies": POLICIES,
        "audit": state["audit"], "twin": state["twin"],
    }


@app.post("/api/disruptions/simulate")
def simulate_disruption():
    state.update({"disrupted": True, "approved": False, "executed": False, "selected_strategy": None, "audit": [], "twin": {
        "chennai_inventory_days": 3.4, "hyderabad_inventory_days": 8.2, "inventory_transfer_days": 0,
        "orders_protected": 0, "continuity": "AT RISK",
    }})
    audit("DISRUPTION_DETECTED", "Alpha Components reports an 18-day interruption for critical component MC-204.", "Disruption Agent")
    audit("IMPACT_ANALYSIS", "3 plants and 4 customer orders are exposed; production runway is 3.4 days.", "Impact Agent")
    return get_state()


@app.post("/api/recovery/generate")
def generate_recovery():
    if not state["disrupted"] or state["executed"]:
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
        "decision": "CONTINUITY MAINTAINED" if buffer >= 0 else "LINE STOP RISK",
    }


@app.post("/api/recovery/approve")
def approve_recovery(req: ApprovalRequest):
    strategy = next((s for s in generate_scenarios() if s["id"] == req.strategy_id), None)
    if not strategy or not strategy["feasible"]:
        return {"ok": False, "error": "Strategy is not currently feasible."}
    state["selected_strategy"] = strategy
    state["approved"] = True
    needs_threshold = strategy["cost_delta"] > POLICIES["approval_cost_threshold"]
    detail = (
        "Policy check flagged cost above the approval threshold. Human authorization recorded."
        if needs_threshold
        else "Policy and compliance checks passed. Cost is within the configured threshold."
    )
    audit("COMPLIANCE_CHECK", detail, "Compliance Agent")
    audit("HUMAN_APPROVAL", f"Recovery approved: {strategy['name']}.", "Supply Planner")
    return {"ok": True, **get_state()}


@app.post("/api/recovery/execute")
def execute_recovery():
    if not state["approved"]:
        return {"ok": False, "error": "Human approval is required before execution."}
    if state["executed"]:
        return {"ok": True, **get_state()}
    strategy = state["selected_strategy"]
    state["executed"] = True
    runway = plant_data()[0]["inventory_days"]
    if strategy["id"] == "TRANSFER":
        state["twin"].update({
            "chennai_inventory_days": 5.4,
            "hyderabad_inventory_days": 6.2,
            "inventory_transfer_days": 2.0,
            "orders_protected": len(BASE_ORDERS),
            "continuity": "PROTECTED",
        })
    elif strategy["id"] == "ALT_SUPPLIER":
        state["twin"].update({
            "chennai_inventory_days": 6.4,
            "hyderabad_inventory_days": 8.2,
            "inventory_transfer_days": 0.0,
            "orders_protected": len(BASE_ORDERS),
            "continuity": "PROTECTED",
        })
    else:
        state["twin"].update({
            "chennai_inventory_days": max(4.0, strategy["recovery_days"] + 1.0),
            "hyderabad_inventory_days": 8.2,
            "inventory_transfer_days": 0.0,
            "orders_protected": len(BASE_ORDERS),
            "continuity": "PROTECTED",
        })
    buffer = round(runway - strategy["recovery_days"], 1)
    audit(
        "EXECUTION",
        f"Executed recovery plan: {strategy['name']}. Inventory, procurement and production actions were simulated.",
        "Execution Agent",
    )
    audit(
        "DIGITAL_TWIN_UPDATED",
        f"Chennai runway increased to {state['twin']['chennai_inventory_days']:.1f} days; {state['twin']['orders_protected']} orders moved to protected status.",
        "Execution Agent",
    )
    audit(
        "RECOVERY_VERIFIED",
        f"Production continuity restored with a {buffer:+.1f}-day recovery buffer.",
        "Verification Agent",
    )
    return {"ok": True, **get_state()}


@app.post("/api/reset")
def reset_demo():
    state.update({"disrupted": False, "approved": False, "executed": False, "selected_strategy": None, "audit": [], "twin": {
        "chennai_inventory_days": 3.4, "hyderabad_inventory_days": 8.2, "inventory_transfer_days": 0,
        "orders_protected": 0, "continuity": "NORMAL",
    }})
    audit("DEMO_RESET", "Scenario returned to normal operations.", "System")
    return get_state()
