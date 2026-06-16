import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AYANOKOJI PROTOCOL',
  description: 'Strategic social-network intelligence terminal — White Room Classification A-Zero',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
