import type { HeartReasonId } from './types';
/** 질문 화면 입력 범위 (SPEC.md 3.2). 점수 기준값이 아니라 입력 UI 범위라서 scoring_config가 아니다. */
export const QUESTION_COUNT = 12;
export const MAX_HEART_COUNTRIES = 3; // Q1 최대 선택 수
export const MAX_PRIORITIES = 3; // Q12 최대 선택 수
export const AGE_MAX = 99;
export const BUDGET = { min: 100, max: 2000, step: 50, default: 500 } as const; // 만 원
export const MIN_LOADING_MS = 1200; // 계산 중 화면 최소 시간 (SPEC.md 3.3)
export const STUDY_MONTHS = { none: 0, m3: 3, m6: 6, over6: 12 } as const; // "6개월 넘게"는 12개월로 계산(확인 필요)

/** Q12 마음 이유 선택지 (점수 없음). 'learn_language'는 D-111에서 "현지 언어 배우기" 칩과 겹쳐 뺐다. */
export const HEART_IDS: readonly HeartReasonId[] = ['culture', 'know_someone'];
