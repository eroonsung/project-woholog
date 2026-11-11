import { NextResponse } from 'next/server';
import { adaptRows } from '@/lib/engine';
import { getServiceKey } from '@/lib/data/admin';
import { checkRateLimit, saveQuizResult } from '@/lib/data/mutations';
import { fetchAdapterRows } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';
import { validateAnswers } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import { clientIp, hashIp } from '@/lib/server/ip';
import { RATE_LIMITS } from '@/lib/server/limits';

// 질문 답 → 서버에서 다시 검증 → 엔진 다시 계산 → quiz_results 저장 → { id } (SPEC.md 3.3)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  try {
    // 1) 요청 제한: IP는 해시로만 다룬다
    const { limit, windowSeconds } = RATE_LIMITS.result;
    const ipHash = hashIp(clientIp(request.headers), getServiceKey());
    if (!(await checkRateLimit('result', ipHash, limit, windowSeconds))) return json({ error: 'rate_limited' }, 429);

    // 2) 본문 읽기
    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'bad_request' }, 400);
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'bad_request' }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad_request' }, 400); }
    const input = typeof body === 'object' && body !== null ? (body as { answers?: unknown }).answers : undefined;

    // 3) 검증 (형식·범위·나이). 잘못되면 400 + 어느 질문인지
    const asOf = todayKst();
    const rows = await fetchAdapterRows();
    const data = adaptRows(rows, { asOf });
    if (data.minAge === null || data.maxAge === null) throw new Error('active 프로그램이 없어요');
    const checked = validateAnswers(input, {
      countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge, maxAge: data.maxAge,
    });
    if (!checked.ok) return json({ error: 'invalid_answers', question: checked.question, reason: checked.reason }, 400);

    // 4) 엔진 다시 계산 + 저장
    const id = await saveQuizResult(checked.answers, computeResult(checked.answers, data, asOf, rows));
    return json({ id });
  } catch (error) {
    console.error('[api/result]', error instanceof Error ? error.message : 'unknown'); // 답변 값은 로그에 남기지 않는다
    return json({ error: 'server_error' }, 500);
  }
}
