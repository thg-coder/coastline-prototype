import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Info,
  Users,
  Check,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import { getService, getPractitioner, formatDateKey, TIMEZONE_LABEL } from '../mockData.js';
import { siteConfig } from '../config/siteConfig.js';
import { formatTime12h, formatPhone } from '../utils/format.js';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateDob,
} from '../utils/validation.js';
import StepShell from '../components/StepShell.jsx';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const REFERRAL_OPTIONS = ['Google', 'Instagram', 'Friend/Family', 'Yelp', 'Other'];

const STATE_NAMES = {
  GA: 'Georgia',
  FL: 'Florida',
  NC: 'North Carolina',
  SC: 'South Carolina',
  TN: 'Tennessee',
  AL: 'Alabama',
};
const getStateName = (code) => STATE_NAMES[code] || 'your state';

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function buildMonthGrid(viewMonth) {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Schedule() {
  const { state, dispatch, goNext, availability, practitionersForService } = useBooking();
  const svc = getService(state.serviceId);
  const pract = getPractitioner(state.practitionerId);

  const isNewPatient = state.intake.patientType === 'new';
  const multiplePractitioners = practitionersForService.length > 1;

  // ---- Calendar state -------------------------------------------------------
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [viewMonth, setViewMonth] = useState(() => {
    if (state.selectedDate) {
      const [y, m] = state.selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return startOfMonth(today);
  });
  const practAvailability = (pract && availability[pract.id]) || {};

  // Auto-advance to the next month that has availability if the current one has none.
  useEffect(() => {
    const monthHasAny = Object.keys(practAvailability).some((dateKey) => {
      const [y, m] = dateKey.split('-').map(Number);
      return y === viewMonth.getFullYear() && m - 1 === viewMonth.getMonth();
    });
    if (!monthHasAny) {
      for (let i = 1; i <= 6; i++) {
        const probe = addMonths(viewMonth, i);
        const has = Object.keys(practAvailability).some((dateKey) => {
          const [y, m] = dateKey.split('-').map(Number);
          return y === probe.getFullYear() && m - 1 === probe.getMonth();
        });
        if (has) {
          setViewMonth(probe);
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pract?.id]);

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const selectedDateKey = state.selectedDate;
  const slotsForSelected = selectedDateKey ? practAvailability[selectedDateKey] || [] : [];
  const filteredSlots = useMemo(() => {
    if (!selectedDateKey) return [];
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const isToday = today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === d;
    if (!isToday) return slotsForSelected;
    const now = new Date();
    return slotsForSelected.filter((hhmm) => {
      const [hh, mm] = hhmm.split(':').map(Number);
      return new Date(y, m - 1, d, hh, mm).getTime() > now.getTime();
    });
  }, [selectedDateKey, slotsForSelected, today]);
  const slotsForRender = useMemo(() => {
    if (state.selectedTime && selectedDateKey === state.selectedDate) {
      if (!filteredSlots.includes(state.selectedTime)) {
        return [...filteredSlots, state.selectedTime].sort();
      }
    }
    return filteredSlots;
  }, [filteredSlots, state.selectedTime, selectedDateKey, state.selectedDate]);

  function handleDayClick(date) {
    const key = formatDateKey(date);
    if (key !== state.selectedDate) {
      dispatch({ type: 'SET_TIME', date: key, time: null });
    }
  }
  function handleSlotClick(hhmm) {
    if (!selectedDateKey) return;
    dispatch({ type: 'SET_TIME', date: selectedDateKey, time: hhmm });
  }

  // ---- Provider expander ----------------------------------------------------
  const [showProviders, setShowProviders] = useState(false);
  function pickProvider(id) {
    dispatch({ type: 'SET_PRACTITIONER', practitionerId: id });
    setShowProviders(false);
  }

  // ---- Intake state ---------------------------------------------------------
  const intake = state.intake;
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const validators = useMemo(
    () => ({
      fullName: (v) => validateRequired(v),
      email: (v) => validateEmail(v),
      phone: (v) => validatePhone(v),
      dob: (v) => validateDob(v),
      referral: (v) => validateRequired(v),
    }),
    []
  );
  function setField(name, value) {
    dispatch({ type: 'SET_INTAKE', patch: { [name]: value } });
    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  }
  function handleBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    const v = validators[name];
    if (!v) return;
    let value = intake[name];
    if (name === 'phone') {
      const formatted = formatPhone(value);
      if (formatted !== value) {
        dispatch({ type: 'SET_INTAKE', patch: { phone: formatted } });
        value = formatted;
      }
    }
    const err = v(value);
    setErrors((e) => ({ ...e, [name]: err || undefined }));
  }
  const intakeValid = useMemo(
    () => Object.keys(validators).every((k) => !validators[k](intake[k])),
    [intake, validators]
  );

  // ---- Policy expander ------------------------------------------------------
  const [policyOpen, setPolicyOpen] = useState(false);

  // ---- Continue gating ------------------------------------------------------
  const hasSlot = !!state.selectedDate && !!state.selectedTime;
  const canContinue = intakeValid && hasSlot && state.policyAccepted;

  function onContinue() {
    // Defensive re-validation + scroll to first invalid intake field.
    const newErrors = {};
    Object.keys(validators).forEach((k) => {
      const err = validators[k](intake[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(validators).map((k) => [k, true])));
    if (Object.keys(newErrors).length > 0) {
      const firstField = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
      return;
    }
    if (!hasSlot || !state.policyAccepted) return;
    goNext();
  }

  if (!svc) return null;

  return (
    <StepShell canContinue={canContinue} onContinue={onContinue}>
      {/* New-patient initial-visit notice */}
      {isNewPatient && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3.5 text-xs leading-relaxed text-amber-900">
          <Info size={15} strokeWidth={2} className="mt-px shrink-0 text-amber-600" />
          <span>
            Heads up — since this is your first visit with us, you'll meet your provider for a
            brief good-faith exam before treatment. This is required in{' '}
            {getStateName(siteConfig.state)} and supports your safety. Your treatment session can
            be booked right after, on the same visit when possible.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-coast-deep">
            Pick a time &amp; your details
          </h2>
          <p className="text-sm leading-relaxed text-coast-ink/55">
            All times shown in Eastern Time ({TIMEZONE_LABEL}).
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            state.format === 'virtual'
              ? 'bg-coast-sky text-coast-deep'
              : 'bg-coast-sand/70 text-coast-deep'
          }`}
        >
          {state.format === 'virtual' ? (
            <>
              <Video size={12} className="text-coast-sea" /> Virtual
            </>
          ) : (
            <>
              <MapPin size={12} className="text-coast-sea" /> In-person at {siteConfig.practiceName}
            </>
          )}
        </span>
      </div>

      {/* Provider line + expander */}
      {pract && (
        <div className="mt-3.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-coast-sky/45 px-3 py-2.5 text-xs text-coast-ink/70">
            <span
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: pract.color }}
              aria-hidden="true"
            >
              {pract.initials}
            </span>
            <span className="flex-1">
              You'll be seeing <span className="font-semibold text-coast-deep">{pract.name}</span>
              {pract.credentials ? `, ${pract.credentials}.` : '.'}
            </span>
            {multiplePractitioners && (
              <button
                type="button"
                onClick={() => setShowProviders((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1 font-medium text-coast-ocean underline-offset-2 hover:underline"
              >
                <Users size={12} />
                {showProviders ? 'Hide' : 'See other providers'}
              </button>
            )}
          </div>
          {multiplePractitioners && showProviders && (
            <ul className="mt-2 space-y-2">
              {practitionersForService.map((p) => {
                const selected = state.practitionerId === p.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pickProvider(p.id)}
                      aria-pressed={selected}
                      className={`relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                        selected
                          ? 'border-coast-ocean bg-coast-sky shadow-card-active ring-1 ring-coast-ocean/20'
                          : 'border-coast-mist/80 bg-coast-shell hover:border-coast-sea hover:bg-white hover:shadow-card-hover'
                      }`}
                    >
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: p.color }}
                        aria-hidden="true"
                      >
                        {p.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tracking-tight text-coast-deep">
                          {p.name}
                        </span>
                        <span className="block text-[11px] font-medium text-coast-ocean">
                          {p.credentials}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-coast-ink/55">
                          {p.bio}
                        </span>
                      </span>
                      {selected && (
                        <span className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coast-ocean text-white shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Format-changed reminder */}
      {state.formatChangedSinceTimePick && state.selectedTime && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-800">
          <Info size={14} strokeWidth={2} className="mt-px shrink-0 text-amber-600" />
          <div className="flex-1">Format updated — please confirm your time slot.</div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CONFIRM_FORMAT_BANNER_DISMISSED' })}
            className="font-medium text-amber-900 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Month picker */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          disabled={viewMonth <= startOfMonth(today)}
          className="rounded-lg p-2 text-coast-ocean transition-colors hover:bg-coast-sky/55 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <h3 className="text-sm font-semibold tracking-tight text-coast-deep">
          {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-2 text-coast-ocean transition-colors hover:bg-coast-sky/55"
          aria-label="Next month"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1.5 grid grid-cols-7 gap-1">
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} className="h-10" />;
          const key = formatDateKey(cell);
          const isPast = cell < today;
          const hasAvailability = !!practAvailability[key]?.length;
          const isToday = cell.getTime() === today.getTime();
          const isSelected = state.selectedDate === key;
          const disabled = isPast || !hasAvailability;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(cell)}
              aria-pressed={isSelected}
              aria-label={cell.toDateString()}
              className={`relative h-10 rounded-lg text-sm font-medium tabular-nums transition-all duration-150 ${
                isSelected
                  ? 'bg-coast-ocean text-white shadow-card-active'
                  : disabled
                    ? 'text-slate-300'
                    : 'text-coast-ink hover:bg-coast-sky/55'
              } ${isToday && !isSelected ? 'ring-1 ring-inset ring-coast-ocean/45 font-semibold text-coast-ocean' : ''}`}
            >
              {cell.getDate()}
              {hasAvailability && !isSelected && !disabled && (
                <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-coast-sea" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDateKey ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold tracking-tight text-coast-deep">
            Available times{' '}
            <span className="font-normal text-coast-ink/50">
              ·{' '}
              {(() => {
                const [y, m, d] = selectedDateKey.split('-').map(Number);
                return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                });
              })()}
            </span>
          </h4>
          {slotsForRender.length === 0 ? (
            <p className="mt-2 rounded-xl bg-coast-cream/70 px-3 py-2.5 text-xs text-coast-ink/55">
              No remaining times for this day. Try another date.
            </p>
          ) : (
            <div className="mt-2.5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
              {slotsForRender.map((hhmm) => {
                const isSelected = state.selectedTime === hhmm;
                return (
                  <button
                    key={hhmm}
                    type="button"
                    onClick={() => handleSlotClick(hhmm)}
                    aria-pressed={isSelected}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium tabular-nums transition-all duration-150 ${
                      isSelected
                        ? 'border-coast-ocean bg-coast-ocean text-white shadow-card-active'
                        : 'border-coast-mist bg-white text-coast-ink/75 hover:border-coast-sea hover:bg-coast-sky/35 hover:text-coast-deep'
                    }`}
                  >
                    {formatTime12h(hhmm)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-coast-cream/70 px-3 py-2.5 text-xs text-coast-ink/55">
          Select a date to see available times.
        </p>
      )}

      {/* Intake fields */}
      <div className="mt-7 border-t border-coast-mist/70 pt-5">
        <h3 className="text-sm font-semibold tracking-tight text-coast-deep">Your details</h3>
        <p className="mt-0.5 text-xs text-coast-ink/55">
          Required fields are marked with <span className="text-rose-500">*</span>.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field
            id="field-fullName"
            label="Full name"
            required
            value={intake.fullName}
            onChange={(v) => setField('fullName', v)}
            onBlur={() => handleBlur('fullName')}
            error={touched.fullName && errors.fullName}
            autoComplete="name"
          />
          <Field
            id="field-email"
            label="Email"
            type="email"
            required
            value={intake.email}
            onChange={(v) => setField('email', v)}
            onBlur={() => handleBlur('email')}
            error={touched.email && errors.email}
            autoComplete="email"
          />
          <Field
            id="field-phone"
            label="Phone"
            type="tel"
            required
            value={intake.phone}
            onChange={(v) => setField('phone', v)}
            onBlur={() => handleBlur('phone')}
            error={touched.phone && errors.phone}
            placeholder="(555) 555-5555"
            autoComplete="tel"
          />
          <Field
            id="field-dob"
            label="Date of birth"
            type="date"
            required
            value={intake.dob}
            onChange={(v) => setField('dob', v)}
            onBlur={() => handleBlur('dob')}
            error={touched.dob && errors.dob}
            autoComplete="bday"
          />
          <div>
            <label htmlFor="field-reason" className="block text-sm font-medium text-coast-deep">
              Reason for visit / goals
            </label>
            <textarea
              id="field-reason"
              rows={3}
              value={intake.reason}
              onChange={(e) => setField('reason', e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-coast-mist bg-white px-3 py-2.5 text-sm text-coast-ink placeholder:text-slate-400 shadow-card transition-shadow focus:border-coast-ocean focus:outline-none focus:ring-2 focus:ring-coast-ocean/20"
              placeholder="Optional"
            />
          </div>
          <div>
            <label htmlFor="field-referral" className="block text-sm font-medium text-coast-deep">
              How did you hear about us? <span className="text-rose-500">*</span>
            </label>
            <select
              id="field-referral"
              value={intake.referral}
              onChange={(e) => {
                setField('referral', e.target.value);
                setTouched((t) => ({ ...t, referral: true }));
              }}
              onBlur={() => handleBlur('referral')}
              className="mt-1.5 block w-full rounded-lg border border-coast-mist bg-white px-3 py-2.5 text-sm text-coast-ink shadow-card transition-shadow focus:border-coast-ocean focus:outline-none focus:ring-2 focus:ring-coast-ocean/20"
            >
              <option value="">Select…</option>
              {REFERRAL_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {touched.referral && errors.referral && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.referral}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="mt-6 border-t border-coast-mist/70 pt-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-coast-mist bg-coast-shell p-3.5 transition-colors hover:border-coast-sea">
          <input
            type="checkbox"
            checked={state.policyAccepted}
            onChange={(e) => dispatch({ type: 'SET_POLICY', value: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-coast-ocean"
          />
          <span className="text-sm leading-snug text-coast-ink">
            I agree to the cancellation policy. <span className="text-rose-500">*</span>
          </span>
        </label>
        <button
          type="button"
          onClick={() => setPolicyOpen((v) => !v)}
          aria-expanded={policyOpen}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-coast-ocean underline-offset-2 hover:underline"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${policyOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
          {policyOpen ? 'Hide cancellation policy' : 'Read cancellation policy'}
        </button>
        {policyOpen && (
          <div className="mt-2 flex items-start gap-3 rounded-xl border border-coast-mist bg-coast-sky/35 p-4">
            <Phone size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-coast-sea" />
            <p className="text-sm leading-relaxed text-coast-ink/80">
              To cancel or reschedule, please call us at{' '}
              <span className="font-semibold text-coast-deep">{siteConfig.practicePhone}</span> — we
              don't process changes through this widget. A day's notice is appreciated when you can.
            </p>
          </div>
        )}
      </div>
    </StepShell>
  );
}

function Field({ id, label, type = 'text', required, value, onChange, onBlur, error, placeholder, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-coast-deep">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`mt-1.5 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-coast-ink placeholder:text-slate-400 shadow-card transition-shadow focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400/25'
            : 'border-coast-mist focus:border-coast-ocean focus:ring-coast-ocean/20'
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
