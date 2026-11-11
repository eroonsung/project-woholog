import type { EarnNeed, EnglishSkill, JobId, PriorityId, ScoringConfig } from '@/lib/engine';
import { AGE_MAX, BUDGET, MAX_HEART_COUNTRIES, MAX_PRIORITIES } from './config';
import { firstUnanswered, languageChips, pruneAnswers, type QuizContext } from './steps';
import type { Answers, CountryAnswer, HeartReasonId, StudyId, WhenId } from './types';

/**
 * 서버에서 답을 다시 검증한다 (SPEC.md 3.3). 화면 검증만 믿지 않는다.
 * 형식·범위·나이를 확인하고, 알려진 칸만 새 객체로 만들어 돌려준다(모르는 키는 버림).
 * 잘못되면 어느 질문인지(question)와 이유(reason)를 돌려준다 → API는 400 + 그 질문 번호.
 */
export type ValidationResult =
  | { ok: true; answers: Answers }
  | { ok: false; question: number; reason: string };

export interface ValidationContext extends QuizContext {
  minAge: number; // active age_min 최솟값
  maxAge: number; // active age_max 최댓값
  config: ScoringConfig;
}

const WHEN: readonly WhenId[] = ['m3', 'm6', 'y1', 'unknown'];
const EARN: readonly EarnNeed[] = ['must', 'partly', 'none'];
const STUDY: readonly StudyId[] = ['none', 'm3', 'm6', 'over6'];
const JOBS: readonly JobId[] = ['cafe', 'retail', 'hotel', 'farm', 'office', 'care'];
const HEARTS: readonly HeartReasonId[] = ['culture', 'learn_language', 'know_someone'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const strings = (v: unknown): string[] | null =>
  Array.isArray(v) && v.length <= 60 && v.every((x) => typeof x === 'string' && x.length <= 40) ? (v as string[]) : null;
const oneOf = <T extends string | number>(list: readonly T[], v: unknown): v is T => list.includes(v as T);

/** 나라 답: {none, codes}. 코드는 active 나라만, 중복 없음 */
function countryAnswer(v: unknown, active: Set<string>, max: number): CountryAnswer | null {
  if (!isObj(v) || typeof v.none !== 'boolean') return null;
  const codes = strings(v.codes);
  if (!codes || codes.length > max || new Set(codes).size !== codes.length) return null;
  if (!codes.every((c) => active.has(c))) return null;
  if (v.none && codes.length > 0) return null;
  if (!v.none && codes.length === 0) return null;
  return { none: v.none, codes };
}

export function validateAnswers(input: unknown, ctx: ValidationContext): ValidationResult {
  const fail = (question: number, reason: string): ValidationResult => ({ ok: false, question, reason });
  if (!isObj(input)) return fail(1, 'not_object');
  const active = new Set(ctx.countries.map((c) => c.code));
  const out: Answers = {};

  const q1 = countryAnswer(input.q1, active, MAX_HEART_COUNTRIES);
  if (!q1) return fail(1, 'invalid');
  out.q1 = q1;

  if (!isInt(input.q2) || input.q2 < ctx.minAge || input.q2 > AGE_MAX) return fail(2, 'age_range');
  if (input.q2 > ctx.maxAge) return fail(2, 'age_over'); // 나이 초과: 결과를 저장하지 않는다
  out.q2 = input.q2;

  const q3 = input.q3;
  if (!isObj(q3) || typeof q3.together !== 'boolean') return fail(3, 'invalid');
  if (q3.together) {
    if (!isInt(q3.companionAge) || q3.companionAge < ctx.minAge || q3.companionAge > AGE_MAX) return fail(3, 'companion_age');
    const visited = countryAnswer(q3.companionVisited, active, active.size);
    if (!visited) return fail(3, 'companion_visited');
    out.q3 = { together: true, companionAge: q3.companionAge, companionVisited: visited };
  } else {
    out.q3 = { together: false };
  }

  const q4 = countryAnswer(input.q4, active, active.size);
  if (!q4) return fail(4, 'invalid');
  out.q4 = q4;

  if (!oneOf(WHEN, input.q5)) return fail(5, 'invalid');
  out.q5 = input.q5;

  const q6 = input.q6;
  if (!isInt(q6) || q6 < BUDGET.min || q6 > BUDGET.max || (q6 - BUDGET.min) % BUDGET.step !== 0) return fail(6, 'budget_range');
  out.q6 = q6;

  if (!oneOf([0, 1, 2, 3] as const, input.q7)) return fail(7, 'invalid');
  out.q7 = input.q7 as EnglishSkill;

  // Q8: 후보 나라의 일자리 언어만. 보여 줄 언어가 없으면 건너뛴 질문이라 답이 없어도 된다
  const chips = languageChips(out, ctx);
  if (chips.length > 0) {
    const q8 = input.q8;
    if (!isObj(q8) || typeof q8.none !== 'boolean') return fail(8, 'invalid');
    const languages = strings(q8.languages);
    if (!languages || new Set(languages).size !== languages.length || !languages.every((l) => chips.includes(l))) return fail(8, 'language_not_allowed');
    if (q8.none === (languages.length > 0)) return fail(8, 'invalid'); // 없어요이거나 1개 이상
    out.q8 = { none: q8.none, languages };
  }

  const q9 = input.q9;
  if (!isObj(q9) || typeof q9.unknown !== 'boolean') return fail(9, 'invalid');
  const jobs = strings(q9.jobs);
  if (!jobs || new Set(jobs).size !== jobs.length || !jobs.every((j): j is JobId => oneOf(JOBS, j))) return fail(9, 'invalid');
  if (q9.unknown === (jobs.length > 0)) return fail(9, 'invalid');
  out.q9 = { unknown: q9.unknown, jobs: jobs as JobId[] };

  if (!oneOf(EARN, input.q10)) return fail(10, 'invalid');
  out.q10 = input.q10;
  if (!oneOf(STUDY, input.q11)) return fail(11, 'invalid');
  out.q11 = input.q11;

  const q12 = input.q12;
  if (!isObj(q12) || typeof q12.unknown !== 'boolean') return fail(12, 'invalid');
  const priorities = strings(q12.priorities);
  if (!priorities || priorities.length > MAX_PRIORITIES || new Set(priorities).size !== priorities.length) return fail(12, 'invalid');
  if (!priorities.every((p): p is PriorityId => (ctx.config.priority_chips as string[]).includes(p))) return fail(12, 'invalid');
  if (q12.unknown === (priorities.length > 0)) return fail(12, 'invalid');
  const hearts = strings(q12.hearts) ?? [];
  if (!hearts.every((h): h is HeartReasonId => oneOf(HEARTS, h))) return fail(12, 'invalid');
  out.q12 = { unknown: q12.unknown, priorities: priorities as PriorityId[], hearts: hearts as HeartReasonId[] };

  // 앞 질문 답과 맞지 않게 된 보기는 지우고(마음 이유 등), 그래도 빈 질문이 있으면 그 질문으로 보낸다
  const pruned = pruneAnswers(out, ctx);
  const first = firstUnanswered(pruned, ctx);
  if (first !== null) return fail(first, 'unanswered');
  return { ok: true, answers: pruned };
}
