import React from 'react';
import { Waves } from 'lucide-react';
import { siteConfig } from '../config/siteConfig.js';

export default function Banner() {
  return (
    <div
      className="relative overflow-hidden rounded-t-2xl px-5 py-3 text-white"
      style={{
        background: `linear-gradient(135deg, ${siteConfig.primaryColor}, ${siteConfig.primaryColorDark})`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves size={18} className="opacity-90" />
          {siteConfig.logoUrl ? (
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.brandName}
              className="h-5 w-auto object-contain"
            />
          ) : (
            <span className="text-base font-semibold tracking-tight">{siteConfig.brandName}</span>
          )}
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
