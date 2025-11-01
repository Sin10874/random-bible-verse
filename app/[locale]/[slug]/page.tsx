"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Cormorant_Garamond } from "next/font/google";
import { getGeneratorBySlug, Generator } from "../../data/generators";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap", // Optimize font loading performance
  preload: true,
  fallback: ['Georgia', 'serif'],
});

type Verse = { text: string; reference?: string };

interface GeneratorPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default function GeneratorPage({ params }: GeneratorPageProps) {
  const { slug } = use(params);
  const locale = useLocale();
  const t = useTranslations("generatorContent");
  const tCommon = useTranslations("common");
  const tGenerators = useTranslations("generators");
  const tDescriptions = useTranslations("generatorDescriptions");
  const generator = getGeneratorBySlug(slug);

  if (!generator) {
    notFound();
  }

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  async function fetchVerse() {
    if (!generator) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/verse?category=${generator.id}&locale=${locale}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setVerse({ text: data.text, reference: data.reference });
      setOpen(true);
    } catch {
      setError(t("ui.error"));
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
        <Image
          src={generator.image}
          alt=""
          fill
          priority
          className="hidden sm:block object-cover"
          aria-hidden="true"
        />
        {/* 移动端背景 */}
        <Image
          src={generator.image}
          alt=""
          fill
          priority
          className="block sm:hidden object-cover object-center"
          aria-hidden="true"
        />
        {/* 暗化遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        {/* 底部过渡到纯色区 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        {/* 顶部导航 */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
          <Link href={`/${locale}`} className="flex items-center gap-3 hover:opacity-80 transition">
            <Image
              src="/logo.svg"
              alt="Bible Verse Generator Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-sm"
            />
            <span className="font-semibold tracking-tight text-lg md:text-xl">
              {tCommon("siteName")}
            </span>
          </Link>

          <LanguageSwitcher />
        </header>

        {/* Hero 内容 */}
        <main
          className="relative z-10 mx-auto max-w-5xl px-6 md:px-10
                     min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center"
        >
          <h1
            className={`${display.className} italic text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] drop-shadow-xl px-4`}
          >
            {tGenerators(generator.id)}
          </h1>

          <p
            className={`${display.className} italic mt-6 sm:mt-8 md:mt-10 text-lg sm:text-xl md:text-2xl opacity-90 drop-shadow max-w-3xl px-4`}
          >
            {locale === "es" ? tDescriptions(generator.id) : generator.description}
          </p>

          <div className="mt-12 md:mt-14 flex items-center justify-center">
            <button
              onClick={fetchVerse}
              disabled={loading}
              className="btn-primary cursor-pointer"
              aria-busy={loading}
            >
              {loading ? t("ui.loading") : t("ui.generateButton")}
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
            <div className="mx-auto mt-10 sm:mt-14 w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-5 sm:p-6 md:p-8 text-left shadow-lg">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm uppercase tracking-wider text-white/80 truncate">{tGenerators(generator.id)} {t("ui.verseLabel")}</span>
                <button
                  className="rounded-full border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-white/10 cursor-pointer transition shrink-0 touch-manipulation"
                  onClick={() => setOpen(false)}
                  aria-label="Close verse"
                >
                  {t("ui.closeButton")}
                </button>
              </div>

              <blockquote
                className={`${display.className} italic text-xl sm:text-2xl md:text-3xl leading-relaxed sm:leading-snug font-medium
                underline decoration-dashed decoration-white/80 decoration-2
                underline-offset-[6px] md:underline-offset-[8px]`}
              >
                {verse.text}
              </blockquote>
              {verse.reference && (
                <div className="mt-4 text-sm sm:text-base text-white/80">— {verse.reference}</div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={copyVerse}
                  className="rounded-full bg-white/90 text-neutral-900 px-6 py-2.5 text-sm sm:text-base font-medium hover:bg-white shadow cursor-pointer transition active:scale-95 touch-manipulation min-h-[44px]"
                  aria-label="Copy verse to clipboard"
                >
                  {t("ui.copyButton")}
                </button>
              </div>
            </div>
          )}
        </main>
      </section>

      {/* ===== 内容介绍区 ===== */}
      <section
        className="relative z-10 bg-gradient-to-b from-[#0b0f1a] via-[#0a0e17] to-[#0a0a0a]"
        aria-label={`About ${generator.name} Bible verses`}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10 py-12 sm:py-16 md:py-20">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 md:p-10 backdrop-blur-sm space-y-8 sm:space-y-10">
            {getContentForGenerator(generator, t, tGenerators)}
          </div>
        </div>
      </section>

      {/* ===== Copy Toast ===== */}
      {showToast && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     bg-white/90 text-neutral-900 px-5 py-2 rounded-full
                     shadow-md text-sm font-medium
                     transition-opacity duration-300 animate-fadeInOut
                     z-50"
        >
          {t("ui.copied")}
        </div>
      )}

      {/* ===== 底部 ===== */}
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
                  href={`/${locale}`}
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {t("ui.home")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {t("ui.privacy")}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:randombibleverse@outlook.com"
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {t("ui.contactUs")}
                </a>
              </li>
            </ul>
          </nav>

          <p className="order-2 md:order-1 text-center md:text-left text-xs md:text-sm leading-relaxed">
            {t("ui.footerCopyright")}
          </p>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </footer>
    </div>
  );
}

// ===== 为每个生成器生成内容 =====
function getContentForGenerator(
  generator: Generator,
  t: (key: string, params?: Record<string, string>) => string | { raw: (key: string) => GeneratorContent },
  tGenerators: (key: string) => string
) {
  const content = (t as unknown as { raw: (key: string) => GeneratorContent }).raw(`${generator.id}`);

  return (
    <>
      {/* Section 1: Introduction */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          {content.h2Intro}
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
          {content.intro}
        </p>
      </div>

      {/* Section 2: Benefits */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          {content.h2Benefits}
        </h2>
        <div className="mt-4 sm:mt-5 space-y-5 sm:space-y-6">
          {content.benefits.map((benefit: { title: string; description: string }, idx: number) => (
            <div key={idx}>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight">{benefit.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-white/90 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: How to Use */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          {t("sections.howToUseTitle") as string}
        </h2>
        <ol className="mt-3 sm:mt-4 list-decimal list-inside space-y-2 sm:space-y-2.5 text-sm sm:text-base text-white/90 leading-relaxed">
          <li>{t("sections.howToUseStep1") as string}</li>
          <li>{t("sections.howToUseStep2") as string}</li>
          <li>{t("sections.howToUseStep3") as string}</li>
          <li>{t("sections.howToUseStep4") as string}</li>
        </ol>
      </div>

      {/* Section 4: Call to Action */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          {t("sections.callToActionTitle", { name: tGenerators(generator.id) }) as string}
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
          {t("sections.callToActionContent", { name: tGenerators(generator.id).toLowerCase() }) as string}
        </p>
      </div>

      {/* Additional SEO Content */}
      {content.additionalSections?.map((section: { title: string; content: string }, idx: number) => (
        <div key={idx}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
            {section.title}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
            {section.content}
          </p>
        </div>
      ))}
    </>
  );
}

type GeneratorContent = {
  h2Intro: string;
  h2Benefits: string;
  intro: string;
  benefits: Array<{ title: string; description: string }>;
  additionalSections?: Array<{ title: string; content: string }>;
};

