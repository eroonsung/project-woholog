import { NextResponse } from 'next/server';
import { getServiceKey } from '@/lib/data/admin';
import { addSubscriber, checkRateLimit } from '@/lib/data/mutations';
import { clientIp, hashIp } from '@/lib/server/ip';
import { RATE_LIMITS } from '@/lib/server/limits';
import { CONSENT_VERSION, DB_SECTION, parseSubscribe } from '@/lib/subscribe';

// 이메일 신청 { email, section: 'launch'|'to_korea', consent: true } (SPEC 11·12장). 형식·동의를 서버에서 다시 검사하고,
// 이메일은 소문자·공백 정리, consented_at + consent_version을 같이 저장한다. 이미 신청한 이메일은 { status: 'exists' } (D-024).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2_000;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  try {
    const { limit, windowSeconds } = RATE_LIMITS.subscribe;
    const ipHash = hashIp(clientIp(request.headers), getServiceKey());
    if (!(await checkRateLimit('subscribe', ipHash, limit, windowSeconds))) return json({ error: 'rate_limited' }, 429);

    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'bad_request' }, 400);
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'bad_request' }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400); }

    const parsed = parseSubscribe(body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const { email, section } = parsed.value;
    const result = await addSubscriber({ email, section: DB_SECTION[section], locale: section === 'to_korea' ? 'en' : 'ko', consentVersion: CONSENT_VERSION });
    return json({ status: result === 'created' ? 'ok' : 'exists' });
  } catch (error) {
    console.error('[api/subscribe]', error instanceof Error ? error.message : 'unknown'); // 이메일은 로그에 남기지 않는다
    return json({ error: 'server_error' }, 500);
  }
}
