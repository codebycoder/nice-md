import type { LucideIcon } from 'lucide-react';
import {
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Keyboard,
  Languages,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings2,
  Sun,
  Moon,
} from 'lucide-react';
import type { RefObject, ReactNode } from 'react';

interface AppHeaderProps {
  fileName: string;
  theme: 'light' | 'dark';
  searchOpen: boolean;
  searchQuery: string;
  searchCount: number;
  activeMatchLabel: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenFile: () => void;
  onReloadFile: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onToggleMarkdownSettings: () => void;
  onToggleTranslationPanel: () => void;
  onToggleShortcutsModal: () => void;
  markdownSettingsOpen: boolean;
  translationPanelOpen: boolean;
  shortcutsModalOpen: boolean;
  markdownSettingsPanel: ReactNode;
  translationPanel: ReactNode;
  onSearchNext: () => void;
  onSearchPrevious: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  sidebarCollapsed: boolean;
  isFullscreen: boolean;
  tabBar?: ReactNode;
}

function IconButton({
  label,
  onClick,
  icon: Icon,
  pressed,
}: {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="group relative rounded-2xl border border-white/50 bg-white/80 p-2.5 text-slate-700 transition hover:border-accent-300 hover:text-accent-600 aria-pressed:border-accent-300 aria-pressed:bg-accent-50 aria-pressed:text-accent-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:aria-pressed:border-accent-500/40 dark:aria-pressed:bg-accent-500/10 dark:aria-pressed:text-accent-300"
    >
      <Icon className="size-[1.125rem]" strokeWidth={2} aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute inset-x-0 top-full z-50 mt-2 flex justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {label}
        </span>
      </span>
    </button>
  );
}

export function AppHeader(props: AppHeaderProps) {
  const {
    fileName,
    theme,
    searchOpen,
    searchQuery,
    searchCount,
    activeMatchLabel,
    onOpenSearch,
    onCloseSearch,
    onSearchQueryChange,
    onOpenFile,
    onReloadFile,
    onToggleTheme,
    onToggleSidebar,
    onToggleFullscreen,
    onToggleMarkdownSettings,
    onToggleTranslationPanel,
    onToggleShortcutsModal,
    markdownSettingsOpen,
    translationPanelOpen,
    shortcutsModalOpen,
    markdownSettingsPanel,
    translationPanel,
    onSearchNext,
    onSearchPrevious,
    searchInputRef,
    sidebarCollapsed,
    isFullscreen,
    tabBar,
  } = props;

  return (
    <header className="sticky top-0 z-30 overflow-visible border-b border-black/5 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 overflow-visible px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-3xl bg-accent-500 px-4 py-2 text-sm font-bold text-white shadow-panel">
              Nice MD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {fileName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persian-first Markdown Reader
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-visible">
            <IconButton label="باز کردن" icon={FolderOpen} onClick={onOpenFile} />
            <IconButton label="بارگذاری دوباره" icon={RefreshCw} onClick={onReloadFile} />
            <div className="relative">
              <IconButton
                label={translationPanelOpen ? 'بستن ترجمه' : 'ترجمه'}
                icon={Languages}
                onClick={onToggleTranslationPanel}
                pressed={translationPanelOpen}
              />
              {translationPanel}
            </div>
            <div className="relative">
              <IconButton
                label={markdownSettingsOpen ? 'بستن تنظیمات' : 'تنظیمات متن'}
                icon={Settings2}
                onClick={onToggleMarkdownSettings}
                pressed={markdownSettingsOpen}
              />
              {markdownSettingsPanel}
            </div>
            <IconButton
              label={sidebarCollapsed ? 'نمایش فهرست' : 'پنهان کردن فهرست'}
              icon={sidebarCollapsed ? PanelLeftOpen : PanelLeftClose}
              onClick={onToggleSidebar}
            />
            <IconButton
              label={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
              icon={theme === 'dark' ? Sun : Moon}
              onClick={onToggleTheme}
            />
            <IconButton
              label={isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه'}
              icon={isFullscreen ? Minimize : Maximize}
              onClick={onToggleFullscreen}
            />
            <IconButton
              label="جستجو (Ctrl/Cmd + F)"
              icon={Search}
              onClick={onOpenSearch}
              pressed={searchOpen}
            />
            <IconButton
              label="میانبرها (?)"
              icon={Keyboard}
              onClick={onToggleShortcutsModal}
              pressed={shortcutsModalOpen}
            />
          </div>
        </div>

        {tabBar ? <div className="min-w-0">{tabBar}</div> : null}

        {searchOpen ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-3xl border border-black/5 bg-stone-100/90 px-3 py-2 dark:border-white/10 dark:bg-slate-900">
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    onCloseSearch();
                  }
                }}
                placeholder="جستجو در متن... (Esc برای بستن)"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                aria-label="جستجو در متن"
              />
              <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                {searchCount === 0 ? 'بدون نتیجه' : activeMatchLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-auto">
              <IconButton label="نتیجه قبلی" icon={ChevronUp} onClick={onSearchPrevious} />
              <IconButton label="نتیجه بعدی" icon={ChevronDown} onClick={onSearchNext} />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
