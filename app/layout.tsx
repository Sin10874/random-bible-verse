import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerseGen — Random Bible Verse",
  description: "Trust God. Daily verse, in a click.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
