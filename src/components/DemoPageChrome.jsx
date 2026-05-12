import React from 'react';
import { Instagram, Facebook, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../config/siteConfig.js';

// Presentation-only wrapper for the standalone demo URL — simulates a real
// med-spa website with the booking widget embedded inside it. It renders
// {children} (the <Widget />) verbatim and adds nothing the widget depends on,
// so the widget stays fully iframe-embeddable for real client deployments.
export default function DemoPageChrome({ children }) {
  const year = new Date().getFullYear();
  const navLinks = ['Services', 'About', 'Gallery', 'Contact'];

  return (
    <div className="flex min-h-dvh flex-col bg-coast-cream text-coast-ink">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-coast-mist/70 bg-coast-cream/90 backdrop-blur supports-[backdrop-filter]:bg-coast-cream/75">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a
            href="#"
            className="font-serif text-lg font-medium tracking-tight text-coast-deep sm:text-xl"
          >
            {siteConfig.practiceName}
          </a>
          <ul className="hidden items-center gap-7 text-sm font-medium text-coast-ink/70 sm:flex">
            {navLinks.map((label) => (
              <li key={label}>
                <a href="#" className="transition-colors hover:text-coast-ocean">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          {/* Mobile: a non-functional menu glyph for visual context only */}
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-coast-ink/60 sm:hidden"
          >
            <span className="space-y-[5px]">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </span>
        </nav>
      </header>

      {/* Main content area */}
      <main className="flex-1">
        {/* Intro */}
        <section className="mx-auto max-w-2xl px-5 pt-12 pb-8 text-center sm:px-8 sm:pt-16 sm:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coast-sea">
            Appointments
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-coast-deep sm:text-[2.6rem]">
            Book Your Visit
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-coast-ink/65">
            Schedule your appointment with the {siteConfig.practiceName} team in under a minute.
          </p>
        </section>

        {/* The widget, centered, untouched (its own max-w-[420px] applies) */}
        <div className="flex justify-center px-4 pb-16 sm:pb-20">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-coast-mist/70 bg-coast-shell">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-serif text-lg font-medium tracking-tight text-coast-deep">
                {siteConfig.practiceName}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-coast-ink/65">
                <li className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-coast-sea" />
                  {siteConfig.practiceAddress}
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0 text-coast-sea" />
                  {siteConfig.practicePhone}
                </li>
              </ul>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Decorative social icons — no links in the demo */}
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-coast-mist text-coast-sea transition-colors hover:border-coast-sea hover:text-coast-ocean"
              >
                <Instagram size={16} />
              </span>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-coast-mist text-coast-sea transition-colors hover:border-coast-sea hover:text-coast-ocean"
              >
                <Facebook size={16} />
              </span>
            </div>
          </div>
          <div className="mt-8 border-t border-coast-mist/60 pt-5 text-xs text-coast-ink/45">
            © {year} {siteConfig.practiceName}. Demo site — not a real practice.
          </div>
        </div>
      </footer>
    </div>
  );
}
