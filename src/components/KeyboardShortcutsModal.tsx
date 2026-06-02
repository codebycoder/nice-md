import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { KEYBOARD_SHORTCUT_GROUPS } from '../constants/keyboardShortcuts';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

function ShortcutKey({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-lg border border-black/10 bg-stone-100 px-2 py-1 font-mono text-[11px] font-medium text-slate-700 shadow-sm dark:border-white/15 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-label="بستن"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(85vh,32rem)] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/95 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-5 py-4 dark:border-white/10">
          <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
            میانبرهای صفحه‌کلید
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-2xl border border-black/5 p-2 text-slate-600 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-slate-300 dark:hover:text-accent-300"
          >
            <X className="size-5" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5">
          {KEYBOARD_SHORTCUT_GROUPS.map((group) => (
            <section key={group.id}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={`${group.id}-${item.keys}`}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50/80 px-3 py-2.5 dark:bg-slate-900/60"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {item.label}
                    </span>
                    <ShortcutKey>{item.keys}</ShortcutKey>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="shrink-0 border-t border-black/5 px-5 py-3 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          در macOS از ⌘ و در Windows/Linux از Ctrl استفاده کنید.
        </div>
      </div>
    </div>
  );
}
