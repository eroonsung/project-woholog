import { buildReasons, scoreAll, whatIf, type AdapterResult, type WhatIfRow } from '@/lib/engine';
import { toProfile } from '@/lib/quiz/steps';
import type { Answers } from '@/lib/quiz/types';
import type { StoredResult } from './types';

/**
 * 검증이 끝난 답 + adapter 결과 → 저장할 결과. 서버에서만 부른다(화면에서 계산하지 않는다, CLAUDE.md 규칙 1).
 * 순수 함수: DB·시간·네트워크를 모른다.
 */
export function computeResult(answers: Answers, data: AdapterResult, asOf: string): StoredResult {
  const engines = data.active.map((a) => a.engine);
  const profile = toProfile(answers);
  const { ranked, blocked } = scoreAll(engines, profile, data.config);
  const byCode = new Map(data.active.map((a) => [a.code, a]));

  const rankedOut = ranked.map((r) => {
    const adapted = byCode.get(r.code)!;
    return {
      code: r.code, pct: r.pct, okCount: r.okCount, itemCount: r.itemCount, badges: r.badges, items: r.items,
      lines: buildReasons(r, adapted.engine, profile, data.config),
    };
  });

  const whatIfOut: Record<string, WhatIfRow[]> = {};
  for (const r of ranked) {
    if (r.pct >= data.config.low_result_pct) continue;
    const rows = whatIf(engines, profile, data.config, r.code);
    if (rows.length > 0) whatIfOut[r.code] = rows;
  }

  return {
    v: 1,
    asOf,
    ranked: rankedOut,
    blocked,
    whatIf: whatIfOut,
    countries: Object.fromEntries(
      data.active.map((a) => [a.code, {
        nameKo: a.nameKo, safetyLevel: a.safetyLevel, moneyChecking: a.engine.needMan === null,
        needMan: a.engine.needMan, provenance: a.provenance,
      }]),
    ),
    comingSoon: data.comingSoon,
    config: { lowResultPct: data.config.low_result_pct, closeGapPp: data.config.close_gap_pp },
  };
}
