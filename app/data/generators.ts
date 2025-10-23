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
    name: "Love",
    slug: "love-bible-verses",
    title: "Bible Verses About Love",
    description: "Discover God's love and verses about loving others",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "theme",
  },
  {
    id: "hope",
    name: "Hope",
    slug: "hope-bible-verses",
    title: "Bible Verses About Hope",
    description: "Find hope and encouragement in God's promises",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "theme",
  },
  {
    id: "strength",
    name: "Strength",
    slug: "strength-bible-verses",
    title: "Bible Verses About Strength",
    description: "Draw strength and courage from God's word",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "theme",
  },
  {
    id: "peace",
    name: "Peace",
    slug: "peace-bible-verses",
    title: "Bible Verses About Peace",
    description: "Experience God's peace in every circumstance",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "theme",
  },
  {
    id: "faith",
    name: "Faith",
    slug: "faith-bible-verses",
    title: "Bible Verses About Faith",
    description: "Strengthen your faith through Scripture",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "theme",
  },
  {
    id: "grief",
    name: "Grief",
    slug: "grief-bible-verses",
    title: "Bible Verses About Grief",
    description: "Find comfort in times of loss and sorrow",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "theme",
  },

  // Book-based generators
  {
    id: "psalms",
    name: "Psalms",
    slug: "psalms-bible-verses",
    title: "Random Verse from Psalms",
    description: "Experience worship and praise from the Book of Psalms",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "book",
  },
  {
    id: "proverbs",
    name: "Proverbs",
    slug: "proverbs-bible-verses",
    title: "Random Verse from Proverbs",
    description: "Gain wisdom from the Book of Proverbs",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "book",
  },
  {
    id: "john",
    name: "John",
    slug: "john-bible-verses",
    title: "Random Verse from Gospel of John",
    description: "Discover Jesus through the Gospel of John",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "book",
  },

  // Scenario-based generators
  {
    id: "prayer",
    name: "Prayer",
    slug: "prayer-bible-verses",
    title: "Bible Verses About Prayer",
    description: "Learn to pray through Scripture",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "scenario",
  },
  {
    id: "encouragement",
    name: "Encouragement",
    slug: "encouragement-bible-verses",
    title: "Bible Verses for Encouragement",
    description: "Be uplifted and encouraged by God's word",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "scenario",
  },
  {
    id: "comfort",
    name: "Comfort",
    slug: "comfort-bible-verses",
    title: "Bible Verses for Comfort",
    description: "Find peace and comfort in God's presence",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "scenario",
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving",
    slug: "thanksgiving-bible-verses",
    title: "Bible Verses About Thanksgiving",
    description: "Give thanks and praise to God",
    image: "/mountain-hero.jpg", // TODO: Replace with themed image
    category: "scenario",
  },
];

export function getGeneratorBySlug(slug: string): Generator | undefined {
  return GENERATORS.find((g) => g.slug === slug);
}

export function getGeneratorById(id: GeneratorCategory): Generator | undefined {
  return GENERATORS.find((g) => g.id === id);
}
