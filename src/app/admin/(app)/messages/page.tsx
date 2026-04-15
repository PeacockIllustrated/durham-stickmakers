import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MessageRow } from './MessageRow';
import type { StickContactSubmission } from '@/types/stick';

export const metadata = { title: 'Messages' };

export default async function AdminMessagesPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_contact_submissions')
    // Unread first, then newest first
    .select('*')
    .order('is_read', { ascending: true })
    .order('created_at', { ascending: false });

  const messages = (data as StickContactSubmission[] | null) ?? [];
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1">Messages</h1>
        <p className="text-stick-driftwood text-small mt-1">
          {messages.length === 0
            ? 'No messages yet. New contact form submissions will appear here.'
            : `${messages.length} total · ${unreadCount} unread`}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load messages: {error.message}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-stick-surface p-10 text-center text-stick-driftwood">
          Inbox is empty.
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </ul>
      )}
    </div>
  );
}
