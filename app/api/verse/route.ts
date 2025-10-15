// app/api/verse/route.ts
import { NextRequest, NextResponse } from "next/server";

/** —— 运行时&执行时间 —— */
export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

/** —— 环境变量 —— */
const ARK_API_KEY = process.env.ARK_API_KEY ?? "";
const ARK_API_BASE =
  process.env.ARK_API_BASE?.replace(/\/+$/, "") ||
  "https://ark.cn-beijing.volces.com";
const ARK_MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE = process.env.ARK_TEMPERATURE
  ? Number(process.env.ARK_TEMPERATURE)
  : 0.7;

/** —— 兜底 —— */
const FALLBACK: { text: string; reference: string } = {
  text: "Be strong and courageous... for the LORD your God is with you.",
  reference: "Joshua 1:9",
};

/** —— 类型 —— */
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
  content: string; // Doubao 把 JSON 放在字符串里
}
interface ArkChatChoice {
  index: number;
  finish_reason: string | null;
  message: ArkChatChoiceMessage;
}
interface ArkChatResponse {
  id?: string;
  model?: string;
  choices?: ArkChatChoice[];
  error?: {
    code?: string;
    message?: string;
    type?: string;
  };
}

/** —— 工具 —— */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildArkPayload(): ArkChatRequest {
  const msg: ArkChatMessage = {
    role: "user",
    content: [
      {
        type: "text",
        text:
          'Return ONE random Bible verse in *pure JSON* (no extra text). Shape: {"text":"...","reference":"Book N:N"}. Use concise standard English.',
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

/** 将 unknown 错误转为可读对象 */
function toErrorInfo(e: unknown): { name?: string; message: string } {
  if (e instanceof Error) return { name: e.name, message: e.message };
  if (typeof e === "object" && e && "toString" in e) {
    return { message: String(e) };
  }
  return { message: String(e) };
}

/** JSON 提取：剥离 ```json 代码块或前后噪声 */
function extractJsonObject(input: string): Record<string, unknown> | null {
  if (!input) return null;
  const codeBlock = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = codeBlock ? codeBlock[1] : input.trim();

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  const tryParse = (s: string) => {
    try {
      return JSON.parse(s) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  if (first >= 0 && last > first) {
    const slice = raw.slice(first, last + 1);
    const parsed = tryParse(slice);
    if (parsed) return parsed;
    const cleaned = slice
      .replace(/\/\/.*$/gm, "")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return tryParse(cleaned);
  }
  return tryParse(raw);
}

/** 超时 fetch（默认 8s） */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** 重试判断（429/5xx/AbortError） */
function isRetryable(status: number | undefined, errName?: string) {
  if (errName === "AbortError") return true;
  if (!status) return true;
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
}

/** 单次尝试并解析 */
async function attemptOnce(
  url: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs: number
): Promise<{
  ok: boolean;
  status?: number;
  text?: string;
  data?: { text: string; reference?: string };
  errorName?: string;
  errorMsg?: string;
}> {
  try {
    const r = await fetchWithTimeout(
      url,
      { method: "POST", headers, body },
      timeoutMs
    );
    const txt = await r.text();
    if (!r.ok) {
      return { ok: false, status: r.status, text: txt };
    }
    const json = JSON.parse(txt) as ArkChatResponse;
    const choice = json.choices?.[0];
    const contentStr = choice?.message?.content ?? "";

    const parsed = extractJsonObject(contentStr);
    if (
      parsed &&
      typeof parsed.text === "string" &&
      parsed.text.length > 0
    ) {
      const ref =
        typeof parsed.reference === "string" ? parsed.reference : undefined;
      return { ok: true, status: r.status, text: txt, data: { text: parsed.text, reference: ref } };
    }
    return {
      ok: false,
      status: r.status,
      text: txt,
      errorMsg: "Invalid JSON content in message.content",
    };
  } catch (e: unknown) {
    const info = toErrorInfo(e);
    return {
      ok: false,
      errorName: info.name,
      errorMsg: info.message,
    };
  }
}

/** 调 Doubao，带回退与重试 */
async function callDoubao(): Promise<{
  ok: boolean;
  source: "doubao-native" | "doubao-compat";
  status?: number;
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

  const endpoints: { label: "doubao-native" | "doubao-compat"; url: string }[] =
    [
      { label: "doubao-native", url: `${ARK_API_BASE}/api/v3/chat/completions` },
      { label: "doubao-compat", url: `${ARK_API_BASE}/v1/chat/completions` },
    ];

  for (const ep of endpoints) {
    let attempt = 0;
    let lastErr: { status?: number; body?: string; name?: string; msg?: string } | undefined;

    while (attempt < 3) {
      const timeoutMs = 8000;
      const t0 = Date.now();
      const res = await attemptOnce(ep.url, payload, headers, timeoutMs);
      const dur = Date.now() - t0;

      if (res.ok && res.data) {
        return {
          ok: true,
          source: ep.label,
          status: res.status,
          data: res.data,
        };
      }

      lastErr = {
        status: res.status,
        body: res.text || res.errorMsg,
        name: res.errorName,
        msg: res.errorMsg,
      };

      if (!isRetryable(res.status, res.errorName)) break;

      const backoff = [200, 600, 1200][attempt];
      await sleep(backoff);
      attempt += 1;

      if (dur > 7000) break; // 保护：接近 8s 就别再拖
    }

    // 换下一个端点
    if (lastErr) continue;
  }

  return {
    ok: false,
    source: "doubao-compat",
    errText: "All endpoints failed or timed out",
  };
}

/** 探活 */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}

/** 主处理：支持 ?debug=1 */
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const reqId = crypto.randomUUID();
  const t0 = Date.now();

  if (!ARK_API_KEY) {
    return withHeaders(
      NextResponse.json(FALLBACK, { status: 200 }),
      {
        "x-source": "fallback-no-key",
        "x-request-id": reqId,
        "server-timing": `total;dur=${Date.now() - t0}`,
        "cache-control": "no-store",
      }
    );
  }

  const result = await callDoubao();
  const dur = Date.now() - t0;

  if (result.ok && result.data) {
    if (!debug) {
      return withHeaders(
        NextResponse.json(result.data, { status: 200 }),
        {
          "x-source": result.source,
          "x-request-id": reqId,
          "server-timing": `upstream;dur=${dur}`,
          "cache-control": "no-store",
        }
      );
    }
    return withHeaders(
      NextResponse.json(
        {
          ok: true,
          verse: result.data,
          debug: {
            reqId,
            upstreamStatus: result.status ?? 200,
            latencyMs: dur,
            hasApiKey: true,
            endpoint: result.source,
          },
        },
        { status: 200 }
      ),
      {
        "x-source": result.source,
        "x-request-id": reqId,
        "server-timing": `upstream;dur=${dur}`,
        "cache-control": "no-store",
      }
    );
  }

  const headers: Record<string, string> = {
    "x-source": "timeout-or-error-fallback",
    "x-request-id": reqId,
    "server-timing": `upstream;dur=${dur}`,
    "cache-control": "no-store",
  };
  if (debug && result.errText) headers["x-upstream-error"] = truncate(result.errText, 512);

  if (!debug) {
    return withHeaders(NextResponse.json(FALLBACK, { status: 200 }), headers);
  }
  return withHeaders(
    NextResponse.json(
      {
        ok: false,
        error: result.errText || "unknown upstream error",
        verse: FALLBACK,
        debug: { reqId, hasApiKey: !!ARK_API_KEY, latencyMs: dur },
      },
      { status: 500 }
    ),
    headers
  );
}

/** —— 辅助 —— */
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
function withHeaders(res: NextResponse, headers: Record<string, string>) {
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}