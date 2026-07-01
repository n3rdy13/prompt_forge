import { useState, useCallback } from 'react';
import { Nav } from './components/Nav';
import { InputForm } from './components/InputForm';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ResultsView } from './components/ResultsView';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { generateAssistant, loadSession, getGeminiApiKey } from './services/generateService';
import type { GeneratedAssistant } from './types';
import { AlertCircle, Key } from 'lucide-react';

type AppState = 'idle' | 'generating' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<GeneratedAssistant | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getGeminiApiKey());
  const { toasts, addToast, removeToast } = useToast();

  const handleGenerate = useCallback(async (description: string) => {
    if (!getGeminiApiKey()) {
      addToast('Please set your Gemini API key in Settings first.', 'error');
      setSettingsOpen(true);
      return;
    }

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

  const handleSaveSettings = useCallback(() => {
    const keyExists = !!getGeminiApiKey();
    setHasApiKey(keyExists);
    if (keyExists) {
      addToast('Gemini API key saved successfully.', 'success');
    }
  }, [addToast]);

  return (
    <div className="min-h-screen bg-surface-950">
      <Nav
        onHistoryOpen={() => setHistoryOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        hasHistory={true}
      />

      <main className="pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {!hasApiKey && appState === 'idle' && (
            <div className="max-w-3xl mx-auto mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-200">Gemini API Key Required</h3>
                <p className="text-xs text-surface-400 mt-1 leading-normal">
                  You are running fully offline/locally! To generate your AI assistant, you need to configure a free Gemini API Key.
                </p>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-semibold transition-all"
                >
                  <Key className="w-3.5 h-3.5" />
                  Configure API Key
                </button>
              </div>
            </div>
          )}

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

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
