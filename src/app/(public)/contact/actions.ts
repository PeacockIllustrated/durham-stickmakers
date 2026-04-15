'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CONTACT_SUBJECTS } from './subjects';

export interface ContactFormResult {
  ok: boolean;
  error?: string;
}

const SUBJECTS = new Set<string>(CONTACT_SUBJECTS);

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactForm(
  _prev: ContactFormResult | null,
  formData: FormData
): Promise<ContactFormResult> {
  // Honeypot — bots tend to fill every field; humans never see this one.
  const honeypot = String(formData.get('website') ?? '').trim();
  if (honeypot) {
    return { ok: true };
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const subjectRaw = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name) return { ok: false, error: 'Please tell us your name.' };
  if (!validEmail(email)) return { ok: false, error: 'That email address does not look right.' };
  if (message.length < 10) return { ok: false, error: 'Please write a longer message so we can help properly.' };
  if (message.length > 5000) return { ok: false, error: 'That message is a bit long — please trim it a touch.' };

  const subject = SUBJECTS.has(subjectRaw) ? subjectRaw : 'General enquiry';

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('stick_contact_submissions').insert({
    name,
    email,
    subject,
    message,
  });

  if (error) {
    return { ok: false, error: 'Sorry, we could not send that. Please try again in a moment.' };
  }
  return { ok: true };
}
