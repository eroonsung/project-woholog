import {
  candidateLanguages, DEFAULT_CONFIG, splitCandidates, visiblePriorities,
  type EngineCountry, type Profile, type ScoringConfig,
} from '@/lib/engine';
import { HEART_IDS, QUESTION_COUNT, STUDY_MONTHS } from './config';
import type { Answers } from './types';

/**
 * 질문 순서·이동·답 정리 규칙 (SPEC.md 3.1~3.2). 화면 없이 테스트할 수 있는 순수 함수.
 * 후보 나라 계산(Q8 언어, Q12 칩)은 lib/engine/candidates.ts만 쓴다(CLAUDE.md 규칙 1).
 */
export interface QuizContext {
  countries: readonly EngineCountry[];
  /** DB scoring_config(adapter가 만든 설정). 없으면 defaults.ts 기본값 */
  config?: ScoringConfig;
}

const cfgOf = (ctx: QuizContext) => ctx.config ?? DEFAULT_CONFIG;
const filled = (v: { none: boolean; codes: string[] } | undefined) => !!v && (v.none || v.codes.length > 0);

/** 답을 엔진 입력으로 바꾼다. 답이 없는 칸은 점수에 영향이 적은 중립 값. */
export function toProfile(a: Answers): Profile {
  const together = a.q3?.together && a.q3.companionAge !== undefined;
  return {
    age: a.q2 ?? 0,
    visited: a.q4?.codes ?? [],
    budgetMan: a.q6 ?? 0,
    english: a.q7 ?? 0,
    languages: a.q8?.languages ?? [],
    jobs: a.q9?.jobs ?? [],
    earn: a.q10 ?? 'none',
    studyMonths: a.q11 ? STUDY_MONTHS[a.q11] : 0,
    priorities: a.q12?.priorities ?? [],
    ...(together ? { companion: { age: a.q3!.companionAge!, visited: a.q3!.companionVisited?.codes ?? [] } } : {}),
  };
}

export function candidatesOf(a: Answers, ctx: QuizContext): EngineCountry[] {
  return splitCandidates(ctx.countries, toProfile(a)).candidates;
}

export function languageChips(a: Answers, ctx: QuizContext): string[] {
  return candidateLanguages(candidatesOf(a, ctx));
}

export function priorityChips(a: Answers, ctx: QuizContext) {
  return visiblePriorities(candidatesOf(a, ctx), toProfile(a), cfgOf(ctx));
}

/** 보여 줄 언어가 없으면 Q8은 건너뛴다 */
export function isSkipped(q: number, a: Answers, ctx: QuizContext): boolean {
  return q === 8 && languageChips(a, ctx).length === 0;
}

export function isAnswered(q: number, a: Answers, ctx: QuizContext): boolean {
  switch (q) {
    case 1: return filled(a.q1);
    case 2: return a.q2 !== undefined;
    case 3: return !!a.q3 && (!a.q3.together || (a.q3.companionAge !== undefined && filled(a.q3.companionVisited)));
    case 4: return filled(a.q4);
    case 5: return a.q5 !== undefined;
    case 6: return a.q6 !== undefined;
    case 7: return a.q7 !== undefined;
    case 8: return isSkipped(8, a, ctx) || (!!a.q8 && (a.q8.none || a.q8.languages.length > 0));
    case 9: return !!a.q9 && (a.q9.unknown || a.q9.jobs.length > 0);
    case 10: return a.q10 !== undefined;
    case 11: return a.q11 !== undefined;
    case 12: return !!a.q12 && (a.q12.unknown || a.q12.priorities.length > 0);
    default: return false;
  }
}

/** 아직 안 푼 첫 질문. 모두 풀었으면 null */
export function firstUnanswered(a: Answers, ctx: QuizContext): number | null {
  for (let q = 1; q <= QUESTION_COUNT; q++) if (!isAnswered(q, a, ctx)) return q;
  return null;
}

/** 이 질문에 들어갈 수 있는가: 앞의 질문을 모두 풀었을 때만 */
export function canEnter(q: number, a: Answers, ctx: QuizContext): boolean {
  const first = firstUnanswered(a, ctx);
  return first === null || q <= first;
}

export function nextQuestion(q: number, a: Answers, ctx: QuizContext): number | 'submit' {
  let n = q + 1;
  while (n <= QUESTION_COUNT && isSkipped(n, a, ctx)) n++;
  return n > QUESTION_COUNT ? 'submit' : n;
}

export function prevQuestion(q: number, a: Answers, ctx: QuizContext): number {
  let n = q - 1;
  while (n > 1 && isSkipped(n, a, ctx)) n--;
  return Math.max(1, n);
}

/**
 * 앞 질문 답을 바꿔 뒤 질문의 보기가 사라지면, 사라진 보기의 답만 지운다 (SPEC.md 3.2).
 * 질문이 빈 답이 되어도 다시 보내지 않는다. "결과 보기"를 누를 때 firstUnanswered로 이동한다.
 */
export function pruneAnswers(a: Answers, ctx: QuizContext): Answers {
  const next: Answers = { ...a };
  if (next.q8) {
    const allowed = new Set(languageChips(next, ctx));
    next.q8 = { ...next.q8, languages: next.q8.languages.filter((l) => allowed.has(l)) };
  }
  if (next.q12) {
    const allowed = new Set(priorityChips(next, ctx));
    const hearts = filled(next.q1) && !next.q1?.none ? next.q12.hearts.filter((h) => (HEART_IDS as readonly string[]).includes(h)) : [];
    next.q12 = { ...next.q12, priorities: next.q12.priorities.filter((p) => allowed.has(p)), hearts };
  }
  return next;
}
