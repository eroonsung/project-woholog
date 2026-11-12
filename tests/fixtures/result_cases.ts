import type { Answers } from '@/lib/quiz/types';
import type { CardKind } from '@/lib/result/card';
import { PERSONA_ANSWERS } from './persona_answers';

/**
 * 결과 맨 위 카드 5가지 경우(SPEC 4.2)를 재현하는 테스트용 답 세트. 가상 사용자 6명의 답에서 "마음에 둔 나라(Q1)"만 바꿨다.
 * 운영 DB에 저장하지 않고 서버 계산 함수(computeResult)와 스냅샷 데이터로만 쓴다. 화면 확인은 /dev/result?case=이름.
 * 사람: A Yvonne(33) · B 일본 고민(27) · C 학생(23) · D 커리어(33) · E 영어 못함(29) · F 스페인어(25)
 */
const [A, B, C, , E, F] = PERSONA_ANSWERS.map((p) => p.answers);
const withHearts = (a: Answers | undefined, codes: string[]): Answers => ({ ...a!, q1: codes.length ? { none: false, codes } : { none: true, codes: [] } });

export interface ResultCase {
  id: string;
  label: string;
  answers: Answers;
  expect: { kind: CardKind; whatIf: boolean; allLow?: boolean; checking?: boolean };
}

export const RESULT_CASES: ResultCase[] = [
  { id: 'noheart', label: '마음에 둔 나라 없음, 1위가 높음(Yvonne)', answers: withHearts(A, []), expect: { kind: 'noheart', whatIf: false } },
  { id: 'noheart_low', label: '마음에 둔 나라 없음, 1위도 60% 미만(영어 못함) → 이렇게 바꾸면', answers: withHearts(E, []), expect: { kind: 'noheart', whatIf: true, allLow: true } },
  { id: 'top1', label: '마음에 둔 나라가 1위(캐나다)', answers: withHearts(A, ['CA']), expect: { kind: 'top1', whatIf: false } },
  { id: 'close', label: '마음에 둔 나라가 1위와 10%p 미만 차이, 60% 이상(학생·뉴질랜드)', answers: withHearts(C, ['NZ']), expect: { kind: 'close', whatIf: false } },
  { id: 'close_low', label: '1위와 10%p 미만 차이, 60% 미만(일본 고민·대만) → 이렇게 바꾸면', answers: withHearts(B, ['TW']), expect: { kind: 'close', whatIf: true } },
  { id: 'far', label: '1위와 10%p 이상 차이, 60% 이상이라 제안 없음(Yvonne·영국)', answers: withHearts(A, ['GB']), expect: { kind: 'far', whatIf: false } },
  { id: 'far_low', label: '1위와 10%p 이상 차이, 60% 미만 → 이렇게 바꾸면(Yvonne·대만)', answers: withHearts(A, ['TW']), expect: { kind: 'far', whatIf: true } },
  { id: 'blocked_age', label: '마음에 둔 나라를 나이 때문에 갈 수 없음(33세·일본)', answers: withHearts(A, ['JP']), expect: { kind: 'blocked', whatIf: false } },
  { id: 'blocked_visited', label: '마음에 둔 나라를 이미 다녀와서 갈 수 없음(호주)', answers: withHearts(A, ['AU']), expect: { kind: 'blocked', whatIf: false } },
  { id: 'multi', label: '마음에 둔 나라 3개: 카드 + 다른 나라 + 갈 수 없는 나라', answers: withHearts(A, ['GB', 'CA', 'JP']), expect: { kind: 'top1', whatIf: false } },
  { id: 'multi_low', label: '마음에 둔 나라 2개: 카드(캐나다) + 다른 나라(대만, 낮은 %)에 이유가 보여야 함', answers: withHearts(A, ['CA', 'TW']), expect: { kind: 'top1', whatIf: false } },
  { id: 'checking', label: '돈이 확인 중인 나라가 1위(스페인어 가능·스페인)', answers: withHearts(F, []), expect: { kind: 'noheart', whatIf: false, checking: true } },
];
