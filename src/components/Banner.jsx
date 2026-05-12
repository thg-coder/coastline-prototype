import React from 'react';
import { Waves } from 'lucide-react';
import { siteConfig } from '../config/siteConfig.js';

export default function Banner() {
  return (
    <div
      className="relative overflow-hidden rounded-t-2xl px-5 py-4 text-white"
      style={{
        background: `linear-gradient(135deg, ${siteConfig.primaryColor} 0%, ${siteConfig.primaryColorDark} 100%)`,
      }}
    >
      {/* Soft top-left highlight for a less flat, more contemporary gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,0.16), rgba(255,255,255,0) 60%)',
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves size={18} className="opacity-80" strokeWidth={1.75} />
          {siteConfig.logoUrl ? (
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.brandName}
              className="h-5 w-auto object-contain"
            />
          ) : (
            <span className="font-serif text-lg font-medium leading-none tracking-tight">
              {siteConfig.brandName}
            </span>
          )}
        </div>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/65">
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
