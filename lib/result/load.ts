import { fetchQuizResult } from '@/lib/data/queries';
import { isAnswers } from '@/lib/quiz/state';
import type { Answers } from '@/lib/quiz/types';
import type { StoredResult } from './types';

/** 저장된 결과 읽기(공유 이미지·메타 태그용). id 형식이 이상하거나, 없거나, 형식이 맞지 않으면 null */
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isStoredResult(v: unknown): v is StoredResult {
  const r = v as Partial<StoredResult> | null;
  return !!r && r.v === 1 && Array.isArray(r.ranked) && Array.isArray(r.blocked) && Array.isArray(r.comingSoon)
    && typeof r.countries === 'object' && r.countries !== null && typeof r.whatIf === 'object' && !!r.config;
}

export async function loadResult(id: string): Promise<{ answers: Answers; result: StoredResult } | null> {
  if (!UUID.test(id)) return null;
  const row = await fetchQuizResult(id);
  if (!row || !isAnswers(row.answers) || !isStoredResult(row.result)) return null;
  return { answers: row.answers, result: row.result };
}
