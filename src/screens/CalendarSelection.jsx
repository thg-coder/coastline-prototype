import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Video, MapPin, Info } from 'lucide-react';
import { useBooking } from '../state/BookingContext.jsx';
import { getPractitioner, getService, formatDateKey, SPA_NAME_PLACEHOLDER, TIMEZONE_LABEL } from '../mockData.js';
import { formatTime12h } from '../utils/format.js';
import StepShell from '../components/StepShell.jsx';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export default function CalendarSelection() {
  const { state, dispatch, goNext, availability } = useBooking();
  const svc = getService(state.serviceId);
  const pract = getPractitioner(state.practitionerId);
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

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  // Auto-advance to next month with availability if current has none.
  useEffect(() => {
    const monthHasAny = Object.keys(practAvailability).some((dateKey) => {
      const [y, m] = dateKey.split('-').map(Number);
      return y === viewMonth.getFullYear() && m - 1 === viewMonth.getMonth();
    });
    if (!monthHasAny) {
      // Look ahead up to 6 months
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

  const selectedDateKey = state.selectedDate;
  const slotsForSelected = selectedDateKey ? practAvailability[selectedDateKey] || [] : [];
  // Filter out past time slots if the selected date is today.
  const filteredSlots = useMemo(() => {
    if (!selectedDateKey) return [];
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const isToday = today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === d;
    if (!isToday) return slotsForSelected;
    const now = new Date();
    return slotsForSelected.filter((hhmm) => {
      const [hh, mm] = hhmm.split(':').map(Number);
      const slotDate = new Date(y, m - 1, d, hh, mm);
      return slotDate.getTime() > now.getTime();
    });
  }, [selectedDateKey, slotsForSelected, today]);

  // Selected slot must always remain visible — we already keep it via state.
  // If it was previously selected, ensure it appears in the chip list even
  // if availability or filter removed it (unlikely since availability is
  // deterministic, but defensive).
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
    // Tapping a different day: clear time only if it isn't this day.
    if (key !== state.selectedDate) {
      dispatch({ type: 'SET_TIME', date: key, time: null });
    }
  }

  function handleSlotClick(hhmm) {
    if (!selectedDateKey) return;
    dispatch({ type: 'SET_TIME', date: selectedDateKey, time: hhmm });
  }

  function dismissFormatBanner() {
    dispatch({ type: 'CONFIRM_FORMAT_BANNER_DISMISSED' });
  }

  const canContinue = !!state.selectedDate && !!state.selectedTime;

  return (
    <StepShell canContinue={canContinue} onContinue={() => goNext()}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-coast-deep sm:text-xl">Pick a time</h2>
          <p className="text-sm text-slate-500">
            All times shown in Eastern Time ({TIMEZONE_LABEL}).
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
            state.format === 'virtual'
              ? 'border-coast-sea/40 bg-coast-sky/60 text-coast-deep'
              : 'border-coast-sea/40 bg-coast-cream text-coast-deep'
          }`}
        >
          {state.format === 'virtual' ? (
            <>
              <Video size={12} /> Virtual
            </>
          ) : (
            <>
              <MapPin size={12} /> In-Person at {SPA_NAME_PLACEHOLDER}
            </>
          )}
        </span>
      </div>

      {pract && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-coast-sky/40 px-3 py-2 text-xs text-coast-deep">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: pract.color }}
            aria-hidden="true"
          >
            {pract.initials}
          </span>
          <span>
            {svc && svc.practitionerIds.length === 1 ? (
              <>You'll be seeing <span className="font-semibold">{pract.name}</span>.</>
            ) : (
              <>Showing availability for <span className="font-semibold">{pract.name}</span></>
            )}
          </span>
        </div>
      )}

      {state.formatChangedSinceTimePick && state.selectedTime && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Info size={14} className="mt-[2px] shrink-0" />
          <div className="flex-1">
            Format updated — please confirm your time slot.
          </div>
          <button
            onClick={dismissFormatBanner}
            className="text-amber-900 underline-offset-2 hover:underline"
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
          className="rounded-lg p-2 text-coast-ocean hover:bg-coast-sky/60 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-coast-deep">
          {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-2 text-coast-ocean hover:bg-coast-sky/60"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1 grid grid-cols-7 gap-1">
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
              className={`relative h-10 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-coast-ocean text-white shadow-sm'
                  : disabled
                    ? 'text-slate-300'
                    : 'text-coast-deep hover:bg-coast-sky/60'
              } ${isToday && !isSelected ? 'ring-1 ring-coast-ocean/60' : ''}`}
            >
              {cell.getDate()}
              {hasAvailability && !isSelected && !disabled && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-coast-sea" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDateKey ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-coast-deep">
            Available times{' '}
            <span className="font-normal text-slate-500">
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
            <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              No remaining times for this day. Try another date.
            </p>
          ) : (
            <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible">
              {slotsForRender.map((hhmm) => {
                const isSelected = state.selectedTime === hhmm;
                return (
                  <button
                    key={hhmm}
                    type="button"
                    onClick={() => handleSlotClick(hhmm)}
                    aria-pressed={isSelected}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-all sm:rounded-lg ${
                      isSelected
                        ? 'border-coast-ocean bg-coast-ocean text-white shadow-sm'
                        : 'border-slate-200 bg-white text-coast-deep hover:border-coast-sea hover:bg-coast-sky/40'
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
        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Select a date to see available times.
        </p>
      )}

      {svc && state.selectedTime && state.selectedDate && (
        <p className="mt-4 text-xs text-slate-500">
          {svc.durationMin}-minute consultation · ${svc.fee} due at booking.
        </p>
      )}
    </StepShell>
  );
}

function buildMonthGrid(viewMonth) {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startWeekday = first.getDay(); // 0..6
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }
  // Pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
