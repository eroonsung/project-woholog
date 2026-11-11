import { describe, expect, it } from 'vitest';
import { adaptRows, type Badge, type DbRows } from '@/lib/engine';
import { validateAnswers, type ValidationContext } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import snapshot from './fixtures/db_rows_v1.json';
import { COUNTRIES } from './fixtures/countries_v1';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';
import { ITEM_KO, PERSONAS } from './fixtures/personas';

const BADGE_KO: Record<Badge, string> = { hard_to_live: '일하며 지내기 어려움', lottery: '추첨' };
const NAME = new Map(COUNTRIES.map((c) => [c.code, c.nameKo]));
const data = adaptRows(snapshot as unknown as DbRows, { asOf: '2026-11-11' });
const ctx: ValidationContext = {
  countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge!,
};

describe('저장하는 결과 = Python 기대값 (가상 사용자 7명, Yvonne = A)', () => {
  PERSONA_ANSWERS.forEach(({ name, answers }, i) => {
    it(name, () => {
      const checked = validateAnswers(answers, ctx);
      expect(checked.ok).toBe(true);
      if (!checked.ok) return;
      const result = computeResult(checked.answers, data, '2026-11-11');
      const actual = result.ranked.map((r) => ({
        country: NAME.get(r.code), pct: r.pct, ok_count: r.okCount, item_count: r.itemCount,
        flag: r.badges.map((b) => BADGE_KO[b]).join(' '),
        items: r.items.map((it) => ({ item: ITEM_KO[it.id], weight: it.weight, mark: it.mark })),
      }));
      expect(actual).toEqual(PERSONAS[i]!.expected);
    });
  });
});

describe('저장하는 결과의 구성', () => {
  const answers = PERSONA_ANSWERS[1]!.answers; // B: 27세, 낮은 % 나라가 있다
  const checked = validateAnswers(answers, ctx);
  const result = computeResult((checked as { ok: true; answers: typeof answers }).answers, data, '2026-11-11');

  it('조건 줄은 점수에 쓴 항목과 1:1, 문구 키와 값만 담는다', () => {
    for (const r of result.ranked) {
      expect(r.lines).toHaveLength(r.items.length);
      for (const l of r.lines) expect(l.key.startsWith('reason.')).toBe(true);
    }
  });

  it('갈 수 없는 나라와 곧 열려요(핀란드)를 따로 담는다', () => {
    expect(result.comingSoon.map((c) => c.code)).toEqual(['FI']);
    expect(result.blocked.length + result.ranked.length).toBe(28);
  });

  it('돈이 확인 중인 나라를 표시한다(SPEC 4.3)', () => {
    expect(Object.entries(result.countries).filter(([, c]) => c.moneyChecking).map(([code]) => code).sort()).toEqual(['AT', 'ES', 'IE', 'IL', 'PL', 'PT']);
  });

  it('이렇게 바꾸면는 낮은 %(기준 미만) 나라만, 오르는 것만', () => {
    for (const [code, rows] of Object.entries(result.whatIf)) {
      const r = result.ranked.find((x) => x.code === code)!;
      expect(r.pct).toBeLessThan(result.config.lowResultPct);
      for (const row of rows) expect(row.to).toBeGreaterThan(row.from);
    }
    expect(Object.keys(result.whatIf).length).toBeGreaterThan(0);
  });

  it('JSON으로 저장 가능하고 크기가 적당하다', () => {
    const text = JSON.stringify(result);
    expect(JSON.parse(text)).toEqual(result);
    expect(text.length).toBeLessThan(120_000);
  });
});
