import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import type { ThemeMode } from '../types';

function getInitialTheme(): ThemeMode {
  const persisted = localStorage.getItem(STORAGE_KEYS.theme);
  if (persisted === 'light' || persisted === 'dark') {
    return persisted;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  };
}
