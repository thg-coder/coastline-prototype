import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="rounded-b-2xl border-t border-slate-100 bg-coast-cream/60 px-5 py-3">
      <div className="flex flex-col items-center justify-between gap-1 text-[11px] text-slate-500">
        <span className="font-medium tracking-tight text-coast-deep">
          Powered by <span className="text-coast-ocean">RIVR</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-coast-ocean" />
          HIPAA-compliant data handling
        </span>
      </div>
    </footer>
  );
}
