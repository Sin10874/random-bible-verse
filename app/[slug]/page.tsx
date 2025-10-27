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
          How to Use This Free Bible Verse Generator
        </h2>
        <ol className="mt-3 sm:mt-4 list-decimal list-inside space-y-2 sm:space-y-2.5 text-sm sm:text-base text-white/90 leading-relaxed">
          <li>Click the "Random Bible Verse" button above to get a random Scripture passage</li>
          <li>Read and reflect on the Bible verse that appears</li>
          <li>Copy the verse to share with friends, family, or save for your devotional time</li>
          <li>Generate new verses as often as you need inspiration—completely free, no registration required</li>
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

      {/* Additional SEO Content */}
      {categoryContent.additionalSections?.map((section, idx) => (
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

// ===== 每个类别的特定内容 =====
function getCategorySpecificContent(generator: Generator) {
  const contentMap: Record<string, {
    h2Intro: string;
    h2Benefits: string;
    intro: string;
    benefits: Array<{ title: string; description: string }>;
    additionalSections?: Array<{ title: string; content: string }>;
  }> = {
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
      ],
      additionalSections: [
        {
          title: "The Greatest Commandment: Love God and Love Others",
          content: "Jesus taught that the greatest commandment is to love the Lord your God with all your heart, soul, and mind, and to love your neighbor as yourself (Matthew 22:37-39). These two commands summarize all of Scripture and form the foundation of Christian living. When we understand how much God loves us, we are empowered to love others with the same unconditional, sacrificial love."
        },
        {
          title: "Biblical Definition of Love",
          content: "1 Corinthians 13 provides the most comprehensive biblical definition of love: patient, kind, not envious or boastful, not proud or rude, not self-seeking or easily angered, keeping no record of wrongs. Love always protects, trusts, hopes, and perseveres. This isn't just romantic love—it's the agape love that reflects God's character and should characterize all Christian relationships."
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
      ],
      additionalSections: [
        {
          title: "Hope as an Anchor for the Soul",
          content: "Hebrews 6:19 describes hope as \"an anchor for the soul, firm and secure.\" In life's storms, biblical hope keeps us grounded and stable. Unlike wishful thinking, Christian hope is confident expectation based on God's character and promises. This hope doesn't disappoint because it's rooted in the unchanging nature of God and secured by the resurrection of Jesus Christ."
        },
        {
          title: "Living Hope Through Christ",
          content: "1 Peter 1:3 speaks of the \"living hope\" we have through the resurrection of Jesus Christ from the dead. This hope is alive and active, not a dead religious concept. Because Jesus conquered death, we have hope for eternal life, hope for transformation, and hope that sustains us through every trial. This living hope changes how we face each day."
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
      ],
      additionalSections: [
        {
          title: "God's Strength Made Perfect in Weakness",
          content: "2 Corinthians 12:9 reveals a powerful truth: God's strength is made perfect in our weakness. When we acknowledge our limitations and depend on Him, His power works most effectively through us. This means we don't have to pretend to be strong on our own. Instead, we can honestly bring our weaknesses to God and experience His supernatural strength that far exceeds anything we could muster ourselves."
        },
        {
          title: "Philippians 4:13 - Strength for All Things",
          content: "\"I can do all things through Christ who strengthens me\" (Philippians 4:13) is one of the most beloved verses about strength. This doesn't mean we can accomplish anything we dream up, but rather that Christ gives us strength to handle whatever circumstances God allows in our lives. Whether facing abundance or need, health or sickness, success or failure, Christ's strength is sufficient for every situation."
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
      ],
      additionalSections: [
        {
          title: "Peace That Surpasses Understanding",
          content: "Philippians 4:6-7 teaches that when we bring our anxieties to God through prayer and thanksgiving, His peace—which transcends all understanding—will guard our hearts and minds. This peace isn't based on circumstances being perfect; it's a supernatural calm that God gives even in chaos. It surpasses human understanding because it defies logic to be peaceful when things are falling apart, yet God's presence provides exactly that."
        },
        {
          title: "Jesus, the Prince of Peace",
          content: "Isaiah 9:6 prophesies that the Messiah would be called the \"Prince of Peace.\" Jesus is the source of true peace. In John 14:27, He says, \"Peace I leave with you; my peace I give you. I do not give to you as the world gives.\" The world's peace depends on favorable circumstances, but Christ's peace is rooted in His victory over sin and death. Through relationship with Him, we access this lasting peace."
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
      ],
      additionalSections: [
        {
          title: "The Hall of Faith: Hebrews 11",
          content: "Hebrews 11 is often called the \"Hall of Faith,\" showcasing heroes like Abraham, Moses, and Rahab who trusted God despite impossible circumstances. Their stories teach us that faith isn't blind—it's confident trust in God's character and promises, even when we can't see the outcome. These examples encourage us that God honors faith in every generation and circumstance."
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
      ],
      additionalSections: [
        {
          title: "God's Promise to the Brokenhearted",
          content: "Psalm 34:18 promises that \"The Lord is close to the brokenhearted and saves those who are crushed in spirit.\" When you're grieving, God doesn't stand at a distance—He draws near. His presence brings comfort that no human words can provide. Whether you've lost a loved one, experienced a broken relationship, or faced any form of loss, God meets you in your pain with compassion and understanding."
        },
        {
          title: "How to Use Scripture During Grief",
          content: "During times of grief, reading Bible verses can feel difficult, yet it's often when we need God's Word most. Start with short passages like Psalm 23 or Matthew 5:4 (\"Blessed are those who mourn, for they will be comforted\"). Let Scripture remind you that grief is not the end of your story—God promises restoration, healing, and the hope of resurrection. Use this free tool daily to receive comfort from God's Word."
        },
        {
          title: "Free Grief Support Through Scripture",
          content: "This free Bible verse generator provides instant access to comforting Scripture passages whenever you need them. No registration or subscription required. Whether you're experiencing fresh loss or walking through prolonged grief, click the button above to receive encouraging words from God's Word. Share verses with others who are mourning, offering them the same comfort God has given you (2 Corinthians 1:3-4)."
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
      ],
      additionalSections: [
        {
          title: "The Lord's Prayer as a Model",
          content: "In Matthew 6:9-13, Jesus taught His disciples how to pray through the Lord's Prayer. This model prayer includes worship (\"hallowed be your name\"), surrender (\"your will be done\"), daily dependence (\"give us today our daily bread\"), confession (\"forgive us our debts\"), and spiritual protection (\"deliver us from evil\"). Using this structure helps us pray comprehensively and align our hearts with God's priorities."
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
      ],
      additionalSections: [
        {
          title: "Daily Encouragement from Scripture",
          content: "Starting each day with an encouraging Bible verse can transform your perspective and strengthen your faith. Whether you're facing challenges at work, struggling with relationships, or simply need a reminder of God's love, Scripture provides the encouragement you need. This free tool delivers random encouraging verses from throughout the Bible—use it every morning as part of your devotional routine or whenever you need a spiritual lift."
        },
        {
          title: "When to Read Encouraging Bible Verses",
          content: "Encouraging Scripture is valuable in many situations: when facing difficult decisions, experiencing setbacks, feeling overwhelmed, or walking through uncertain times. The Bible is filled with God's promises of His presence, provision, and faithfulness. Verses like Joshua 1:9 (\"Be strong and courageous\") and Philippians 4:13 (\"I can do all things through Christ\") remind us that we're never alone and God's strength is always available."
        },
        {
          title: "Share Encouragement Freely",
          content: "This Bible verse generator is completely free—no ads, no registration, no hidden costs. We believe everyone should have easy access to God's encouraging Word. Use this tool to find verses to text a friend who's struggling, post on social media to uplift your followers, or save for your own meditation. God's Word is meant to be shared generously, bringing hope and encouragement to all who need it."
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
      ],
      additionalSections: [
        {
          title: "Give Thanks in All Circumstances",
          content: "1 Thessalonians 5:18 commands us to \"give thanks in all circumstances, for this is God's will for you in Christ Jesus.\" Notice it doesn't say \"for all circumstances\" but \"in all circumstances.\" Even during trials, we can thank God for His presence, faithfulness, and the promise that He works all things for our good. Practicing thanksgiving shifts our focus from our problems to God's power and provision."
        },
        {
          title: "Thanksgiving as a Daily Practice",
          content: "Making thanksgiving a daily habit transforms your spiritual life. Start each morning by thanking God for specific blessings—health, family, provision, salvation. Use this free Bible verse generator to discover new reasons to be thankful from Scripture. Psalm 100 teaches us to \"enter his gates with thanksgiving and his courts with praise.\" When we approach God with gratitude, we position ourselves to experience His presence and peace."
        },
        {
          title: "Free Thanksgiving Bible Verses Anytime",
          content: "This tool provides instant access to thanksgiving Bible verses whenever you need them—completely free, no subscription required. Whether you're preparing for Thanksgiving dinner, leading a prayer group, or simply want to cultivate a grateful heart, click the button above to receive inspiring verses about gratitude. Share them with family and friends to spread a spirit of thanksgiving throughout your community."
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
      ],
      additionalSections: [
        {
          title: "The Psalms: Ancient Songs for Modern Life",
          content: "Written thousands of years ago by David, Asaph, Solomon, and others, the Psalms remain powerfully relevant today. These ancient prayers address timeless human experiences: fear and faith, doubt and trust, sorrow and celebration. Whether you're experiencing the valleys of Psalm 23 or the victory of Psalm 118, there's a Psalm that speaks to your current situation. This free generator helps you discover relevant Psalms for your spiritual journey."
        },
        {
          title: "Popular Psalms and Their Themes",
          content: "Some of the most beloved Psalms include: Psalm 23 (God as Shepherd), Psalm 91 (Protection), Psalm 103 (God's Benefits), Psalm 119 (Love for God's Word), and Psalm 139 (God's Omniscience). Each Psalm offers unique insights into God's character and our relationship with Him. Use this tool daily to explore the breadth and depth of the Psalms—you'll never run out of fresh encouragement and wisdom."
        },
        {
          title: "How to Meditate on Psalms",
          content: "The Psalms are meant to be meditated upon, not just read quickly. When you generate a Psalm verse, read it slowly multiple times. Notice the imagery, the emotions expressed, and the truths about God. Consider memorizing verses that resonate with you. Many Christians make it a practice to read one Psalm per day or pray through the Psalms as their prayer book. This free tool makes it easy to incorporate Psalms into your daily devotional life."
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
      ],
      additionalSections: [
        {
          title: "Solomon's Wisdom for Today",
          content: "Most of Proverbs was written by King Solomon, whom God blessed with supernatural wisdom (1 Kings 3:12). These proverbs address practical matters like business ethics, family relationships, financial management, and personal integrity. While written in ancient times, the principles are timeless. Whether you're navigating workplace challenges, raising children, or managing finances, Proverbs provides divine wisdom that works in every generation and culture."
        },
        {
          title: "A Proverb a Day",
          content: "Many Christians follow a 'Proverb a day' reading plan, reading one chapter of Proverbs each day corresponding to the date (Proverbs 1 on the 1st, etc.). Since Proverbs has 31 chapters, this completes the book monthly. However, you can also use this free random verse generator to receive bite-sized wisdom from Proverbs whenever you need guidance. Each proverb offers practical insight you can apply immediately to your daily life."
        },
        {
          title: "Free Wisdom at Your Fingertips",
          content: "This Bible verse generator gives you instant access to wisdom from Proverbs—no cost, no registration, no barriers. Whether you're making a difficult decision, need guidance for a relationship issue, or want to grow in character, click above to receive a relevant proverb. The wisdom of Proverbs is God's gift to help you navigate life successfully. Use this tool daily to build wisdom into your life, one verse at a time."
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
      ],
      additionalSections: [
        {
          title: "John 3:16 and the Gospel Message",
          content: "John 3:16 is perhaps the most famous verse in the Bible: \"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.\" This verse encapsulates the entire gospel message—God's love, Jesus' sacrifice, the requirement of faith, and the promise of eternal life. The Gospel of John repeatedly emphasizes that eternal life comes through believing in Jesus Christ as God's Son."
        },
        {
          title: "The Seven 'I Am' Statements of Jesus",
          content: "In John's Gospel, Jesus makes seven profound 'I am' declarations: I am the Bread of Life (6:35), the Light of the World (8:12), the Door (10:9), the Good Shepherd (10:11), the Resurrection and the Life (11:25), the Way, the Truth, and the Life (14:6), and the True Vine (15:1). Each statement reveals a different aspect of who Jesus is and what He offers to those who believe. Use this tool to explore these powerful declarations."
        },
        {
          title: "Free Access to John's Gospel",
          content: "This free Bible verse generator gives you instant access to verses from the Gospel of John—the perfect book for seekers and believers alike. Whether you're exploring Christianity for the first time or deepening your understanding of Jesus, John's Gospel is written so that you \"may believe that Jesus is the Messiah, the Son of God, and that by believing you may have life in his name\" (John 20:31). No cost, no barriers—just the life-changing message of Jesus Christ."
        }
      ]
    }
  };

  return contentMap[generator.id] || contentMap.love;
}
