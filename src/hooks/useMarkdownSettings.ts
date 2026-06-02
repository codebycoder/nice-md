import { useEffect, useState } from 'react';
import {
  DEFAULT_MARKDOWN_SETTINGS,
  normalizeMarkdownSettings,
} from '../constants/markdownSettings';
import { STORAGE_KEYS } from '../constants/storage';
import type { MarkdownSettings } from '../types';

function parsePersistedSettings(raw: string | null): MarkdownSettings {
  if (!raw) {
    return DEFAULT_MARKDOWN_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MarkdownSettings>;
    return normalizeMarkdownSettings(parsed);
  } catch {
    return DEFAULT_MARKDOWN_SETTINGS;
  }
}

function getInitialSettings(): MarkdownSettings {
  return parsePersistedSettings(
    localStorage.getItem(STORAGE_KEYS.markdownSettings),
  );
}

export function useMarkdownSettings() {
  const [settings, setSettings] = useState<MarkdownSettings>(getInitialSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.markdownSettings, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (patch: Partial<MarkdownSettings>) => {
    setSettings((current) => normalizeMarkdownSettings({ ...current, ...patch }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_MARKDOWN_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
