import {
  SEARCH_MARK_ACTIVE_CLASS,
  SEARCH_MARK_CLASS,
} from './search';

export function getSearchMarks(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('mark[data-search-match]'));
}

export function countSearchMarks(root: ParentNode | null | undefined): number {
  if (!root) {
    return 0;
  }

  return getSearchMarks(root).length;
}

export function nextSearchMatchIndex(
  current: number,
  count: number,
  direction: 'next' | 'previous',
): number {
  if (count === 0) {
    return -1;
  }

  if (current < 0) {
    return direction === 'next' ? 0 : count - 1;
  }

  if (direction === 'next') {
    return (current + 1) % count;
  }

  return (current - 1 + count) % count;
}

function styleSearchMark(mark: HTMLElement, isActive: boolean) {
  mark.dataset.searchActive = isActive ? 'true' : 'false';
  mark.className = isActive ? SEARCH_MARK_ACTIVE_CLASS : SEARCH_MARK_CLASS;
}

export function activateSearchMatchAt(
  root: ParentNode,
  activeIndex: number,
  options?: { scroll?: boolean },
): { index: number; count: number } | null {
  const marks = getSearchMarks(root);
  const count = marks.length;

  if (count === 0) {
    return null;
  }

  const index = Math.max(0, Math.min(activeIndex, count - 1));

  marks.forEach((mark, markIndex) => {
    styleSearchMark(mark, markIndex === index);
  });

  if (options?.scroll !== false) {
    marks[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  return { index, count };
}

export function navigateSearchMatch(
  root: ParentNode,
  currentIndex: number,
  direction: 'next' | 'previous',
): { index: number; count: number } | null {
  const marks = getSearchMarks(root);
  const count = marks.length;

  if (count === 0) {
    return null;
  }

  const index = nextSearchMatchIndex(currentIndex, count, direction);
  return activateSearchMatchAt(root, index);
}
