import { useMemo } from 'react';
import type { DocumentTab, MarkdownSettings, ThemeMode } from '../types';
import { getArticleId } from '../types';
import { BilingualMarkdownView } from './BilingualMarkdownView';
import { MarkdownRenderer } from './MarkdownRenderer';
import { normalizeMarkdown } from '../utils/normalizeMarkdown';

interface DocumentTabPanelProps {
  tab: DocumentTab;
  debouncedSearchQuery: string;
  markdownSettings: MarkdownSettings;
  theme: ThemeMode;
  onSearchScopeChange: (count: number) => void;
}

function getTranslatedContentDirection(
  tab: DocumentTab,
  settings: MarkdownSettings,
): MarkdownSettings['direction'] | undefined {
  if (tab.translation?.mode !== 'replace') {
    return undefined;
  }

  return settings.direction === 'ltr' ? 'rtl' : settings.direction;
}

export function DocumentTabPanel({
  tab,
  debouncedSearchQuery,
  markdownSettings,
  theme,
  onSearchScopeChange,
}: DocumentTabPanelProps) {
  const isBilingualView =
    tab.translation?.mode === 'bilingual' &&
    Boolean(tab.translation.bilingualBlocks?.length);

  const normalizedMarkdown = useMemo(
    () => normalizeMarkdown(tab.file.content),
    [tab.file.content],
  );
  const contentDirection = getTranslatedContentDirection(tab, markdownSettings);

  return (
    <article
      id={getArticleId(tab.id)}
      role="tabpanel"
      aria-label={tab.file.name}
      className="rounded-[2rem] border border-black/5 bg-white/80 px-4 py-8 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:px-8 lg:px-14"
    >
      {isBilingualView && tab.translation?.bilingualBlocks ? (
        <BilingualMarkdownView
          blocks={tab.translation.bilingualBlocks}
          searchQuery={debouncedSearchQuery}
          settings={markdownSettings}
          theme={theme}
          onSearchScopeChange={onSearchScopeChange}
        />
      ) : (
        <MarkdownRenderer
          content={normalizedMarkdown}
          searchQuery={debouncedSearchQuery}
          settings={markdownSettings}
          theme={theme}
          direction={contentDirection}
          onSearchScopeChange={onSearchScopeChange}
        />
      )}
    </article>
  );
}
