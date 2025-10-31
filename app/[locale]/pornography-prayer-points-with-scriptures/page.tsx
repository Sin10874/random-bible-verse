"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Cormorant_Garamond } from "next/font/google";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

type PrayerPoint = {
  id: number;
  category: string;
  prayerPoint: string;
  scripture: string;
  reference: string;
};

export default function PornographyPrayerPage() {
  const locale = useLocale();
  const t = useTranslations('purityPrayer');
  const tCommon = useTranslations('common');

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prayer, setPrayer] = useState<PrayerPoint | null>(null);
  const [allPrayers, setAllPrayers] = useState<PrayerPoint[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const prayerDataFile = locale === "es" ? "/prayer-data-es.json" : "/prayer-data.json";
    fetch(prayerDataFile)
      .then((res) => res.json())
      .then((data) => setAllPrayers(data))
      .catch((err) => console.error("Failed to load prayer data:", err));
  }, [locale]);

  function getRandomPrayer() {
    setLoading(true);

    if (allPrayers.length === 0) {
      setLoading(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * allPrayers.length);
    const randomPrayer = allPrayers[randomIndex];

    setPrayer(randomPrayer);
    setOpen(true);
    setLoading(false);
  }

  async function copyPrayer() {
    if (!prayer) return;
    const payload = `${prayer.prayerPoint}\n\n"${prayer.scripture}"\n— ${prayer.reference}`;
    await navigator.clipboard.writeText(payload);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  }

  return (
    <div className="text-white bg-[#0b0f1a]">
      <section className="relative min-h-screen overflow-hidden">
        <Image
          src={process.env.NEXT_PUBLIC_HERO_URL || "/mountain-hero.jpg"}
          alt=""
          fill
          priority
          className="hidden sm:block object-cover"
          aria-hidden="true"
        />
        <Image
          src={process.env.NEXT_PUBLIC_HERO_MOBILE_URL || "/mountain-hero-mobile.jpg"}
          alt=""
          fill
          priority
          className="block sm:hidden object-cover object-[50%_30%]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
          <Link href={`/${locale}`} className="flex items-center gap-3 hover:opacity-80 transition">
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
          </Link>

          <LanguageSwitcher />
        </header>

        <main className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center">
          <p
            className={`${display.className} italic text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] drop-shadow-xl`}
          >
            {t('title')}
          </p>

          <p className={`${display.className} italic mt-8 md:mt-10 text-xl md:text-2xl opacity-90 drop-shadow max-w-3xl`}>
            {t('subtitle')}
          </p>

          <div className="mt-12 md:mt-14 flex items-center justify-center">
            <h2 className="sr-only">{t('generateButton')}</h2>
            <button
              onClick={getRandomPrayer}
              disabled={loading || allPrayers.length === 0}
              className="btn-primary cursor-pointer"
              aria-busy={loading}
            >
              {loading ? t('loading') : t('generateButton')}
            </button>
          </div>

          {open && prayer && (
            <div className="mx-auto mt-14 w-full max-w-2xl rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-6 md:p-8 text-left shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/80 px-3 py-1 rounded-full bg-white/10">
                  {prayer.category}
                </span>
                <button
                  className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  {t('closeButton')}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-white/70 mb-2">{t('prayerPointLabel')}</h3>
                  <p className="text-lg md:text-xl leading-relaxed font-medium">
                    {prayer.prayerPoint}
                  </p>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <h3 className="text-sm uppercase tracking-wider text-white/70 mb-2">{t('scriptureLabel')}</h3>
                  <blockquote className={`${display.className} italic text-xl md:text-2xl leading-snug font-medium`}>
                    "{prayer.scripture}"
                  </blockquote>
                  <div className="mt-3 text-white/80">— {prayer.reference}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={copyPrayer}
                  className="rounded-full bg-white/90 text-neutral-900 px-5 py-2 text-sm font-medium hover:bg-white shadow cursor-pointer transition active:scale-95"
                >
                  {t('copyButton')}
                </button>
              </div>
            </div>
          )}
        </main>
      </section>

      <section className="relative z-10 bg-gradient-to-b from-[#0b0f1a] via-[#0a0e17] to-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-16 md:py-20">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-sm space-y-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('whatAreTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('whatAreContent')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('howToUseTitle')}
              </h2>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-white/90 leading-relaxed">
                <li>{t('howToUseStep1')}</li>
                <li>{t('howToUseStep2')}</li>
                <li>{t('howToUseStep3')}</li>
                <li>{t('howToUseStep4')}</li>
                <li>{t('howToUseStep5')}</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('whyPowerfulTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('whyPowerfulContent')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('notAloneTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('notAloneContent')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('breakingFreeTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('breakingFreeContent')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('dailyPrayerTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('dailyPrayerContent')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('biblicalFoundationTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('biblicalFoundationContent')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {t('hopeHealingTitle')}
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                {t('hopeHealingContent')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-neutral-900 px-5 py-2 rounded-full shadow-md text-sm font-medium z-50">
          {tCommon('copied')}
        </div>
      )}

      <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl px-5 py-6 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white/70">
          <nav className="order-1 md:order-2 w-full md:w-auto">
            <ul className="flex justify-center md:justify-end items-center gap-6">
              <li><Link href={`/${locale}`} className="text-sm hover:text-white">{t('homeLink')}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="text-sm hover:text-white">{t('privacyLink')}</Link></li>
              <li><a href="mailto:randombibleverse@outlook.com" className="text-sm hover:text-white">{t('contactLink')}</a></li>
            </ul>
          </nav>
          <p className="order-2 md:order-1 text-center md:text-left text-xs md:text-sm">
            © 2025 {tCommon('siteName')}. {t('title')}.
          </p>
        </div>
      </footer>
    </div>
  );
}
