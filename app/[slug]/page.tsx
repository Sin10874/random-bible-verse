"use client";

import { useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { getGeneratorBySlug, Generator } from "../data/generators";
import { notFound } from "next/navigation";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

type Verse = { text: string; reference?: string };

interface GeneratorPageProps {
  params: { slug: string };
}

export default function GeneratorPage({ params }: GeneratorPageProps) {
  const generator = getGeneratorBySlug(params.slug);

  if (!generator) {
    notFound();
  }

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  async function fetchVerse() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/verse?category=${generator.id}`, { cache: "no-store" });
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
          src={generator.image}
          alt=""
          className="absolute inset-0 hidden sm:block h-full w-full object-cover"
          aria-hidden="true"
        />
        {/* 移动端背景 */}
        <img
          src={generator.image}
          alt=""
          className="absolute inset-0 block sm:hidden h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        {/* 暗化遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        {/* 底部过渡到纯色区 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        {/* 顶部导航 */}
        <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <img
              src="/logo.svg"
              alt="Bible Verse Generator Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-sm"
            />
            <span className="font-semibold tracking-tight text-lg md:text-xl">
              Bible Verse Generator
            </span>
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

        {/* Hero 内容 */}
        <main
          className="relative z-10 mx-auto max-w-5xl px-6 md:px-10
                     min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center"
        >
          <h1
            className={`${display.className} italic text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] drop-shadow-xl px-4`}
          >
            {generator.name}
          </h1>

          <p
            className={`${display.className} italic mt-6 sm:mt-8 md:mt-10 text-lg sm:text-xl md:text-2xl opacity-90 drop-shadow max-w-3xl px-4`}
          >
            {generator.description}
          </p>

          <div className="mt-12 md:mt-14 flex items-center justify-center">
            <button
              onClick={fetchVerse}
              disabled={loading}
              className="btn-primary cursor-pointer"
              aria-busy={loading}
            >
              {loading ? "Loading..." : `Generate ${generator.name} Verse`}
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
                <span className="text-xs sm:text-sm uppercase tracking-wider text-white/80 truncate">{generator.name} Verse</span>
                <button
                  className="rounded-full border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-white/10 cursor-pointer transition shrink-0 touch-manipulation"
                  onClick={() => setOpen(false)}
                  aria-label="Close verse"
                >
                  Close
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
                  Copy
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
            {getContentForGenerator(generator)}
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
          ✅ Copied
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
            © 2024 Bible Verse Generator. Built with ❤️ for reflection.
          </p>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] md:hidden" />
      </footer>
    </div>
  );
}

// ===== 为每个生成器生成内容 =====
function getContentForGenerator(generator: Generator) {
  const categoryContent = getCategorySpecificContent(generator);

  return (
    <>
      {/* Section 1: Introduction */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          {categoryContent.h2Intro}
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
          {categoryContent.intro}
        </p>
      </div>

      {/* Section 2: Benefits */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          {categoryContent.h2Benefits}
        </h2>
        <div className="mt-4 sm:mt-5 space-y-5 sm:space-y-6">
          {categoryContent.benefits.map((benefit, idx) => (
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
          How to Use This {generator.name} Generator
        </h2>
        <ol className="mt-3 sm:mt-4 list-decimal list-inside space-y-2 sm:space-y-2.5 text-sm sm:text-base text-white/90 leading-relaxed">
          <li>Click the "Generate {generator.name} Verse" button above to get a random Bible verse</li>
          <li>Read and reflect on the Scripture passage that appears</li>
          <li>Copy the verse to share with friends, family, or save for your devotional time</li>
          <li>Generate new {generator.name.toLowerCase()} as often as you need inspiration</li>
        </ol>
      </div>

      {/* Section 4: Call to Action */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          Get Your {generator.name} Today
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
          Start your day with God's Word. Click the generate button above to receive your {generator.name.toLowerCase()}
          and let Scripture speak to your heart. Each verse is randomly selected to provide fresh inspiration and guidance.
        </p>
      </div>
    </>
  );
}

// ===== 每个类别的特定内容 =====
function getCategorySpecificContent(generator: Generator) {
  const contentMap: Record<string, { h2Intro: string; h2Benefits: string; intro: string; benefits: Array<{ title: string; description: string }> }> = {
    love: {
      h2Intro: "Understanding Bible Verses About Love",
      h2Benefits: "Benefits of Reading Love Verses from Scripture",
      intro: "Bible verses about love reveal God's unconditional love for us and teach us how to love others. From 1 Corinthians 13 to John 3:16, Scripture shows that love is the greatest commandment and the foundation of our faith.",
      benefits: [
        {
          title: "Understand God's Love",
          description: "Discover how deeply God loves you through verses that reveal His sacrificial, unconditional love demonstrated through Jesus Christ."
        },
        {
          title: "Learn to Love Others",
          description: "Find practical guidance on loving your neighbor, forgiving those who hurt you, and showing Christ's love in your daily relationships."
        },
        {
          title: "Strengthen Relationships",
          description: "Apply biblical principles of love to build stronger marriages, friendships, and family bonds rooted in God's design."
        }
      ]
    },
    hope: {
      h2Intro: "What Does the Bible Say About Hope?",
      h2Benefits: "Why You Should Read Bible Verses About Hope",
      intro: "Bible verses about hope remind us that our hope is anchored in God's promises and His faithful character. These verses provide encouragement during difficult times and renew our trust in God's plan.",
      benefits: [
        {
          title: "Find Hope in Trials",
          description: "When circumstances seem hopeless, Scripture reminds us that God works all things for our good and has a purpose in every season."
        },
        {
          title: "Anchor Your Faith",
          description: "Build your faith on the solid foundation of God's unchanging promises and His proven faithfulness throughout history."
        },
        {
          title: "Encourage Others",
          description: "Share verses of hope with friends and family facing challenges, offering them the same comfort God provides to you."
        }
      ]
    },
    strength: {
      h2Intro: "Finding Strength in Bible Verses",
      h2Benefits: "Benefits of Reading Strength Scriptures",
      intro: "Bible verses about strength remind us that God is our source of power and courage. When we feel weak, His strength is made perfect, enabling us to face any challenge with confidence in Him.",
      benefits: [
        {
          title: "Find Strength in Weakness",
          description: "Discover how God's power is perfected in your weakness, giving you supernatural strength beyond your natural abilities."
        },
        {
          title: "Overcome Challenges",
          description: "Face life's obstacles with courage, knowing that you can do all things through Christ who strengthens you."
        },
        {
          title: "Renew Your Energy",
          description: "Those who wait on the Lord will renew their strength, finding fresh energy and endurance for the journey ahead."
        }
      ]
    },
    peace: {
      h2Intro: "Discovering God's Peace Through Scripture",
      h2Benefits: "How Peace Verses Transform Your Life",
      intro: "Bible verses about peace reveal God's gift of inner tranquility that surpasses understanding. This peace guards our hearts and minds, even in the midst of life's storms.",
      benefits: [
        {
          title: "Experience Inner Peace",
          description: "Find the peace that Jesus promised - a peace the world cannot give, anchored in God's presence and promises."
        },
        {
          title: "Calm Anxious Thoughts",
          description: "Replace worry and anxiety with God's peace through prayer, thanksgiving, and meditating on His Word."
        },
        {
          title: "Rest in God's Control",
          description: "Trust that God is in control of every situation, allowing you to rest peacefully knowing He cares for you."
        }
      ]
    },
    faith: {
      h2Intro: "What is Faith According to the Bible?",
      h2Benefits: "Growing Your Faith with Scripture",
      intro: "Bible verses about faith teach us to trust God completely, even when we cannot see the outcome. Faith is the substance of things hoped for and the evidence of things not seen.",
      benefits: [
        {
          title: "Strengthen Your Trust",
          description: "Build unwavering trust in God's character and promises, knowing He is faithful to complete what He begins."
        },
        {
          title: "Move Mountains",
          description: "Learn how even mustard-seed faith can move mountains when placed in an all-powerful God."
        },
        {
          title: "Please God",
          description: "Understand that without faith it's impossible to please God, and that He rewards those who earnestly seek Him."
        }
      ]
    },
    grief: {
      h2Intro: "Bible Verses for Grief and Loss",
      h2Benefits: "Finding Comfort in Times of Sorrow",
      intro: "Bible verses about grief and loss provide comfort in times of sorrow. God draws near to the brokenhearted and promises to wipe away every tear.",
      benefits: [
        {
          title: "Find Comfort in Loss",
          description: "Discover God's compassionate presence with those who mourn, offering genuine comfort and healing for broken hearts."
        },
        {
          title: "Process Your Pain",
          description: "Give yourself permission to grieve while holding onto the hope of resurrection and eternal life in Christ."
        },
        {
          title: "Support Others",
          description: "Use God's comfort to minister to others experiencing loss, becoming a vessel of His compassion."
        }
      ]
    },
    prayer: {
      h2Intro: "Learning to Pray from Scripture",
      h2Benefits: "Strengthening Your Prayer Life with Bible Verses",
      intro: "Bible verses about prayer teach us how to communicate with God, from the Lord's Prayer to promises that God hears and answers. Prayer is our direct line to the Father's heart.",
      benefits: [
        {
          title: "Learn to Pray Effectively",
          description: "Discover biblical principles for prayer, including persistence, faith, and aligning your requests with God's will."
        },
        {
          title: "Experience God's Presence",
          description: "Draw near to God through prayer and experience the intimacy of relationship with your heavenly Father."
        },
        {
          title: "See Answers",
          description: "Claim God's promises to answer prayer, trusting that He hears and responds according to His perfect wisdom."
        }
      ]
    },
    encouragement: {
      h2Intro: "Finding Encouragement in God's Word",
      h2Benefits: "How Encouraging Bible Verses Uplift You",
      intro: "Bible verses of encouragement lift our spirits and remind us of God's faithfulness. These verses strengthen us to press on, knowing that God is with us and for us.",
      benefits: [
        {
          title: "Overcome Discouragement",
          description: "Find renewed motivation and hope when you feel discouraged, remembering God's promises never fail."
        },
        {
          title: "Stay Strong",
          description: "Be strengthened and courageous, knowing the Lord goes before you and will never leave nor forsake you."
        },
        {
          title: "Encourage Others",
          description: "Share uplifting verses with friends, family, and fellow believers who need hope and encouragement."
        }
      ]
    },
    thanksgiving: {
      h2Intro: "Cultivating Gratitude Through Scripture",
      h2Benefits: "Benefits of Reading Thanksgiving Verses",
      intro: "Bible verses about thanksgiving teach us to give thanks in all circumstances. Gratitude is not just good manners - it's a command and a pathway to experiencing God's peace.",
      benefits: [
        {
          title: "Cultivate Gratitude",
          description: "Develop a thankful heart by regularly reflecting on God's goodness and faithfulness in your life."
        },
        {
          title: "Experience Joy",
          description: "Discover how thanksgiving transforms your perspective and fills your heart with joy, regardless of circumstances."
        },
        {
          title: "Worship God",
          description: "Enter God's gates with thanksgiving and His courts with praise, making gratitude a form of worship."
        }
      ]
    },
    psalms: {
      h2Intro: "Exploring the Book of Psalms",
      h2Benefits: "Why Read Psalms Bible Verses",
      intro: "The Book of Psalms is a collection of 150 poetic songs and prayers that express the full range of human emotion - from despair to joy, from lament to praise. The Psalms teach us to bring our whole hearts to God.",
      benefits: [
        {
          title: "Pray the Psalms",
          description: "Use the Psalms as a guide for your own prayers, expressing worship, confession, thanksgiving, and petition to God."
        },
        {
          title: "Find Emotional Expression",
          description: "Discover words for every emotion - the Psalms validate your feelings while pointing you to God's faithfulness."
        },
        {
          title: "Learn to Worship",
          description: "The Psalms model authentic worship that is both honest and reverent, teaching us to praise God in every situation."
        }
      ]
    },
    proverbs: {
      h2Intro: "Wisdom from the Book of Proverbs",
      h2Benefits: "Benefits of Daily Proverbs Reading",
      intro: "The Book of Proverbs contains timeless wisdom for daily living. These sayings teach practical principles for relationships, work, money, speech, and character development.",
      benefits: [
        {
          title: "Gain Practical Wisdom",
          description: "Apply God's wisdom to everyday decisions and relationships, learning to navigate life with discernment."
        },
        {
          title: "Develop Character",
          description: "Build godly character through principles of integrity, diligence, humility, and self-control."
        },
        {
          title: "Make Better Choices",
          description: "Learn to choose the path of wisdom over folly, making decisions that honor God and benefit your life."
        }
      ]
    },
    john: {
      h2Intro: "Discovering Jesus in the Gospel of John",
      h2Benefits: "Why Read the Gospel of John",
      intro: "The Gospel of John presents Jesus Christ as the Son of God and the source of eternal life. Written that we might believe, John's Gospel contains some of the most beloved passages about salvation, love, and the Holy Spirit.",
      benefits: [
        {
          title: "Know Jesus Christ",
          description: "Discover who Jesus is through His seven 'I am' statements and miraculous signs that reveal His divine nature."
        },
        {
          title: "Receive Eternal Life",
          description: "Understand the way to salvation through faith in Jesus Christ, God's only Son given for the world."
        },
        {
          title: "Experience His Love",
          description: "Encounter the depth of Christ's love demonstrated through His teaching, His life, and His sacrifice on the cross."
        }
      ]
    }
  };

  return contentMap[generator.id] || contentMap.love;
}
