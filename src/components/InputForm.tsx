import { useState, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const EXAMPLES = [
  '2005 Toyota Camry with a squealing noise when braking at low speeds',
  'Filing a small claims court case in Texas against a contractor',
  'Diagnosing issues with a 1980s vintage Fender tube amplifier',
  'Growing heirloom tomatoes in a Pacific Northwest climate',
  'Repairing a leaking bathroom faucet — Moen single-handle cartridge',
  'Setting up a home network with VLANs for IoT device isolation',
];

interface InputFormProps {
  onSubmit: (description: string) => void;
  isGenerating: boolean;
}

export function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length >= 5 && !isGenerating) {
      onSubmit(trimmed);
    }
  }

  function handleExample(example: string) {
    setValue(example);
    textareaRef.current?.focus();
  }

  const canSubmit = value.trim().length >= 5 && !isGenerating;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold text-slate-100 mb-3 leading-tight tracking-tight">
          Build Your
          <span className="text-gradient-blue"> Expert AI</span>
          <br />
          Assistant
        </h1>
        <p className="text-surface-300 text-lg leading-relaxed">
          Describe what you need help with. Get a custom system prompt and<br className="hidden sm:block" />
          knowledge files that turn any AI into a specialist for your exact task.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isGenerating}
            rows={4}
            placeholder="Describe what you need an AI assistant for...&#10;&#10;Example: I have a 2003 Ford F-150 with a 5.4L V8 that's misfiring on cylinders 4 and 5, and I need help diagnosing and fixing it."
            className="w-full bg-surface-800 border border-surface-500 hover:border-surface-400 focus:border-accent-blue focus:outline-none rounded-xl px-5 py-4 text-slate-200 placeholder-surface-300 resize-none transition-colors duration-200 font-sans text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-3 right-3 text-xs text-surface-400 font-mono">
            {value.length}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-medium text-base transition-all duration-200
            bg-accent-blue text-surface-950 hover:bg-[#6bbfff] active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-blue"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate My Assistant
            </>
          )}
        </button>
      </form>

      {!isGenerating && (
        <div className="mt-6">
          <p className="text-xs text-surface-400 mb-3 font-medium uppercase tracking-wider">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExample(ex)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-500 text-surface-300 hover:text-slate-200 hover:border-surface-400 hover:bg-surface-600 transition-all duration-150 text-left"
              >
                {ex.length > 55 ? ex.slice(0, 55) + '…' : ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
