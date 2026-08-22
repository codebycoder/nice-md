import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});
turndownService.use(gfm);

function prepareDocxHtmlForTurndown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc.querySelectorAll('td > p, th > p').forEach((paragraph) => {
    const cell = paragraph.parentElement;
    if (!cell) {
      return;
    }

    cell.textContent = paragraph.textContent ?? '';
  });

  doc.querySelectorAll('table').forEach((table) => {
    if (table.querySelector('thead, th')) {
      return;
    }

    const firstRow = table.querySelector('tr');
    if (!firstRow) {
      return;
    }

    firstRow.querySelectorAll('td').forEach((cell) => {
      const headerCell = doc.createElement('th');
      headerCell.textContent = cell.textContent ?? '';
      cell.replaceWith(headerCell);
    });
  });

  return doc.body.innerHTML;
}

export function isDocxFile(name: string): boolean {
  return /\.docx$/i.test(name);
}

export function isMarkdownFile(name: string): boolean {
  return /\.(md|markdown)$/i.test(name);
}

export function isLegacyDocFile(name: string): boolean {
  return /\.doc$/i.test(name) && !/\.docx$/i.test(name);
}

export function isSupportedDocumentFile(name: string): boolean {
  return isMarkdownFile(name) || isDocxFile(name);
}

export async function convertDocxToMarkdown(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

  if (result.messages.length > 0) {
    console.warn('docx conversion warnings:', result.messages);
  }

  const markdown = turndownService
    .turndown(prepareDocxHtmlForTurndown(result.value))
    .trim();
  return markdown.length > 0 ? `${markdown}\n` : '';
}
