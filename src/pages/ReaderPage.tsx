import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { DocumentTabBar } from '../components/DocumentTabBar';
import { DocumentTabPanel } from '../components/DocumentTabPanel';
import { useToast } from '../context/ToastContext';
import { DropZone } from '../components/DropZone';
import { EmptyState } from '../components/EmptyState';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { MarkdownSettingsPanel } from '../components/MarkdownSettingsPanel';
import { TranslationPanel } from '../components/TranslationPanel';
import { TranslationLoadingOverlay } from '../components/TranslationLoadingOverlay';
import { TocSidebar } from '../components/TocSidebar';
import { STORAGE_KEYS } from '../constants/storage';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useDocumentTabs } from '../hooks/useDocumentTabs';
import { useFullscreen } from '../hooks/useFullscreen';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useMarkdownSettings } from '../hooks/useMarkdownSettings';
import { useTranslation } from '../hooks/useTranslation';
import { useTranslationSettings } from '../hooks/useTranslationSettings';
import { useTheme } from '../hooks/useTheme';
import { readPersistedLastFileMeta } from '../services/fileService';
import { getArticleId } from '../types';
import { extractToc } from '../utils/extractToc';
import { scrollToHeading } from '../utils/scrollToHeading';
import { normalizeMarkdown } from '../utils/normalizeMarkdown';
import {
  activateSearchMatchAt,
  navigateSearchMatch,
} from '../utils/searchNavigation';

const READER_ROOT_ID = 'reader-root';
const SEARCH_DEBOUNCE_MS = 300;

export function ReaderPage() {
  const [dragActive, setDragActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true',
  );
  const [persistedFileMeta] = useState(() => readPersistedLastFileMeta());
  const [markdownSettingsOpen, setMarkdownSettingsOpen] = useState(false);
  const [translationPanelOpen, setTranslationPanelOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const toast = useToast();
  const {
    tabs,
    activeTab,
    activeTabId,
    openFile,
    openFromDropMany,
    closeTab,
    closeActiveTab,
    activateTab,
    activateRelativeTab,
    reloadActiveTab,
    updateActiveTabSearch,
    updateActiveTabContent,
  } = useDocumentTabs(toast);

  const { theme, toggleTheme } = useTheme();
  const { settings: markdownSettings, updateSettings, resetSettings } =
    useMarkdownSettings();
  const {
    settings: translationSettings,
    apiKey,
    setApiKey,
    updateSettings: updateTranslationSettings,
  } = useTranslationSettings();
  const {
    isTranslating,
    translate,
    revert,
    cancelTranslation,
    canRevert,
  } = useTranslation({
    activeTab,
    settings: translationSettings,
    apiKey,
    toast,
    onContentUpdate: updateActiveTabContent,
  });
  const { isFullscreen, toggleFullscreen } = useFullscreen(READER_ROOT_ID);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeMatchIndexRef = useRef(-1);

  const searchQuery = activeTab?.search.query ?? '';
  const searchOpen = activeTab?.search.open ?? false;
  const activeMatchIndex = activeTab?.search.activeMatchIndex ?? -1;
  const totalMatches = activeTab?.search.totalMatches ?? 0;

  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);

  const contentForToc =
    activeTab?.translation?.originalContent ?? activeTab?.file.content ?? '';

  const normalizedMarkdown = useMemo(
    () => normalizeMarkdown(contentForToc),
    [contentForToc],
  );
  const toc = useMemo(() => extractToc(normalizedMarkdown), [normalizedMarkdown]);
  const { activeId: activeHeadingId, pinActiveHeading } = useActiveHeading(toc);
  const articleId = activeTabId ? getArticleId(activeTabId) : '';
  const progress = useReadingProgress(articleId);

  useEffect(() => {
    activeMatchIndexRef.current = activeMatchIndex;
  }, [activeMatchIndex, activeTabId]);

  const handleSearchScopeChange = useCallback(
    (count: number) => {
      if (!activeTabId) {
        return;
      }

      const root = document.getElementById(getArticleId(activeTabId));
      const index = count > 0 ? 0 : -1;

      activeMatchIndexRef.current = index;
      updateActiveTabSearch({
        totalMatches: count,
        activeMatchIndex: index,
      });

      if (root && index === 0) {
        activateSearchMatchAt(root, 0);
      }
    },
    [activeTabId, updateActiveTabSearch],
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.sidebarCollapsed,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const input = searchInputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }, [searchOpen, activeTabId]);

  const jumpToHeading = (id: string) => {
    pinActiveHeading(id);
    scrollToHeading(id);
  };

  const openSearch = () => {
    updateActiveTabSearch({ open: true });
  };

  const closeSearch = () => {
    updateActiveTabSearch({ open: false });
    searchInputRef.current?.blur();
  };

  const goToMatch = useCallback(
    (direction: 'next' | 'previous') => {
      if (!activeTabId) {
        return;
      }

      const root = document.getElementById(getArticleId(activeTabId));
      if (!root) {
        return;
      }

      const result = navigateSearchMatch(
        root,
        activeMatchIndexRef.current,
        direction,
      );

      if (!result) {
        return;
      }

      activeMatchIndexRef.current = result.index;
      updateActiveTabSearch({
        totalMatches: result.count,
        activeMatchIndex: result.index,
      });
    },
    [activeTabId, updateActiveTabSearch],
  );

  useKeyboardShortcuts({
    openFile: () => {
      void openFile();
    },
    openFileNewTab: () => {
      void openFile({ newTab: true });
    },
    openSearch,
    closeSearch,
    searchNext: () => goToMatch('next'),
    searchPrevious: () => goToMatch('previous'),
    reloadFile: () => {
      void reloadActiveTab();
    },
    closeTab: closeActiveTab,
    activateNextTab: () => activateRelativeTab(1),
    activatePreviousTab: () => activateRelativeTab(-1),
    toggleTheme,
    toggleSidebar: () => setSidebarCollapsed((current) => !current),
    toggleFullscreen: () => {
      void toggleFullscreen();
    },
    toggleShortcutsModal: () => setShortcutsModalOpen((current) => !current),
    closeShortcutsModal: () => setShortcutsModalOpen(false),
    isSearchOpen: searchOpen,
    isShortcutsModalOpen: shortcutsModalOpen,
    hasActiveTab: Boolean(activeTab),
  });

  return (
    <DropZone
      isActive={dragActive}
      onDragStateChange={setDragActive}
      onFilesDrop={(files) => {
        void openFromDropMany(files);
      }}
      onInvalidFileDrop={(reason) => {
        if (reason === 'legacy-doc') {
          toast.warning(
            'فرمت .doc قدیمی پشتیبانی نمی‌شود. لطفاً فایل را به .docx تبدیل کنید.',
          );
          return;
        }

        toast.warning(
          'فقط فایل‌های Markdown (.md) و Word (.docx) پشتیبانی می‌شوند.',
        );
      }}
    >
      <div
        id={READER_ROOT_ID}
        className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(61,184,155,0.16),_transparent_30%),linear-gradient(180deg,_#f5f2e8_0%,_#f8fafc_30%,_#f3f5f7_100%)] text-slate-900 transition dark:bg-[radial-gradient(circle_at_top,_rgba(61,184,155,0.2),_transparent_25%),linear-gradient(180deg,_#06121a_0%,_#0f172a_25%,_#020617_100%)] dark:text-slate-100"
      >
        <div
          className="fixed inset-x-0 top-0 z-40 h-1 bg-accent-400 transition-all"
          style={{ width: `${progress}%` }}
        />

        <AppHeader
          fileName={activeTab?.file.name ?? 'بدون فایل'}
          theme={theme}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          searchCount={totalMatches}
          activeMatchLabel={
            totalMatches > 0 ? `${activeMatchIndex + 1} از ${totalMatches}` : 'بدون نتیجه'
          }
          onOpenSearch={openSearch}
          onCloseSearch={closeSearch}
          onSearchQueryChange={(value) => updateActiveTabSearch({ query: value })}
          onOpenFile={() => {
            void openFile();
          }}
          onReloadFile={() => {
            void reloadActiveTab();
          }}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          onToggleFullscreen={() => {
            void toggleFullscreen().catch(() => {
              toast.error('فعال‌سازی حالت تمام‌صفحه ممکن نشد.');
            });
          }}
          onToggleMarkdownSettings={() =>
            setMarkdownSettingsOpen((current) => !current)
          }
          onToggleTranslationPanel={() =>
            setTranslationPanelOpen((current) => !current)
          }
          onToggleShortcutsModal={() =>
            setShortcutsModalOpen((current) => !current)
          }
          markdownSettingsOpen={markdownSettingsOpen}
          translationPanelOpen={translationPanelOpen}
          shortcutsModalOpen={shortcutsModalOpen}
          markdownSettingsPanel={
            <MarkdownSettingsPanel
              open={markdownSettingsOpen}
              settings={markdownSettings}
              onClose={() => setMarkdownSettingsOpen(false)}
              onChange={updateSettings}
              onReset={() => {
                resetSettings();
                toast.info('تنظیمات نمایش Markdown به حالت پیش‌فرض بازگشت.');
              }}
            />
          }
          translationPanel={
            <TranslationPanel
              open={translationPanelOpen}
              settings={translationSettings}
              apiKey={apiKey}
              canRevert={canRevert}
              onClose={() => setTranslationPanelOpen(false)}
              onSettingsChange={updateTranslationSettings}
              onApiKeyChange={setApiKey}
              onTranslate={() => {
                setTranslationPanelOpen(false);
                void translate();
              }}
              onRevert={revert}
            />
          }
          onSearchNext={() => goToMatch('next')}
          onSearchPrevious={() => goToMatch('previous')}
          searchInputRef={searchInputRef}
          sidebarCollapsed={sidebarCollapsed}
          isFullscreen={isFullscreen}
          tabBar={
            <DocumentTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onActivate={activateTab}
              onClose={closeTab}
              onOpenNewTab={() => {
                void openFile({ newTab: true });
              }}
            />
          }
        />

        <main className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
          {activeTab ? (
            <div className="hidden shrink-0 lg:block">
              <TocSidebar
                items={toc}
                activeId={activeHeadingId}
                collapsed={sidebarCollapsed}
                onJump={jumpToHeading}
              />
            </div>
          ) : null}

          <section className="min-w-0 flex-1">
            {tabs.length === 0 ? (
              <div className="mb-6">
                <EmptyState
                  hasPersistedFileMeta={Boolean(persistedFileMeta)}
                  lastFileName={persistedFileMeta?.name}
                  onOpenFile={() => {
                    void openFile();
                  }}
                />
              </div>
            ) : null}

            {activeTab ? (
              <DocumentTabPanel
                tab={activeTab}
                debouncedSearchQuery={debouncedSearchQuery}
                markdownSettings={markdownSettings}
                theme={theme}
                onSearchScopeChange={handleSearchScopeChange}
              />
            ) : null}
          </section>
        </main>

        <TranslationLoadingOverlay
          open={isTranslating}
          onCancel={cancelTranslation}
        />

        <KeyboardShortcutsModal
          open={shortcutsModalOpen}
          onClose={() => setShortcutsModalOpen(false)}
        />
      </div>
    </DropZone>
  );
}
