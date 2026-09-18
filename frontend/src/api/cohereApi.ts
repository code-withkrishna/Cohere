import { CohereState, SimulationResult } from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown network error');
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export async function getState(): Promise<CohereState> {
  const res = await fetch('/api/state', {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<CohereState>(res);
}

export async function simulateDisruption(): Promise<CohereState> {
  const res = await fetch('/api/disruptions/simulate', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<CohereState>(res);
}

export async function generateRecovery(): Promise<CohereState> {
  const res = await fetch('/api/recovery/generate', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<CohereState>(res);
}

export async function simulateRecovery(strategyId: string): Promise<SimulationResult> {
  const res = await fetch('/api/recovery/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ strategy_id: strategyId }),
  });
  return handleResponse<SimulationResult>(res);
}

export async function approveRecovery(strategyId: string): Promise<{ ok: boolean; error?: string } & CohereState> {
  const res = await fetch('/api/recovery/approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ strategy_id: strategyId }),
  });
  return handleResponse<{ ok: boolean; error?: string } & CohereState>(res);
}

export async function executeRecovery(): Promise<{ ok: boolean; error?: string } & CohereState> {
  const res = await fetch('/api/recovery/execute', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<{ ok: boolean; error?: string } & CohereState>(res);
}

export async function resetDemo(): Promise<CohereState> {
  const res = await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse<CohereState>(res);
}
