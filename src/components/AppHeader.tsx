import type { RefObject } from 'react';

interface AppHeaderProps {
  fileName: string;
  theme: 'light' | 'dark';
  searchQuery: string;
  searchCount: number;
  activeMatchLabel: string;
  onSearchQueryChange: (value: string) => void;
  onOpenFile: () => void;
  onReloadFile: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onSearchNext: () => void;
  onSearchPrevious: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  sidebarCollapsed: boolean;
  isFullscreen: boolean;
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/50 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
    >
      {label}
    </button>
  );
}

export function AppHeader(props: AppHeaderProps) {
  const {
    fileName,
    theme,
    searchQuery,
    searchCount,
    activeMatchLabel,
    onSearchQueryChange,
    onOpenFile,
    onReloadFile,
    onToggleTheme,
    onToggleSidebar,
    onToggleFullscreen,
    onSearchNext,
    onSearchPrevious,
    searchInputRef,
    sidebarCollapsed,
    isFullscreen,
  } = props;

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6">
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

          <div className="flex flex-wrap items-center gap-2">
            <ActionButton label="باز کردن" onClick={onOpenFile} />
            <ActionButton label="بارگذاری دوباره" onClick={onReloadFile} />
            <ActionButton
              label={sidebarCollapsed ? 'نمایش فهرست' : 'پنهان کردن فهرست'}
              onClick={onToggleSidebar}
            />
            <ActionButton
              label={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
              onClick={onToggleTheme}
            />
            <ActionButton
              label={isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه'}
              onClick={onToggleFullscreen}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-3xl border border-black/5 bg-stone-100/90 px-3 py-2 dark:border-white/10 dark:bg-slate-900">
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="جستجو در متن... (Ctrl/Cmd + F)"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
            <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
              {searchCount === 0 ? 'بدون نتیجه' : activeMatchLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <ActionButton label="قبلی" onClick={onSearchPrevious} />
            <ActionButton label="بعدی" onClick={onSearchNext} />
          </div>
        </div>
      </div>
    </header>
  );
}
