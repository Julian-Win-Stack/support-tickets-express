'use client';

import { useEffect } from 'react';

export type ToastItem = {
  subject: string;
  message?: string;
};

type ToastProps = {
  toast: ToastItem | null;
  onRemove: () => void;
};

export function Toast({ toast, onRemove }: ToastProps) {
  
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onRemove();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  if (!toast) return null;

  return (
    <div
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
      aria-live="polite"
    >
      <div
        className="rounded-[12px] border border-[#0e7490] bg-[#1c2a47] p-4 min-w-[280px] max-w-[400px] shadow-lg transition-opacity duration-300"
        role="alert"
      >
        <h4 className="m-0 text-sm font-semibold text-[#e8eefc]">{toast.subject}</h4>
        {toast.message && (
          <p className="m-0 mt-1 text-xs text-[#aab6d6]">{toast.message}</p>
        )}
      </div>
    </div>
  );
}
