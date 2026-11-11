import type { ChecklistRows } from '@/lib/data/queries';
import { addDaysIso, addMonthsIso, daysBetween } from '@/lib/format';

/**
 * D-day 체크리스트의 순수 계산 (SPEC 10장): 항목 만들기 · 출국일 + days_offset → 날짜 · 늦음 · 진행률 · 링크로 옮길 때 체크 상태 줄이기·풀기.
 * 화면과 저장소를 모른다(테스트는 checklist.test.ts). 문구는 화면이 copy 키로 붙인다.
 */
export const PHASES = ['decide', 'apply', 'prepare', 'depart', 'arrive', 'during'] as const; // return은 MVP에서 쓰지 않는다
export type Phase = (typeof PHASES)[number];
export const MAX_YEARS_AHEAD = 3;

export interface Entry {
  key: string; // 'i12' = 항목 12, 'd5' = 서류 5 (두 표의 id가 겹쳐서 앞에 종류를 붙인다)
  kind: 'item' | 'doc';
  phase: Phase;
  offset: number | null; // 출국일 기준 일 수(D-90 = -90). 서류와 날짜 없는 항목은 null
  title: string;
  body: string | null;
  needsReview: boolean;
  sourceId: number | null;
  verifiedAt: string;
  doc?: { issuer: string | null; maxAgeDays: number | null; translation: boolean; apostille: boolean };
}

const PHASE_SET = new Set<string>(PHASES);

/** 공통 항목 + 그 나라 항목 + 그 나라 서류. 단계 순 → 날짜 순(날짜 없는 것은 뒤) → 서류는 신청 단계 맨 뒤 */
export function buildEntries(rows: ChecklistRows, programId: number | null): Entry[] {
  const items = rows.items
    .filter((i) => (i.program_id === null || i.program_id === programId) && PHASE_SET.has(i.phase))
    .sort((a, b) => PHASES.indexOf(a.phase as Phase) - PHASES.indexOf(b.phase as Phase) || (a.days_offset ?? 9999) - (b.days_offset ?? 9999) || a.sort_order - b.sort_order)
    .map((i): Entry => ({
      key: `i${i.id}`, kind: 'item', phase: i.phase as Phase, offset: i.days_offset, title: i.title_ko, body: i.body_ko,
      needsReview: i.needs_review, sourceId: i.source_id, verifiedAt: i.verified_at,
    }));
  const docs = (programId === null ? [] : rows.docs.filter((d) => d.program_id === programId))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((d): Entry => ({
      key: `d${d.id}`, kind: 'doc', phase: 'apply', offset: null, title: d.title_ko, body: d.body_ko, needsReview: d.needs_review,
      sourceId: d.source_id, verifiedAt: d.verified_at,
      doc: { issuer: d.issuer, maxAgeDays: d.max_age_days, translation: d.translation_required, apostille: d.apostille_required },
    }));
  return PHASES.flatMap((phase) => [...items.filter((e) => e.phase === phase), ...(phase === 'apply' ? docs : [])]);
}

/** 그 나라 항목·서류가 하나도 없는가(공통 항목만 보이는 나라 → "이 나라 서류는 정리하는 중이에요") */
export const hasCountryContent = (rows: ChecklistRows, programId: number | null): boolean =>
  programId !== null && (rows.items.some((i) => i.program_id === programId) || rows.docs.some((d) => d.program_id === programId));

// ---------- 날짜 ----------
export const isIsoDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

/** 출국 예정일: 오늘 이후(오늘 포함) ~ 3년 안 (SPEC 10.1) */
export const isValidDeparture = (date: string, today: string): boolean =>
  isIsoDate(date) && date >= today && date <= addMonthsIso(today, MAX_YEARS_AHEAD * 12);

export const maxDeparture = (today: string): string => addMonthsIso(today, MAX_YEARS_AHEAD * 12);

/** "D-120" / "D-day" / "D+7" */
export const dLabel = (offset: number): string => (offset < 0 ? `D-${-offset}` : offset === 0 ? 'D-day' : `D+${offset}`);

export interface Timing { date: string | null; label: string | null; late: boolean }

/** 항목 하나의 날짜·D-day·늦음. 출국일이 없거나 날짜 없는 항목은 날짜 없음, 체크된 항목은 늦지 않다 (SPEC 10.2) */
export function timing(e: Pick<Entry, 'offset'>, departure: string | null, today: string, done: boolean): Timing {
  if (e.offset === null) return { date: null, label: null, late: false };
  const date = departure ? addDaysIso(departure, e.offset) : null;
  return { date, label: dLabel(e.offset), late: !done && date !== null && date < today };
}

/** 출국까지 남은 일 수(오늘 = 0, 이미 지났으면 음수) */
export const daysUntil = (departure: string, today: string): number => daysBetween(today, departure);

/** 진행률: 지금 있는 항목 중 체크된 수(없어진 항목의 체크는 세지 않는다) */
export function progress(entries: readonly Entry[], checked: readonly string[]): { total: number; done: number } {
  const set = new Set(checked);
  return { total: entries.length, done: entries.filter((e) => set.has(e.key)).length };
}

export const phaseEntries = (entries: readonly Entry[], phase: Phase): Entry[] => entries.filter((e) => e.phase === phase);

// ---------- 링크로 옮기기: 체크한 항목 키 ↔ 짧은 글자(base64url) ----------
const KEY = /^([id])(\d{1,9})$/;
const toNum = (key: string): number | null => { const m = KEY.exec(key); return m ? Number(m[2]) * 2 + (m[1] === 'd' ? 1 : 0) : null; };
const toKey = (n: number): string => `${n % 2 === 1 ? 'd' : 'i'}${Math.floor(n / 2)}`;

/** 체크 키 → base64url. 키를 숫자(항목 2n, 서류 2n+1)로 바꿔 오름차순으로 정렬하고, 앞 값과의 차이를 가변 길이 바이트로 쓴다. 항목이 바뀌어도 id만 보므로 안 깨진다. */
export function encodeChecked(keys: readonly string[]): string {
  const nums = [...new Set(keys.map(toNum).filter((n): n is number => n !== null && n > 1))].sort((a, b) => a - b);
  const bytes: number[] = [];
  let prev = 0;
  for (const n of nums) {
    let delta = n - prev;
    prev = n;
    while (delta >= 0x80) { bytes.push((delta & 0x7f) | 0x80); delta = Math.floor(delta / 0x80); }
    bytes.push(delta);
  }
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** base64url → 체크 키. 깨진 글자면 null. `valid`가 있으면 지금 없는 항목은 조용히 뺀다. */
export function decodeChecked(s: string, valid?: ReadonlySet<string>): string[] | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.length > 4000) return null;
  let bytes: number[];
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    bytes = [...atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))].map((c) => c.charCodeAt(0));
  } catch { return null; }
  const out: string[] = [];
  let value = 0, shift = 1, prev = 0;
  for (const byte of bytes) {
    value += (byte & 0x7f) * shift;
    if (byte & 0x80) { shift *= 0x80; if (shift > 2 ** 40) return null; continue; }
    prev += value;
    value = 0; shift = 1;
    if (prev > 2_000_000_000) return null;
    out.push(toKey(prev));
  }
  if (shift !== 1) return null; // 끝이 잘림
  return valid ? out.filter((k) => valid.has(k)) : out;
}

/** 두 체크 목록이 같은가(순서 무시) */
export const sameChecked = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && new Set(a).size === new Set([...a, ...b]).size;

/** 공유 주소 `/checklist?c=JP&d=2027-03-01&s=…` (날짜·체크가 없으면 그 값은 뺀다) */
export function checklistHref(code: string, date: string | null, checked: readonly string[]): string {
  const p = new URLSearchParams({ c: code });
  if (date) p.set('d', date);
  const s = encodeChecked(checked);
  if (s) p.set('s', s);
  return `/checklist?${p.toString()}`;
}
