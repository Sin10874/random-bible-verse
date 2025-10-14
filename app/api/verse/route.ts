// ✅ 放在 app/api/verse/route.ts 文件最上方
export const runtime = "edge";  
export const preferredRegion = ["hkg1", "sin1", "hnd1"]; // 香港、新加坡、东京（羽田）
export const maxDuration = 20;

import { NextResponse } from "next/server";

type Verse = { text: string; reference?: string };

const ARK_API_BASE = process.env.ARK_API_BASE || "https://ark.cn-beijing.volces.com";
const ARK_API_KEY = process.env.ARK_API_KEY || "";
const ARK_MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE = Number(process.env.ARK_TEMPERATURE ?? 0.7);

const PROMPT =
  'Return ONE random Bible verse in JSON with ONLY keys "text" and "reference". No extra words.';

function parseJSONFromString(s: string): Verse | null {
  try {
    const obj = JSON.parse(s);
    if (obj && typeof obj.text === "string") {
      return { text: obj.text, reference: typeof obj.reference === "string" ? obj.reference : undefined };
    }
  } catch {}
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
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: PROMPT }], // 原生端点要求对象数组
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
  if (!res.ok) throw new Error(`[native ${res.status}] ${text}`);

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
    messages: [
      {
        role: "user",
        content: PROMPT, // 兼容端点用纯文本
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
  if (!res.ok) throw new Error(`[compat ${res.status}] ${text}`);

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
    const t = setTimeout(() => ac.abort(), 12000);
    try {
      const v = await fn(ac.signal);
      clearTimeout(t);
      return v;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

export async function GET() {
  let nativeErr: unknown;
  let compatErr: unknown;

  try {
    if (!ARK_API_KEY) throw new Error("Missing ARK_API_KEY");

    // 先试原生
    try {
      const { verse, source } = await withRetries(callDoubaoNative, 2);
      return NextResponse.json(verse, { headers: { "x-source": source } });
    } catch (eA) {
      nativeErr = eA;
    }

    // 再试兼容
    try {
      const { verse, source } = await withRetries(callDoubaoCompat, 2);
      return NextResponse.json(verse, {
        headers: { "x-source": source, "x-upstream-error-native": String(nativeErr ?? "") },
      });
    } catch (eB) {
      compatErr = eB;
      throw eB; // 统一走兜底
    }
  } catch (e) {
    const fallback: Verse = {
      text: "Be strong and courageous... for the LORD your God is with you.",
      reference: "Joshua 1:9",
    };
    return NextResponse.json(fallback, {
      headers: {
        "x-source": "fallback",
        "x-upstream-error-native": String(nativeErr ?? "").slice(0, 1500),
        "x-upstream-error-compat": String(compatErr ?? "").slice(0, 1500),
      },
    });
  }
}
