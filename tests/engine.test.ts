import { describe, expect, it } from 'vitest';
import {
  buildReasons, candidateLanguages, DEFAULT_CONFIG, maxAgeOf, resolveConfig, roundHalfEven, scoreAll,
  splitCandidates, visiblePriorities, whatIf,
} from '@/lib/engine';
import type { Badge, Profile } from '@/lib/engine';
import { CODE_BY_NAME, COUNTRIES } from './fixtures/countries_v1';
import { ITEM_KO, PERSONAS } from './fixtures/personas';

const BADGE_KO: Record<Badge, string> = { hard_to_live: '일하며 지내기 어려움', lottery: '추첨' };
const MARK_BY_NAME = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.nameKo]));

describe('엔진 회귀: 가상 사용자 6명 × 모든 나라 (Python 원본 = 정답)', () => {
  it('가상 사용자는 6명, 나라는 28개', () => {
    expect(PERSONAS).toHaveLength(6);
    expect(COUNTRIES).toHaveLength(28);
  });

  for (const persona of PERSONAS) {
    describe(persona.name, () => {
      const { ranked } = scoreAll(COUNTRIES, persona.profile, DEFAULT_CONFIG);

      it('후보 나라 수와 순서가 같다', () => {
        expect(ranked.map((r) => MARK_BY_NAME[r.code])).toEqual(persona.expected.map((e) => e.country));
      });

      it('%·✓ 수·조건 수·뱃지가 같다', () => {
        const actual = ranked.map((r) => ({
          country: MARK_BY_NAME[r.code], pct: r.pct, ok_count: r.okCount, item_count: r.itemCount,
          flag: r.badges.map((b) => BADGE_KO[b]).join(' '),
        }));
        const expected = persona.expected.map(({ country, pct, ok_count, item_count, flag }) => ({
          country, pct, ok_count, item_count, flag,
        }));
        expect(actual).toEqual(expected);
      });

      it('조건별 가중치와 ✓△✗가 같다', () => {
        const actual = ranked.map((r) => ({
          country: MARK_BY_NAME[r.code],
          items: r.items.map((i) => ({ item: ITEM_KO[i.id], weight: i.weight, mark: i.mark })),
        }));
        const expected = persona.expected.map((e) => ({ country: e.country, items: e.items }));
        expect(actual).toEqual(expected);
      });
    });
  }
});

describe('Python과 같은 반올림', () => {
  it('정확히 .5면 짝수 쪽으로 (Python round)', () => {
    expect([0.5, 1.5, 2.5, 62.5, 63.5, 61.4, 61.6].map(roundHalfEven)).toEqual([0, 2, 2, 62, 64, 61, 62]);
  });
});

describe('설정값', () => {
  it('DB에서 일부 key만 와도 나머지는 기본값', () => {
    const cfg = resolveConfig({ work_fail_cap_pct: 50, weights: { ...DEFAULT_CONFIG.weights, money: 5 } });
    expect(cfg.work_fail_cap_pct).toBe(50);
    expect(cfg.weights.money).toBe(5);
    expect(cfg.weights.work.must).toBe(3);
    expect(cfg.low_result_pct).toBe(60);
  });

  it('설정을 바꾸면 결과가 따라 바뀐다(코드에 숫자가 박혀 있지 않다)', () => {
    const p = PERSONAS[1]!.profile;
    const base = scoreAll(COUNTRIES, p, DEFAULT_CONFIG).ranked;
    const capped = scoreAll(COUNTRIES, p, resolveConfig({ work_fail_cap_pct: 10 })).ranked;
    expect(capped.some((r) => r.badges.includes('hard_to_live') && r.pct === 10)).toBe(
      base.some((r) => r.badges.includes('hard_to_live')),
    );
  });
});

describe('후보 나라 (SPEC 3.2)', () => {
  const base: Profile = { ...PERSONAS[0]!.profile, visited: [], companion: undefined };

  it('나이가 넘으면 빼고 이유를 돌려준다', () => {
    const { candidates, blocked } = splitCandidates(COUNTRIES, { ...base, age: 35 });
    expect(candidates.some((c) => c.maxAge < 35)).toBe(false);
    expect(blocked.find((b) => b.code === CODE_BY_NAME['일본'])?.reason).toEqual({ kind: 'age', maxAge: 30 });
  });

  it('이미 다녀온 나라는 빼지만 두 번 갈 수 있는 나라는 남긴다', () => {
    const { candidates, blocked } = splitCandidates(COUNTRIES, { ...base, visited: ['AU', 'CA'] });
    expect(blocked.map((b) => b.code)).toContain('AU');
    expect(candidates.map((c) => c.code)).toContain('CA');
  });

  it('동행자의 나이·다녀온 나라도 같은 규칙', () => {
    const { blocked } = splitCandidates(COUNTRIES, {
      ...base, age: 25, companion: { age: 33, visited: ['DE', 'JP'] },
    });
    expect(blocked.find((b) => b.code === 'JP')?.reason.kind).toBe('companion_age');
    expect(blocked.find((b) => b.code === 'DE')?.reason.kind).toBe('companion_visited');
  });

  it('최대 나이는 나라 값에서 구한다(코드에 35를 쓰지 않는다)', () => {
    expect(maxAgeOf(COUNTRIES)).toBe(Math.max(...COUNTRIES.map((c) => c.maxAge)));
    expect(maxAgeOf([])).toBeNull();
  });

  it('Q8 언어 칩은 후보 나라의 일자리 언어만, 중복 없이', () => {
    const { candidates } = splitCandidates(COUNTRIES, { ...base, age: 34 });
    const langs = candidateLanguages(candidates);
    expect(new Set(langs).size).toBe(langs.length);
    expect(langs).not.toContain('영어');
    expect(langs).not.toContain('일본어'); // 일본은 30세까지
    expect(candidateLanguages([])).toEqual([]); // 보여 줄 언어가 없으면 Q8 건너뜀
  });

  it('Q12 칩: 후보가 모두 같은 표시면 숨긴다', () => {
    const only = COUNTRIES.filter((c) => c.code === 'DE' || c.code === 'FR'); // 둘 다 유럽·비영어권
    const shown = visiblePriorities(only, base, DEFAULT_CONFIG);
    expect(shown).not.toContain('europe');
    expect(shown).not.toContain('english');
    expect(visiblePriorities(COUNTRIES, base, DEFAULT_CONFIG)).toContain('europe');
  });
});

describe('조건 줄 문구 키 (reasons)', () => {
  const profile: Profile = { ...PERSONAS[0]!.profile, visited: [] }; // Yvonne, 다녀온 나라 없이(모든 나라가 후보)
  const { ranked } = scoreAll(COUNTRIES, profile, DEFAULT_CONFIG);
  const lines = (code: string) => {
    const row = ranked.find((r) => r.code === code)!;
    return buildReasons(row, COUNTRIES.find((c) => c.code === code)!, profile, DEFAULT_CONFIG);
  };

  it('줄 수는 점수에 쓴 조건 수와 같고 ✗ → △ → ✓ 순서', () => {
    const uk = lines('GB');
    expect(uk).toHaveLength(ranked.find((r) => r.code === 'GB')!.itemCount);
    const order = uk.map((l) => ({ no: 0, partial: 1, ok: 2 })[l.mark]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('돈 ✗는 모자란 금액을 같이 준다', () => {
    const money = lines('GB').find((l) => l.itemId === 'money' && l.kind === 'core')!;
    expect(money.key).toBe('reason.money.no');
    expect(money.params).toMatchObject({ budget: 500, need: 968, gap: 468 });
  });

  it('언어 ✓: 영어권이면 english, 현지어를 하면 local', () => {
    expect(lines('CA').find((l) => l.itemId === 'language')!.key).toBe('reason.language.ok.english');
    expect(lines('DE').find((l) => l.itemId === 'language')!.key).toBe('reason.language.ok.local');
  });

  it('일 △: 정규직 불가 + 사무직 희망이면 noFulltime이 먼저', () => {
    const work = lines('IE').find((l) => l.itemId === 'work')!; // 아일랜드: 정규직 불가 + 구직 어려움 안내, Yvonne은 사무직 희망
    expect(work.key).toBe('reason.work.partial.noFulltime');
  });

  it('일 △: 사무직 희망이 아니면 구직 어려움 안내(hardNote)', () => {
    const p: Profile = { ...profile, jobs: ['cafe'] };
    const row = scoreAll(COUNTRIES, p, DEFAULT_CONFIG).ranked.find((x) => x.code === 'IE')!;
    const work = buildReasons(row, COUNTRIES.find((c) => c.code === 'IE')!, p, DEFAULT_CONFIG).find((l) => l.itemId === 'work')!;
    expect(work.key).toBe('reason.work.partial.hardNote');
  });

  it('호주 + 농장 안 고름: 2년 칩은 farm 경우', () => {
    const p: Profile = { ...profile, visited: [], priorities: ['two_years'] };
    const row = scoreAll(COUNTRIES, p, DEFAULT_CONFIG).ranked.find((r) => r.code === 'AU')!;
    const line = buildReasons(row, COUNTRIES[0]!, p, DEFAULT_CONFIG).find((l) => l.itemId === 'two_years')!;
    expect(line.key).toBe('reason.priority.two_years.partial.farm');
  });
});

describe('이렇게 바꾸면 (whatIf)', () => {
  const cfg = DEFAULT_CONFIG;
  const persona = PERSONAS[1]!.profile; // B: 영어 주문 정도, 일본 고민

  it('카드 나라가 60% 이상이면 제안하지 않는다', () => {
    const top = scoreAll(COUNTRIES, persona, cfg).ranked[0]!;
    expect(top.pct).toBeGreaterThanOrEqual(cfg.low_result_pct);
    expect(whatIf(COUNTRIES, persona, cfg, top.code)).toEqual([]);
  });

  it('제안은 %가 실제로 오르는 것만, 오름폭 큰 순, 최대 개수 이하', () => {
    const rows = scoreAll(COUNTRIES, persona, cfg).ranked.filter((r) => r.pct < cfg.low_result_pct);
    const low = rows[0]!;
    const result = whatIf(COUNTRIES, persona, cfg, low.code);
    expect(result.length).toBeLessThanOrEqual(cfg.what_if_max_rows);
    for (const r of result) expect(r.to).toBeGreaterThan(r.from);
    expect(result.map((r) => r.to)).toEqual([...result.map((r) => r.to)].sort((a, b) => b - a));
  });

  it('이미 만족하는 조건은 제안에 나오지 않는다', () => {
    const lowCode = scoreAll(COUNTRIES, persona, cfg).ranked.filter((r) => r.pct < cfg.low_result_pct)[0]!.code;
    const target = COUNTRIES.find((c) => c.code === lowCode)!;
    const changes = (p: Profile) => whatIf(COUNTRIES, p, cfg, lowCode).map((r) => r.change);
    // 영어 면접 가능, 현지어 가능, 돈 충분, 생활비 안 벌어도 됨 → 모두 이미 만족
    const satisfied: Profile = {
      ...persona, english: 2, languages: target.languages, budgetMan: target.needMan ?? 0, earn: 'partly',
    };
    const result = changes(satisfied);
    expect(result).not.toContain('english_interview');
    expect(result).not.toContain('learn_local_language');
    expect(result).not.toContain('save_gap');
    expect(result).not.toContain('earn_partly');
    // 하나씩 따로 봐도 같다
    expect(changes({ ...persona, english: 3 })).not.toContain('english_interview');
    expect(changes({ ...persona, languages: target.languages })).not.toContain('learn_local_language');
    expect(changes({ ...persona, budgetMan: target.needMan ?? 0 })).not.toContain('save_gap');
    expect(changes({ ...persona, earn: 'none' })).not.toContain('earn_partly');
  });

  it('없는 나라·갈 수 없는 나라는 빈 배열', () => {
    expect(whatIf(COUNTRIES, persona, cfg, 'XX')).toEqual([]);
    expect(whatIf(COUNTRIES, { ...persona, age: 34 }, cfg, 'JP')).toEqual([]); // 일본은 30세까지
  });
});

describe('엔진은 순수하다 (DB·화면·fetch를 모른다)', () => {
  it('lib/engine 파일은 외부 모듈을 가져오지 않는다', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const dir = new URL('../lib/engine/', import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      const text = readFileSync(new URL(file, dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); // 주석 제외
      expect(text, file).not.toMatch(/from '(?!\.\/)[^']*'/); // 같은 폴더(./) 말고는 import 없음
      expect(text, file).not.toMatch(/\b(fetch|supabase|window|document|localStorage|process\.env)\b/);
      expect(readFileSync(new URL(file, dir), 'utf8').split('\n').length, `${file} 300줄 이하`).toBeLessThanOrEqual(300);
    }
  });
});
