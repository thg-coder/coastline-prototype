import React, { useMemo, useState } from 'react';
import { Lock, CreditCard, Info } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import { getService, getPractitioner, TIMEZONE_LABEL } from '../mockData.js';
import { siteConfig } from '../config/siteConfig.js';
import { priceLabel } from '../utils/pricing.js';
import {
  formatCardNumber,
  formatExpiry,
  digitsOnly,
  formatTime12h,
  formatDateLong,
  maskCardLast4,
} from '../utils/format.js';
import {
  validateCardNumber,
  validateExpiry,
  validateCvc,
  validateZip,
} from '../utils/validation.js';
import StepShell from '../components/StepShell.jsx';

export default function Checkout() {
  const { state, dispatch, goNext } = useBooking();
  const svc = getService(state.serviceId);
  const pract = getPractitioner(state.practitionerId);

  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', zip: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validators = useMemo(
    () => ({
      number: (v) => validateCardNumber(v),
      expiry: (v) => validateExpiry(v),
      cvc: (v) => validateCvc(v),
      zip: (v) => validateZip(v),
    }),
    []
  );

  function setField(name, raw) {
    let value = raw;
    if (name === 'number') value = formatCardNumber(raw);
    else if (name === 'expiry') value = formatExpiry(raw);
    else if (name === 'cvc') value = digitsOnly(raw).slice(0, 4);
    else if (name === 'zip') value = digitsOnly(raw).slice(0, 5);
    setCard((c) => ({ ...c, [name]: value }));
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
    }
  }

  function handleBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    const err = validators[name](card[name]);
    setErrors((e) => ({ ...e, [name]: err || undefined }));
  }

  const isValid = useMemo(
    () => Object.keys(validators).every((k) => !validators[k](card[k])),
    [card, validators]
  );

  function onSubmit() {
    const newErrors = {};
    Object.keys(validators).forEach((k) => {
      const err = validators[k](card[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    setTouched({ number: true, expiry: true, cvc: true, zip: true });
    if (Object.keys(newErrors).length > 0) {
      const first = Object.keys(newErrors)[0];
      const el = document.getElementById(`pay-${first}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
      return;
    }
    setSubmitting(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        dispatch({ type: 'SET_PAYMENT', cardLast4: maskCardLast4(card.number) });
        setSubmitting(false);
        goNext();
        resolve();
      }, 1200);
    });
  }

  const apptDate = state.selectedDate
    ? (() => {
        const [y, m, d] = state.selectedDate.split('-').map(Number);
        return new Date(y, m - 1, d);
      })()
    : null;

  return (
    <StepShell
      canContinue={isValid && !submitting}
      onContinue={onSubmit}
      continueLabel={submitting ? 'Processing…' : `Pay $${svc?.fee || 0} and Book`}
      continueVariant="success"
    >
      <div>
        <h2 className="text-lg font-semibold text-coast-deep ">Secure checkout</h2>
        <p className="text-sm text-slate-500">
          Your deposit is charged now to hold the appointment.
        </p>
      </div>

      {/* Order summary — above on mobile, side-by-side on desktop */}
      <div className="mt-5 flex flex-col gap-5">
        <div className="order-2">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-coast-deep">
                <CreditCard size={16} className="text-coast-ocean" />
                Card details
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Lock size={11} /> Secure
              </span>
            </div>
            <div className="space-y-3 p-4">
              <PayField
                id="pay-number"
                label="Card number"
                value={card.number}
                onChange={(v) => setField('number', v)}
                onBlur={() => handleBlur('number')}
                error={touched.number && errors.number}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <div className="grid grid-cols-3 gap-3">
                <PayField
                  id="pay-expiry"
                  label="MM/YY"
                  value={card.expiry}
                  onChange={(v) => setField('expiry', v)}
                  onBlur={() => handleBlur('expiry')}
                  error={touched.expiry && errors.expiry}
                  placeholder="12/29"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
                <PayField
                  id="pay-cvc"
                  label="CVC"
                  value={card.cvc}
                  onChange={(v) => setField('cvc', v)}
                  onBlur={() => handleBlur('cvc')}
                  error={touched.cvc && errors.cvc}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  type="password"
                />
                <PayField
                  id="pay-zip"
                  label="ZIP"
                  value={card.zip}
                  onChange={(v) => setField('zip', v)}
                  onBlur={() => handleBlur('zip')}
                  error={touched.zip && errors.zip}
                  placeholder="10001"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-coast-sky/40 p-3 text-[11px] text-coast-deep">
                <Info size={12} className="mt-0.5 shrink-0 text-coast-ocean" />
                <span>
                  Demo: use card{' '}
                  <span className="font-mono font-semibold">4242 4242 4242 4242</span>, any future
                  date, any CVC.
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="order-1">
          <div className="rounded-xl border border-slate-200 bg-coast-cream/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-coast-ocean">
              Order summary
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Service" value={svc?.name || '—'} />
              <Row label="Provider" value={pract?.name || '—'} />
              <Row
                label="When"
                value={
                  apptDate && state.selectedTime
                    ? `${apptDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })} · ${formatTime12h(state.selectedTime)} ${TIMEZONE_LABEL}`
                    : '—'
                }
              />
              <Row
                label="Format"
                value={state.format === 'virtual' ? 'Virtual' : `In-person · ${siteConfig.practiceName}`}
              />
            </dl>
            <hr className="my-3 border-slate-200" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Deposit</span>
              {priceLabel(svc) && (
                <span className="text-base font-semibold text-coast-deep">{priceLabel(svc)}</span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Charged today to confirm your booking. {apptDate ? formatDateLong(apptDate) : ''}
            </p>
          </div>
        </aside>
      </div>
    </StepShell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-coast-deep">{value}</dd>
    </div>
  );
}

function PayField({ id, label, value, onChange, onBlur, error, placeholder, inputMode, autoComplete, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm tracking-wide text-coast-deep shadow-sm focus:outline-none focus:ring-1 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
            : 'border-slate-200 focus:border-coast-ocean focus:ring-coast-ocean'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
