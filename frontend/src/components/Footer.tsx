import { StageNumber } from '../types';
import { StageNav } from './StageNav';

interface FooterProps {
  stage: StageNumber;
  setStage: (stage: StageNumber) => void;
  maxUnlockedStage?: number;
}

export const Footer: React.FC<FooterProps> = ({ stage, setStage, maxUnlockedStage = 5 }) => {
  if (stage === 5) {
    return (
      <footer className="w-full border-t border-[#3c4a42]/30 bg-[#051424]/95 backdrop-blur-md px-6 md:px-12 py-3.5 z-20 mt-auto">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <StageNav currentStage={stage} setStage={setStage} variant="lifecycle-footer" maxUnlockedStage={maxUnlockedStage} />

          <div className="text-[11px] font-mono text-[#bbcabf] flex items-center space-x-3">
            <span>COHERE // PRODUCTION CONTINUITY ENGINE</span>
            <span>•</span>
            <span className="text-[#4edea3] font-semibold">STAGE 05: CONTINUITY PROTECTED</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#010f1f] border-t border-[#3c4a42]/20 py-4 z-20 mt-auto">
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-[11px] text-[#bbcabf]">
        <span>
          {stage === 1
            ? 'COHERE CONTINUITY ENGINE // TIER-1 INFRASTRUCTURE MONITORING'
            : stage === 2
            ? 'COHERE // BLAST-RADIUS DEPENDENCY TRACE'
            : stage === 3
            ? 'COHERE // DETERMINISTIC RECOVERY SIMULATION'
            : 'COHERE // HUMAN-IN-THE-LOOP GOVERNANCE'}
        </span>
        <div className="flex items-center gap-6">
          {stage === 2 ? (
            <span className="text-[#ffb4ab] font-semibold">STAGE 02: DISRUPTION TRACE</span>
          ) : stage === 3 ? (
            <span className="text-[#4edea3]">STAGE 03: RECOVERY SIMULATE</span>
          ) : stage === 4 ? (
            <span className="text-[#4edea3]">STAGE 04: GOVERN & EXECUTE</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              SYSTEM NOMINAL
            </span>
          )}
        </div>
      </div>
    </footer>
  );
};
