'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageUploader, type UploaderImage } from './ImageUploader';

export interface MakerFormInitial {
  id?: string;
  name: string;
  bio: string;
  photo_path: string | null;
  is_active: boolean;
  display_order: string;
}

export const DEFAULT_MAKER_FORM: MakerFormInitial = {
  name: '',
  bio: '',
  photo_path: null,
  is_active: true,
  display_order: '0',
};

interface MakerFormProps {
  initial: MakerFormInitial;
  mode: 'create' | 'edit';
}

export function MakerForm({ initial, mode }: MakerFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'save' | 'delete' | null>(null);

  const uploaderValue: UploaderImage[] = form.photo_path
    ? [{ storage_path: form.photo_path, display_order: 0, is_primary: true }]
    : [];

  function update<K extends keyof MakerFormInitial>(key: K, val: MakerFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function save() {
    setError(null);
    setPending('save');

    if (!form.name.trim()) {
      setError('Name is required');
      setPending(null);
      return;
    }

    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim() || null,
      photo_path: form.photo_path,
      is_active: form.is_active,
      display_order: parseInt(form.display_order || '0', 10),
    };

    const url = mode === 'create' ? '/api/admin/makers' : `/api/admin/makers/${form.id}`;
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
      router.push('/admin/makers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    if (!form.id) return;
    if (!window.confirm('Remove this member? Their sticks will stay in the shop but lose the maker attribution.')) return;
    setPending('delete');
    try {
      const res = await fetch(`/api/admin/makers/${form.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/admin/makers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
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
          <Section title="Member details">
            <Field label="Name" htmlFor="name" required>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </Field>
            <Field label="Bio" htmlFor="bio" help="A sentence or two about their making, speciality, or how long they've been at it.">
              <textarea
                id="bio"
                className="input min-h-[6rem] font-body"
                rows={4}
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Portrait photo">
            <p className="text-small text-stick-driftwood -mt-2">
              A portrait or candid at the bench — shows on the About page and alongside
              their sticks in the shop.
            </p>
            <ImageUploader
              value={uploaderValue}
              onChange={(imgs) => update('photo_path', imgs[0]?.storage_path ?? null)}
              productId={form.id ?? 'makers'}
              max={1}
            />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Display">
            <Field label="Display order" htmlFor="display_order" help="Lower numbers appear first on the About page.">
              <input
                id="display_order"
                type="number"
                min="0"
                className="input"
                value={form.display_order}
                onChange={(e) => update('display_order', e.target.value)}
              />
            </Field>
            <label className="flex items-start gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update('is_active', e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium text-stick-walnut block">Active member</span>
                <span className="text-stick-driftwood text-xs">
                  Inactive members are hidden from the About page and the maker dropdown on products.
                </span>
              </span>
            </label>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 md:-mx-10 border-t border-stick-stone bg-stick-linen px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={save} disabled={pending !== null} className="btn-primary">
          {pending === 'save' ? 'Saving…' : 'Save member'}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={remove}
            disabled={pending !== null}
            className="text-sm text-red-700 hover:underline"
          >
            {pending === 'delete' ? 'Removing…' : 'Remove member'}
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
