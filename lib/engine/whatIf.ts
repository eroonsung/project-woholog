import { scoreAll } from './score';
import type { EngineCountry, Profile, ReasonParams, ScoringConfig } from './types';

/**
 * "이렇게 바꾸면" 제안 (SPEC.md 4.2). 원본 Python에는 없는 기능이라 DB·화면 없이 같은 점수 함수를 다시 돌려 만든다.
 * 답을 하나만 바꿔서 카드 나라의 %가 오르는 경우만 돌려준다(오름폭 큰 순, 같으면 아래 순서).
 * 카드 나라가 이미 low_result_pct 이상이면 제안하지 않는다.
 */
export type WhatIfChange = 'learn_local_language' | 'english_interview' | 'save_gap' | 'earn_partly';

export interface WhatIfRow {
  change: WhatIfChange; // 문구 키: result.whatIf.change.<change> (5단계에서 추가)
  params: ReasonParams;
  code: string;
  from: number;
  to: number;
}

export function whatIf(
  countries: readonly EngineCountry[],
  p: Profile,
  cfg: ScoringConfig,
  code: string,
): WhatIfRow[] {
  const target = countries.find((c) => c.code === code);
  const pctOf = (profile: Profile) => scoreAll(countries, profile, cfg).ranked.find((r) => r.code === code)?.pct;
  const from = pctOf(p);
  if (!target || from === undefined || from >= cfg.low_result_pct) return [];

  const scenarios: { change: WhatIfChange; params: ReasonParams; next: Profile }[] = [];
  const language = target.languages.find((l) => !p.languages.includes(l));
  if (language) scenarios.push({ change: 'learn_local_language', params: { language }, next: { ...p, languages: [...p.languages, language] } });
  if (p.english < cfg.english_levels.interview)
    scenarios.push({ change: 'english_interview', params: {}, next: { ...p, english: cfg.english_levels.interview as Profile['english'] } });
  const gap = target.needMan - p.budgetMan;
  if (gap > 0) scenarios.push({ change: 'save_gap', params: { gap }, next: { ...p, budgetMan: target.needMan } });
  if (p.earn === 'must') scenarios.push({ change: 'earn_partly', params: {}, next: { ...p, earn: 'partly' } });

  return scenarios
    .map((s, order) => ({ s, order, to: pctOf(s.next) }))
    .filter((r): r is typeof r & { to: number } => r.to !== undefined && r.to > from)
    .sort((a, b) => b.to - a.to || a.order - b.order)
    .slice(0, cfg.what_if_max_rows)
    .map(({ s, to }) => ({ change: s.change, params: s.params, code, from, to }));
}
