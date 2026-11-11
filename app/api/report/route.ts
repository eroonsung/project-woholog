import { NextResponse } from 'next/server';
import { getServiceKey } from '@/lib/data/admin';
import { addReport, checkRateLimit } from '@/lib/data/mutations';
import { parseReport } from '@/lib/report';
import { clientIp, hashIp } from '@/lib/server/ip';
import { RATE_LIMITS } from '@/lib/server/limits';

// 정보 제보 { message, country?, screen, section?, path? } (SPEC 13장). 5~2,000자, 연락처 칸 없음. 내용은 로그에 남기지 않는다.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000; // 2,000자(한글 3바이트·JSON 이스케이프) + 여유
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  try {
    const { limit, windowSeconds } = RATE_LIMITS.report;
    const ipHash = hashIp(clientIp(request.headers), getServiceKey());
    if (!(await checkRateLimit('report', ipHash, limit, windowSeconds))) return json({ error: 'rate_limited' }, 429);

    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'bad_request' }, 400);
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'bad_request' }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400); }

    const parsed = parseReport(body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    await addReport({ country: parsed.value.country, page: parsed.value.page, message: parsed.value.message });
    return json({ status: 'ok', screen: parsed.value.screen });
  } catch (error) {
    console.error('[api/report]', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'server_error' }, 500);
  }
}
