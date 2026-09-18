import { SupplyNode } from '../types';

export const SUPPLY_CHAIN_NODES: SupplyNode[] = [
  {
    id: 'suppliers',
    name: 'TIER-1 SUPPLIERS',
    category: 'supplier',
    status: 'stable',
    metrics: { count: 3, label: '3 SUPPLIERS ACTIVE' },
    details: {
      location: 'DENSO (Primary), Beta Components (Alt), Gamma Components',
      capacity: 'DENSO (Lead Time: 18d), Beta (Lead Time: 4d)',
      leadTime: 'Avg 4-18 days',
      healthScore: 98,
    },
  },
  {
    id: 'bom',
    name: 'CRITICAL BILL-OF-MATERIALS',
    category: 'bom',
    status: 'stable',
    metrics: { count: 'VCP-204', label: 'VEHICLE CONTROL PROCESSOR' },
    details: {
      location: 'V-BOM-204 — Vehicle Control Assembly',
      runway: '21 days baseline manufacturing buffer',
      capacity: 'Single-source dependency flagged (DENSO)',
      healthScore: 100,
    },
  },
  {
    id: 'plants',
    name: 'ASSEMBLY PLANTS',
    category: 'plant',
    status: 'stable',
    metrics: { count: '3 PLANTS', label: 'CHENNAI, HYDERABAD, BENGALURU' },
    details: {
      location: 'Chennai-01 (3.4d), Hyderabad-02 (8.2d), Bengaluru-03 (5.6d)',
      capacity: 'Toyota vehicle assembly lines',
      runway: 'Chennai-01: 3.4d baseline',
      healthScore: 99,
    },
  },
  {
    id: 'dispatch',
    name: 'CUSTOMER ORDERS',
    category: 'dispatch',
    status: 'stable',
    metrics: { count: '4 ORDERS', label: '₹58.7L TOTAL VALUE' },
    details: {
      location: 'ORD-291, ORD-292, ORD-301, ORD-318',
      leadTime: 'Committed delivery schedules',
      capacity: 'Vehicle Control Assembly deliveries',
      healthScore: 100,
    },
  },
];
