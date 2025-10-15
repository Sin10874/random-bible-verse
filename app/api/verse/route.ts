// app/api/verse/route.ts
import { NextRequest, NextResponse } from "next/server";

/** —— 运行时 & 执行预算 —— */
export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

/** —— 环境变量 —— */
const ARK_API_KEY = process.env.ARK_API_KEY ?? "";
const ARK_API_BASE = (() => {
  const raw = (process.env.ARK_API_BASE?.trim() || "https://ark.cn-beijing.volces.com").replace(/\/+$/, "");
  // 防呆：若误填了完整路径，剥掉
  return raw.replace(/\/(api\/v3|v1)\/chat\/completions$/i, "");
})();
const ARK_MODEL = process.env.ARK_MODEL || "doubao-seed-1-6-flash-250828";
const ARK_TEMPERATURE = 0.0; // 让模型严格返回指定引用原文，避免措辞漂移

/** —— 兜底 —— */
const FALLBACK = {
  text: "Be strong and courageous... for the LORD your God is with you.",
  reference: "Joshua 1:9",
};

/** —— 为“过渡期”准备的引用池（多书卷均匀采样；后续可替换为全量库） —— */
const REFERENCES: string[] = [
  "Genesis 1:1","Genesis 12:2","Exodus 14:14","Leviticus 19:18","Numbers 6:24","Deuteronomy 31:6",
  "Joshua 1:9","Ruth 1:16","1 Samuel 16:7","2 Samuel 22:31","1 Kings 8:57","2 Kings 6:16",
  "1 Chronicles 16:34","2 Chronicles 7:14","Ezra 7:10","Nehemiah 8:10","Esther 4:14","Job 19:25",
  "Psalm 1:1","Psalm 16:11","Psalm 23:1","Psalm 27:1","Psalm 34:8","Psalm 46:1","Psalm 51:10","Psalm 91:1","Psalm 119:105",
  "Proverbs 3:5","Proverbs 4:23","Proverbs 16:3","Ecclesiastes 3:1","Song of Solomon 2:4",
  "Isaiah 9:6","Isaiah 26:3","Isaiah 40:31","Jeremiah 29:11","Lamentations 3:22","Ezekiel 36:26","Daniel 3:17","Hosea 6:6",
  "Joel 2:32","Amos 5:24","Obadiah 1:15","Jonah 2:2","Micah 6:8","Nahum 1:7","Habakkuk 3:19","Zephaniah 3:17","Haggai 1:13","Zechariah 4:6","Malachi 3:10",
  "Matthew 5:9","Matthew 6:33","Matthew 11:28","Mark 10:27","Mark 16:15",
  "Luke 1:37","Luke 6:38","Luke 11:9","John 1:1","John 3:16","John 8:12","John 14:6","John 15:5",
  "Acts 1:8","Acts 2:21","Acts 4:12","Romans 8:1","Romans 8:28","Romans 12:2",
  "1 Corinthians 10:13","1 Corinthians 13:4","2 Corinthians 5:17",
  "Galatians 2:20","Galatians 5:22","Ephesians 2:8","Ephesians 3:20","Philippians 4:6","Philippians 4:13",
  "Colossians 3:2","1 Thessalonians 5:16","2 Thessalonians 3:3",
  "1 Timothy 6:12","2 Timothy 1:7","Titus 3:5","Philemon 1:6",
  "Hebrews 4:12","Hebrews 11:1","James 1:5","1 Peter 5:7","2 Peter 3:9",
  "1 John 1:9","1 John 4:18","2 John 1:6","3 John 1:11","Jude 1:24","Revelation 21:4"
];

/** —— 最近去重（Cookie 保存最近 50 条引用，避免短期重复感） —— */
const DEDUPE_COOKIE = "recent_refs";
const DEDUPE_SIZE = 50;

function readRecent(req: NextRequest): string[] {
  const raw = req.cookies.get(DEDUPE_COOKIE)?.value;
  try { return raw ? JSON.parse(raw) as string[] : []; } catch { return []; }
}
function writeRecent(res: NextResponse, recent: string[]) {
  res.cookies.set(DEDUPE_COOKIE, JSON.stringify(recent.slice(-DEDUPE_SIZE)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  });
}

/** —— 均匀随机选择一个不在“最近列表”里的引用（最多重抽 10 次） —— */
function pickReferenceNotRecent(recent: string[]): string {
  if (recent.length >= REFERENCES.length) {
    // 已经几乎覆盖，直接随机
    return REFERENCES[Math.floor(Math.random() * REFERENCES.length)];
  }
  for (let i = 0; i < 10; i++) {
    const ref = REFERENCES[Math.floor(Math.random() * REFERENCES.length)];
    if (!recent.includes(ref)) return ref;
  }
  // 实在撞到了就返回一个
  return REFERENCES[Math.floor(Math.random() * REFERENCES.length)];
}

/** —— 提示词：按“指定引用”返回 KJV 原文，纯 JSON —— */
function buildArkPayloadWithRef(reference: string) {
  return {
    model: ARK_MODEL,
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text:
          `Return the EXACT King James Version text for the Bible verse "${reference}". ` +
          `Respond in pure JSON only: {"text":"...","reference":"${reference}"}. No extra words.`,
      }],
    }],
    stream: false,
    temperature: ARK_TEMPERATURE,
  };
}

/** —— 辅助：提取 JSON（容错去掉代码块、注释等） —— */
function extractJsonObject(input: string): Record<string, unknown> | null {
  if (!input) return null;
  const codeBlock = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = (codeBlock ? codeBlock[1] : input.trim());
  const first = raw.indexOf("{"); const last = raw.lastIndexOf("}");
  const tryParse = (s: string) => { try { return JSON.parse(s) as Record<string, unknown>; } catch { return null; } };
  if (first >= 0 && last > first) {
    const slice = raw.slice(first, last + 1);
    return tryParse(slice) ?? tryParse(slice.replace(/\/\/.*$/gm, "").replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"));
  }
  return tryParse(raw);
}

/** —— 超时 fetch（默认 8s） —— */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(id); }
}

/** —— 调用 Doubao（原生优先，失败再 compat；指数退避 3 次） —— */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
function isRetryable(status?: number, errName?: string) {
  if (errName === "AbortError") return true;
  if (!status) return true;
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
}

async function callDoubaoForReference(reference: string): Promise<{
  ok: boolean; source: "doubao-native" | "doubao-compat";
  status?: number; data?: { text: string; reference: string }; errText?: string;
}> {
  if (!ARK_API_KEY) return { ok: false, source: "doubao-native", errText: "Missing ARK_API_KEY" };

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${ARK_API_KEY}` };
  const payload = JSON.stringify(buildArkPayloadWithRef(reference));
  const endpoints: { label: "doubao-native" | "doubao-compat"; url: string }[] = [
    { label: "doubao-native", url: `${ARK_API_BASE}/api/v3/chat/completions` },
    { label: "doubao-compat", url: `${ARK_API_BASE}/v1/chat/completions` },
  ];

  for (const ep of endpoints) {
    let attempt = 0;
    let lastErr: { status?: number; body?: string; name?: string; msg?: string } | undefined;

    while (attempt < 3) {
      const timeoutMs = 8000;
      const t0 = Date.now();
      try {
        const r = await fetchWithTimeout(ep.url, { method: "POST", headers, body: payload }, timeoutMs);
        const txt = await r.text();
        if (!r.ok) { lastErr = { status: r.status, body: txt }; }
        else {
          const resp = JSON.parse(txt) as { choices?: { message?: { content?: string } }[] };
          const content = resp.choices?.[0]?.message?.content ?? "";
          const parsed = extractJsonObject(content);
          const text = (parsed?.text && typeof parsed.text === "string") ? parsed.text : "";
          const ref  = (typeof parsed?.reference === "string" && parsed.reference) ? parsed.reference : reference;
          if (text) return { ok: true, source: ep.label, status: r.status, data: { text, reference: ref } };
          lastErr = { status: r.status, body: "Invalid JSON content in message.content" };
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? { name: e.name, msg: e.message } : { msg: String(e) };
        lastErr = err;
      }

      if (!isRetryable(lastErr?.status, lastErr?.name)) break;
      const backoff = [200, 600, 1200][attempt];
      await sleep(backoff);
      attempt++;
      if (Date.now() - t0 > 7000) break; // 保护
    }

    if (lastErr) continue; // 换下一个端点
  }

  return { ok: false, source: "doubao-compat", errText: "All endpoints failed or timed out" };
}

/** —— 探活 —— */
export async function HEAD() {
  return new Response(null, { status: 200, headers: { "cache-control": "no-store" } });
}

/** —— 主处理：支持 ?debug=1 —— */
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const reqId = crypto.randomUUID();
  const start = Date.now();

  // 读取最近引用列表并挑一个不重复的
  const recent = readRecent(req);
  const reference = pickReferenceNotRecent(recent);

  if (!ARK_API_KEY) {
    const res = NextResponse.json({ ...FALLBACK, reference }, { status: 200 });
    res.headers.set("x-source", "fallback-no-key");
    res.headers.set("x-request-id", reqId);
    res.headers.set("cache-control", "no-store");
    writeRecent(res, [...recent, reference]);
    return res;
  }

  const result = await callDoubaoForReference(reference);
  const dur = Date.now() - start;

  if (result.ok && result.data) {
    if (!debug) {
      const res = NextResponse.json(result.data, { status: 200 });
      res.headers.set("x-source", result.source);
      res.headers.set("server-timing", `upstream;dur=${dur}`);
      res.headers.set("x-request-id", reqId);
      res.headers.set("cache-control", "no-store");
      writeRecent(res, [...recent, result.data.reference]);
      return res;
    }
    const res = NextResponse.json({
      ok: true,
      verse: result.data,
      debug: { reqId, upstreamStatus: result.status ?? 200, latencyMs: dur, hasApiKey: true, endpoint: result.source }
    }, { status: 200 });
    res.headers.set("x-source", result.source);
    res.headers.set("server-timing", `upstream;dur=${dur}`);
    res.headers.set("x-request-id", reqId);
    res.headers.set("cache-control", "no-store");
    writeRecent(res, [...recent, result.data.reference]);
    return res;
  }

  // 失败兜底：返回我们选的引用+固定文本，debug 时带错误片段
  if (!debug) {
    const res = NextResponse.json({ ...FALLBACK, reference }, { status: 200 });
    res.headers.set("x-source", "timeout-or-error-fallback");
    res.headers.set("server-timing", `upstream;dur=${dur}`);
    res.headers.set("x-request-id", reqId);
    res.headers.set("cache-control", "no-store");
    writeRecent(res, [...recent, reference]);
    return res;
  }
  const res = NextResponse.json({
    ok: false,
    error: "upstream failed",
    verse: { ...FALLBACK, reference },
    debug: { reqId, latencyMs: dur, hasApiKey: !!ARK_API_KEY }
  }, { status: 500 });
  res.headers.set("x-source", "timeout-or-error-fallback");
  res.headers.set("server-timing", `upstream;dur=${dur}`);
  res.headers.set("x-request-id", reqId);
  res.headers.set("cache-control", "no-store");
  writeRecent(res, [...recent, reference]);
  return res;
}