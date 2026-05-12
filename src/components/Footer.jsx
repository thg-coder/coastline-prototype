import React from 'react';

export default function Footer() {
  return (
    <footer className="rounded-b-2xl border-t border-slate-100 bg-coast-cream/70 px-5 py-3">
      <div className="flex items-center justify-center text-[10.5px] tracking-wide text-slate-400">
        <span>
          Powered by{' '}
          <span className="font-medium tracking-tight text-coast-ocean">RIVR</span>
        </span>
      </div>
    </footer>
  );
}
