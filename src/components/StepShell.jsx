import React, { useCallback, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useBooking, STEPS } from '../state/BookingContext.jsx';

// Wraps each step body with optional Back button and a Continue / primary CTA.
// `onContinue` may return a Promise; the button auto-disables while pending.
export default function StepShell({
  children,
  canContinue,
  continueLabel = 'Continue',
  onContinue,
  hideBack = false,
  hideContinue = false,
  continueVariant = 'primary',
}) {
  const { state, goBack } = useBooking();
  const pendingRef = useRef(false);
  const [pending, setPending] = React.useState(false);

  const handleContinue = useCallback(async () => {
    if (pendingRef.current) return; // debounce rapid clicks
    if (!canContinue || !onContinue) return;
    pendingRef.current = true;
    setPending(true);
    try {
      await onContinue();
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [canContinue, onContinue]);

  const showBack = !hideBack && state.step !== STEPS.SERVICE && state.step !== STEPS.CONFIRMATION;

  return (
    <div className="flex flex-col">
      <div className="animate-fadeIn px-5 py-5">{children}</div>
      {(showBack || !hideContinue) && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3">
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-coast-ocean hover:bg-coast-sky/60 active:bg-coast-sky"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <span />
          )}
          {!hideContinue && (
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue || pending}
              className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                continueVariant === 'primary'
                  ? 'bg-coast-ocean text-white shadow-sm hover:bg-coast-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400'
              }`}
            >
              {pending && <span className="spinner" aria-hidden="true" />}
              {pending ? 'Working…' : continueLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
