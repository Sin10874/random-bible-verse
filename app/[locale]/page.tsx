"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Cormorant_Garamond } from "next/font/google";
import { GENERATORS } from "../data/generators";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import StructuredData from "@/components/StructuredData";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap", // Optimize font loading performance
  preload: true,
  fallback: ['Georgia', 'serif'],
});

type Verse = { text: string; reference?: string };

export default function Page() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tGenerators = useTranslations('generators');
  const tAbout = useTranslations('about');
  const tFooter = useTranslations('footer');

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  async function fetchVerse() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/verse?locale=${locale}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setVerse({ text: data.text, reference: data.reference });
      setOpen(true);
    } catch {
      setError(tCommon('error'));
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
      {/* Structured Data for SEO */}
      <StructuredData
        type="WebSite"
        name={tCommon('siteName')}
        description={t('heroSubtitle')}
        url={`https://bibleverse-generator.org${locale === 'en' ? '' : `/${locale}`}`}
        locale={locale}
      />

      {/* ===== Hero：首屏使用背景图 ===== */}
      <section className="relative min-h-screen overflow-hidden">
        {/* 桌面背景 */}
        <Image
          src={process.env.NEXT_PUBLIC_HERO_URL || "/mountain-hero.jpg"}
          alt=""
          fill
          priority
          className="hidden sm:block object-cover"
          aria-hidden="true"
        />
        {/* 移动端背景（竖图） */}
        <Image
          src={process.env.NEXT_PUBLIC_HERO_MOBILE_URL || "/mountain-hero-mobile.jpg"}
          alt=""
          fill
          priority
          className="block sm:hidden object-cover object-[50%_30%]"
          aria-hidden="true"
        />
        {/* 暗化遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        {/* 底部过渡到纯色区 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        {/* 顶部导航（含 H1） */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt={`${tCommon('siteName')} Logo`}
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-sm"
            />
            <h1 className="font-semibold tracking-tight text-lg md:text-xl">
              {tCommon('siteName')}
            </h1>
          </div>

          {/* 顶部右侧：仅语言选择器 */}
          <LanguageSwitcher />
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
            {t('heroTitle')}
          </p>

          <p
            className={`${display.className} italic mt-8 md:mt-10 text-xl md:text-2xl opacity-90 drop-shadow`}
          >
            {t('heroSubtitle')}
          </p>

          <div className="mt-12 md:mt-14 flex items-center justify-center">
            <h2 className="sr-only">{t('generateButton')}</h2>
            <button
              onClick={fetchVerse}
              disabled={loading}
              className="btn-primary cursor-pointer"
              aria-busy={loading}
            >
              {loading ? tCommon('loading') : t('generateButton')}
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
                <span className="text-xs uppercase tracking-wider text-white/80">{t('generateButton')}</span>
                <button
                  className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  {t('closeButton')}
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
                  {t('copyButton')}
                </button>
              </div>
            </div>
          )}
        </main>
      </section>

      {/* ===== Trending Generators 模块 ===== */}
      <section
        className="relative z-10 bg-gradient-to-b from-[#0b0f1a] to-[#0a0e17] py-16 md:py-24"
        aria-label={t('trendingTitle')}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            {t('trendingTitle')}
          </h2>
          <p className="text-white/80 text-center max-w-2xl mx-auto mb-12 md:mb-16">
            {t('trendingSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {GENERATORS.map((generator) => (
              <Link
                key={generator.id}
                href={`/${locale}/${generator.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5
                         hover:bg-white/10 hover:border-white/20 transition-all duration-300
                         backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {/* 图片区域 */}
                <div className="relative h-56 md:h-64 overflow-hidden">
                  <Image
                    src={generator.image}
                    alt={tGenerators(generator.id)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* 标题 - 居中显示 */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-center drop-shadow-2xl leading-tight">
                      {tGenerators(generator.id)}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== About Section (Simplified - using translation keys) ===== */}
      <section
        className="relative z-10 bg-gradient-to-b from-[#0a0e17] via-[#0a0e17] to-[#0a0a0a]"
        aria-label="About this Bible verse generator"
      >
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-16 md:py-20">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-sm space-y-10">

            {/* What is section */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {tAbout('whatIsTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {tAbout('whatIsContent')}
              </p>
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {tAbout('howItWorksTitle')}
              </h2>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-white/90 leading-relaxed">
                <li>{tAbout('howItWorksStep1')}</li>
                <li>{tAbout('howItWorksStep2')}</li>
                <li>{tAbout('howItWorksStep3')}</li>
              </ol>
            </div>

            {/* What can you do */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {tAbout('whatCanYouDoTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {tAbout('whatCanYouDoContent') || 'Use this tool for daily inspiration, prayer, study, motivation, social sharing, and journaling.'}
              </p>
            </div>

            {/* Why use */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {tAbout('whyUseTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {tAbout('whyUseContent') || 'Rediscover the Bible, strengthen daily faith, deepen knowledge, stay connected with God, and end the day with peace.'}
              </p>
            </div>

            {/* Is free */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {tAbout('isFreeTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {tAbout('isFreeContent')}
              </p>
            </div>

            {/* Start now */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {tAbout('startNowTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {tAbout('startNowContent')}
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
          {tCommon('copied')}
        </div>
      )}

      {/* ===== Footer ===== */}
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
                  href={`/${locale}/privacy`}
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {tCommon('privacy')}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:randombibleverse@outlook.com"
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {tCommon('contactUs')}
                </a>
              </li>
            </ul>
          </nav>

          <p className="order-2 md:order-1 text-center md:text-left text-xs md:text-sm leading-relaxed">
            {tFooter('copyright')}
          </p>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </footer>
    </div>
  );
}
