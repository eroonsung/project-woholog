import { resolveConfig } from './defaults';
import type { EngineCountry, Level3, LongStay, ScoringConfig, Wage } from './types';

/**
 * DB 행 → 엔진 입력 변환 (CLAUDE.md 6장). 순수 함수: 읽어 온 행을 받아 값을 돌려줄 뿐 DB를 모른다.
 * 기준값(임금·물가·한국인 수 구간)은 scoring_config.tiers에서 읽는다(없으면 defaults.ts).
 */
export interface DbRows {
  countries: { code: string; name_ko: string; region: string; english: 'Y' | 'H' | 'N'; languages: string[]; in_europe: boolean; near_korea: boolean; safety_level: string; safety_note: string | null }[];
  programs: { id: number; origin: string; destination: string; kind: string; status: string; age_min: number; age_max: number; selection: EngineCountry['selection']; max_participations: number; stay_months: number; long_stay_months: number | null }[];
  /** 현재 값만(valid_to 없음) */
  facts: { program_id: number; key: string; value_num: number | null; value_text: string | null; currency: string | null; source_id: number | null; verified_at: string }[];
  stats: { country: string; city: string; metric: string; value: number; currency: string | null }[];
  rates: { currency: string; krw_per_unit: number; rate_date: string }[];
  flights: { region: string; krw: number }[];
  sources: { id: number; publisher: string }[];
  config: { key: string; value: unknown }[];
}

export interface Provenance {
  publishers: string[]; // 이 나라 값에 쓰인 출처 이름
  verifiedAt: string | null; // 쓰인 값 중 가장 오래된 확인일
  stale: boolean; // 확인일이 stale_days.badge(기본 180일)보다 오래됨
}

export interface AdaptedCountry {
  code: string;
  nameKo: string;
  region: string;
  safetyLevel: string;
  safetyNote: string | null;
  engine: EngineCountry;
  provenance: Provenance;
}

export interface AdapterResult {
  active: AdaptedCountry[]; // 계산 대상(active 프로그램), 이름(가나다) 순
  comingSoon: { code: string; nameKo: string }[]; // active가 아닌 협정국 → "곧 열려요"
  minAge: number | null; // active age_min 최솟값
  maxAge: number | null; // active age_max 최댓값
  config: ScoringConfig;
  warnings: string[]; // 환율 없음 등. 계산은 멈추지 않는다
}

const FARM_KEY = 'extension_by_regional_work';
const DAY_MS = 86_400_000;

/** scoring_config 행 → 엔진 설정(없는 key는 기본값) */
export function configFromRows(rows: DbRows['config']): ScoringConfig {
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return resolveConfig(byKey as Partial<ScoringConfig>);
}

export function adaptRows(rows: DbRows, opts: { asOf: string; staleDays?: number }): AdapterResult {
  const config = configFromRows(rows.config);
  const { tiers } = config;
  const warnings: string[] = [];
  const staleDays = opts.staleDays ?? staleDaysFrom(rows.config);

  // 환율: 기준일 이전 가장 최근 값
  const rate = new Map<string, number>();
  for (const r of [...rows.rates].sort((a, b) => a.rate_date.localeCompare(b.rate_date))) {
    if (r.rate_date <= opts.asOf) rate.set(r.currency, r.krw_per_unit);
  }
  const flight = new Map(rows.flights.map((f) => [f.region, f.krw]));
  const publisher = new Map(rows.sources.map((s) => [s.id, s.publisher]));
  const countryOf = new Map(rows.countries.map((c) => [c.code, c]));

  const active: AdaptedCountry[] = [];
  const comingSoon: AdapterResult['comingSoon'] = [];

  for (const p of rows.programs.filter((x) => x.origin === 'KR' && x.kind === 'working_holiday')) {
    const c = countryOf.get(p.destination);
    if (!c) { warnings.push(`나라 정보가 없어요: ${p.destination}`); continue; }
    if (p.status !== 'active') { comingSoon.push({ code: c.code, nameKo: c.name_ko }); continue; }

    const facts = new Map(rows.facts.filter((f) => f.program_id === p.id).map((f) => [f.key, f]));
    const stat = (metric: string) => rows.stats.filter((s) => s.country === c.code && s.metric === metric);
    const toKrw = (amount: number, currency: string | null, what: string): number | null => {
      const per = rate.get(currency ?? 'KRW');
      if (per === undefined) { warnings.push(`환율이 없어요: ${c.code} ${what} (${currency})`); return null; }
      return amount * per;
    };

    // need(만 원) = 잔고 증명(없으면 0) + 비자 비용 + 항공권 → 만 원 반올림. 환율이 없으면 null(확인 중)
    const proof = facts.get('proof_amount');
    const fee = facts.get('visa_fee');
    const parts = [
      proof?.value_num != null ? toKrw(proof.value_num, proof.currency, '잔고 증명') : 0,
      fee?.value_num != null ? toKrw(fee.value_num, fee.currency, '비자 비용') : 0,
      flight.get(c.region) ?? null,
    ];
    if (parts[2] === null) warnings.push(`항공권 추정이 없어요: ${c.region}`);
    const needMan = parts.some((x) => x === null) ? null : Math.round((parts as number[]).reduce((a, b) => a + b, 0) / 10_000);

    const used = [proof, fee, facts.get('study_max_months'), facts.get('employer_limit_months'), facts.get('no_fulltime'), facts.get('job_hard_note'), facts.get('job_language_required')]
      .filter((f): f is NonNullable<typeof f> => !!f);
    const dates = used.map((f) => f.verified_at).sort();
    const oldest = dates[0] ?? null;

    const engine: EngineCountry = {
      code: c.code,
      maxAge: p.age_max,
      english: c.english,
      languages: c.languages.filter((l) => l !== '영어'),
      localReq: facts.has('job_language_required'),
      noFulltime: facts.get('no_fulltime')?.value_num === 1,
      employerLimit: (facts.get('employer_limit_months')?.value_num ?? Infinity) <= 3, // 6개월 제한은 화면 표시만
      hard: facts.has('job_hard_note'),
      wage: wageOf(stat('min_wage_hourly'), stat('min_wage_monthly'), tiers.wage_krw_per_hour, toKrw),
      price: levelOf(countryLevel(stat('price_level_kr100')), tiers.price_kr100.low_below, tiers.price_kr100.mid_below, 'price'),
      korean: levelOf(countryLevel(stat('korean_population')), tiers.korean_population.mid_from, tiers.korean_population.many_from, 'korean'),
      studyMaxMonths: facts.get('study_max_months')?.value_num ?? null,
      longStay: longStayOf(p),
      europe: c.in_europe,
      nearKorea: c.near_korea,
      selection: p.selection,
      needMan,
      twice: p.max_participations >= 2,
      farmForExtension: facts.get(FARM_KEY)?.value_num === 1,
      meta: {
        hardNote: facts.get('job_hard_note')?.value_text ?? null,
        employerMonths: facts.get('employer_limit_months')?.value_num ?? null,
        longStayMonths: p.long_stay_months ?? p.stay_months,
      },
    };
    active.push({
      code: c.code, nameKo: c.name_ko, region: c.region, safetyLevel: c.safety_level, safetyNote: c.safety_note, engine,
      provenance: {
        publishers: [...new Set(used.flatMap((f) => (f.source_id != null && publisher.get(f.source_id) ? [publisher.get(f.source_id)!] : [])))],
        verifiedAt: oldest,
        stale: oldest !== null && (Date.parse(opts.asOf) - Date.parse(oldest)) / DAY_MS > staleDays,
      },
    });
  }

  active.sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
  const ages = rows.programs.filter((x) => active.some((a) => a.code === x.destination));
  return {
    active, comingSoon,
    minAge: ages.length ? Math.min(...ages.map((x) => x.age_min)) : null,
    maxAge: ages.length ? Math.max(...ages.map((x) => x.age_max)) : null,
    config, warnings,
  };
}

function staleDaysFrom(rows: DbRows['config']): number {
  const v = rows.find((r) => r.key === 'stale_days')?.value as { badge?: number } | undefined;
  return v?.badge ?? 180;
}

/** 2년 이상 체류·참가 가능: Y / 연장으로 더 길어짐: P / 그 밖: N */
function longStayOf(p: DbRows['programs'][number]): LongStay {
  if ((p.long_stay_months ?? 0) >= 24 || p.stay_months >= 24 || p.max_participations >= 2) return 'Y';
  return (p.long_stay_months ?? 0) > p.stay_months ? 'P' : 'N';
}

/** 나라 전체 값(city '')이 있으면 그 값, 없으면 도시별 값 중 가장 높은 값 */
function countryLevel(rows: DbRows['stats']): number | null {
  const whole = rows.find((r) => r.city === '');
  if (whole) return whole.value;
  return rows.length ? Math.max(...rows.map((r) => r.value)) : null;
}

function levelOf(v: number | null, lowEdge: number, highEdge: number, kind: 'price' | 'korean'): Level3 | null {
  if (v === null) return null;
  // price: 낮은 값이 low(물가 낮음). korean: 큰 값이 high(한국인 많음)
  if (kind === 'price') return v < lowEdge ? 'low' : v < highEdge ? 'mid' : 'high';
  return v >= highEdge ? 'high' : v >= lowEdge ? 'mid' : 'low';
}

/** 최저시급(원) 구간. 시급이 없으면 월급 ÷ monthly_hours. 법정 최저임금 행이 없으면 none. 도시별만 있으면 가장 높은 값 */
function wageOf(
  hourly: DbRows['stats'], monthly: DbRows['stats'], tier: { high: number; mid: number; monthly_hours: number },
  toKrw: (n: number, currency: string | null, what: string) => number | null,
): Wage {
  const best = (rows: DbRows['stats'], divisor: number): number | null => {
    const krw = rows.map((r) => toKrw(r.value, r.currency, '최저임금')).filter((x): x is number => x !== null).map((x) => x / divisor);
    return krw.length ? Math.max(...krw) : null;
  };
  const hourlyWhole = hourly.filter((r) => r.city === '');
  const monthlyWhole = monthly.filter((r) => r.city === '');
  const v = best(hourlyWhole, 1) ?? best(monthlyWhole, tier.monthly_hours) ?? best(hourly, 1) ?? best(monthly, tier.monthly_hours);
  if (v === null) return 'none';
  return v >= tier.high ? 'high' : v >= tier.mid ? 'mid' : 'low';
}
