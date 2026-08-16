import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

export interface FencedCodeBlock {
  language: string;
  code: string;
}

type CodeElement = ReactElement<{ className?: string; children?: ReactNode }>;

export function getFencedCodeBlock(children: ReactNode): FencedCodeBlock | null {
  const items = Children.toArray(children);
  const codeChild = items.find(
    (child): child is CodeElement => isValidElement(child) && child.type === 'code',
  );

  if (!codeChild) {
    return null;
  }

  const className = codeChild.props.className ?? '';
  const languageMatch = /language-([\w-]+)/.exec(className);
  const language = languageMatch?.[1] ?? '';
  const code = String(codeChild.props.children ?? '').replace(/\n$/, '');

  return { language, code };
}
