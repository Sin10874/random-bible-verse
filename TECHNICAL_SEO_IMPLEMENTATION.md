# 🔧 Technical SEO - Implementation Guide

Complete code examples for Week 1 technical optimizations.

---

## 1. Structured Data (JSON-LD)

### Homepage Schema

Create a new file: `components/StructuredData.tsx`

```tsx
// components/StructuredData.tsx
interface WebSiteSchemaProps {
  locale: string;
}

export function WebSiteSchema({ locale }: WebSiteSchemaProps) {
  const siteName = locale === 'es'
    ? 'Generador de Versículos Bíblicos'
    : 'Bible Verse Generator';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: 'https://bibleverse-generator.org',
    description: locale === 'es'
      ? 'Generador gratuito de versículos bíblicos aleatorios. Descubre escrituras diarias sobre fe, amor, esperanza y más.'
      : 'Free random Bible verse generator. Discover daily scriptures about faith, love, hope, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://bibleverse-generator.org/{slug}'
      },
      'query-input': 'required name=slug'
    },
    inLanguage: [locale],
    alternateName: 'Bible Verse Generator',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Usage in homepage:**

```tsx
// app/[locale]/page.tsx
import { WebSiteSchema } from '@/components/StructuredData';

export default function HomePage() {
  const locale = 'en'; // Get from params

  return (
    <>
      <WebSiteSchema locale={locale} />
      {/* Rest of page content */}
    </>
  );
}
```

---

### Article Schema for Generator Pages

```tsx
// components/StructuredData.tsx (add this function)

interface ArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  locale: string;
  datePublished?: string;
  dateModified?: string;
}

export function ArticleSchema({
  title,
  description,
  slug,
  locale,
  datePublished = '2025-01-01',
  dateModified = new Date().toISOString(),
}: ArticleSchemaProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: 'https://bibleverse-generator.org/og-image.jpg', // Add OG image
    author: {
      '@type': 'Organization',
      name: 'Bible Verse Generator',
      url: 'https://bibleverse-generator.org'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bible Verse Generator',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bibleverse-generator.org/logo.png',
        width: 512,
        height: 512
      }
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bibleverse-generator.org/${slug}`
    },
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Usage in generator pages:**

```tsx
// app/[locale]/[slug]/page.tsx
import { ArticleSchema } from '@/components/StructuredData';

export default function GeneratorPage({ params }) {
  const { slug, locale } = params;

  return (
    <>
      <ArticleSchema
        title="Bible Verses About Love"
        description="Discover powerful Bible verses about love..."
        slug={`${locale === 'en' ? '' : locale + '/'}${slug}`}
        locale={locale}
      />
      {/* Page content */}
    </>
  );
}
```

---

### Breadcrumb Schema

```tsx
// components/Breadcrumb.tsx

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://bibleverse-generator.org${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-white/80">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {index === items.length - 1 ? (
                <span className="font-medium text-white">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

**Usage:**

```tsx
// In any generator page
import { Breadcrumb } from '@/components/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Love Bible Verses', href: '/love-bible-verses' }
  ]}
/>
```

---

## 2. Core Web Vitals Optimization

### Optimize Font Loading

```tsx
// app/[locale]/layout.tsx
import { Inter, Cormorant_Garamond } from 'next/font/google';

// Optimize font loading with display: swap and preload
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  preload: true,
  fallback: ['Georgia', 'serif'],
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Preconnect to External Resources

```tsx
// app/[locale]/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Preconnect to improve loading speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* If using analytics */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Prevent Layout Shift (CLS)

```tsx
// For dynamic content that loads later, reserve space
export default function VerseDisplay() {
  const [verse, setVerse] = useState(null);

  return (
    <div
      className="min-h-[200px] flex items-center justify-center"
      // ↑ Reserve minimum height to prevent layout shift
    >
      {verse ? (
        <p>{verse.text}</p>
      ) : (
        <div className="animate-pulse bg-gray-200 rounded w-full h-24" />
      )}
    </div>
  );
}
```

---

## 3. Image Optimization

### Create OG Image for Social Sharing

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1e3a8a, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Bible Verse Generator
        </h1>
        <p
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
          }}
        >
          Discover daily scripture from God's Word
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### Optimize Existing Images

```bash
# Install Sharp for image optimization (should already be installed with Next.js)
npm install sharp

# Convert images to WebP format
npx @squoosh/cli --webp auto public/*.jpg
```

---

## 4. robots.txt Optimization

Update your `public/robots.txt`:

```txt
# Allow all crawlers
User-agent: *
Allow: /

# Disallow admin/api routes
Disallow: /api/

# Sitemap location
Sitemap: https://bibleverse-generator.org/sitemap.xml

# Crawl-delay (optional, only if you notice aggressive bots)
# Crawl-delay: 1
```

---

## 5. Performance Monitoring

### Add Web Vitals Tracking

```tsx
// app/[locale]/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

**Usage:**

```tsx
// app/[locale]/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

---

## 6. Lazy Loading for Heavy Components

```tsx
// For components that aren't needed immediately
import dynamic from 'next/dynamic';

// Lazy load language switcher (not critical for initial render)
const LanguageSwitcher = dynamic(
  () => import('@/components/LanguageSwitcher'),
  {
    loading: () => <div className="w-8 h-8" />, // Prevent layout shift
    ssr: false // Only load on client side
  }
);

export default function Header() {
  return (
    <header>
      <Logo />
      <LanguageSwitcher />
    </header>
  );
}
```

---

## 7. Add Missing Meta Tags

### Complete metadata for all pages:

```tsx
// app/[locale]/[slug]/layout.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug, locale } = await params;
  const generator = getGeneratorBySlug(slug);

  return {
    title: 'Love Bible Verses - Complete Guide 2025',
    description: 'Discover powerful Bible verses about love...',

    // Open Graph
    openGraph: {
      title: 'Love Bible Verses',
      description: 'Discover powerful Bible verses...',
      url: `https://bibleverse-generator.org/${slug}`,
      siteName: 'Bible Verse Generator',
      locale: locale,
      type: 'article',
      images: [
        {
          url: 'https://bibleverse-generator.org/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Bible Verse Generator',
        }
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: 'Love Bible Verses',
      description: 'Discover powerful Bible verses...',
      images: ['https://bibleverse-generator.org/og-image.png'],
      creator: '@yourtwitterhandle', // Add if you have Twitter
    },

    // Additional
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

    // Verification (add these to homepage only)
    verification: {
      google: 'your-google-verification-code', // From Google Search Console
      // yandex: 'your-yandex-code', // If targeting Russian users
      // bing: 'your-bing-code', // From Bing Webmaster Tools
    },
  };
}
```

---

## 8. Internal Linking Component

```tsx
// components/RelatedTopics.tsx

interface RelatedTopic {
  title: string;
  slug: string;
  description: string;
}

interface RelatedTopicsProps {
  topics: RelatedTopic[];
  currentSlug: string;
}

export function RelatedTopics({ topics, currentSlug }: RelatedTopicsProps) {
  // Filter out current page
  const relatedTopics = topics.filter(t => t.slug !== currentSlug);

  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-6">Related Bible Verse Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTopics.map((topic) => (
          <a
            key={topic.slug}
            href={`/${topic.slug}`}
            className="block p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <h3 className="font-semibold mb-2">{topic.title}</h3>
            <p className="text-sm text-white/80">{topic.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
```

**Usage:**

```tsx
// In generator page
const relatedTopics = [
  {
    title: 'Faith Bible Verses',
    slug: 'faith-bible-verses',
    description: 'Strengthen your faith with powerful scriptures'
  },
  {
    title: 'Hope Bible Verses',
    slug: 'hope-bible-verses',
    description: 'Find hope in God\'s promises'
  },
  // ... more topics
];

<RelatedTopics topics={relatedTopics} currentSlug="love-bible-verses" />
```

---

## 9. Analytics Setup

### Google Analytics 4

```tsx
// app/[locale]/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID; // Add to .env.local

  return (
    <html>
      <head>
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Track Button Clicks

```tsx
// Track verse generation clicks
'use client';

export function GenerateButton() {
  const handleClick = () => {
    // Track in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_verse', {
        event_category: 'engagement',
        event_label: 'verse_generated',
      });
    }

    // Your existing generate logic
    generateVerse();
  };

  return (
    <button onClick={handleClick}>
      Generate Verse
    </button>
  );
}
```

---

## 10. Testing Checklist

Before deploying, test everything:

### Structured Data:
- [ ] Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Verify breadcrumbs show correctly
- [ ] Check article schema is valid

### Performance:
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Mobile score > 90
- [ ] Desktop score > 95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

### SEO:
- [ ] All pages have unique titles
- [ ] All pages have unique descriptions
- [ ] All images have alt text
- [ ] All links work (no 404s)
- [ ] Sitemap is valid
- [ ] robots.txt is accessible

### Cross-browser:
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test on mobile (iOS & Android)

---

## Quick Implementation Script

Run these commands to implement everything:

```bash
# 1. Create components directory
mkdir -p components

# 2. Create structured data component
# (Copy code from above into components/StructuredData.tsx)

# 3. Create breadcrumb component
# (Copy code from above into components/Breadcrumb.tsx)

# 4. Create related topics component
# (Copy code from above into components/RelatedTopics.tsx)

# 5. Update layout files with new components

# 6. Test build
npm run build

# 7. Test locally
npm run dev

# 8. Run PageSpeed test on localhost
# Use: https://pagespeed.web.dev/?url=http://localhost:3000

# 9. Commit and deploy
git add .
git commit -m "feat: add technical SEO optimizations"
git push origin main
```

---

## Deployment Verification

After deploying to production:

1. **Submit to Search Engines:**
   - Google: https://search.google.com/search-console
   - Bing: https://www.bing.com/webmasters

2. **Test Rich Results:**
   - Test 3-5 pages with Google Rich Results Test
   - Verify no errors

3. **Monitor Performance:**
   - Check Core Web Vitals in Search Console (after 7 days)
   - Set up PageSpeed monitoring

4. **Verify Indexing:**
   - Search: `site:bibleverse-generator.org`
   - Confirm all pages are indexed

---

**Next Steps:** See SEO_ACTION_PLAN.md for Week 2 backlink acquisition strategy.
