import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Youtuber',
  description: 'AI-powered cinematic slide presentations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
