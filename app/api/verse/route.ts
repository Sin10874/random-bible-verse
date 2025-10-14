import { NextResponse } from "next/server";

type Verse = { text: string; reference?: string };

const ARK_API_BASE = process.env.ARK_API_BASE || "https://ark.cn-beijing.volces.com";
const ARK_API_KEY = process.env.ARK_API_KEY || "";
const ARK_MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE = Number(process.env.ARK_TEMPERATURE ?? 0.7);

// 提示词：返回一个 JSON（只有 text 和 reference）
const PROMPT =
  'Return ONE random Bible verse in JSON with ONLY keys "text" and "reference". No extra words.';

function parseJSONFromString(s: string): Verse | null {
  try {
    const obj = JSON.parse(s);
    if (obj && typeof obj.text === "string") {
      return { text: obj.text, reference: typeof obj.reference === "string" ? obj.reference : undefined };
    }
  } catch {}
  // 兜底：尝试粗提取
  const m = s.match(/"text"\s*:\s*"([^"]+)"/i);
  if (m) return { text: m[1] };
  return null;
}

async function callDoubaoNative(signal: AbortSignal): Promise<{ verse: Verse; source: string }> {
  const url = `${ARK_API_BASE}/api/v3/chat/completions`;

  const body = {
    model: ARK_MODEL,
    stream: false,
    temperature: ARK_TEMPERATURE,
    max_tokens: 120,
    messages: [
      {
        role: "user",
        // 关键：原生端点的 content 是对象数组，type 必须是 "text"
        content: [{ type: "text", text: PROMPT }],
      },
    ],
  } as const;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`[native ${res.status}] ${text}`);
  }

  // 豆包原生返回结构：choices[0].message.content 是字符串
  const data = JSON.parse(text) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data?.choices?.[0]?.message?.content ?? "";
  const parsed = parseJSONFromString(content);
  if (!parsed) throw new Error(`[native parse] invalid content: ${content}`);

  return { verse: parsed, source: "doubao-native" };
}

async function callDoubaoCompat(signal: AbortSignal): Promise<{ verse: Verse; source: string }> {
  const url = `${ARK_API_BASE}/api/v3/openai/chat/completions`;

  const body = {
    model: ARK_MODEL,
    stream: false,
    temperature: ARK_TEMPERATURE,
    max_tokens: 120,
    messages: [
      {
        role: "user",
        // 兼容端点用纯文本 content
        content: PROMPT,
      },
    ],
  } as const;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`[compat ${res.status}] ${text}`);
  }

  // 兼容端点也会返回 choices[0].message.content
  const data = JSON.parse(text) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data?.choices?.[0]?.message?.content ?? "";
  const parsed = parseJSONFromString(content);
  if (!parsed) throw new Error(`[compat parse] invalid content: ${content}`);

  return { verse: parsed, source: "doubao-openai" };
}

async function withRetries<T>(fn: (signal: AbortSignal) => Promise<T>, tries = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 12_000); // 12s 超时
    try {
      const v = await fn(ac.signal);
      clearTimeout(t);
      return v;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      // 指数退避
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

export async function GET() {
  try {
    if (!ARK_API_KEY) throw new Error("Missing ARK_API_KEY");

    // 方案 A：原生端点（你本地已验证成功）
    try {
      const { verse, source } = await withRetries(callDoubaoNative, 2);
      return NextResponse.json(verse, {
        headers: { "x-source": source },
      });
    } catch (eA) {
      // 方案 B：OpenAI 兼容
      const { verse, source } = await withRetries(callDoubaoCompat, 2);
      return NextResponse.json(verse, {
        headers: { "x-source": source, "x-upstream-error-a": String(eA).slice(0, 2000) },
      });
    }
  } catch (e) {
    // 最后兜底（不会让前端报错）
    const fallback: Verse = {
      text: "Be strong and courageous... for the LORD your God is with you.",
      reference: "Joshua 1:9",
    };
    return NextResponse.json(fallback, {
      headers: {
        "x-source": "fallback",
        "x-upstream-error": String(e).slice(0, 2000),
      },
    });
  }
}