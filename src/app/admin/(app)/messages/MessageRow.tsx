'use client';

import { useState, useTransition } from 'react';
import { markMessageRead } from './actions';
import { cn } from '@/lib/utils';
import type { StickContactSubmission } from '@/types/stick';

export function MessageRow({ message }: { message: StickContactSubmission }) {
  const [open, setOpen] = useState(false);
  const [isRead, setIsRead] = useState(message.is_read);
  const [pending, startTransition] = useTransition();

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !isRead) {
      setIsRead(true);
      startTransition(() => {
        void markMessageRead(message.id, true);
      });
    }
  }

  function toggleRead(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const next = !isRead;
    setIsRead(next);
    startTransition(() => {
      void markMessageRead(message.id, next);
    });
  }

  const submitted = new Date(message.created_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li
      className={cn(
        'rounded-card border bg-white transition-colors',
        isRead ? 'border-stick-stone' : 'border-stick-brass/60'
      )}
    >
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-start gap-4 p-4 md:p-5 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
            isRead ? 'bg-stick-stone' : 'bg-stick-brass'
          )}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={cn('font-medium truncate', isRead ? 'text-stick-walnut' : 'text-stick-walnut')}>
              {message.name}
            </span>
            <span className="text-xs text-stick-driftwood">{submitted}</span>
          </div>
          <div className="mt-0.5 text-small text-stick-driftwood truncate">
            {message.subject ?? 'General enquiry'} · {message.email}
          </div>
          {!open && (
            <p className="mt-2 text-small text-stick-shale line-clamp-1">
              {message.message}
            </p>
          )}
        </div>
        <span className="text-xs text-stick-driftwood shrink-0 hidden sm:block">
          {open ? 'Hide' : 'Read'}
        </span>
      </button>

      {open && (
        <div className="border-t border-stick-stone px-4 md:px-5 py-4 space-y-4">
          <p className="whitespace-pre-wrap text-sm text-stick-shale leading-relaxed">
            {message.message}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject ?? 'your enquiry')}`} className="btn-primary py-2">
              Reply by email
            </a>
            <button
              type="button"
              onClick={toggleRead}
              disabled={pending}
              className="btn-ghost"
            >
              {isRead ? 'Mark as unread' : 'Mark as read'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
