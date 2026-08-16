import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { useToast } from '../context/ToastContext';
import {
  openMarkdownFile,
  persistLastFileMeta,
  readDroppedMarkdownFile,
  reloadMarkdownFile,
} from '../services/fileService';
import type { DocumentTab, LoadedFileState, TabSearchState, TabTranslationState } from '../types';

interface DocumentTabsState {
  tabs: DocumentTab[];
  activeTabId: string | null;
}

type DocumentTabsAction =
  | { type: 'TAB_OPENED'; tab: DocumentTab; previousScrollTop?: number; previousTabId?: string | null }
  | {
      type: 'TABS_OPENED';
      tabs: DocumentTab[];
      previousScrollTop?: number;
      previousTabId?: string | null;
    }
  | { type: 'TAB_ACTIVATED'; tabId: string; previousScrollTop: number; previousTabId: string | null }
  | { type: 'TAB_CLOSED'; tabId: string }
  | { type: 'TAB_FILE_REPLACED'; tabId: string; file: LoadedFileState }
  | { type: 'TAB_FILE_RELOADED'; tabId: string; file: LoadedFileState }
  | { type: 'TAB_SEARCH_UPDATED'; tabId: string; patch: Partial<TabSearchState> }
  | { type: 'TAB_CONTENT_UPDATED'; tabId: string; content: string; translation?: TabTranslationState }
  | { type: 'TAB_SCROLL_SAVED'; tabId: string; scrollTop: number };

function createEmptySearch(): TabSearchState {
  return {
    open: false,
    query: '',
    activeMatchIndex: -1,
    totalMatches: 0,
  };
}

function createTab(file: LoadedFileState): DocumentTab {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    file,
    search: createEmptySearch(),
    scrollTop: 0,
    createdAt: now,
    lastActivatedAt: now,
  };
}

function saveScrollOnTab(
  tabs: DocumentTab[],
  tabId: string | null | undefined,
  scrollTop: number,
): DocumentTab[] {
  if (!tabId) {
    return tabs;
  }

  return tabs.map((tab) =>
    tab.id === tabId ? { ...tab, scrollTop } : tab,
  );
}

function documentTabsReducer(
  state: DocumentTabsState,
  action: DocumentTabsAction,
): DocumentTabsState {
  switch (action.type) {
    case 'TAB_OPENED': {
      const tabsWithScroll = saveScrollOnTab(
        state.tabs,
        action.previousTabId,
        action.previousScrollTop ?? 0,
      );
      return {
        tabs: [...tabsWithScroll, action.tab],
        activeTabId: action.tab.id,
      };
    }

    case 'TABS_OPENED': {
      const tabsWithScroll = saveScrollOnTab(
        state.tabs,
        action.previousTabId,
        action.previousScrollTop ?? 0,
      );
      const lastTab = action.tabs.at(-1);
      return {
        tabs: [...tabsWithScroll, ...action.tabs],
        activeTabId: lastTab?.id ?? state.activeTabId,
      };
    }

    case 'TAB_ACTIVATED': {
      const tabsWithScroll = saveScrollOnTab(
        state.tabs,
        action.previousTabId,
        action.previousScrollTop,
      );
      const now = Date.now();
      return {
        tabs: tabsWithScroll.map((tab) =>
          tab.id === action.tabId ? { ...tab, lastActivatedAt: now } : tab,
        ),
        activeTabId: action.tabId,
      };
    }

    case 'TAB_CLOSED': {
      const index = state.tabs.findIndex((tab) => tab.id === action.tabId);
      if (index === -1) {
        return state;
      }

      const nextTabs = state.tabs.filter((tab) => tab.id !== action.tabId);

      if (nextTabs.length === 0) {
        return { tabs: [], activeTabId: null };
      }

      if (state.activeTabId !== action.tabId) {
        return { tabs: nextTabs, activeTabId: state.activeTabId };
      }

      const nextActiveIndex = index > 0 ? index - 1 : 0;
      return {
        tabs: nextTabs,
        activeTabId: nextTabs[nextActiveIndex]?.id ?? null,
      };
    }

    case 'TAB_FILE_REPLACED':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId
            ? { ...tab, file: action.file, search: createEmptySearch(), scrollTop: 0 }
            : tab,
        ),
      };

    case 'TAB_FILE_RELOADED':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId
            ? { ...tab, file: action.file, translation: undefined }
            : tab,
        ),
      };

    case 'TAB_SEARCH_UPDATED':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId
            ? { ...tab, search: { ...tab.search, ...action.patch } }
            : tab,
        ),
      };

    case 'TAB_SCROLL_SAVED':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId ? { ...tab, scrollTop: action.scrollTop } : tab,
        ),
      };

    case 'TAB_CONTENT_UPDATED':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId
            ? {
                ...tab,
                file: { ...tab.file, content: action.content },
                translation: action.translation,
                search: createEmptySearch(),
                scrollTop: 0,
              }
            : tab,
        ),
      };

    default:
      return state;
  }
}

const initialState: DocumentTabsState = {
  tabs: [],
  activeTabId: null,
};

export function useDocumentTabs(toast: ReturnType<typeof useToast>) {
  const [state, dispatch] = useReducer(documentTabsReducer, initialState);

  const activeTab = useMemo(
    () => state.tabs.find((tab) => tab.id === state.activeTabId) ?? null,
    [state.tabs, state.activeTabId],
  );

  const prevActiveTabIdRef = useRef<string | null>(null);

  useEffect(() => {
    const tabId = state.activeTabId;
    if (!tabId) {
      prevActiveTabIdRef.current = null;
      return;
    }

    if (prevActiveTabIdRef.current === tabId) {
      return;
    }

    prevActiveTabIdRef.current = tabId;
    const tab = state.tabs.find((item) => item.id === tabId);
    if (!tab) {
      return;
    }

    const scrollTop = tab.scrollTop;
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollTop);
    });
  }, [state.activeTabId, state.tabs]);

  const activateTab = useCallback(
    (tabId: string) => {
      if (tabId === state.activeTabId) {
        return;
      }

      dispatch({
        type: 'TAB_ACTIVATED',
        tabId,
        previousScrollTop: window.scrollY,
        previousTabId: state.activeTabId,
      });
    },
    [state.activeTabId],
  );

  const activateRelativeTab = useCallback(
    (delta: -1 | 1) => {
      if (state.tabs.length === 0 || !state.activeTabId) {
        return;
      }

      const currentIndex = state.tabs.findIndex((tab) => tab.id === state.activeTabId);
      if (currentIndex === -1) {
        return;
      }

      const nextIndex =
        (currentIndex + delta + state.tabs.length) % state.tabs.length;
      activateTab(state.tabs[nextIndex].id);
    },
    [state.tabs, state.activeTabId, activateTab],
  );

  const closeTab = useCallback(
    (tabId: string) => {
      dispatch({ type: 'TAB_CLOSED', tabId });
    },
    [],
  );

  const closeActiveTab = useCallback(() => {
    if (!state.activeTabId) {
      return;
    }

    closeTab(state.activeTabId);
  }, [state.activeTabId, closeTab]);

  const updateTabSearch = useCallback(
    (tabId: string, patch: Partial<TabSearchState>) => {
      dispatch({ type: 'TAB_SEARCH_UPDATED', tabId, patch });
    },
    [],
  );

  const updateActiveTabSearch = useCallback(
    (patch: Partial<TabSearchState>) => {
      if (!state.activeTabId) {
        return;
      }

      dispatch({ type: 'TAB_SEARCH_UPDATED', tabId: state.activeTabId, patch });
    },
    [state.activeTabId],
  );

  const openFileWithState = useCallback(
    (file: LoadedFileState, opts?: { newTab?: boolean }) => {
      persistLastFileMeta(file);
      const forceNewTab = opts?.newTab === true;
      const shouldOpenNewTab = forceNewTab || state.tabs.length > 0;

      dispatch({
        type: 'TAB_OPENED',
        tab: createTab(file),
        ...(shouldOpenNewTab
          ? {
              previousScrollTop: window.scrollY,
              previousTabId: state.activeTabId,
            }
          : {}),
      });

      toast.success(`فایل «${file.name}» بارگذاری شد.`);
    },
    [state.tabs.length, state.activeTabId, toast],
  );

  const openFile = useCallback(
    async (opts?: { newTab?: boolean }) => {
      try {
        const file = await openMarkdownFile();
        if (!file) {
          return;
        }

        openFileWithState(file, opts);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        toast.error('باز کردن فایل با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
      }
    },
    [openFileWithState, toast],
  );

  const openFromDropMany = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      const loaded: LoadedFileState[] = [];

      for (const file of files) {
        try {
          loaded.push(await readDroppedMarkdownFile(file));
        } catch {
          toast.error(`خواندن «${file.name}» با خطا مواجه شد.`);
        }
      }

      if (loaded.length === 0) {
        return;
      }

      persistLastFileMeta(loaded[loaded.length - 1]!);

      if (loaded.length === 1) {
        openFileWithState(loaded[0]!);
        return;
      }

      const shouldSaveScroll = state.tabs.length > 0;
      dispatch({
        type: 'TABS_OPENED',
        tabs: loaded.map((file) => createTab(file)),
        ...(shouldSaveScroll
          ? {
              previousScrollTop: window.scrollY,
              previousTabId: state.activeTabId,
            }
          : {}),
      });

      toast.success(`${loaded.length} فایل در تب‌های جدید باز شد.`);
    },
    [openFileWithState, state.activeTabId, state.tabs.length, toast],
  );

  const reloadActiveTab = useCallback(async () => {
    if (!activeTab) {
      toast.warning('ابتدا یک فایل انتخاب کنید.');
      return;
    }

    try {
      const reloaded = await reloadMarkdownFile(activeTab.file);

      if (!reloaded) {
        toast.warning(
          'بازخوانی مستقیم برای این فایل ممکن نبود. لطفاً فایل را دوباره انتخاب کنید.',
        );
        return;
      }

      dispatch({
        type: 'TAB_FILE_RELOADED',
        tabId: activeTab.id,
        file: reloaded,
      });
      persistLastFileMeta(reloaded);
      toast.success('فایل با موفقیت دوباره بارگذاری شد.');
    } catch {
      toast.error('بازخوانی فایل با خطا مواجه شد.');
    }
  }, [activeTab, toast]);

  const updateActiveTabContent = useCallback(
    (content: string, translation?: TabTranslationState) => {
      if (!state.activeTabId) {
        return;
      }

      dispatch({
        type: 'TAB_CONTENT_UPDATED',
        tabId: state.activeTabId,
        content,
        translation,
      });

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    },
    [state.activeTabId],
  );

  return {
    tabs: state.tabs,
    activeTab,
    activeTabId: state.activeTabId,
    openFile,
    openFromDropMany,
    closeTab,
    closeActiveTab,
    activateTab,
    activateRelativeTab,
    reloadActiveTab,
    updateTabSearch,
    updateActiveTabSearch,
    updateActiveTabContent,
  };
}
