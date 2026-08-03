'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn, stickImageUrl } from '@/lib/utils';
import {
  IMAGE_FLAG_HINTS,
  IMAGE_FLAG_LABELS,
  IMAGE_FLAG_REASONS,
  type ImageFlagReason,
  type StickImageFlag,
} from '@/types/stick';

export interface FlagUsage {
  label: string;
  href: string | null;
}

interface ImageFlagCardProps {
  flag: StickImageFlag;
  /** Where the image is used, resolved server-side. Null when nothing references it. */
  usage: FlagUsage | null;
}

/**
 * One outstanding image task: what it is, where it is used, and what still
 * needs doing to it. The note saves on blur so the owner never has to hunt
 * for a save button.
 */
export function ImageFlagCard({ flag, usage }: ImageFlagCardProps) {
  const router = useRouter();
  const url = stickImageUrl(flag.storage_path);

  const [note, setNote] = useState(flag.note ?? '');
  const [reason, setReason] = useState<ImageFlagReason>(flag.reason);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/image-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storage_path: flag.storage_path, ...body }),
      });
      if (!res.ok) throw new Error('Could not save');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  async function removeFlag() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/image-flags?path=${encodeURIComponent(flag.storage_path)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Could not remove flag');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove flag');
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        'rounded-card border bg-stick-surface p-4',
        flag.resolved ? 'border-stick-stone opacity-70' : 'border-stick-brass/50'
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md border border-stick-stone bg-stick-stone sm:w-40">
          {url ? (
            <Image
              src={url}
              alt=""
              fill
              sizes="(min-width: 640px) 160px, 90vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-wider text-stick-driftwood">
              Missing
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-heading text-h4 text-stick-walnut">
                {usage ? usage.label : 'Not used anywhere'}
              </p>
              <p className="mt-0.5 break-all text-xs text-stick-driftwood">{flag.storage_path}</p>
            </div>
            {flag.resolved ? (
              <span className="pill-fell shrink-0">Done</span>
            ) : (
              <span className="pill-brass shrink-0">{IMAGE_FLAG_LABELS[flag.reason]}</span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`reason-${flag.id}`}
                className="label-caps block"
              >
                What it needs
              </label>
              <select
                id={`reason-${flag.id}`}
                value={reason}
                disabled={busy}
                onChange={(e) => {
                  const next = e.target.value as ImageFlagReason;
                  setReason(next);
                  void patch({ reason: next });
                }}
                className="input mt-1"
              >
                {IMAGE_FLAG_REASONS.map((value) => (
                  <option key={value} value={value}>
                    {IMAGE_FLAG_LABELS[value]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-stick-driftwood">{IMAGE_FLAG_HINTS[reason]}</p>
            </div>

            <div>
              <label htmlFor={`note-${flag.id}`} className="label-caps block">
                Note (optional)
              </label>
              <textarea
                id={`note-${flag.id}`}
                value={note}
                rows={2}
                disabled={busy}
                placeholder="e.g. only 600px wide, need the original"
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => {
                  if (note !== (flag.note ?? '')) void patch({ note: note.trim() || null });
                }}
                className="input mt-1 resize-y"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {usage?.href && (
              <Link href={usage.href} className="btn-ghost text-sm">
                Open listing
              </Link>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ resolved: !flag.resolved })}
              className="btn-outline px-4 py-2 text-sm disabled:opacity-50"
            >
              {flag.resolved ? 'Reopen' : 'Mark as done'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void removeFlag()}
              className="btn-ghost text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Remove flag
            </button>
            {error && <span className="text-sm text-red-700">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
