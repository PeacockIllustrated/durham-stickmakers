import type { Metadata } from 'next';
import { dmSerif, inter } from '@/lib/fonts';
import './globals.css';

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return new URL('http://localhost:3000');
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: 'Durham Stick Makers — Heritage walking sticks, handmade in County Durham',
    template: '%s | Durham Stick Makers',
  },
  description:
    'A registered charity preserving the endangered craft of stick making. Handmade shepherds crooks, thumbsticks, and walking sticks from Fencehouses, County Durham.',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Durham Stick Makers',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${dmSerif.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
