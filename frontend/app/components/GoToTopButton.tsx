'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function GoToTopButton() {
  const { user } = useAuth();

  if (!user) return null;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Go back to top"
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 min-w-[56px] min-h-[56px] px-3 py-2.5 flex flex-col items-center justify-center gap-0.5 rounded-xl border border-[#4a5c82] bg-[#1c2a47]/95 text-[#c8d4e8] text-xs font-medium leading-snug hover:brightness-110 hover:border-[#5a6c92] transition-all shadow-md"
    >
      <span className="whitespace-nowrap">Go back</span>
      <span className="whitespace-nowrap">to top</span>
    </button>
  );
}
