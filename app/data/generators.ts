export type GeneratorCategory =
  | "love"
  | "hope"
  | "strength"
  | "peace"
  | "faith"
  | "grief"
  | "prayer"
  | "encouragement"
  | "comfort"
  | "thanksgiving"
  | "psalms"
  | "proverbs"
  | "john";

export interface Generator {
  id: GeneratorCategory;
  name: string;
  slug: string;
  title: string; // For page title
  description: string;
  image: string;
  category: "theme" | "book" | "scenario";
}

export const GENERATORS: Generator[] = [
  // Theme-based generators
  {
    id: "love",
    name: "Bible Verses About Love",
    slug: "love-bible-verses",
    title: "Bible Verses About Love",
    description: "Discover God's love and verses about loving others",
    image: "/generators/love.jpg",
    category: "theme",
  },
  {
    id: "hope",
    name: "Bible Verses About Hope",
    slug: "hope-bible-verses",
    title: "Bible Verses About Hope",
    description: "Find hope and encouragement in God's promises",
    image: "/generators/hope.jpg",
    category: "theme",
  },
  {
    id: "strength",
    name: "Bible Verses About Strength",
    slug: "strength-bible-verses",
    title: "Bible Verses About Strength",
    description: "Draw strength and courage from God's word",
    image: "/generators/strength.jpg",
    category: "theme",
  },
  {
    id: "peace",
    name: "Bible Verses About Peace",
    slug: "peace-bible-verses",
    title: "Bible Verses About Peace",
    description: "Experience God's peace in every circumstance",
    image: "/generators/peace.jpg",
    category: "theme",
  },
  {
    id: "faith",
    name: "Bible Verses About Faith",
    slug: "faith-bible-verses",
    title: "Bible Verses About Faith",
    description: "Strengthen your faith through Scripture",
    image: "/generators/faith.jpg",
    category: "theme",
  },
  {
    id: "grief",
    name: "Bible Verses About Grief",
    slug: "grief-bible-verses",
    title: "Bible Verses About Grief",
    description: "Find comfort in times of loss and sorrow",
    image: "/generators/grief.jpg",
    category: "theme",
  },

  // Book-based generators
  {
    id: "psalms",
    name: "Bible Verses from Psalms",
    slug: "psalms-bible-verses",
    title: "Bible Verses from Psalms",
    description: "Experience worship and praise from the Book of Psalms",
    image: "/generators/psalms.jpg",
    category: "book",
  },
  {
    id: "proverbs",
    name: "Bible Verses from Proverbs",
    slug: "proverbs-bible-verses",
    title: "Bible Verses from Proverbs",
    description: "Gain wisdom from the Book of Proverbs",
    image: "/generators/proverbs.jpg",
    category: "book",
  },
  {
    id: "john",
    name: "Bible Verses from John",
    slug: "john-bible-verses",
    title: "Bible Verses from Gospel of John",
    description: "Discover Jesus through the Gospel of John",
    image: "/generators/john.jpg",
    category: "book",
  },

  // Scenario-based generators
  {
    id: "prayer",
    name: "Bible Verses About Prayer",
    slug: "prayer-bible-verses",
    title: "Bible Verses About Prayer",
    description: "Learn to pray through Scripture",
    image: "/generators/prayer.jpg",
    category: "scenario",
  },
  {
    id: "encouragement",
    name: "Bible Verses for Encouragement",
    slug: "encouragement-bible-verses",
    title: "Bible Verses for Encouragement",
    description: "Be uplifted and encouraged by God's word",
    image: "/generators/encouragement.jpg",
    category: "scenario",
  },
  {
    id: "comfort",
    name: "Bible Verses for Comfort",
    slug: "comfort-bible-verses",
    title: "Bible Verses for Comfort",
    description: "Find peace and comfort in God's presence",
    image: "/generators/comfort.jpg",
    category: "scenario",
  },
  {
    id: "thanksgiving",
    name: "Bible Verses About Thanksgiving",
    slug: "thanksgiving-bible-verses",
    title: "Bible Verses About Thanksgiving",
    description: "Give thanks and praise to God",
    image: "/generators/thanksgiving.jpg",
    category: "scenario",
  },
];

export function getGeneratorBySlug(slug: string): Generator | undefined {
  return GENERATORS.find((g) => g.slug === slug);
}

export function getGeneratorById(id: GeneratorCategory): Generator | undefined {
  return GENERATORS.find((g) => g.id === id);
}
