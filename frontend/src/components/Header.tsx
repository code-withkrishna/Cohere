import { useState, useEffect } from 'react';
import { StageNumber, CohereState } from '../types';
import { RefreshCw, User, RotateCcw, AlertCircle } from 'lucide-react';

interface HeaderProps {
  stage: StageNumber;
  setStage: (stage: StageNumber) => void;
  onReset: () => void;
  cohereState: CohereState | null;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stage,
  setStage,
  onReset,
  cohereState,
  isLoading = false,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yy = String(now.getUTCFullYear()).slice(-2);
      const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(now.getUTCDate()).padStart(2, '0');
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const min = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`${yy}.${mm}.${dd} ${hh}:${min}:${ss} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDisrupted = cohereState?.disrupted ?? false;
  const isExecuted = cohereState?.executed ?? false;

  return (
    <header className="fixed top-0 w-full z-50 bg-[#010f1f]/90 backdrop-blur-xl border-b border-[#3c4a42]/30">
      <div className="h-16 w-full max-w-[1920px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setStage(1)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            title="Go to Stage 1: Sense"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#122131] border border-[#3c4a42]/50 text-[#4edea3] transition-colors group-hover:border-[#4edea3]/60">
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="7" cy="7" r="3" />
                <circle cx="17" cy="7" r="3" />
                <circle cx="12" cy="17" r="3" />
                <path d="M9.5 8.5L14.5 8.5M8.5 9.5L10.5 14.5M15.5 9.5L13.5 14.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[#d4e4fa] uppercase">
                COHERE
              </span>
              <span className="text-[11px] font-mono text-[#bbcabf]">
                Production Continuity Engine
              </span>
            </div>
          </button>

          {/* Context & Synthetic Scenario Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1c2d] border border-[#3c4a42]/40">
            <span className="font-mono text-[11px] text-[#4edea3] font-medium tracking-wide">
              Toyota × DENSO Context
            </span>
            <span className="text-[#3c4a42] text-[10px]">|</span>
            <div className="flex items-center gap-1 text-amber-400/90">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                Simulated Scenario • Synthetic Data
              </span>
            </div>
          </div>
        </div>

        {/* Right status & telemetry */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Status Indicator */}
          {isExecuted ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0d1c2d]/80 border border-[#4edea3]/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
              </span>
              <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold tracking-wide">
                Continuity Protected
              </span>
            </div>
          ) : isDisrupted ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0d1c2d]/80 border border-[#ffb4ab]/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb4ab] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb4ab]"></span>
              </span>
              <span className="font-mono text-[11px] text-[#ffb4ab] uppercase font-semibold tracking-wide">
                Disruption Active
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0d1c2d]/60 border border-[#3c4a42]/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
              </span>
              <span className="font-mono text-[11px] text-[#4edea3] uppercase font-semibold tracking-wide">
                Normal Operations
              </span>
            </div>
          )}

          {/* Reset Demo CTA in Header */}
          {(isDisrupted || stage > 1) && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#122131] hover:bg-[#1c2b3c] text-[#bbcabf] hover:text-white border border-[#3c4a42]/40 font-mono text-xs uppercase cursor-pointer transition-colors"
              title="Reset state to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <RefreshCw className="w-3.5 h-3.5 text-[#4edea3] animate-[spin_12s_linear_infinite]" />
            <span>{timeStr}</span>
          </div>

          <div className="h-4 w-px bg-[#3c4a42]/40 hidden md:block" />

          {/* User Profile avatar */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDisrupted && !isExecuted
                  ? 'bg-[#122131] border border-[#ffb4ab]/40 text-[#ffb4ab]'
                  : 'bg-[#4edea3] text-[#003824]'
              }`}
              title="Continuity Operator (Toyota Supply Planner)"
            >
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
