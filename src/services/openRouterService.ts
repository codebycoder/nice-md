import type { TranslationModelId } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are a professional translator. Translate the given markdown document to Persian (Farsi).

Important:
- Read and understand the FULL document context before translating.
- Translate coherently as a whole — maintain terminology consistency, tone, and cross-references across the entire document.
- Do NOT translate sentence by sentence or paragraph by paragraph in isolation; use surrounding context to choose the best wording.
- Preserve all markdown formatting (headings, lists, links, bold, italic, blockquotes).
- Preserve markdown tables exactly: keep pipe (|) syntax, separator rows, column count, and row structure; only translate the text inside table cells.
- Do not translate URLs, inline code, or technical identifiers.
- Keep code block placeholders (<<<NICE_MD_CODE_N>>>) exactly as they appear — do not modify, remove, or translate them.
- Return only the translated markdown without explanations or quotes.
- Keep the same structure and paragraph breaks as the input.`;

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export async function translateDocument(
  apiKey: string,
  model: TranslationModelId,
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Nice MD',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
    signal,
  });

  const data = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    throw new OpenRouterError(
      data.error?.message ?? `خطای API: ${response.status}`,
    );
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new OpenRouterError('پاسخی از مدل دریافت نشد.');
  }

  return content;
}
