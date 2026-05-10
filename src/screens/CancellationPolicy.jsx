import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import { SPA_PHONE } from '../mockData.js';
import StepShell from '../components/StepShell.jsx';

export default function CancellationPolicy() {
  const { state, dispatch, goNext } = useBooking();
  return (
    <StepShell
      canContinue={state.policyAccepted}
      onContinue={() => goNext()}
    >
      <div>
        <h2 className="text-lg font-semibold text-coast-deep ">Cancellation policy</h2>
        <p className="text-sm text-slate-500">Please review before continuing to payment.</p>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-coast-mist bg-coast-sky/40 p-4">
          <Phone size={18} className="mt-0.5 shrink-0 text-coast-ocean" />
          <p className="text-sm leading-relaxed text-coast-deep">
            All cancellations and reschedules must be handled by calling{' '}
            <span className="font-semibold">{SPA_PHONE}</span> directly. We do not process
            cancellations through this widget.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-900">
            Your consultation fee will be charged at booking. Refund eligibility is determined by
            the med spa's cancellation policy.
          </p>
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-coast-sea">
        <input
          type="checkbox"
          checked={state.policyAccepted}
          onChange={(e) => dispatch({ type: 'SET_POLICY', value: e.target.checked })}
          className="mt-1 h-4 w-4 accent-coast-ocean"
        />
        <span className="text-sm text-coast-deep">
          I understand and agree to the cancellation policy.
        </span>
      </label>
    </StepShell>
  );
}
