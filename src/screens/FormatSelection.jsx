import React from 'react';
import { Video, MapPin, Check, Lock } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import { getService } from '../mockData.js';
import StepShell from '../components/StepShell.jsx';

export default function FormatSelection() {
  const { state, dispatch, goNext } = useBooking();
  const svc = getService(state.serviceId);
  if (!svc) return null;

  const virtualAllowed = svc.formats.includes('virtual');

  function pick(fmt) {
    if (fmt === 'virtual' && !virtualAllowed) return;
    dispatch({ type: 'SET_FORMAT', format: fmt });
  }

  return (
    <StepShell canContinue={!!state.format} onContinue={() => goNext()}>
      <div>
        <p className="text-xs uppercase tracking-widest text-coast-ocean">Selected service</p>
        <h2 className="mt-1 text-lg font-semibold text-coast-deep ">{svc.name}</h2>
        <p className="text-sm text-slate-500">
          {svc.durationMin} min · ${svc.fee} consultation fee
        </p>
      </div>

      <h3 className="mt-6 text-sm font-semibold text-coast-deep">Choose your consultation format</h3>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <FormatCard
          icon={<Video size={20} />}
          title="Virtual Consultation"
          subtitle="Meet with your provider over a secure video link."
          selected={state.format === 'virtual'}
          disabled={!virtualAllowed}
          disabledHint="In-person required for this service."
          onClick={() => pick('virtual')}
        />
        <FormatCard
          icon={<MapPin size={20} />}
          title="In-Person Consultation"
          subtitle="Visit our office for a hands-on assessment."
          selected={state.format === 'in_person'}
          onClick={() => pick('in_person')}
        />
      </div>
    </StepShell>
  );
}

function FormatCard({ icon, title, subtitle, selected, disabled, disabledHint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className={`group relative flex w-full flex-col items-start rounded-xl border p-4 text-left transition-all ${
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'
          : selected
            ? 'border-coast-ocean bg-coast-sky/40 shadow-sm ring-1 ring-coast-ocean/30'
            : 'border-slate-200 bg-white hover:border-coast-sea hover:shadow-sm'
      }`}
    >
      {selected && !disabled && (
        <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coast-ocean text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      {disabled && (
        <span className="absolute right-3 top-3 text-slate-400">
          <Lock size={14} />
        </span>
      )}
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          disabled ? 'bg-slate-200 text-slate-400' : 'bg-coast-sky text-coast-ocean'
        }`}
      >
        {icon}
      </span>
      <h4 className="mt-3 text-sm font-semibold text-coast-deep">{title}</h4>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      {disabled && <p className="mt-2 text-xs font-medium text-slate-500">{disabledHint}</p>}
    </button>
  );
}
