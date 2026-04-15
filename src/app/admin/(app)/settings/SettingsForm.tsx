'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { saveSettings, type SettingsResult } from './actions';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Session {
  day: string;
  start: string;
  end: string;
}

export interface SettingsFormInitial {
  charity_number: string;
  charity_name: string;
  contact_email: string;
  hero_headline: string;
  hero_subtitle: string;
  donation_cta: string;
  address_line1: string;
  address_line2: string;
  address_town: string;
  address_county: string;
  address_postcode: string;
  social_instagram: string;
  social_facebook: string;
  sessions: Session[];
  opening_note: string;
  shipping_standard: string;
  shipping_oversized: string;
  shipping_free_threshold: string;
}

const initialState: SettingsResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Saving…' : 'Save settings'}
    </button>
  );
}

export function SettingsForm({ initial }: { initial: SettingsFormInitial }) {
  const [state, formAction] = useFormState(saveSettings, initialState);
  const [sessions, setSessions] = useState<Session[]>(
    initial.sessions.length > 0
      ? initial.sessions
      : [{ day: 'Monday', start: '18:00', end: '21:00' }]
  );

  function updateSession(i: number, patch: Partial<Session>) {
    setSessions((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addSession() {
    setSessions((prev) => [...prev, { day: 'Wednesday', start: '18:00', end: '21:00' }]);
  }

  function removeSession(i: number) {
    setSessions((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-md border border-stick-fell/30 bg-stick-fell/5 px-4 py-3 text-sm text-stick-fell">
          Saved. Changes are live across the site.
        </div>
      )}

      <Section title="Charity details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Charity name" name="charity_name" defaultValue={initial.charity_name} />
          <Field label="Charity number" name="charity_number" defaultValue={initial.charity_number} />
          <Field label="Contact email" name="contact_email" type="email" defaultValue={initial.contact_email} />
        </div>
      </Section>

      <Section title="Homepage hero">
        <Field label="Headline" name="hero_headline" defaultValue={initial.hero_headline} />
        <FieldArea label="Subtitle" name="hero_subtitle" defaultValue={initial.hero_subtitle} rows={2} />
        <FieldArea
          label="Donation / support block text"
          name="donation_cta"
          defaultValue={initial.donation_cta}
          rows={3}
          help="Shown in the 'Get involved' block on the homepage."
        />
      </Section>

      <Section title="Workshop address">
        <Field label="Line 1" name="address_line1" defaultValue={initial.address_line1} />
        <Field label="Line 2 (optional)" name="address_line2" defaultValue={initial.address_line2} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Town" name="address_town" defaultValue={initial.address_town} />
          <Field label="County" name="address_county" defaultValue={initial.address_county} />
          <Field label="Postcode" name="address_postcode" defaultValue={initial.address_postcode} />
        </div>
      </Section>

      <Section title="Regular sessions">
        <p className="text-small text-stick-driftwood">
          Shown on the homepage, footer, contact and workshop pages.
        </p>
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
              <div>
                <label className="input-label">Day</label>
                <select
                  name={`session_day_${i}`}
                  value={s.day}
                  onChange={(e) => updateSession(i, { day: e.target.value })}
                  className="input"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Start</label>
                <input
                  type="time"
                  name={`session_start_${i}`}
                  value={s.start}
                  onChange={(e) => updateSession(i, { start: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">End</label>
                <input
                  type="time"
                  name={`session_end_${i}`}
                  value={s.end}
                  onChange={(e) => updateSession(i, { end: e.target.value })}
                  className="input"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSession(i)}
                className="btn-ghost text-red-700 hover:bg-red-50"
                aria-label="Remove session"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSession} className="btn-outline py-2">
          + Add session
        </button>
        <Field
          label="Opening-hours note (optional)"
          name="opening_note"
          defaultValue={initial.opening_note}
          help="e.g. 'Drop-in welcome. Kettle is always on.'"
        />
      </Section>

      <Section title="Social links">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL" name="social_instagram" defaultValue={initial.social_instagram} />
          <Field label="Facebook URL" name="social_facebook" defaultValue={initial.social_facebook} />
        </div>
      </Section>

      <Section title="Shipping rates">
        <p className="text-small text-stick-driftwood">
          Used as defaults for Stripe Checkout. Enter whole pounds (e.g. 8.95).
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Standard (£)" name="shipping_standard" type="number" step="0.01" defaultValue={initial.shipping_standard} />
          <Field label="Oversized (£)" name="shipping_oversized" type="number" step="0.01" defaultValue={initial.shipping_oversized} />
          <Field label="Free-shipping threshold (£)" name="shipping_free_threshold" type="number" step="0.01" defaultValue={initial.shipping_free_threshold} />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-6 md:-mx-10 border-t border-stick-stone bg-stick-linen px-6 md:px-10 py-4">
        <SubmitButton />
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
  name,
  type = 'text',
  defaultValue,
  help,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  help?: string;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="input-label">{label}</label>
      <input id={name} name={name} type={type} step={step} defaultValue={defaultValue} className="input" />
      {help && <p className="mt-1 text-xs text-stick-driftwood">{help}</p>}
    </div>
  );
}

function FieldArea({
  label,
  name,
  defaultValue,
  rows = 3,
  help,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="input-label">{label}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className="input font-body min-h-[4rem]" />
      {help && <p className="mt-1 text-xs text-stick-driftwood">{help}</p>}
    </div>
  );
}
