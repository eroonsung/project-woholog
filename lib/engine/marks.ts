import type { EngineCountry, Level3, Mark, PriorityId, Profile, ScoringConfig } from './types';

/** 항목별 ✓△✗ 판정. fit_engine_v1.py의 score() 안쪽 규칙을 항목 단위로 나눈 것이다. */

const bool = (v: boolean): Mark => (v ? 'ok' : 'no');

export function moneyMark(c: EngineCountry, p: Profile, cfg: ScoringConfig): Mark {
  const gap = c.needMan - p.budgetMan;
  if (gap <= 0) return 'ok';
  return gap <= cfg.money_tolerance_krw / 10_000 ? 'partial' : 'no';
}

export function speaksLocal(c: EngineCountry, p: Profile): boolean {
  return c.languages.some((l) => p.languages.includes(l));
}

export function languageMark(c: EngineCountry, p: Profile, cfg: ScoringConfig): Mark {
  const lv = cfg.english_levels;
  if (speaksLocal(c, p) || (c.english === 'Y' && p.english >= lv.interview)) return 'ok';
  const partial =
    (c.english !== 'Y' && p.english >= lv.work && !c.localReq) ||
    (c.english === 'H' && p.english >= lv.interview) ||
    (c.english === 'Y' && p.english <= lv.basic_max);
  return partial ? 'partial' : 'no';
}

export function workMark(c: EngineCountry, p: Profile, lang: Mark): Mark {
  if (lang === 'ok') {
    const office = p.jobs.includes('office');
    return (office && c.noFulltime) || c.employerLimit || c.hard ? 'partial' : 'ok';
  }
  if (lang === 'partial') return 'partial';
  return c.korean === 'high' ? 'partial' : 'no';
}

export function studyMark(c: EngineCountry, p: Profile): Mark | null {
  if (!p.studyMonths || c.studyMaxMonths === null) return null; // 안 다니거나 확인 중이면 항목 없음
  return bool(c.studyMaxMonths >= p.studyMonths);
}

const by3 = (v: Level3, high: Mark, mid: Mark, low: Mark): Mark => (v === 'high' ? high : v === 'mid' ? mid : low);

/** 중요한 것(Q12) 칩 1개의 판정. null이면 이 나라는 그 칩을 계산에서 뺀다(값 확인 중). */
export function priorityMark(id: PriorityId, c: EngineCountry, p: Profile, lang: Mark): Mark | null {
  switch (id) {
    case 'money':
      if (c.wage === 'high' && !c.noFulltime) return 'ok';
      return c.wage === 'high' || c.wage === 'mid' || c.wage === 'none' ? 'partial' : 'no';
    case 'easy_job': {
      const obstacles = Number(lang !== 'ok') + Number(c.noFulltime || c.employerLimit) + Number(c.hard);
      return obstacles === 0 ? 'ok' : obstacles === 1 ? 'partial' : 'no';
    }
    case 'english':
      return c.english === 'Y' ? 'ok' : c.english === 'H' ? 'partial' : 'no';
    case 'career':
      if (lang !== 'ok') return 'no';
      return c.noFulltime ? 'partial' : 'ok';
    case 'two_years':
      if (c.farmForExtension && !p.jobs.includes('farm')) return 'partial';
      return c.longStay === 'Y' ? 'ok' : c.longStay === 'P' ? 'partial' : 'no';
    case 'europe':
      return bool(c.europe);
    case 'low_cost':
      return c.price === null ? null : by3(c.price, 'no', 'partial', 'ok');
    case 'sure_pick':
      return c.selection === 'unlimited' ? 'ok' : c.selection === 'first_come' ? 'partial' : 'no';
    case 'few_koreans':
      return c.korean === null ? null : by3(c.korean, 'no', 'partial', 'ok');
    case 'many_koreans':
      return c.korean === null ? null : by3(c.korean, 'ok', 'partial', 'no');
    case 'near_korea':
      return bool(c.nearKorea);
  }
}
