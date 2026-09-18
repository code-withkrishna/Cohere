import { BackendAuthEvent } from '../types';
import { X, ShieldCheck, AlertTriangle, Info, CheckCircle2, Clock, UserCheck } from 'lucide-react';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: BackendAuthEvent[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  events,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010f1f]/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0d1c2d] border border-[#3c4a42] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3c4a42]/40 bg-[#07090e]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
            <div>
              <h3 className="text-base font-semibold text-white">COHERE Verified Audit Log</h3>
              <p className="text-xs font-mono text-[#bbcabf]">
                Authoritative Audit Trail • Deterministic Recovery Records ({events.length} Events)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#122131] text-[#bbcabf] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Events List */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          {events.length === 0 ? (
            <div className="p-8 text-center text-[#bbcabf]">No audit events recorded yet.</div>
          ) : (
            events.map((evt, idx) => {
              const isAlert =
                evt.event === 'DISRUPTION_DETECTED' || evt.event === 'IMPACT_ANALYSIS';
              const isSuccess =
                evt.event === 'RECOVERY_VERIFIED' ||
                evt.event === 'HUMAN_APPROVAL' ||
                evt.event === 'COMPLIANCE_CHECK' ||
                evt.event === 'EXECUTION' ||
                evt.event === 'DIGITAL_TWIN_UPDATED';

              return (
                <div
                  key={`${evt.event}-${evt.timestamp}-${idx}`}
                  className="p-4 rounded-lg bg-[#122131] border border-[#3c4a42]/30 flex items-start gap-3.5 relative"
                >
                  <div className="mt-0.5 shrink-0">
                    {isAlert ? (
                      <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : isSuccess ? (
                      <div className="w-6 h-6 rounded-full bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#4edea3] uppercase font-semibold">
                        {evt.event.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-[#bbcabf] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evt.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#86948a]">
                      <UserCheck className="w-3 h-3 text-[#4edea3]" />
                      <span>Actor: {evt.actor}</span>
                    </div>
                    <p className="text-xs text-[#d4e4fa] font-sans leading-relaxed pt-1">
                      {evt.detail}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#3c4a42]/40 bg-[#07090e]">
          <span className="text-[11px] font-mono text-[#bbcabf]">
            Backend Audit Engine: <span className="text-[#4edea3]">SYNCHRONIZED</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#122131] hover:bg-[#1c2b3c] text-white font-mono text-xs cursor-pointer transition-colors border border-[#3c4a42]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
