import { useEffect, useRef } from 'react';
import {
  MARKDOWN_BLOCKQUOTE_COLOR_PRESETS,
  MARKDOWN_CONTENT_WIDTH_MAX,
  MARKDOWN_CONTENT_WIDTH_MIN,
  MARKDOWN_DIRECTION_OPTIONS,
  MARKDOWN_FONT_FAMILY_OPTIONS,
  MARKDOWN_FONT_SIZE_MAX,
  MARKDOWN_FONT_SIZE_MIN,
  MARKDOWN_FONT_WEIGHT_OPTIONS,
  MARKDOWN_HEADING_COLOR_PRESETS,
  MARKDOWN_HEADING_SCALE_MAX,
  MARKDOWN_HEADING_SCALE_MIN,
  MARKDOWN_LETTER_SPACING_MAX,
  MARKDOWN_LETTER_SPACING_MIN,
  MARKDOWN_LINE_HEIGHT_MAX,
  MARKDOWN_LINE_HEIGHT_MIN,
  MARKDOWN_LINK_COLOR_PRESETS,
  MARKDOWN_PARAGRAPH_SPACING_MAX,
  MARKDOWN_PARAGRAPH_SPACING_MIN,
  MARKDOWN_TEXT_COLOR_PRESETS,
} from '../constants/markdownSettings';
import type { MarkdownSettings } from '../types';

interface MarkdownSettingsPanelProps {
  open: boolean;
  settings: MarkdownSettings;
  onClose: () => void;
  onChange: (patch: Partial<MarkdownSettings>) => void;
  onReset: () => void;
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

function SliderField({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-accent-500"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

function OptionGroup<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={String(option.id)}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            value === option.id
              ? 'border-accent-400 bg-accent-500/15 text-accent-600 dark:text-accent-300'
              : 'border-black/10 bg-white/70 text-slate-600 hover:border-accent-300 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ColorField({
  label,
  value,
  presets,
  fallbackHex,
  onChange,
}: {
  label: string;
  value: string;
  presets: { label: string; value: string }[];
  fallbackHex: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            title={preset.label}
            onClick={() => onChange(preset.value)}
            className={`h-8 min-w-[2.5rem] rounded-xl border px-2 text-[10px] font-medium transition ${
              value === preset.value
                ? 'border-accent-400 ring-2 ring-accent-400/30'
                : 'border-black/10 dark:border-white/10'
            }`}
            style={
              preset.value
                ? { backgroundColor: preset.value, color: '#fff' }
                : undefined
            }
          >
            {!preset.value ? preset.label : ''}
          </button>
        ))}
        <input
          type="color"
          value={value || fallbackHex}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 cursor-pointer rounded-lg border border-black/10 bg-transparent p-0.5 dark:border-white/10"
          aria-label={`${label} سفارشی`}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg px-2 py-1 text-[10px] text-slate-500 underline dark:text-slate-400"
          >
            پاک کردن
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[10px] text-slate-400">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-accent-500"
      />
    </label>
  );
}

export function MarkdownSettingsPanel({
  open,
  settings,
  onClose,
  onChange,
  onReset,
}: MarkdownSettingsPanelProps) {
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
      className="absolute end-0 top-full z-50 mt-2 flex max-h-[min(80vh,36rem)] w-[min(100vw-2rem,26rem)] flex-col rounded-3xl border border-black/10 bg-white/95 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
      role="dialog"
      aria-label="تنظیمات نمایش متن"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-black/5 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          تنظیمات نمایش
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 underline hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-300"
        >
          بازنشانی
        </button>
      </div>

      <div className="space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <SectionTitle>چیدمان و خوانایی</SectionTitle>

          <div>
            <FieldLabel>جهت متن</FieldLabel>
            <div className="mt-2">
              <OptionGroup
                value={settings.direction}
                options={MARKDOWN_DIRECTION_OPTIONS}
                onChange={(direction) => onChange({ direction })}
              />
            </div>
          </div>

          <SliderField
            label="عرض ستون متن"
            value={settings.contentWidth}
            min={MARKDOWN_CONTENT_WIDTH_MIN}
            max={MARKDOWN_CONTENT_WIDTH_MAX}
            step={20}
            formatValue={(v) => `${v}px`}
            onChange={(contentWidth) => onChange({ contentWidth })}
          />

          <SliderField
            label="فاصله خطوط"
            value={settings.lineHeight}
            min={MARKDOWN_LINE_HEIGHT_MIN}
            max={MARKDOWN_LINE_HEIGHT_MAX}
            step={0.1}
            formatValue={(v) => v.toFixed(1)}
            onChange={(lineHeight) => onChange({ lineHeight })}
          />

          <SliderField
            label="فاصله پاراگراف‌ها"
            value={settings.paragraphSpacing}
            min={MARKDOWN_PARAGRAPH_SPACING_MIN}
            max={MARKDOWN_PARAGRAPH_SPACING_MAX}
            step={0.25}
            formatValue={(v) => `×${v.toFixed(2)}`}
            onChange={(paragraphSpacing) => onChange({ paragraphSpacing })}
          />
        </section>

        <section className="space-y-3">
          <SectionTitle>تایپوگرافی</SectionTitle>

          <div>
            <FieldLabel>فونت</FieldLabel>
            <div className="mt-2">
              <OptionGroup
                value={settings.fontFamily}
                options={MARKDOWN_FONT_FAMILY_OPTIONS}
                onChange={(fontFamily) => onChange({ fontFamily })}
              />
            </div>
          </div>

          <div>
            <FieldLabel>ضخامت متن</FieldLabel>
            <div className="mt-2">
              <OptionGroup
                value={settings.fontWeight}
                options={MARKDOWN_FONT_WEIGHT_OPTIONS}
                onChange={(fontWeight) => onChange({ fontWeight })}
              />
            </div>
          </div>

          <SliderField
            label="اندازه فونت"
            value={settings.fontSize}
            min={MARKDOWN_FONT_SIZE_MIN}
            max={MARKDOWN_FONT_SIZE_MAX}
            step={1}
            formatValue={(v) => `${v}px`}
            onChange={(fontSize) => onChange({ fontSize })}
          />

          <SliderField
            label="اندازه عناوین"
            value={settings.headingScale}
            min={MARKDOWN_HEADING_SCALE_MIN}
            max={MARKDOWN_HEADING_SCALE_MAX}
            step={5}
            formatValue={(v) => `${v}%`}
            onChange={(headingScale) => onChange({ headingScale })}
          />

          <SliderField
            label="فاصله حروف"
            value={settings.letterSpacing}
            min={MARKDOWN_LETTER_SPACING_MIN}
            max={MARKDOWN_LETTER_SPACING_MAX}
            step={0.01}
            formatValue={(v) => `${v.toFixed(2)}em`}
            onChange={(letterSpacing) => onChange({ letterSpacing })}
          />
        </section>

        <section className="space-y-3">
          <SectionTitle>رنگ‌ها</SectionTitle>

          <ColorField
            label="رنگ متن"
            value={settings.textColor}
            presets={MARKDOWN_TEXT_COLOR_PRESETS}
            fallbackHex="#0f172a"
            onChange={(textColor) => onChange({ textColor })}
          />

          <ColorField
            label="رنگ عناوین"
            value={settings.headingColor}
            presets={MARKDOWN_HEADING_COLOR_PRESETS}
            fallbackHex="#0f172a"
            onChange={(headingColor) => onChange({ headingColor })}
          />

          <ColorField
            label="رنگ نقل‌قول"
            value={settings.blockquoteColor}
            presets={MARKDOWN_BLOCKQUOTE_COLOR_PRESETS}
            fallbackHex="#3db89b"
            onChange={(blockquoteColor) => onChange({ blockquoteColor })}
          />
        </section>

        <section className="space-y-3">
          <SectionTitle>لینک‌ها</SectionTitle>

          <ColorField
            label="رنگ لینک"
            value={settings.linkColor}
            presets={MARKDOWN_LINK_COLOR_PRESETS}
            fallbackHex="#238f78"
            onChange={(linkColor) => onChange({ linkColor })}
          />

          <ToggleField
            label="زیرخط لینک"
            description="نمایش خط زیر لینک‌ها"
            checked={settings.linkUnderline}
            onChange={(linkUnderline) => onChange({ linkUnderline })}
          />
        </section>
      </div>
    </div>
  );
}
