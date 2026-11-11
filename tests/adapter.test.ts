import { describe, expect, it } from 'vitest';
import { adaptRows, DEFAULT_CONFIG, scoreAll, type DbRows, type EngineCountry } from '@/lib/engine';
import snapshot from './fixtures/db_rows_v1.json';
import { COUNTRIES } from './fixtures/countries_v1';
import { PERSONAS } from './fixtures/personas';

/**
 * adapter 결과 = Python 엔진의 나라 표(tests/fixtures/countries_v1.ts, 28개)와 완전히 같아야 한다 (CLAUDE.md 6장).
 * 입력은 운영 DB에서 읽어 저장한 스냅샷(db_rows_v1.json). 갱신: SNAPSHOT=1 npx vitest run tests/snapshot_db.test.ts
 */
const rows = snapshot as unknown as DbRows;
const result = adaptRows(rows, { asOf: '2026-11-11' });
const byCode = new Map(result.active.map((a) => [a.code, a.engine]));

const FIELDS = [
  'maxAge', 'english', 'languages', 'localReq', 'noFulltime', 'employerLimit', 'hard', 'wage', 'price', 'korean',
  'studyMaxMonths', 'longStay', 'europe', 'nearKorea', 'selection', 'needMan', 'twice', 'farmForExtension',
] as const satisfies readonly (keyof EngineCountry)[];

describe('adapter: DB → 엔진 입력', () => {
  it('active 프로그램 28개만 계산 대상, 핀란드는 "곧 열려요"', () => {
    expect(result.active).toHaveLength(28);
    expect(result.active.map((a) => a.code).sort()).toEqual(COUNTRIES.map((c) => c.code).sort());
    expect(result.comingSoon.map((c) => c.code)).toEqual(['FI']);
  });

  it('28개국 모든 값이 Python 나라 표와 같다 (다르면 나라·항목별 차이 표가 나온다)', () => {
    const diffs: string[] = [];
    for (const f of COUNTRIES) {
      const a = byCode.get(f.code);
      if (!a) { diffs.push(`${f.code} 없음`); continue; }
      for (const k of FIELDS) {
        if (JSON.stringify(a[k]) !== JSON.stringify(f[k])) diffs.push(`${f.nameKo}(${f.code}) ${k}: Python=${JSON.stringify(f[k])} DB=${JSON.stringify(a[k])}`);
      }
    }
    expect(diffs).toEqual([]);
  });

  it('나이 범위·설정값', () => {
    expect(result.minAge).toBe(18);
    expect(result.maxAge).toBe(Math.max(...COUNTRIES.map((c) => c.maxAge)));
    expect(result.config.english_levels).toEqual(DEFAULT_CONFIG.english_levels); // 시드의 값이 기본값과 같다
    expect(result.config.close_gap_pp).toBe(10);
    expect(result.config.what_if_max_rows).toBe(3);
  });

  it('환율이 없는 통화는 계산을 멈추지 않고 돈 항목만 확인 중(null), 경고를 남긴다', () => {
    const noRate = adaptRows({ ...rows, rates: rows.rates.filter((r) => r.currency !== 'AUD') }, { asOf: '2026-11-11' });
    expect(noRate.active).toHaveLength(28);
    expect(noRate.active.find((a) => a.code === 'AU')?.engine.needMan).toBeNull();
    expect(noRate.active.find((a) => a.code === 'CA')?.engine.needMan).not.toBeNull();
    expect(noRate.warnings.some((w) => w.includes('AU') && w.includes('AUD'))).toBe(true);
  });

  it('돈이 확인 중인 나라는 돈 조건만 빼고 계산한다', () => {
    const noRate = adaptRows({ ...rows, rates: rows.rates.filter((r) => r.currency !== 'AUD') }, { asOf: '2026-11-11' });
    const p = PERSONAS[0]!.profile;
    const au = scoreAll(noRate.active.map((a) => a.engine), { ...p, visited: [] }, noRate.config).ranked.find((r) => r.code === 'AU')!;
    expect(au.items.some((i) => i.kind === 'core' && i.id === 'money')).toBe(false);
  });

  it('출처 이름·확인일·오래된 값 여부를 같이 넘긴다', () => {
    const au = result.active.find((a) => a.code === 'AU')!;
    expect(au.provenance.publishers.length).toBeGreaterThan(0);
    expect(au.provenance.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(au.provenance.stale).toBe(false);
    const old = adaptRows(rows, { asOf: '2027-12-31' });
    expect(old.active.every((a) => a.provenance.stale)).toBe(true);
  });
});

describe('필요한 돈 규칙 (D-085)', () => {
  const need = (r: ReturnType<typeof adaptRows>, code: string) => r.active.find((a) => a.code === code)!.engine.needMan;
  const progId = (code: string) => rows.programs.find((p) => p.destination === code && p.origin === 'KR')!.id;

  it('영국은 보건부담금을 포함한다', () => {
    const without = adaptRows({ ...rows, facts: rows.facts.filter((f) => f.key !== 'health_surcharge') }, { asOf: '2026-11-11' });
    expect(need(result, 'GB')! - need(without, 'GB')!).toBeGreaterThan(280);
  });

  it('항공권 증빙 시 감액된 잔고 증명이 있으면 그 값을 쓴다(독일·덴마크)', () => {
    const without = adaptRows({ ...rows, facts: rows.facts.filter((f) => f.key !== 'proof_amount_with_ticket') }, { asOf: '2026-11-11' });
    expect(need(without, 'DE')! - need(result, 'DE')!).toBe(150); // €1,000
    expect(need(without, 'DK')! - need(result, 'DK')!).toBe(100); // DKK 5,000
  });

  it('잔고 증명이 숫자 없이 메모뿐인 나라는 0이 아니라 null(확인 중)', () => {
    const unknown = result.active.filter((a) => a.engine.needMan === null).map((a) => a.code).sort();
    expect(unknown).toEqual(['AT', 'ES', 'IE', 'IL', 'NL', 'PL', 'PT']);
  });

  it('잔고 증명이 0으로 입력된(필요 없음으로 확인된) 나라만 0으로 계산한다', () => {
    const zero = [...rows.facts, { program_id: progId('PL'), key: 'proof_amount', value_num: 0, value_text: null, currency: 'KRW', source_id: null, verified_at: '2026-11-11' }];
    const r = adaptRows({ ...rows, facts: zero }, { asOf: '2026-11-11' });
    expect(need(r, 'PL')).not.toBeNull(); // 비자 비용 + 항공권만
    expect(need(r, 'PL')).toBeLessThan(250);
  });

  it('돈이 확인 중이어도 나머지 조건으로 점수를 낸다(어학원 확인 중과 같은 처리)', () => {
    const p = PERSONAS[1]!.profile;
    const row = scoreAll(result.active.map((a) => a.engine), p, result.config).ranked.find((x) => x.code === 'PL')!;
    expect(row.items.some((i) => i.kind === 'core' && i.id === 'money')).toBe(false);
    expect(row.pct).toBeGreaterThan(0);
  });
});

describe('adapter 데이터로 돌린 가상 사용자 6명 = Python 나라 표로 돌린 결과', () => {
  const adapted = result.active.map((a) => a.engine);
  for (const persona of PERSONAS) {
    it(persona.name, () => {
      const a = scoreAll(adapted, persona.profile, result.config).ranked;
      const f = scoreAll(COUNTRIES, persona.profile, DEFAULT_CONFIG).ranked;
      const key = (r: (typeof a)[number]) => JSON.stringify([r.code, r.pct, r.okCount, r.itemCount, r.badges, r.items]);
      // 나라별 결과는 완전히 같다
      expect(new Map(a.map((r) => [r.code, key(r)]))).toEqual(new Map(f.map((r) => [r.code, key(r)])));
      // 순서는 % · ✓ 수 · 필수 점수가 모두 같은 나라끼리만 다를 수 있다(입력 순서 차이)
      const tier = (r: (typeof a)[number]) => `${r.pct}/${r.okCount}/${r.essential}`;
      expect(a.map(tier)).toEqual(f.map(tier));
    });
  }
});
