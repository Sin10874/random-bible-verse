// app/api/verse/route.ts

import type { NextRequest } from "next/server";

/** 用于严格类型的响应结构 */
interface ArkChatMessagePartText {
  type: "text";
  text: string;
}
interface ArkChatMessage {
  role: "user" | "assistant" | "system";
  content: ArkChatMessagePartText[];
}
interface ArkChatRequest {
  model: string;
  messages: ArkChatMessage[];
  stream?: boolean;
  temperature?: number;
}
interface ArkChatChoiceMessage {
  role: "assistant";
  content: string; // doubao 返回的 content 是 string（JSON 字符串）
}
interface ArkChatChoice {
  index: number;
  finish_reason: string | null;
  message: ArkChatChoiceMessage;
}
interface ArkChatError {
  error: {
    code?: string;
    message?: string;
    type?: string;
  };
}
interface ArkChatResponse {
  id?: string;
  model?: string;
  choices?: ArkChatChoice[];
  // 有错时是 error 结构
  error?: ArkChatError["error"];
}

/** 站点稳定兜底 */
const FALLBACK: { text: string; reference: string } = {
  text: "Be strong and courageous... for the LORD your God is with you.",
  reference: "Joshua 1:9",
};

/** —— 关键：切换到 Node.js Runtime，避免 Edge 的易超时问题 —— */
export const runtime = "nodejs";
// （可选）优先执行地区，Node 也会参考
export const preferredRegion = ["hkg1", "sin1", "hnd1"];

/** Node 的缓存策略：强制动态，确保每次都能打到函数 */
export const dynamic = "force-dynamic";

/** 读环境变量 */
const ARK_API_KEY = process.env.ARK_API_KEY ?? "";
const ARK_API_BASE =
  process.env.ARK_API_BASE?.replace(/\/+$/, "") ||
  "https://ark.cn-beijing.volces.com";
const ARK_MODEL =
  process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE =
  process.env.ARK_TEMPERATURE ? Number(process.env.ARK_TEMPERATURE) : 0.7;

/** 统一的超时 fetch（8s 超时） */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/** 组装请求体 */
function buildArkPayload(): ArkChatRequest {
  const msg: ArkChatMessage = {
    role: "user",
    content: [
      {
        type: "text",
        text:
          'Return ONE random Bible verse in JSON with keys "text" and "reference" only. Use concise wording.',
      },
    ],
  };
  return {
    model: ARK_MODEL,
    messages: [msg],
    stream: false,
    temperature: ARK_TEMPERATURE,
  };
}

/** 调 Doubao（原生 OpenAI 兼容）两种端点择优 */
async function callDoubao(): Promise<{
  ok: boolean;
  source: "doubao-native" | "doubao-compat";
  data?: { text: string; reference?: string };
  errText?: string;
}> {
  if (!ARK_API_KEY) {
    return { ok: false, source: "doubao-native", errText: "Missing ARK_API_KEY" };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ARK_API_KEY}`,
  };

  const payload = JSON.stringify(buildArkPayload());

  // 先试官方 v3（原生）
  const nativeUrl = `${ARK_API_BASE}/api/v3/chat/completions`;
  try {
    const r = await fetchWithTimeout(nativeUrl, { method: "POST", headers, body: payload }, 8000);
    const text = await r.text();

    if (!r.ok) {
      return { ok: false, source: "doubao-native", errText: text };
    }
    const json = JSON.parse(text) as ArkChatResponse;
    const choice = json.choices?.[0];
    const contentStr = choice?.message?.content ?? "";
    // doubao 把 JSON 放在字符串里，需再 parse 一次
    const parsed = JSON.parse(contentStr) as { text: string; reference?: string };
    return { ok: true, source: "doubao-native", data: parsed };
  } catch (e) {
    // 走兼容端点
  }

  // 再试 OpenAI 兼容端点（部分地域更稳）
  const compatUrl = `${ARK_API_BASE}/v1/chat/completions`;
  try {
    const r = await fetchWithTimeout(compatUrl, { method: "POST", headers, body: payload }, 8000);
    const text = await r.text();

    if (!r.ok) {
      return { ok: false, source: "doubao-compat", errText: text };
    }
    const json = JSON.parse(text) as ArkChatResponse;
    const choice = json.choices?.[0];
    const contentStr = choice?.message?.content ?? "";
    const parsed = JSON.parse(contentStr) as { text: string; reference?: string };
    return { ok: true, source: "doubao-compat", data: parsed };
  } catch (e) {
    return { ok: false, source: "doubao-compat", errText: String(e) };
  }
}

/** HEAD 用于探活/监控，快速返回 */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "cache-control": "no-store",
    },
  });
}

/** GET 实际生成经文 */
export async function GET(_req: NextRequest) {
  // 若缺少 KEY，直接兜底
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

  // 调豆包（带双端点 + 超时）
  const result = await callDoubao();

  if (result.ok && result.data) {
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-source": result.source, // 这里能看出是不是走了 doubao
      },
    });
  }

  // 失败兜底，同时把上游错误透出到响应头，便于 curl -I 排查
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
