"use client";

import { useState } from "react";
import { Cormorant_Garamond } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

type Verse = { text: string; reference?: string };

export default function Page() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchVerse() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/verse", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setVerse({ text: data.text, reference: data.reference });
      setOpen(true);
    } catch (e) {
      setError("Oops, failed to load. Try again.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function copyVerse() {
    if (!verse) return;
    const payload = verse.reference ? `${verse.text} — ${verse.reference}` : verse.text;
    await navigator.clipboard.writeText(payload);
    alert("Copied!");
  }

  async function shareVerse() {
    if (!verse) return;
    const payload = verse.reference ? `${verse.text} — ${verse.reference}` : verse.text;
    if (navigator.share) {
      try { await navigator.share({ text: payload }); } catch {}
    } else {
      await navigator.clipboard.writeText(payload);
      alert("No Web Share on this device. Copied instead!");
    }
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* 背景图：public/mountain-hero.jpg；或用 NEXT_PUBLIC_HERO_URL 覆盖 */}
      <img
        src={process.env.NEXT_PUBLIC_HERO_URL || "/mountain-hero.jpg"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />

      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"
        aria-hidden="true"
      />

      {/* 顶部导航（极简） */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-white/20 ring-1 ring-white/30" aria-hidden="true" />
          <span className="font-semibold tracking-tight">VerseGen</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <a href="#overview" className="hover:text-white transition">Overview</a>
          <a href="#plans" className="hover:text-white transition">Plans</a>
          <a href="#get" className="ml-2 rounded-full border border-white/30 px-4 py-2 hover:bg-white/10 transition">Get the app</a>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 pt-16 md:pt-24 pb-24 text-center">
        <h1 className={`${display.className} italic text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] drop-shadow-xl`}>
          Trust God.
        </h1>
        <p className={`${display.className} italic mt-5 md:mt-6 text-xl md:text-2xl opacity-90 drop-shadow`}>
          Daily verse, in a click.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={fetchVerse}
            disabled={loading}
            className="rounded-full bg-white/90 text-neutral-900 px-8 md:px-10 py-3 md:py-4 text-base md:text-lg font-medium shadow hover:bg-white disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {loading ? "Loading..." : "Random Bible Verse"}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-auto mt-6 max-w-lg text-red-200 bg-red-900/40 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Verse 卡片 */}
        {open && verse && (
          <div className="mx-auto mt-14 w-full max-w-2xl rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-6 md:p-8 text-left shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/80">Random Verse</span>
              <button
                className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <blockquote className="text-2xl md:text-3xl leading-snug font-medium">
              {verse.text}
            </blockquote>
            {verse.reference && (
              <div className="mt-4 text-white/80">— {verse.reference}</div>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={copyVerse} className="rounded-full bg-white/90 text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-white">Copy</button>
              <button onClick={shareVerse} className="rounded-full bg-white/90 text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-white">Share</button>
              <button onClick={fetchVerse} className="rounded-full border border-white/70 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">New Verse</button>
            </div>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/80">
          <p>© {new Date().getFullYear()} VerseGen. Built with ❤️ for reflection.</p>
          <div className="flex items-center gap-5">
            <a href="#privacy" className="hover:text-white">Privacy</a>
            <a href="#terms" className="hover:text-white">Terms</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
