import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  { label: 'Understanding your request', duration: 800 },
  { label: 'Researching the domain', duration: 1200 },
  { label: 'Writing expert system prompt', duration: 1000 },
  { label: 'Building knowledge files', duration: 1000 },
];

interface ProgressIndicatorProps {
  isActive: boolean;
}

export function ProgressIndicator({ isActive }: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      return;
    }

    let step = 0;
    const advance = () => {
      if (step < STEPS.length - 1) {
        step++;
        setCurrentStep(step);
        setTimeout(advance, STEPS[step].duration);
      }
    };

    setCurrentStep(0);
    const timer = setTimeout(advance, STEPS[0].duration);
    return () => clearTimeout(timer);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-5 h-5 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-slate-200">
            Building your specialist AI…
          </span>
        </div>

        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-accent-green" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-surface-500" />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    isDone
                      ? 'text-surface-300 line-through'
                      : isActive
                      ? 'text-slate-200 font-medium'
                      : 'text-surface-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 h-1 bg-surface-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-blue rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
