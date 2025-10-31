import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Spanish metadata
  if (locale === 'es') {
    return {
      title: "Política de Privacidad | Generador de Versículos Bíblicos",
      description: "Aprende cómo Generador de Versículos Bíblicos recopila, usa y protege datos técnicos mínimos. Sin anuncios dirigidos, sin venta de datos.",
      robots: { index: true, follow: true },
      alternates: {
        canonical: '/es/privacy',
        languages: {
          'en': '/privacy',
          'es': '/es/privacy',
          'x-default': '/privacy',
        },
      },
    };
  }

  // English metadata (default)
  return {
    title: "Privacy Policy | Bible Verse Generator",
    description: "Learn how Random Bible Verse Generator collects, uses, and protects minimal technical data. No targeted ads, no selling of data.",
    robots: { index: true, follow: true },
    alternates: {
      canonical: '/privacy',
      languages: {
        'en': '/privacy',
        'es': '/es/privacy',
        'x-default': '/privacy',
      },
    },
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
