import { useRef } from 'react';
import type { MarkdownSettings } from '../types';
import { MarkdownDocument } from './MarkdownDocument';
import { SearchMatchNavigator } from './SearchMatchNavigator';

interface MarkdownRendererProps {
  content: string;
  searchQuery: string;
  settings: MarkdownSettings;
  onSearchScopeChange: (count: number) => void;
}

export function MarkdownRenderer({
  content,
  searchQuery,
  settings,
  onSearchScopeChange,
}: MarkdownRendererProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={shellRef}>
      <MarkdownDocument
        content={content}
        searchQuery={searchQuery}
        settings={settings}
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
