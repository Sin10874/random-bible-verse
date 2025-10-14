// app/privacy/page.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bible Verse Generator",
  description:
    "Learn how Random Bible Verse Generator collects, uses, and protects minimal technical data. No targeted ads, no selling of data.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
};

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

export default function PrivacyPage() {
  return (
    <div className="text-white bg-[#0b0f1a]">
      {/* 顶部区域（保持与站点风格一致） */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-10 md:pt-14">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white transition"
            aria-label="Back to Home"
          >
            ← Back to Home
          </Link>
        </div>
      </section>

      {/* 正文 */}
      <main className="mx-auto max-w-4xl px-6 md:px-10 py-12 md:py-16">
        <header className="mb-8 md:mb-10">
          <h1
            className={`${display.className} italic text-4xl md:text-5xl font-semibold tracking-tight leading-tight drop-shadow`}
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-white/80">Effective Date: October 14, 2025</p>
          <p className="mt-6 text-white/90 leading-relaxed">
            Welcome to Random Bible Verse Generator (“we”, “us”, “our”). We respect your privacy and
            are committed to protecting any information that may be captured during your use of this
            site. This Privacy Policy describes how we collect, use, disclose, and safeguard
            information when you visit and use our random Bible verse generator service (the “Service”).
          </p>
        </header>

        {/* 1 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            1. Information We Collect
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            We strive to minimize data collection. The categories of information we may collect include:
          </p>

          <h3 className="mt-5 text-xl font-semibold">Technical / Usage Data (automatically collected)</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>Your device type, browser name and version, operating system</li>
            <li>Referring URLs, pages visited, timestamps, session duration</li>
            <li>IP address (typically in anonymized or aggregated form)</li>
            <li>Clicks, usage counts, page loads for analytics</li>
          </ul>

          <h3 className="mt-4 text-xl font-semibold">Cookies / Local Storage</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>We may use basic cookies or browser storage for session handling or to enable site functionality.</li>
            <li>We do not use advertising or tracking cookies.</li>
            <li>You can disable cookies via your browser settings; the site will continue functioning for core features.</li>
          </ul>

          <p className="mt-3 text-white/90 leading-relaxed">
            We do not collect or store names, email addresses, physical addresses, payment data,
            social media profiles, or any other personal identity information.
          </p>
        </section>

        {/* 2 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            2. How We Use Information
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>Operating, maintaining, and improving the Service</li>
            <li>Understanding usage patterns to make enhancements</li>
            <li>Monitoring and preventing abusive or malicious use</li>
            <li>Complying with legal obligations, if applicable</li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">
            We will not use data for targeted advertising, building user profiles, or selling/share information for marketing purposes.
          </p>
        </section>

        {/* 3 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            3. Sharing &amp; Disclosure
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            Because we collect minimal and largely non-identifiable data, sharing is very limited. We may disclose information in the following cases:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>
              <span className="font-semibold">Service providers / vendors:</span> such as hosting providers, analytics tools — only as necessary and under confidentiality obligations
            </li>
            <li>
              <span className="font-semibold">Legal / regulatory requests:</span> to comply with court orders, subpoenas, or other legal processes
            </li>
            <li>
              <span className="font-semibold">Protection of rights and security:</span> to investigate fraud, security breaches, or enforce our Terms
            </li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">We will never sell your data to third parties.</p>
        </section>

        {/* 4 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            4. Data Retention
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            We retain technical and usage data only for as long as necessary to fulfill the purposes described above,
            or to comply with applicable law. We may anonymize or aggregate older data for long-term statistical use.
          </p>
        </section>

        {/* 5 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">5. Security</h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            We take reasonable steps to protect the data we collect (even if minimal) from unauthorized access, alteration, or destruction. Measures include:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>HTTPS encryption</li>
            <li>Restricted access to servers</li>
            <li>Monitoring and logging of access</li>
            <li>Regular security reviews</li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">
            However, no method of transmission or storage is 100% secure; absolute security cannot be guaranteed.
          </p>
        </section>

        {/* 6 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            6. Children’s Privacy
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            We do not knowingly collect information from children under the age of [13 / applicable minimum age in your jurisdiction].
            If you believe we have collected such data, please contact us, and we will promptly remove it.
          </p>
        </section>

        {/* 7 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            7. International Transfers &amp; Applicability
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            Your information (mostly non-identifying) may be processed or stored in servers located in different countries.
            If you are in the European Union, the UK, or other jurisdictions with stricter privacy laws (e.g. GDPR, CCPA),
            you may have additional rights described below.
          </p>
        </section>

        {/* 8 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            8. Rights of Users (Applicable Jurisdictions)
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">Depending on your jurisdiction, you may have the following rights:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/90 leading-relaxed">
            <li>Right to access (obtain a copy)</li>
            <li>Right to correct or update</li>
            <li>Right to delete / erasure</li>
            <li>Right to restrict processing</li>
            <li>Right to object to processing</li>
            <li>Right to data portability</li>
          </ul>
          <p className="mt-3 text-white/90 leading-relaxed">
            If you wish to exercise any of these rights, please contact us (see Contact section). We will respond in accordance with applicable law.
          </p>
        </section>

        {/* 9 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            9. Changes to This Privacy Policy
          </h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            We may update this Privacy Policy from time to time. When changes occur, we will revise the “Effective Date” and post the updated policy at this page.
            Significant changes will be highlighted or otherwise communicated. Continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* 10 */}
        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">10. Contact Us</h2>
          <p className="mt-3 text-white/90 leading-relaxed">
            If you have questions or concerns about this Privacy Policy or how we handle data, please contact us:
          </p>
          <p className="mt-2">
            Email:{" "}
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
