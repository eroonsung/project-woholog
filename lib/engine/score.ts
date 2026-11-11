import { splitCandidates } from './candidates';
import { languageMark, moneyMark, priorityMark, studyMark, workMark } from './marks';
import type {
  Badge, BlockedCountry, CoreItemId, EngineCountry, ItemId, Mark, Profile, ScoreItem, ScoreRow, ScoringConfig,
} from './types';

/** Python round()와 같은 반올림(정확히 .5면 짝수 쪽). 원본이 정답이라 그대로 따른다 (D-011). */
export function roundHalfEven(x: number): number {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

// 동점일 때 순서에 쓰는 "필수 3항목". 원본은 항목 이름이 '돈'·'언어'·'일'인 줄을 모두 센다.
// 그래서 중요한 것 칩 '돈'(money)도 포함된다(원본 그대로).
const ESSENTIAL: ReadonlySet<ItemId> = new Set<ItemId>(['money', 'language', 'work']);

/** 후보 나라 1곳의 점수. fit_engine_v1.py score()의 안쪽 반복 1회분. */
export function scoreCountry(c: EngineCountry, p: Profile, cfg: ScoringConfig): ScoreRow {
  const items: ScoreItem[] = [];
  const core = (id: CoreItemId, weight: number, mark: Mark) => items.push({ kind: 'core', id, weight, mark });

  const money = moneyMark(c, p, cfg);
  if (money !== null) core('money', cfg.weights.money, money);
  const lang = languageMark(c, p, cfg);
  core('language', cfg.weights.language, lang);

  const work = workMark(c, p, lang); // 일을 안 구해도 되는 사람도 아래 상한(59%) 판정에는 쓴다
  const workWeight = cfg.weights.work[p.earn];
  if (workWeight) core('work', workWeight, work);

  const study = studyMark(c, p);
  if (study !== null) core('study', cfg.weights.study, study);

  for (const id of p.priorities) {
    const mark = priorityMark(id, c, p, lang);
    if (mark !== null) items.push({ kind: 'priority', id, weight: cfg.weights.priority_each, mark });
  }

  const value = (m: Mark) => cfg.mark_values[m];
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  const got = items.reduce((sum, i) => sum + i.weight * value(i.mark), 0);
  let pct = roundHalfEven((got / total) * 100);

  const badges: Badge[] = [];
  if (p.earn === 'must' && value(work) === value('no')) {
    pct = Math.min(pct, cfg.work_fail_cap_pct);
    badges.push('hard_to_live');
  }
  if (c.selection === 'lottery') badges.push('lottery');

  return {
    code: c.code,
    pct,
    okCount: items.filter((i) => i.mark === 'ok').length,
    itemCount: items.length,
    essential: items.reduce((sum, i) => (ESSENTIAL.has(i.id) ? sum + i.weight * value(i.mark) : sum), 0),
    items,
    badges,
  };
}

/**
 * 후보 나라 전체 점수와 순서. 정렬: % 높은 순 → ✓ 많은 순 → 필수 3항목 점수 높은 순,
 * 모두 같으면 입력 순서(안정 정렬). 화면에서 다시 정렬하지 않는다 (SPEC.md 4.5).
 */
export function scoreAll(
  countries: readonly EngineCountry[],
  p: Profile,
  cfg: ScoringConfig,
): { ranked: ScoreRow[]; blocked: BlockedCountry[] } {
  const { candidates, blocked } = splitCandidates(countries, p);
  const ranked = candidates
    .map((c) => scoreCountry(c, p, cfg))
    .sort((a, b) => b.pct - a.pct || b.okCount - a.okCount || b.essential - a.essential);
  return { ranked, blocked };
}
