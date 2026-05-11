import React from 'react';

export default function Footer() {
  return (
    <footer className="rounded-b-2xl border-t border-slate-100 bg-coast-cream/60 px-5 py-3">
      <div className="flex flex-col items-center justify-between gap-1 text-[11px] text-slate-500">
        <span className="font-medium tracking-tight text-coast-deep">
          Powered by <span className="text-coast-ocean">RIVR</span>
        </span>
      </div>
    </footer>
  );
}
