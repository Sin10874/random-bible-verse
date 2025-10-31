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

// —— 加载 KJV 映射（English - "Book C:V" -> text）——
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

// —— 加载 RV1960 映射（Spanish - "Book C:V" -> text）——
let RV1960_MAP: Record<string, string> = {};
let RV1960_KEYS: string[] = [];
try {
  const filePath = path.join(process.cwd(), "public", "rv1960-map.json");
  const raw = fs.readFileSync(filePath, "utf8");
  RV1960_MAP = JSON.parse(raw) as Record<string, string>;
  RV1960_KEYS = Object.keys(RV1960_MAP);
  console.log(`Loaded RV1960 verses: ${RV1960_KEYS.length}`);
} catch (e) {
  console.error("Failed to load public/rv1960-map.json", e);
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

// —— 根据类别和语言获取可用的经文键列表 ——
function getKeysForCategory(category: string | null, locale: string): string[] {
  // 根据语言选择基础键列表
  const baseKeys = locale === "es" && RV1960_KEYS.length > 0 ? RV1960_KEYS : KJV_KEYS;

  if (!category) return baseKeys;

  const catData = VERSE_CATEGORIES[category];
  if (!catData) return baseKeys;

  // 如果有 verses 列表（主题类/场景类），过滤出在当前语言中存在的经文
  if (catData.verses && catData.verses.length > 0) {
    if (locale === "es" && RV1960_KEYS.length > 0) {
      // 只返回在 RV1960 中存在的经文
      return catData.verses.filter((ref) => RV1960_MAP[ref]);
    }
    return catData.verses;
  }

  // 如果有 bookFilter（书卷类），过滤所有经文
  if (catData.bookFilter) {
    const bookName = catData.bookFilter;
    const exclude = catData.bookExclude || [];

    return baseKeys.filter((key) => {
      // 检查是否以该书卷名开头
      if (!key.startsWith(bookName + " ")) return false;

      // 检查是否需要排除（如 John 排除 1 John, 2 John, 3 John）
      for (const ex of exclude) {
        if (key.startsWith(ex + " ")) return false;
      }

      return true;
    });
  }

  return baseKeys;
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

// —— 清理文本：去掉段落标记"# "（该数据用 # 表示新段落）——
function cleanText(s: string) {
  return s.replace(/^#\s*/gm, "").trim();
}

// —— 根据 locale 获取对应语言的经文文本（带 fallback）——
function getVerseText(reference: string, locale: string): string {
  // 西班牙语：优先使用 RV1960，不存在则 fallback 到 KJV
  if (locale === "es" && RV1960_MAP[reference]) {
    return cleanText(RV1960_MAP[reference]);
  }

  // 其他语言暂时使用 KJV（英文）
  // TODO: 添加其他语言的圣经版本 (pt, zh, tl, fr)
  return cleanText(KJV_MAP[reference] ?? "");
}

// —— 获取圣经版本标识 ——
function getBibleVersion(locale: string): string {
  switch (locale) {
    case "es": return "RV1960";
    case "pt": return "KJV"; // TODO: Almeida Revista e Corrigida
    case "zh": return "KJV"; // TODO: 和合本
    case "tl": return "KJV"; // TODO: Ang Biblia
    case "fr": return "KJV"; // TODO: Louis Segond 1910
    default: return "KJV";
  }
}

// —— 探活 ——
export async function HEAD() {
  return new Response(null, { status: 200, headers: { "cache-control": "no-store" } });
}

// —— 主逻辑：返回原文（支持 ?debug=1, ?category=xxx, ?locale=xx）——
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const category = req.nextUrl.searchParams.get("category");
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const reqId = crypto.randomUUID();
  const t0 = Date.now();

  const recent = readRecent(req);
  const keys = getKeysForCategory(category, locale);
  const reference = pickRefNotRecent(recent, keys);
  const text = getVerseText(reference, locale);
  const version = getBibleVersion(locale);

  const body = debug
    ? {
        ok: true,
        verse: { reference, text },
        debug: {
          source: `local-json-${version.toLowerCase()}-map`,
          version,
          locale,
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