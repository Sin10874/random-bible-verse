// app/api/verse/route.ts
import { NextResponse } from "next/server";

// ✅ 强制用 Node.js 运行时，避免某些 Edge 出口对国内域名不稳定
export const runtime = "nodejs";
// ✅ 这条让函数每次都真正执行（不要缓存）
export const dynamic = "force-dynamic";

type ArkMessage =
  | { role: "user"; content: Array<{ type: "text"; text: string }> }
  | { role: "assistant"; content: Array<{ type: "text"; text: string }> };

type ArkChoice = {
  message: { role: "assistant"; content: Array<{ type: "text"; text: string }> };
};

type ArkChatResponse = { choices?: ArkChoice[] };

const API_BASE = (process.env.ARK_API_BASE || "https://ark.cn-beijing.volces.com").replace(/\/+$/, "");
const API_KEY = process.env.ARK_API_KEY;
const MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const TEMP = Number(process.env.ARK_TEMPERATURE ?? 0.7);

// 一个非常简洁的兜底（用于服务异常时）
function fallback() {
  const body = { text: "Be strong and courageous... for the LORD your God is with you.", reference: "Joshua 1:9" };
  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", "x-source": "fallback" },
  });
}

export async function GET() {
  try {
    if (!API_KEY) {
      console.error("[/api/verse] Missing ARK_API_KEY");
      return fallback();
    }

    const url = `${API_BASE}/api/v3/chat/completions`;

    const systemPrompt =
      'Return ONE random Bible verse in English as strict JSON: {"text":"...","reference":"Book X:Y"}. No extra text.';
    const messages: ArkMessage[] = [
      { role: "user", content: [{ type: "text", text: systemPrompt }] },
    ];

    const payload = {
      model: MODEL,
      temperature: TEMP,
      messages,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(no body)");
      console.error("[/api/verse] Doubao non-OK:", res.status, errText);
      return fallback();
    }

    const data = (await res.json()) as ArkChatResponse;
    // 豆包 Ark 的结构：choices[0].message.content[0].text
    const textChunk = data.choices?.[0]?.message?.content?.[0]?.text || "";
    // 期望是严格 JSON
    let parsed: { text?: string; reference?: string } | null = null;
    try {
      parsed = JSON.parse(textChunk);
    } catch (e) {
      console.warn("[/api/verse] parse JSON failed, raw =", textChunk);
    }

    if (!parsed?.text) {
      // 如果模型没按 JSON 回答，就直接把文本塞到 text 字段里
      parsed = { text: textChunk?.trim() || "God is our refuge and strength.", reference: "" };
    }

    return new NextResponse(JSON.stringify(parsed), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "x-source": "doubao" },
    });
  } catch (e) {
    console.error("[/api/verse] Unexpected error:", e);
    return fallback();
  }
}