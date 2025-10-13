import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random Bible Verse Generator | Daily Scripture & Verse of the Day",
  description: "Get a random Bible verse instantly! This free scripture generator gives inspiring verses about faith, love, and hope—perfect for daily encouragement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
