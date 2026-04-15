'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageUploader, type UploaderImage } from './ImageUploader';
import type { WorkshopStatus } from '@/types/stick';

export interface WorkshopFormInitial {
  id?: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: string;
  spots_remaining: string;
  price_gbp: string;
  location: string;
  status: WorkshopStatus;
  featured_image_path: string | null;
}

export const DEFAULT_WORKSHOP_FORM: WorkshopFormInitial = {
  title: '',
  description: '',
  date: '',
  start_time: '18:00',
  end_time: '21:00',
  capacity: '8',
  spots_remaining: '8',
  price_gbp: '0',
  location: 'Fencehouses Community Centre, DH4 6DS',
  status: 'upcoming',
  featured_image_path: null,
};

interface WorkshopFormProps {
  initial: WorkshopFormInitial;
  mode: 'create' | 'edit';
}

export function WorkshopForm({ initial, mode }: WorkshopFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'save' | 'delete' | null>(null);

  // The uploader is image-based — for workshops we only want one featured image.
  // Wrap the single path in/out of the uploader's array shape.
  const uploaderValue: UploaderImage[] = form.featured_image_path
    ? [
        {
          storage_path: form.featured_image_path,
          display_order: 0,
          is_primary: true,
        },
      ]
    : [];

  function update<K extends keyof WorkshopFormInitial>(key: K, val: WorkshopFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function save() {
    setError(null);
    setPending('save');

    const capacity = parseInt(form.capacity || '0', 10);
    const spotsRemaining = form.spots_remaining === '' ? capacity : parseInt(form.spots_remaining, 10);
    const price_pence = Math.round(parseFloat(form.price_gbp || '0') * 100);

    if (!form.title.trim()) {
      setError('Title is required'); setPending(null); return;
    }
    if (!form.date) {
      setError('Date is required'); setPending(null); return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setError('Capacity must be at least 1'); setPending(null); return;
    }
    if (spotsRemaining > capacity) {
      setError('Spots remaining cannot exceed capacity'); setPending(null); return;
    }
    if (price_pence < 0) {
      setError('Price cannot be negative'); setPending(null); return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      capacity,
      spots_remaining: spotsRemaining,
      price_pence,
      location: form.location.trim(),
      status: form.status,
      featured_image_path: form.featured_image_path,
    };

    const url = mode === 'create' ? '/api/admin/workshops' : `/api/admin/workshops/${form.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Save failed');
        throw new Error(msg || 'Save failed');
      }
      router.push('/admin/workshops');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    if (!form.id) return;
    if (!window.confirm('Cancel this workshop? Bookings will remain for the record.')) return;
    setPending('delete');
    try {
      const res = await fetch(`/api/admin/workshops/${form.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Cancel failed');
      router.push('/admin/workshops');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
      setPending(null);
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void save(); }}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Details">
            <Field label="Title" htmlFor="title" required>
              <input
                id="title"
                className="input"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </Field>
            <Field label="Description" htmlFor="description" help="What will attendees learn or make? Plain text.">
              <textarea
                id="description"
                className="input min-h-[8rem] font-body"
                rows={5}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </Field>
            <Field label="Location" htmlFor="location">
              <input
                id="location"
                className="input"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Featured image">
            <ImageUploader
              value={uploaderValue}
              onChange={(imgs) => update('featured_image_path', imgs[0]?.storage_path ?? null)}
              productId={form.id ?? 'workshops'}
              max={1}
            />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="When">
            <Field label="Date" htmlFor="date" required>
              <input
                id="date"
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" htmlFor="start_time">
                <input
                  id="start_time"
                  type="time"
                  className="input"
                  value={form.start_time}
                  onChange={(e) => update('start_time', e.target.value)}
                />
              </Field>
              <Field label="End" htmlFor="end_time">
                <input
                  id="end_time"
                  type="time"
                  className="input"
                  value={form.end_time}
                  onChange={(e) => update('end_time', e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Capacity & price">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacity" htmlFor="capacity">
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  className="input"
                  value={form.capacity}
                  onChange={(e) => update('capacity', e.target.value)}
                />
              </Field>
              <Field label="Spots left" htmlFor="spots_remaining" help="Defaults to capacity">
                <input
                  id="spots_remaining"
                  type="number"
                  min="0"
                  className="input"
                  value={form.spots_remaining}
                  onChange={(e) => update('spots_remaining', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Price (£)" htmlFor="price_gbp" help="Enter 0 for a free session">
              <input
                id="price_gbp"
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price_gbp}
                onChange={(e) => update('price_gbp', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Status">
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                className="input capitalize"
                value={form.status}
                onChange={(e) => update('status', e.target.value as WorkshopStatus)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="fully_booked">Fully booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 md:-mx-10 border-t border-stick-stone bg-stick-linen px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={save} disabled={pending !== null} className="btn-primary">
          {pending === 'save' ? 'Saving…' : 'Save workshop'}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={remove}
            disabled={pending !== null}
            className="text-sm text-red-700 hover:underline"
          >
            {pending === 'delete' ? 'Cancelling…' : 'Cancel workshop'}
          </button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-stick-stone bg-stick-surface p-5 md:p-6 space-y-4">
      <h2 className="font-heading text-h3">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  help,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="input-label">
        {label} {required && <span className="text-stick-brass">*</span>}
      </label>
      {children}
      {help && <p className="mt-1 text-xs text-stick-driftwood">{help}</p>}
    </div>
  );
}
