'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageUploader, type UploaderImage } from './ImageUploader';
import type {
  ProductType,
  ProductStatus,
  ShippingClass,
  StickCategory,
  StickMaker,
  StickMaterial,
} from '@/types/stick';

export interface ProductFormInitial {
  id?: string;
  title: string;
  description: string;
  price_gbp: string;
  product_type: ProductType;
  status: ProductStatus;
  category_id: string | null;
  maker_id: string | null;
  handle_material: string;
  shank_material: string;
  collar_material: string;
  length_inches: string;
  weight_description: string;
  stock_count: string;
  is_featured: boolean;
  shipping_class: ShippingClass;
  images: UploaderImage[];
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export const DEFAULT_PRODUCT_FORM: ProductFormInitial = {
  title: '',
  description: '',
  price_gbp: '',
  product_type: 'one_of_a_kind',
  status: 'draft',
  category_id: null,
  maker_id: null,
  handle_material: '',
  shank_material: '',
  collar_material: '',
  length_inches: '',
  weight_description: '',
  stock_count: '1',
  is_featured: false,
  shipping_class: 'oversized',
  images: [],
  stripe_product_id: null,
  stripe_price_id: null,
};

interface ProductFormProps {
  initial: ProductFormInitial;
  categories: StickCategory[];
  makers: StickMaker[];
  materials: StickMaterial[];
  mode: 'create' | 'edit';
}

export function ProductForm({ initial, categories, makers, materials, mode }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'draft' | 'publish' | 'delete' | null>(null);

  const shankMaterials = materials.filter((m) => m.material_type === 'shank');
  const handleMaterials = materials.filter((m) => m.material_type === 'handle');
  const collarMaterials = materials.filter((m) => m.material_type === 'collar');

  function update<K extends keyof ProductFormInitial>(key: K, val: ProductFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submit(targetStatus: ProductStatus) {
    setError(null);
    setPending(targetStatus === 'published' ? 'publish' : 'draft');

    const price_pence = Math.round(parseFloat(form.price_gbp || '0') * 100);
    if (!form.title.trim()) {
      setError('Title is required');
      setPending(null);
      return;
    }
    if (!Number.isFinite(price_pence) || price_pence < 0) {
      setError('Price must be a valid amount');
      setPending(null);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price_pence,
      product_type: form.product_type,
      status: targetStatus,
      category_id: form.category_id,
      maker_id: form.maker_id,
      handle_material: form.handle_material || null,
      shank_material: form.shank_material || null,
      collar_material: form.collar_material || null,
      length_inches: form.length_inches ? parseInt(form.length_inches, 10) : null,
      weight_description: form.weight_description || null,
      stock_count: parseInt(form.stock_count || '1', 10),
      is_featured: form.is_featured,
      shipping_class: form.shipping_class,
      images: form.images.map((img, i) => ({
        id: img.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text ?? null,
        display_order: i,
        is_primary: i === 0,
      })),
    };

    const url = mode === 'create'
      ? '/api/admin/products'
      : `/api/admin/products/${form.id}`;
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
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setPending(null);
    }
  }

  async function archive() {
    if (!form.id) return;
    if (!window.confirm('Archive this product? It will be hidden from the shop.')) return;
    setPending('delete');
    try {
      const res = await fetch(`/api/admin/products/${form.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Archive failed');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Archive failed');
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
        {/* Main column */}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product type" htmlFor="product_type">
                <select
                  id="product_type"
                  className="input"
                  value={form.product_type}
                  onChange={(e) => update('product_type', e.target.value as ProductType)}
                >
                  <option value="one_of_a_kind">One of a kind</option>
                  <option value="supply">Supply</option>
                  <option value="gift_voucher">Gift voucher</option>
                  <option value="workshop">Workshop</option>
                </select>
              </Field>
              <Field label="Category" htmlFor="category_id">
                <select
                  id="category_id"
                  className="input"
                  value={form.category_id ?? ''}
                  onChange={(e) => update('category_id', e.target.value || null)}
                >
                  <option value="">— Select —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description" htmlFor="description" help="Plain text or basic markdown.">
              <textarea
                id="description"
                className="input min-h-[10rem] font-body"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={6}
              />
            </Field>
          </Section>

          <Section title="Images">
            <ImageUploader
              value={form.images}
              onChange={(imgs) => update('images', imgs)}
              productId={form.id}
              max={6}
            />
          </Section>

          <Section title="Materials">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Handle" htmlFor="handle_material">
                <input
                  id="handle_material"
                  className="input"
                  list="handle-materials"
                  value={form.handle_material}
                  onChange={(e) => update('handle_material', e.target.value)}
                />
                <datalist id="handle-materials">
                  {handleMaterials.map((m) => <option key={m.id} value={m.name} />)}
                </datalist>
              </Field>
              <Field label="Shank" htmlFor="shank_material">
                <input
                  id="shank_material"
                  className="input"
                  list="shank-materials"
                  value={form.shank_material}
                  onChange={(e) => update('shank_material', e.target.value)}
                />
                <datalist id="shank-materials">
                  {shankMaterials.map((m) => <option key={m.id} value={m.name} />)}
                </datalist>
              </Field>
              <Field label="Collar" htmlFor="collar_material">
                <input
                  id="collar_material"
                  className="input"
                  list="collar-materials"
                  value={form.collar_material}
                  onChange={(e) => update('collar_material', e.target.value)}
                />
                <datalist id="collar-materials">
                  {collarMaterials.map((m) => <option key={m.id} value={m.name} />)}
                </datalist>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <Field label="Length (inches)" htmlFor="length_inches">
                <input
                  id="length_inches"
                  type="number"
                  min="0"
                  className="input"
                  value={form.length_inches}
                  onChange={(e) => update('length_inches', e.target.value)}
                />
              </Field>
              <Field label="Weight / heft" htmlFor="weight_description" help="e.g. 'Light for a hazel — 320g'">
                <input
                  id="weight_description"
                  className="input"
                  value={form.weight_description}
                  onChange={(e) => update('weight_description', e.target.value)}
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <Section title="Price & stock">
            <Field label="Price (£)" htmlFor="price_gbp" required>
              <input
                id="price_gbp"
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price_gbp}
                onChange={(e) => update('price_gbp', e.target.value)}
                required
              />
            </Field>
            <Field label="Stock count" htmlFor="stock_count" help="Default 1 for one-of-a-kind items.">
              <input
                id="stock_count"
                type="number"
                min="0"
                className="input"
                value={form.stock_count}
                onChange={(e) => update('stock_count', e.target.value)}
              />
            </Field>
            <Field label="Shipping class" htmlFor="shipping_class">
              <select
                id="shipping_class"
                className="input"
                value={form.shipping_class}
                onChange={(e) => update('shipping_class', e.target.value as ShippingClass)}
              >
                <option value="oversized">Oversized (walking stick)</option>
                <option value="standard">Standard</option>
                <option value="digital">Digital</option>
                <option value="collection">Collection only</option>
              </select>
            </Field>
          </Section>

          <Section title="Attribution">
            <Field label="Made by" htmlFor="maker_id" help="Optional — leave blank for supplies.">
              <select
                id="maker_id"
                className="input"
                value={form.maker_id ?? ''}
                onChange={(e) => update('maker_id', e.target.value || null)}
              >
                <option value="">— None —</option>
                {makers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Visibility">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => update('is_featured', e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium text-stick-walnut block">Feature on homepage</span>
                <span className="text-stick-driftwood text-xs">Shows in the featured sticks row.</span>
              </span>
            </label>
          </Section>

          {mode === 'edit' && form.stripe_product_id && (
            <Section title="Stripe">
              <p className="text-xs text-stick-driftwood break-all">
                Product: {form.stripe_product_id}<br />
                Price: {form.stripe_price_id ?? '—'}
              </p>
            </Section>
          )}
        </div>
      </div>

      {/* Action bar */}
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
            onClick={archive}
            disabled={pending !== null}
            className="text-sm text-red-700 hover:underline"
          >
            {pending === 'delete' ? 'Archiving…' : 'Archive'}
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
