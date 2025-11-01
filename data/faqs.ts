// FAQ data for GEO (Generative Engine Optimization)
// Optimized for AI search engines: ChatGPT, Perplexity, Claude, Gemini

export interface FAQ {
  question: string;
  answer: string;
}

export interface GeneratorFAQs {
  [key: string]: FAQ[];
}

export const GENERATOR_FAQS: GeneratorFAQs = {
  love: [
    {
      question: "What is the most famous Bible verse about love?",
      answer: "John 3:16 is the most famous Bible verse about love: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' This verse describes God's unconditional love for humanity and is quoted more than any other verse about love."
    },
    {
      question: "Which chapter is called the 'Love Chapter' in the Bible?",
      answer: "1 Corinthians 13 is known as the 'Love Chapter' because it contains the Bible's most comprehensive description of love. It states that love is patient, kind, does not envy, does not boast, and never fails. This chapter is frequently read at weddings and is considered the definitive biblical text on love's characteristics."
    },
    {
      question: "How many times does 'love' appear in the Bible?",
      answer: "The word 'love' appears 686 times in the King James Version (KJV) Bible, with 310 occurrences in the New Testament and 376 in the Old Testament. The high frequency demonstrates love's central importance in biblical teaching."
    },
    {
      question: "What does the Bible say about God's love?",
      answer: "The Bible teaches that God's love is unconditional, sacrificial, and eternal. Key verses include John 3:16 (God's love demonstrated through sending Jesus), Romans 5:8 (God loves us while we were sinners), and 1 John 4:8 (God IS love). Biblical love (agape) is selfless and seeks the highest good of others."
    },
    {
      question: "Are there Bible verses about romantic love?",
      answer: "Yes, the Song of Solomon is entirely dedicated to romantic love between a husband and wife. Additionally, Ephesians 5:25 instructs husbands to love their wives as Christ loved the church, setting a high standard for marital love. These verses celebrate romantic love within the context of marriage."
    }
  ],

  hope: [
    {
      question: "What is the most powerful Bible verse about hope?",
      answer: "Romans 15:13 is considered one of the most powerful hope verses: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.' This verse emphasizes that God himself is the source of hope."
    },
    {
      question: "How does the Bible define hope?",
      answer: "Biblical hope is confident expectation based on God's promises, not wishful thinking. Hebrews 11:1 states that faith is 'the substance of things hoped for, the evidence of things not seen.' Biblical hope is anchored in God's character and faithfulness, making it certain and secure."
    },
    {
      question: "Which book of the Bible talks most about hope?",
      answer: "The book of Psalms contains the most references to hope, with over 30 verses explicitly mentioning hope. The Psalms frequently express trust in God during difficult circumstances and emphasize hope as a source of strength and encouragement."
    },
    {
      question: "What does the Bible say about hope in difficult times?",
      answer: "The Bible teaches that hope sustains believers during trials. Romans 5:3-5 explains that suffering produces perseverance, character, and hope. Psalm 42:11 encourages putting hope in God even when downcast. Biblical hope provides strength and peace regardless of circumstances."
    }
  ],

  strength: [
    {
      question: "What is the most famous Bible verse about strength?",
      answer: "Philippians 4:13 is the most famous strength verse: 'I can do all things through Christ which strengtheneth me.' This verse emphasizes that spiritual strength comes from Christ, not human ability, and has encouraged millions facing challenges."
    },
    {
      question: "What does Isaiah 40:31 say about strength?",
      answer: "Isaiah 40:31 states: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.' This verse promises renewed strength to those who trust in God."
    },
    {
      question: "How many verses about strength are in the Bible?",
      answer: "The word 'strength' appears over 270 times in the KJV Bible. Related concepts like 'strong,' 'mighty,' and 'power' appear hundreds more times, demonstrating that strength from God is a major biblical theme."
    },
    {
      question: "Does God give strength to the weak?",
      answer: "Yes, 2 Corinthians 12:9 states: 'My grace is sufficient for thee: for my strength is made perfect in weakness.' The Bible repeatedly promises that God provides strength to the weak, weary, and powerless (Isaiah 40:29, Psalm 73:26)."
    }
  ],

  faith: [
    {
      question: "What is the best Bible verse for faith?",
      answer: "Hebrews 11:1 is considered the definitive faith verse: 'Now faith is the substance of things hoped for, the evidence of things not seen.' This verse provides the biblical definition of faith and is foundational to understanding Christian belief."
    },
    {
      question: "What did Jesus say about faith?",
      answer: "Jesus taught extensively about faith. In Matthew 17:20, He said faith as small as a mustard seed can move mountains. In Mark 11:22-24, He instructed believers to 'have faith in God' and pray believing. Jesus often commended great faith and rebuked lack of faith."
    },
    {
      question: "What is Hebrews 11 called?",
      answer: "Hebrews 11 is called the 'Faith Chapter' or 'Hall of Faith' because it lists biblical heroes who demonstrated extraordinary faith, including Abel, Noah, Abraham, Moses, and many others. It shows faith in action throughout biblical history."
    },
    {
      question: "How can I increase my faith according to the Bible?",
      answer: "Romans 10:17 states: 'Faith cometh by hearing, and hearing by the word of God.' Faith grows through reading Scripture, prayer, and obeying God. James 2:17 adds that faith without works is dead, so acting on faith also strengthens it."
    }
  ],

  encouragement: [
    {
      question: "What is the most encouraging Bible verse?",
      answer: "Joshua 1:9 is one of the most encouraging verses: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.' This promise of God's constant presence has encouraged countless believers."
    },
    {
      question: "What does the Bible say about encouragement?",
      answer: "The Bible commands believers to encourage one another. 1 Thessalonians 5:11 says 'Wherefore comfort yourselves together, and edify one another.' Hebrews 10:25 instructs Christians to meet together for mutual encouragement. Biblical encouragement builds faith and hope."
    },
    {
      question: "How many encouraging verses are in the Bible?",
      answer: "While 'encourage' appears about 50 times in the KJV, hundreds of verses offer encouragement through promises, comfort, and hope. The Psalms alone contain over 100 encouraging passages about God's faithfulness, protection, and love."
    },
    {
      question: "What Bible verses help with anxiety and fear?",
      answer: "Philippians 4:6-7 addresses anxiety: 'Be careful for nothing; but in every thing by prayer...let your requests be made known unto God.' Isaiah 41:10 combats fear: 'Fear thou not; for I am with thee.' These verses remind believers to trust God with their worries."
    }
  ]
};
