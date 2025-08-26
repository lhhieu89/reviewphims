import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StructuredData } from '@/components/StructuredData';
import { env } from '@/lib/env';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    template: '%s | Review Phim',
    default: 'Review Phim - Xem Review Phim Mới Nhất 2025',
  },
  description:
    'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim được đánh giá cao.',
  keywords: [
    'review phim',
    'tóm tắt phim',
    'phim hay',
    'review phim việt nam',
    'review phim trung quốc',
    'review phim hàn quốc',
    'phim cung đấu',
    'youtube review phim',
    'xem phim online',
    'phim mới 2025',
  ],
  authors: [{ name: 'Review Phim' }],
  creator: 'Review Phim',
  publisher: 'Review Phim',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    title: 'Review Phim - Khám phá video review phim hay nhất',
    description:
      'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Review phim Việt, phim quốc tế, tất cả thể loại.',
    url: '/',
    siteName: 'Review Phim',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Review Phim - Khám phá video review phim hay nhất',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Review Phim - Khám phá video review phim hay nhất',
    description:
      'Khám phá những video review phim mới nhất và hay nhất từ YouTube.',
    images: ['/og-default.jpg'],
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code', // Sẽ cần thêm sau
    yandex: 'your-yandex-verification-code', // Sẽ cần thêm sau
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <StructuredData
          type="website"
          data={{
            name: 'Review Phim - Xem Review Phim Mới Nhất 2025',
            description:
              'Khám phá những video review phim mới nhất và hay nhất từ YouTube. Tìm kiếm, xem và chia sẻ những bộ phim được đánh giá cao.',
            url: env.SITE_URL,
            publisher: {
              name: 'Review Phim',
              logo: `${env.SITE_URL}/icon-512.png`,
            },
          }}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Review Phim RSS Feed"
          href={`${env.SITE_URL}/feed.xml`}
        />
        <link rel="author" href={`${env.SITE_URL}/humans.txt`} />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
