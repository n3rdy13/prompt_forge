import { useState } from 'react';
import { Copy, Check, Download, FileText, Wrench, List, BookOpen, Lightbulb } from 'lucide-react';
import type { KnowledgeFile, FileType } from '../types';

interface KnowledgeFileCardProps {
  file: KnowledgeFile;
  onCopy: (msg: string, type: 'success' | 'error') => void;
}

const FILE_TYPE_CONFIG: Record<FileType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  reference: {
    label: 'Reference',
    color: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue/30',
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
  troubleshooting: {
    label: 'Troubleshooting',
    color: 'text-accent-red',
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/30',
    icon: <Wrench className="w-3.5 h-3.5" />,
  },
  procedures: {
    label: 'Procedures',
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
    border: 'border-accent-green/30',
    icon: <List className="w-3.5 h-3.5" />,
  },
  terminology: {
    label: 'Terminology',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  tips: {
    label: 'Tips',
    color: 'text-accent-amber',
    bg: 'bg-accent-amber/10',
    border: 'border-accent-amber/30',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
  },
};

const LEFT_BORDER: Record<FileType, string> = {
  reference: 'border-l-2 border-l-accent-blue',
  troubleshooting: 'border-l-2 border-l-accent-red',
  procedures: 'border-l-2 border-l-accent-green',
  terminology: 'border-l-2 border-l-purple-400',
  tips: 'border-l-2 border-l-accent-amber',
};

export function KnowledgeFileCard({ file, onCopy }: KnowledgeFileCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const config = FILE_TYPE_CONFIG[file.file_type as FileType] ?? FILE_TYPE_CONFIG.reference;
  const leftBorder = LEFT_BORDER[file.file_type as FileType] ?? LEFT_BORDER.reference;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      onCopy(`"${file.title}" copied!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy('Failed to copy.', 'error');
    }
  }

  function handleDownload() {
    const blob = new Blob([file.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename.endsWith('.md') ? file.filename : `${file.filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onCopy(`"${file.title}" downloaded!`, 'success');
  }

  const previewLines = file.content.split('\n').slice(0, 8).join('\n');
  const hasMore = file.content.split('\n').length > 8;

  return (
    <div className={`bg-surface-800 border border-surface-600 ${leftBorder} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-surface-700">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-md ${config.bg} border ${config.border} ${config.color}`}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate">{file.title}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color} border ${config.border} font-medium`}>
                {config.label}
              </span>
              <span className="text-xs text-surface-400 font-mono">{file.filename}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            title="Copy content"
            className={`p-1.5 rounded-lg text-xs transition-all duration-200 ${
              copied
                ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                : 'bg-surface-700 border border-surface-500 text-surface-300 hover:text-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            title="Download .md"
            className="p-1.5 rounded-lg bg-surface-700 border border-surface-500 text-surface-300 hover:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div className="px-4 py-3">
        <pre className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
          {expanded ? file.content : previewLines}
        </pre>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-accent-blue hover:text-[#6bbfff] transition-colors"
          >
            {expanded ? 'Show less ↑' : `Show full content ↓`}
          </button>
        )}
      </div>
    </div>
  );
}
