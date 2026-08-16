import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { buildMarkdownShellStyle } from '../constants/markdownSettings';
import type { MarkdownSettings, ThemeMode } from '../types';
import { getFencedCodeBlock } from '../utils/codeBlockInfo';
import { rehypeHeadingIds } from '../utils/rehypeHeadingIds';
import { scrollToHeading } from '../utils/scrollToHeading';
import { highlightNode } from '../utils/search';
import { ChartBlock } from './ChartBlock';
import { MermaidBlock } from './MermaidBlock';

interface MarkdownDocumentProps {
  content: string;
  searchQuery: string;
  settings: MarkdownSettings;
  theme: ThemeMode;
  bare?: boolean;
  direction?: MarkdownSettings['direction'];
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

function CodePreBlock({ children }: ComponentPropsWithoutRef<'pre'>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <div className="code-block group">
      <button
        type="button"
        onClick={() => {
          const text = preRef.current?.textContent ?? '';
          void navigator.clipboard.writeText(text.replace(/\n$/, ''));
          setCopied(true);
        }}
        className="copy-button"
        aria-label={copied ? 'Copied' : 'Copy code'}
        title={copied ? 'Copied' : 'Copy'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}

function PreBlock({
  children,
  theme,
}: ComponentPropsWithoutRef<'pre'> & { theme: ThemeMode }) {
  const fencedBlock = getFencedCodeBlock(children);

  if (fencedBlock?.language === 'mermaid') {
    return <MermaidBlock code={fencedBlock.code} theme={theme} />;
  }

  if (fencedBlock?.language === 'chart') {
    return <ChartBlock code={fencedBlock.code} theme={theme} />;
  }

  return <CodePreBlock>{children}</CodePreBlock>;
}

export const MarkdownDocument = memo(function MarkdownDocument({
  content,
  searchQuery,
  settings,
  theme,
  bare = false,
  direction,
}: MarkdownDocumentProps) {
  const rehypePlugins = useMemo(
    () => [rehypeSanitize, rehypeHeadingIds(content)],
    [content],
  );
  const matchCursor = { current: 0 };
  const renderHighlighted = (children: ReactNode) =>
    highlightNode(children, searchQuery, matchCursor);

  const shellStyle = useMemo(
    (): CSSProperties => buildMarkdownShellStyle(settings),
    [settings],
  );
  const resolvedDirection = direction ?? settings.direction;

  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={rehypePlugins}
      components={{
        h1: ({ children, id }) => (
          <h1 id={typeof id === 'string' ? id : undefined}>{renderHighlighted(children)}</h1>
        ),
        h2: ({ children, id }) => (
          <h2 id={typeof id === 'string' ? id : undefined}>{renderHighlighted(children)}</h2>
        ),
        h3: ({ children, id }) => (
          <h3 id={typeof id === 'string' ? id : undefined}>{renderHighlighted(children)}</h3>
        ),
        h4: ({ children, id }) => (
          <h4 id={typeof id === 'string' ? id : undefined}>{renderHighlighted(children)}</h4>
        ),
        h5: ({ children, id }) => (
          <h5 id={typeof id === 'string' ? id : undefined}>{renderHighlighted(children)}</h5>
        ),
        h6: ({ children, id }) => (
          <h6 id={typeof id === 'string' ? id : undefined}>{renderHighlighted(children)}</h6>
        ),
        p: ({ children }) => <p>{renderHighlighted(children)}</p>,
        li: ({ children }) => <li>{renderHighlighted(children)}</li>,
        blockquote: ({ children }) => (
          <blockquote>{renderHighlighted(children)}</blockquote>
        ),
        th: ({ children }) => <th>{renderHighlighted(children)}</th>,
        td: ({ children }) => <td>{renderHighlighted(children)}</td>,
        a: ({ children, href }) => {
          if (href?.startsWith('#')) {
            const id = href.slice(1);
            return (
              <a
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToHeading(id);
                }}
              >
                {renderHighlighted(children)}
              </a>
            );
          }

          return (
            <a href={href} target="_blank" rel="noreferrer">
              {renderHighlighted(children)}
            </a>
          );
        },
        pre: ({ children }) => <PreBlock theme={theme}>{children}</PreBlock>,
        code: ({ className, children, ...rest }) => (
          <code className={className} {...rest}>{children}</code>
        ),
        table: ({ children }) => (
          <div className="table-wrap">
            <table>{children}</table>
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  if (bare) {
    return markdown;
  }

  return (
    <div
      className={`markdown-shell markdown-shell--${resolvedDirection}`}
      dir={resolvedDirection}
      style={shellStyle}
    >
      {markdown}
    </div>
  );
});
