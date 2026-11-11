import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbRows } from '@/lib/engine';
import { hashIp, clientIp } from '@/lib/server/ip';
import snapshot from './fixtures/db_rows_v1.json';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

// DB·서비스 키는 가짜로 바꿔서 API의 흐름(요청 제한 → 검증 → 계산 → 저장)만 확인한다. 운영 DB에는 아무것도 쓰지 않는다.
const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn<(...args: unknown[]) => Promise<boolean>>(),
  saveQuizResult: vi.fn<(...args: unknown[]) => Promise<string>>(),
}));
vi.mock('@/lib/data/admin', () => ({ getServiceKey: () => 'test-service-key', getAdminClient: () => { throw new Error('사용 안 함'); } }));
vi.mock('@/lib/data/mutations', () => ({ checkRateLimit: mocks.checkRateLimit, saveQuizResult: mocks.saveQuizResult }));
vi.mock('@/lib/data/queries', () => ({ fetchAdapterRows: async () => snapshot as unknown as DbRows }));

const { POST } = await import('@/app/api/result/route');
const ID = '3f2b8c1e-0000-4000-8000-000000000001';
const post = (body: unknown, init: { headers?: Record<string, string>; raw?: string } = {}) =>
  POST(new Request('http://localhost/api/result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.7, 10.0.0.1', ...init.headers },
    body: init.raw ?? JSON.stringify(body),
  }));
const yvonne = PERSONA_ANSWERS[0]!.answers;

beforeEach(() => {
  mocks.checkRateLimit.mockReset().mockResolvedValue(true);
  mocks.saveQuizResult.mockReset().mockResolvedValue(ID);
});
afterEach(() => vi.restoreAllMocks());

describe('POST /api/result', () => {
  it('올바른 답이면 서버에서 다시 계산해 저장하고 id를 돌려준다', async () => {
    const res = await post({ answers: yvonne });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: ID });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(mocks.saveQuizResult).toHaveBeenCalledTimes(1);
    const [savedAnswers, savedResult] = mocks.saveQuizResult.mock.calls[0] as [Record<string, unknown>, { v: number; ranked: { code: string; pct: number }[] }];
    expect(savedAnswers.q2).toBe(33);
    expect(savedResult.v).toBe(1);
    expect(savedResult.ranked[0]).toMatchObject({ code: 'CA', pct: 100 }); // Yvonne의 기대값(캐나다 100%)
  });

  it('요청 제한: IP는 해시로만 넘기고(원래 IP 없음), 1분 10번 기준', async () => {
    await post({ answers: yvonne });
    const [bucket, hash, limit, windowSeconds] = mocks.checkRateLimit.mock.calls[0]!;
    expect([bucket, limit, windowSeconds]).toEqual(['result', 10, 60]);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(String(hash)).not.toContain('203.0.113.7');
    expect(hash).toBe(hashIp('203.0.113.7', 'test-service-key')); // x-forwarded-for 맨 앞 IP
  });

  it('한도를 넘으면 429이고 저장하지 않는다', async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    const res = await post({ answers: yvonne });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate_limited' });
    expect(mocks.saveQuizResult).not.toHaveBeenCalled();
  });

  it('잘못된 답은 400 + 어느 질문인지, 저장하지 않는다', async () => {
    const res = await post({ answers: { ...yvonne, q6: 525 } });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_answers', question: 6, reason: 'budget_range' });
    expect(mocks.saveQuizResult).not.toHaveBeenCalled();
  });

  it('나이 초과(36세)는 400 + Q2, 결과를 저장하지 않는다', async () => {
    const res = await post({ answers: { ...yvonne, q2: 36 } });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ question: 2, reason: 'age_over' });
    expect(mocks.saveQuizResult).not.toHaveBeenCalled();
  });

  it('빈 질문이 있으면 그 질문 번호', async () => {
    const { q9: _q9, ...rest } = yvonne;
    void _q9;
    const res = await post({ answers: rest });
    expect(await res.json()).toMatchObject({ error: 'invalid_answers', question: 9 });
  });

  it('JSON이 아니거나 형식이 다르면 400, 너무 크면 413', async () => {
    expect((await post(null, { raw: '{깨진' })).status).toBe(400);
    expect((await post({ answers: yvonne }, { headers: { 'Content-Type': 'text/plain' } })).status).toBe(400);
    expect((await post({ nothing: true })).status).toBe(400);
    expect((await post(null, { raw: JSON.stringify({ answers: yvonne, pad: 'x'.repeat(25_000) }) })).status).toBe(413);
    expect(mocks.saveQuizResult).not.toHaveBeenCalled();
  });

  it('저장 실패·요청 제한 확인 실패는 500이고, 로그에 답변 값을 남기지 않는다', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.saveQuizResult.mockRejectedValue(new Error('결과 저장 실패: boom'));
    expect((await post({ answers: yvonne })).status).toBe(500);
    mocks.checkRateLimit.mockRejectedValue(new Error('요청 제한 확인 실패'));
    const res = await post({ answers: yvonne });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'server_error' });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/독일어|"q2"|33/);
  });
});

describe('IP 해시', () => {
  it('같은 IP·키는 같은 값, 키나 IP가 다르면 다른 값, 원래 IP는 들어 있지 않다', () => {
    expect(hashIp('1.2.3.4', 'k')).toBe(hashIp('1.2.3.4', 'k'));
    expect(hashIp('1.2.3.4', 'k')).not.toBe(hashIp('1.2.3.5', 'k'));
    expect(hashIp('1.2.3.4', 'k')).not.toBe(hashIp('1.2.3.4', 'other'));
    expect(hashIp('1.2.3.4', 'k')).not.toContain('1.2.3.4');
  });

  it('프록시 헤더에서 IP를 읽고, 없으면 unknown', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': ' 9.9.9.9 , 1.1.1.1' }))).toBe('9.9.9.9');
    expect(clientIp(new Headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});
