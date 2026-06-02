import { Plus, X } from 'lucide-react';
import type { DocumentTab } from '../types';

interface DocumentTabBarProps {
  tabs: DocumentTab[];
  activeTabId: string | null;
  onActivate: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onOpenNewTab: () => void;
}

export function DocumentTabBar({
  tabs,
  activeTabId,
  onActivate,
  onClose,
  onOpenNewTab,
}: DocumentTabBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label="تب‌های سند"
      className="flex items-center gap-1 overflow-x-auto pb-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onActivate(tab.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivate(tab.id);
              }
            }}
            title={tab.file.name}
            className={`group flex max-w-[14rem] shrink-0 cursor-pointer items-center gap-1 rounded-xl border px-3 py-1.5 text-sm transition ${
              isActive
                ? 'border-accent-300 bg-accent-50 text-accent-700 dark:border-accent-500/40 dark:bg-accent-500/10 dark:text-accent-300'
                : 'border-black/5 bg-white/60 text-slate-600 hover:border-accent-200 hover:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-accent-500/30'
            }`}
          >
            <span className="truncate">{tab.file.name}</span>
            <button
              type="button"
              aria-label={`بستن ${tab.file.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onClose(tab.id);
              }}
              className="rounded-md p-0.5 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        aria-label="تب جدید"
        onClick={onOpenNewTab}
        className="flex shrink-0 items-center justify-center rounded-xl border border-dashed border-black/10 p-1.5 text-slate-500 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-slate-400 dark:hover:border-accent-500/40 dark:hover:text-accent-300"
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
