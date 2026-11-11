import type { DbRows, JobId, ScoringConfig } from '@/lib/engine';
import { addMonthsIso } from '@/lib/format';
import type { StoredMoney, StoredPreview } from './types';

/**
 * 결과의 "현실 미리보기"(SPEC 4.4)에 쓰는 값을 DB 행에서 모은다. 서버에서 결과를 저장할 때 한 번 계산하고,
 * 화면은 저장된 값을 보여 주기만 한다(환율 환산·시급 계산은 여기서). 값이 없으면 null → 화면에서 "확인 중".
 */
const JOB_ORDER: JobId[] = ['cafe', 'retail', 'hotel', 'farm', 'office', 'care'];

/** 대표 일자리: 이용자가 고른 직군(Q9) 순서대로 그 나라에 있는 것, 없으면 그 나라의 첫 번째 */
export function pickJob(rows: DbRows['jobTypes'], country: string, wanted: JobId[]): { code: string; text: string } | null {
  const mine = rows.filter((r) => r.country === country);
  const byCode = (code: string) => mine.find((r) => r.job_code === code);
  const found = wanted.map(byCode).find(Boolean) ?? JOB_ORDER.map(byCode).find(Boolean);
  return found ? { code: found.job_code, text: found.description_ko } : null;
}

export function buildPreview(rows: DbRows, code: string, asOf: string, config: ScoringConfig, wanted: JobId[], needMan: number | null): StoredPreview | null {
  const program = rows.programs.find((p) => p.origin === 'KR' && p.destination === code && p.kind === 'working_holiday');
  const country = rows.countries.find((c) => c.code === code);
  if (!program || !country) return null;

  const rate = new Map<string, number>();
  let fxDate: string | null = null;
  for (const r of [...rows.rates].sort((a, b) => a.rate_date.localeCompare(b.rate_date))) {
    if (r.rate_date <= asOf) { rate.set(r.currency, r.krw_per_unit); fxDate = r.rate_date; }
  }
  const krwPer = (currency: string | null) => rate.get(currency ?? 'KRW');
  const fact = (key: string) => rows.facts.find((f) => f.program_id === program.id && f.key === key);
  const money = (key: string): StoredMoney | null => {
    const f = key === 'proof_amount' ? (fact('proof_amount_with_ticket') ?? fact('proof_amount')) : fact(key);
    if (!f || f.value_num == null) return null;
    const per = krwPer(f.currency);
    return { amount: f.value_num, currency: f.currency ?? 'KRW', man: per === undefined ? null : Math.round((f.value_num * per) / 10_000) };
  };
  const flight = rows.flights.find((f) => f.region === country.region);

  // 통계 값: 나라 전체(city '')가 있으면 그 값, 없으면 도시별 중 가장 높은 값(원화 환산 기준)
  const stat = (metric: string) => rows.stats.filter((s) => s.country === code && s.metric === metric);
  const best = (list: DbRows['stats']) => {
    const whole = list.find((s) => s.city === '');
    if (whole) return whole;
    return [...list].sort((a, b) => b.value * (krwPer(b.currency) ?? 0) - a.value * (krwPer(a.currency) ?? 0))[0];
  };

  const hourly = best(stat('min_wage_hourly'));
  const monthly = best(stat('min_wage_monthly'));
  const hours = config.tiers.wage_krw_per_hour.monthly_hours;
  const wage = hourly
    ? { amount: hourly.value, currency: hourly.currency ?? 'KRW', city: hourly.city, derived: false }
    : monthly
      ? { amount: Math.round((monthly.value / hours) * 100) / 100, currency: monthly.currency ?? 'KRW', city: monthly.city, derived: true }
      : null;

  const rentMonth = best(stat('rent_month'));
  const rentWeek = best(stat('rent_week'));
  const rentRow = rentMonth ?? rentWeek;
  const rent = rentRow
    ? { amount: rentRow.value, max: rentRow.value_max, currency: rentRow.currency ?? 'KRW', city: rentRow.city, unit: (rentMonth ? 'month' : 'week') as 'month' | 'week' }
    : null;

  return {
    money: { needMan, proof: money('proof_amount'), fee: money('visa_fee'), health: money('health_surcharge'), flightMan: flight ? Math.round(flight.krw / 10_000) : null },
    job: pickJob(rows.jobTypes, code, wanted),
    wage,
    rent,
    next: {
      selection: program.selection,
      quota: program.annual_quota,
      windows: rows.windows.filter((w) => w.program_id === program.id).map((w) => ({ opensOn: w.opens_on, closesOn: w.closes_on, note: w.note })).sort((a, b) => a.opensOn.localeCompare(b.opensOn)),
    },
    fxDate,
  };
}

export type NextApply =
  | { kind: 'window'; opensOn: string; closesOn: string | null; note: string | null }
  | { kind: 'always' }
  | { kind: 'first_come'; quota: number | null }
  | { kind: 'lottery'; quota: number | null }
  | { kind: 'unknown' };

/** 다음 접수: 오늘 이후 가장 가까운(지금 열려 있는 것 포함) 기간. 없으면 상시·선착순·추첨 안내, 그것도 없으면 unknown (SPEC 4.4) */
export function nextApply(next: StoredPreview['next'], today: string): NextApply {
  const upcoming = next.windows.find((w) => (w.closesOn ?? '9999-12-31') >= today);
  if (upcoming) return { kind: 'window', ...upcoming };
  if (next.selection === 'unlimited') return { kind: 'always' };
  if (next.selection === 'first_come') return { kind: 'first_come', quota: next.quota };
  if (next.selection === 'lottery') return { kind: 'lottery', quota: next.quota };
  return { kind: 'unknown' };
}

const MONTHS = { m3: 3, m6: 6, y1: 12 } as const;

/** Q5에서 고른 출국 시기보다 접수가 늦은가("원하는 시기보다 접수가 늦어요"). 시기를 모르면 false (SPEC 4.4) */
export function isLate(apply: NextApply, when: string | undefined, today: string): boolean {
  if (apply.kind !== 'window' || !when || !(when in MONTHS)) return false;
  return apply.opensOn > addMonthsIso(today, MONTHS[when as keyof typeof MONTHS]);
}
