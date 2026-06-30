import { Download, RefreshCw } from 'lucide-react';
import { SystemPromptCard } from './SystemPromptCard';
import { KnowledgeFileCard } from './KnowledgeFileCard';
import type { GeneratedAssistant } from '../types';

interface ResultsViewProps {
  data: GeneratedAssistant;
  onToast: (msg: string, type: 'success' | 'error') => void;
  onReset: () => void;
}

export function ResultsView({ data, onToast, onReset }: ResultsViewProps) {
  const { session, systemPrompt, knowledgeFiles } = data;

  function handleDownloadAll() {
    const combined = knowledgeFiles
      .map(
        (f) =>
          `# ${f.title}\n> File: ${f.filename} | Type: ${f.file_type}\n\n${f.content}`
      )
      .join('\n\n---\n\n');

    const header = `# Knowledge Files — ${session.domain} Expert Assistant\n> Generated for: ${session.description}\n\n---\n\n`;
    const blob = new Blob([header + combined], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.domain.toLowerCase().replace(/\s+/g, '_')}_knowledge_files.md`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('All knowledge files downloaded!', 'success');
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Session banner */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-800 border border-surface-600 rounded-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-accent-green font-medium">● Generated</span>
            <span className="text-xs text-surface-400 font-mono">
              {new Date(session.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-slate-300 truncate">{session.description}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-700 border border-surface-500 text-surface-300 hover:text-slate-200 hover:border-surface-400 transition-all flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* System prompt */}
      <div>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-3">
          System Prompt
        </h2>
        <SystemPromptCard
          systemPrompt={systemPrompt}
          domain={session.domain}
          onCopy={onToast}
        />
      </div>

      {/* Knowledge files */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest">
            Knowledge Files ({knowledgeFiles.length})
          </h2>
          {knowledgeFiles.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-700 border border-surface-500 text-surface-300 hover:text-slate-200 hover:border-accent-amber/50 hover:text-accent-amber transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {knowledgeFiles.map((file) => (
            <KnowledgeFileCard key={file.id} file={file} onCopy={onToast} />
          ))}
        </div>
      </div>

      {/* Usage guide */}
      <div className="bg-surface-800/50 border border-surface-600 rounded-xl px-5 py-4">
        <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
          How to use these files
        </h3>
        <ol className="text-sm text-surface-400 space-y-1.5 list-none">
          {[
            'Copy the system prompt and paste it into your AI model\'s system/custom instructions.',
            'Attach or paste each knowledge file into your conversation context or knowledge base.',
            'Start chatting — your AI is now a specialist for this exact topic.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-surface-600 border border-surface-500 text-[10px] text-surface-300 flex items-center justify-center font-medium mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
