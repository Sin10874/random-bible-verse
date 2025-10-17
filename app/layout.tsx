// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bibleverse-generator.org"),
  title: {
    default: "Random Bible Verse Generator | Daily Scripture & Verse of the Day",
    template: "%s | BibleVerse Generator",
  },
  description:
    "Get a random Bible verse instantly! This free scripture generator gives inspiring verses about faith, love, and hope—perfect for daily encouragement.",

  // ✅ 图标配置（包含 favicon、apple-touch-icon）
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.png"],
  },

  // ✅ PWA / manifest 支持
  manifest: "/site.webmanifest",

  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "BibleVerse Generator",
    title: "Random Bible Verse Generator | Daily Scripture & Verse of the Day",
    description:
      "Get a random Bible verse instantly for daily encouragement, faith, love and hope.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Bible Verse Generator | Daily Scripture & Verse of the Day",
    description:
      "Get a random Bible verse instantly for daily encouragement, faith, love and hope.",
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}