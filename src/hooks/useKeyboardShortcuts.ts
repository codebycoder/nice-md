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
      const isSearchInput =
        target instanceof HTMLInputElement && target.type === 'search';

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.openFileNewTab();
        } else {
          actions.openFile();
        }
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'w' &&
        actions.hasActiveTab
      ) {
        event.preventDefault();
        actions.closeTab();
        return;
      }

      if (
        !isTypingTarget &&
        (event.ctrlKey || event.metaKey) &&
        event.key === 'Tab'
      ) {
        event.preventDefault();
        if (event.shiftKey) {
          actions.activatePreviousTab();
        } else {
          actions.activateNextTab();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        actions.openSearch();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        actions.reloadFile();
        return;
      }

      if (
        actions.isSearchOpen &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'g'
      ) {
        event.preventDefault();
        if (event.shiftKey) {
          actions.searchPrevious();
        } else {
          actions.searchNext();
        }
        return;
      }

      if (actions.isShortcutsModalOpen && event.key === 'Escape') {
        event.preventDefault();
        actions.closeShortcutsModal();
        return;
      }

      if (actions.isSearchOpen && event.key === 'Escape') {
        event.preventDefault();
        actions.closeSearch();
        return;
      }

      if (actions.isSearchOpen && event.key === 'Enter') {
        if (isSearchInput || !isTypingTarget) {
          event.preventDefault();
          if (event.shiftKey) {
            actions.searchPrevious();
          } else {
            actions.searchNext();
          }
          return;
        }
      }

      if (!isTypingTarget && event.key === '?') {
        event.preventDefault();
        actions.toggleShortcutsModal();
        return;
      }

      if (isTypingTarget || actions.isShortcutsModalOpen) {
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
