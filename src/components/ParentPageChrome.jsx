import React from 'react';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { SPA_NAME_PLACEHOLDER } from '../mockData.js';

export default function ParentPageChrome({ children }) {
  return (
    <div className="min-h-screen bg-[#f3f6f8] text-coast-ink">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-coast-sea to-coast-ocean" />
            <span className="text-sm font-semibold tracking-tight text-coast-deep sm:text-base">
              {SPA_NAME_PLACEHOLDER}
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <span className="hover:text-coast-ocean">Services</span>
            <span className="hover:text-coast-ocean">About</span>
            <span className="text-coast-ocean font-medium">Book Now</span>
            <span className="hover:text-coast-ocean">Contact</span>
          </nav>
          <div className="flex items-center gap-3 text-slate-500">
            <Search size={18} className="hidden sm:block" />
            <ShoppingBag size={18} className="hidden sm:block" />
            <Menu size={20} className="md:hidden" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-400">Appointments</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-coast-deep sm:text-3xl">
            Book Now
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Schedule your consultation with one of our licensed practitioners.
          </p>
        </div>

        <main className="flex justify-center">{children}</main>

        <p className="mt-10 text-center text-xs text-slate-400">
          © {SPA_NAME_PLACEHOLDER} · Privacy · Terms
        </p>
      </div>
    </div>
  );
}
