/**
 * Tiny content renderer — splits a string on blank lines into paragraphs and
 * preserves single line-breaks within a paragraph. Good enough for charity
 * blog posts; upgrade to full markdown later if the owner needs headings,
 * lists, bold, etc.
 */
export function toParagraphs(content: string | null | undefined): string[] {
  if (!content) return [];
  return content
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
