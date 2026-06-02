import { memo, useEffect, useMemo, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { buildMarkdownShellStyle } from '../constants/markdownSettings';
import type { MarkdownSettings } from '../types';
import { createHeadingIdFactory } from '../utils/extractToc';
import { highlightNode } from '../utils/search';

interface MarkdownDocumentProps {
  content: string;
  searchQuery: string;
  settings: MarkdownSettings;
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

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
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
        aria-label={copied ? 'Copied' : 'Copy code'}
        title={copied ? 'Copied' : 'Copy'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <pre>
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export const MarkdownDocument = memo(function MarkdownDocument({
  content,
  searchQuery,
  settings,
}: MarkdownDocumentProps) {
  const headingIdFor = useMemo(() => createHeadingIdFactory(), [content]);
  const matchCursor = { current: 0 };
  const renderHighlighted = (children: ReactNode) =>
    highlightNode(children, searchQuery, matchCursor);

  const shellStyle = useMemo(
    (): CSSProperties => buildMarkdownShellStyle(settings),
    [settings],
  );

  return (
    <div
      className={`markdown-shell markdown-shell--${settings.direction}`}
      dir={settings.direction}
      style={shellStyle}
    >
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
});
