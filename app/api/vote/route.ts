import { NextResponse } from 'next/server';
import { getServiceKey } from '@/lib/data/admin';
import { addVote, checkRateLimit } from '@/lib/data/mutations';
import { featureBySlug } from '@/lib/features';
import { clientIp, hashIp } from '@/lib/server/ip';
import { RATE_LIMITS } from '@/lib/server/limits';

// 원해요 { slug } (SPEC 14장). 기능 이름과 시각만 저장한다(D-023). 알려진 slug만 받는다.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  try {
    const { limit, windowSeconds } = RATE_LIMITS.vote;
    const ipHash = hashIp(clientIp(request.headers), getServiceKey());
    if (!(await checkRateLimit('vote', ipHash, limit, windowSeconds))) return json({ error: 'rate_limited' }, 429);

    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'bad_request' }, 400);
    const text = await request.text();
    if (text.length > 500) return json({ error: 'bad_request' }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400); }
    const slug = typeof body === 'object' && body !== null ? (body as { slug?: unknown }).slug : undefined;
    if (typeof slug !== 'string' || !featureBySlug(slug)) return json({ error: 'invalid_slug' }, 400);

    await addVote(slug);
    return json({ status: 'ok' });
  } catch (error) {
    console.error('[api/vote]', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'server_error' }, 500);
  }
}
