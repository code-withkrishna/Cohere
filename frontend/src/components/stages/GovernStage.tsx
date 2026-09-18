import { useState } from 'react';
import { StageNumber, CohereState, BackendScenario } from '../../types';
import { approveRecovery, executeRecovery } from '../../api/cohereApi';
import { StageNav } from '../StageNav';
import {
  CheckCircle2,
  Radio,
  ArrowRight,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface GovernStageProps {
  setStage: (stage: StageNumber) => void;
  cohereState: CohereState | null;
  selectedStrategyId: string;
  onExecutionComplete: (updatedState: CohereState) => void;
}

export const GovernStage: React.FC<GovernStageProps> = ({
  setStage,
  cohereState,
  selectedStrategyId,
  onExecutionComplete,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execPhase, setExecPhase] = useState<number>(0); // 0 = idle, 1 = approved, 2 = dispatching, 3 = scheduling, 4 = verified
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scenarios = cohereState?.scenarios || [];
  const selectedScenario: BackendScenario =
    scenarios.find((s) => s.id === selectedStrategyId) ||
    cohereState?.selected_strategy ||
    scenarios[0] || {
      id: 'TRANSFER',
      name: 'Transfer Inventory to Chennai-01',
      recovery_days: 2,
      cost_delta: 18000,
      line_stop_risk: 'LOW',
      compliance: 'PASS',
      feasible: true,
      reason: 'Move existing VCP-204 stock from Hyderabad-02.',
    };

  const lineStopDays = cohereState?.impact?.line_stop_days ?? 3.4;
  const ordersAtRisk = cohereState?.impact?.affected_orders ?? 4;
  const orderExposureLakh = ((cohereState?.impact?.affected_order_value ?? 5870000) / 100000).toFixed(1);
  const buffer = Math.round((lineStopDays - selectedScenario.recovery_days) * 10) / 10;
  const bufferSign = buffer >= 0 ? `+${buffer}` : `${buffer}`;

  const costThreshold = cohereState?.policies?.approval_cost_threshold ?? 25000;
  const costExceedsThreshold = selectedScenario.cost_delta > costThreshold;

  const handleApproveAndExecute = async () => {
    setErrorMessage(null);
    setIsApproving(true);
    try {
      // Step 1: Human Approval Gate API Call
      const approveRes = await approveRecovery(selectedScenario.id);
      if (!approveRes.ok) {
        throw new Error(approveRes.error || 'Approval failed.');
      }
      setIsApproving(false);
      setIsExecuting(true);
      setExecPhase(1);

      // Visual phase sequence
      await new Promise((r) => setTimeout(r, 600));
      setExecPhase(2);

      // Step 2: Real Backend Recovery Execution API Call
      const executeRes = await executeRecovery();
      if (!executeRes.ok) {
        throw new Error(executeRes.error || 'Execution failed.');
      }

      await new Promise((r) => setTimeout(r, 600));
      setExecPhase(3);

      await new Promise((r) => setTimeout(r, 600));
      setExecPhase(4);

      // Finish & update app state
      onExecutionComplete(executeRes);
    } catch (err: any) {
      console.error('Approval / Execution error:', err);
      setErrorMessage(err?.message || 'An error occurred during execution.');
      setIsApproving(false);
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
      {/* Context & Baseline Briefing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#3c4a42]/30">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-[#4edea3] uppercase tracking-wider font-semibold">
              STAGE 04 // GOVERN &amp; EXECUTE
            </span>
            <span className="text-[#3c4a42] text-xs">•</span>
            <span className="font-mono text-[11px] text-[#bbcabf] uppercase font-semibold">
              AUTHORIZATION GATE
            </span>
            <span className="text-[#3c4a42] text-xs">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-300/90 bg-[#0d1c2d] px-2 py-0.5 rounded border border-amber-500/20">
              SIMULATED SCENARIO • SYNTHETIC DATA
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-[32px] font-semibold text-[#d4e4fa] tracking-tight">
            {isExecuting ? 'Executing Recovery Strategy...' : 'Recovery Plan Ready for Approval'}
          </h1>
          <p className="text-sm text-[#bbcabf]">
            {isExecuting
              ? `Executing authorized plan: ${selectedScenario.name}. Backend Digital Twin state is being updated.`
              : 'COHERE verified that this strategy prevents line stoppage at Chennai-01 with human governance gate active (Toyota × DENSO context).'}
          </p>
        </div>

        {/* Baseline Scenario Gauges */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex flex-col px-4 py-2 bg-[#0d1c2d] rounded border border-[#3c4a42]/20">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Production Runway</span>
            <span className="font-mono text-xl text-[#d4e4fa] font-medium">
              {lineStopDays} <span className="font-mono text-xs text-[#bbcabf] font-normal">days</span>
            </span>
          </div>
          <div className="flex flex-col px-4 py-2 bg-[#0d1c2d] rounded border border-[#3c4a42]/20">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Affected Orders</span>
            <span className="font-mono text-xl text-[#d4e4fa] font-medium">{ordersAtRisk}</span>
          </div>
          <div className="flex flex-col px-4 py-2 bg-[#0d1c2d] rounded border border-[#3c4a42]/20">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Order Exposure</span>
            <span className="font-mono text-xl text-[#d4e4fa] font-medium">
              ₹{orderExposureLakh} <span className="font-mono text-xs text-[#bbcabf] font-normal">lakh</span>
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isExecuting ? (
        /* ================= STATE A: APPROVAL WORKBENCH ================= */
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Governance Pipeline Sequence */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold tracking-wider">
                  HUMAN APPROVAL REQUIRED
                </span>
                <p className="text-xs text-[#bbcabf]">
                  Strict governance policy requires human authorization before dispatching recovery orders.
                </p>
              </div>
              <span className="font-mono text-xs text-[#bbcabf]">Gate Step 3 of 4</span>
            </div>

            {/* 4-Stage Decision Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {/* Step 1 */}
              <div className="flex items-center justify-between p-3.5 bg-[#0d1c2d] rounded border border-[#3c4a42]/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                  <span className="font-mono text-[11px] text-[#d4e4fa] uppercase font-medium">
                    1. Recommendation
                  </span>
                </div>
                <span className="text-[11px] text-[#bbcabf]">Calculated</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between p-3.5 bg-[#0d1c2d] rounded border border-[#3c4a42]/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                  <span className="font-mono text-[11px] text-[#d4e4fa] uppercase font-medium">
                    2. Policy Check
                  </span>
                </div>
                <span className="text-[11px] text-[#bbcabf]">
                  {costExceedsThreshold ? 'Approval Flagged' : 'Passed'}
                </span>
              </div>

              {/* Step 3: Active Human Gate */}
              <div className="flex items-center justify-between p-3.5 bg-[#1c2b3c] rounded border border-[#4edea3]/40 relative overflow-hidden ring-1 ring-[#4edea3]/30">
                <div className="absolute inset-0 bg-[#4edea3]/5 pointer-events-none" />
                <div className="flex items-center gap-2 relative z-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4edea3]" />
                  </span>
                  <span className="font-mono text-[11px] text-[#d4e4fa] uppercase font-semibold">
                    3. Human Approval
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold relative z-10">
                  Pending Action
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex items-center justify-between p-3.5 bg-[#010f1f] rounded border border-[#3c4a42]/20 opacity-60">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#bbcabf]" />
                  <span className="font-mono text-[11px] text-[#bbcabf] uppercase font-medium">
                    4. Execution
                  </span>
                </div>
                <span className="text-[11px] text-[#bbcabf]">Queued</span>
              </div>
            </div>
          </div>

          {/* Core Operational Decision Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Action Card (Hero) */}
            <div className="lg:col-span-8 flex flex-col bg-[#0d1c2d] rounded p-6 md:p-8 gap-6 border border-[#3c4a42]/30 relative overflow-hidden shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold">
                    Authorized Recovery Strategy
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                    {selectedScenario.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#122131] border border-[#3c4a42]/40 rounded">
                  <span className="font-mono text-xs text-[#d4e4fa]">Hyderabad-02</span>
                  <span className="text-[#4edea3]">→</span>
                  <span className="font-mono text-xs text-[#d4e4fa] font-semibold">Chennai-01</span>
                </div>
              </div>

              {/* Key Pedestals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col bg-[#122131] px-4 py-5 rounded gap-1 border border-[#3c4a42]/20">
                  <span className="font-mono text-[11px] text-[#bbcabf] uppercase">Recovery</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium text-white">{selectedScenario.recovery_days}</span>
                    <span className="font-mono text-xs text-[#bbcabf]">DAYS</span>
                  </div>
                </div>

                <div className="flex flex-col bg-[#122131] px-4 py-5 rounded gap-1 border border-[#4edea3]/30">
                  <span className="font-mono text-[11px] text-[#bbcabf] uppercase">Buffer</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium text-[#4edea3]">{bufferSign}</span>
                    <span className="font-mono text-xs text-[#4edea3]">DAYS</span>
                  </div>
                </div>

                <div className="flex flex-col bg-[#122131] px-4 py-5 rounded gap-1 border border-[#3c4a42]/20">
                  <span className="font-mono text-[11px] text-[#bbcabf] uppercase">Cost Delta</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium text-white">
                      ₹{selectedScenario.cost_delta.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col bg-[#122131] px-4 py-5 rounded gap-1 border border-[#4edea3]/30">
                  <span className="font-mono text-[11px] text-[#bbcabf] uppercase">Risk</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium text-[#4edea3]">
                      {selectedScenario.line_stop_risk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorization Triggers */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setStage(3)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-[#122131] text-[#bbcabf] hover:text-white rounded text-sm transition-colors cursor-pointer"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Recovery Options</span>
                </button>

                <button
                  onClick={handleApproveAndExecute}
                  disabled={isApproving || isExecuting}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-semibold text-base rounded transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(16,185,129,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.4)] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-approve"
                  type="button"
                >
                  {isApproving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  <span>{isApproving ? 'Recording Human Approval...' : 'Approve & Execute'}</span>
                </button>
              </div>
            </div>

            {/* Verification Checklist Column */}
            <div className="lg:col-span-4 flex flex-col bg-[#0d1c2d] rounded p-6 gap-4 border border-[#3c4a42]/30">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#bbcabf] uppercase">Policy Evaluation</span>
                <h3 className="text-base font-semibold text-white">Checks Verified</h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-2 px-3 bg-[#122131] rounded border border-[#3c4a42]/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-sm text-[#d4e4fa]">Recovery Feasibility</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold">
                    {selectedScenario.feasible ? 'FEASIBLE' : 'REVIEW'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-[#122131] rounded border border-[#3c4a42]/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-sm text-[#d4e4fa]">Positive Runway Buffer</span>
                  </div>
                  <span className="font-mono text-xs text-[#4edea3] font-semibold">
                    {bufferSign} days
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-[#122131] rounded border border-[#3c4a42]/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-sm text-[#d4e4fa]">Policy Threshold</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold">
                    {costExceedsThreshold ? 'HUMAN OVERRIDE' : 'WITHIN LIMIT'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-[#122131] rounded border border-[#3c4a42]/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-sm text-[#d4e4fa]">Recovery Cost</span>
                  </div>
                  <span className="font-mono text-xs text-white font-medium">
                    ₹{selectedScenario.cost_delta.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#010f1f] rounded flex items-start gap-2.5 border border-[#3c4a42]/20">
                <ShieldCheck className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  Deterministic recovery engine verified: Hyderabad-02 stock maintains Chennai-01 operations before buffer zero.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STATE B: EXECUTION PROGRESSION ================= */
        <div className="flex flex-col gap-6">
          <div className="p-6 md:p-8 bg-[#0d1c2d] rounded flex flex-col gap-6 border border-[#3c4a42]/40 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold">
                    Active Execution
                  </span>
                  <span className="px-2 py-0.5 bg-[#122131] border border-[#4edea3]/30 rounded font-mono text-[10px] text-[#4edea3]">
                    STAGE 04 → 05
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white">
                  Hyderabad-02 → Chennai-01
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {execPhase >= 4 && (
                  <button
                    onClick={() => setStage(5)}
                    className="px-6 py-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-semibold text-xs font-mono uppercase rounded transition-all shadow-lg hover:shadow-[#4edea3]/20 flex items-center gap-2 cursor-pointer"
                    id="view-verification-btn"
                  >
                    <span>View Verification Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 4-Step Execution Progression Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1: Approved */}
              <div className="flex flex-col p-4 bg-[#122131] rounded gap-2 border border-[#4edea3]/30">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Phase 1</span>
                  <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                </div>
                <span className="text-sm font-semibold text-white">Approved</span>
                <p className="text-xs text-[#bbcabf]">Human authorization recorded in audit log.</p>
              </div>

              {/* Step 2: Inventory Transfer */}
              <div
                className={`flex flex-col p-4 rounded gap-2 transition-all border ${
                  execPhase >= 2
                    ? 'bg-[#122131] border-[#4edea3]/30'
                    : 'bg-[#122131] border-[#4edea3]/50 ring-1 ring-[#4edea3]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Phase 2</span>
                  {execPhase >= 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-[#4edea3] animate-spin" />
                  )}
                </div>
                <span className="text-sm font-semibold text-white">Inventory Transfer</span>
                <p className="text-xs text-[#bbcabf]">
                  {execPhase >= 2
                    ? 'Hyderabad-02 dispatch order initiated.'
                    : 'Dispatching inventory transfer...'}
                </p>
              </div>

              {/* Step 3: Production Schedule */}
              <div
                className={`flex flex-col p-4 rounded gap-2 transition-all border ${
                  execPhase >= 3
                    ? 'bg-[#122131] border-[#4edea3]/30'
                    : execPhase === 2
                    ? 'bg-[#122131] border-[#4edea3]/50 ring-1 ring-[#4edea3]/40'
                    : 'bg-[#010f1f] border-[#3c4a42]/20 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Phase 3</span>
                  {execPhase >= 3 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                  ) : execPhase === 2 ? (
                    <Loader2 className="w-5 h-5 text-[#4edea3] animate-spin" />
                  ) : (
                    <Radio className="w-5 h-5 text-[#86948a]" />
                  )}
                </div>
                <span className="text-sm font-semibold text-white">Production Schedule</span>
                <p className="text-xs text-[#bbcabf]">
                  {execPhase >= 3
                    ? 'Runway restored to 5.4 days at Chennai-01.'
                    : 'Updating plant production calendar...'}
                </p>
              </div>

              {/* Step 4: Continuity Verification */}
              <div
                className={`flex flex-col p-4 rounded gap-2 transition-all border ${
                  execPhase >= 4
                    ? 'bg-[#122131] border-[#4edea3]/30'
                    : execPhase === 3
                    ? 'bg-[#122131] border-[#4edea3]/50 ring-1 ring-[#4edea3]/40'
                    : 'bg-[#010f1f] border-[#3c4a42]/20 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Phase 4</span>
                  {execPhase >= 4 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                  ) : execPhase === 3 ? (
                    <Loader2 className="w-5 h-5 text-[#4edea3] animate-spin" />
                  ) : (
                    <Radio className="w-5 h-5 text-[#86948a]" />
                  )}
                </div>
                <span className="text-sm font-semibold text-white">Continuity Verified</span>
                <p className="text-xs text-[#bbcabf]">
                  {execPhase >= 4
                    ? '4/4 customer orders protected. +1.4d buffer intact.'
                    : 'Verifying Digital Twin twin state...'}
                </p>
              </div>
            </div>

            {/* Real-time Status Card during execution */}
            <div className="p-4 md:p-5 bg-[#122131] rounded flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#3c4a42]/30">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4edea3]" />
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold">
                    {execPhase >= 4 ? 'RECOVERY EXECUTED' : 'EXECUTION IN PROGRESS'}
                  </span>
                  <span className="text-sm text-[#d4e4fa]">
                    {execPhase >= 4
                      ? 'Production continuity restored. Digital twin values synchronized.'
                      : 'Executing deterministic recovery workflow on backend.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#bbcabf]">Chennai-01 Runway:</span>
                <span className="font-mono text-xs text-[#4edea3] font-semibold">
                  {execPhase >= 4 ? '5.4 Days Restored' : '3.4 Days Baseline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <StageNav currentStage={4} setStage={setStage} variant="pipeline-boxes" maxUnlockedStage={isExecuting ? 5 : 4} />
    </div>
  );
};
