import type { Metadata } from "next";
import { getGeneratorBySlug, GENERATORS, Generator } from "../../data/generators";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const generator = getGeneratorBySlug(slug);

  if (!generator) {
    return {
      title: "Not Found",
    };
  }

  // Get SEO data based on locale
  const seoData = await getSEOData(generator, locale);
  const url = `/${locale}/${generator.slug}`;
  const siteName = locale === 'es' ? 'Generador de Versículos Bíblicos' : 'Bible Verse Generator';

  return {
    title: seoData.title,
    description: seoData.description,
    alternates: {
      canonical: url,
    },
    keywords: seoData.keywords,
    openGraph: {
      type: "website",
      url,
      siteName,
      title: seoData.ogTitle,
      description: seoData.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.ogTitle,
      description: seoData.description,
    },
  };
}

// SEO-optimized metadata for each generator
async function getSEOData(generator: Generator, locale: string) {
  const year = new Date().getFullYear();

  // For Spanish, use translations from es.json
  if (locale === 'es') {
    const t = await getTranslations({ locale: 'es', namespace: 'seo' });
    const generatorKey = generator.id === 'purity' ? 'purityPrayer' : generator.id;

    return {
      title: t(`${generatorKey}.title`),
      ogTitle: t(`${generatorKey}.title`),
      description: t(`${generatorKey}.description`),
      keywords: t(`${generatorKey}.keywords`).split(', ')
    };
  }

  // English SEO data (default)

  const seoMap: Record<string, { title: string; ogTitle: string; description: string; keywords: string[] }> = {
    love: {
      title: `Bible Verses About Love - Scripture on God's Love ${year}`,
      ogTitle: "Bible Verses About Love | Discover God's Unconditional Love",
      description: `Discover powerful Bible verses about love from Scripture. Read what God says about His love for us and how to love others. Find inspiration from 1 Corinthians 13, John 3:16, and more.`,
      keywords: ["bible verses about love", "scripture on love", "God's love verses", "1 Corinthians 13", "love bible quotes"]
    },
    hope: {
      title: `Bible Verses About Hope - Scripture for Encouragement ${year}`,
      ogTitle: "Bible Verses About Hope | Find Hope in God's Promises",
      description: `Find encouragement with Bible verses about hope. Discover God's promises and renew your faith during difficult times. Read inspiring hope scriptures from Romans, Psalms, and more.`,
      keywords: ["bible verses about hope", "hope scriptures", "verses for encouragement", "God's promises", "hope in hard times"]
    },
    strength: {
      title: `Bible Verses About Strength - Find Courage in Scripture ${year}`,
      ogTitle: "Bible Verses About Strength | Draw Power from God's Word",
      description: `Draw strength and courage from powerful Bible verses. Find God's strength in times of weakness and difficulty. Read scriptures from Philippians 4:13, Isaiah 40:31, and more.`,
      keywords: ["bible verses about strength", "strength scriptures", "verses for courage", "God's strength", "Isaiah 40:31"]
    },
    peace: {
      title: `Bible Verses About Peace - Experience God's Peace ${year}`,
      ogTitle: "Bible Verses About Peace | Find Peace in Every Circumstance",
      description: `Experience God's peace with powerful Bible verses. Find peace that surpasses understanding in every situation. Read scriptures from Philippians 4:6-7, John 14:27, and more.`,
      keywords: ["bible verses about peace", "peace scriptures", "God's peace", "Philippians 4:7", "peace of mind verses"]
    },
    faith: {
      title: `Bible Verses About Faith - Strengthen Your Faith ${year}`,
      ogTitle: "Bible Verses About Faith | Build Unshakeable Faith in God",
      description: `Strengthen your faith with powerful Bible verses. Learn what faith means and how to trust God completely. Read scriptures from Hebrews 11:1, Mark 11:22, and more.`,
      keywords: ["bible verses about faith", "faith scriptures", "Hebrews 11", "faith and trust", "growing in faith"]
    },
    grief: {
      title: `Bible Verses About Grief - Find Comfort in Loss ${year}`,
      ogTitle: "Bible Verses About Grief | Comfort for Times of Sorrow",
      description: `Find comfort in Bible verses about grief and loss. God draws near to the brokenhearted and offers healing. Read comforting scriptures from Psalms, 2 Corinthians, and more.`,
      keywords: ["bible verses about grief", "grief scriptures", "comfort in loss", "verses for mourning", "healing from loss"]
    },
    psalms: {
      title: `Psalms Bible Verses - Worship & Praise ${year}`,
      ogTitle: "Psalms Bible Verses | Experience Worship Through Scripture",
      description: `Discover the beauty of Psalms with our verse generator. Experience worship, praise, and honest prayers from King David and other psalmists. Perfect for daily devotion.`,
      keywords: ["psalms bible verses", "book of psalms", "psalm scriptures", "worship verses", "David's psalms"]
    },
    proverbs: {
      title: `Proverbs Bible Verses - Wisdom for Daily Living ${year}`,
      ogTitle: "Proverbs Bible Verses | Gain Biblical Wisdom",
      description: `Gain wisdom with Proverbs Bible verses. Discover practical guidance for life, relationships, and decision-making from Solomon's timeless wisdom. Perfect for daily inspiration.`,
      keywords: ["proverbs bible verses", "book of proverbs", "wisdom verses", "Solomon's wisdom", "practical wisdom"]
    },
    john: {
      title: `John Bible Verses - Gospel of John Scripture ${year}`,
      ogTitle: "John Bible Verses | Discover Jesus Through Scripture",
      description: `Discover Jesus through the Gospel of John. Read about His miracles, teachings, and divine nature. Find verses from John 3:16, John 14, and other powerful passages.`,
      keywords: ["gospel of john", "john bible verses", "John 3:16", "Jesus in John", "gospel scriptures"]
    },
    prayer: {
      title: `Bible Verses About Prayer - Learn to Pray Scripture ${year}`,
      ogTitle: "Bible Verses About Prayer | Strengthen Your Prayer Life",
      description: `Learn to pray with powerful Bible verses about prayer. Discover what God says about communicating with Him. Read scriptures from Matthew 6, Philippians 4, and more.`,
      keywords: ["bible verses about prayer", "prayer scriptures", "how to pray", "power of prayer", "prayer verses"]
    },
    encouragement: {
      title: `Encouraging Bible Verses - Uplifting Scripture ${year}`,
      ogTitle: "Encouraging Bible Verses | Be Uplifted by God's Word",
      description: `Find uplifting encouragement with powerful Bible verses. Be renewed and strengthened by God's promises. Read encouraging scriptures from Psalms, Isaiah, Romans, and more.`,
      keywords: ["encouraging bible verses", "uplifting scriptures", "verses for encouragement", "motivational bible quotes", "inspirational verses"]
    },
    thanksgiving: {
      title: `Thanksgiving Bible Verses - Give Thanks to God ${year}`,
      ogTitle: "Thanksgiving Bible Verses | Cultivate Gratitude Through Scripture",
      description: `Celebrate thanksgiving with Bible verses about gratitude and praise. Learn to give thanks in all circumstances. Read scriptures from 1 Thessalonians 5:18, Psalms 100, and more.`,
      keywords: ["thanksgiving bible verses", "gratitude scriptures", "thankful verses", "giving thanks", "praise verses"]
    },
  };

  return seoMap[generator.id] || {
    title: `${generator.title} | Bible Verse Generator`,
    ogTitle: generator.title,
    description: generator.description,
    keywords: [generator.name.toLowerCase(), "bible verses", "scripture", "bible quotes"]
  };
}

export async function generateStaticParams() {
  const locales = ['en', 'es', 'pt', 'zh', 'tl', 'fr'];
  const params = [];

  for (const locale of locales) {
    for (const generator of GENERATORS) {
      params.push({
        locale,
        slug: generator.slug,
      });
    }
  }

  return params;
}

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
