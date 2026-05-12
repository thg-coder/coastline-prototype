import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  generateAvailability,
  getService,
  getPractitionersForService,
} from '../mockData.js';
import { siteConfig } from '../config/siteConfig.js';
import { loadState, saveState, clearState } from '../utils/storage.js';

const BookingContext = createContext(null);

// Step ids. The 4-stage flow is:
//   SERVICE → GATE → SCHEDULE → (CHECKOUT, only if a deposit is required) → CONFIRMATION
// CONFIRMATION is the terminal screen and is NOT counted in the "Step X of N" progress.
export const STEPS = {
  SERVICE: 'service',
  GATE: 'gate',
  SCHEDULE: 'schedule',
  CHECKOUT: 'checkout',
  CONFIRMATION: 'confirmation',
};

const ALL_STEPS = [
  STEPS.SERVICE,
  STEPS.GATE,
  STEPS.SCHEDULE,
  STEPS.CHECKOUT,
  STEPS.CONFIRMATION,
];

const VALID_STEPS = new Set(Object.values(STEPS));

// The active step list for the current booking. CHECKOUT is included only when
// a deposit is required — a per-service `requiresDeposit` override if present,
// otherwise the global siteConfig flag.
export function getActiveSteps(serviceId) {
  const svc = getService(serviceId);
  const requiresDeposit = svc?.requiresDeposit ?? siteConfig.requiresDeposit;
  return ALL_STEPS.filter((s) => s !== STEPS.CHECKOUT || requiresDeposit);
}

function defaultFormatFor(svc) {
  if (!svc || !svc.formats || svc.formats.length === 0) return null;
  if (svc.formats.length === 1) return svc.formats[0];
  // Med-spa treatments default to in-person when both are offered.
  return svc.formats.includes('in_person') ? 'in_person' : svc.formats[0];
}

const initialState = {
  step: STEPS.SERVICE,
  serviceId: null,
  format: null, // 'virtual' | 'in_person'
  practitionerId: null,
  selectedDate: null, // YYYY-MM-DD
  selectedTime: null, // HH:MM (24h)
  formatChangedSinceTimePick: false,
  intake: {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    patientType: '', // 'new' | 'returning'  (set on the GATE screen)
    reason: '',
    referral: '',
    allergies: '',
  },
  policyAccepted: false,
  payment: {
    cardLast4: null,
    completedAt: null,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'GO_TO':
      return { ...state, step: action.step };
    case 'SET_SERVICE': {
      const { serviceId } = action;
      const svc = getService(serviceId);
      const next = { ...state, serviceId };

      // Format: forced for single-format services, sensible default otherwise.
      next.format = defaultFormatFor(svc);

      // Practitioner: auto-assign first-available for this service (the
      // practitioner step no longer exists; users can swap on the Schedule
      // screen via the "See other providers" expander).
      next.practitionerId = svc && svc.practitionerIds.length > 0 ? svc.practitionerIds[0] : null;

      // Changing the service always invalidates any previously picked slot.
      next.selectedDate = null;
      next.selectedTime = null;
      next.formatChangedSinceTimePick = false;
      return next;
    }
    case 'SET_FORMAT': {
      const next = { ...state, format: action.format };
      if (state.selectedTime) next.formatChangedSinceTimePick = true;
      return next;
    }
    case 'SET_PRACTITIONER': {
      const next = { ...state, practitionerId: action.practitionerId };
      // A practitioner change invalidates the time slot (availability differs).
      if (state.practitionerId !== action.practitionerId) {
        next.selectedDate = null;
        next.selectedTime = null;
        next.formatChangedSinceTimePick = false;
      }
      return next;
    }
    case 'SET_TIME':
      return {
        ...state,
        selectedDate: action.date,
        selectedTime: action.time,
        formatChangedSinceTimePick: false,
      };
    case 'SET_INTAKE':
      return { ...state, intake: { ...state.intake, ...action.patch } };
    case 'SET_POLICY':
      return { ...state, policyAccepted: action.value };
    case 'SET_PAYMENT':
      return {
        ...state,
        payment: {
          cardLast4: action.cardLast4,
          completedAt: new Date().toISOString(),
        },
      };
    case 'CONFIRM_FORMAT_BANNER_DISMISSED':
      return { ...state, formatChangedSinceTimePick: false };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// Hydrate from sessionStorage, guarding against state shaped by an older
// version of the widget (e.g. step ids like 'format' / 'practitioner' that
// no longer exist, or a partial intake object).
function hydrate(init) {
  const persisted = loadState();
  if (!persisted) return init;
  const merged = { ...init, ...persisted };
  if (!VALID_STEPS.has(merged.step)) merged.step = STEPS.SERVICE;
  merged.intake = { ...init.intake, ...(persisted.intake || {}) };
  merged.payment = { ...init.payment, ...(persisted.payment || {}) };
  return merged;
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, hydrate);

  // Generate availability ONCE per session and keep it stable.
  const availabilityRef = useRef(null);
  if (availabilityRef.current === null) availabilityRef.current = generateAvailability(4);

  // Mirror state to sessionStorage on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeSteps = useMemo(() => getActiveSteps(state.serviceId), [state.serviceId]);
  // Steps that count toward the "Step X of N" indicator — everything except
  // the terminal CONFIRMATION screen.
  const countedSteps = useMemo(
    () => activeSteps.filter((s) => s !== STEPS.CONFIRMATION),
    [activeSteps]
  );
  const stepIndex = countedSteps.indexOf(state.step); // -1 when on CONFIRMATION

  function goTo(step) {
    dispatch({ type: 'GO_TO', step });
  }
  function goNext() {
    const idx = activeSteps.indexOf(state.step);
    if (idx >= 0 && idx < activeSteps.length - 1) {
      dispatch({ type: 'GO_TO', step: activeSteps[idx + 1] });
    }
  }
  function goBack() {
    const idx = activeSteps.indexOf(state.step);
    if (idx > 0) {
      dispatch({ type: 'GO_TO', step: activeSteps[idx - 1] });
    }
  }

  // Browser back-button interception — walks back through the *active* step
  // list (so removed/skipped steps are never visited).
  useEffect(() => {
    if (window.history.state?.rivrBooking !== true) {
      window.history.pushState({ rivrBooking: true }, '');
    }
    const handler = () => {
      // On Step 1, allow native back navigation by NOT re-pushing.
      if (state.step === STEPS.SERVICE) return;
      goBack();
      // Re-anchor history so future pops keep firing.
      window.history.pushState({ rivrBooking: true }, '');
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.serviceId]);

  function reset() {
    clearState();
    dispatch({ type: 'RESET' });
  }

  const value = {
    state,
    dispatch,
    activeSteps,
    countedSteps,
    stepIndex,
    totalSteps: countedSteps.length,
    availability: availabilityRef.current,
    goTo,
    goNext,
    goBack,
    reset,
    practitionersForService: state.serviceId
      ? getPractitionersForService(state.serviceId)
      : [],
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
