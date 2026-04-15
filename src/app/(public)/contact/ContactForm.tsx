'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormResult } from './actions';
import { CONTACT_SUBJECTS } from './subjects';

const initialState: ContactFormResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Sending…' : 'Send message'}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  if (state?.ok) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-card border border-stick-fell/30 bg-stick-fell/5 p-6"
      >
        <p className="font-heading text-h3 text-stick-fell">Thank you — we&rsquo;ve got it.</p>
        <p className="mt-2 text-stick-shale text-sm leading-relaxed">
          Somebody from the workshop will reply as soon as we can, usually within a few days.
          If it&rsquo;s urgent, drop in on a Monday or Tuesday evening.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/* Honeypot — hidden from humans, tempting to bots */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="input-label">
            Your name <span className="text-stick-brass">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="email" className="input-label">
            Email <span className="text-stick-brass">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="input-label">What&rsquo;s it about?</label>
        <select id="subject" name="subject" defaultValue="General enquiry" className="input">
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="input-label">
          Your message <span className="text-stick-brass">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={5000}
          className="input font-body min-h-[9rem]"
          placeholder="Tell us what you&rsquo;re thinking — a commission, a question, anything really."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <p className="text-xs text-stick-driftwood">
          We&rsquo;ll only use your details to reply.
        </p>
      </div>
    </form>
  );
}
