/** 서버 요청 제한: IP당 1분 (SPEC.md 0.8). 넘으면 429. */
export const RATE_LIMITS = {
  result: { limit: 10, windowSeconds: 60 },
  subscribe: { limit: 5, windowSeconds: 60 }, // 9단계
  report: { limit: 3, windowSeconds: 60 }, // 9단계
  vote: { limit: 20, windowSeconds: 60 }, // 10단계
  event: { limit: 60, windowSeconds: 60 }, // 12단계(이용 이벤트, D-137)
} as const;
