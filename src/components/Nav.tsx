import { History, Zap, Settings } from 'lucide-react';

interface NavProps {
  onHistoryOpen: () => void;
  onSettingsOpen: () => void;
  hasHistory: boolean;
}

export function Nav({ onHistoryOpen, onSettingsOpen, hasHistory }: NavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-surface-700 bg-surface-900/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">
            Prompt<span className="text-accent-blue">Forge</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-surface-300 bg-surface-700 border border-surface-500 px-2 py-0.5 rounded-full font-mono">
            AI Assistant Builder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSettingsOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-surface-300 hover:text-slate-200 hover:bg-surface-700 border border-transparent hover:border-surface-500 transition-all duration-200"
            title="API Key Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={onHistoryOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-surface-300 hover:text-slate-200 hover:bg-surface-700 border border-transparent hover:border-surface-500 transition-all duration-200"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
            {hasHistory && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
