import React, { useState } from 'react';
import { Clock, DollarSign, Check, Video, MapPin } from 'lucide-react';
import { SERVICES } from '../mockData.js';
import { useBooking } from '../state/BookingContext.jsx';
import StepShell from '../components/StepShell.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ServiceSelection() {
  const { state, dispatch, goNext } = useBooking();
  const [pendingServiceId, setPendingServiceId] = useState(null);
  const selectedId = state.serviceId;

  function handlePick(serviceId) {
    if (selectedId && selectedId !== serviceId && (state.practitionerId || state.selectedTime)) {
      // Warn before changing.
      setPendingServiceId(serviceId);
      return;
    }
    dispatch({ type: 'SET_SERVICE', serviceId });
  }

  function confirmServiceChange() {
    dispatch({ type: 'SET_SERVICE', serviceId: pendingServiceId });
    setPendingServiceId(null);
  }

  return (
    <>
      <StepShell
        canContinue={!!selectedId}
        onContinue={() => goNext()}
        continueLabel="Continue"
      >
        <div>
          <h2 className="text-lg font-semibold text-coast-deep sm:text-xl">
            Choose your consultation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Every booking starts with a consultation. Procedures are scheduled in person at your visit.
          </p>
        </div>

        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SERVICES.map((svc) => {
            const isSelected = selectedId === svc.id;
            return (
              <li key={svc.id}>
                <button
                  type="button"
                  onClick={() => handlePick(svc.id)}
                  aria-pressed={isSelected}
                  className={`group relative flex w-full flex-col rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-coast-ocean bg-coast-sky/40 shadow-sm ring-1 ring-coast-ocean/30'
                      : 'border-slate-200 bg-white hover:border-coast-sea hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coast-ocean text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <h3 className="pr-6 text-sm font-semibold text-coast-deep">{svc.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{svc.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="text-coast-ocean" />
                      {svc.durationMin} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DollarSign size={12} className="text-coast-ocean" />
                      ${svc.fee}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      {svc.formats.includes('virtual') ? (
                        <>
                          <Video size={12} className="text-coast-sea" />
                          Virtual or in-person
                        </>
                      ) : (
                        <>
                          <MapPin size={12} className="text-coast-sea" />
                          In-person only
                        </>
                      )}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </StepShell>

      <ConfirmDialog
        open={!!pendingServiceId}
        title="Change your service?"
        body="Changing your service will reset your practitioner and time selection. Your contact info will be saved."
        confirmLabel="Change service"
        cancelLabel="Keep current"
        onConfirm={confirmServiceChange}
        onCancel={() => setPendingServiceId(null)}
      />
    </>
  );
}
