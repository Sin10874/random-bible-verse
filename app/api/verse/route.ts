// app/api/verse/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 5; // 本地读文件非常快，不需要更高预算

/** 最近去重（Cookie 保存最近 50 条引用，避免短期重复） */
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

/** 均匀随机取一个不在 recent 里的 */
function pickRandom<T>(arr: T[], recent: string[], key: (t: T) => string): T {
  if (!arr.length) throw new Error("Empty verse list");
  for (let i = 0; i < 10; i++) {
    const item = arr[Math.floor(Math.random() * arr.length)];
    if (!recent.includes(key(item))) return item;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 加载本地经文 JSON */
let VERSES: { reference: string; text: string }[] = [];
try {
  const filePath = path.join(process.cwd(), "public", "kjv.json");
  const raw = fs.readFileSync(filePath, "utf8");
  VERSES = JSON.parse(raw);
  console.log(`Loaded ${VERSES.length} verses from kjv.json`);
} catch (e) {
  console.error("Failed to load kjv.json", e);
}

/** GET: 返回随机经文 */
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const reqId = crypto.randomUUID();
  const t0 = Date.now();

  const recent = readRecent(req);
  const verse = pickRandom(VERSES, recent, (v) => v.reference);
  const dur = Date.now() - t0;

  const resBody = debug
    ? { ok: true, verse, debug: { reqId, latencyMs: dur, source: "local-json" } }
    : verse;

  const res = NextResponse.json(resBody, { status: 200 });
  res.headers.set("x-source", "local-json");
  res.headers.set("x-request-id", reqId);
  res.headers.set("server-timing", `select;dur=${dur}`);
  res.headers.set("cache-control", "no-store");
  writeRecent(res, [...recent, verse.reference]);
  return res;
}