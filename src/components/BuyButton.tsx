'use client';

import { useState } from 'react';

interface BuyButtonProps {
  productId: string;
  disabled?: boolean;
  disabledLabel?: string;
  label?: string;
}

export function BuyButton({
  productId,
  disabled = false,
  disabledLabel = 'Sold',
  label = 'Buy this stick',
}: BuyButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (disabled) {
    return (
      <button type="button" disabled className="btn-primary w-full sm:w-auto">
        {disabledLabel}
      </button>
    );
  }

  async function handleClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Could not start checkout');
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout');
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="btn-primary w-full sm:w-auto"
      >
        {pending ? 'Opening checkout…' : label}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
