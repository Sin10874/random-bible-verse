// app/api/verse/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 5;

// —— 最近去重（用 Cookie 存最近 50 条引用，降低短期重复感）——
const DEDUPE_COOKIE = "recent_refs";
const DEDUPE_SIZE = 50;

function readRecent(req: NextRequest): string[] {
  const raw = req.cookies.get(DEDUPE_COOKIE)?.value;
  try { return raw ? (JSON.parse(raw) as string[]) : []; } catch { return []; }
}
function writeRecent(res: NextResponse, recent: string[]) {
  res.cookies.set(DEDUPE_COOKIE, JSON.stringify(recent.slice(-DEDUPE_SIZE)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  });
}

// —— 加载 KJV 映射（"Book C:V" -> text）——
let KJV_MAP: Record<string, string> = {};
let KJV_KEYS: string[] = [];
try {
  const filePath = path.join(process.cwd(), "public", "kjv-map.json");
  const raw = fs.readFileSync(filePath, "utf8");
  KJV_MAP = JSON.parse(raw) as Record<string, string>;
  KJV_KEYS = Object.keys(KJV_MAP);
  console.log(`Loaded KJV verses: ${KJV_KEYS.length}`);
} catch (e) {
  console.error("Failed to load public/kjv-map.json", e);
}

// —— 加载经文分类数据 ——
interface CategoryData {
  name: string;
  description: string;
  verses?: string[];
  bookFilter?: string;
  bookExclude?: string[];
}
let VERSE_CATEGORIES: Record<string, CategoryData> = {};
try {
  const filePath = path.join(process.cwd(), "public", "verse-categories.json");
  const raw = fs.readFileSync(filePath, "utf8");
  VERSE_CATEGORIES = JSON.parse(raw) as Record<string, CategoryData>;
  console.log(`Loaded verse categories: ${Object.keys(VERSE_CATEGORIES).length}`);
} catch (e) {
  console.error("Failed to load public/verse-categories.json", e);
}

// —— 根据类别获取可用的经文键列表 ——
function getKeysForCategory(category: string | null): string[] {
  if (!category) return KJV_KEYS;

  const catData = VERSE_CATEGORIES[category];
  if (!catData) return KJV_KEYS;

  // 如果有 verses 列表（主题类/场景类），直接返回
  if (catData.verses && catData.verses.length > 0) {
    return catData.verses;
  }

  // 如果有 bookFilter（书卷类），过滤所有经文
  if (catData.bookFilter) {
    const bookName = catData.bookFilter;
    const exclude = catData.bookExclude || [];

    return KJV_KEYS.filter((key) => {
      // 检查是否以该书卷名开头
      if (!key.startsWith(bookName + " ")) return false;

      // 检查是否需要排除（如 John 排除 1 John, 2 John, 3 John）
      for (const ex of exclude) {
        if (key.startsWith(ex + " ")) return false;
      }

      return true;
    });
  }

  return KJV_KEYS;
}

// —— 均匀随机选一个"近期未出现"的引用（最多重抽 10 次）——
function pickRefNotRecent(recent: string[], keys: string[]): string {
  if (keys.length === 0) throw new Error("No verses available for this category");
  if (recent.length >= keys.length) {
    return keys[Math.floor(Math.random() * keys.length)];
  }
  for (let i = 0; i < 10; i++) {
    const ref = keys[Math.floor(Math.random() * keys.length)];
    if (!recent.includes(ref)) return ref;
  }
  return keys[Math.floor(Math.random() * keys.length)];
}

// —— 清理文本：去掉段落标记“# ”（该数据用 # 表示新段落）——
function cleanText(s: string) {
  return s.replace(/^#\s*/gm, "").trim();
}

// —— 探活 —— 
export async function HEAD() {
  return new Response(null, { status: 200, headers: { "cache-control": "no-store" } });
}

// —— 主逻辑：返回原文（支持 ?debug=1 和 ?category=xxx）——
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const category = req.nextUrl.searchParams.get("category");
  const reqId = crypto.randomUUID();
  const t0 = Date.now();

  const recent = readRecent(req);
  const keys = getKeysForCategory(category);
  const reference = pickRefNotRecent(recent, keys);
  const text = cleanText(KJV_MAP[reference] ?? "");

  const body = debug
    ? {
        ok: true,
        verse: { reference, text },
        debug: {
          source: "local-json-kjv-map",
          category: category || "all",
          availableVerses: keys.length,
          latencyMs: Date.now() - t0
        }
      }
    : { reference, text };

  const res = NextResponse.json(body, { status: 200 });
  res.headers.set("x-source", "local-json-kjv-map");
  res.headers.set("x-request-id", reqId);
  res.headers.set("cache-control", "no-store");
  res.headers.set("server-timing", `select;dur=${Date.now() - t0}`);
  writeRecent(res, [...recent, reference]);
  return res;
}