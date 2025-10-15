// app/api/verse/route.ts
import { NextRequest, NextResponse } from "next/server";

/** —— 运行时&执行时间 —— */
export const runtime = "nodejs";
export const maxDuration = 10; // Hobby 建议显式标注，避免无意超时
export const dynamic = "force-dynamic"; // 每次命中函数

/** —— 环境变量 —— */
const ARK_API_KEY = process.env.ARK_API_KEY ?? "";
const ARK_API_BASE =
  process.env.ARK_API_BASE?.replace(/\/+$/, "") ||
  "https://ark.cn-beijing.volces.com";
const ARK_MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE = process.env.ARK_TEMPERATURE
  ? Number(process.env.ARK_TEMPERATURE)
  : 0.7;

/** —— 站点兜底 —— */
const FALLBACK: { text: string; reference: string } = {
  text: "Be strong and courageous... for the LORD your God is with you.",
  reference: "Joshua 1:9",
};

/** —— 类型声明（与你保持一致） —— */
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
  content: string; // doubao 返回的 content 是 string（JSON 文本）
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

/** —— 小工具 —— */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildArkPayload(): ArkChatRequest {
  const msg: ArkChatMessage = {
    role: "user",
    content: [
      {
        type: "text",
        text:
          'Return ONE random Bible verse in *pure JSON* (no extra text). Shape: {"text": "...", "reference": "Book N:N"}. Keep the verse concise and standard English.',
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

/** JSON 提取：剥离 ```json 代码块或前后噪声 */
function extractJsonObject(input: string): any | null {
  if (!input) return null;

  // 优先提取 ```json ... ``` 代码块
  const codeBlock = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = codeBlock ? codeBlock[1] : input.trim();

  // 尝试定位第一个 { 到最后一个 }
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const slice = raw.slice(first, last + 1);
    try {
      return JSON.parse(slice);
    } catch {
      // 再尝试去掉可能的注释或尾随逗号（简单清洗）
      try {
        const cleaned = slice
          .replace(/\/\/.*$/gm, "")
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }

  // 兜底：直接 parse
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 统一的超时 fetch（默认 8s） */
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

/** 判断是否可重试（429/5xx/AbortError） */
function isRetryable(status: number | undefined, errName?: string) {
  if (errName === "AbortError") return true;
  if (!status) return true;
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
}

/** 对单个端点执行一次请求并解析 */
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
    // 解析 doubao 的 JSON响应
    const json = JSON.parse(txt) as ArkChatResponse;
    const choice = json.choices?.[0];
    const contentStr = choice?.message?.content ?? "";

    // content 里是 JSON 文本，再 parse
    const parsed = extractJsonObject(contentStr);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.text === "string" &&
      parsed.text.length > 0
    ) {
      // reference 可选
      return { ok: true, status: r.status, text: txt, data: parsed };
    }
    // 解析失败也当作错误，便于回退/兜底
    return {
      ok: false,
      status: r.status,
      text: txt,
      errorMsg: "Invalid JSON content in message.content",
    };
  } catch (e: any) {
    return {
      ok: false,
      errorName: e?.name,
      errorMsg: e?.message || String(e),
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

  // 两个端点按顺序尝试：v3 原生 -> v1 兼容
  const endpoints: { label: "doubao-native" | "doubao-compat"; url: string }[] =
    [
      { label: "doubao-native", url: `${ARK_API_BASE}/api/v3/chat/completions` },
      { label: "doubao-compat", url: `${ARK_API_BASE}/v1/chat/completions` },
    ];

  for (const ep of endpoints) {
    let attempt = 0;
    let lastErr: { status?: number; body?: string; name?: string; msg?: string } | undefined;

    while (attempt < 3) {
      const timeoutMs = 8000; // 每次尝试的超时
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

      // 不可重试就直接换端点 / 兜底
      if (!isRetryable(res.status, res.errorName)) break;

      // 指数退避：200ms, 600ms, 1200ms（总预算<10s）
      const backoff = [200, 600, 1200][attempt];
      await sleep(backoff);
      attempt += 1;

      // 粗暴防护：如果单次已接近 8s，再继续也会撞 maxDuration，直接退出
      if (dur > 7000) break;
    }

    // 尝试下一个端点
    if (lastErr) {
      // 若是第一个端点失败，继续试第二个
      continue;
    }
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

  // 失败兜底（可从响应头看到 err 摘要）
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