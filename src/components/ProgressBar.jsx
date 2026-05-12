import React from 'react';
import { useBooking } from '../state/BookingContext.jsx';

const LABELS = {
  service: 'Service',
  gate: 'Patient',
  schedule: 'Schedule',
  checkout: 'Payment',
  confirmation: 'Done',
};

export default function ProgressBar() {
  const { stepIndex, totalSteps, state } = useBooking();

  // On the terminal CONFIRMATION screen there is no "Step X of N" — hide the bar.
  if (stepIndex < 0) return null;

  const current = stepIndex + 1;
  const pct = totalSteps > 0 ? (current / totalSteps) * 100 : 0;

  return (
    <div
      className="border-b border-slate-100 bg-white px-5 pt-3.5 pb-3"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${current} of ${totalSteps}: ${LABELS[state.step]}`}
    >
      <div className="mb-2 flex items-center justify-between text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-400">
        <span>
          Step {current} <span className="text-slate-300">of</span> {totalSteps}
        </span>
        <span className="text-coast-ocean">{LABELS[state.step]}</span>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-coast-mist/45">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coast-sea to-coast-ocean transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
