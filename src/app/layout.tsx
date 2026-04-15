import type { Metadata } from 'next';
import { dmSerif, inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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
