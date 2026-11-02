import type { Metadata, Viewport } from 'next';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/cyrillic-500.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/cyrillic-500.css';
import '@fontsource/manrope/latin-500.css';
import { StoreProvider, Header, Footer } from '@/components/store';
import { asset } from '@/lib/catalog';
import './globals.css';
import './redesign.css';
const site = process.env.SITE_ORIGIN || 'https://example.invalid';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#472638',
};
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: 'Тихий сад — цветы для того, что трудно сказать словами',
    template: '%s · Тихий сад',
  },
  description:
    'Демонстрационный магазин авторских букетов в Волгограде. Выберите цветы по настроению. Заказы и оплата не принимаются.',
  robots: { index: false, follow: false },
  icons: { icon: asset('/icon.svg') },
  manifest: asset('/manifest.webmanifest'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    title: 'Тихий сад · Цветочная мастерская',
    description: 'Цветы для того, что трудно сказать словами. Демонстрационный магазин.',
    images: [
      {
        url: asset('/images/og.jpg'),
        width: 1200,
        height: 630,
        alt: 'Авторский букет Тихого сада',
      },
    ],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main">
          Перейти к содержимому
        </a>
        <StoreProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
