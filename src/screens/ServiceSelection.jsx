import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, DollarSign, Check, Video, MapPin, Search, X, ChevronDown } from 'lucide-react';
import {
  SERVICES,
  SERVICE_CATEGORIES,
  getCategoryForService,
  getService,
} from '../mockData.js';
import { useBooking } from '../state/BookingContext.jsx';
import { priceLabel } from '../utils/pricing.js';
import StepShell from '../components/StepShell.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ServiceSelection() {
  const { state, dispatch, goNext } = useBooking();
  const selectedId = state.serviceId;

  const [pendingServiceId, setPendingServiceId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Default expanded set: empty by default; auto-expand the category that
  // contains the currently-selected service (e.g. user came back from Step 2).
  const defaultExpanded = useMemo(() => {
    const set = new Set();
    if (selectedId) {
      const cat = getCategoryForService(selectedId);
      if (cat) set.add(cat.id);
    }
    return set;
    // Computed once on mount based on initial selectedId; we don't recompute
    // when selectedId changes mid-screen because user expansion takes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [expanded, setExpanded] = useState(defaultExpanded);

  // Debounce the search input (~150ms).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim().toLowerCase()), 150);
    return () => clearTimeout(t);
  }, [searchInput]);

  // When search transitions from non-empty back to empty, reset categories
  // to their default collapsed state (with the selected category re-expanded).
  const prevDebouncedRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedRef.current !== '' && debouncedSearch === '') {
      setExpanded(new Set(defaultExpanded));
    }
    prevDebouncedRef.current = debouncedSearch;
  }, [debouncedSearch, defaultExpanded]);

  const isSearching = debouncedSearch.length > 0;

  // Filter services per category according to current search query.
  const categoriesWithMatches = useMemo(() => {
    return SERVICE_CATEGORIES.map((cat) => {
      const services = cat.serviceIds.map((id) => getService(id)).filter(Boolean);
      const matching = isSearching
        ? services.filter(
            (s) =>
              s.name.toLowerCase().includes(debouncedSearch) ||
              s.description.toLowerCase().includes(debouncedSearch)
          )
        : services;
      return { ...cat, services: matching, totalCount: services.length };
    });
  }, [debouncedSearch, isSearching]);

  const visibleCategories = isSearching
    ? categoriesWithMatches.filter((c) => c.services.length > 0)
    : categoriesWithMatches;

  const totalMatches = categoriesWithMatches.reduce((n, c) => n + c.services.length, 0);

  function isExpanded(catId) {
    if (isSearching) return true;
    return expanded.has(catId);
  }

  function toggleCategory(catId) {
    if (isSearching) return; // header taps are no-ops during search
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  function handlePick(serviceId) {
    // Re-tapping the already-selected card is a no-op (don't reset format etc.).
    if (selectedId === serviceId) return;
    // Only confirm if switching away would discard a picked appointment time.
    if (selectedId && state.selectedTime) {
      setPendingServiceId(serviceId);
      return;
    }
    dispatch({ type: 'SET_SERVICE', serviceId });
  }

  function confirmServiceChange() {
    dispatch({ type: 'SET_SERVICE', serviceId: pendingServiceId });
    setPendingServiceId(null);
  }

  return (
    <>
      <StepShell canContinue={!!selectedId} onContinue={() => goNext()} continueLabel="Continue">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-coast-deep">Choose your treatment</h2>
          <p className="mt-1 text-sm leading-relaxed text-coast-ink/55">
            Book your appointment in under a minute.
          </p>
        </div>

        {/* Sticky search */}
        <div className="sticky top-0 z-20 -mx-5 mt-4 bg-white px-5 pb-3 pt-2">
          <label className="relative block">
            <span className="sr-only">Search services</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services…"
              className="block w-full rounded-xl border border-coast-mist bg-white py-2.5 pl-9 pr-9 text-sm text-coast-ink placeholder:text-slate-400 shadow-card transition-shadow focus:border-coast-ocean focus:outline-none focus:ring-2 focus:ring-coast-ocean/20"
              aria-label="Search services"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>

        {/* Categories or empty state */}
        {isSearching && totalMatches === 0 ? (
          <div className="mt-2 rounded-xl border border-dashed border-coast-mist bg-coast-cream/60 p-6 text-center">
            <p className="text-sm font-medium text-coast-deep">
              No services match your search.
            </p>
            <p className="mt-1 text-xs text-coast-ink/55">
              Try a different keyword or browse by category below.
            </p>
          </div>
        ) : (
          <ul className="mt-1 space-y-2.5">
            {visibleCategories.map((cat) => {
              const open = isExpanded(cat.id);
              const labelCount = isSearching ? cat.services.length : cat.totalCount;
              return (
                <li
                  key={cat.id}
                  className="overflow-hidden rounded-xl border border-coast-mist bg-white shadow-card"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={open}
                    aria-controls={`cat-panel-${cat.id}`}
                    disabled={isSearching}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors ${
                      isSearching
                        ? 'cursor-default bg-coast-sky/30'
                        : 'hover:bg-coast-sky/35 active:bg-coast-sky/55'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold tracking-tight text-coast-deep">
                        {cat.label}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-coast-sky px-1.5 py-0.5 text-[10.5px] font-semibold text-coast-ocean">
                        {labelCount}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      className={`shrink-0 text-coast-sea transition-transform duration-200 ${
                        open ? 'rotate-180' : 'rotate-0'
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    id={`cat-panel-${cat.id}`}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-2.5 border-t border-coast-mist/70 px-3 py-3">
                        {cat.services.map((svc) => {
                          const isSelected = selectedId === svc.id;
                          const multiFormat = svc.formats.length > 1;
                          return (
                            <div key={svc.id}>
                              <button
                                type="button"
                                onClick={() => handlePick(svc.id)}
                                aria-pressed={isSelected}
                                className={`group relative flex w-full flex-col rounded-xl border p-3.5 text-left transition-all duration-150 ${
                                  isSelected
                                    ? 'border-coast-ocean bg-coast-sky shadow-card-active ring-1 ring-coast-ocean/20'
                                    : 'border-coast-mist/80 bg-coast-shell hover:border-coast-sea hover:bg-white hover:shadow-card-hover'
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-coast-ocean text-white shadow-sm">
                                    <Check size={12} strokeWidth={3} />
                                  </span>
                                )}
                                <h3 className="pr-6 text-sm font-semibold tracking-tight text-coast-deep">
                                  {svc.name}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-coast-ink/55">
                                  {svc.description}
                                </p>
                                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-coast-ink/55">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock size={12} className="text-coast-sea" />
                                    {svc.durationMin} min
                                  </span>
                                  {priceLabel(svc) && (
                                    <span className="inline-flex items-center gap-1">
                                      <DollarSign size={12} className="text-coast-sea" />
                                      {priceLabel(svc)}
                                    </span>
                                  )}
                                  {!multiFormat && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin size={12} className="text-coast-sea" />
                                      In-person only
                                    </span>
                                  )}
                                  {multiFormat && !isSelected && (
                                    <span className="inline-flex items-center gap-1">
                                      <Video size={12} className="text-coast-sea" />
                                      Virtual or in-person
                                    </span>
                                  )}
                                </div>
                              </button>

                              {isSelected && multiFormat && (
                                <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-coast-sky/55 px-3 py-2">
                                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-coast-deep">
                                    Format
                                  </span>
                                  <div className="flex gap-1.5">
                                    <FormatToggle
                                      active={state.format === 'in_person'}
                                      onClick={() =>
                                        dispatch({ type: 'SET_FORMAT', format: 'in_person' })
                                      }
                                      icon={<MapPin size={12} />}
                                      label="In-person"
                                    />
                                    <FormatToggle
                                      active={state.format === 'virtual'}
                                      onClick={() =>
                                        dispatch({ type: 'SET_FORMAT', format: 'virtual' })
                                      }
                                      icon={<Video size={12} />}
                                      label="Virtual"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </StepShell>

      <ConfirmDialog
        open={!!pendingServiceId}
        title="Change your treatment?"
        body="Changing your treatment will reset your selected appointment time. Your contact info will be saved."
        confirmLabel="Change treatment"
        cancelLabel="Keep current"
        onConfirm={confirmServiceChange}
        onCancel={() => setPendingServiceId(null)}
      />
    </>
  );
}

function FormatToggle({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
        active
          ? 'bg-coast-ocean text-white shadow-sm'
          : 'bg-white text-coast-ink/65 ring-1 ring-coast-mist hover:text-coast-ocean hover:ring-coast-sea'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
