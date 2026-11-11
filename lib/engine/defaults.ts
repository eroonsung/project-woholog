import type { ScoringConfig } from './types';

/**
 * 기본 기준값. 가중치·기준값의 기본값은 이 파일 한 곳에만 둔다 (CLAUDE.md 규칙 3).
 * 운영에서는 DB scoring_config 값이 이 값을 덮어쓴다(resolveConfig).
 * 값의 출처: docs/engine/fit_engine_v1.py, supabase/seed/seed_v1_1.sql, SPEC.md 4.2.
 */
export const DEFAULT_CONFIG: ScoringConfig = {
  weights: { money: 3, language: 3, work: { must: 3, partly: 1.5, none: 0 }, study: 1.5, priority_each: 1.5 },
  money_tolerance_krw: 2_000_000, // 모자라는 돈이 200만 원 이하면 △
  work_fail_cap_pct: 59,
  low_result_pct: 60,
  mark_values: { ok: 1, partial: 0.5, no: 0 },
  priority_chips: [
    'money', 'easy_job', 'english', 'career', 'two_years', 'europe', 'local_language',
    'low_cost', 'sure_pick', 'few_koreans', 'many_koreans', 'near_korea',
  ],
  english_levels: { interview: 2, work: 3, basic_max: 1 }, // Q7 답 번호: 알바 면접 / 업무 / 주문 정도
  close_gap_pp: 10,
  study_unlimited_months: 99,
  what_if_max_rows: 3,
  tiers: {
    wage_krw_per_hour: { high: 15000, mid: 9500, monthly_hours: 173.8 },
    price_kr100: { low_below: 100, mid_below: 135 },
    korean_population: { many_from: 30000, mid_from: 5000 },
  },
};

/** DB에서 읽은 일부 설정을 기본값 위에 얹는다. 없는 key는 기본값. */
export function resolveConfig(overrides: Partial<ScoringConfig> = {}): ScoringConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    weights: {
      ...DEFAULT_CONFIG.weights,
      ...overrides.weights,
      work: { ...DEFAULT_CONFIG.weights.work, ...overrides.weights?.work },
    },
    mark_values: { ...DEFAULT_CONFIG.mark_values, ...overrides.mark_values },
    english_levels: { ...DEFAULT_CONFIG.english_levels, ...overrides.english_levels },
    tiers: {
      wage_krw_per_hour: { ...DEFAULT_CONFIG.tiers.wage_krw_per_hour, ...overrides.tiers?.wage_krw_per_hour },
      price_kr100: { ...DEFAULT_CONFIG.tiers.price_kr100, ...overrides.tiers?.price_kr100 },
      korean_population: { ...DEFAULT_CONFIG.tiers.korean_population, ...overrides.tiers?.korean_population },
    },
  };
}
