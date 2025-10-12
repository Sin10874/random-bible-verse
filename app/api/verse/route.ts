// app/api/verse/route.ts
import { NextResponse } from "next/server";

type Verse = { text: string; reference?: string };

const FALLBACK: Verse[] = [
  { text: "Trust in the LORD with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
];

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.DOUBAO_API_KEY;
  const apiUrl = process.env.DOUBAO_API_URL;
  const model  = process.env.DOUBAO_MODEL;

  if (!apiKey || !apiUrl || !model) {
    const v = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    return NextResponse.json({ source: "fallback", ...v }, { status: 200 });
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "user", content: "Return ONE random Bible verse as JSON {text, reference} only." },
        ],
        temperature: 0.9,
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Doubao error: ${res.status}`);

    const data = await res.json();

    let verse: Verse | null = null;
    try {
      const content = data?.choices?.[0]?.message?.content;
      verse = typeof content === "string" ? JSON.parse(content) : null;
    } catch {}
    if (!verse?.text) verse = data?.verse ?? data?.result ?? null;
    if (!verse?.text) throw new Error("Parse failed");

    return NextResponse.json({ source: "doubao", ...verse }, { status: 200 });
  } catch {
    const v = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    return NextResponse.json({ source: "fallback", ...v }, { status: 200 });
  }
}
