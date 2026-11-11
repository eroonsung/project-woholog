import type {
  EngineCountry, Mark, Profile, ReasonLine, ReasonParams, ScoreItem, ScoreRow, ScoringConfig,
} from './types';

/**
 * 조건 줄의 문구 키 고르기. 문장은 여기에 쓰지 않는다: 키와 자리표시자 값만 돌려준다 (CLAUDE.md 규칙 4).
 * 키는 `reason.<항목>.<ok|partial|no>[.<경우>]` 모양이고, 문장은 docs/content/copy_ko.md 5장이 원본이다.
 * 키를 copy_ko.json에 넣는 일은 5단계에서 한다.
 * 줄 순서: ✗ → △ → ✓, 같은 표시끼리는 점수 계산 순서 (SPEC.md 4.3).
 */

const MARK_ORDER: Record<Mark, number> = { no: 0, partial: 1, ok: 2 };

function languageName(c: EngineCountry): string {
  return c.languages.join('·');
}

function coreReason(item: ScoreItem, row: ScoreRow, c: EngineCountry, p: Profile, cfg: ScoreCfg): [string, ReasonParams] {
  const base = `reason.${item.id}.${item.mark}`;
  const mark = (id: string) => row.items.find((i) => i.id === id)?.mark;
  switch (item.id) {
    case 'money': {
      const gap = Math.max(0, c.needMan - p.budgetMan);
      return [base, { budget: p.budgetMan, need: c.needMan, gap }];
    }
    case 'language': {
      const language = languageName(c);
      if (item.mark === 'ok') {
        const english = c.english === 'Y' && p.english >= cfg.english_levels.interview;
        return english ? [`${base}.english`, {}] : [`${base}.local`, { language }];
      }
      if (item.mark === 'partial') {
        if (c.english === 'H') return [`${base}.mixed`, {}];
        if (c.english === 'Y') return [`${base}.englishWeak`, {}];
        return [`${base}.englishWork`, { language }];
      }
      return [c.localReq ? `${base}.localRequired` : `${base}.generic`, { language }];
    }
    case 'work': {
      const lang = mark('language');
      if (item.mark === 'ok') return [base, { job: c.meta?.repJob ?? null }];
      if (item.mark === 'no') return [base, {}];
      if (lang === 'ok') {
        if (p.jobs.includes('office') && c.noFulltime) return [`${base}.noFulltime`, {}];
        if (c.employerLimit) return [`${base}.employerLimit`, { months: c.meta?.employerMonths ?? null }];
        return [`${base}.hardNote`, { hardNote: c.meta?.hardNote ?? null }];
      }
      return [lang === 'partial' ? `${base}.language` : `${base}.korean`, {}];
    }
    default: {
      // study
      const months = c.studyMaxMonths;
      if (item.mark === 'ok')
        return months !== null && months >= cfg.study_unlimited_months
          ? [`${base}.unlimited`, {}]
          : [base, { months }];
      return months === 0 ? [`${base}.none`, {}] : [base, { months, plan: p.studyMonths }];
    }
  }
}

type ScoreCfg = ScoringConfig;

function obstaclesOf(c: EngineCountry, lang: Mark | undefined): string[] {
  return [
    ...(lang !== 'ok' ? ['localLanguage'] : []),
    ...(c.noFulltime ? ['noFulltime'] : []),
    ...(c.employerLimit ? ['employerLimit'] : []),
    ...(c.hard ? ['hardCompetition'] : []),
  ];
}

function priorityReason(item: ScoreItem, row: ScoreRow, c: EngineCountry, p: Profile): [string, ReasonParams] {
  const base = `reason.priority.${item.id}.${item.mark}`;
  if (item.id === 'easy_job' && item.mark !== 'ok')
    return [base, { obstacles: obstaclesOf(c, row.items.find((i) => i.id === 'language')?.mark) }];
  if (item.id === 'two_years') {
    if (c.farmForExtension && !p.jobs.includes('farm')) return [`${base}.farm`, {}];
    if (item.mark === 'ok') return [base, { long: c.meta?.longStayMonths ?? null }];
  }
  return [base, {}];
}

/** 한 나라의 조건 줄 전체. 점수 계산에 쓴 항목과 1:1로 대응한다(확인 중 항목은 없음). */
export function buildReasons(row: ScoreRow, c: EngineCountry, p: Profile, cfg: ScoringConfig): ReasonLine[] {
  return row.items
    .map((item, order): [ReasonLine, number] => {
      const [key, params] =
        item.kind === 'core' ? coreReason(item, row, c, p, cfg) : priorityReason(item, row, c, p);
      return [{ mark: item.mark, kind: item.kind, itemId: item.id, key, params }, order];
    })
    .sort(([a, ao], [b, bo]) => MARK_ORDER[a.mark] - MARK_ORDER[b.mark] || ao - bo)
    .map(([line]) => line);
}

/** 위 줄 중 "조건 N개 중 M개 ✓"에 쓰는 값. 확인 중인 조건은 N에서 빠진다 (SPEC.md 4.3). */
export function scoreSummary(row: ScoreRow): { ok: number; total: number } {
  return { ok: row.okCount, total: row.itemCount };
}
