import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-coast-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="w-full max-w-md animate-fadeIn rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2 text-amber-600">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h2 id="confirm-title" className="text-base font-semibold text-coast-deep">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-coast-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-coast-deep"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
