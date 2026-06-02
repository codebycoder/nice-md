import type { CSSProperties } from 'react';
import type {
  MarkdownDirection,
  MarkdownFontFamilyId,
  MarkdownFontWeight,
  MarkdownSettings,
} from '../types';

export const MARKDOWN_FONT_SIZE_MIN = 13;
export const MARKDOWN_FONT_SIZE_MAX = 26;
export const MARKDOWN_FONT_SIZE_DEFAULT = 17;

export const MARKDOWN_LINE_HEIGHT_MIN = 1.4;
export const MARKDOWN_LINE_HEIGHT_MAX = 2.6;
export const MARKDOWN_LINE_HEIGHT_DEFAULT = 2;

export const MARKDOWN_LETTER_SPACING_MIN = -0.05;
export const MARKDOWN_LETTER_SPACING_MAX = 0.12;
export const MARKDOWN_LETTER_SPACING_DEFAULT = 0;

export const MARKDOWN_CONTENT_WIDTH_MIN = 640;
export const MARKDOWN_CONTENT_WIDTH_MAX = 1200;
export const MARKDOWN_CONTENT_WIDTH_DEFAULT = 900;

export const MARKDOWN_PARAGRAPH_SPACING_MIN = 0.5;
export const MARKDOWN_PARAGRAPH_SPACING_MAX = 2;
export const MARKDOWN_PARAGRAPH_SPACING_DEFAULT = 1;

export const MARKDOWN_HEADING_SCALE_MIN = 85;
export const MARKDOWN_HEADING_SCALE_MAX = 130;
export const MARKDOWN_HEADING_SCALE_DEFAULT = 100;

/** @deprecated Preset ids from older saved settings. */
const LEGACY_FONT_SIZE_PX: Record<string, number> = {
  sm: 15,
  md: 17,
  lg: 19,
  xl: 22,
};

export const DEFAULT_MARKDOWN_SETTINGS: MarkdownSettings = {
  direction: 'rtl',
  fontFamily: 'vazirmatn',
  fontSize: MARKDOWN_FONT_SIZE_DEFAULT,
  fontWeight: 400,
  lineHeight: MARKDOWN_LINE_HEIGHT_DEFAULT,
  letterSpacing: MARKDOWN_LETTER_SPACING_DEFAULT,
  contentWidth: MARKDOWN_CONTENT_WIDTH_DEFAULT,
  paragraphSpacing: MARKDOWN_PARAGRAPH_SPACING_DEFAULT,
  headingScale: MARKDOWN_HEADING_SCALE_DEFAULT,
  textColor: '',
  headingColor: '',
  linkColor: '',
  linkUnderline: false,
  blockquoteColor: '',
};

export const MARKDOWN_DIRECTION_OPTIONS: {
  id: MarkdownDirection;
  label: string;
}[] = [
  { id: 'rtl', label: 'راست به چپ (RTL)' },
  { id: 'ltr', label: 'چپ به راست (LTR)' },
];

export const MARKDOWN_FONT_FAMILY_OPTIONS: {
  id: MarkdownFontFamilyId;
  label: string;
  stack: string;
}[] = [
  { id: 'vazirmatn', label: 'وزیرمتن', stack: "'Vazirmatn', sans-serif" },
  {
    id: 'system',
    label: 'سیستم',
    stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: 'serif',
    label: 'سریف',
    stack: "Georgia, 'Times New Roman', Times, serif",
  },
  {
    id: 'mono',
    label: 'تک‌فاصله',
    stack: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
  },
];

export const MARKDOWN_FONT_WEIGHT_OPTIONS: {
  id: MarkdownFontWeight;
  label: string;
}[] = [
  { id: 400, label: 'معمولی' },
  { id: 500, label: 'متوسط' },
  { id: 600, label: 'نیمه‌ضخیم' },
  { id: 700, label: 'ضخیم' },
];

export const MARKDOWN_TEXT_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: 'پیش‌فرض', value: '' },
  { label: 'مشکی', value: '#0f172a' },
  { label: 'خاکستری', value: '#334155' },
  { label: 'سورمه‌ای', value: '#1e3a5f' },
  { label: 'قهوه‌ای', value: '#44403c' },
];

export const MARKDOWN_HEADING_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: 'مثل متن', value: '' },
  { label: 'مشکی', value: '#0f172a' },
  { label: 'سرمه‌ای', value: '#1e293b' },
  { label: 'سبز', value: '#1b715f' },
  { label: 'بنفش', value: '#5b21b6' },
];

export const MARKDOWN_LINK_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: 'پیش‌فرض', value: '' },
  { label: 'سبز', value: '#238f78' },
  { label: 'آبی', value: '#2563eb' },
  { label: 'بنفش', value: '#7c3aed' },
  { label: 'نارنجی', value: '#ea580c' },
];

export const MARKDOWN_BLOCKQUOTE_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: 'پیش‌فرض', value: '' },
  { label: 'سبز', value: '#3db89b' },
  { label: 'آبی', value: '#3b82f6' },
  { label: 'کهربایی', value: '#d97706' },
  { label: 'صورتی', value: '#db2777' },
];

export function resolveFontFamilyStack(id: MarkdownFontFamilyId): string {
  return (
    MARKDOWN_FONT_FAMILY_OPTIONS.find((option) => option.id === id)?.stack ??
    MARKDOWN_FONT_FAMILY_OPTIONS[0].stack
  );
}

export function fontSizePxToRem(px: number): string {
  return `${clampFontSize(px) / 16}rem`;
}

export function clampFontSize(px: number): number {
  return clamp(px, MARKDOWN_FONT_SIZE_MIN, MARKDOWN_FONT_SIZE_MAX, Math.round);
}

export function parseFontSize(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampFontSize(value);
  }

  if (typeof value === 'string' && value in LEGACY_FONT_SIZE_PX) {
    return LEGACY_FONT_SIZE_PX[value];
  }

  return MARKDOWN_FONT_SIZE_DEFAULT;
}

function clamp(
  value: number,
  min: number,
  max: number,
  round: (n: number) => number = (n) => n,
): number {
  return round(Math.min(max, Math.max(min, value)));
}

function parseNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  decimals = 2,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  const factor = 10 ** decimals;
  return clamp(Math.round(value * factor) / factor, min, max);
}

function isFontWeight(value: unknown): value is MarkdownFontWeight {
  return value === 400 || value === 500 || value === 600 || value === 700;
}

export function normalizeMarkdownSettings(
  partial: Partial<MarkdownSettings>,
): MarkdownSettings {
  return {
    direction:
      partial.direction === 'ltr' || partial.direction === 'rtl'
        ? partial.direction
        : DEFAULT_MARKDOWN_SETTINGS.direction,
    fontFamily:
      MARKDOWN_FONT_FAMILY_OPTIONS.some((o) => o.id === partial.fontFamily)
        ? (partial.fontFamily as MarkdownFontFamilyId)
        : DEFAULT_MARKDOWN_SETTINGS.fontFamily,
    fontSize: parseFontSize(partial.fontSize),
    fontWeight: isFontWeight(partial.fontWeight)
      ? partial.fontWeight
      : DEFAULT_MARKDOWN_SETTINGS.fontWeight,
    lineHeight: parseNumber(
      partial.lineHeight,
      MARKDOWN_LINE_HEIGHT_DEFAULT,
      MARKDOWN_LINE_HEIGHT_MIN,
      MARKDOWN_LINE_HEIGHT_MAX,
      1,
    ),
    letterSpacing: parseNumber(
      partial.letterSpacing,
      MARKDOWN_LETTER_SPACING_DEFAULT,
      MARKDOWN_LETTER_SPACING_MIN,
      MARKDOWN_LETTER_SPACING_MAX,
      2,
    ),
    contentWidth: parseNumber(
      partial.contentWidth,
      MARKDOWN_CONTENT_WIDTH_DEFAULT,
      MARKDOWN_CONTENT_WIDTH_MIN,
      MARKDOWN_CONTENT_WIDTH_MAX,
      0,
    ),
    paragraphSpacing: parseNumber(
      partial.paragraphSpacing,
      MARKDOWN_PARAGRAPH_SPACING_DEFAULT,
      MARKDOWN_PARAGRAPH_SPACING_MIN,
      MARKDOWN_PARAGRAPH_SPACING_MAX,
      2,
    ),
    headingScale: parseNumber(
      partial.headingScale,
      MARKDOWN_HEADING_SCALE_DEFAULT,
      MARKDOWN_HEADING_SCALE_MIN,
      MARKDOWN_HEADING_SCALE_MAX,
      0,
    ),
    textColor:
      typeof partial.textColor === 'string'
        ? partial.textColor
        : DEFAULT_MARKDOWN_SETTINGS.textColor,
    headingColor:
      typeof partial.headingColor === 'string'
        ? partial.headingColor
        : DEFAULT_MARKDOWN_SETTINGS.headingColor,
    linkColor:
      typeof partial.linkColor === 'string'
        ? partial.linkColor
        : DEFAULT_MARKDOWN_SETTINGS.linkColor,
    linkUnderline:
      typeof partial.linkUnderline === 'boolean'
        ? partial.linkUnderline
        : DEFAULT_MARKDOWN_SETTINGS.linkUnderline,
    blockquoteColor:
      typeof partial.blockquoteColor === 'string'
        ? partial.blockquoteColor
        : DEFAULT_MARKDOWN_SETTINGS.blockquoteColor,
  };
}

export function buildMarkdownShellStyle(
  settings: MarkdownSettings,
): CSSProperties & Record<string, string> {
  const style: CSSProperties & Record<string, string> = {
    direction: settings.direction,
    '--md-font-family': resolveFontFamilyStack(settings.fontFamily),
    '--md-font-size': fontSizePxToRem(settings.fontSize),
    '--md-font-weight': String(settings.fontWeight),
    '--md-line-height': String(settings.lineHeight),
    '--md-letter-spacing': `${settings.letterSpacing}em`,
    '--md-content-width': `${settings.contentWidth}px`,
    '--md-paragraph-spacing': String(settings.paragraphSpacing),
    '--md-heading-scale': String(settings.headingScale / 100),
    '--md-link-underline': settings.linkUnderline ? 'underline' : 'none',
  };

  if (settings.textColor) {
    style['--md-text-color'] = settings.textColor;
  }

  if (settings.headingColor) {
    style['--md-heading-color'] = settings.headingColor;
  } else if (settings.textColor) {
    style['--md-heading-color'] = settings.textColor;
  }

  if (settings.linkColor) {
    style['--md-link-color'] = settings.linkColor;
  }

  if (settings.blockquoteColor) {
    style['--md-blockquote-color'] = settings.blockquoteColor;
  }

  return style;
}
