import type { Metadata } from 'next';
import './globals.css';
import { PropertyProvider } from '@/lib/PropertyContext';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'KosanKu Pro — Multi-Property Co-Living Management',
  description: 'Platform manajemen kos premium terotomasi: IoT Smart Lock, QRIS, dan multi-cabang.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-orchid-violet/40 noise-overlay">
        <PropertyProvider>
          {children}
        </PropertyProvider>
        <script
          src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"
          crossOrigin="anonymous"
          defer
        />
      </body>
    </html>
  );
}
