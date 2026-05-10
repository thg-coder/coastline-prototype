import React from 'react';
import { CheckCircle2, Calendar, RefreshCw, Mail } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import {
  getService,
  getPractitioner,
  SPA_NAME_PLACEHOLDER,
  SPA_PHONE,
  SPA_ADDRESS_PLACEHOLDER,
  TIMEZONE_LABEL,
} from '../mockData.js';
import { formatTime12h, formatDateLong } from '../utils/format.js';
import { buildIcs, downloadIcs } from '../utils/ics.js';
import StepShell from '../components/StepShell.jsx';

export default function Confirmation() {
  const { state, reset } = useBooking();
  const svc = getService(state.serviceId);
  const pract = getPractitioner(state.practitionerId);
  const apptDate =
    state.selectedDate && state.selectedTime
      ? (() => {
          const [y, m, d] = state.selectedDate.split('-').map(Number);
          const [hh, mm] = state.selectedTime.split(':').map(Number);
          return new Date(y, m - 1, d, hh, mm);
        })()
      : null;
  const formatLabel = state.format === 'virtual' ? 'Virtual' : 'In-Person';
  const locationLabel =
    state.format === 'virtual'
      ? 'Virtual link will be emailed'
      : `${SPA_NAME_PLACEHOLDER} · ${SPA_ADDRESS_PLACEHOLDER}`;

  function handleAddToCalendar() {
    if (!apptDate || !svc) return;
    const ics = buildIcs({
      start: apptDate,
      durationMin: svc.durationMin,
      summary: `${svc.name} — ${SPA_NAME_PLACEHOLDER}`,
      description: `Consultation with ${pract?.name || 'your practitioner'}.\n\nFormat: ${formatLabel}\nQuestions or to reschedule, call ${SPA_PHONE}.`,
      location:
        state.format === 'virtual'
          ? 'Virtual (link emailed)'
          : `${SPA_NAME_PLACEHOLDER}, ${SPA_ADDRESS_PLACEHOLDER}`,
    });
    downloadIcs(`coastline-${state.serviceId}-${state.selectedDate}.ics`, ics);
  }

  return (
    <StepShell
      hideBack
      hideContinue
    >
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={36} strokeWidth={2} />
        </div>
        <h2 className="mt-3 text-xl font-semibold text-coast-deep ">You're booked!</h2>
        <p className="mt-1 text-sm text-slate-500">
          A confirmation has been sent to{' '}
          <span className="font-medium text-coast-deep">{state.intake.email}</span>.
        </p>
      </div>

      {/* Appointment details card */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-coast-cream/40 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-coast-ocean">
          Appointment
        </h3>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm">
          <Row label="Service" value={svc?.name || '—'} />
          <Row label="Provider" value={pract?.name || '—'} />
          <Row
            label="Date & time"
            value={
              apptDate
                ? `${formatDateLong(apptDate)} · ${formatTime12h(state.selectedTime)} ${TIMEZONE_LABEL}`
                : '—'
            }
          />
          <Row label="Format" value={formatLabel} />
          <Row label="Location" value={locationLabel} />
          <Row label="Fee paid" value={`$${svc?.fee || 0}`} />
          <Row
            label="Card"
            value={state.payment.cardLast4 ? `•••• ${state.payment.cardLast4}` : '—'}
          />
        </dl>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-coast-ocean bg-white px-4 py-2.5 text-sm font-semibold text-coast-ocean hover:bg-coast-sky/40"
        >
          <Calendar size={16} /> Add to Calendar
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-coast-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-coast-deep"
        >
          <RefreshCw size={16} /> Book Another Appointment
        </button>
      </div>

      {/* Email previews */}
      <div className="mt-7">
        <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
          <Mail size={12} className="text-coast-ocean" /> Email previews
        </div>
        <div className="grid grid-cols-1 gap-4">
          <PatientEmail state={state} svc={svc} pract={pract} apptDate={apptDate} formatLabel={formatLabel} locationLabel={locationLabel} />
          <SpaEmail state={state} svc={svc} pract={pract} apptDate={apptDate} formatLabel={formatLabel} />
        </div>
      </div>
    </StepShell>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-coast-deep">{value}</dd>
    </div>
  );
}

function EmailHeader({ from, to, subject }) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-600">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">{from.name}</span>
        <span className="text-slate-400">just now</span>
      </div>
      <div className="mt-0.5">
        <span className="text-slate-400">to </span>
        <span className="text-slate-700">{to}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{subject}</div>
    </div>
  );
}

function PatientEmail({ state, svc, pract, apptDate, formatLabel, locationLabel }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <EmailHeader
        from={{ name: `${SPA_NAME_PLACEHOLDER} <bookings@medspa.example>` }}
        to={state.intake.email || 'you@example.com'}
        subject={`Your ${svc?.name || 'consultation'} is confirmed`}
      />
      <div className="p-5 text-sm text-slate-700">
        <div className="rounded-lg bg-gradient-to-r from-coast-deep to-coast-ocean px-4 py-5 text-white">
          <p className="text-[11px] uppercase tracking-widest text-white/70">Confirmed</p>
          <h4 className="mt-1 text-lg font-semibold">You're all set, {firstName(state.intake.fullName)}!</h4>
          <p className="mt-1 text-xs text-white/80">
            We can't wait to see you on {apptDate ? formatDateLong(apptDate) : ''}.
          </p>
        </div>

        <table className="mt-4 w-full text-sm">
          <tbody className="[&_td]:py-1.5 [&_td:first-child]:w-32 [&_td:first-child]:text-slate-500">
            <tr>
              <td>Service</td>
              <td className="font-medium text-slate-800">{svc?.name}</td>
            </tr>
            <tr>
              <td>Provider</td>
              <td className="font-medium text-slate-800">{pract?.name}</td>
            </tr>
            <tr>
              <td>Date & time</td>
              <td className="font-medium text-slate-800">
                {apptDate ? `${formatDateLong(apptDate)}, ${formatTime12h(state.selectedTime)} ${TIMEZONE_LABEL}` : ''}
              </td>
            </tr>
            <tr>
              <td>Format</td>
              <td className="font-medium text-slate-800">{formatLabel}</td>
            </tr>
            <tr>
              <td>Location</td>
              <td className="font-medium text-slate-800">{locationLabel}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 rounded-lg bg-coast-cream/60 p-3 text-xs">
          <p className="font-semibold text-coast-deep">What to expect</p>
          <p className="mt-1 text-slate-600">
            Plan to arrive 10 minutes early to complete check-in. Your consultation runs about{' '}
            {svc?.durationMin} minutes and includes time to discuss goals, questions, and next
            steps. Treatment, if applicable, will be scheduled separately.
          </p>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 p-3 text-xs">
          <p className="font-semibold text-coast-deep">Receipt</p>
          <p className="mt-1 text-slate-600">
            Consultation fee: <span className="font-medium text-slate-800">${svc?.fee}</span> ·
            Card ending {state.payment.cardLast4 || '••••'}
          </p>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Need to cancel or reschedule? Please call{' '}
          <span className="font-semibold text-coast-deep">{SPA_PHONE}</span>. Cancellations cannot
          be processed online.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          {SPA_NAME_PLACEHOLDER} · {SPA_ADDRESS_PLACEHOLDER} · {SPA_PHONE}
        </p>
      </div>
    </article>
  );
}

function SpaEmail({ state, svc, pract, apptDate, formatLabel }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <EmailHeader
        from={{ name: 'Coastline <notifications@coastline.app>' }}
        to={`bookings@medspa.example`}
        subject={`New consultation booked — ${svc?.name || ''}`}
      />
      <div className="p-5 text-sm text-slate-700">
        <p className="text-xs uppercase tracking-widest text-coast-ocean">New appointment</p>
        <h4 className="mt-1 text-base font-semibold text-slate-800">
          {state.intake.fullName || 'Patient'} booked {svc?.name || 'a consultation'}
        </h4>

        <div className="mt-3 rounded-lg border border-slate-200 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Appointment
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {apptDate ? `${formatDateLong(apptDate)} · ${formatTime12h(state.selectedTime)} ${TIMEZONE_LABEL}` : ''}
          </p>
          <p className="text-xs text-slate-500">
            {formatLabel} · {pract?.name}
          </p>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Patient contact
          </p>
          <ul className="mt-1 space-y-0.5 text-xs">
            <li>
              <span className="text-slate-500">Name: </span>
              <span className="text-slate-800">{state.intake.fullName}</span>
            </li>
            <li>
              <span className="text-slate-500">Email: </span>
              <span className="text-slate-800">{state.intake.email}</span>
            </li>
            <li>
              <span className="text-slate-500">Phone: </span>
              <span className="text-slate-800">{state.intake.phone}</span>
            </li>
            <li>
              <span className="text-slate-500">DOB: </span>
              <span className="text-slate-800">{state.intake.dob}</span>
            </li>
            <li>
              <span className="text-slate-500">Patient type: </span>
              <span className="text-slate-800">{state.intake.patientType}</span>
            </li>
          </ul>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Intake responses
          </p>
          <ul className="mt-1 space-y-1 text-xs text-slate-700">
            <li>
              <span className="text-slate-500">Reason: </span>
              {state.intake.reason || <span className="italic text-slate-400">Not provided</span>}
            </li>
            <li>
              <span className="text-slate-500">Heard about us via: </span>
              {state.intake.referral}
            </li>
            <li>
              <span className="text-slate-500">Allergies / meds: </span>
              {state.intake.allergies || <span className="italic text-slate-400">None reported</span>}
            </li>
          </ul>
        </div>

        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
          Payment confirmed: ${svc?.fee} on card ending {state.payment.cardLast4 || '••••'}.
        </div>
      </div>
    </article>
  );
}

function firstName(s) {
  if (!s) return 'there';
  return s.trim().split(/\s+/)[0];
}
