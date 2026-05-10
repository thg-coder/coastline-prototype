import React from 'react';
import { Check } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import { getService } from '../mockData.js';
import StepShell from '../components/StepShell.jsx';

export default function PractitionerSelection() {
  const { state, dispatch, goNext, practitionersForService } = useBooking();
  const svc = getService(state.serviceId);
  if (!svc) return null;

  function pick(id) {
    dispatch({ type: 'SET_PRACTITIONER', practitionerId: id });
  }

  return (
    <StepShell canContinue={!!state.practitionerId} onContinue={() => goNext()}>
      <div>
        <p className="text-xs uppercase tracking-widest text-coast-ocean">Selected service</p>
        <h2 className="mt-1 text-lg font-semibold text-coast-deep ">{svc.name}</h2>
        <p className="text-sm text-slate-500">Choose your practitioner</p>
      </div>

      <ul className="mt-5 space-y-3">
        {practitionersForService.map((p) => {
          const selected = state.practitionerId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p.id)}
                aria-pressed={selected}
                className={`relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-coast-ocean bg-coast-sky/40 shadow-sm ring-1 ring-coast-ocean/30'
                    : 'border-slate-200 bg-white hover:border-coast-sea hover:shadow-sm'
                }`}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: p.color }}
                  aria-hidden="true"
                >
                  {p.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-coast-deep">{p.name}</h4>
                  <p className="text-xs text-coast-ocean">{p.credentials}</p>
                  <p className="mt-1 text-xs text-slate-500">{p.bio}</p>
                </div>
                {selected && (
                  <span className="ml-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coast-ocean text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </StepShell>
  );
}
