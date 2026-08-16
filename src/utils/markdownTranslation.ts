import type { BilingualBlock, TranslationDisplayMode } from '../types';
import { splitIntoMarkdownBlocks } from './markdownTable';

export type MarkdownSegment =
  | { type: 'code'; content: string }
  | { type: 'table'; content: string; index: number }
  | { type: 'paragraph'; content: string; index: number };

const FENCED_CODE_REGEX = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;
const CODE_PLACEHOLDER_REGEX = /<<<NICE_MD_CODE_(\d+)>>>/g;

export function protectCodeBlocks(markdown: string): {
  protectedText: string;
  codeBlocks: string[];
} {
  const codeBlocks: string[] = [];
  const protectedText = markdown.replace(FENCED_CODE_REGEX, (match) => {
    const id = codeBlocks.length;
    codeBlocks.push(match);
    return `<<<NICE_MD_CODE_${id}>>>`;
  });

  return { protectedText, codeBlocks };
}

export function restoreCodeBlocks(text: string, codeBlocks: string[]): string {
  return text.replace(CODE_PLACEHOLDER_REGEX, (_, id) => {
    return codeBlocks[Number(id)] ?? '';
  });
}

export function splitMarkdownSegments(markdown: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;
  let paragraphIndex = 0;

  for (const match of markdown.matchAll(FENCED_CODE_REGEX)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      const textBlock = markdown.slice(lastIndex, matchIndex);
      segments.push(...splitTextBlock(textBlock, () => paragraphIndex++));
    }

    segments.push({ type: 'code', content: match[0] });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < markdown.length) {
    const textBlock = markdown.slice(lastIndex);
    segments.push(...splitTextBlock(textBlock, () => paragraphIndex++));
  }

  return segments;
}

function splitTextBlock(
  text: string,
  nextIndex: () => number,
): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];

  for (const block of splitIntoMarkdownBlocks(text)) {
    if (block.kind === 'table') {
      segments.push({
        type: 'table',
        content: block.content,
        index: nextIndex(),
      });
      continue;
    }

    const paragraphs = block.content.split(/\n{2,}/);

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        segments.push({ type: 'paragraph', content: paragraph, index: -1 });
        continue;
      }

      segments.push({
        type: 'paragraph',
        content: paragraph,
        index: nextIndex(),
      });
    }
  }

  return segments;
}

function isTranslatableSegment(
  segment: MarkdownSegment,
): segment is Extract<MarkdownSegment, { index: number }> {
  return (
    (segment.type === 'paragraph' || segment.type === 'table') &&
    segment.index >= 0
  );
}

export function hasTranslatableContent(markdown: string): boolean {
  const { protectedText } = protectCodeBlocks(markdown);
  return protectedText.trim().length > 0;
}

export function mapParagraphTranslations(
  originalSegments: MarkdownSegment[],
  translatedSegments: MarkdownSegment[],
): Map<number, string> {
  const originalItems = originalSegments.filter(isTranslatableSegment);
  const translatedItems = translatedSegments.filter(isTranslatableSegment);

  const translations = new Map<number, string>();

  for (let i = 0; i < originalItems.length; i++) {
    const original = originalItems[i];
    const translated = translatedItems[i];

    if (original && translated) {
      translations.set(original.index, translated.content);
    }
  }

  return translations;
}

export function buildBilingualBlocks(
  sourceContent: string,
  translatedFull: string,
): BilingualBlock[] {
  const originalSegments = splitMarkdownSegments(sourceContent);
  const translatedSegments = splitMarkdownSegments(translatedFull);
  const translations = mapParagraphTranslations(
    originalSegments,
    translatedSegments,
  );

  const blocks: BilingualBlock[] = [];

  for (const segment of originalSegments) {
    if (segment.type === 'code') {
      blocks.push({ type: 'code', content: segment.content });
      continue;
    }

    if (segment.index < 0) {
      continue;
    }

    const translation = translations.get(segment.index);
    if (!translation) {
      continue;
    }

    blocks.push({
      type: 'pair',
      original: segment.content,
      translation,
      kind: segment.type === 'table' ? 'table' : 'text',
    });
  }

  return blocks;
}

export function bilingualBlocksToSearchContent(blocks: BilingualBlock[]): string {
  return blocks
    .map((block) =>
      block.type === 'code'
        ? block.content
        : `${block.original}\n\n${block.translation}`,
    )
    .join('\n\n');
}

export interface TranslationBuildResult {
  content: string;
  bilingualBlocks?: BilingualBlock[];
}

export function buildContextualTranslationResult(
  sourceContent: string,
  translatedProtected: string,
  codeBlocks: string[],
  displayMode: TranslationDisplayMode,
): TranslationBuildResult {
  const translatedFull = restoreCodeBlocks(translatedProtected, codeBlocks);

  if (displayMode === 'replace') {
    return { content: translatedFull };
  }

  const bilingualBlocks = buildBilingualBlocks(sourceContent, translatedFull);

  return {
    content: bilingualBlocksToSearchContent(bilingualBlocks),
    bilingualBlocks,
  };
}
