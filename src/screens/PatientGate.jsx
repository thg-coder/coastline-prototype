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
        <h2 className="text-lg font-semibold text-coast-deep">Have you visited us before?</h2>
        <p className="mt-1 text-sm text-slate-500">
          We just need to know whether to schedule your treatment or an initial visit first.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <GateCard
          icon={<UserPlus size={20} />}
          title="I'm new here"
          subtitle="First time at this practice."
          selected={patientType === 'new'}
          onClick={() => pick('new')}
        />
        <GateCard
          icon={<UserCheck size={20} />}
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
      className={`group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
        selected
          ? 'border-coast-ocean bg-coast-sky/40 shadow-sm ring-1 ring-coast-ocean/30'
          : 'border-slate-200 bg-white hover:border-coast-sea hover:shadow-sm'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          selected ? 'bg-coast-ocean text-white' : 'bg-coast-sky text-coast-ocean'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-coast-deep">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
      </span>
      {selected && (
        <span className="ml-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coast-ocean text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
