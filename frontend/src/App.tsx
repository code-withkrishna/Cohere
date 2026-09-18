import { useEffect, useState } from 'react';
import { StageNumber, CohereState } from './types';
import { getState, simulateDisruption, generateRecovery, resetDemo } from './api/cohereApi';
import { SUPPLY_CHAIN_NODES } from './data/continuityData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SenseStage } from './components/stages/SenseStage';
import { TraceStage } from './components/stages/TraceStage';
import { SimulateStage } from './components/stages/SimulateStage';
import { GovernStage } from './components/stages/GovernStage';
import { VerifyStage } from './components/stages/VerifyStage';
import { AuditTrailModal } from './components/AuditTrailModal';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';

export default function App() {
  const [stage, setStage] = useState<StageNumber>(1);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState<number>(1);
  const [cohereState, setCohereState] = useState<CohereState | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('TRANSFER');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const syncMaxStage = (state: CohereState) => {
    if (state.executed) {
      setMaxUnlockedStage(5);
    } else if (state.approved) {
      setMaxUnlockedStage(4);
    } else if (state.scenarios && state.scenarios.length > 0) {
      setMaxUnlockedStage(3);
    } else if (state.disrupted) {
      setMaxUnlockedStage(2);
    } else {
      setMaxUnlockedStage(1);
    }
  };

  // Initial state fetch on application load
  useEffect(() => {
    setIsLoading(true);
    getState()
      .then((data) => {
        setCohereState(data);
        syncMaxStage(data);
        if (data.recommendation) {
          setSelectedStrategyId(data.recommendation.id);
        }
      })
      .catch((err) => {
        console.error('Failed to load initial COHERE state:', err);
        setGlobalError('Unable to connect to COHERE backend. Please ensure the backend is running.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSimulateDisruption = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const data = await simulateDisruption();
      setCohereState(data);
      setMaxUnlockedStage(2);
      setStage(2);
    } catch (err: any) {
      console.error('Disruption simulation error:', err);
      setGlobalError(err?.message || 'Failed to trigger disruption simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindRecoveryOptions = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const data = await generateRecovery();
      setCohereState(data);
      if (data.recommendation) {
        setSelectedStrategyId(data.recommendation.id);
      }
      setMaxUnlockedStage(3);
      setStage(3);
    } catch (err: any) {
      console.error('Generate recovery error:', err);
      setGlobalError(err?.message || 'Failed to generate recovery options.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToGovern = () => {
    setMaxUnlockedStage(4);
    setStage(4);
  };

  const handleExecutionComplete = (updatedState: CohereState) => {
    setCohereState(updatedState);
    setMaxUnlockedStage(5);
    setStage(5);
  };

  const handleResetDemo = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const data = await resetDemo();
      setCohereState(data);
      setSelectedStrategyId('TRANSFER');
      setMaxUnlockedStage(1);
      setStage(1);
    } catch (err: any) {
      console.error('Reset error:', err);
      setGlobalError(err?.message || 'Failed to reset demo state.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedNode = SUPPLY_CHAIN_NODES.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col justify-between font-sans selection:bg-[#4edea3] selection:text-[#003824]">
      {/* Top Header */}
      <Header
        stage={stage}
        setStage={setStage}
        onReset={handleResetDemo}
        cohereState={cohereState}
        isLoading={isLoading}
      />

      {globalError && (
        <div className="fixed top-18 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg bg-[#93000a] text-white text-sm font-mono border border-red-400 shadow-2xl flex items-center gap-3">
          <span>⚠️ {globalError}</span>
          <button
            onClick={() => setGlobalError(null)}
            className="text-xs underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full pt-16 flex-1 flex flex-col">
        {stage === 1 && (
          <SenseStage
            setStage={setStage}
            cohereState={cohereState}
            onSimulateDisruption={handleSimulateDisruption}
            onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
            isLoading={isLoading}
          />
        )}

        {stage === 2 && (
          <TraceStage
            setStage={setStage}
            cohereState={cohereState}
            onFindRecoveryOptions={handleFindRecoveryOptions}
            isLoading={isLoading}
          />
        )}

        {stage === 3 && (
          <SimulateStage
            setStage={setStage}
            cohereState={cohereState}
            selectedStrategyId={selectedStrategyId}
            setSelectedStrategyId={setSelectedStrategyId}
            onProceedToGovern={handleProceedToGovern}
          />
        )}

        {stage === 4 && (
          <GovernStage
            setStage={setStage}
            cohereState={cohereState}
            selectedStrategyId={selectedStrategyId}
            onExecutionComplete={handleExecutionComplete}
          />
        )}

        {stage === 5 && (
          <VerifyStage
            setStage={setStage}
            cohereState={cohereState}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Footer */}
      <Footer stage={stage} setStage={setStage} maxUnlockedStage={maxUnlockedStage} />

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        events={cohereState?.audit || []}
      />

      {/* Node Detail Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onSimulateDisruption={() => {
          setSelectedNodeId(null);
          handleSimulateDisruption();
        }}
      />
    </div>
  );
}
