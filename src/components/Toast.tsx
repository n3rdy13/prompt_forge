import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-accent-green flex-shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-accent-red flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-accent-blue flex-shrink-0" />,
};

const borders = {
  success: 'border-l-2 border-accent-green',
  error: 'border-l-2 border-accent-red',
  info: 'border-l-2 border-accent-blue',
};

export function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-surface-700 ${borders[toast.type]} rounded-lg shadow-xl text-sm text-slate-200 animate-slide-up max-w-sm`}
        >
          {icons[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-surface-300 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
