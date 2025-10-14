"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [showToast, setShowToast] = useState(false);

  async function fetchVerse() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/verse", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setVerse({ text: data.text, reference: data.reference });
      setOpen(true);
    } catch {
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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  }

  return (
    <div className="text-white bg-[#0b0f1a]">
      {/* ===== Hero：首屏使用背景图 ===== */}
      <section className="relative min-h-screen overflow-hidden">
        {/* 桌面背景 */}
        <img
          src={process.env.NEXT_PUBLIC_HERO_URL || "/mountain-hero.jpg"}
          alt=""
          className="absolute inset-0 hidden sm:block h-full w-full object-cover"
          aria-hidden="true"
        />
        {/* 移动端背景（竖图） */}
        <img
          src={process.env.NEXT_PUBLIC_HERO_MOBILE_URL || "/mountain-hero-mobile.jpg"}
          alt=""
          className="absolute inset-0 block sm:hidden h-full w-full object-cover object-[50%_30%]"
          aria-hidden="true"
        />
        {/* 暗化遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        {/* 底部过渡到纯色区 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        {/* 顶部导航（含 H1） */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Bible Verse Generator Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-sm"
            />
            <h1 className="font-semibold tracking-tight text-lg md:text-xl">
              Bible Verse Generator
            </h1>
          </div>

          {/* 顶部右侧：仅保留 Contact Us 图标按钮 */}
          <a
            href="mailto:randombibleverse@outlook.com"
            className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20
                       ring-1 ring-white/25 p-2 backdrop-blur transition cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Contact Us"
            title="Contact Us"
          >
            {/* Envelope Icon */}
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {/* 如需桌面显示文字，解开下一行注释： */}
            {/* <span className="hidden md:inline ml-2 text-sm">Contact</span> */}
          </a>
        </header>

        {/* Hero 内容 —— 垂直居中 */}
        <main
          className="relative z-10 mx-auto max-w-5xl px-6 md:px-10
                     min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center"
        >
          <p
            className={`${display.className} italic text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] drop-shadow-xl`}
            aria-hidden="true"
          >
            Trust God.
          </p>

          <p
            className={`${display.className} italic mt-8 md:mt-10 text-xl md:text-2xl opacity-90 drop-shadow`}
          >
            Find strength and peace through God’s word — one verse at a time.
          </p>

          <div className="mt-12 md:mt-14 flex items-center justify-center">
            <h2 className="sr-only">Random Bible Verse</h2>
            <button
              onClick={fetchVerse}
              disabled={loading}
              className="btn-primary cursor-pointer"
              aria-busy={loading}
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
                  className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>

              <blockquote
                className={`${display.className} italic text-2xl md:text-3xl leading-snug font-medium
                underline decoration-dashed decoration-white/80 decoration-2
                underline-offset-[6px] md:underline-offset-[8px]`}
              >
                {verse.text}
              </blockquote>
              {verse.reference && (
                <div className="mt-4 text-white/80">— {verse.reference}</div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={copyVerse}
                  className="rounded-full bg-white/90 text-neutral-900 px-5 py-2 text-sm font-medium hover:bg-white shadow cursor-pointer transition active:scale-95"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </main>
      </section>

      {/* ===== 下面的内容区：纯色/渐变背景，支持滚动 ===== */}
      <section
        className="relative z-10 bg-gradient-to-b from-[#0b0f1a] via-[#0a0e17] to-[#0a0a0a]"
        aria-label="About this Bible verse generator"
      >
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-16 md:py-20">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-sm space-y-10">
            {/* H2: What This Generator Does */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                What is Bible Verse Generator?
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                Get a random Bible verse in one click. Use this free random scripture generator to
                discover daily Bible verses about faith, love, hope, strength, and peace. Save your
                favorites or come back anytime for more inspiration.
              </p>
            </div>

            {/* H2: How It Works */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How It Works?</h2>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-white/90 leading-relaxed">
                <li>Click Generate Verse to instantly receive a random Bible verse.</li>
                <li>Copy to share your verse with friends, family, or on social media.</li>
                <li>Begin your Verse of the Day habit for daily reflection and encouragement.</li>
              </ol>
            </div>

            {/* H2: What Can You Do... */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                What Can You Do With This Bible Verse Generator?
              </h2>

              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">For Daily Inspiration</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Start your morning with a daily Bible verse that brings clarity, strength, and
                    peace. Whether you’re at home, commuting, or working, a single verse helps you
                    stay mindful of God’s word.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">For Prayer and Devotion</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Use the generator to find a verse that speaks to your heart before prayer. Many
                    believers use random scriptures as prompts for devotion and reflection.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    For Study and Sermon Preparation
                  </h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Teachers, students, and pastors can use this tool to find verses related to
                    faith, forgiveness, and wisdom—perfect for sermon notes and Bible study
                    discussions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    For Motivation and Emotional Healing
                  </h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Find comfort and courage in verses about anxiety, stress, or fear. A random
                    Bible verse can bring peace and guidance exactly when you need it.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    For Social Media and Sharing
                  </h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Share uplifting Bible quotes on Instagram, Facebook, or X. Encourage others by
                    spreading God’s word in small, meaningful ways.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    For Journaling and Reflection
                  </h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Write down your daily verse and note what it means to you. Over time, you’ll
                    create a personal record of your spiritual journey and growth.
                  </p>
                </div>
              </div>
            </div>

            {/* H2: Why Use a Random Bible Verse Generator */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Why Use a Random Bible Verse Generator？
              </h2>

              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Rediscover the Bible</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Random Bible verses help you explore Scripture beyond your usual favorites. Each
                    verse opens a new door to wisdom and reflection, reminding you how alive God’s
                    Word truly is.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Strengthen Daily Faith</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Reading a daily Bible verse keeps your heart focused and your mind grounded.
                    Reflecting on one passage at a time makes it easier to apply God’s teachings
                    throughout the day.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Deepen Bible Knowledge</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Generating random verses helps you revisit familiar passages and learn new ones.
                    It’s a simple, effective way to grow your understanding of the Bible and
                    strengthen your relationship with God.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Stay Connected with God</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Even in a busy life, reading just one verse takes seconds but keeps your spirit
                    connected to God. A moment with Scripture can realign your heart with His
                    purpose.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">End the Day with Peace</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Close your day by reading a Bible verse before sleep. Let God’s Word rest in
                    your mind and heart, bringing calm, clarity, and deeper understanding.
                  </p>
                </div>
              </div>
            </div>

            {/* H2: Is This Tool Free */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Is This Tool Free？</h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                Yes — this Bible verse generator is completely free to use. No sign-ups, no
                downloads, no limits. Simply click Generate Verse, and a new Bible verse will appear
                instantly to inspire your day.
              </p>
            </div>

            {/* H2: Start Now */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Start Now</h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                Generate a random Bible verse and begin your Verse of the Day journey — free, fast,
                and always uplifting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Copy Toast */}
      {showToast && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     bg-white/90 text-neutral-900 px-5 py-2 rounded-full
                     shadow-md text-sm font-medium
                     transition-opacity duration-300 animate-fadeInOut
                     z-50"
        >
          ✅ Copied
        </div>
      )}

      {/* ===== 底部（Mobile 友好） ===== */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0a]">
        <div
          className="mx-auto max-w-5xl
               px-5 py-6 md:px-10 md:py-10
               flex flex-col md:flex-row
               md:items-center md:justify-between
               gap-4 md:gap-5
               text-white/70"
        >
          <nav className="order-1 md:order-2 w-full md:w-auto">
            <ul className="flex justify-center md:justify-end items-center gap-6">
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:randombibleverse@outlook.com"
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          <p className="order-2 md:order-1 text-center md:text-left text-xs md:text-sm leading-relaxed">
            © {new Date().getFullYear()} Bible Verse Generator. Built with ❤️ for reflection.
          </p>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </footer>
    </div>
  );
}
