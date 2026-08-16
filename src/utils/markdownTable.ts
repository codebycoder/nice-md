export function isTableDelimiterRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('-')) {
    return false;
  }

  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(trimmed);
}

export function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) {
    return false;
  }

  if (isTableDelimiterRow(trimmed)) {
    return true;
  }

  if (trimmed.startsWith('|')) {
    return true;
  }

  return (trimmed.match(/\|/g) ?? []).length >= 2;
}

export function isMarkdownTable(lines: string[]): boolean {
  if (lines.length < 2) {
    return false;
  }

  if (!lines.every(isTableRow)) {
    return false;
  }

  return lines.some(isTableDelimiterRow);
}

export type MarkdownTextBlock =
  | { kind: 'text'; content: string }
  | { kind: 'table'; content: string };

export function splitIntoMarkdownBlocks(text: string): MarkdownTextBlock[] {
  const lines = text.split('\n');
  const blocks: MarkdownTextBlock[] = [];
  let textLines: string[] = [];
  let tableLines: string[] = [];

  const flushText = () => {
    if (textLines.length === 0) {
      return;
    }

    blocks.push({ kind: 'text', content: textLines.join('\n') });
    textLines = [];
  };

  const flushTable = () => {
    if (tableLines.length === 0) {
      return;
    }

    if (isMarkdownTable(tableLines)) {
      blocks.push({ kind: 'table', content: tableLines.join('\n') });
    } else {
      textLines.push(...tableLines);
    }

    tableLines = [];
  };

  for (const line of lines) {
    if (isTableRow(line)) {
      flushText();
      tableLines.push(line);
      continue;
    }

    if (tableLines.length > 0) {
      flushTable();
    }

    textLines.push(line);
  }

  flushTable();
  flushText();

  return blocks;
}
