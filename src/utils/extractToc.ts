import type { TocItem } from '../types';

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let isInsideFence = false;

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      isInsideFence = !isInsideFence;
      continue;
    }

    if (isInsideFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());

    if (!match) {
      continue;
    }

    const [, hashes, rawText] = match;
    const text = rawText.replace(/[`*_~[\]]/g, '').trim();
    const baseId = slugify(text);
    const index = seen.get(baseId) ?? 0;
    seen.set(baseId, index + 1);
    const id = index === 0 ? baseId : `${baseId}-${index + 1}`;

    items.push({
      id,
      level: hashes.length,
      text,
    });
  }

  return items;
}

export function createHeadingIdFactory() {
  const seen = new Map<string, number>();

  return (text: string) => {
    const baseId = slugify(text);
    const index = seen.get(baseId) ?? 0;
    seen.set(baseId, index + 1);
    return index === 0 ? baseId : `${baseId}-${index + 1}`;
  };
}
