import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Product Council — AI-Powered PM Advice from Top Product Leaders',
  description: 'Ask a product question and get a council debate from the best minds in product management, powered by 303 Lenny\'s Podcast episodes.',
  openGraph: {
    title: 'Product Council',
    description: 'AI-powered product advice from the best PM minds',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface antialiased">
        <SessionProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
