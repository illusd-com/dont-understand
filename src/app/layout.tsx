import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '搞不懂 — Don't Understand',
  description: '搞不懂的事情都可以發上來讓大家評理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
