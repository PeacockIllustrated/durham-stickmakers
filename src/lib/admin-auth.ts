import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from './supabase/server';

/**
 * Verify the caller is a signed-in admin user. Returns the user object or a
 * NextResponse to return immediately. Use at the top of every admin API route.
 */
export async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}
