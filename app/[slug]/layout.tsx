import type { Metadata } from "next";
import { getGeneratorBySlug, GENERATORS, Generator } from "../data/generators";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const generator = getGeneratorBySlug(params.slug);

  if (!generator) {
    return {
      title: "Not Found",
    };
  }

  // Optimized SEO titles and descriptions
  const seoData = getSEOData(generator);
  const url = `/${generator.slug}`;

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
      siteName: "Bible Verse Generator",
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
function getSEOData(generator: Generator) {
  const year = new Date().getFullYear();

  const seoMap: Record<string, { title: string; ogTitle: string; description: string; keywords: string[] }> = {
    love: {
      title: `105 Bible Verses About Love - Scripture on God's Love ${year}`,
      ogTitle: "Bible Verses About Love | Discover God's Unconditional Love",
      description: `Discover powerful Bible verses about love from Scripture. Read what God says about His love for us and how to love others. Find inspiration from 1 Corinthians 13, John 3:16, and more.`,
      keywords: ["bible verses about love", "scripture on love", "God's love verses", "1 Corinthians 13", "love bible quotes"]
    },
    hope: {
      title: `93 Bible Verses About Hope - Scripture for Encouragement ${year}`,
      ogTitle: "Bible Verses About Hope | Find Hope in God's Promises",
      description: `Find encouragement with Bible verses about hope. Discover God's promises and renew your faith during difficult times. Read inspiring hope scriptures from Romans, Psalms, and more.`,
      keywords: ["bible verses about hope", "hope scriptures", "verses for encouragement", "God's promises", "hope in hard times"]
    },
    strength: {
      title: `85 Bible Verses About Strength - Find Courage in Scripture ${year}`,
      ogTitle: "Bible Verses About Strength | Draw Power from God's Word",
      description: `Draw strength and courage from powerful Bible verses. Find God's strength in times of weakness and difficulty. Read scriptures from Philippians 4:13, Isaiah 40:31, and more.`,
      keywords: ["bible verses about strength", "strength scriptures", "verses for courage", "God's strength", "Isaiah 40:31"]
    },
    peace: {
      title: `91 Bible Verses About Peace - Experience God's Peace ${year}`,
      ogTitle: "Bible Verses About Peace | Find Peace in Every Circumstance",
      description: `Experience God's peace with powerful Bible verses. Find peace that surpasses understanding in every situation. Read scriptures from Philippians 4:6-7, John 14:27, and more.`,
      keywords: ["bible verses about peace", "peace scriptures", "God's peace", "Philippians 4:7", "peace of mind verses"]
    },
    faith: {
      title: `78 Bible Verses About Faith - Strengthen Your Faith ${year}`,
      ogTitle: "Bible Verses About Faith | Build Unshakeable Faith in God",
      description: `Strengthen your faith with powerful Bible verses. Learn what faith means and how to trust God completely. Read scriptures from Hebrews 11:1, Mark 11:22, and more.`,
      keywords: ["bible verses about faith", "faith scriptures", "Hebrews 11", "faith and trust", "growing in faith"]
    },
    grief: {
      title: `72 Bible Verses About Grief - Find Comfort in Loss ${year}`,
      ogTitle: "Bible Verses About Grief | Comfort for Times of Sorrow",
      description: `Find comfort in Bible verses about grief and loss. God draws near to the brokenhearted and offers healing. Read comforting scriptures from Psalms, 2 Corinthians, and more.`,
      keywords: ["bible verses about grief", "grief scriptures", "comfort in loss", "verses for mourning", "healing from loss"]
    },
    psalms: {
      title: `Psalms Bible Verses - 150 Chapters of Worship & Praise ${year}`,
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
      title: `65 Bible Verses About Prayer - Learn to Pray Scripture ${year}`,
      ogTitle: "Bible Verses About Prayer | Strengthen Your Prayer Life",
      description: `Learn to pray with powerful Bible verses about prayer. Discover what God says about communicating with Him. Read scriptures from Matthew 6, Philippians 4, and more.`,
      keywords: ["bible verses about prayer", "prayer scriptures", "how to pray", "power of prayer", "prayer verses"]
    },
    encouragement: {
      title: `127 Encouraging Bible Verses - Uplifting Scripture ${year}`,
      ogTitle: "Encouraging Bible Verses | Be Uplifted by God's Word",
      description: `Find uplifting encouragement with powerful Bible verses. Be renewed and strengthened by God's promises. Read encouraging scriptures from Psalms, Isaiah, Romans, and more.`,
      keywords: ["encouraging bible verses", "uplifting scriptures", "verses for encouragement", "motivational bible quotes", "inspirational verses"]
    },
    thanksgiving: {
      title: `98 Thanksgiving Bible Verses - Give Thanks to God ${year}`,
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
  return GENERATORS.map((generator) => ({
    slug: generator.slug,
  }));
}

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
