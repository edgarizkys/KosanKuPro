import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KosanKu Pro — Luxury Living Management',
  description: 'Platform manajemen kos premium dengan pembayaran otomatis, AI chatbot, dan smart living.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
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
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"
          crossOrigin="anonymous"
          defer
        />
      </body>
    </html>
  );
}
