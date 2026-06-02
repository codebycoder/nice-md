import { useEffect, useMemo, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { createHeadingIdFactory } from '../utils/extractToc';
import { highlightNode } from '../utils/search';

interface MarkdownRendererProps {
  content: string;
  searchQuery: string;
  activeMatchIndex: number;
}

function flattenText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join('');
  }

  if (node && typeof node === 'object' && 'props' in node) {
    return flattenText((node as { props: { children?: ReactNode } }).props.children);
  }

  return '';
}

function CodeBlock({
  inline,
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const content = String(children).replace(/\n$/, '');

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  if (inline) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  return (
    <div className="code-block group">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(content);
          setCopied(true);
        }}
        className="copy-button"
      >
        {copied ? 'کپی شد' : 'کپی'}
      </button>
      <pre>
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({
  content,
  searchQuery,
  activeMatchIndex,
}: MarkdownRendererProps) {
  const headingIdFor = useMemo(() => createHeadingIdFactory(), [content]);
  const matchCursor = { current: 0 };
  const renderHighlighted = (children: ReactNode) =>
    highlightNode(children, searchQuery, matchCursor, activeMatchIndex);

  useEffect(() => {
    if (!searchQuery.trim() || activeMatchIndex < 0) {
      return;
    }

    const activeMark = document.querySelector(
      'mark[data-search-active="true"]',
    ) as HTMLElement | null;

    activeMark?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [searchQuery, activeMatchIndex, content]);

  return (
    <div className="markdown-shell">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => {
            const text = flattenText(children);
            const id = headingIdFor(text);
            return <h1 id={id}>{renderHighlighted(children)}</h1>;
          },
          h2: ({ children }) => {
            const text = flattenText(children);
            const id = headingIdFor(text);
            return <h2 id={id}>{renderHighlighted(children)}</h2>;
          },
          h3: ({ children }) => {
            const text = flattenText(children);
            const id = headingIdFor(text);
            return <h3 id={id}>{renderHighlighted(children)}</h3>;
          },
          h4: ({ children }) => {
            const text = flattenText(children);
            const id = headingIdFor(text);
            return <h4 id={id}>{renderHighlighted(children)}</h4>;
          },
          h5: ({ children }) => {
            const text = flattenText(children);
            const id = headingIdFor(text);
            return <h5 id={id}>{renderHighlighted(children)}</h5>;
          },
          h6: ({ children }) => {
            const text = flattenText(children);
            const id = headingIdFor(text);
            return <h6 id={id}>{renderHighlighted(children)}</h6>;
          },
          p: ({ children }) => <p>{renderHighlighted(children)}</p>,
          li: ({ children }) => <li>{renderHighlighted(children)}</li>,
          blockquote: ({ children }) => (
            <blockquote>{renderHighlighted(children)}</blockquote>
          ),
          th: ({ children }) => <th>{renderHighlighted(children)}</th>,
          td: ({ children }) => <td>{renderHighlighted(children)}</td>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {renderHighlighted(children)}
            </a>
          ),
          pre: ({ children }) => <>{children}</>,
          code: CodeBlock,
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
