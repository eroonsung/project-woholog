import type { EarnNeed, EnglishSkill, JobId, PriorityId } from '@/lib/engine';

/** 질문 12개의 답 (SPEC.md 3.2). 아직 답하지 않은 질문은 값이 없다(undefined). */
export interface CountryAnswer {
  none: boolean; // "아직 없어요" / "없어요"
  codes: string[];
}

export type WhenId = 'm3' | 'm6' | 'y1' | 'unknown'; // Q5. 점수에는 쓰지 않는다
export type StudyId = 'none' | 'm3' | 'm6' | 'over6'; // Q11
export type HeartReasonId = 'culture' | 'know_someone'; // Q12 마음 이유 (점수 없음). 'learn_language'는 D-111에서 뺐다(이전 저장 결과에는 남아 있을 수 있다)

export interface Answers {
  q1?: CountryAnswer;
  q2?: number;
  q3?: { together: boolean; companionAge?: number; companionVisited?: CountryAnswer };
  q4?: CountryAnswer;
  q5?: WhenId;
  q6?: number; // 만 원
  q7?: EnglishSkill;
  q8?: { none: boolean; languages: string[] };
  q9?: { unknown: boolean; jobs: JobId[] };
  q10?: EarnNeed;
  q11?: StudyId;
  q12?: { unknown: boolean; priorities: PriorityId[]; hearts: HeartReasonId[] };
}

/** sessionStorage `woholog.quiz.v1`에 저장하는 모양 */
export interface QuizState {
  answers: Answers;
  q: number; // 현재 질문 번호
}

export const EMPTY_STATE: QuizState = { answers: {}, q: 1 };
