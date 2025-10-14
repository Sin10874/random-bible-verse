// app/api/verse/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Vercel 不缓存，次次新结果

// 本地兜底（豆包不可用或未配置时用）
const FALLBACK_VERSES: { text: string; reference: string }[] = [
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  { text: "For God so loved the world that He gave His only Son.", reference: "John 3:16" },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { text: "Trust in the LORD with all your heart.", reference: "Proverbs 3:5" },
];

type Verse = { text: string; reference?: string };

export async function GET() {
  try {
    const v = await getVerseFromArk();
    return NextResponse.json(v, { status: 200 });
  } catch (e) {
    // 失败兜底：永远返回一条 verse，而不是 500
    const v = FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
    return NextResponse.json(v, { status: 200 });
  }
}

async function getVerseFromArk(): Promise<Verse> {
  const base = process.env.ARK_API_BASE || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  const key = process.env.ARK_API_KEY;
  const model = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
  const temperature = Number(process.env.ARK_TEMPERATURE ?? "0.7");

  if (!key) {
    throw new Error("ARK_API_KEY not configured");
  }

  // 提示词：请豆包只返回 JSON（不加其它文字）
  const userPrompt = `
Return exactly and only a compact JSON with two fields for a random Bible verse:
{"text":"<verse text in English>","reference":"<Book Chapter:Verse>"}
Do not add any extra words, markdown, or code fences. Just JSON.
  `.trim();

  // ARK chat/completions 的请求体（与 OpenAI 格式相似）
  const body = {
    model,
    temperature,
    messages: [
      // 这类模型通常支持 system 指令；若不支持也不影响
      { role: "system", content: "You are a helpful assistant for providing Bible verses." },
      { role: "user", content: userPrompt },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000); // 12 秒超时

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`ARK HTTP ${res.status}`);
    }

    const json = await res.json();
    const verse = parseArkResponse(json);
    if (!verse?.text) throw new Error("Parse ARK response failed");
    return verse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 解析 ARK 返回
 * 典型结构：{ choices: [ { message: { content: "..." } } ] }
 * content 里就是我们要求的 JSON 字符串
 */
function parseArkResponse(json: any): Verse {
  // 保险解析（兼容 content 为字符串或为分段数组的情况）
  let content: string | undefined;

  const choice = json?.choices?.[0];
  if (choice?.message?.content) {
    // 有些实现 content 直接是字符串
    if (typeof choice.message.content === "string") {
      content = choice.message.content;
    }
    // 有些实现 content 可能是数组（多段）
    else if (Array.isArray(choice.message.content)) {
      content = choice.message.content.map((p: any) => p?.text ?? p).join("");
    }
  }

  if (!content) return { text: "" };

  // 去掉可能的 ```json ``` 代码块
  content = content.trim();
  if (content.startsWith("```")) {
    content = content.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }

  // 只接受 JSON
  try {
    const obj = JSON.parse(content);
    if (obj?.text) {
      return { text: String(obj.text), reference: obj.reference ? String(obj.reference) : undefined };
    }
  } catch {
    // 如果不是严格 JSON，可以尝试简单的正则提取（极端容错）
    const m = content.match(/"text"\s*:\s*"([^"]+)"[^]*"reference"\s*:\s*"([^"]+)"/);
    if (m) return { text: m[1], reference: m[2] };
  }

  return { text: "" };
}
