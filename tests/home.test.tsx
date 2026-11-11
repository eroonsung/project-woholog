import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HomeView, type BrowseCountry } from '@/components/home/HomeView';
import example from '@/content/landing_example.json';
import landing from '@/content/landing_countries.json';
import { adaptRows, type DbRows } from '@/lib/engine';
import { buildExample } from '@/lib/result/example';
import snapshot from './fixtures/db_rows_v1.json';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';
import { PERSONAS } from './fixtures/personas';

const rows = snapshot as unknown as DbRows;
const TODAY = '2026-11-11';
const built = buildExample(rows, TODAY);
const active = adaptRows(rows, { asOf: TODAY }).active;
const countries: BrowseCountry[] = landing.codes.map((code) => {
  const a = active.find((x) => x.code === code)!;
  return { code, nameKo: a.nameKo, selection: a.engine.selection };
});
const html = renderToStaticMarkup(<HomeView example={built} countries={countries} />);
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('첫 화면 예시 카드 (SPEC 2장)', () => {
  it('예시 답은 가상 사용자 A(Yvonne)의 답과 같다', () => {
    expect(example.answers).toEqual(PERSONA_ANSWERS[0]!.answers);
  });

  it('숫자는 엔진이 계산한 실제 값: Python 기대값(가상 사용자 A)의 1위와 같다', () => {
    const top = PERSONAS[0]!.expected[0]!;
    expect(built.plan.card.pct).toBe(top.pct);
    expect(built.plan.card.okCount).toBe(top.ok_count);
    expect(built.plan.card.itemCount).toBe(top.item_count);
    expect(built.result.countries[built.plan.card.code]!.nameKo).toBe(top.country);
  });

  it('DB 값이 바뀌면 예시 카드 숫자도 바뀐다(지어낸 값이 아님)', () => {
    const noFlight = { ...rows, flights: rows.flights.map((f) => ({ ...f, krw: 50_000_000 })) }; // 항공권이 아주 비싸지면 돈 조건이 달라진다
    const changed = buildExample(noFlight, TODAY);
    expect(changed.plan.card.pct === built.plan.card.pct && changed.plan.card.okCount === built.plan.card.okCount).toBe(false);
  });

  it('카드에 "예시" 표시, 조건 줄은 3개까지, 상세 링크·이렇게 바꾸면는 없다', () => {
    expect(html).toContain('예시');
    expect(text).toContain('실제 계산 결과 예시예요');
    const card = html.slice(html.indexOf('id="result-headline"') - 400);
    expect(card.match(/data-condition|bg-subtle px-4 py-3/g)?.length ?? 0).toBeLessThanOrEqual(3 + 0);
    expect(text).not.toContain('이렇게 바꾸면');
    expect(text).not.toContain('상세 정보 보기');
  });
});

describe('첫 화면 구성 (SPEC 2장)', () => {
  it('주요 버튼 "내 나라 확인하기" → /test, 보조 "29개국 비교표 보기" → /countries', () => {
    expect(html).toMatch(/<a[^>]*href="\/test"[^>]*>[^<]*(<[^>]+>)*[^<]*내 나라 확인하기/);
    expect(html).toMatch(/href="\/countries"[^>]*>29개국 비교표 보기/);
    expect(text).toContain('로그인 없이 바로 시작해요');
  });

  it('"나라 둘러보기": 고정 목록(content 파일)의 나라만, 숫자·순위 없이, 카드 → 나라 상세', () => {
    expect(text).toContain('나라 둘러보기');
    for (const c of countries) expect(html).toContain(`href="/countries/${c.code}"`);
    expect(countries.map((c) => c.code)).toEqual(landing.codes);
    expect(countries.map((c) => c.nameKo)).toEqual(['호주', '영국', '일본', '캐나다']);
  });

  it('근거 없는 숫자·문장은 없다: 참여자 수, 후기, 실시간 집계, 만족도, 통계', () => {
    for (const bad of ['명 참여', '참여 완료', '실시간', '후기', '만족도', '4.9', '100% 무료', '매주 검수', '막연했던']) expect(text, bad).not.toContain(bad);
  });

  it('"이어서 하기"는 서버에서 그릴 때는 보이지 않는다(브라우저에 진행 중인 답이 있을 때만 나온다)', () => {
    expect(text).not.toContain('이어서 하기');
  });

  it('h1은 하나(첫 화면 제목), 예시 카드 제목은 h2', () => {
    expect(html.match(/<h1/g)?.length).toBe(1);
    expect(html).toContain('<h1 class="mt-4 text-display text-navy">마음에 둔 워홀 나라, 나한테 맞을까?</h1>');
  });
});
