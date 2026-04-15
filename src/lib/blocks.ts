/**
 * Content blocks for blog posts.
 *
 * Stored as a JSON string inside the existing stick_blog_posts.content TEXT
 * column — no schema change required. The wrapper shape `{ version, blocks }`
 * lets us migrate the format later.
 *
 * Backwards compatibility: posts written before blocks existed are plain text.
 * `parseContent` tolerates that and renders plain text as paragraph blocks.
 */

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'subheading'
  | 'quote'
  | 'image'
  | 'list'
  | 'divider';

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface HeadingBlock {
  type: 'heading';
  text: string;
}

export interface SubheadingBlock {
  type: 'subheading';
  text: string;
}

export interface QuoteBlock {
  type: 'quote';
  text: string;
  attribution?: string;
}

export interface ImageBlock {
  type: 'image';
  storage_path: string;
  alt?: string;
  caption?: string;
}

export interface ListBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

export interface DividerBlock {
  type: 'divider';
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | SubheadingBlock
  | QuoteBlock
  | ImageBlock
  | ListBlock
  | DividerBlock;

export interface BlockDocument {
  version: 1;
  blocks: Block[];
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  subheading: 'Subheading',
  quote: 'Quote',
  image: 'Image',
  list: 'List',
  divider: 'Divider',
};

export const BLOCK_TYPES: BlockType[] = [
  'paragraph',
  'heading',
  'subheading',
  'quote',
  'image',
  'list',
  'divider',
];

/** Build an empty block of the given type with sensible defaults. */
export function emptyBlock(type: BlockType): Block {
  switch (type) {
    case 'paragraph': return { type: 'paragraph', text: '' };
    case 'heading': return { type: 'heading', text: '' };
    case 'subheading': return { type: 'subheading', text: '' };
    case 'quote': return { type: 'quote', text: '', attribution: '' };
    case 'image': return { type: 'image', storage_path: '', alt: '', caption: '' };
    case 'list': return { type: 'list', items: [''], ordered: false };
    case 'divider': return { type: 'divider' };
  }
}

/**
 * Parse whatever is in the content column. Returns a `BlockDocument`:
 *  - If content parses as our JSON shape → return its blocks.
 *  - If content is plain text → split on blank lines into paragraph blocks.
 *  - If empty or unparseable → empty blocks list.
 */
export function parseContent(content: string | null | undefined): BlockDocument {
  if (!content || !content.trim()) return { version: 1, blocks: [] };

  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (isBlockDocument(parsed)) {
        return { version: 1, blocks: parsed.blocks.filter(isBlock) };
      }
      if (Array.isArray(parsed)) {
        return { version: 1, blocks: (parsed as unknown[]).filter(isBlock) };
      }
    } catch {
      // Not JSON — fall through to plain-text handling.
    }
  }

  const paragraphs = trimmed
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    version: 1,
    blocks: paragraphs.map<ParagraphBlock>((text) => ({ type: 'paragraph', text })),
  };
}

export function serialiseContent(blocks: Block[]): string {
  const doc: BlockDocument = { version: 1, blocks };
  return JSON.stringify(doc);
}

/** Plain-text summary of a block list — used for auto-generating excerpts. */
export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
        case 'heading':
        case 'subheading':
          return b.text;
        case 'quote':
          return b.text;
        case 'list':
          return b.items.join(' · ');
        case 'image':
          return b.caption ?? '';
        case 'divider':
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

// ---- guards ----------------------------------------------------------------

function isBlock(value: unknown): value is Block {
  if (!value || typeof value !== 'object') return false;
  const t = (value as { type?: unknown }).type;
  return typeof t === 'string' && (BLOCK_TYPES as string[]).includes(t);
}

function isBlockDocument(value: unknown): value is BlockDocument {
  if (!value || typeof value !== 'object') return false;
  const v = value as { version?: unknown; blocks?: unknown };
  return v.version === 1 && Array.isArray(v.blocks);
}
