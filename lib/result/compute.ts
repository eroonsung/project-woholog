import { buildReasons, scoreAll, whatIf, type AdapterResult, type DbRows, type ReasonLine, type WhatIfRow } from '@/lib/engine';
import { toProfile } from '@/lib/quiz/steps';
import type { Answers } from '@/lib/quiz/types';
import { flightOf } from '@/lib/flight';
import { buildPreview, pickJob } from './preview';
import type { StoredResult } from './types';

/**
 * 검증이 끝난 답 + adapter 결과 → 저장할 결과. 서버에서만 부른다(화면에서 계산하지 않는다, CLAUDE.md 규칙 1).
 * 순수 함수: DB·시간·네트워크를 모른다.
 */
/** "한국과 가까운 곳" 줄에 비행시간 값을 붙인다(없으면 그대로). 문구는 화면에서 문구 파일로 만든다(D-130) */
function withFlight(line: ReasonLine, code: string, rows?: DbRows): ReasonLine {
  if (line.itemId !== 'near_korea') return line;
  const f = flightOf(rows?.countries.find((c) => c.code === code));
  return f ? { ...line, params: { ...line.params, flightDirect: f.direct ? 1 : 0, flightHours: f.hours } } : line;
}

export function computeResult(answers: Answers, data: AdapterResult, asOf: string, rows?: DbRows): StoredResult {
  const engines = data.active.map((a) => a.engine);
  const profile = toProfile(answers);
  const { ranked, blocked } = scoreAll(engines, profile, data.config);
  const byCode = new Map(data.active.map((a) => [a.code, a]));

  const rankedOut = ranked.map((r) => {
    const adapted = byCode.get(r.code)!;
    // 문구의 {job}에는 이용자가 고른 직군에 맞는 대표 일자리를 쓴다(없으면 null → 대체 문구)
    const repJob = rows ? (pickJob(rows.jobTypes, r.code, profile.jobs)?.text ?? null) : null;
    const engine = { ...adapted.engine, meta: { ...adapted.engine.meta, repJob } };
    return {
      code: r.code, pct: r.pct, okCount: r.okCount, itemCount: r.itemCount, badges: r.badges, items: r.items, unknown: r.unknown,
      lines: buildReasons(r, engine, profile, data.config).map((line) => withFlight(line, r.code, rows)),
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
        ...(rows ? { preview: buildPreview(rows, a.code, asOf, data.config, profile.jobs, a.engine.needMan) ?? undefined } : {}),
      }]),
    ),
    comingSoon: data.comingSoon,
    config: { lowResultPct: data.config.low_result_pct, closeGapPp: data.config.close_gap_pp, workFailCapPct: data.config.work_fail_cap_pct },
  };
}
