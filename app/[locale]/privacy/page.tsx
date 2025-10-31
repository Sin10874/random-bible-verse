// app/privacy/page.tsx
"use client";

import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

export default function PrivacyPage() {
  const locale = useLocale();
  const t = useTranslations("privacy");

  return (
    <div className="text-white bg-[#0b0f1a]">
      {/* 顶部区域（保持与站点风格一致） */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-10 md:pt-14">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center text-white/80 hover:text-white transition"
              aria-label={t("backToHome")}
            >
              ← {t("backToHome")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </section>

      {/* 正文 */}
      <main className="mx-auto max-w-4xl px-6 md:px-10 py-12 md:py-16">
        <header className="mb-8 md:mb-10">
          <h1
            className={`${display.className} italic text-4xl md:text-5xl font-semibold tracking-tight leading-tight drop-shadow`}
          >
            {t("title")}
          </h1>
          <p className="mt-3 text-white/80">{t("effectiveDate")}</p>
          <p className="mt-6 text-white/90 leading-relaxed">
            {t("intro")}
          </p>
        </header>

        {/* 1. Information We Collect */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section1.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section1.intro")}
          </p>

          <h3 className="mt-5 text-xl font-semibold">{t("section1.technical.title")}</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>{t("section1.technical.item1")}</li>
            <li>{t("section1.technical.item2")}</li>
            <li>{t("section1.technical.item3")}</li>
            <li>{t("section1.technical.item4")}</li>
          </ul>

          <h3 className="mt-4 text-xl font-semibold">{t("section1.cookies.title")}</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>{t("section1.cookies.item1")}</li>
            <li>{t("section1.cookies.item2")}</li>
            <li>{t("section1.cookies.item3")}</li>
          </ul>

          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section1.noPersonalData")}
          </p>
        </section>

        {/* 2. How We Use Information */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section2.title")}
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>{t("section2.item1")}</li>
            <li>{t("section2.item2")}</li>
            <li>{t("section2.item3")}</li>
            <li>{t("section2.item4")}</li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section2.noAdvertising")}
          </p>
        </section>

        {/* 3. Sharing & Disclosure */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section3.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section3.intro")}
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>
              <span className="font-semibold">{t("section3.providers.title")}:</span> {t("section3.providers.description")}
            </li>
            <li>
              <span className="font-semibold">{t("section3.legal.title")}:</span> {t("section3.legal.description")}
            </li>
            <li>
              <span className="font-semibold">{t("section3.protection.title")}:</span> {t("section3.protection.description")}
            </li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">{t("section3.noSelling")}</p>
        </section>

        {/* 4. Data Retention */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section4.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section4.content")}
          </p>
        </section>

        {/* 5. Security */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("section5.title")}</h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section5.intro")}
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>{t("section5.item1")}</li>
            <li>{t("section5.item2")}</li>
            <li>{t("section5.item3")}</li>
            <li>{t("section5.item4")}</li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section5.disclaimer")}
          </p>
        </section>

        {/* 6. Children's Privacy */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section6.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section6.content")}
          </p>
        </section>

        {/* 7. International Transfers */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section7.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section7.content")}
          </p>
        </section>

        {/* 8. User Rights */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section8.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">{t("section8.intro")}</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>{t("section8.right1")}</li>
            <li>{t("section8.right2")}</li>
            <li>{t("section8.right3")}</li>
            <li>{t("section8.right4")}</li>
            <li>{t("section8.right5")}</li>
            <li>{t("section8.right6")}</li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section8.exercise")}
          </p>
        </section>

        {/* 9. Policy Changes */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("section9.title")}
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section9.content")}
          </p>
        </section>

        {/* 10. Contact */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("section10.title")}</h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            {t("section10.intro")}
          </p>
          <p className="mt-2">
            {t("section10.emailLabel")}:{" "}
            <a
              href="mailto:randombibleverse@outlook.com"
              className="underline decoration-dashed decoration-white/70 underline-offset-4 hover:text-white"
            >
              randombibleverse@outlook.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
