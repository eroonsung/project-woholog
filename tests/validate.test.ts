import { describe, expect, it } from 'vitest';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers, type ValidationContext } from '@/lib/quiz/validate';
import type { Answers } from '@/lib/quiz/types';
import snapshot from './fixtures/db_rows_v1.json';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

const data = adaptRows(snapshot as unknown as DbRows, { asOf: '2026-11-11' });
const ctx: ValidationContext = { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! };
const base = PERSONA_ANSWERS[0]!.answers; // Yvonne
const withPatch = (patch: Record<string, unknown>) => ({ ...base, ...patch });
const bad = (input: unknown, question: number, reason?: string) => {
  const r = validateAnswers(input, ctx);
  expect(r.ok).toBe(false);
  if (!r.ok) { expect(r.question).toBe(question); if (reason) expect(r.reason).toBe(reason); }
};

describe('서버 검증 (SPEC 3.3): 형식·범위·나이', () => {
  it('올바른 답은 통과하고 모든 칸이 채워져 나온다', () => {
    for (const { answers } of PERSONA_ANSWERS) expect(validateAnswers(answers, ctx).ok).toBe(true);
  });

  it('객체가 아니면 1번 질문으로', () => {
    for (const v of [null, 'x', 3, [], undefined]) bad(v, 1);
  });

  it('Q1: 모르는 나라 코드·4개 이상·"없어요"와 나라 동시 선택은 거부', () => {
    bad(withPatch({ q1: { none: false, codes: ['ZZ'] } }), 1);
    bad(withPatch({ q1: { none: false, codes: ['JP', 'CA', 'AU', 'GB'] } }), 1);
    bad(withPatch({ q1: { none: true, codes: ['JP'] } }), 1);
    bad(withPatch({ q1: { none: false, codes: [] } }), 1);
    bad(withPatch({ q1: { none: false, codes: ['JP', 'JP'] } }), 1);
    bad(withPatch({ q1: { none: false, codes: ['FI'] } }), 1); // 핀란드는 active가 아님
  });

  it('Q2: 나이 범위(17 이하·숫자 아님), 나이 초과(36)는 따로 구분', () => {
    bad(withPatch({ q2: 17 }), 2, 'age_range');
    bad(withPatch({ q2: '27' }), 2, 'age_range');
    bad(withPatch({ q2: 27.5 }), 2, 'age_range');
    bad(withPatch({ q2: 100 }), 2, 'age_range');
    bad(withPatch({ q2: 36 }), 2, 'age_over');
    expect(validateAnswers(withPatch({ q2: 35 }), ctx).ok).toBe(true);
  });

  it('Q3: 함께면 동행자 나이·다녀온 나라가 필요', () => {
    bad(withPatch({ q3: { together: true } }), 3, 'companion_age');
    bad(withPatch({ q3: { together: true, companionAge: 29 } }), 3, 'companion_visited');
    bad(withPatch({ q3: { together: true, companionAge: 17, companionVisited: { none: true, codes: [] } } }), 3, 'companion_age');
    expect(validateAnswers(withPatch({ q3: { together: true, companionAge: 29, companionVisited: { none: true, codes: [] } } }), ctx).ok).toBe(true);
    bad(withPatch({ q3: { together: 'yes' } }), 3);
  });

  it('Q4~Q7: 보기 밖의 값, 예산 범위·50만 원 단위', () => {
    bad(withPatch({ q4: { none: false, codes: ['XX'] } }), 4);
    bad(withPatch({ q5: 'soon' }), 5);
    bad(withPatch({ q6: 99 }), 6, 'budget_range');
    bad(withPatch({ q6: 2050 }), 6, 'budget_range');
    bad(withPatch({ q6: 525 }), 6, 'budget_range');
    bad(withPatch({ q7: 4 }), 7);
    expect(validateAnswers(withPatch({ q6: 2000 }), ctx).ok).toBe(true);
  });

  it('Q8: 후보 나라의 언어만 고를 수 있다', () => {
    bad(withPatch({ q8: { none: false, languages: ['클링온어'] } }), 8, 'language_not_allowed');
    bad(withPatch({ q8: { none: true, languages: ['독일어'] } }), 8);
    bad(withPatch({ q8: { none: false, languages: [] } }), 8);
    bad({ ...base, q8: undefined }, 8); // 보여 줄 언어가 있는데 답이 없다
  });

  it('Q8: 보여 줄 언어가 없는 나라만 남으면 건너뛴 질문이라 답이 없어도 된다', () => {
    const english = data.active.filter((a) => ['AU', 'NZ', 'GB'].includes(a.code)).map((a) => a.engine);
    const only: ValidationContext = { ...ctx, countries: english };
    const answers = { ...base, q1: { none: true, codes: [] }, q4: { none: true, codes: [] }, q8: undefined };
    expect(validateAnswers(answers, only).ok).toBe(true);
  });

  it('Q4에서 다녀온 나라를 바꿔 Q8 보기가 사라지면 그 질문으로 보낸다', () => {
    bad(withPatch({ q4: { none: false, codes: ['TW'] }, q8: { none: false, languages: ['중국어'] } }), 8, 'language_not_allowed');
  });

  it('Q9~Q12: 보기 밖의 값, 3개 초과, "모르겠어요"와 선택 동시', () => {
    bad(withPatch({ q9: { unknown: false, jobs: ['pilot'] } }), 9);
    bad(withPatch({ q9: { unknown: true, jobs: ['cafe'] } }), 9);
    bad(withPatch({ q10: 'always' }), 10);
    bad(withPatch({ q11: 'forever' }), 11);
    bad(withPatch({ q12: { unknown: false, priorities: ['money', 'easy_job', 'english', 'career'], hearts: [] } }), 12);
    bad(withPatch({ q12: { unknown: false, priorities: ['bitcoin'], hearts: [] } }), 12);
    bad(withPatch({ q12: { unknown: true, priorities: ['money'], hearts: [] } }), 12);
    bad(withPatch({ q12: { unknown: false, priorities: ['money'], hearts: ['hate'] } }), 12);
  });

  it('알려진 칸만 새 객체로 돌려준다(모르는 키는 버림), 마음 이유는 Q1에 나라가 있을 때만 남는다', () => {
    const r = validateAnswers({ ...withPatch({ evil: '<script>', q12: { unknown: false, priorities: ['money'], hearts: ['culture'] } }) }, ctx);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.answers).sort()).toEqual(['q1', 'q10', 'q11', 'q12', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9']);
    expect(r.answers.q12?.hearts).toEqual([]); // Yvonne는 Q1이 "없어요"
    const heart: Answers = { ...base, q1: { none: false, codes: ['JP'] }, q12: { unknown: false, priorities: ['money'], hearts: ['culture'] } };
    const r2 = validateAnswers(heart, ctx);
    expect(r2.ok && r2.answers.q12?.hearts).toEqual(['culture']);
  });
});
