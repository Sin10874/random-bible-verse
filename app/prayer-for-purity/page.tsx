"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

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

const categories = [
  "All Categories",
  "Cleansing & Purity",
  "Deliverance & Freedom",
  "Strength & Resistance",
  "Forgiveness & Grace",
  "Renewal & Restoration",
  "Spiritual Warfare",
];

export default function PrayerForPurityPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prayer, setPrayer] = useState<PrayerPoint | null>(null);
  const [allPrayers, setAllPrayers] = useState<PrayerPoint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Load prayer data
    fetch("/prayer-data.json")
      .then((res) => res.json())
      .then((data) => setAllPrayers(data))
      .catch((err) => console.error("Failed to load prayer data:", err));
  }, []);

  function getRandomPrayer() {
    setLoading(true);

    // Filter prayers by category
    const filtered =
      selectedCategory === "All Categories"
        ? allPrayers
        : allPrayers.filter((p) => p.category === selectedCategory);

    if (filtered.length === 0) {
      setLoading(false);
      return;
    }

    // Get random prayer
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const randomPrayer = filtered[randomIndex];

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
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Desktop background */}
        <img
          src={process.env.NEXT_PUBLIC_HERO_URL || "/mountain-hero.jpg"}
          alt=""
          className="absolute inset-0 hidden sm:block h-full w-full object-cover"
          aria-hidden="true"
        />
        {/* Mobile background */}
        <img
          src={process.env.NEXT_PUBLIC_HERO_MOBILE_URL || "/mountain-hero-mobile.jpg"}
          alt=""
          className="absolute inset-0 block sm:hidden h-full w-full object-cover object-[50%_30%]"
          aria-hidden="true"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <img
              src="/logo.svg"
              alt="Bible Verse Generator Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-sm"
            />
            <h1 className="font-semibold tracking-tight text-lg md:text-xl">
              Prayer for Purity
            </h1>
          </Link>

          <a
            href="mailto:randombibleverse@outlook.com"
            className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20
                       ring-1 ring-white/25 p-2 backdrop-blur transition cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Contact Us"
            title="Contact Us"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </header>

        {/* Main Content */}
        <main className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center">
          <p
            className={`${display.className} italic text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] drop-shadow-xl`}
            aria-hidden="true"
          >
            Find Freedom in Christ
          </p>

          <p className={`${display.className} italic mt-8 md:mt-10 text-xl md:text-2xl opacity-90 drop-shadow`}>
            Powerful prayer points with Scripture to overcome addiction and walk in purity.
          </p>

          {/* Category Filter */}
          <div className="mt-10 w-full max-w-2xl">
            <label htmlFor="category" className="sr-only">Select Prayer Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20
                         text-white text-center cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-white/30
                         hover:bg-white/15 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0b0f1a]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <h2 className="sr-only">Generate Prayer Point</h2>
            <button
              onClick={getRandomPrayer}
              disabled={loading || allPrayers.length === 0}
              className="btn-primary cursor-pointer"
              aria-busy={loading}
            >
              {loading ? "Loading..." : "Get Prayer Point"}
            </button>
          </div>

          {/* Prayer Card */}
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
                  Close
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-white/70 mb-2">Prayer Point</h3>
                  <p className="text-lg md:text-xl leading-relaxed font-medium">
                    {prayer.prayerPoint}
                  </p>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <h3 className="text-sm uppercase tracking-wider text-white/70 mb-2">Scripture</h3>
                  <blockquote
                    className={`${display.className} italic text-xl md:text-2xl leading-snug font-medium`}
                  >
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
                  Copy Prayer
                </button>
              </div>
            </div>
          )}
        </main>
      </section>

      {/* Content Section */}
      <section
        className="relative z-10 bg-gradient-to-b from-[#0b0f1a] via-[#0a0e17] to-[#0a0a0a]"
        aria-label="About Prayer for Purity"
      >
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-16 md:py-20">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-sm space-y-10">

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                What Are Prayer Points for Purity?
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                Prayer points for purity are specific, Scripture-based prayers designed to help believers overcome pornography addiction and walk in sexual purity. Each prayer point is rooted in God's Word, providing spiritual weapons for the battle against lust, shame, and temptation. These prayers focus on cleansing, deliverance, strength, forgiveness, renewal, and spiritual warfare.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                How to Use This Prayer Tool
              </h2>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-white/90 leading-relaxed">
                <li>Choose a prayer category or select "All Categories" for a random prayer.</li>
                <li>Click "Get Prayer Point" to receive a prayer with its corresponding Scripture.</li>
                <li>Read the prayer aloud and meditate on the Bible verse.</li>
                <li>Copy the prayer to save it or share it with someone who needs encouragement.</li>
                <li>Return daily to build a consistent prayer habit for purity and freedom.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Prayer Categories Explained
              </h2>

              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Cleansing & Purity</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Prayers asking God to create a clean heart, purify your mind, and help you pursue holiness. These prayers are based on verses like Psalm 51:10 and Philippians 4:8.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Deliverance & Freedom</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Prayers for breaking free from bondage and addiction. Based on John 8:36 and other verses about liberty in Christ, these prayers declare your freedom from chains.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Strength & Resistance</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Prayers for supernatural strength to resist temptation. Grounded in 1 Corinthians 10:13 and James 4:7, these prayers help you stand firm when faced with lustful desires.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Forgiveness & Grace</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Prayers for receiving God's forgiveness and overcoming shame. Based on 1 John 1:9 and Romans 8:1, these prayers remind you there is no condemnation in Christ.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Renewal & Restoration</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Prayers for transformation and a renewed mind. Using Romans 12:2 and 2 Corinthians 5:17, these prayers help you embrace your new identity in Christ.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">Spiritual Warfare</h3>
                  <p className="mt-2 text-white/90 leading-relaxed">
                    Prayers for taking every thought captive and standing against spiritual attacks. Based on 2 Corinthians 10:5 and Ephesians 6:12, these prayers equip you for battle.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Why Scripture-Based Prayers Are Powerful
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                When you pray God's Word back to Him, you align your requests with His will. The Bible says that God's Word is living and active (Hebrews 4:12), and it does not return void (Isaiah 55:11). Scripture-based prayers increase your faith, renew your mind, and remind you of God's promises. Each prayer point in this tool is anchored in a specific Bible verse, ensuring that your prayers are both powerful and aligned with God's truth.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Who Can Benefit from These Prayers?
              </h2>
              <ul className="mt-3 list-disc list-inside space-y-2 text-white/90 leading-relaxed">
                <li>Anyone struggling with pornography addiction or sexual sin</li>
                <li>Believers seeking to walk in purity and holiness</li>
                <li>Christians who want to strengthen their prayer life</li>
                <li>Parents, pastors, or counselors interceding for others</li>
                <li>Anyone battling shame, guilt, or condemnation</li>
                <li>Those who need daily encouragement and spiritual support</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Biblical Foundation for Purity
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                God calls His people to purity. In 1 Thessalonians 4:3-4, Scripture says, "For this is the will of God, even your sanctification, that ye should abstain from fornication: That every one of you should know how to possess his vessel in sanctification and honour." Jesus Himself said, "Blessed are the pure in heart: for they shall see God" (Matthew 5:8). Purity is not just about behavior—it's about the heart. These prayers help you pursue a clean heart that desires God above all else.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Practical Tips for Overcoming Pornography
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                While prayer is essential, combine it with practical steps:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-2 text-white/90 leading-relaxed">
                <li>Install accountability software and internet filters</li>
                <li>Find an accountability partner or Christian support group</li>
                <li>Memorize Scripture verses about purity and temptation</li>
                <li>Avoid triggers—know your weak moments and plan ahead</li>
                <li>Replace bad habits with healthy activities (exercise, hobbies, service)</li>
                <li>Seek professional Christian counseling if needed</li>
                <li>Stay connected to a local church and community</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Is This Tool Free?
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                Yes—this prayer tool is completely free to use. No sign-ups, no downloads, no limits. Our mission is to provide spiritual resources that help people find freedom in Christ. Simply select a category, generate a prayer, and begin your journey toward purity and healing.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                You Are Not Alone
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                If you are struggling with pornography, know that you are not alone—and you are not beyond God's reach. Millions of Christians face this battle, and many have found victory through prayer, accountability, and God's grace. Remember: "There is therefore now no condemnation to them which are in Christ Jesus" (Romans 8:1). God's mercy is new every morning, and His strength is made perfect in your weakness. Start praying today, and trust that God will lead you to freedom.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Start Your Journey to Freedom
              </h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                Click "Get Prayer Point" above to receive a Scripture-based prayer for purity. Let God's Word transform your mind, renew your heart, and set you free. Your breakthrough begins with one prayer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Copy Toast */}
      {showToast && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     bg-white/90 text-neutral-900 px-5 py-2 rounded-full
                     shadow-md text-sm font-medium
                     transition-opacity duration-300 animate-fadeInOut
                     z-50"
        >
          Copied
        </div>
      )}

      {/* Footer */}
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
                  href="/"
                  className="inline-flex items-center rounded-md px-2 py-2
                       text-sm hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Home
                </Link>
              </li>
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
            © {new Date().getFullYear()} Bible Verse Generator. Built with faith for freedom.
          </p>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </footer>
    </div>
  );
}
