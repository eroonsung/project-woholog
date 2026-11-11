/**
 * 생년월일 → 만 나이 (질문 2의 계산기). 브라우저에서만 쓰고, 생년월일은 저장하지도 서버로 보내지도 않는다.
 * 순수 함수: "오늘"은 인자로 받는다(테스트용). 한국 시간 기준 날짜는 lib/format.ts의 todayKst().
 */
export const BIRTH_YEAR_MIN = 1900;

export type BirthCheck =
  | { ok: true; age: number }
  | { ok: false; reason: 'incomplete' | 'invalid' | 'future' };

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysIn = (y: number, m: number) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;

/** 올해의 생일(월·일). 2월 29일생은 평년에 3월 1일을 생일로 본다(민법의 연령 계산 관행). */
function birthdayIn(year: number, m: number, d: number): [number, number] {
  return m === 2 && d === 29 && !isLeap(year) ? [3, 1] : [m, d];
}

const toInt = (s: string): number | null => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : null);

/** 년·월·일 글자와 오늘(YYYY-MM-DD)로 만 나이를 계산한다. 아직 다 안 적었으면 incomplete. */
export function ageFromBirth(yearText: string, monthText: string, dayText: string, today: string): BirthCheck {
  if (!yearText.trim() || !monthText.trim() || !dayText.trim()) return { ok: false, reason: 'incomplete' };
  const y = toInt(yearText), m = toInt(monthText), d = toInt(dayText);
  if (y === null || m === null || d === null) return { ok: false, reason: 'invalid' };
  // 연도는 4자리가 다 입력됐을 때만 판단한다(입력 도중에 틀렸다고 하지 않도록)
  if (yearText.trim().length < 4) return { ok: false, reason: 'incomplete' };
  if (y < BIRTH_YEAR_MIN || m < 1 || m > 12 || d < 1 || d > daysIn(y, m)) return { ok: false, reason: 'invalid' };

  const [ty, tm, td] = today.split('-').map(Number) as [number, number, number];
  if (y > ty || (y === ty && (m > tm || (m === tm && d > td)))) return { ok: false, reason: 'future' };

  const [bm, bd] = birthdayIn(ty, m, d);
  const passed = tm > bm || (tm === bm && td >= bd);
  return { ok: true, age: ty - y - (passed ? 0 : 1) };
}
