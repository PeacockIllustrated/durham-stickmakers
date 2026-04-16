'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  emptyBlock,
  type Block,
  type BlockType,
  type CTABlock,
  type ImageBlock,
  type ListBlock,
  type QuoteBlock,
} from '@/lib/blocks';
import { cn, stickImageUrl } from '@/lib/utils';

interface BlockEditorProps {
  value: Block[];
  onChange: (next: Block[]) => void;
  /** Used as the upload folder so inline images stay grouped with their post. */
  scopeId: string;
}

export function BlockEditor({ value, onChange, scopeId }: BlockEditorProps) {
  function updateBlock(index: number, next: Block) {
    onChange(value.map((b, i) => (i === index ? next : b)));
  }

  function removeBlock(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const to = index + direction;
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function addBlock(type: BlockType) {
    onChange([...value, emptyBlock(type)]);
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-stick-cream/40 p-8 text-center text-stick-driftwood">
          <p className="font-heading text-h4 text-stick-walnut">No content yet</p>
          <p className="mt-2 text-small">Add your first block below.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {value.map((block, i) => (
            <li
              key={i}
              className="rounded-card border border-stick-stone bg-stick-surface p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="pill">{BLOCK_LABELS[block.type]}</span>
                <div className="flex items-center gap-1">
                  <IconBtn
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    label="Move up"
                  >
                    ↑
                  </IconBtn>
                  <IconBtn
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    label="Move down"
                  >
                    ↓
                  </IconBtn>
                  <IconBtn
                    onClick={() => removeBlock(i)}
                    label="Remove block"
                    tone="danger"
                  >
                    ×
                  </IconBtn>
                </div>
              </div>

              <BlockFields
                block={block}
                scopeId={scopeId}
                onChange={(next) => updateBlock(i, next)}
              />
            </li>
          ))}
        </ol>
      )}

      <BlockAdder onAdd={addBlock} />
    </div>
  );
}

function BlockAdder({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-outline w-full justify-center py-3 border-dashed"
      >
        + Add block
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-2 rounded-card border border-stick-stone bg-stick-surface shadow-lg overflow-hidden z-10">
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 text-sm text-stick-walnut hover:bg-stick-cream border-b border-stick-stone last:border-0"
            >
              <span className="font-medium">{BLOCK_LABELS[type]}</span>
              <span className="text-stick-driftwood ml-2 text-xs">
                {BLOCK_HINT[type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BLOCK_HINT: Record<BlockType, string> = {
  paragraph: 'A body paragraph',
  heading: 'A big section heading',
  subheading: 'A smaller heading',
  quote: 'A pulled quote with optional attribution',
  image: 'An image with a caption',
  list: 'A bulleted or numbered list',
  divider: 'A visual break',
  cta: 'A button card linking somewhere',
};

// ---- Per-block-type field editors ------------------------------------------

function BlockFields({
  block,
  scopeId,
  onChange,
}: {
  block: Block;
  scopeId: string;
  onChange: (next: Block) => void;
}) {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'subheading':
      return (
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder={
            block.type === 'paragraph'
              ? 'Write your paragraph…'
              : block.type === 'heading'
                ? 'Section heading'
                : 'Subheading'
          }
          rows={block.type === 'paragraph' ? 4 : 1}
          className={cn(
            'input font-body',
            block.type === 'heading' && 'font-heading text-h3',
            block.type === 'subheading' && 'font-heading text-h4',
          )}
        />
      );

    case 'quote':
      return <QuoteFields block={block} onChange={onChange} />;

    case 'image':
      return <ImageFields block={block} scopeId={scopeId} onChange={onChange} />;

    case 'list':
      return <ListFields block={block} onChange={onChange} />;

    case 'divider':
      return (
        <p className="text-xs text-stick-driftwood italic text-center py-2">
          A quiet visual break between sections.
        </p>
      );

    case 'cta':
      return <CTAFields block={block} onChange={onChange} />;
  }
}

function CTAFields({
  block,
  onChange,
}: {
  block: CTABlock;
  onChange: (next: CTABlock) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="input-label">Heading</label>
        <input
          value={block.heading}
          onChange={(e) => onChange({ ...block, heading: e.target.value })}
          placeholder="e.g. Book your next workshop"
          className="input font-heading text-h4"
        />
      </div>
      <div>
        <label className="input-label">Body (optional)</label>
        <textarea
          value={block.body ?? ''}
          onChange={(e) => onChange({ ...block, body: e.target.value })}
          placeholder="One line of supporting text"
          rows={2}
          className="input font-body"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="input-label">Button label</label>
          <input
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="e.g. See the shop"
            className="input"
          />
        </div>
        <div>
          <label className="input-label">Style</label>
          <select
            value={block.variant ?? 'walnut'}
            onChange={(e) => onChange({ ...block, variant: e.target.value as CTABlock['variant'] })}
            className="input"
          >
            <option value="walnut">Dark (walnut)</option>
            <option value="brass">Warm (brass)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="input-label">Link</label>
        <input
          value={block.href}
          onChange={(e) => onChange({ ...block, href: e.target.value })}
          placeholder="/workshops - internal path, or https://… for an external site"
          className="input font-mono text-sm"
        />
        <p className="mt-1 text-xs text-stick-driftwood">
          Start with <code>/</code> for pages on this site (e.g. <code>/workshops</code>).
          External URLs open in a new tab automatically.
        </p>
      </div>
    </div>
  );
}

function QuoteFields({
  block,
  onChange,
}: {
  block: QuoteBlock;
  onChange: (next: QuoteBlock) => void;
}) {
  return (
    <div className="space-y-3">
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="The quote itself"
        rows={3}
        className="input font-body italic"
      />
      <input
        value={block.attribution ?? ''}
        onChange={(e) => onChange({ ...block, attribution: e.target.value })}
        placeholder="Attribution (optional) - e.g. Margaret, 82"
        className="input"
      />
    </div>
  );
}

function ListFields({
  block,
  onChange,
}: {
  block: ListBlock;
  onChange: (next: ListBlock) => void;
}) {
  function updateItem(i: number, text: string) {
    onChange({ ...block, items: block.items.map((x, idx) => (idx === i ? text : x)) });
  }
  function addItem() {
    onChange({ ...block, items: [...block.items, ''] });
  }
  function removeItem(i: number) {
    const next = block.items.filter((_, idx) => idx !== i);
    onChange({ ...block, items: next.length ? next : [''] });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs mb-1">
        <label className="flex items-center gap-2 text-stick-walnut cursor-pointer">
          <input
            type="radio"
            checked={!block.ordered}
            onChange={() => onChange({ ...block, ordered: false })}
          />
          Bulleted
        </label>
        <label className="flex items-center gap-2 text-stick-walnut cursor-pointer">
          <input
            type="radio"
            checked={!!block.ordered}
            onChange={() => onChange({ ...block, ordered: true })}
          />
          Numbered
        </label>
      </div>
      {block.items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 pt-2 text-stick-driftwood text-sm w-5 text-center">
            {block.ordered ? `${i + 1}.` : '•'}
          </span>
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder="List item"
            className="input"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 text-red-700 hover:underline text-sm px-2"
            aria-label="Remove item"
            disabled={block.items.length === 1}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="btn-ghost -ml-4 text-sm">
        + Add item
      </button>
    </div>
  );
}

function ImageFields({
  block,
  scopeId,
  onChange,
}: {
  block: ImageBlock;
  scopeId: string;
  onChange: (next: ImageBlock) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('productId', `blog-${scopeId}`);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Upload failed');
        throw new Error(msg || 'Upload failed');
      }
      const body = (await res.json()) as { storage_path: string };
      onChange({ ...block, storage_path: body.storage_path });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const previewUrl = block.storage_path ? stickImageUrl(block.storage_path) : null;

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-stick-stone">
          <Image
            src={previewUrl}
            alt={block.alt ?? ''}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange({ ...block, storage_path: '' })}
            className="absolute right-2 top-2 rounded-md bg-stick-surface/90 px-3 py-1 text-xs font-medium text-red-700 hover:bg-stick-surface"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className="rounded-md border-2 border-dashed border-stick-stone bg-stick-cream/40 p-6 text-center"
        >
          <p className="text-sm text-stick-walnut">
            {uploading ? 'Uploading…' : 'Drop an image here, or'}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-2 font-medium text-stick-brass hover:text-stick-walnut"
          >
            click to pick a file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="hidden"
          />
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="input-label">Caption (optional)</label>
          <input
            value={block.caption ?? ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Shown under the image"
            className="input"
          />
        </div>
        <div>
          <label className="input-label">Alt text</label>
          <input
            value={block.alt ?? ''}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Describes the image for screen readers"
            className="input"
          />
        </div>
      </div>
    </div>
  );
}

// ---- Small icon button shared across block controls ------------------------

function IconBtn({
  children,
  onClick,
  disabled,
  label,
  tone = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'h-8 w-8 rounded-md text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
        tone === 'danger'
          ? 'text-red-700 hover:bg-red-50'
          : 'text-stick-walnut hover:bg-stick-cream'
      )}
    >
      {children}
    </button>
  );
}
