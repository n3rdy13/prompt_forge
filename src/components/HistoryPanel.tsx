import { useEffect, useState } from 'react';
import { X, Trash2, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import type { Session } from '../types';
import { fetchHistory, deleteSession } from '../services/generateService';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sessionId: string) => void;
  activeSessionId?: string;
  onDeleted: (sessionId: string) => void;
  onError: (msg: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function HistoryPanel({
  isOpen,
  onClose,
  onSelect,
  activeSessionId,
  onDeleted,
  onError,
}: HistoryPanelProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchHistory()
      .then(setSessions)
      .catch(() => onError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, [isOpen, onError]);

  async function handleDelete(sessionId: string) {
    if (confirmDeleteId !== sessionId) {
      setConfirmDeleteId(sessionId);
      return;
    }
    setDeletingId(sessionId);
    setConfirmDeleteId(null);
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      onDeleted(sessionId);
    } catch {
      onError('Failed to delete session.');
    } finally {
      setDeletingId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-surface-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-surface-900 border-l border-surface-600 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <h2 className="text-sm font-semibold text-slate-200">Generation History</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-slate-200 hover:bg-surface-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-accent-blue animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Clock className="w-8 h-8 text-surface-500 mb-3" />
              <p className="text-sm text-surface-400">No generations yet.</p>
              <p className="text-xs text-surface-500 mt-1">
                Your history will appear here after your first generation.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-700">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isDeleting = deletingId === session.id;
                const isConfirming = confirmDeleteId === session.id;

                return (
                  <li
                    key={session.id}
                    className={`group flex items-start gap-3 px-4 py-3.5 hover:bg-surface-800 transition-colors ${
                      isActive ? 'bg-surface-800' : ''
                    }`}
                  >
                    <button
                      className="flex-1 text-left min-w-0"
                      onClick={() => { onSelect(session.id); onClose(); }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-medium">
                          {session.domain}
                        </span>
                        <span className="text-xs text-surface-400 font-mono">
                          {timeAgo(session.created_at)}
                        </span>
                        {isActive && (
                          <span className="text-xs text-accent-green">● active</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2 leading-snug">
                        {session.description}
                      </p>
                    </button>

                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 text-surface-400 animate-spin" />
                      ) : isConfirming ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-accent-red">Sure?</span>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="text-xs px-1.5 py-0.5 rounded bg-accent-red/10 border border-accent-red/30 text-accent-red hover:bg-accent-red/20 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-surface-400 hover:text-slate-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { onSelect(session.id); onClose(); }}
                            className="p-1 rounded text-surface-500 hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-1 rounded text-surface-500 hover:text-accent-red transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="px-5 py-3 border-t border-surface-700">
            <p className="text-xs text-surface-400 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              {sessions.length} saved session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
