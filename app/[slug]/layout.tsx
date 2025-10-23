import type { Metadata } from "next";
import { getGeneratorBySlug, GENERATORS } from "../data/generators";
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

  const title = `${generator.title} | Bible Verse Generator`;
  const description = `${generator.description}. Generate random ${generator.name.toLowerCase()} Bible verses instantly for daily inspiration and encouragement.`;
  const url = `/${generator.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      siteName: "BibleVerse Generator",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
