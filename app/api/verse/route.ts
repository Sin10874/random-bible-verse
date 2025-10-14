// app/api/verse/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';
export const dynamic = 'force-dynamic';

type ArkChoice = {
  message?: { content?: string };
};
type ArkResponse = {
  choices?: ArkChoice[];
};

const FALLBACKS = [
  { text: "Be strong and courageous... for the LORD your God is with you.", reference: "Joshua 1:9" },
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "Trust in the LORD with all your heart...", reference: "Proverbs 3:5" },
];

function pickFallback() {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

export async function GET() {
  return handle();
}
export async function POST() {
  return handle();
}

async function handle() {
  const base = process.env.ARK_API_BASE?.replace(/\/$/, '') || 'https://ark.cn-beijing.volces.com';
  const useCompat = process.env.ARK_USE_OPENAI_COMPAT === '1';

  const url = useCompat
    ? `${base}/api/v3/openai/chat/completions`
    : `${base}/api/v3/chat/completions`;

  const key = process.env.ARK_API_KEY || '';
  const model = process.env.ARK_MODEL || 'doubao-seed-1-6-flash-250828';
  const temperature = Number(process.env.ARK_TEMPERATURE ?? 0.7);

  if (!key) {
    console.error('[Doubao] Missing ARK_API_KEY');
    return NextResponse.json({ ...pickFallback() }, { headers: { 'x-source': 'fallback' } });
  }

  try {
    const payload = useCompat
      // OpenAI 兼容格式
      ? {
          model,
          temperature,
          messages: [
            { role: 'user', content: 'Return ONE random Bible verse in JSON with keys "text" and "reference" only.' },
          ],
        }
      // 官方 v3 chat/completions 多模态格式
      : {
          model,
          temperature,
          messages: [
            {
              role: 'user',
              content: [{ type: 'text', text: 'Return ONE random Bible verse in JSON with keys "text" and "reference" only.' }],
            },
          ],
        };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // 给跨区一点余量
      signal: AbortSignal.timeout(15000),
      // 禁止任何中间缓存
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Doubao] non-OK ${res.status}: ${errText}`);
      return NextResponse.json({ ...pickFallback() }, { headers: { 'x-source': 'fallback' }, status: 200 });
    }

    const data = (await res.json()) as ArkResponse;

    // 从 choices[0].message.content 中取文本
    const content = data?.choices?.[0]?.message?.content || '';

    // JSON 解析（模型通常按我们要求返回 JSON）
    try {
      const parsed = JSON.parse(content);
      if (parsed?.text) {
        return NextResponse.json(
          { text: parsed.text, reference: parsed.reference },
          { headers: { 'x-source': 'doubao' }, status: 200 }
        );
      }
    } catch {
      // 不是 JSON 的话，做个简易兜底
    }

    // 简单兜底：把 content 当作纯文本返回
    if (content) {
      return NextResponse.json({ text: content }, { headers: { 'x-source': 'doubao' }, status: 200 });
    }

    // 最后兜底
    return NextResponse.json({ ...pickFallback() }, { headers: { 'x-source': 'fallback' }, status: 200 });
  } catch (e: any) {
    console.error('[Doubao] fetch error:', e?.message || e);
    return NextResponse.json({ ...pickFallback() }, { headers: { 'x-source': 'fallback' }, status: 200 });
  }
}