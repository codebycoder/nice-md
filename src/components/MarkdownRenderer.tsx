import { useRef } from 'react';
import type { MarkdownSettings, ThemeMode } from '../types';
import { MarkdownDocument } from './MarkdownDocument';
import { SearchMatchNavigator } from './SearchMatchNavigator';

interface MarkdownRendererProps {
  content: string;
  searchQuery: string;
  settings: MarkdownSettings;
  theme: ThemeMode;
  direction?: MarkdownSettings['direction'];
  onSearchScopeChange: (count: number) => void;
}

export function MarkdownRenderer({
  content,
  searchQuery,
  settings,
  theme,
  direction,
  onSearchScopeChange,
}: MarkdownRendererProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={shellRef}>
      <MarkdownDocument
        content={content}
        searchQuery={searchQuery}
        settings={settings}
        theme={theme}
        direction={direction}
      />
      <SearchMatchNavigator
        containerRef={shellRef}
        content={content}
        searchQuery={searchQuery}
        onSearchScopeChange={onSearchScopeChange}
      />
    </div>
  );
}
