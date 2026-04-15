'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/stick';

const ALLOWED_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (!ALLOWED_STATUSES.includes(status)) return;
  const supabase = createSupabaseServerClient();
  await supabase.from('stick_orders').update({ status }).eq('id', id);
  revalidatePath('/admin/orders');
}

export async function updateTrackingNumber(id: string, tracking: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase
    .from('stick_orders')
    .update({ tracking_number: tracking.trim() || null })
    .eq('id', id);
  revalidatePath('/admin/orders');
}
