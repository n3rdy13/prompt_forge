import { useState } from 'react';
import { X, Key, Info, Check, Eye, EyeOff } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey } from '../services/generateService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [key, setKey] = useState(getGeminiApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setGeminiApiKey(key.trim());
    setSaved(true);
    onSave();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-surface-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface-900 border border-surface-700 rounded-xl shadow-2xl overflow-hidden p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg font-semibold text-slate-200">Local Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-slate-200 hover:bg-surface-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-surface-800 border border-surface-600 hover:border-surface-500 focus:border-accent-blue focus:outline-none rounded-lg pl-3 pr-10 py-2.5 text-sm text-slate-200 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-surface-400 mt-2 leading-normal flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent-blue flex-shrink-0 mt-0.5" />
              <span>
                Your API key is saved safely in your browser's local storage and is only used to call the Gemini API directly.
              </span>
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-surface-300 hover:text-slate-200 hover:bg-surface-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent-blue text-surface-950 hover:bg-[#6bbfff] transition-all min-w-[80px]"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
