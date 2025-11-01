import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import Script from 'next/script';
import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import '../globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const url = `/${locale}`;
  const siteName = locale === 'es' ? 'Generador de Versículos Bíblicos' : 'Bible Verse Generator';

  return {
    title: t('home.title'),
    description: t('home.description'),
    keywords: t('home.keywords').split(', '),
    openGraph: {
      type: 'website',
      url,
      siteName,
      title: t('home.title'),
      description: t('home.description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.title'),
      description: t('home.description'),
    },
    alternates: {
      canonical: locale === 'en' ? '/' : url,
      languages: {
        'en': '/',
        'es': '/es',
        'x-default': '/', // Default fallback for unsupported languages
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params in Next.js 15
  const { locale } = await params;

  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  // Get translations for structured data
  const t = await getTranslations({ locale, namespace: 'seo' });

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect to improve loading speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS Prefetch for faster domain resolution */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* WebSite Structured Data */}
        <StructuredData
          type="WebSite"
          name={locale === 'es' ? 'Generador de Versículos Bíblicos' : 'Bible Verse Generator'}
          description={t('home.description')}
          url={locale === 'en' ? 'https://bibleverse-generator.org' : `https://bibleverse-generator.org/${locale}`}
          locale={locale}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>

        {/* ✅ Google Analytics (GA4) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-14SYS6MEDE"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-14SYS6MEDE', { page_path: window.location.pathname });
            `,
          }}
        />
      </body>
    </html>
  );
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
