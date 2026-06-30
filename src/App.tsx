import { useState, useCallback } from 'react';
import { Nav } from './components/Nav';
import { InputForm } from './components/InputForm';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ResultsView } from './components/ResultsView';
import { HistoryPanel } from './components/HistoryPanel';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { generateAssistant, loadSession } from './services/generateService';
import type { GeneratedAssistant } from './types';

type AppState = 'idle' | 'generating' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<GeneratedAssistant | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleGenerate = useCallback(async (description: string) => {
    setAppState('generating');
    try {
      const data = await generateAssistant(description);
      setResult(data);
      setAppState('results');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      addToast(msg, 'error');
      setAppState('idle');
    }
  }, [addToast]);

  const handleSelectHistory = useCallback(async (sessionId: string) => {
    setAppState('generating');
    try {
      const data = await loadSession(sessionId);
      setResult(data);
      setAppState('results');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load session.';
      addToast(msg, 'error');
      setAppState('idle');
    }
  }, [addToast]);

  const handleDeletedSession = useCallback((sessionId: string) => {
    if (result?.session.id === sessionId) {
      setResult(null);
      setAppState('idle');
    }
    addToast('Session deleted.', 'info');
  }, [result, addToast]);

  const handleReset = useCallback(() => {
    setResult(null);
    setAppState('idle');
  }, []);

  return (
    <div className="min-h-screen bg-surface-950">
      <Nav
        onHistoryOpen={() => setHistoryOpen(true)}
        hasHistory={true}
      />

      <main className="pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {appState === 'idle' && (
            <div className="animate-fade-in">
              <InputForm onSubmit={handleGenerate} isGenerating={false} />
            </div>
          )}

          {appState === 'generating' && (
            <div className="animate-fade-in">
              <InputForm onSubmit={handleGenerate} isGenerating={true} />
              <ProgressIndicator isActive={true} />
            </div>
          )}

          {appState === 'results' && result && (
            <ResultsView
              data={result}
              onToast={addToast}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectHistory}
        activeSessionId={result?.session.id}
        onDeleted={handleDeletedSession}
        onError={(msg) => addToast(msg, 'error')}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
