import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { IMAGE_FLAG_REASONS, type ImageFlagReason } from '@/types/stick';

/**
 * Image quality flags, keyed on the image's storage_path.
 *
 * Flagging is deliberately independent of whatever form the image sits in —
 * the owner can mark a photo as needing work without saving the product, and
 * the flag survives the image being reordered or moved to another listing.
 */

function isReason(value: unknown): value is ImageFlagReason {
  return typeof value === 'string' && IMAGE_FLAG_REASONS.includes(value as ImageFlagReason);
}

/** GET /api/admin/image-flags — all flags, or ?unresolved=1 for outstanding work. */
export async function GET(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const unresolvedOnly = new URL(request.url).searchParams.get('unresolved') === '1';

  const supabase = createSupabaseServerClient();
  let query = supabase.from('stick_image_flags').select('*');
  if (unresolvedOnly) query = query.eq('resolved', false);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ flags: data ?? [] });
}

/**
 * POST /api/admin/image-flags — flag an image, or change an existing flag.
 * Upserts on storage_path so re-flagging the same image never duplicates.
 */
export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body: { storage_path?: string; reason?: string; note?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const storagePath = body.storage_path?.trim();
  if (!storagePath) {
    return NextResponse.json({ error: 'storage_path required' }, { status: 400 });
  }
  if (!isReason(body.reason)) {
    return NextResponse.json({ error: 'Unknown reason' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_image_flags')
    .upsert(
      {
        storage_path: storagePath,
        reason: body.reason,
        note: body.note ?? null,
        // Re-flagging an image reopens it — the owner has decided it still
        // needs work, whatever it was marked as before.
        resolved: false,
      },
      { onConflict: 'storage_path' }
    )
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Could not save flag' }, { status: 500 });
  }
  return NextResponse.json({ flag: data });
}

/**
 * PATCH /api/admin/image-flags — update the note, or mark work done/not done.
 * Only the fields present in the body are touched.
 */
export async function PATCH(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body: { storage_path?: string; note?: string | null; resolved?: boolean; reason?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const storagePath = body.storage_path?.trim();
  if (!storagePath) {
    return NextResponse.json({ error: 'storage_path required' }, { status: 400 });
  }

  const patch: { note?: string | null; resolved?: boolean; reason?: ImageFlagReason } = {};
  if ('note' in body) patch.note = body.note ?? null;
  if (typeof body.resolved === 'boolean') patch.resolved = body.resolved;
  if ('reason' in body) {
    if (!isReason(body.reason)) {
      return NextResponse.json({ error: 'Unknown reason' }, { status: 400 });
    }
    patch.reason = body.reason;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_image_flags')
    .update(patch)
    .eq('storage_path', storagePath)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Could not update flag' }, { status: 500 });
  }
  return NextResponse.json({ flag: data });
}

/** DELETE /api/admin/image-flags?path=… — clear the flag entirely. */
export async function DELETE(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const storagePath = new URL(request.url).searchParams.get('path')?.trim();
  if (!storagePath) {
    return NextResponse.json({ error: 'path required' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('stick_image_flags')
    .delete()
    .eq('storage_path', storagePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
