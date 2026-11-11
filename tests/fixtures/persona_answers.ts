import type { Answers } from '@/lib/quiz/types';
import type { JobId, PriorityId } from '@/lib/engine';
import { PERSONAS } from './personas';

/** 가상 사용자 6명의 질문 답(Answers). 질문 화면에서 같은 답을 골랐을 때와 같다. Q1·Q3·Q5는 점수에 영향이 없는 값. */
const STUDY = { 0: 'none', 3: 'm3', 6: 'm6' } as const;

export const PERSONA_ANSWERS: { name: string; answers: Answers }[] = PERSONAS.map(({ name, profile }) => ({
  name,
  answers: {
    q1: { none: true, codes: [] },
    q2: profile.age,
    q3: { together: false },
    q4: profile.visited.length ? { none: false, codes: [...profile.visited].sort() } : { none: true, codes: [] },
    q5: 'y1',
    q6: profile.budgetMan,
    q7: profile.english,
    q8: profile.languages.length ? { none: false, languages: profile.languages } : { none: true, languages: [] },
    q9: profile.jobs.length ? { unknown: false, jobs: profile.jobs as JobId[] } : { unknown: true, jobs: [] },
    q10: profile.earn,
    q11: STUDY[profile.studyMonths as 0 | 3 | 6],
    q12: { unknown: false, priorities: profile.priorities as PriorityId[], hearts: [] },
  },
}));

