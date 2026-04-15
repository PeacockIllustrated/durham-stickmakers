'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function markMessageRead(id: string, isRead: boolean): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase
    .from('stick_contact_submissions')
    .update({ is_read: isRead })
    .eq('id', id);
  revalidatePath('/admin/messages');
}
