/** 숫자 표시 도우미. 계산은 하지 않는다(CLAUDE.md 규칙 1). */
export const formatNumber = (n: number): string => n.toLocaleString('ko-KR');

/** 오늘 날짜(한국 시간, YYYY-MM-DD). 환율 기준일 같은 "오늘"에 쓴다. */
export const todayKst = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);
