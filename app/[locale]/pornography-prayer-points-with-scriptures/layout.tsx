import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `/${locale}/pornography-prayer-points-with-scriptures`;

  // Get SEO data based on locale
  if (locale === 'es') {
    const t = await getTranslations({ locale: 'es', namespace: 'seo' });

    return {
      title: t('purityPrayer.title'),
      description: t('purityPrayer.description'),
      keywords: t('purityPrayer.keywords').split(', '),
      openGraph: {
        type: "website",
        url,
        siteName: "Generador de Versículos Bíblicos",
        title: t('purityPrayer.title'),
        description: t('purityPrayer.description'),
      },
      twitter: {
        card: "summary_large_image",
        title: t('purityPrayer.title'),
        description: t('purityPrayer.description'),
      },
      alternates: {
        canonical: url,
      },
    };
  }

  // English SEO (default)
  return {
    title: "Pornography Prayer Points with Scriptures | Overcome Addiction",
    description:
      "Powerful Scripture-based prayers to overcome pornography addiction. Bible verses for freedom, purity, and healing in Christ. Free prayer tool.",
    keywords: [
      "pornography prayer points with scriptures",
      "prayer against pornography",
      "overcome porn addiction prayer",
      "deliverance from pornography prayer",
      "prayer for sexual purity",
      "Bible verses against lust",
      "prayer points for purity",
      "spiritual warfare against pornography",
      "breaking pornography addiction",
      "Christian prayers for freedom",
    ],
    openGraph: {
      type: "website",
      url,
      siteName: "Bible Verse Generator",
      title: "Pornography Prayer Points with Scriptures | Overcome Addiction",
      description:
        "Powerful Scripture-based prayers with Bible verses for breaking free from addiction and walking in purity.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Pornography Prayer Points with Scriptures",
      description:
        "Scripture-based prayers to overcome pornography addiction and find freedom in Christ.",
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function PornographyPrayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
