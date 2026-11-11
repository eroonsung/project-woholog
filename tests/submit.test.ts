import { describe, expect, it } from 'vitest';
import { submitQuiz, SubmitError } from '@/lib/quiz/submit';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

const answers = PERSONA_ANSWERS[0]!.answers;
const reply = (status: number, body: unknown): typeof fetch => async () => new Response(JSON.stringify(body), { status });
const kindOf = async (p: Promise<unknown>) => { try { await p; return 'ok'; } catch (e) { return e instanceof SubmitError ? `${e.kind}${e.question ? `:${e.question}` : ''}` : 'other'; } };

describe('submitQuiz (결과 저장 요청, SPEC 3.3)', () => {
  it('성공하면 id', async () => {
    expect(await submitQuiz(answers, { fetchImpl: reply(200, { id: 'abc' }) })).toEqual({ id: 'abc' });
  });

  it('요청 본문은 { answers }', async () => {
    let sent: unknown;
    await submitQuiz(answers, { fetchImpl: async (_url, init) => { sent = JSON.parse(String(init?.body)); return new Response('{"id":"x"}'); } });
    expect(sent).toEqual({ answers });
  });

  it('400 + 질문 번호 → invalid:질문', async () => {
    expect(await kindOf(submitQuiz(answers, { fetchImpl: reply(400, { error: 'invalid_answers', question: 6 }) }))).toBe('invalid:6');
  });

  it('429 → rate, 500·모양이 이상한 응답 → server', async () => {
    expect(await kindOf(submitQuiz(answers, { fetchImpl: reply(429, { error: 'rate_limited' }) }))).toBe('rate');
    expect(await kindOf(submitQuiz(answers, { fetchImpl: reply(500, {}) }))).toBe('server');
    expect(await kindOf(submitQuiz(answers, { fetchImpl: reply(200, { nope: 1 }) }))).toBe('server');
    expect(await kindOf(submitQuiz(answers, { fetchImpl: reply(400, {}) }))).toBe('server');
  });

  it('네트워크 오류 → network', async () => {
    expect(await kindOf(submitQuiz(answers, { fetchImpl: async () => { throw new TypeError('failed'); } }))).toBe('network');
  });

  it('응답이 없으면 제한 시간 뒤 timeout(10초가 기본)', async () => {
    const hang: typeof fetch = (_url, init) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
    expect(await kindOf(submitQuiz(answers, { fetchImpl: hang, timeoutMs: 30 }))).toBe('timeout');
  });
});
