import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stick-cream/40 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-h1 text-stick-walnut">Durham Stick Makers</h1>
          <p className="mt-2 text-small text-stick-driftwood uppercase tracking-[0.15em]">Admin sign-in</p>
        </div>
        <div className="rounded-card bg-stick-surface p-8 shadow-sm border border-stick-stone">
          <Suspense fallback={<div className="text-stick-driftwood text-sm">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
