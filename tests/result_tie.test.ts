import { describe, expect, it } from 'vitest';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { pickCard } from '@/lib/result/card';
import { computeResult } from '@/lib/result/compute';
import { t } from '@/lib/copy';
import snapshot from './fixtures/db_rows_v1.json';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

/** 동점(공동 1위): 마음에 둔 나라 %가 1위와 같으면 "0%p 차이"가 아니라 같은 점수라고 알린다. 엔진 순서는 그대로(D-130) */
const rows = snapshot as unknown as DbRows;
const data = adaptRows(rows, { asOf: '2026-11-11' });
const ctx = { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! };
function resultOf(base: (typeof PERSONA_ANSWERS)[number]['answers'], heartCodes: string[]) {
  const v = validateAnswers({ ...base, q1: heartCodes.length ? { none: false, codes: heartCodes } : { none: true, codes: [] } }, ctx);
  if (!v.ok) throw new Error(v.reason);
  const result = computeResult(v.answers, data, '2026-11-11', rows);
  return { result, plan: pickCard(v.answers, result)! };
}

// 1위와 같은 %인 다른 나라가 있는 가상 사용자를 찾는다(데이터가 바뀌어도 시험이 따라가게)
const found = PERSONA_ANSWERS.map((p) => ({ p, result: resultOf(p.answers, []).result })).find(({ result }) => result.ranked.some((r) => r.pct === result.ranked[0]!.pct && r.code !== result.ranked[0]!.code));
const base = (found ?? { p: PERSONA_ANSWERS[0]! }).p.answers;
const planFor = (heartCodes: string[]) => resultOf(base, heartCodes);

describe('결과 카드 동점', () => {
  const { result } = planFor([]);
  const first = result.ranked[0]!;
  const tied = result.ranked.filter((r) => r.pct === first.pct && r.code !== first.code);
  const lower = result.ranked.find((r) => first.pct - r.pct >= 1 && first.pct - r.pct < result.config.closeGapPp);

  it('시험 조건: 1위와 같은 %인 다른 나라가 있는 가상 사용자가 있다', () => expect(tied.length).toBeGreaterThan(0));

  it('마음에 둔 나라가 1위와 같은 %이면 "공동 1위"(top1): 0%p 차이 문구가 아니라 같은 점수 문구', () => {
    const { plan } = planFor([tied[0]!.code]);
    expect(plan.kind).toBe('top1');
    expect(plan.tie).toBe(true);
    expect(plan.card.code).toBe(tied[0]!.code);
    expect(plan.headline.key).toBe('result.heart.tie');
    const text = t(plan.headline.key, plan.headline.params);
    expect(text).toContain('같은 점수예요');
    expect(text).not.toContain('%p 차이');
    expect(text).not.toContain('0%p');
    expect(plan.showWhatIf).toBe(false);
  });
  it('엔진 순서는 그대로: 1위는 여전히 엔진 1위이고 TOP 3에 들어 있다(카드 나라는 빠짐)', () => {
    const { plan, result: r } = planFor([tied[0]!.code]);
    expect(r.ranked[0]!.code).toBe(first.code);
    expect(plan.top3.map((x) => x.code)).toContain(first.code);
    expect(plan.top3.some((x) => x.code === plan.card.code)).toBe(false);
    expect(plan.topTitleKey).toBe('result.next'); // "더 잘 맞는 나라"가 아니라 "다음으로 잘 맞는 나라"
    expect(plan.compare).toEqual({ codes: [plan.card.code, first.code], labelKey: 'compare.cta' });
  });
  it('마음에 둔 나라가 진짜 1위면 예전 문구(tie 아님)', () => {
    const { plan } = planFor([first.code]);
    expect(plan.tie).toBe(false);
    expect(plan.headline.key).toBe('result.heart.top');
  });
  it('1위보다 1~9%p 낮으면 여전히 "close"(차이 문구), 이때 tie는 아니다', () => {
    if (!lower) return; // 데이터에 없으면 건너뜀
    const { plan } = planFor([lower.code]);
    expect(plan.kind).toBe('close');
    expect(plan.tie).toBe(false);
    expect(t(plan.headline.key, plan.headline.params)).toMatch(/%p 차이/);
  });
  it('문구의 조사가 맞는다(…이/가 1위 …와/과)', () => {
    expect(t('result.heart.tie', { country: '캐나다', top: '호주' })).toBe('캐나다가 1위 호주와 같은 점수예요. 마음 가는 대로 가도 좋아요.');
    expect(t('result.heart.tie', { country: '독일', top: '영국' })).toBe('독일이 1위 영국과 같은 점수예요. 마음 가는 대로 가도 좋아요.');
  });
});
