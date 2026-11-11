import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import { QUESTION_COUNT } from './config';
import type { Answers, QuizState } from './types';

/** sessionStorage `woholog.quiz.v1` 읽기·쓰기. 형식이 다르면 버리고 새로 시작한다(SPEC.md 0.2). */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isCountryAnswer = (v: unknown) => isObj(v) && typeof v.none === 'boolean' && isStrings(v.codes);

export function isAnswers(v: unknown): v is Answers {
  if (!isObj(v)) return false;
  const num = (x: unknown) => x === undefined || typeof x === 'number';
  const opt = (x: unknown, ok: (y: unknown) => boolean) => x === undefined || ok(x);
  return (
    opt(v.q1, isCountryAnswer) && num(v.q2) &&
    opt(v.q3, (q3) => isObj(q3) && typeof q3.together === 'boolean' && num(q3.companionAge) && opt(q3.companionVisited, isCountryAnswer)) &&
    opt(v.q4, isCountryAnswer) && opt(v.q5, (x) => typeof x === 'string') && num(v.q6) && num(v.q7) &&
    opt(v.q8, (x) => isObj(x) && typeof x.none === 'boolean' && isStrings(x.languages)) &&
    opt(v.q9, (x) => isObj(x) && typeof x.unknown === 'boolean' && isStrings(x.jobs)) &&
    opt(v.q10, (x) => typeof x === 'string') && opt(v.q11, (x) => typeof x === 'string') &&
    opt(v.q12, (x) => isObj(x) && typeof x.unknown === 'boolean' && isStrings(x.priorities) && isStrings(x.hearts))
  );
}

export function isQuizState(v: unknown): v is QuizState {
  return isObj(v) && isAnswers(v.answers) && typeof v.q === 'number' && v.q >= 1 && v.q <= QUESTION_COUNT;
}

export const loadQuiz = (): QuizState | null => readStorage('quiz', isQuizState);
export const saveQuiz = (state: QuizState): boolean => writeStorage('quiz', state);
export const clearQuiz = (): boolean => removeStorage('quiz');
