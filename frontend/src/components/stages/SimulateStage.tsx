import { useEffect, useState } from 'react';
import { StageNumber, CohereState, SimulationResult } from '../../types';
import { simulateRecovery } from '../../api/cohereApi';
import { StageNav } from '../StageNav';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Compass,
  Info,
} from 'lucide-react';

interface SimulateStageProps {
  setStage: (stage: StageNumber) => void;
  cohereState: CohereState | null;
  selectedStrategyId: string;
  setSelectedStrategyId: (id: string) => void;
  onProceedToGovern: () => void;
}

export const SimulateStage: React.FC<SimulateStageProps> = ({
  setStage,
  cohereState,
  selectedStrategyId,
  setSelectedStrategyId,
  onProceedToGovern,
}) => {
  const [simulationCache, setSimulationCache] = useState<Record<string, SimulationResult>>({});
  const [, setLoadingSim] = useState<string | null>(null);

  const scenarios = cohereState?.scenarios || [];
  const recommendation = cohereState?.recommendation;
  const lineStopDays = cohereState?.impact?.line_stop_days ?? 3.4;
  const ordersAtRisk = cohereState?.impact?.affected_orders ?? 4;
  const orderExposureLakh = ((cohereState?.impact?.affected_order_value ?? 5870000) / 100000).toFixed(1);

  // Fetch simulation preview on strategy select if not cached
  useEffect(() => {
    if (!selectedStrategyId) return;
    if (!simulationCache[selectedStrategyId]) {
      setLoadingSim(selectedStrategyId);
      simulateRecovery(selectedStrategyId)
        .then((res) => {
          setSimulationCache((prev) => ({ ...prev, [selectedStrategyId]: res }));
        })
        .catch((err) => {
          console.error('Error simulating strategy:', err);
        })
        .finally(() => {
          setLoadingSim(null);
        });
    }
  }, [selectedStrategyId, simulationCache]);

  // Default corridor labels for display
  const getCorridor = (scId: string) => {
    switch (scId) {
      case 'TRANSFER':
        return 'Hyderabad-02 → Chennai-01';
      case 'ALT_SUPPLIER':
        return 'Beta Components (Pune) → Chennai-01';
      case 'SUBSTITUTE':
        return 'Chennai-01 Internal Buffer (VCP-204B)';
      case 'WAIT':
      default:
        return 'DENSO (Primary Supplier)';
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === selectedStrategyId) || scenarios[0];
  const currentSimResult = selectedScenario ? simulationCache[selectedScenario.id] : null;
  const activeBuffer = currentSimResult?.recovery_buffer_days ?? (selectedScenario ? Math.round((lineStopDays - selectedScenario.recovery_days) * 10) / 10 : 1.4);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
      {/* Header briefing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#3c4a42]/30">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-[#4edea3] uppercase tracking-wider font-semibold">
              STAGE 03 // SIMULATION &amp; MITIGATION
            </span>
            <span className="text-[#3c4a42] text-xs">•</span>
            <span className="font-mono text-[11px] text-[#bbcabf] uppercase font-semibold">
              BACKEND ENGINE ACTIVE
            </span>
            <span className="text-[#3c4a42] text-xs">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-300/90 bg-[#0d1c2d] px-2 py-0.5 rounded border border-amber-500/20">
              <Info className="w-3 h-3 text-amber-400" />
              SIMULATED SCENARIO • SYNTHETIC DATA
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl text-[#d4e4fa] font-semibold tracking-tight">
            Select Recovery Strategy
          </h1>
          <p className="text-sm text-[#bbcabf]">
            COHERE evaluated {scenarios.length} recovery scenarios using deterministic runway calculations for Chennai-01 (Toyota × DENSO context).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col px-4 py-2 bg-[#0d1c2d] rounded border border-[#3c4a42]/20">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Production Runway</span>
            <span className="font-mono text-xl text-[#ffb4ab] font-medium">
              {lineStopDays} <span className="text-xs text-[#bbcabf]">days</span>
            </span>
          </div>
          <div className="flex flex-col px-4 py-2 bg-[#0d1c2d] rounded border border-[#3c4a42]/20">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Affected Orders</span>
            <span className="font-mono text-xl text-[#d4e4fa] font-medium">{ordersAtRisk}</span>
          </div>
          <div className="flex flex-col px-4 py-2 bg-[#0d1c2d] rounded border border-[#3c4a42]/20">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase">Order Exposure</span>
            <span className="font-mono text-xl text-[#4edea3] font-medium">
              ₹{orderExposureLakh} <span className="text-xs text-[#bbcabf]">lakh</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Strategy Options Cards (Driven by state.scenarios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {scenarios.map((sc) => {
          const isSelected = selectedStrategyId === sc.id;
          const isRec = recommendation?.id === sc.id;
          const buffer = Math.round((lineStopDays - sc.recovery_days) * 10) / 10;
          const bufferSign = buffer >= 0 ? `+${buffer}` : `${buffer}`;

          return (
            <div
              key={sc.id}
              onClick={() => setSelectedStrategyId(sc.id)}
              className={`p-5 rounded flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden border ${
                isSelected
                  ? 'bg-[#122131] border-[#4edea3] shadow-lg shadow-[#4edea3]/10 ring-1 ring-[#4edea3]/40'
                  : 'bg-[#0d1c2d] border-[#3c4a42]/30 hover:border-[#4edea3]/40'
              } ${!sc.feasible ? 'opacity-75' : ''}`}
            >
              {isRec && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-[#4edea3]/20 border-b border-l border-[#4edea3]/40 text-[#4edea3] font-mono text-[10px] font-bold tracking-wider rounded-bl">
                  RECOMMENDED
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
                    {sc.id} {sc.feasible ? '• FEASIBLE' : '• INFEASIBLE'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white tracking-tight mb-1">
                  {sc.name}
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#4edea3] mb-3">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="truncate">{getCorridor(sc.id)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-[#3c4a42]/30 my-2 font-mono">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#bbcabf] uppercase">Recovery</span>
                    <span className="text-base font-medium text-white">{sc.recovery_days} Days</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#bbcabf] uppercase">Buffer</span>
                    <span
                      className={`text-base font-bold ${
                        buffer >= 1
                          ? 'text-[#4edea3]'
                          : buffer >= 0
                          ? 'text-amber-300'
                          : 'text-[#ffb4ab]'
                      }`}
                    >
                      {bufferSign} Days
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#bbcabf] uppercase">Cost Delta</span>
                    <span className="text-base font-medium text-white">
                      ₹{sc.cost_delta.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#bbcabf] uppercase">Risk</span>
                    <span
                      className={`text-base font-bold ${
                        sc.line_stop_risk === 'LOW'
                          ? 'text-[#4edea3]'
                          : sc.line_stop_risk === 'MEDIUM'
                          ? 'text-amber-300'
                          : 'text-[#ffb4ab]'
                      }`}
                    >
                      {sc.line_stop_risk}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#bbcabf] leading-relaxed mt-2">{sc.reason}</p>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#3c4a42]/20">
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-[#4edea3]' : 'text-[#86948a]'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Click to select'}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]'
                      : 'border-[#3c4a42] text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision gate preview & Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded bg-[#0d1c2d] border border-[#3c4a42]/30">
        <button
          onClick={() => setStage(2)}
          className="inline-flex items-center gap-2 text-sm text-[#bbcabf] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Disruption Trace</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-[#bbcabf] block">Selected for Approval Gate:</span>
            <span className="text-sm font-semibold text-[#4edea3] font-mono">
              {selectedScenario?.name} (Buffer: {activeBuffer >= 0 ? `+${activeBuffer}` : activeBuffer}d)
            </span>
          </div>

          <button
            onClick={onProceedToGovern}
            disabled={!selectedScenario?.feasible}
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-semibold text-sm transition-all shadow-lg hover:shadow-[#4edea3]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            id="proceed-govern-btn"
          >
            <span>Proceed to Governance Gate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper */}
      <StageNav currentStage={3} setStage={setStage} variant="pipeline-boxes" maxUnlockedStage={3} />
    </div>
  );
};
