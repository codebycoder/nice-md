import { useCallback, useRef, useState } from 'react';
import type { useToast } from '../context/ToastContext';
import { OpenRouterError, translateDocument } from '../services/openRouterService';
import type {
  DocumentTab,
  TabTranslationState,
  TranslationProgress,
  TranslationSettings,
} from '../types';
import {
  buildContextualTranslationResult,
  hasTranslatableContent,
  protectCodeBlocks,
} from '../utils/markdownTranslation';

interface UseTranslationOptions {
  activeTab: DocumentTab | null;
  settings: TranslationSettings;
  apiKey: string;
  toast: ReturnType<typeof useToast>;
  onContentUpdate: (
    content: string,
    translation: TabTranslationState | undefined,
  ) => void;
}

export function useTranslation({
  activeTab,
  settings,
  apiKey,
  toast,
  onContentUpdate,
}: UseTranslationOptions) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelTranslation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTranslating(false);
    setProgress(null);
  }, []);

  const translate = useCallback(async () => {
    if (!activeTab) {
      toast.warning('ابتدا یک فایل انتخاب کنید.');
      return;
    }

    if (!apiKey.trim()) {
      toast.warning('کلید API OpenRouter را وارد کنید.');
      return;
    }

    const sourceContent = activeTab.translation?.originalContent ?? activeTab.file.content;

    if (!hasTranslatableContent(sourceContent)) {
      toast.warning('متنی برای ترجمه پیدا نشد.');
      return;
    }

    const { protectedText, codeBlocks } = protectCodeBlocks(sourceContent);
    const controller = new AbortController();
    abortRef.current = controller;
    setIsTranslating(true);
    setProgress({ current: 0, total: 1 });

    try {
      const translatedProtected = await translateDocument(
        apiKey.trim(),
        settings.model,
        protectedText,
        controller.signal,
      );

      setProgress({ current: 1, total: 1 });

      const result = buildContextualTranslationResult(
        sourceContent,
        translatedProtected,
        codeBlocks,
        settings.displayMode,
      );

      onContentUpdate(result.content, {
        originalContent: sourceContent,
        mode: settings.displayMode,
        bilingualBlocks: result.bilingualBlocks,
      });

      toast.success('ترجمه با موفقیت انجام شد.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.info('ترجمه لغو شد.');
        return;
      }

      if (error instanceof OpenRouterError) {
        toast.error(error.message);
        return;
      }

      toast.error('ترجمه با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    } finally {
      abortRef.current = null;
      setIsTranslating(false);
      setProgress(null);
    }
  }, [activeTab, apiKey, onContentUpdate, settings, toast]);

  const revert = useCallback(() => {
    if (!activeTab?.translation) {
      return;
    }

    onContentUpdate(activeTab.translation.originalContent, undefined);
    toast.info('متن اصلی بازگردانده شد.');
  }, [activeTab, onContentUpdate, toast]);

  return {
    isTranslating,
    progress,
    translate,
    revert,
    cancelTranslation,
    canRevert: Boolean(activeTab?.translation),
  };
}
