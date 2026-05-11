import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { generateAvailability, getService, getPractitionersForService } from '../mockData.js';
import { loadState, saveState, clearState } from '../utils/storage.js';

const BookingContext = createContext(null);

// Step ids — note: practitioner step is conditional.
export const STEPS = {
  SERVICE: 'service',
  FORMAT: 'format',
  PRACTITIONER: 'practitioner',
  CALENDAR: 'calendar',
  INTAKE: 'intake',
  POLICY: 'policy',
  CHECKOUT: 'checkout',
  CONFIRMATION: 'confirmation',
};

const ALL_STEPS = [
  STEPS.SERVICE,
  STEPS.FORMAT,
  STEPS.PRACTITIONER,
  STEPS.CALENDAR,
  STEPS.INTAKE,
  STEPS.POLICY,
  STEPS.CHECKOUT,
  STEPS.CONFIRMATION,
];

export function getActiveSteps(serviceId) {
  if (!serviceId) return ALL_STEPS;
  const svc = getService(serviceId);
  if (!svc) return ALL_STEPS;
  if (svc.practitionerIds.length <= 1) {
    return ALL_STEPS.filter((s) => s !== STEPS.PRACTITIONER);
  }
  return ALL_STEPS;
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
    patientType: '', // 'new' | 'returning'
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
      // If service only allows in-person, force in_person.
      if (svc && svc.formats.length === 1) next.format = svc.formats[0];
      else if (svc && state.format && !svc.formats.includes(state.format)) next.format = null;

      // Reset practitioner if invalid for new service.
      const allowedPractIds = svc ? svc.practitionerIds : [];
      if (state.practitionerId && !allowedPractIds.includes(state.practitionerId)) {
        next.practitionerId = null;
      }
      // For single-practitioner services auto-assign.
      if (svc && svc.practitionerIds.length === 1) {
        next.practitionerId = svc.practitionerIds[0];
      }
      // Time slot is invalidated whenever service or practitioner changes.
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
      // Practitioner change invalidates time slot.
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

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const persisted = loadState();
    if (persisted) {
      return { ...init, ...persisted };
    }
    return init;
  });

  // Generate availability ONCE per session and keep it stable.
  const availabilityRef = useRef(null);
  if (availabilityRef.current === null) availabilityRef.current = generateAvailability(4);

  // Mirror state to sessionStorage on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Browser back-button interception.
  useEffect(() => {
    // Push initial sentinel state so we can intercept back navigations.
    if (window.history.state?.rivrBooking !== true) {
      window.history.pushState({ rivrBooking: true }, '');
    }
    const handler = (e) => {
      // If the user is on Step 1, allow native back navigation by NOT
      // re-pushing — we let the browser leave.
      if (state.step === STEPS.SERVICE) return;
      // For any later step, treat as in-widget back.
      goBack();
      // Re-anchor history so future pops keep firing.
      window.history.pushState({ rivrBooking: true }, '');
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.serviceId]);

  // Clear formatChangedSinceTimePick if practitioner availability differs in
  // future versions; for the prototype availability is the same per practitioner
  // regardless of format, so we just keep the flag for the banner.

  const activeSteps = useMemo(() => getActiveSteps(state.serviceId), [state.serviceId]);
  const stepIndex = activeSteps.indexOf(state.step);

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

  function reset() {
    clearState();
    dispatch({ type: 'RESET' });
  }

  const value = {
    state,
    dispatch,
    activeSteps,
    stepIndex,
    totalSteps: activeSteps.length,
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
