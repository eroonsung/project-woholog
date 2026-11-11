import type { Answers } from './types';

/** 결과 저장 요청 (POST /api/result, SPEC.md 3.3). 10초 안에 응답이 없으면 실패. */
export type SubmitErrorKind = 'invalid' | 'rate' | 'timeout' | 'server' | 'network';

export class SubmitError extends Error {
  constructor(public kind: SubmitErrorKind, public question?: number) {
    super(kind);
  }
}

export const SUBMIT_TIMEOUT_MS = 10_000;

export async function submitQuiz(
  answers: Answers,
  opts: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<{ id: string }> {
  const { timeoutMs = SUBMIT_TIMEOUT_MS, fetchImpl = fetch } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl('/api/result', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }), signal: controller.signal,
    });
    if (res.ok) {
      const body = (await res.json()) as { id?: unknown };
      if (typeof body.id === 'string') return { id: body.id };
      throw new SubmitError('server');
    }
    if (res.status === 429) throw new SubmitError('rate');
    if (res.status === 400) {
      const body = (await res.json().catch(() => ({}))) as { question?: unknown };
      if (typeof body.question === 'number') throw new SubmitError('invalid', body.question);
    }
    throw new SubmitError('server');
  } catch (error) {
    if (error instanceof SubmitError) throw error;
    throw new SubmitError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}
