/** 숫자 표시 도우미. 계산은 하지 않는다(CLAUDE.md 규칙 1). */
export const formatNumber = (n: number): string => n.toLocaleString('ko-KR');

/** 오늘 날짜(한국 시간, YYYY-MM-DD). 환율 기준일 같은 "오늘"에 쓴다. */
export const todayKst = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);

/** 날짜 표시(한국 시간 기준 글자 그대로): 2027-01-13 → "2027년 1월 13일" (SPEC 0.3) */
export function formatKoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return `${y}년 ${m}월 ${d}일`;
}

/** 기간 표시: 같은 달이면 "1월 13일~17일", 달이 다르면 "1월 13일~2월 2일" (SPEC 0.3, 연도 없음) */
export function formatKoRange(opens: string, closes: string): string {
  const [, om, od] = opens.split('-').map(Number) as [number, number, number];
  const [, cm, cd] = closes.split('-').map(Number) as [number, number, number];
  if (opens === closes) return `${om}월 ${od}일`;
  return om === cm ? `${om}월 ${od}일~${cd}일` : `${om}월 ${od}일~${cm}월 ${cd}일`;
}

/** YYYY-MM-DD에 개월 수를 더한다(말일을 넘으면 그 달 말일로) */
export function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}
