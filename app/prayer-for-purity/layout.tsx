import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prayer Points for Purity with Scriptures | Overcome Pornography Addiction",
  description:
    "Powerful prayer points with Bible verses to overcome pornography addiction and find freedom, purity, and healing in Christ. Get instant spiritual guidance with Scripture-based prayers for cleansing, deliverance, strength, forgiveness, and renewal.",
  keywords: [
    "pornography prayer points",
    "prayer for purity",
    "overcome pornography addiction",
    "prayer against lust",
    "sexual purity prayers",
    "deliverance from pornography",
    "prayer points with scriptures",
    "Christian prayers for addiction",
    "freedom from sexual sin",
    "scripture-based prayers",
  ],
  openGraph: {
    type: "website",
    url: "/prayer-for-purity",
    siteName: "Bible Verse Generator",
    title: "Prayer Points for Purity with Scriptures | Overcome Pornography Addiction",
    description:
      "Get powerful prayer points with Bible verses to overcome pornography and walk in purity. Free Scripture-based prayers for freedom and healing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prayer Points for Purity with Scriptures | Overcome Addiction",
    description:
      "Scripture-based prayers to overcome pornography addiction and find freedom in Christ. Free spiritual guidance.",
  },
  alternates: {
    canonical: "/prayer-for-purity",
  },
};

export default function PrayerForPurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
