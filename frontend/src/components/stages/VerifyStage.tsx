import { StageNumber, CohereState } from '../../types';
import {
  Check,
  RotateCcw,
  ListFilter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface VerifyStageProps {
  setStage: (stage: StageNumber) => void;
  cohereState: CohereState | null;
  onOpenAuditModal: () => void;
  onResetDemo: () => void;
}

export const VerifyStage: React.FC<VerifyStageProps> = ({
  setStage,
  cohereState,
  onOpenAuditModal,
  onResetDemo,
}) => {
  const twin = cohereState?.twin;
  const auditEvents = cohereState?.audit || [];
  const selectedStrategy = cohereState?.selected_strategy;

  const strategyName = selectedStrategy?.name || 'Transfer Inventory to Chennai-01';
  const recoveryDays = selectedStrategy?.recovery_days ?? 2;
  const costDelta = selectedStrategy?.cost_delta ?? 18000;
  const riskLevel = selectedStrategy?.line_stop_risk || 'LOW';

  // Digital Twin values (Authoritative from backend state)
  const chennaiBefore = 3.4;
  const hyderabadBefore = 8.2;
  const ordersTotal = 4;
  const ordersProtectedBefore = 0;

  const chennaiAfter = twin?.chennai_inventory_days ?? 5.4;
  const hyderabadAfter = twin?.hyderabad_inventory_days ?? 6.2;
  const ordersProtectedAfter = twin?.orders_protected ?? 4;
  const continuityStatus = twin?.continuity || 'PROTECTED';

  const bufferDays = Math.round((chennaiBefore - recoveryDays) * 10) / 10;
  const bufferSign = bufferDays >= 0 ? `+${bufferDays}` : `${bufferDays}`;

  const corridorText =
    selectedStrategy?.id === 'TRANSFER'
      ? 'Hyderabad-02 → Chennai-01'
      : selectedStrategy?.id === 'ALT_SUPPLIER'
      ? 'Beta Components → Chennai-01'
      : 'Chennai-01 Internal';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 flex flex-col justify-center space-y-6">
      {/* Hero Status Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3c4a42]/30 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
              STAGE 05 // CONTINUITY PROTECTED
            </span>
            <span className="text-[#bbcabf] font-mono text-xs">• VERIFICATION COMPLETE</span>
            <span className="text-[#3c4a42] text-xs">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-300/90 bg-[#0d1c2d] px-2 py-0.5 rounded border border-amber-500/20">
              SIMULATED SCENARIO • SYNTHETIC DATA
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
            Toyota production continuity protected.
          </h1>
          <p className="text-[#bbcabf] text-sm mt-1">
            Recovery executed and verified by COHERE Digital Twin engine (Toyota × DENSO context).
          </p>
        </div>

        {/* Hero Recovery Summary Badge */}
        <div className="flex items-center space-x-3 bg-[#0a1a2b]/90 border border-slate-700/70 rounded-xl px-4 py-2.5 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-[#4edea3]/15 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="font-mono text-xs">
            <div className="text-[#bbcabf] text-[10px] uppercase tracking-wider">Executed Strategy</div>
            <div className="text-white font-medium">
              {selectedStrategy?.name?.toUpperCase() || 'TRANSFER INVENTORY'}{' '}
              <span className="text-[#4edea3] ml-1">
                {corridorText}
              </span>
            </div>
          </div>
          <div className="border-l border-slate-700/80 pl-4 ml-1 font-mono text-right text-xs">
            <div className="text-[#bbcabf] text-[10px] uppercase tracking-wider">Recovery Buffer</div>
            <div className="text-[#4edea3] font-bold text-base">{bufferSign} DAYS</div>
          </div>
        </div>
      </div>

      {/* Core Transformation: BEFORE → AFTER (Primary Visual Focus) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono tracking-widest text-[#bbcabf] uppercase font-semibold">
            Digital Twin Operational Transformation
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* BEFORE CARD */}
          <div className="bg-[#0a1a2b]/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/90 flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-950/40 border-b border-l border-red-500/20 text-red-400 font-mono text-xs font-semibold rounded-bl-xl tracking-wider">
              BEFORE
            </div>

            <div>
              <div className="flex items-center space-x-2 text-[#bbcabf] text-xs font-mono uppercase mb-4 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Critical Disruption Baseline</span>
              </div>

              {/* METRICS: BEFORE */}
              <div className="space-y-4">
                {/* Metric 1: Chennai-01 */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-300">
                      Chennai-01 Production Runway
                    </span>
                    <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                      Critical Line Stop
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold font-mono text-red-400">
                      {chennaiBefore}
                    </span>
                    <span className="text-slate-400 font-mono text-sm">days</span>
                  </div>
                </div>

                {/* Metric 2: Hyderabad-02 */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-300">
                      Hyderabad-02 Inventory Runway
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold font-mono text-slate-200">
                      {hyderabadBefore}
                    </span>
                    <span className="text-slate-400 font-mono text-sm">days</span>
                  </div>
                </div>

                {/* Metric 3: Orders Protected */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-300">Orders Protected</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold font-mono text-red-400">
                      {ordersProtectedBefore} / {ordersTotal}
                    </span>
                    <span className="text-slate-400 font-mono text-sm">orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Pill Before */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Production Continuity
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>● AT RISK</span>
              </span>
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="bg-[#0a1a2b]/90 backdrop-blur-sm rounded-2xl p-6 border border-[#4edea3]/40 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#4edea3]/20 border-b border-l border-[#4edea3]/40 text-[#4edea3] font-mono text-xs font-semibold rounded-bl-xl tracking-wider">
              AFTER
            </div>

            <div>
              <div className="flex items-center space-x-2 text-[#4edea3] text-xs font-mono uppercase mb-4 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
                <span>Synchronized Digital Twin State</span>
              </div>

              {/* METRICS: AFTER */}
              <div className="space-y-4">
                {/* Metric 1: Chennai-01 Restored */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-[#4edea3]/30 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-200">
                      Chennai-01 Production Runway
                    </span>
                    <span className="text-[10px] font-mono text-[#4edea3] bg-[#4edea3]/15 px-2 py-0.5 rounded border border-[#4edea3]/30 font-medium">
                      Line Stop Averted
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold font-mono text-[#4edea3]">
                      {chennaiAfter}
                    </span>
                    <span className="text-slate-300 font-mono text-sm">days</span>
                  </div>
                </div>

                {/* Metric 2: Hyderabad-02 Balanced */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-300">
                      Hyderabad-02 Inventory Runway
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold font-mono text-white">
                      {hyderabadAfter}
                    </span>
                    <span className="text-slate-400 font-mono text-sm">days</span>
                  </div>
                </div>

                {/* Metric 3: Orders Fully Protected */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-[#4edea3]/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-200">Orders Protected</span>
                  </div>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold font-mono text-[#4edea3]">
                      {ordersProtectedAfter} / {ordersTotal}
                    </span>
                    <span className="text-slate-300 font-mono text-sm">orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Pill After */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Production Continuity
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#4edea3]/20 border border-[#4edea3]/40 text-[#4edea3] font-mono text-xs font-bold">
                <span>✓ {continuityStatus}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Section - Three Clean Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Executed Recovery Specification */}
        <div className="bg-[#0a1a2b]/70 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-3 font-semibold">
              {selectedStrategy?.name?.toUpperCase() || 'TRANSFER INVENTORY'}
            </div>
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Corridor</span>
                <span className="text-white font-medium">
                  {corridorText}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Recovery Time</span>
                <span className="text-white font-medium">{recoveryDays} days</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Recovery Buffer</span>
                <span className="text-[#4edea3] font-semibold">{bufferSign} days</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Cost</span>
                <span className="text-white font-medium">₹{costDelta.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Risk Level</span>
                <span className="text-[#4edea3] font-medium">{riskLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Verification */}
        <div className="bg-[#0a1a2b]/70 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider mb-3 font-semibold">
              Verification Results
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/70">
                <div className="w-4 h-4 rounded-full bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span className="text-white font-medium">Recovery executed</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/70">
                <div className="w-4 h-4 rounded-full bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span className="text-white font-medium">Production continuity protected</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/70">
                <div className="w-4 h-4 rounded-full bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span className="text-white font-medium">
                  {ordersProtectedAfter} / {ordersTotal} customer orders protected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Audit Trail & Actions */}
        <div className="bg-[#0a1a2b]/70 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider font-semibold">
                Backend Audit Trail ({auditEvents.length})
              </span>
              <button
                onClick={onOpenAuditModal}
                className="text-[11px] font-mono text-[#bbcabf] hover:text-[#4edea3] transition-colors cursor-pointer flex items-center gap-1"
                id="view-audit-trail-btn"
              >
                <ListFilter className="w-3 h-3" />
                <span>View Full Log</span>
              </button>
            </div>

            {/* Compact Audit List from backend state.audit */}
            <div className="space-y-1.5 font-mono text-xs border-l border-slate-800 ml-1.5 pl-3 py-0.5">
              {auditEvents.slice(0, 6).map((evt, idx) => (
                <div key={`${evt.event}-${idx}`} className="flex items-center space-x-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shrink-0" />
                  <span className="truncate">{evt.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button: Reset Demo */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onResetDemo}
              className="w-full px-4 py-2.5 rounded-xl bg-[#10b981] text-[#051424] font-semibold text-xs font-mono tracking-wide hover:bg-[#34d399] transition-all shadow-lg shadow-[#10b981]/10 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              id="reset-demo-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
