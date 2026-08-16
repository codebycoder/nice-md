import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface TranslationLoadingOverlayProps {
  open: boolean;
  onCancel: () => void;
}

export function TranslationLoadingOverlay({
  open,
  onCancel,
}: TranslationLoadingOverlayProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/35 backdrop-blur-[2px] dark:bg-black/45"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="در حال ترجمه"
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/90 px-8 py-7 shadow-panel dark:border-white/10 dark:bg-slate-950/90">
        <Loader2
          className="size-10 animate-spin text-accent-500"
          strokeWidth={2}
          aria-hidden
        />
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            در حال ترجمه...
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            متن با درک کل محتوا ترجمه می‌شود
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-black/10 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:text-red-400"
        >
          لغو
        </button>
      </div>
    </div>
  );
}
