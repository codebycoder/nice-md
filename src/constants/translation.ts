import type { TranslationModelId, TranslationSettings } from '../types';

export interface TranslationModelOption {
  id: TranslationModelId;
  label: string;
  description: string;
  inputPrice: string;
  outputPrice: string;
  badge?: string;
}

export const TRANSLATION_MODELS: TranslationModelOption[] = [
  {
    id: 'google/gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    description: 'خوب تا خیلی خوب',
    inputPrice: '$0.10',
    outputPrice: '$0.40',
    badge: 'انتخاب اصلی',
  },
  {
    id: 'qwen/qwen3.5-9b',
    label: 'Qwen 3.5 9B',
    description: 'متوسط تا خوب',
    inputPrice: '$0.17',
    outputPrice: '$0.25',
    badge: 'ارزان‌ترین',
  },
  {
    id: 'deepseek/deepseek-chat',
    label: 'DeepSeek V3',
    description: 'خوب',
    inputPrice: '~$0.26',
    outputPrice: '~$1.03',
    badge: 'جایگزین',
  },
  {
    id: 'google/gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    description: 'خیلی خوب',
    inputPrice: '$0.25',
    outputPrice: '$1.50',
    badge: 'متن حساس',
  },
  {
    id: 'openai/gpt-5-mini',
    label: 'GPT-5 Mini',
    description: 'خیلی خوب',
    inputPrice: '$0.25',
    outputPrice: '$2.00',
    badge: 'کیفیت بالا',
  },
  {
    id: 'openai/gpt-5.6-luna',
    label: 'GPT-5.6 Luna',
    description: 'خوب تا خیلی خوب',
    inputPrice: '$0.20',
    outputPrice: '$1.20',
    badge: 'سریع',
  },
  {
    id: 'openai/gpt-6-luna',
    label: 'GPT-6 Luna',
    description: 'خیلی خوب',
    inputPrice: '$0.10',
    outputPrice: '$0.50',
    badge: 'جدید',
  },
  {
    id: 'anthropic/claude-haiku-5.5',
    label: 'Claude Haiku 5.5',
    description: 'خیلی خوب',
    inputPrice: '$0.10',
    outputPrice: '$0.50',
    badge: 'جدید',
  },
  {
    id: 'deepseek/deepseek-v4.1-flash',
    label: 'DeepSeek V4.1 Flash',
    description: 'خوب تا خیلی خوب',
    inputPrice: '$0.14',
    outputPrice: '$0.42',
    badge: 'جدید',
  },
  {
    id: 'qwen/qwen3.8-flash',
    label: 'Qwen 3.8 Flash',
    description: 'خوب تا خیلی خوب',
    inputPrice: '$0.15',
    outputPrice: '$0.47',
    badge: 'جدید',
  },
  {
    id: 'google/gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    description: 'عالی',
    inputPrice: '$0.83',
    outputPrice: '$4.13',
    badge: 'کیفیت بالا',
  },
  {
    id: 'openai/gpt-6.1-terra',
    label: 'GPT-6.1 Terra',
    description: 'عالی',
    inputPrice: '$1.00',
    outputPrice: '$5.00',
    badge: 'بهترین کیفیت',
  },
];

export const TRANSLATION_DISPLAY_MODE_OPTIONS = [
  { id: 'replace' as const, label: 'جایگزینی کل فایل' },
  { id: 'bilingual' as const, label: 'پاراگراف به پاراگراف' },
];

export const DEFAULT_TRANSLATION_SETTINGS: TranslationSettings = {
  model: 'google/gemini-2.5-flash-lite',
  displayMode: 'replace',
};

const VALID_MODEL_IDS = new Set<string>(
  TRANSLATION_MODELS.map((model) => model.id),
);

export function normalizeTranslationSettings(
  partial: Partial<TranslationSettings>,
): TranslationSettings {
  const model = VALID_MODEL_IDS.has(partial.model ?? '')
    ? (partial.model as TranslationModelId)
    : DEFAULT_TRANSLATION_SETTINGS.model;

  const displayMode =
    partial.displayMode === 'bilingual' || partial.displayMode === 'replace'
      ? partial.displayMode
      : DEFAULT_TRANSLATION_SETTINGS.displayMode;

  return { model, displayMode };
}
