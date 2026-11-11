import example from '@/content/landing_example.json';
import { adaptRows, type DbRows } from '@/lib/engine';
import type { Answers } from '@/lib/quiz/types';
import { validateAnswers } from '@/lib/quiz/validate';
import { pickCard, type CardPlan } from './card';
import { computeResult } from './compute';
import type { StoredResult } from './types';

/**
 * 첫 화면 예시 카드 (SPEC.md 2장). 가상 사용자 A의 답(content/landing_example.json)을 빌드할 때 서버의 결과 계산과 똑같이
 * 검증·계산해서 만든다. 숫자는 지어내지 않고 DB 값에서 나온 실제 계산 값이며, DB 값이 바뀌면 다음 배포(재생성) 때 같이 바뀐다.
 */
export interface LandingExample {
  answers: Answers;
  result: StoredResult;
  plan: CardPlan;
}

export function buildExample(rows: DbRows, asOf: string): LandingExample {
  const data = adaptRows(rows, { asOf });
  if (data.minAge === null || data.maxAge === null) throw new Error('active 프로그램이 없어요');
  const checked = validateAnswers(example.answers, {
    countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge, maxAge: data.maxAge,
  });
  if (!checked.ok) throw new Error(`예시 답이 맞지 않아요: Q${checked.question} (${checked.reason})`);
  const result = computeResult(checked.answers, data, asOf, rows);
  const plan = pickCard(checked.answers, result);
  if (!plan) throw new Error('예시 결과가 비어 있어요');
  return { answers: checked.answers, result, plan };
}
