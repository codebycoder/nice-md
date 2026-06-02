import { Children, Fragment, cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

function splitTextByQuery(text: string, query: string) {
  if (!query.trim()) {
    return [text];
  }

  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.split(pattern).filter(Boolean);
}

export function countSearchMatches(content: string, query: string): number {
  if (!query.trim()) {
    return 0;
  }

  const pattern = new RegExp(escapeRegExp(query), 'gi');
  return content.match(pattern)?.length ?? 0;
}

export function highlightNode(
  node: ReactNode,
  query: string,
  matchCursor: { current: number },
  activeIndex: number,
): ReactNode {
  if (!query.trim()) {
    return node;
  }

  if (typeof node === 'string') {
    return splitTextByQuery(node, query).map((part, index) => {
      const isMatch = part.toLowerCase() === query.toLowerCase();

      if (!isMatch) {
        return part;
      }

      const matchIndex = matchCursor.current;
      matchCursor.current += 1;
      const isActive = matchIndex === activeIndex;

      return (
        <mark
          key={`${part}-${matchIndex}-${index}`}
          data-search-match="true"
          data-search-active={isActive ? 'true' : 'false'}
          className={
            isActive
              ? 'rounded-md bg-amber-300 px-1 text-slate-900 shadow-sm'
              : 'rounded-md bg-amber-100 px-1 text-slate-900'
          }
        >
          {part}
        </mark>
      );
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={index}>
        {highlightNode(child, query, matchCursor, activeIndex)}
      </Fragment>
    ));
  }

  if (!isValidElement(node)) {
    return node;
  }

  if (node.type === 'code' || node.type === 'pre' || node.type === 'mark') {
    return node;
  }

  const element = node as ReactElement<{ children?: ReactNode }>;

  return cloneElement(element, {
    ...element.props,
    children: Children.map(element.props.children, (child) =>
      highlightNode(child, query, matchCursor, activeIndex),
    ),
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
