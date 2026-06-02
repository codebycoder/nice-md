import { useMemo } from 'react';
import type { DocumentTab, MarkdownSettings } from '../types';
import { getArticleId } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { normalizeMarkdown } from '../utils/normalizeMarkdown';

interface DocumentTabPanelProps {
  tab: DocumentTab;
  debouncedSearchQuery: string;
  markdownSettings: MarkdownSettings;
  onSearchScopeChange: (count: number) => void;
}

export function DocumentTabPanel({
  tab,
  debouncedSearchQuery,
  markdownSettings,
  onSearchScopeChange,
}: DocumentTabPanelProps) {
  const normalizedMarkdown = useMemo(
    () => normalizeMarkdown(tab.file.content),
    [tab.file.content],
  );

  return (
    <article
      id={getArticleId(tab.id)}
      role="tabpanel"
      aria-label={tab.file.name}
      className="rounded-[2rem] border border-black/5 bg-white/80 px-4 py-8 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:px-8 lg:px-14"
    >
      <MarkdownRenderer
        content={normalizedMarkdown}
        searchQuery={debouncedSearchQuery}
        settings={markdownSettings}
        onSearchScopeChange={onSearchScopeChange}
      />
    </article>
  );
}
