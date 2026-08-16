import { Languages } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  TRANSLATION_DISPLAY_MODE_OPTIONS,
  TRANSLATION_MODELS,
} from '../constants/translation';
import type { TranslationSettings } from '../types';

interface TranslationPanelProps {
  open: boolean;
  settings: TranslationSettings;
  apiKey: string;
  canRevert: boolean;
  onClose: () => void;
  onSettingsChange: (patch: Partial<TranslationSettings>) => void;
  onApiKeyChange: (value: string) => void;
  onTranslate: () => void;
  onRevert: () => void;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="border-b border-black/5 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
      {children}
    </h3>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
      {children}
    </span>
  );
}

export function TranslationPanel({
  open,
  settings,
  apiKey,
  canRevert,
  onClose,
  onSettingsChange,
  onApiKeyChange,
  onTranslate,
  onRevert,
}: TranslationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="absolute end-0 top-full z-50 mt-2 flex max-h-[min(80vh,40rem)] w-[min(100vw-2rem,28rem)] flex-col rounded-3xl border border-black/10 bg-white/95 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
      role="dialog"
      aria-label="تنظیمات ترجمه"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-black/5 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Languages className="size-4 text-accent-500" aria-hidden />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            ترجمه با OpenRouter
          </h2>
        </div>
      </div>

      <div className="space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <SectionTitle>کلید API</SectionTitle>
          <div>
            <FieldLabel>OpenRouter API Key</FieldLabel>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => onApiKeyChange(event.target.value)}
              placeholder="sk-or-v1-..."
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-accent-400 transition focus:ring-2 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100"
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
              کلید API ذخیره نمی‌شود و فقط در همین نشست استفاده می‌شود.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>مدل</SectionTitle>
          <div className="space-y-2">
            {TRANSLATION_MODELS.map((model) => (
              <label
                key={model.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                  settings.model === model.id
                    ? 'border-accent-400 bg-accent-500/10'
                    : 'border-black/10 bg-white/50 hover:border-accent-300 dark:border-white/10 dark:bg-slate-900/50'
                }`}
              >
                <input
                  type="radio"
                  name="translation-model"
                  value={model.id}
                  checked={settings.model === model.id}
                  onChange={() => onSettingsChange({ model: model.id })}
                  className="mt-1 accent-accent-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {model.label}
                    </span>
                    {model.badge ? (
                      <span className="rounded-lg bg-accent-500/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-600 dark:text-accent-300">
                        {model.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                    {model.description} · ورودی {model.inputPrice} · خروجی{' '}
                    {model.outputPrice}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>نحوه نمایش</SectionTitle>
          <div className="flex flex-col gap-2">
            {TRANSLATION_DISPLAY_MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                  settings.displayMode === option.id
                    ? 'border-accent-400 bg-accent-500/10'
                    : 'border-black/10 bg-white/50 hover:border-accent-300 dark:border-white/10 dark:bg-slate-900/50'
                }`}
              >
                <input
                  type="radio"
                  name="translation-display-mode"
                  value={option.id}
                  checked={settings.displayMode === option.id}
                  onChange={() => onSettingsChange({ displayMode: option.id })}
                  className="accent-accent-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            ترجمه با درک کل متن انجام می‌شود. در حالت پاراگراف به پاراگراف،
            متن اصلی کمرنگ‌تر و ترجمه پررنگ‌تر نمایش داده می‌شود. بلوک‌های کد
            ترجمه نمی‌شوند.
          </p>
        </section>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 border-t border-black/5 px-4 py-3 dark:border-white/10">
        <button
          type="button"
          onClick={onTranslate}
          disabled={!apiKey.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white shadow-panel transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Languages className="size-3.5" aria-hidden />
          ترجمه
        </button>
        {canRevert ? (
          <button
            type="button"
            onClick={onRevert}
            className="rounded-2xl border border-black/10 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-slate-300 dark:hover:text-accent-300"
          >
            بازگردانی
          </button>
        ) : null}
      </div>
    </div>
  );
}
