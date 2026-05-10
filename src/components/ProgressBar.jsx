import React from 'react';
import { useBooking } from '../state/BookingContext.jsx';

const LABELS = {
  service: 'Service',
  format: 'Format',
  practitioner: 'Provider',
  calendar: 'Time',
  intake: 'Details',
  policy: 'Policy',
  checkout: 'Payment',
  confirmation: 'Done',
};

export default function ProgressBar() {
  const { activeSteps, stepIndex, totalSteps, state } = useBooking();
  const pct = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div
      className="border-b border-slate-100 bg-white px-5 pt-4 pb-3"
      role="progressbar"
      aria-valuenow={stepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${stepIndex + 1} of ${totalSteps}: ${LABELS[state.step]}`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-400">
        <span>
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <span className="text-coast-ocean">{LABELS[state.step]}</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coast-sea to-coast-ocean transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step dots: read-only, not clickable */}
      <ol className="mt-3 hidden grid-cols-8 gap-1 sm:grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0,1fr))` }}>
        {activeSteps.map((s, i) => {
          const active = i <= stepIndex;
          return (
            <li key={s} className="flex flex-col items-center gap-1 text-[10px]" aria-current={i === stepIndex ? 'step' : undefined}>
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  active ? 'bg-coast-ocean' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              />
              <span className={active ? 'text-coast-deep' : 'text-slate-400'}>{LABELS[s]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
