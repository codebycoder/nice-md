import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastItem, ToastVariant } from '../context/ToastContext';

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof Info }
> = {
  success: {
    container:
      'border-accent-300/60 bg-accent-50 text-accent-800 dark:border-accent-500/40 dark:bg-accent-500/15 dark:text-accent-100',
    icon: 'text-accent-600 dark:text-accent-300',
    Icon: CheckCircle2,
  },
  error: {
    container:
      'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
    icon: 'text-rose-600 dark:text-rose-300',
    Icon: XCircle,
  },
  warning: {
    container:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
    icon: 'text-amber-600 dark:text-amber-300',
    Icon: AlertTriangle,
  },
  info: {
    container:
      'border-slate-200 bg-white/95 text-slate-800 dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-100',
    icon: 'text-slate-500 dark:text-slate-300',
    Icon: Info,
  },
};

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { container, icon, Icon } = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="status"
      className={`toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-panel backdrop-blur-md ${container}`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${icon}`} aria-hidden />
      <p className="min-w-0 flex-1 text-sm leading-6">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1 text-current/60 transition hover:bg-black/5 hover:text-current dark:hover:bg-white/10"
        aria-label="بستن اعلان"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className="flex w-full max-w-md flex-col gap-2">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
