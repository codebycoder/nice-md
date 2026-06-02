import { useEffect } from 'react';
import type { KeyboardActionMap } from '../types';

export function useKeyboardShortcuts(actions: KeyboardActionMap) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        actions.openFile();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        actions.focusSearch();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        actions.reloadFile();
        return;
      }

      if (isTypingTarget) {
        return;
      }

      if (event.key.toLowerCase() === 't') {
        actions.toggleTheme();
      }

      if (event.key.toLowerCase() === 'b') {
        actions.toggleSidebar();
      }

      if (event.key.toLowerCase() === 'f') {
        actions.toggleFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions]);
}
