import type { Element, Root, Text } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { extractToc, headingSlug, normalizeHeadingText } from './extractToc';

function getHeadingPlainText(node: Element): string {
  const chunks: string[] = [];

  visit(node, 'text', (child: Text) => {
    chunks.push(child.value);
  });

  return normalizeHeadingText(chunks.join(''));
}

function headingMatchesTocItem(headingText: string, itemText: string): boolean {
  if (headingText === itemText) {
    return true;
  }

  return headingSlug(headingText) === headingSlug(itemText);
}

export function rehypeHeadingIds(content: string): Plugin<[], Root> {
  const tocItems = extractToc(content);

  return () => (tree) => {
    let cursor = 0;

    visit(tree, 'element', (node) => {
      if (!/^h[1-6]$/.test(node.tagName)) {
        return;
      }

      const level = Number(node.tagName.charAt(1));
      const headingText = getHeadingPlainText(node);

      for (let index = cursor; index < tocItems.length; index += 1) {
        const item = tocItems[index];

        if (item.level !== level) {
          continue;
        }

        if (!headingMatchesTocItem(headingText, item.text)) {
          continue;
        }

        node.properties = {
          ...node.properties,
          id: item.id,
        };
        cursor = index + 1;
        return;
      }
    });
  };
}
