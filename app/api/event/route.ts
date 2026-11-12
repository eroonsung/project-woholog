import { NextResponse } from 'next/server';
import { getServiceKey } from '@/lib/data/admin';
import { addEvent, checkRateLimit, purgeEvents } from '@/lib/data/mutations';
import { parseEvent } from '@/lib/events';
import { clientIp, hashIp } from '@/lib/server/ip';
import { RATE_LIMITS } from '@/lib/server/limits';

// 이용 이벤트 { name, props, path } (SPEC 0.7, D-137). 이름 7종과 각 속성만 받고 나머지는 400. IP는 요청 제한용 해시만 쓰고 이벤트에는 저장하지 않는다.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  try {
    const { limit, windowSeconds } = RATE_LIMITS.event;
    const ipHash = hashIp(clientIp(request.headers), getServiceKey());
    if (!(await checkRateLimit('event', ipHash, limit, windowSeconds))) return json({ error: 'rate_limited' }, 429);

    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'bad_request' }, 400);
    const text = await request.text();
    if (text.length > 500) return json({ error: 'bad_request' }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400); }
    const parsed = parseEvent(body);
    if (!parsed.ok) return json({ error: 'invalid_event' }, 400);

    await addEvent(parsed.value);
    // 보관 13개월(마이그레이션 008): 가끔(약 200번에 한 번) 오래된 행을 지운다. 실패해도 무시.
    if (Math.random() < 0.005) purgeEvents().catch(() => {});
    return json({ status: 'ok' });
  } catch (error) {
    console.error('[api/event]', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'server_error' }, 500);
  }
}
