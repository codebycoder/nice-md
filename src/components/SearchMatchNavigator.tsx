import { useLayoutEffect, useRef, type RefObject } from 'react';
import { countSearchMarks } from '../utils/searchNavigation';

interface SearchMatchNavigatorProps {
  containerRef: RefObject<HTMLElement | null>;
  content: string;
  searchQuery: string;
  onSearchScopeChange: (count: number) => void;
}

export function SearchMatchNavigator({
  containerRef,
  content,
  searchQuery,
  onSearchScopeChange,
}: SearchMatchNavigatorProps) {
  const scopeRef = useRef({ content: '', searchQuery: '' });

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) {
      return;
    }

    const scopeChanged =
      scopeRef.current.content !== content ||
      scopeRef.current.searchQuery !== searchQuery;

    if (!scopeChanged) {
      return;
    }

    scopeRef.current = { content, searchQuery };
    onSearchScopeChange(countSearchMarks(root));
  }, [containerRef, content, searchQuery, onSearchScopeChange]);

  return null;
}
