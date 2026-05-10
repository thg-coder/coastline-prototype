import React, { useMemo, useState } from 'react';
import { useBooking } from '../state/BookingContext.jsx';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateDob,
} from '../utils/validation.js';
import { formatPhone } from '../utils/format.js';
import StepShell from '../components/StepShell.jsx';

const REFERRAL_OPTIONS = ['Google', 'Instagram', 'Friend/Family', 'Yelp', 'Other'];

export default function IntakeForm() {
  const { state, dispatch, goNext } = useBooking();
  const intake = state.intake;
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validators = useMemo(
    () => ({
      fullName: (v) => validateRequired(v),
      email: (v) => validateEmail(v),
      phone: (v) => validatePhone(v),
      dob: (v) => validateDob(v),
      patientType: (v) => validateRequired(v),
      referral: (v) => validateRequired(v),
    }),
    []
  );

  function setField(name, value) {
    dispatch({ type: 'SET_INTAKE', patch: { [name]: value } });
    if (errors[name]) {
      // Clear inline error as user corrects it.
      const next = { ...errors };
      delete next[name];
      setErrors(next);
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

  const isValid = useMemo(() => {
    return Object.keys(validators).every((k) => !validators[k](intake[k]));
  }, [intake, validators]);

  function onContinue() {
    // Validate all on submit
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
    goNext();
  }

  return (
    <StepShell canContinue={isValid} onContinue={onContinue}>
      <div>
        <h2 className="text-lg font-semibold text-coast-deep ">Your details</h2>
        <p className="text-sm text-slate-500">
          We need a few details to confirm your consultation. Required fields are marked with{' '}
          <span className="text-rose-500">*</span>.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
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
          <label className="block text-sm font-medium text-coast-deep">
            New or returning patient? <span className="text-rose-500">*</span>
          </label>
          <div id="field-patientType" className="mt-2 flex gap-2" tabIndex={-1}>
            {[
              { v: 'new', label: 'New patient' },
              { v: 'returning', label: 'Returning patient' },
            ].map((opt) => (
              <label
                key={opt.v}
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  intake.patientType === opt.v
                    ? 'border-coast-ocean bg-coast-sky/40'
                    : 'border-slate-200 hover:border-coast-sea'
                }`}
              >
                <input
                  type="radio"
                  name="patientType"
                  value={opt.v}
                  checked={intake.patientType === opt.v}
                  onChange={() => {
                    setField('patientType', opt.v);
                    setTouched((t) => ({ ...t, patientType: true }));
                  }}
                  className="accent-coast-ocean"
                />
                <span className="text-coast-deep">{opt.label}</span>
              </label>
            ))}
          </div>
          {touched.patientType && errors.patientType && (
            <p className="mt-1 text-xs text-rose-600">{errors.patientType}</p>
          )}
        </div>

        <div>
          <label htmlFor="field-reason" className="block text-sm font-medium text-coast-deep">
            Reason for visit / goals
          </label>
          <textarea
            id="field-reason"
            rows={3}
            value={intake.reason}
            onChange={(e) => setField('reason', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-coast-deep shadow-sm focus:border-coast-ocean focus:outline-none focus:ring-1 focus:ring-coast-ocean"
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
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-coast-deep shadow-sm focus:border-coast-ocean focus:outline-none focus:ring-1 focus:ring-coast-ocean"
          >
            <option value="">Select…</option>
            {REFERRAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {touched.referral && errors.referral && (
            <p className="mt-1 text-xs text-rose-600">{errors.referral}</p>
          )}
        </div>

        <div>
          <label htmlFor="field-allergies" className="block text-sm font-medium text-coast-deep">
            Allergies or medications we should know about?
          </label>
          <textarea
            id="field-allergies"
            rows={3}
            value={intake.allergies}
            onChange={(e) => setField('allergies', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-coast-deep shadow-sm focus:border-coast-ocean focus:outline-none focus:ring-1 focus:ring-coast-ocean"
            placeholder="Optional"
          />
        </div>
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
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-coast-deep shadow-sm focus:outline-none focus:ring-1 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
            : 'border-slate-200 focus:border-coast-ocean focus:ring-coast-ocean'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
