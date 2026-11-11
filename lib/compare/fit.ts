import type { Badge, Mark } from '@/lib/engine';
import type { Answers } from '@/lib/quiz/types';
import { t } from '@/lib/copy';
import { itemLabel, reasonText, blockReasonText } from '@/lib/result/text';
import type { StoredResult } from '@/lib/result/types';

/**
 * /r/[id]/compare 맨 위에 보여 주는 "내 결과의 %와 ✓△✗" (SPEC 6장). 저장된 결과를 그대로 꺼내 보여 줄 뿐 다시 계산하지 않는다.
 */
export interface FitCountry {
  pct: number; okCount: number; itemCount: number; badges: Badge[];
  heart: boolean; // 마음에 둔 나라(Q1)
  best: boolean; // 비교 중인 나라 중 적합도 최고
}
export type FitState = FitCountry | { blocked: string } | null; // null = 이 결과에 없는 나라

export interface FitRow {
  key: string;
  label: string;
  cells: Record<string, { mark: Mark; text: string } | null>;
}

export interface FitView {
  byCode: Record<string, FitState>;
  rows: FitRow[];
}

export function buildFit(result: StoredResult, answers: Answers, codes: readonly string[]): FitView {
  const hearts = answers.q1 && !answers.q1.none ? answers.q1.codes : [];
  const nameOf = (code: string) => result.countries[code]?.nameKo ?? code;
  const byCode: Record<string, FitState> = {};

  // 적합도 최고: % 가장 높은 나라, 같으면 엔진 순서가 앞선 나라
  let bestCode: string | null = null;
  for (const code of codes) {
    const idx = result.ranked.findIndex((r) => r.code === code);
    if (idx < 0) continue;
    if (bestCode === null || result.ranked[idx]!.pct > result.ranked.find((r) => r.code === bestCode)!.pct) bestCode = code;
  }

  for (const code of codes) {
    const r = result.ranked.find((x) => x.code === code);
    if (r) {
      byCode[code] = { pct: r.pct, okCount: r.okCount, itemCount: r.itemCount, badges: r.badges, heart: hearts.includes(code), best: code === bestCode && codes.length > 1 };
      continue;
    }
    const b = result.blocked.find((x) => x.code === code);
    byCode[code] = b ? { blocked: blockReasonText(b.reason) } : null;
  }

  // 항목 줄: 비교 중인 나라의 조건 줄을 합쳐 첫 등장 순서대로(핵심 4항목 → 중요한 것)
  const keys: { key: string; kind: 'core' | 'priority'; itemId: string }[] = [];
  for (const code of codes) {
    for (const line of result.ranked.find((x) => x.code === code)?.lines ?? []) {
      const key = `${line.kind}:${line.itemId}`;
      if (!keys.some((k) => k.key === key)) keys.push({ key, kind: line.kind, itemId: line.itemId });
    }
  }
  const order = (k: { kind: string; itemId: string }) => (k.kind === 'core' ? ['money', 'language', 'work', 'study'].indexOf(k.itemId) : 10);
  keys.sort((a, b) => order(a) - order(b));

  const rows: FitRow[] = keys.map((k) => ({
    key: k.key,
    label: itemLabel({ kind: k.kind, itemId: k.itemId as never }),
    cells: Object.fromEntries(codes.map((code) => {
      const line = result.ranked.find((x) => x.code === code)?.lines.find((l) => l.kind === k.kind && l.itemId === k.itemId);
      return [code, line ? { mark: line.mark, text: reasonText(line, { country: nameOf(code) }) } : null];
    })),
  }));
  return { byCode, rows };
}

/** 표 위 "마음에 둔 나라" 같은 이름표 글자 (적합도 칸 머리에서 씀) */
export const fitTags = (f: FitCountry): string[] => [...(f.heart ? [t('result.chip.heart')] : []), ...(f.best ? [t('compare.best')] : [])];
