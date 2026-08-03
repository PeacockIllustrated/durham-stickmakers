'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn, stickImageUrl } from '@/lib/utils';
import {
  IMAGE_FLAG_LABELS,
  IMAGE_FLAG_REASONS,
  type ImageFlagReason,
  type StickImageFlag,
} from '@/types/stick';

export interface UploaderImage {
  id?: string;
  storage_path: string;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
  /** Set when the image was added in this session but not yet persisted. */
  isNew?: boolean;
}

interface ImageUploaderProps {
  value: UploaderImage[];
  onChange: (next: UploaderImage[]) => void;
  productId?: string;
  max?: number;
}

/**
 * Drag-to-upload, reorder, delete. First image is primary.
 * Uploads go to /api/admin/upload → Supabase Storage (stick-images bucket).
 */
export function ImageUploader({
  value,
  onChange,
  productId,
  max = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  /**
   * Outstanding image-quality flags, keyed on storage_path. Loaded and saved
   * independently of the surrounding form so the owner can mark a photo as
   * needing work without having to save the listing first.
   */
  const [flags, setFlags] = useState<Record<string, ImageFlagReason>>({});
  const [savingFlag, setSavingFlag] = useState<string | null>(null);

  const remaining = Math.max(0, max - value.length);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/image-flags?unresolved=1')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Could not load flags'))))
      .then((body: { flags: StickImageFlag[] }) => {
        if (cancelled) return;
        const next: Record<string, ImageFlagReason> = {};
        for (const flag of body.flags) next[flag.storage_path] = flag.reason;
        setFlags(next);
      })
      // A flag list that will not load must not break uploading — the controls
      // just show as unflagged until the next load succeeds.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function setFlag(storagePath: string, reason: ImageFlagReason | '') {
    setSavingFlag(storagePath);
    setError(null);

    // Optimistic — the control is a select, and snapping back on every
    // keystroke-speed change would feel broken
    const previous = flags[storagePath];
    setFlags((current) => {
      const next = { ...current };
      if (reason) next[storagePath] = reason;
      else delete next[storagePath];
      return next;
    });

    try {
      const res = reason
        ? await fetch('/api/admin/image-flags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storage_path: storagePath, reason }),
          })
        : await fetch(`/api/admin/image-flags?path=${encodeURIComponent(storagePath)}`, {
            method: 'DELETE',
          });
      if (!res.ok) throw new Error('Could not save flag');
    } catch (err) {
      setFlags((current) => {
        const next = { ...current };
        if (previous) next[storagePath] = previous;
        else delete next[storagePath];
        return next;
      });
      setError(err instanceof Error ? err.message : 'Could not save flag');
    } finally {
      setSavingFlag(null);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!files || !files.length) return;
    setError(null);
    setUploading(true);

    const toUpload = Array.from(files).slice(0, remaining);
    const uploaded: UploaderImage[] = [];

    try {
      for (const file of toUpload) {
        const form = new FormData();
        form.append('file', file);
        if (productId) form.append('productId', productId);

        const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
        if (!res.ok) {
          const msg = await res.text().catch(() => 'Upload failed');
          throw new Error(msg || 'Upload failed');
        }
        const body = (await res.json()) as { storage_path: string };

        uploaded.push({
          storage_path: body.storage_path,
          alt_text: null,
          display_order: value.length + uploaded.length,
          is_primary: value.length + uploaded.length === 0,
          isNew: true,
        });
      }
      onChange(normaliseOrder([...value, ...uploaded]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function normaliseOrder(list: UploaderImage[]): UploaderImage[] {
    return list.map((img, i) => ({
      ...img,
      display_order: i,
      is_primary: i === 0,
    }));
  }

  function remove(index: number) {
    onChange(normaliseOrder(value.filter((_, i) => i !== index)));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(normaliseOrder(next));
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length && remaining > 0) {
            void uploadFiles(e.dataTransfer.files);
          }
        }}
        className={cn(
          'rounded-card border-2 border-dashed p-6 text-center transition-colors',
          dragOver ? 'border-stick-brass bg-stick-brass/5' : 'border-stick-stone bg-stick-cream/40',
          remaining === 0 && 'opacity-60'
        )}
      >
        <p className="font-body text-sm text-stick-walnut">
          {remaining === 0
            ? `Maximum ${max} images reached`
            : 'Drop images here, or'}
        </p>
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 font-medium text-stick-brass hover:text-stick-walnut"
          >
            click to select
          </button>
        )}
        <p className="mt-1 text-xs text-stick-driftwood">
          JPG, PNG or WebP · up to {max} images · first image becomes primary
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="hidden"
        />
        {uploading && <p className="mt-3 text-xs text-stick-driftwood">Uploading…</p>}
        {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
      </div>

      {/* Thumbnails */}
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => {
            const url = stickImageUrl(img.storage_path);
            const flagged = flags[img.storage_path];
            const selectId = `image-flag-${i}`;
            return (
              <li key={`${img.storage_path}-${i}`} className="space-y-1.5">
                <div
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) move(dragIndex, i);
                    setDragIndex(null);
                  }}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-md border bg-stick-stone',
                    flagged ? 'border-stick-brass' : 'border-stick-stone',
                    dragIndex === i && 'opacity-50'
                  )}
                >
                  {url && (
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
                      className="object-cover"
                    />
                  )}
                  {img.is_primary && (
                    <span className="absolute left-1 top-1 rounded bg-stick-walnut px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-stick-linen">
                      Primary
                    </span>
                  )}
                  {flagged && (
                    <span
                      className="absolute right-1 top-1 rounded bg-stick-brass px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stick-walnut"
                      title={IMAGE_FLAG_LABELS[flagged]}
                    >
                      Flagged
                    </span>
                  )}
                  <div className="absolute inset-0 bg-stick-walnut/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => move(i, i - 1)}
                        disabled={i === 0}
                        className="rounded bg-stick-surface/80 px-1.5 text-xs text-stick-walnut disabled:opacity-30"
                        aria-label="Move left"
                      >‹</button>
                      <button
                        type="button"
                        onClick={() => move(i, i + 1)}
                        disabled={i === value.length - 1}
                        className="rounded bg-stick-surface/80 px-1.5 text-xs text-stick-walnut disabled:opacity-30"
                        aria-label="Move right"
                      >›</button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="rounded bg-stick-surface/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Flag for later work. Saved on change, independently of the
                    surrounding form, and collected on /admin/images */}
                <label htmlFor={selectId} className="sr-only">
                  Flag image {i + 1} as needing work
                </label>
                <select
                  id={selectId}
                  value={flagged ?? ''}
                  disabled={savingFlag === img.storage_path}
                  onChange={(e) => setFlag(img.storage_path, e.target.value as ImageFlagReason | '')}
                  className={cn(
                    'w-full rounded border bg-stick-surface px-1.5 py-1 text-xs text-stick-walnut',
                    'focus:border-stick-brass focus:outline-none focus:ring-1 focus:ring-stick-brass',
                    'disabled:opacity-50',
                    flagged ? 'border-stick-brass' : 'border-stick-stone text-stick-driftwood'
                  )}
                >
                  <option value="">No action needed</option>
                  {IMAGE_FLAG_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {IMAGE_FLAG_LABELS[reason]}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
