import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aplikasi Berita Enterprise - Enterprise News Platform',
  description: 'Platform berita enterprise untuk manajemen artikel, penulis, dan engagement metrics',
  keywords: ['berita', 'artikel', 'enterprise', 'news', 'cms'],
  authors: [{ name: 'Enterprise News Team' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://aplikasi-berita-enterprise.com',
    siteName: 'Aplikasi Berita Enterprise',
    title: 'Aplikasi Berita Enterprise',
    description: 'Platform berita enterprise untuk manajemen konten dan engagement',
    images: [
      {
        url: 'https://aplikasi-berita-enterprise.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aplikasi Berita Enterprise',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#1F2937',
  colorScheme: 'dark light',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1F2937" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#F3F4F6" media="(prefers-color-scheme: light)" />
        <style>{`
          :root {
            --accent-from: #1F2937;
            --accent-to: #3B82F6;
            --color-primary: #3B82F6;
            --color-primary-dark: #1E40AF;
            --color-secondary: #1F2937;
            --color-success: #10B981;
            --color-warning: #F59E0B;
            --color-error: #EF4444;
            --color-info: #3B82F6;
          }
          
          html {
            scroll-behavior: smooth;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #0F172A;
            color: #F1F5F9;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          a {
            color: inherit;
            text-decoration: none;
          }
          
          button {
            font-family: inherit;
            cursor: pointer;
            border: none;
            background: none;
          }
          
          input, textarea, select {
            font-family: inherit;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Navigation />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}