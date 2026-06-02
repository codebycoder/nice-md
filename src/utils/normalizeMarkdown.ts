const PROTECTED_BLOCK_SPLIT = /(```[\s\S]*?```|`[^`\n]+`)/g;
const COMMAND_PATTERN =
  /\b(?:pnpm|npm|yarn|bun|git|docker|npx)\s+[A-Za-z0-9@:/._=-]+(?:\s+[A-Za-z0-9@:/._=-]+){0,4}/g;
const ENV_PATTERN = /\b[A-Z][A-Z0-9_]{2,}\b/g;
const PATH_PATTERN =
  /\b(?:(?:[\w.-]+\/)+[\w.-]+|[\w.-]+\.(?:ya?ml|json|tsx?|jsx?|md|env|sh|css|html|toml|lock))\b/g;
const TECH_PATTERN =
  /\b(?:OpenRouter|GPT-5|Vite|React|TypeScript|Tailwind|Markdown|Node\.js|Docker|PostgreSQL|Redis|[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+)\b/g;

function wrapTechnicalTokens(segment: string): string {
  let output = segment;
  const patterns = [COMMAND_PATTERN, PATH_PATTERN, ENV_PATTERN, TECH_PATTERN];

  for (const pattern of patterns) {
    output = output.replace(pattern, (match, offset, full) => {
      const before = full[offset - 1];
      const after = full[offset + match.length];

      if (before === '`' || after === '`') {
        return match;
      }

      return `\`${match}\``;
    });
  }

  return output;
}

export function normalizeMarkdown(markdown: string): string {
  const sections = markdown.split(PROTECTED_BLOCK_SPLIT);

  return sections
    .map((section) => {
      if (
        section.startsWith('```') ||
        (section.startsWith('`') && section.endsWith('`'))
      ) {
        return section;
      }

      return wrapTechnicalTokens(section);
    })
    .join('');
}
