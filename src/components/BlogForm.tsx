'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageUploader, type UploaderImage } from './ImageUploader';
import type { BlogStatus } from '@/types/stick';

export interface BlogFormInitial {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: BlogStatus;
  meta_title: string;
  meta_description: string;
  featured_image_path: string | null;
  published_at: string | null;
}

export const DEFAULT_BLOG_FORM: BlogFormInitial = {
  title: '',
  excerpt: '',
  content: '',
  author: '',
  category: '',
  status: 'draft',
  meta_title: '',
  meta_description: '',
  featured_image_path: null,
  published_at: null,
};

interface BlogFormProps {
  initial: BlogFormInitial;
  mode: 'create' | 'edit';
  /** Existing distinct categories for the datalist hint */
  knownCategories?: string[];
}

export function BlogForm({ initial, mode, knownCategories = [] }: BlogFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'draft' | 'publish' | 'delete' | null>(null);

  const uploaderValue: UploaderImage[] = form.featured_image_path
    ? [{ storage_path: form.featured_image_path, display_order: 0, is_primary: true }]
    : [];

  function update<K extends keyof BlogFormInitial>(key: K, val: BlogFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submit(targetStatus: BlogStatus) {
    setError(null);
    setPending(targetStatus === 'published' ? 'publish' : 'draft');

    if (!form.title.trim()) {
      setError('Title is required'); setPending(null); return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content || null,
      author: form.author.trim() || null,
      category: form.category.trim() || null,
      status: targetStatus,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      featured_image_path: form.featured_image_path,
    };

    const url = mode === 'create' ? '/api/admin/blog' : `/api/admin/blog/${form.id}`;
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
      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    if (!form.id) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setPending('delete');
    try {
      const res = await fetch(`/api/admin/blog/${form.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setPending(null);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(form.status === 'published' ? 'published' : 'draft');
      }}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Post">
            <Field label="Title" htmlFor="title" required>
              <input
                id="title"
                className="input"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </Field>
            <Field label="Excerpt" htmlFor="excerpt" help="One or two sentences shown on the listing page and as the OpenGraph description.">
              <textarea
                id="excerpt"
                className="input min-h-[4rem] font-body"
                rows={3}
                value={form.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
              />
            </Field>
            <Field label="Content" htmlFor="content" help="Separate paragraphs with a blank line.">
              <textarea
                id="content"
                className="input min-h-[16rem] font-body"
                rows={14}
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Featured image">
            <ImageUploader
              value={uploaderValue}
              onChange={(imgs) => update('featured_image_path', imgs[0]?.storage_path ?? null)}
              productId={form.id ?? 'blog'}
              max={1}
            />
          </Section>

          <Section title="SEO (optional)">
            <Field label="Meta title" htmlFor="meta_title" help="Defaults to the post title if blank.">
              <input
                id="meta_title"
                className="input"
                value={form.meta_title}
                onChange={(e) => update('meta_title', e.target.value)}
              />
            </Field>
            <Field label="Meta description" htmlFor="meta_description" help="Defaults to the excerpt if blank.">
              <textarea
                id="meta_description"
                className="input min-h-[3rem] font-body"
                rows={2}
                value={form.meta_description}
                onChange={(e) => update('meta_description', e.target.value)}
              />
            </Field>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Attribution">
            <Field label="Author" htmlFor="author" help="e.g. a member's name">
              <input
                id="author"
                className="input"
                value={form.author}
                onChange={(e) => update('author', e.target.value)}
              />
            </Field>
            <Field label="Category" htmlFor="category" help="Optional — e.g. Technique, Workshop news, Member spotlight.">
              <input
                id="category"
                className="input"
                list="blog-categories"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              />
              <datalist id="blog-categories">
                {knownCategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
          </Section>

          {mode === 'edit' && form.published_at && (
            <Section title="Publishing">
              <p className="text-small text-stick-driftwood">
                First published:{' '}
                {new Date(form.published_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </Section>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 md:-mx-10 border-t border-stick-stone bg-stick-linen px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void submit('draft')}
            disabled={pending !== null}
            className="btn-outline"
          >
            {pending === 'draft' ? 'Saving…' : 'Save as draft'}
          </button>
          <button
            type="button"
            onClick={() => void submit('published')}
            disabled={pending !== null}
            className="btn-primary"
          >
            {pending === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={remove}
            disabled={pending !== null}
            className="text-sm text-red-700 hover:underline"
          >
            {pending === 'delete' ? 'Deleting…' : 'Delete post'}
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
