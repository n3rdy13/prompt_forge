import { useState } from 'react';
import { Copy, Check, Bot } from 'lucide-react';
import type { SystemPrompt } from '../types';

interface SystemPromptCardProps {
  systemPrompt: SystemPrompt;
  domain: string;
  onCopy: (msg: string, type: 'success' | 'error') => void;
}

const COMPATIBLE_WITH = ['ChatGPT', 'Claude', 'Gemini', 'Mistral', 'Llama'];

export function SystemPromptCard({ systemPrompt, domain, onCopy }: SystemPromptCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(systemPrompt.content);
      setCopied(true);
      onCopy('System prompt copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy('Failed to copy — please select the text manually.', 'error');
    }
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-surface-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">System Prompt</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-medium">
                {domain}
              </span>
              <span className="text-xs text-surface-400">Expert Specialist</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 ${
            copied
              ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
              : 'bg-surface-700 border border-surface-500 text-surface-300 hover:text-slate-200 hover:border-surface-400'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        <pre className="px-5 py-4 text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap break-words overflow-x-auto max-h-80 overflow-y-auto">
          {systemPrompt.content}
        </pre>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-surface-700 bg-surface-900/40">
        <p className="text-xs text-surface-400">
          <span className="text-surface-300 font-medium">How to use:</span>{' '}
          Paste this into the system/custom instructions field of any AI model.
          Compatible with{' '}
          {COMPATIBLE_WITH.map((name, i) => (
            <span key={name}>
              <span className="text-slate-300">{name}</span>
              {i < COMPATIBLE_WITH.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
