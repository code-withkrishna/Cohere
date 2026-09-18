import { StageNumber, CohereState } from '../../types';
import { StageNav } from '../StageNav';
import {
  AlertTriangle,
  Clock,
  Package,
  IndianRupee,
  Network,
  Factory,
  Cpu,
  Layers,
  Truck,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface TraceStageProps {
  setStage: (stage: StageNumber) => void;
  cohereState: CohereState | null;
  onFindRecoveryOptions: () => void;
  isLoading?: boolean;
}

export const TraceStage: React.FC<TraceStageProps> = ({
  setStage,
  cohereState,
  onFindRecoveryOptions,
  isLoading = false,
}) => {
  const impact = cohereState?.impact;
  const supplierName = impact?.supplier || 'Alpha Components';
  const componentCode = impact?.component || 'MC-204';
  const componentName = impact?.component_name || 'Control Processor';
  const downtimeDays = impact?.supplier_recovery_days || 18;
  const lineStopDays = impact?.line_stop_days ?? 3.4;
  const ordersAtRisk = impact?.affected_orders ?? 4;
  const orderExposureVal = impact?.affected_order_value ?? 5870000;
  const orderExposureLakh = (orderExposureVal / 100000).toFixed(1);

  const affectedPlants = impact?.plants && impact.plants.length > 0 ? impact.plants : ['Chennai-01'];
  const primaryPlant = affectedPlants[0] || 'Chennai-01';

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
      {/* Incident Primary Header & Summary Banner */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#93000a]/40 text-[#ffb4ab] font-mono text-[11px] tracking-wider uppercase font-semibold border border-[#ffb4ab]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]" />
              CRITICAL DISRUPTION IDENTIFIED
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-[56px] text-[#d4e4fa] font-semibold tracking-tight mt-1">
            {supplierName}
          </h1>
          <p className="text-lg md:text-xl text-[#bbcabf] font-normal">
            {componentCode} — {componentName}
          </p>
        </div>

        {/* Banner with left red bar */}
        <div className="relative overflow-hidden p-5 md:p-6 rounded bg-[#0d1c2d] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md border border-[#3c4a42]/20">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-[#ffb4ab]" />
          <div className="flex items-center gap-4 pl-2">
            <div className="w-10 h-10 rounded flex items-center justify-center bg-[#93000a]/30 text-[#ffb4ab] shrink-0 border border-[#ffb4ab]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-[#d4e4fa]">
                Supplier unavailable for {downtimeDays} days
              </span>
              <p className="text-sm text-[#bbcabf]">
                {affectedPlants.length} manufacturing facilities exposed. Urgent inventory or sourcing intervention required to avoid line stoppage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Operational Impact Pedestals (Authoritative backend values) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Time to Line Stop */}
        <div className="relative p-6 rounded bg-[#0d1c2d] flex flex-col justify-between overflow-hidden shadow-sm border border-[#3c4a42]/20">
          <div className="absolute top-0 right-0 p-4 text-[#ffb4ab]/20 pointer-events-none">
            <Clock className="w-12 h-12" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] text-[#ffb4ab] uppercase font-semibold tracking-wider">
              TIME TO LINE STOP
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-4xl md:text-5xl text-[#ffb4ab] font-medium">
                {lineStopDays}
              </span>
              <span className="text-xl text-[#ffb4ab]/80 uppercase">days</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#3c4a42]/20 text-[#bbcabf] text-xs">
            Remaining component inventory at {primaryPlant}
          </div>
        </div>

        {/* Metric 2: Orders at Risk */}
        <div className="relative p-6 rounded bg-[#0d1c2d] flex flex-col justify-between overflow-hidden shadow-sm border border-[#3c4a42]/20">
          <div className="absolute top-0 right-0 p-4 text-[#bbcabf]/20 pointer-events-none">
            <Package className="w-12 h-12" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] text-[#45dfa4] uppercase font-semibold tracking-wider">
              ORDERS AT RISK
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-4xl md:text-5xl text-[#d4e4fa] font-medium">
                {ordersAtRisk}
              </span>
              <span className="text-xl text-[#bbcabf] uppercase">orders</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#3c4a42]/20 text-[#bbcabf] text-xs">
            Committed deliveries directly impacted across plants
          </div>
        </div>

        {/* Metric 3: Order Exposure */}
        <div className="relative p-6 rounded bg-[#0d1c2d] flex flex-col justify-between overflow-hidden shadow-sm border border-[#3c4a42]/20">
          <div className="absolute top-0 right-0 p-4 text-[#4edea3]/20 pointer-events-none">
            <IndianRupee className="w-12 h-12" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold tracking-wider">
              ORDER EXPOSURE
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-4xl md:text-5xl text-[#4edea3] font-medium">
                ₹{orderExposureLakh}
              </span>
              <span className="text-xl text-[#4edea3]/80 uppercase">lakh</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#3c4a42]/20 text-[#bbcabf] text-xs">
            Total value of impacted customer delivery schedules
          </div>
        </div>
      </div>

      {/* Main Focal Area: Dependency Trace (Left to Right Flow) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#4edea3]" />
            <span className="font-mono text-[11px] text-[#d4e4fa] uppercase tracking-wider font-semibold">
              DEPENDENCY TRACE (IMPACT GRAPH)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#bbcabf]">
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]" />
            <span>Critical Disruption Path</span>
          </div>
        </div>

        {/* Horizontal Flow Container */}
        <div className="w-full rounded bg-[#010f1f] p-6 shadow-inner relative border border-[#3c4a42]/20 overflow-x-auto">
          <div className="min-w-[1040px] flex items-center justify-between gap-2 py-4">
            {/* Node 1: Supplier */}
            <div className="flex-1 max-w-[210px] p-4 rounded bg-[#0d1c2d] border border-[#ffb4ab]/40 flex flex-col gap-1.5 relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb4ab]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#ffb4ab] font-semibold uppercase tracking-wider">
                  01 // SUPPLIER
                </span>
                <Factory className="w-4 h-4 text-[#ffb4ab]" />
              </div>
              <span className="text-sm font-semibold text-[#d4e4fa] truncate">
                {supplierName}
              </span>
              <span className="text-xs text-[#bbcabf]">Primary Supplier</span>
              <span className="font-mono text-[11px] text-[#ffb4ab] mt-1">
                Unavailable ({downtimeDays}d)
              </span>
            </div>

            {/* Connector 1 -> 2 */}
            <div className="flex items-center justify-center px-1 text-[#ffb4ab]/80 shrink-0">
              <ArrowRight className="w-6 h-6" />
            </div>

            {/* Node 2: Component */}
            <div className="flex-1 max-w-[210px] p-4 rounded bg-[#0d1c2d] border border-[#ffb4ab]/30 flex flex-col gap-1.5 relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb4ab]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#bbcabf] font-semibold uppercase tracking-wider">
                  02 // COMPONENT
                </span>
                <Cpu className="w-4 h-4 text-[#ffb4ab]" />
              </div>
              <span className="text-sm font-semibold text-[#d4e4fa]">
                {componentCode}
              </span>
              <span className="text-xs text-[#bbcabf]">{componentName}</span>
              <span className="font-mono text-[11px] text-[#ffb4ab] mt-1">
                Stock Depleting
              </span>
            </div>

            {/* Connector 2 -> 3 */}
            <div className="flex items-center justify-center px-1 text-[#ffb4ab]/80 shrink-0">
              <ArrowRight className="w-6 h-6" />
            </div>

            {/* Node 3: BOM / Assembly */}
            <div className="flex-1 max-w-[210px] p-4 rounded bg-[#0d1c2d] border border-[#3c4a42]/30 flex flex-col gap-1.5 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#bbcabf] font-semibold uppercase tracking-wider">
                  03 // BILL OF MATERIALS
                </span>
                <Layers className="w-4 h-4 text-[#bbcabf]" />
              </div>
              <span className="text-sm font-semibold text-[#d4e4fa]">
                BOM-204
              </span>
              <span className="text-xs text-[#bbcabf]">AlphaPhone / Tablet</span>
              <span className="font-mono text-[11px] text-[#bbcabf] mt-1">
                Critical Dependency
              </span>
            </div>

            {/* Connector 3 -> 4 */}
            <div className="flex items-center justify-center px-1 text-[#ffb4ab] shrink-0">
              <ArrowRight className="w-6 h-6" />
            </div>

            {/* Node 4: Production Plant (Highlighted) */}
            <div className="flex-1 max-w-[240px] p-4 rounded bg-[#0d1c2d] border-2 border-[#ffb4ab] flex flex-col gap-1.5 relative overflow-hidden shadow-lg ring-1 ring-[#ffb4ab]/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#ffb4ab] font-bold uppercase tracking-wider">
                  04 // PRODUCTION PLANT
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[10px] font-bold">
                  AT RISK
                </span>
              </div>
              <span className="text-sm font-semibold text-[#d4e4fa]">
                {primaryPlant}
              </span>
              <span className="text-xs text-[#bbcabf]">Assembly Facility</span>
              <div className="mt-1 pt-2 border-t border-[#ffb4ab]/20 flex items-center justify-between">
                <span className="font-mono text-sm text-[#ffb4ab] font-bold">
                  {lineStopDays} DAYS LEFT
                </span>
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
              </div>
            </div>

            {/* Connector 4 -> 5 */}
            <div className="flex items-center justify-center px-1 text-[#ffb4ab]/80 shrink-0">
              <ArrowRight className="w-6 h-6" />
            </div>

            {/* Node 5: Customer Orders */}
            <div className="flex-1 max-w-[210px] p-4 rounded bg-[#0d1c2d] border border-[#3c4a42]/30 flex flex-col gap-1.5 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#bbcabf] font-semibold uppercase tracking-wider">
                  05 // CUSTOMER DELIVERIES
                </span>
                <Truck className="w-4 h-4 text-[#4edea3]" />
              </div>
              <span className="text-sm font-semibold text-[#d4e4fa]">
                {ordersAtRisk} Customer Orders
              </span>
              <span className="text-xs text-[#bbcabf]">Committed Orders</span>
              <span className="font-mono text-[11px] text-[#4edea3] font-semibold mt-1">
                ₹{orderExposureLakh}L Total Exposure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Action Area */}
      <div className="flex flex-col items-center justify-center pt-3 pb-4 gap-2 text-center">
        <p className="text-base md:text-lg text-[#d4e4fa] font-normal">
          Production continuity is at risk.
        </p>
        <button
          onClick={onFindRecoveryOptions}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#4edea3] text-[#003824] text-base font-semibold hover:bg-[#6ffbbe] transition-all shadow-lg hover:shadow-[#4edea3]/25 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          id="find-recovery-btn"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
          <span>{isLoading ? 'Generating Recovery Options...' : 'Find Recovery Options →'}</span>
        </button>
      </div>

      {/* Bottom Stepper: Production Continuity Lifecycle */}
      <StageNav currentStage={2} setStage={setStage} variant="pipeline-boxes" maxUnlockedStage={2} />
    </div>
  );
};
