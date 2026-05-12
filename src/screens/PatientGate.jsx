import React from 'react';
import { UserPlus, UserCheck, Check } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import StepShell from '../components/StepShell.jsx';

export default function PatientGate() {
  const { state, dispatch, goNext } = useBooking();
  const patientType = state.intake.patientType;

  function pick(type) {
    dispatch({ type: 'SET_INTAKE', patch: { patientType: type } });
  }

  return (
    <StepShell canContinue={!!patientType} onContinue={() => goNext()}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-coast-deep">Have you visited us before?</h2>
        <p className="mt-1 text-sm leading-relaxed text-coast-ink/55">
          We just need to know whether to schedule your treatment or an initial visit first.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <GateCard
          icon={<UserPlus size={20} strokeWidth={1.75} />}
          title="I'm new here"
          subtitle="First time at this practice."
          selected={patientType === 'new'}
          onClick={() => pick('new')}
        />
        <GateCard
          icon={<UserCheck size={20} strokeWidth={1.75} />}
          title="I've been here before"
          subtitle="You have an existing chart with us."
          selected={patientType === 'returning'}
          onClick={() => pick('returning')}
        />
      </div>
    </StepShell>
  );
}

function GateCard({ icon, title, subtitle, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-150 ${
        selected
          ? 'border-coast-ocean bg-coast-sky shadow-card-active ring-1 ring-coast-ocean/20'
          : 'border-coast-mist/80 bg-coast-shell hover:border-coast-sea hover:bg-white hover:shadow-card-hover'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          selected ? 'bg-coast-ocean text-white shadow-sm' : 'bg-coast-sky text-coast-ocean group-hover:bg-coast-mist'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold tracking-tight text-coast-deep">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-coast-ink/55">{subtitle}</span>
      </span>
      {selected && (
        <span className="ml-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coast-ocean text-white shadow-sm">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
