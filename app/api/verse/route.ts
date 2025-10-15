// app/api/verse/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = ["hkg1", "sin1", "hnd1"];
export const maxDuration = 15;

/** 兜底 */
const FALLBACK = {
  text: "Be strong and courageous... for the LORD your God is with you.",
  reference: "Joshua 1:9",
};

/** 环境变量 */
const ARK_API_KEY = process.env.ARK_API_KEY ?? "";
const ARK_API_BASE = (process.env.ARK_API_BASE ?? "https://ark.cn-beijing.volces.com").replace(/\/+$/, "");
const ARK_MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE = process.env.ARK_TEMPERATURE ? Number(process.env.ARK_TEMPERATURE) : 0.7;

/** 构造请求体 */
function buildArkPayload() {
  return {
    model: ARK_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              'Return ONE random Bible verse in JSON with keys "text" and "reference" only. Use concise wording.',
          },
        ],
      },
    ],
    stream: false,
    temperature: ARK_TEMPERATURE,
  };
}

/** 通用 fetch + 超时 */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** 调豆包 */
async function callDoubao(): Promise<{
  ok: boolean;
  source: "doubao-native" | "doubao-compat";
  data?: { text: string; reference?: string };
  errText?: string;
}> {
  if (!ARK_API_KEY) return { ok: false, source: "doubao-native", errText: "Missing ARK_API_KEY" };

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${ARK_API_KEY}` };
  const payload = JSON.stringify(buildArkPayload());

  // 尝试原生端点
  const nativeUrl = `${ARK_API_BASE}/api/v3/chat/completions`;
  try {
    const r = await fetchWithTimeout(nativeUrl, { method: "POST", headers, body: payload }, 8000);
    const text = await r.text();
    if (!r.ok) return { ok: false, source: "doubao-native", errText: text };

    const json = JSON.parse(text);
    const contentStr = json.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(contentStr);
    return { ok: true, source: "doubao-native", data: parsed };
  } catch {
    // 再试兼容端点
  }

  const compatUrl = `${ARK_API_BASE}/v1/chat/completions`;
  try {
    const r = await fetchWithTimeout(compatUrl, { method: "POST", headers, body: payload }, 8000);
    const text = await r.text();
    if (!r.ok) return { ok: false, source: "doubao-compat", errText: text };

    const json = JSON.parse(text);
    const contentStr = json.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(contentStr);
    return { ok: true, source: "doubao-compat", data: parsed };
  } catch (e) {
    return { ok: false, source: "doubao-compat", errText: String(e) };
  }
}

/** 探活 */
export async function HEAD() {
  return new Response(null, { status: 200, headers: { "cache-control": "no-store" } });
}

/** 主体 GET */
export async function GET(_req: NextRequest) {
  if (!ARK_API_KEY) {
    return new Response(JSON.stringify(FALLBACK), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-source": "fallback-no-key",
      },
    });
  }

  const result = await callDoubao();
  if (result.ok && result.data) {
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-source": result.source,
      },
    });
  }

  return new Response(JSON.stringify(FALLBACK), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-source": "timeout-or-error-fallback",
      ...(result.errText ? { "x-upstream-error": truncate(result.errText, 512) } : {}),
    },
  });
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
