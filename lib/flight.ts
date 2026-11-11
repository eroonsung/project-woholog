import { t } from '@/lib/copy';

/**
 * 인천 출발 비행시간 표시 (D-130, 마이그레이션 006). 값은 countries.flight_* 에서 온 것만 쓴다(CLAUDE.md 규칙 2).
 * 값이 없으면 null을 돌려주고, 화면은 기존 문구만 보여 준다(규칙 11).
 */
export interface FlightInfo { direct: boolean; hours: number }

/** countries 행(또는 비슷한 모양)에서 값을 꺼낸다. 칸이 없거나 비어 있으면 null */
export function flightOf(row: { flight_direct?: boolean | null; flight_hours?: number | string | null } | undefined | null): FlightInfo | null {
  if (!row || row.flight_direct == null || row.flight_hours == null) return null;
  const hours = Number(row.flight_hours);
  return Number.isFinite(hours) && hours > 0 ? { direct: row.flight_direct, hours } : null;
}

/** 2.5 → "2시간 30분", 14 → "14시간", 0.5 → "30분" */
export function formatHours(hours: number): string {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** 작은 글씨로 붙일 시간 글자: "직항 약 2시간 30분" / "최소 약 16시간" */
export function flightSmall(f: FlightInfo): string {
  return t(f.direct ? 'flight.direct' : 'flight.stopover', { time: formatHours(f.hours) });
}

/**
 * 한 줄 문구: main(큰 글씨) + small(작은 글씨).
 * 직항이 없으면 main을 "직항이 없어서 경유해야 해요"로 바꾼다. near는 한국과 가까운 나라인지.
 */
export function flightLine(f: FlightInfo | null, near: boolean): { main: string; small: string | null } {
  const base = t(near ? 'reason.priority.near_korea.ok' : 'reason.priority.near_korea.no');
  if (!f) return { main: base, small: null };
  return { main: f.direct ? base : t('flight.noDirect'), small: flightSmall(f) };
}
