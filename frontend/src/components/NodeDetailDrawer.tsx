import { SupplyNode } from '../types';
import { X, CheckCircle2, ShieldAlert, Cpu, Factory, Truck } from 'lucide-react';

interface NodeDetailDrawerProps {
  node: SupplyNode | null;
  onClose: () => void;
  onSimulateDisruption?: () => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  onClose,
  onSimulateDisruption,
}) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#010f1f]/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md h-full bg-[#0d1c2d] border-l border-[#3c4a42] p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#122131] border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
                {node.category === 'supplier' ? (
                  <Factory className="w-5 h-5" />
                ) : node.category === 'bom' ? (
                  <Cpu className="w-5 h-5" />
                ) : node.category === 'plant' ? (
                  <Factory className="w-5 h-5" />
                ) : (
                  <Truck className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider font-semibold">
                  TOPOLOGY NODE INSPECTOR
                </span>
                <h3 className="text-lg font-semibold text-white tracking-tight">{node.name}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#122131] text-[#bbcabf] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Node Health Score Card */}
          <div className="p-4 rounded-lg bg-[#122131] border border-[#3c4a42]/40 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-[#bbcabf] uppercase block">Operational Status</span>
              <span className="text-sm font-semibold text-[#4edea3] flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                {node.metrics.label}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#bbcabf] uppercase block">Continuity Score</span>
              <span className="text-xl font-bold text-white">{node.details.healthScore}/100</span>
            </div>
          </div>

          {/* Detailed Telemetry Parameters */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[11px] uppercase tracking-wider text-[#bbcabf] font-semibold">
              Live Node Telemetry
            </div>

            {node.details.location && (
              <div className="p-3 bg-[#07090e] rounded border border-[#3c4a42]/30 flex justify-between">
                <span className="text-slate-400">Jurisdiction / Location:</span>
                <span className="text-white text-right font-medium max-w-[200px]">
                  {node.details.location}
                </span>
              </div>
            )}

            {node.details.capacity && (
              <div className="p-3 bg-[#07090e] rounded border border-[#3c4a42]/30 flex justify-between">
                <span className="text-slate-400">Production Rate:</span>
                <span className="text-[#4edea3] text-right font-medium">
                  {node.details.capacity}
                </span>
              </div>
            )}

            {node.details.runway && (
              <div className="p-3 bg-[#07090e] rounded border border-[#3c4a42]/30 flex justify-between">
                <span className="text-slate-400">Inventory Runway:</span>
                <span className="text-white text-right font-medium">{node.details.runway}</span>
              </div>
            )}

            {node.details.leadTime && (
              <div className="p-3 bg-[#07090e] rounded border border-[#3c4a42]/30 flex justify-between">
                <span className="text-slate-400">Average Transit:</span>
                <span className="text-white text-right font-medium">{node.details.leadTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="pt-6 border-t border-[#3c4a42]/30 space-y-2">
          {onSimulateDisruption && (
            <button
              onClick={() => {
                onClose();
                onSimulateDisruption();
              }}
              className="w-full py-2.5 px-4 rounded bg-[#93000a]/40 hover:bg-[#93000a]/60 text-[#ffb4ab] border border-[#ffb4ab]/30 font-mono text-xs font-semibold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Trigger Disruption Simulation</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded bg-[#122131] hover:bg-[#1c2b3c] text-white font-mono text-xs uppercase transition-colors cursor-pointer border border-[#3c4a42]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
