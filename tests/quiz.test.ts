import { describe, expect, it } from 'vitest';
import {
  canEnter, firstUnanswered, isAnswered, languageChips, nextQuestion, prevQuestion, priorityChips, pruneAnswers, toProfile,
  type QuizContext,
} from '@/lib/quiz/steps';
import { isQuizState } from '@/lib/quiz/state';
import type { Answers } from '@/lib/quiz/types';
import { COUNTRIES } from './fixtures/countries_v1';

const ctx: QuizContext = { countries: COUNTRIES };
const english = COUNTRIES.filter((c) => ['AU', 'NZ', 'GB'].includes(c.code));

/** Q1~Q12를 모두 푼 답 */
const full: Answers = {
  q1: { none: false, codes: ['JP'] }, q2: 27, q3: { together: false }, q4: { none: true, codes: [] }, q5: 'y1', q6: 500,
  q7: 1, q8: { none: true, languages: [] }, q9: { unknown: false, jobs: ['cafe'] }, q10: 'must', q11: 'm3',
  q12: { unknown: false, priorities: ['money'], hearts: [] },
};

describe('질문 이동 (SPEC 3.1)', () => {
  it('모두 풀면 첫 안 푼 질문은 없다', () => expect(firstUnanswered(full, ctx)).toBeNull());

  it('안 푼 질문으로 직접 들어오면 안 푼 첫 질문까지만 갈 수 있다', () => {
    const partial: Answers = { q1: full.q1, q2: 27 };
    expect(firstUnanswered(partial, ctx)).toBe(3);
    expect(canEnter(3, partial, ctx)).toBe(true);
    expect(canEnter(9, partial, ctx)).toBe(false);
  });

  it('Q3은 "혼자"면 바로, 함께면 동행자 나이와 다녀온 나라까지 채워야 풀린 것', () => {
    expect(isAnswered(3, { q3: { together: false } }, ctx)).toBe(true);
    expect(isAnswered(3, { q3: { together: true } }, ctx)).toBe(false);
    expect(isAnswered(3, { q3: { together: true, companionAge: 29 } }, ctx)).toBe(false);
    expect(isAnswered(3, { q3: { together: true, companionAge: 29, companionVisited: { none: true, codes: [] } } }, ctx)).toBe(true);
  });

  it('Q6은 한 번도 안 건드리면 안 푼 것, 값이 있으면 푼 것', () => {
    expect(isAnswered(6, {}, ctx)).toBe(false);
    expect(isAnswered(6, { q6: 500 }, ctx)).toBe(true);
  });

  it('보여 줄 언어가 없으면 Q8을 건너뛰고, 이전도 건너뛴다', () => {
    const only: QuizContext = { countries: english };
    expect(languageChips(full, only)).toEqual([]);
    expect(nextQuestion(7, full, only)).toBe(9);
    expect(prevQuestion(9, full, only)).toBe(7);
    expect(isAnswered(8, {}, only)).toBe(true);
    expect(nextQuestion(7, full, ctx)).toBe(8);
  });

  it('마지막 질문 다음은 제출', () => expect(nextQuestion(12, full, ctx)).toBe('submit'));
});

describe('후보 나라로 만드는 칩 (엔진 candidates 사용)', () => {
  it('Q8 언어 칩은 후보 나라의 일자리 언어만', () => {
    const chips = languageChips({ ...full, q2: 34 }, ctx); // 34세면 일본(30세까지)은 후보가 아니다
    expect(chips).not.toContain('일본어');
    expect(chips).toContain('독일어');
  });

  it('Q12 칩: 후보가 모두 같은 표시면 숨긴다', () => {
    const onlyEu: QuizContext = { countries: COUNTRIES.filter((c) => c.code === 'DE' || c.code === 'FR') };
    expect(priorityChips(full, onlyEu)).not.toContain('europe');
    expect(priorityChips(full, ctx)).toContain('europe');
  });
});

describe('앞 질문을 바꾸면 사라진 보기의 답만 지운다 (SPEC 3.2)', () => {
  it('Q4에서 대만을 다녀왔다고 바꾸면 Q8의 중국어가 지워진다', () => {
    const before: Answers = { ...full, q8: { none: false, languages: ['중국어', '독일어'] } };
    const after = pruneAnswers({ ...before, q4: { none: false, codes: ['TW'] } }, ctx);
    expect(after.q8?.languages).toEqual(['독일어']);
  });

  it('Q8이 빈 답이 돼도 그 질문으로 되돌려 보내지는 않는다(보낼 때 안 푼 질문으로 이동)', () => {
    const before: Answers = { ...full, q8: { none: false, languages: ['중국어'] } };
    const after = pruneAnswers({ ...before, q4: { none: false, codes: ['TW'] } }, ctx);
    expect(after.q8).toEqual({ none: false, languages: [] });
    expect(firstUnanswered(after, ctx)).toBe(8);
  });

  it('Q1에서 나라를 모두 빼면 Q12 마음 이유가 지워진다', () => {
    const before: Answers = { ...full, q12: { unknown: false, priorities: ['money'], hearts: ['culture'] } };
    expect(pruneAnswers(before, ctx).q12?.hearts).toEqual(['culture']);
    expect(pruneAnswers({ ...before, q1: { none: true, codes: [] } }, ctx).q12?.hearts).toEqual([]);
  });
});

describe('답 → 엔진 입력', () => {
  it('질문 답이 엔진 Profile로 바뀐다', () => {
    const p = toProfile({ ...full, q11: 'over6', q3: { together: true, companionAge: 29, companionVisited: { none: false, codes: ['AU'] } } });
    expect(p).toMatchObject({ age: 27, budgetMan: 500, english: 1, earn: 'must', studyMonths: 12, jobs: ['cafe'] });
    expect(p.companion).toEqual({ age: 29, visited: ['AU'] });
  });
});

describe('저장 형식 (sessionStorage woholog.quiz.v1)', () => {
  it('올바른 형식만 받는다', () => {
    expect(isQuizState({ answers: full, q: 7 })).toBe(true);
    expect(isQuizState({ answers: {}, q: 1 })).toBe(true);
  });
  it('형식이 다르면 버린다', () => {
    expect(isQuizState(null)).toBe(false);
    expect(isQuizState({ answers: { q2: '스물' }, q: 1 })).toBe(false);
    expect(isQuizState({ answers: {}, q: 13 })).toBe(false);
    expect(isQuizState({ answers: { q1: { none: 'x', codes: [] } }, q: 1 })).toBe(false);
  });
});
