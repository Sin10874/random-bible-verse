import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_MODEL = process.env.ARK_MODEL ?? "doubao-seed-1-6-flash-250828";
const ARK_API_BASE =
  process.env.ARK_API_BASE ?? "https://ark.cn-beijing.volces.com";

type TextBlock = { type: "text"; text: string };
type Role = "user" | "assistant" | "system";
type Message = { role: Role; content: TextBlock[] };

type ArkChatChoice = {
  message?: {
    role?: Role;
    content?: Array<{ type?: string; text?: string }>;
  };
  finish_reason?: string;
};

type ArkChatResponse = {
  id?: string;
  choices?: ArkChatChoice[];
};

function extractFirstText(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "choices" in data &&
    Array.isArray((data as { choices?: unknown }).choices)
  ) {
    const choices = (data as { choices: ArkChatChoice[] }).choices;
    const first = choices[0];
    const content = first?.message?.content;
    if (Array.isArray(content)) {
      const textBlock = content.find((b) => b?.type === "text");
      if (textBlock && typeof textBlock.text === "string") {
        return textBlock.text.trim();
      }
    }
  }
  return null;
}

const FALLBACKS: Array<{ text: string; reference: string }> = [
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "Be strong and courageous... for the LORD your God is with you.", reference: "Joshua 1:9" },
  { text: "Trust in the LORD with all your heart...", reference: "Proverbs 3:5" },
];

function pickFallback() {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

export async function GET() {
  if (!ARK_API_KEY) {
    const fb = pickFallback();
    return NextResponse.json(fb, { status: 200 });
  }

  try {
    const messages: Message[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Give me ONE random Bible verse in English. Respond ONLY with the verse text and reference on two lines.\n" +
              "Line1: the verse text; Line2: the reference like '— John 3:16'.",
          },
        ],
      },
    ];

    const reqBody = { model: ARK_MODEL, messages };

    const url = `${ARK_API_BASE}/api/v3/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(reqBody),
      cache: "no-store",
    });

    if (!res.ok) {
      const fb = pickFallback();
      return NextResponse.json(fb, { status: 200 });
    }

    const raw: unknown = await res.json();
    const text = extractFirstText(raw);

    if (text) {
      const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
      const verseText = lines[0] ?? text;
      let reference = lines[1] ?? "";
      reference = reference.replace(/^—\s*/, "");

      return NextResponse.json(
        { text: verseText, reference: reference || undefined },
        { status: 200 }
      );
    }

    const fb = pickFallback();
    return NextResponse.json(fb, { status: 200 });
  } catch {
    const fb = pickFallback();
    return NextResponse.json(fb, { status: 200 });
  }
}