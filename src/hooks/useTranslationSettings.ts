import { useEffect, useState } from 'react';
import {
  DEFAULT_TRANSLATION_SETTINGS,
  normalizeTranslationSettings,
} from '../constants/translation';
import { STORAGE_KEYS } from '../constants/storage';
import type { TranslationSettings } from '../types';

function parsePersistedSettings(raw: string | null): TranslationSettings {
  if (!raw) {
    return DEFAULT_TRANSLATION_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TranslationSettings>;
    return normalizeTranslationSettings(parsed);
  } catch {
    return DEFAULT_TRANSLATION_SETTINGS;
  }
}

function getInitialSettings(): TranslationSettings {
  return parsePersistedSettings(
    localStorage.getItem(STORAGE_KEYS.translationSettings),
  );
}

export function useTranslationSettings() {
  const [settings, setSettings] = useState<TranslationSettings>(getInitialSettings);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.translationSettings,
      JSON.stringify(settings),
    );
  }, [settings]);

  const updateSettings = (patch: Partial<TranslationSettings>) => {
    setSettings((current) => normalizeTranslationSettings({ ...current, ...patch }));
  };

  return {
    settings,
    apiKey,
    setApiKey,
    updateSettings,
  };
}
