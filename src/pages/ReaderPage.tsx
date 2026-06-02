import { useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { DropZone } from '../components/DropZone';
import { EmptyState } from '../components/EmptyState';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { TocSidebar } from '../components/TocSidebar';
import { SAMPLE_MARKDOWN } from '../constants/sampleMarkdown';
import { STORAGE_KEYS } from '../constants/storage';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { useFullscreen } from '../hooks/useFullscreen';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useTheme } from '../hooks/useTheme';
import {
  openMarkdownFile,
  persistLastFileMeta,
  readDroppedMarkdownFile,
  readPersistedLastFileMeta,
  reloadMarkdownFile,
} from '../services/fileService';
import type { LoadedFileState } from '../types';
import { extractToc } from '../utils/extractToc';
import { normalizeMarkdown } from '../utils/normalizeMarkdown';
import { countSearchMatches } from '../utils/search';

const READER_ROOT_ID = 'reader-root';
const ARTICLE_ID = 'reader-article';

export function ReaderPage() {
  const [loadedFile, setLoadedFile] = useState<LoadedFileState>({
    name: 'نمونه داخلی',
    content: SAMPLE_MARKDOWN,
    lastModified: Date.now(),
    size: SAMPLE_MARKDOWN.length,
    source: 'sample',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);
  const [dragActive, setDragActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true',
  );
  const [persistedFileMeta, setPersistedFileMeta] = useState(() =>
    readPersistedLastFileMeta(),
  );
  const [reloadMessage, setReloadMessage] = useState<string>('');

  const { theme, toggleTheme } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen(READER_ROOT_ID);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedMarkdown = useMemo(
    () => normalizeMarkdown(loadedFile.content),
    [loadedFile.content],
  );
  const toc = useMemo(() => extractToc(normalizedMarkdown), [normalizedMarkdown]);
  const activeHeadingId = useActiveHeading(toc);
  const progress = useReadingProgress(ARTICLE_ID);
  const totalMatches = useMemo(
    () => countSearchMatches(normalizedMarkdown, searchQuery),
    [normalizedMarkdown, searchQuery],
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.sidebarCollapsed,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    setActiveMatchIndex(totalMatches > 0 ? 0 : -1);
  }, [loadedFile.content, totalMatches]);

  useEffect(() => {
    setPersistedFileMeta(readPersistedLastFileMeta());
  }, [loadedFile]);

  const openFile = async () => {
    const file = await openMarkdownFile();

    if (!file) {
      return;
    }

    setLoadedFile(file);
    persistLastFileMeta(file);
    setReloadMessage('');
  };

  const reloadFile = async () => {
    const reloaded = await reloadMarkdownFile(loadedFile);

    if (!reloaded) {
      setReloadMessage(
        'بازخوانی مستقیم برای این فایل ممکن نبود. لطفا فایل را دوباره انتخاب کنید.',
      );
      return;
    }

    setLoadedFile(reloaded);
    persistLastFileMeta(reloaded);
    setReloadMessage('فایل با موفقیت دوباره بارگذاری شد.');
  };

  const onDropFile = async (file: File) => {
    const dropped = await readDroppedMarkdownFile(file);
    setLoadedFile(dropped);
    persistLastFileMeta(dropped);
    setReloadMessage('');
  };

  const jumpToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const goToMatch = (direction: 'next' | 'previous') => {
    if (totalMatches === 0) {
      setActiveMatchIndex(-1);
      return;
    }

    setActiveMatchIndex((current) => {
      if (current < 0) {
        return 0;
      }

      if (direction === 'next') {
        return (current + 1) % totalMatches;
      }

      return (current - 1 + totalMatches) % totalMatches;
    });
  };

  useKeyboardShortcuts({
    openFile,
    focusSearch: () => searchInputRef.current?.focus(),
    reloadFile: () => {
      void reloadFile();
    },
    toggleTheme,
    toggleSidebar: () => setSidebarCollapsed((current) => !current),
    toggleFullscreen: () => {
      void toggleFullscreen();
    },
  });

  return (
    <DropZone
      isActive={dragActive}
      onDragStateChange={setDragActive}
      onFileDrop={(file) => {
        void onDropFile(file);
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
          fileName={loadedFile.name}
          theme={theme}
          searchQuery={searchQuery}
          searchCount={totalMatches}
          activeMatchLabel={
            totalMatches > 0 ? `${activeMatchIndex + 1} از ${totalMatches}` : 'بدون نتیجه'
          }
          onSearchQueryChange={setSearchQuery}
          onOpenFile={() => {
            void openFile();
          }}
          onReloadFile={() => {
            void reloadFile();
          }}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          onToggleFullscreen={() => {
            void toggleFullscreen();
          }}
          onSearchNext={() => goToMatch('next')}
          onSearchPrevious={() => goToMatch('previous')}
          searchInputRef={searchInputRef}
          sidebarCollapsed={sidebarCollapsed}
          isFullscreen={isFullscreen}
        />

        <main className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
          <div className="hidden shrink-0 lg:block">
            <TocSidebar
              items={toc}
              activeId={activeHeadingId}
              collapsed={sidebarCollapsed}
              onJump={jumpToHeading}
              reminder={reloadMessage || undefined}
            />
          </div>

          <section className="min-w-0 flex-1">
            {loadedFile.source === 'sample' ? (
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

            {reloadMessage ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                {reloadMessage}
              </div>
            ) : null}

            <article
              id={ARTICLE_ID}
              className="rounded-[2rem] border border-black/5 bg-white/80 px-4 py-8 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:px-8 lg:px-14"
            >
              <MarkdownRenderer
                content={normalizedMarkdown}
                searchQuery={searchQuery}
                activeMatchIndex={activeMatchIndex}
              />
            </article>
          </section>
        </main>
      </div>
    </DropZone>
  );
}
