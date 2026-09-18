import { StageNumber } from '../types';
import { Check, Radio } from 'lucide-react';

interface StageNavProps {
  currentStage: StageNumber;
  setStage: (stage: StageNumber) => void;
  variant?: 'linear-dots' | 'pipeline-boxes' | 'lifecycle-footer';
  maxUnlockedStage?: number;
}

const STAGES = [
  { num: 1 as StageNumber, key: 'SENSE', label: 'Sense', desc: 'Normal Operations' },
  { num: 2 as StageNumber, key: 'TRACE', label: 'Trace', desc: 'Disruption Tracing' },
  { num: 3 as StageNumber, key: 'SIMULATE', label: 'Simulate', desc: 'Impact & Options' },
  { num: 4 as StageNumber, key: 'GOVERN', label: 'Govern', desc: 'Human Approval Gate' },
  { num: 5 as StageNumber, key: 'VERIFY', label: 'Verify', desc: 'Continuity Verified' },
];

export const StageNav: React.FC<StageNavProps> = ({
  currentStage,
  setStage,
  variant = 'pipeline-boxes',
  maxUnlockedStage = 5,
}) => {
  const handleStageClick = (targetStage: StageNumber) => {
    // Only allow navigation to stages that are unlocked based on workflow progression
    if (targetStage <= maxUnlockedStage) {
      setStage(targetStage);
    }
  };

  if (variant === 'linear-dots') {
    return (
      <div className="w-full max-w-4xl pt-8 mt-4 border-t border-[#3c4a42]/20">
        <div className="flex items-center justify-between px-2 overflow-x-auto">
          {STAGES.map((s, idx) => {
            const isActive = currentStage === s.num;
            const isCompleted = currentStage > s.num;
            const isLocked = s.num > maxUnlockedStage;

            return (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => handleStageClick(s.num)}
                  disabled={isLocked}
                  className={`flex items-center gap-1.5 focus:outline-none transition-all ${
                    isLocked
                      ? 'text-[#bbcabf]/30 cursor-not-allowed'
                      : isActive
                      ? 'text-[#4edea3] cursor-pointer'
                      : isCompleted
                      ? 'text-[#bbcabf] hover:text-[#4edea3] cursor-pointer'
                      : 'text-[#bbcabf]/50 hover:text-[#bbcabf] cursor-pointer'
                  }`}
                  title={`Stage ${s.num}: ${s.label}`}
                >
                  {isActive ? (
                    <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-[#4edea3]/20 border border-[#4edea3]/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#4edea3]/20 text-[#4edea3]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3c4a42]/60" />
                  )}
                  <span className="font-mono text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap">
                    {s.num}. {s.key}
                  </span>
                </button>

                {idx < STAGES.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-3 ${
                      isCompleted
                        ? 'bg-[#4edea3]/40'
                        : isActive
                        ? 'bg-gradient-to-r from-[#4edea3]/40 to-[#3c4a42]/30'
                        : 'bg-[#3c4a42]/20'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'lifecycle-footer') {
    return (
      <div className="flex items-center space-x-1.5 md:space-x-3 font-mono text-xs overflow-x-auto">
        {STAGES.map((s, idx) => {
          const isCurrent = currentStage === s.num;
          const isPassed = currentStage >= s.num;
          const isLocked = s.num > maxUnlockedStage;

          return (
            <div key={s.num} className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => handleStageClick(s.num)}
                disabled={isLocked}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded transition-colors ${
                  isLocked
                    ? 'text-[#bbcabf]/30 cursor-not-allowed'
                    : isCurrent
                    ? 'text-[#4edea3] bg-[#4edea3]/15 border border-[#4edea3]/40 font-semibold cursor-pointer'
                    : isPassed
                    ? 'text-[#d4e4fa] hover:text-[#4edea3] cursor-pointer'
                    : 'text-[#bbcabf]/50 hover:text-[#bbcabf] cursor-pointer'
                }`}
              >
                {isPassed && <span className="text-[#4edea3] font-semibold">✓</span>}
                <span>{s.label}</span>
              </button>
              {idx < STAGES.length - 1 && <span className="text-slate-700">→</span>}
            </div>
          );
        })}
      </div>
    );
  }

  // Default: pipeline-boxes (5 columns)
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between font-mono text-[11px] text-[#bbcabf] px-1">
        <span className="uppercase tracking-wider">CONTINUITY WORKFLOW PIPELINE</span>
        <span className="uppercase tracking-wider text-[#4edea3]">
          STAGE 0{currentStage} OF 05 // {STAGES[currentStage - 1]?.key}{' '}
          {currentStage === 5 ? 'VERIFIED' : 'ACTIVE'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
        {STAGES.map((s) => {
          const isActive = currentStage === s.num;
          const isCompleted = currentStage > s.num;
          const isLocked = s.num > maxUnlockedStage;

          return (
            <button
              key={s.num}
              onClick={() => handleStageClick(s.num)}
              disabled={isLocked}
              className={`p-3 rounded text-left transition-all border ${
                isLocked
                  ? 'bg-[#010f1f]/50 border-[#3c4a42]/10 opacity-40 cursor-not-allowed'
                  : isActive
                  ? 'bg-[#1c2b3c] ring-1 ring-[#4edea3] border-[#4edea3]/40 shadow-md cursor-pointer'
                  : isCompleted
                  ? 'bg-[#0d1c2d] border-[#3c4a42]/30 hover:border-[#4edea3]/40 cursor-pointer'
                  : 'bg-[#010f1f]/80 border-[#3c4a42]/20 opacity-60 hover:opacity-90 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-mono text-[10px] ${
                    isActive
                      ? 'text-[#4edea3] font-semibold'
                      : isCompleted
                      ? 'text-[#4edea3]'
                      : 'text-[#86948a]'
                  }`}
                >
                  0{s.num} // {s.key}
                </span>
                {isActive ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
                  </span>
                ) : isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-[#86948a]/60" />
                )}
              </div>
              <div
                className={`text-sm ${
                  isActive
                    ? 'text-[#4edea3] font-semibold'
                    : isCompleted
                    ? 'text-[#d4e4fa] font-medium'
                    : 'text-[#bbcabf]'
                }`}
              >
                {s.label}
              </div>
              <div className="text-[11px] font-mono text-[#86948a] mt-0.5">
                {isActive ? (
                  <span className="text-[#4edea3]">Active Gate</span>
                ) : isCompleted ? (
                  <span className="text-[#4edea3]/80">Complete</span>
                ) : isLocked ? (
                  <span>Locked</span>
                ) : (
                  <span>Available</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
