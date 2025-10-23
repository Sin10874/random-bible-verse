// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script"; // ✅ 新增
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
  // Next.js 会自动处理 app/favicon.ico 和 app/icon.png
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
};

// ✅ Viewport 配置（Next.js 15+ 要求）
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        {/* ✅ Google Analytics (GA4) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-14SYS6MEDE"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-14SYS6MEDE', { page_path: window.location.pathname });
            `,
          }}
        />
      </body>
    </html>
  );
}