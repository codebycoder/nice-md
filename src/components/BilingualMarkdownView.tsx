import { Fragment, useMemo, useRef } from 'react';
import { buildMarkdownShellStyle } from '../constants/markdownSettings';
import type { BilingualBlock, MarkdownSettings, ThemeMode } from '../types';
import { MarkdownDocument } from './MarkdownDocument';
import { SearchMatchNavigator } from './SearchMatchNavigator';

interface BilingualMarkdownViewProps {
  blocks: BilingualBlock[];
  searchQuery: string;
  settings: MarkdownSettings;
  theme: ThemeMode;
  onSearchScopeChange: (count: number) => void;
}

function getTranslationDirection(settings: MarkdownSettings): 'rtl' | 'ltr' {
  return settings.direction === 'ltr' ? 'rtl' : 'rtl';
}

export function BilingualMarkdownView({
  blocks,
  searchQuery,
  settings,
  theme,
  onSearchScopeChange,
}: BilingualMarkdownViewProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const shellStyle = useMemo(
    () => buildMarkdownShellStyle(settings),
    [settings],
  );
  const translationDirection = getTranslationDirection(settings);
  const searchContent = useMemo(
    () =>
      blocks
        .map((block) =>
          block.type === 'code'
            ? block.content
            : `${block.original}\n\n${block.translation}`,
        )
        .join('\n\n'),
    [blocks],
  );

  return (
    <div ref={shellRef}>
      <div
        className={`markdown-shell markdown-shell--${settings.direction}`}
        dir={settings.direction}
        style={shellStyle}
      >
        {blocks.map((block, index) => {
          if (block.type === 'code') {
            return (
              <Fragment key={index}>
                <MarkdownDocument
                  bare
                  content={block.content}
                  searchQuery={searchQuery}
                  settings={settings}
                  theme={theme}
                />
              </Fragment>
            );
          }

          return (
            <div
              key={index}
              className={
                block.kind === 'table'
                  ? 'bilingual-pair bilingual-pair--table'
                  : 'bilingual-pair'
              }
            >
              <div
                className="bilingual-original"
                dir={settings.direction}
              >
                <MarkdownDocument
                  bare
                  content={block.original}
                  searchQuery={searchQuery}
                  settings={settings}
                  theme={theme}
                />
              </div>
              <div
                className="bilingual-translation"
                dir={translationDirection}
              >
                <MarkdownDocument
                  bare
                  content={block.translation}
                  searchQuery={searchQuery}
                  settings={settings}
                  theme={theme}
                />
              </div>
            </div>
          );
        })}
      </div>
      <SearchMatchNavigator
        containerRef={shellRef}
        content={searchContent}
        searchQuery={searchQuery}
        onSearchScopeChange={onSearchScopeChange}
      />
    </div>
  );
}
