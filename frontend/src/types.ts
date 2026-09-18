export type StageNumber = 1 | 2 | 3 | 4 | 5;

export interface BackendImpact {
  severity: 'NORMAL' | 'CRITICAL' | 'RECOVERED';
  component: string;
  component_name: string;
  supplier: string;
  supplier_recovery_days: number;
  inventory_days: number;
  line_stop_days: number;
  affected_plants: number;
  affected_orders: number;
  affected_order_value: number;
  confidence: number;
  plants: string[];
  orders: string[];
}

export interface BackendGraphNode {
  id: string;
  label: string;
  type: 'supplier' | 'component' | 'plant' | 'order';
  status: string;
}

export interface BackendGraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface BackendImpactGraph {
  nodes: BackendGraphNode[];
  edges: BackendGraphEdge[];
}

export interface BackendScenario {
  id: string;
  name: string;
  recovery_days: number;
  cost_delta: number;
  line_stop_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  compliance: 'PASS' | 'REVIEW';
  feasible: boolean;
  reason: string;
}

export interface BackendTwin {
  chennai_inventory_days: number;
  hyderabad_inventory_days: number;
  inventory_transfer_days: number;
  orders_protected: number;
  continuity: 'NORMAL' | 'AT RISK' | 'PROTECTED';
}

export interface BackendAuthEvent {
  timestamp: string;
  event: string;
  detail: string;
  actor: string;
}

export interface BackendPolicies {
  approval_cost_threshold: number;
  high_risk_route_approval: boolean;
}

export interface CohereState {
  disrupted: boolean;
  approved: boolean;
  executed: boolean;
  selected_strategy: BackendScenario | null;
  impact: BackendImpact;
  impact_graph: BackendImpactGraph;
  scenarios: BackendScenario[];
  recommendation: BackendScenario | null;
  policies: BackendPolicies;
  audit: BackendAuthEvent[];
  twin: BackendTwin;
}

export interface SimulationResult {
  ok: boolean;
  error?: string;
  strategy?: BackendScenario;
  recovery_buffer_days?: number;
  line_stop_avoided?: boolean;
  decision?: string;
}

export interface SupplyNode {
  id: string;
  name: string;
  category: 'supplier' | 'bom' | 'plant' | 'dispatch';
  status: 'stable' | 'disrupted' | 'at_risk' | 'rerouted';
  metrics: {
    count: number | string;
    label: string;
    unit?: string;
  };
  details: {
    location?: string;
    capacity?: string;
    runway?: string;
    leadTime?: string;
    healthScore: number;
  };
}
