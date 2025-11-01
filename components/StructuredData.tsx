import React from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface WebSiteSchema {
  type: 'WebSite';
  name: string;
  description: string;
  url: string;
  locale: string;
}

interface ArticleSchema {
  type: 'Article';
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: string;
  locale: string;
  imageUrl?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchema {
  type: 'Breadcrumb';
  items: BreadcrumbItem[];
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchema {
  type: 'FAQ';
  items: FAQItem[];
}

type StructuredDataProps = WebSiteSchema | ArticleSchema | BreadcrumbSchema | FAQSchema;

// ============================================
// STRUCTURED DATA COMPONENT
// ============================================

export default function StructuredData(props: StructuredDataProps) {
  const schema = generateSchema(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// SCHEMA GENERATORS
// ============================================

function generateSchema(props: StructuredDataProps) {
  switch (props.type) {
    case 'WebSite':
      return generateWebSiteSchema(props);
    case 'Article':
      return generateArticleSchema(props);
    case 'Breadcrumb':
      return generateBreadcrumbSchema(props);
    case 'FAQ':
      return generateFAQSchema(props);
    default:
      return null;
  }
}

// WebSite Schema for Homepage
function generateWebSiteSchema(props: WebSiteSchema) {
  const siteName = props.locale === 'es'
    ? 'Generador de Versículos Bíblicos'
    : 'Bible Verse Generator';

  const baseUrl = 'https://bibleverse-generator.org';
  const siteUrl = props.locale === 'en' ? baseUrl : `${baseUrl}/${props.locale}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    description: props.description,
    url: siteUrl,
    inLanguage: props.locale === 'es' ? 'es-ES' : 'en-US',
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Bible Verse Generator',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Article Schema for Generator Pages
function generateArticleSchema(props: ArticleSchema) {
  const baseUrl = 'https://bibleverse-generator.org';
  const organizationUrl = `${baseUrl}/#organization`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${props.url}/#article`,
    headline: props.headline,
    description: props.description,
    url: props.url,
    datePublished: props.datePublished,
    dateModified: props.dateModified,
    inLanguage: props.locale === 'es' ? 'es-ES' : 'en-US',
    author: {
      '@type': 'Organization',
      '@id': organizationUrl,
      name: props.author,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': organizationUrl,
      name: 'Bible Verse Generator',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    image: props.imageUrl ? {
      '@type': 'ImageObject',
      url: props.imageUrl,
      width: 1200,
      height: 630,
    } : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
  };
}

// Breadcrumb Schema
function generateBreadcrumbSchema(props: BreadcrumbSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: props.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQ Schema for GEO (Generative Engine Optimization)
function generateFAQSchema(props: FAQSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ============================================
// HELPER COMPONENTS
// ============================================

// Helper function to generate structured data for multiple schemas at once
export function MultipleStructuredData({ schemas }: { schemas: StructuredDataProps[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData key={index} {...schema} />
      ))}
    </>
  );
}
