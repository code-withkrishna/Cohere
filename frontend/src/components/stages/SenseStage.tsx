import { StageNumber, CohereState } from '../../types';
import { SUPPLY_CHAIN_NODES } from '../../data/continuityData';
import { StageNav } from '../StageNav';
import { ShieldCheck, CheckCircle2, Shield, Zap, ArrowRight, Loader2 } from 'lucide-react';

interface SenseStageProps {
  setStage: (stage: StageNumber) => void;
  cohereState: CohereState | null;
  onSimulateDisruption: () => void;
  onSelectNode: (nodeId: string) => void;
  isLoading?: boolean;
}

export const SenseStage: React.FC<SenseStageProps> = ({
  setStage,
  cohereState,
  onSimulateDisruption,
  onSelectNode,
  isLoading = false,
}) => {
  const runwayDays = cohereState?.impact?.inventory_days ?? 21;
  const activeDisruptions = cohereState?.disrupted ? (cohereState.executed ? 0 : 1) : 0;
  const ordersAtRisk = cohereState?.impact?.affected_orders ?? 0;

  return (
    <div className="relative w-full max-w-[1920px] mx-auto px-6 md:px-12 py-6 md:py-10 flex flex-col items-center justify-between min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[1000px] h-[600px] bg-[#4edea3]/5 rounded-full blur-[140px] transform -translate-y-12" />
        <div className="absolute w-[450px] h-[450px] bg-[#00bd85]/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Header */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d1c2d]/80 border border-[#3c4a42]/30 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="font-mono text-[11px] text-[#4edea3] uppercase tracking-widest font-semibold">
            CONTINUITY LOCK ESTABLISHED
          </span>
          <span className="text-[#3c4a42] font-mono text-[10px] mx-1">|</span>
          <span className="font-mono text-[11px] text-[#bbcabf] font-semibold">
            SYNCHRONIZED WITH BACKEND ENGINE
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-semibold text-white tracking-tight leading-tight mb-4 selection:bg-[#4edea3] selection:text-[#003824]">
          Production is running normally.
        </h1>
        <p className="text-base md:text-lg text-[#bbcabf] max-w-2xl font-light tracking-normal leading-relaxed">
          COHERE continuously monitors critical component dependencies and production continuity across your manufacturing matrix.
        </p>
      </div>

      {/* Interactive Topology Graph (SVG Matrix) */}
      <div className="relative z-10 w-full max-w-5xl my-6 flex flex-col items-center">
        <div className="relative w-full h-[220px] flex items-center justify-center mb-4">
          <svg
            className="w-full h-full"
            viewBox="0 0 960 220"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                <stop offset="30%" stopColor="#4edea3" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#4edea3" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
              </linearGradient>
              <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Connecting paths */}
            <path
              d="M 160 110 C 260 110, 260 110, 360 110"
              stroke="url(#flowGrad)"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              className="opacity-60"
            />
            <path
              d="M 360 110 C 460 110, 460 110, 560 110"
              stroke="url(#flowGrad)"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              className="opacity-60"
            />
            <path
              d="M 560 110 C 660 110, 660 110, 760 110"
              stroke="url(#flowGrad)"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              className="opacity-60"
            />

            {/* Solid baseline */}
            <line
              x1="160"
              y1="110"
              x2="760"
              y2="110"
              stroke="#10b981"
              strokeOpacity="0.2"
              strokeWidth="1"
            />

            {/* Flowing packet dots */}
            <circle cx="260" cy="110" r="2" fill="#4edea3">
              <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0.2;1;0.2" />
            </circle>
            <circle cx="460" cy="110" r="2" fill="#4edea3">
              <animate attributeName="opacity" dur="2.4s" begin="0.8s" repeatCount="indefinite" values="0.2;1;0.2" />
            </circle>
            <circle cx="660" cy="110" r="2" fill="#4edea3">
              <animate attributeName="opacity" dur="2.4s" begin="1.6s" repeatCount="indefinite" values="0.2;1;0.2" />
            </circle>

            {/* Node 1: Tier-1 Suppliers */}
            <g
              transform="translate(160, 110)"
              className="cursor-pointer group"
              onClick={() => onSelectNode('suppliers')}
            >
              <circle r="36" fill="url(#ringGlow)" className="group-hover:scale-110 transition-transform" />
              <circle r="24" className="fill-[#010f1f] stroke-[#3c4a42]/40 group-hover:stroke-[#4edea3]/60 transition-colors" strokeWidth="1" />
              <circle r="20" className="fill-[#0d1c2d] stroke-[#4edea3]/30" strokeWidth="1" />
              <circle r="4" className="fill-[#4edea3]" />
              <circle r="12" className="stroke-[#4edea3]/40 animate-ping" strokeWidth="0.75" style={{ animationDuration: '3s' }} />
              <text y="-36" textAnchor="middle" className="fill-[#bbcabf] font-mono text-[10px] tracking-wider uppercase font-semibold">
                TIER-1 SUPPLIERS
              </text>
              <text y="42" textAnchor="middle" className="fill-[#4edea3] font-mono text-[11px] font-medium">
                STABLE (3 Suppliers)
              </text>
            </g>

            {/* Node 2: BOM */}
            <g
              transform="translate(360, 110)"
              className="cursor-pointer group"
              onClick={() => onSelectNode('bom')}
            >
              <circle r="36" fill="url(#ringGlow)" className="group-hover:scale-110 transition-transform" />
              <circle r="24" className="fill-[#010f1f] stroke-[#3c4a42]/40 group-hover:stroke-[#4edea3]/60 transition-colors" strokeWidth="1" />
              <circle r="20" className="fill-[#0d1c2d] stroke-[#4edea3]/30" strokeWidth="1" />
              <circle r="4" className="fill-[#4edea3]" />
              <circle r="12" className="stroke-[#4edea3]/40 animate-ping" strokeWidth="0.75" style={{ animationDuration: '3.4s' }} />
              <text y="-36" textAnchor="middle" className="fill-[#bbcabf] font-mono text-[10px] tracking-wider uppercase font-semibold">
                CRITICAL BILL-OF-MATERIALS
              </text>
              <text y="42" textAnchor="middle" className="fill-[#4edea3] font-mono text-[11px] font-medium">
                MC-204 MAPPED
              </text>
            </g>

            {/* Node 3: Assembly Plants */}
            <g
              transform="translate(560, 110)"
              className="cursor-pointer group"
              onClick={() => onSelectNode('plants')}
            >
              <circle r="36" fill="url(#ringGlow)" className="group-hover:scale-110 transition-transform" />
              <circle r="24" className="fill-[#010f1f] stroke-[#3c4a42]/40 group-hover:stroke-[#4edea3]/60 transition-colors" strokeWidth="1" />
              <circle r="20" className="fill-[#0d1c2d] stroke-[#4edea3]/30" strokeWidth="1" />
              <circle r="4" className="fill-[#4edea3]" />
              <circle r="12" className="stroke-[#4edea3]/40 animate-ping" strokeWidth="0.75" style={{ animationDuration: '3.8s' }} />
              <text y="-36" textAnchor="middle" className="fill-[#bbcabf] font-mono text-[10px] tracking-wider uppercase font-semibold">
                ASSEMBLY PLANTS
              </text>
              <text y="42" textAnchor="middle" className="fill-[#4edea3] font-mono text-[11px] font-medium">
                NOMINAL (3 Plants)
              </text>
            </g>

            {/* Node 4: Fulfillment Dispatch */}
            <g
              transform="translate(760, 110)"
              className="cursor-pointer group"
              onClick={() => onSelectNode('dispatch')}
            >
              <circle r="36" fill="url(#ringGlow)" className="group-hover:scale-110 transition-transform" />
              <circle r="24" className="fill-[#010f1f] stroke-[#3c4a42]/40 group-hover:stroke-[#4edea3]/60 transition-colors" strokeWidth="1" />
              <circle r="20" className="fill-[#0d1c2d] stroke-[#4edea3]/30" strokeWidth="1" />
              <circle r="4" className="fill-[#4edea3]" />
              <circle r="12" className="stroke-[#4edea3]/40 animate-ping" strokeWidth="0.75" style={{ animationDuration: '4.2s' }} />
              <text y="-36" textAnchor="middle" className="fill-[#bbcabf] font-mono text-[10px] tracking-wider uppercase font-semibold">
                CUSTOMER ORDERS
              </text>
              <text y="42" textAnchor="middle" className="fill-[#4edea3] font-mono text-[11px] font-medium">
                100% UNIMPEDED
              </text>
            </g>
          </svg>
        </div>

        {/* METRICS TRIAD (3 key indicators driven by backend state) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Metric 1 */}
          <div className="relative group p-6 rounded bg-[#0d1c2d]/50 border border-[#3c4a42]/30 backdrop-blur-md transition-all duration-300 hover:border-[#4edea3]/40 hover:bg-[#0d1c2d]/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] text-[#bbcabf] tracking-wider uppercase font-semibold">
                Production Runway
              </span>
              <div className="flex items-center gap-1 text-[#4edea3]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-mono text-[11px] font-medium text-[#4edea3]">OPTIMAL</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-4xl md:text-5xl font-medium text-white tracking-tight">
                {runwayDays}
              </span>
              <span className="text-xl text-[#bbcabf] font-normal">days</span>
            </div>
            <div className="mt-4 w-full bg-[#273647]/40 h-1 rounded-full overflow-hidden">
              <div className="bg-[#4edea3] h-full rounded-full w-[85%]" />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="relative group p-6 rounded bg-[#0d1c2d]/50 border border-[#3c4a42]/30 backdrop-blur-md transition-all duration-300 hover:border-[#4edea3]/40 hover:bg-[#0d1c2d]/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] text-[#bbcabf] tracking-wider uppercase font-semibold">
                Active Disruptions
              </span>
              <div className="flex items-center gap-1 text-[#4edea3]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-mono text-[11px] font-medium text-[#4edea3]">ZERO TOLERANCE</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-4xl md:text-5xl font-medium text-white tracking-tight">
                {activeDisruptions}
              </span>
              <span className="text-sm text-[#bbcabf]">incidents</span>
            </div>
            <div className="mt-4 w-full bg-[#273647]/40 h-1 rounded-full overflow-hidden">
              <div className="bg-[#4edea3] h-full rounded-full w-full" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="relative group p-6 rounded bg-[#0d1c2d]/50 border border-[#3c4a42]/30 backdrop-blur-md transition-all duration-300 hover:border-[#4edea3]/40 hover:bg-[#0d1c2d]/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] text-[#bbcabf] tracking-wider uppercase font-semibold">
                Orders at Risk
              </span>
              <div className="flex items-center gap-1 text-[#4edea3]">
                <Shield className="w-4 h-4" />
                <span className="font-mono text-[11px] font-medium text-[#4edea3]">PROTECTED</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-4xl md:text-5xl font-medium text-white tracking-tight">
                {ordersAtRisk}
              </span>
              <span className="text-sm text-[#bbcabf]">units</span>
            </div>
            <div className="mt-4 w-full bg-[#273647]/40 h-1 rounded-full overflow-hidden">
              <div className="bg-[#4edea3] h-full rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA: Simulate Supplier Failure */}
      <div className="relative z-10 flex flex-col items-center text-center my-4">
        <button
          onClick={onSimulateDisruption}
          disabled={isLoading}
          className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded bg-[#0d1c2d] border border-[#3c4a42]/50 shadow-xl transition-all duration-300 hover:border-[#4edea3] hover:bg-[#122131] hover:shadow-[#4edea3]/10 hover:shadow-2xl active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          id="simulate-btn"
          type="button"
        >
          <span className="absolute inset-0 rounded bg-gradient-to-r from-[#4edea3]/10 via-transparent to-[#4edea3]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[#4edea3] animate-spin" />
          ) : (
            <Zap className="w-5 h-5 text-[#4edea3] transition-transform group-hover:rotate-12" />
          )}
          <span className="text-base text-white font-semibold tracking-wide">
            {isLoading ? 'Simulating Disruption...' : 'Simulate Supplier Failure'}
          </span>
          <ArrowRight className="w-4 h-4 text-[#bbcabf] group-hover:translate-x-1 group-hover:text-[#4edea3] transition-all" />
        </button>

        <p className="text-xs text-[#bbcabf] mt-3 tracking-normal font-sans">
          Trigger real-time blast-radius simulation for <span className="font-mono text-[#4edea3]">Alpha Components (MC-204)</span> via COHERE engine.
        </p>
      </div>

      {/* Lifecycle stepper at bottom of stage 1 */}
      <StageNav currentStage={1} setStage={setStage} variant="linear-dots" maxUnlockedStage={1} />
    </div>
  );
};
