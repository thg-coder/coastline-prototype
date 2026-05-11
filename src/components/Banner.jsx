import React from 'react';
import { Waves } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-coast-deep via-coast-ocean to-coast-sea px-5 py-3 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves size={18} className="opacity-90" />
          <span className="text-base font-semibold tracking-tight">Coastline</span>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-white/70">
          Book appointment
        </span>
      </div>
      {/* Subtle wave decoration */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3 w-full text-white/10"
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
      >
        <path d="M0 2 Q 25 4 50 2 T 100 2 V4 H0 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
