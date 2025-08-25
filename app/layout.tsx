import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CacheInitializer } from '@/components/CacheInitializer';
import { env } from '@/lib/env';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Review Phim - Khám phá video phim hay nhất',
    template: '%s | Review Phim',
  },
  description:
    'Khám phá và xem những video phim hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim yêu thích của bạn.',
  keywords: ['phim', 'video', 'youtube', 'review', 'trailer', 'cinema'],
  authors: [{ name: 'Review Phim' }],
  creator: 'Review Phim',
  publisher: 'Review Phim',
  metadataBase: new URL(env.SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: env.SITE_URL,
    title: 'Review Phim - Khám phá video phim hay nhất',
    description:
      'Khám phá và xem những video phim hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim yêu thích của bạn.',
    siteName: 'Review Phim',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Review Phim - Khám phá video phim hay nhất',
    description:
      'Khám phá và xem những video phim hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim yêu thích của bạn.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <CacheInitializer />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
