import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { CompareView } from '@/components/compare/CompareView';
import { buildCompare, compareOptions, ROW_IDS } from '@/lib/compare/build';
import { buildFit } from '@/lib/compare/fit';
import { compareHref, parseCodes } from '@/lib/compare/parse';
import { addCompare, loadCompare, removeCompare, sanitizeCodes } from '@/lib/compare/store';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import { latestRates } from '@/lib/result/preview';
import copy from '@/content/copy_ko.json';
import snapshot from './fixtures/db_rows_v1.json';
import { PERSONA_ANSWERS } from './fixtures/persona_answers';

const rows = snapshot as unknown as DbRows;
const TODAY = '2026-11-11';
const options = compareOptions(rows, TODAY);
const valid = new Set(options.map((o) => o.code));
const data = adaptRows(rows, { asOf: TODAY });
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const view = (codes: string[], extra: Partial<Parameters<typeof CompareView>[0]> = {}) =>
  renderToStaticMarkup(
    <CompareView base="/compare" countries={buildCompare(rows, codes, TODAY)} options={options} back={{ href: '/countries', labelKey: 'compare.back.countries' }} fxDate={latestRates(rows, TODAY).fxDate} {...extra} />,
  );

describe('주소 ?c= 읽기 (SPEC 6장)', () => {
  it('없는 코드·중복은 조용히 빼고, 소문자·공백도 받는다', () => {
    expect(parseCodes('JP,ZZ,jp, ca ,JP,XX', valid)).toEqual(['JP', 'CA']);
  });
  it('4개 이상이면 앞의 3개만', () => expect(parseCodes('JP,CA,GB,AU', valid)).toEqual(['JP', 'CA', 'GB']));
  it('비었거나 이상한 값이면 빈 목록', () => {
    for (const v of [undefined, '', ',,', 'zzz', '<script>', 'KR']) expect(parseCodes(v, valid)).toEqual([]);
  });
  it('협정 미발효(핀란드)·한국은 고를 수 없는 나라', () => {
    expect(valid.has('FI')).toBe(false);
    expect(valid.has('KR')).toBe(false);
    expect(valid.size).toBe(28);
  });
  it('주소 만들기', () => {
    expect(compareHref('/compare', ['JP', 'CA'])).toBe('/compare?c=JP,CA');
    expect(compareHref('/compare', [])).toBe('/compare');
  });
});

describe('표 값 (DB 값 그대로, 없으면 "확인 중")', () => {
  const [jp, ca, gb] = buildCompare(rows, ['JP', 'CA', 'GB'], TODAY);
  it('줄은 SPEC 6장 목록 12개', () => {
    expect(ROW_IDS).toEqual(['age', 'stay', 'selection', 'money', 'wage', 'rent', 'work', 'study', 'next', 'korean', 'distance', 'source']);
    expect(Object.keys(jp!.cells)).toHaveLength(12);
  });
  it('나이는 프로그램의 나이 범위, 필요한 돈은 엔진(adapter)이 계산한 값과 같다', () => {
    const p = rows.programs.find((x) => x.destination === 'JP')!;
    expect(jp!.cells.age.text).toBe(`만 ${p.age_min}~${p.age_max}세`);
    for (const c of [jp!, ca!, gb!]) {
      const need = data.active.find((a) => a.code === c.code)!.engine.needMan!;
      expect(c.cells.money.text).toBe(`약 ${need.toLocaleString('ko-KR')}만 원`);
    }
  });
  it('캐나다: 두 번까지 참가 가능, 선발 방식 추첨', () => {
    expect(ca!.cells.stay.extra.join(' ')).toContain('두 번까지');
    expect(ca!.cells.selection.text).toBe('추첨');
  });
  it('거리·한국인·출처 확인일 줄에도 값이 있다', () => {
    expect(jp!.cells.distance.text).toBe('한국과 가까워요.');
    expect(gb!.cells.distance.text).toBe('비행기로 오래 가야 해요.');
    for (const c of [jp!, ca!, gb!]) { expect(c.cells.korean.checking).toBe(false); expect(c.cells.source.text).toMatch(/\d{4}년/); }
  });
  it('값이 없으면 "확인 중": 잔고 증명·한국인 수·확인일이 없는 경우', () => {
    const auId = rows.programs.find((x) => x.destination === 'AU')!.id;
    const broken: DbRows = {
      ...rows,
      facts: rows.facts.filter((f) => !(f.program_id === auId && f.key.startsWith('proof_amount'))),
      stats: rows.stats.filter((s) => !(s.country === 'JP' && s.metric === 'korean_population')),
    };
    const [a, j] = buildCompare(broken, ['AU', 'JP'], TODAY);
    expect(a!.cells.money).toMatchObject({ text: '확인 중', checking: true });
    expect(j!.cells.korean).toMatchObject({ text: '확인 중', checking: true });
  });
  it('값이 없는 나라가 섞여도 나머지는 그대로(없는 환율은 원화 환산만 빠진다)', () => {
    const noRate: DbRows = { ...rows, rates: rows.rates.filter((r) => r.currency !== 'CAD') };
    const [c] = buildCompare(noRate, ['CA'], TODAY);
    expect(c!.cells.wage.text).toContain('CAD');
    expect(c!.cells.wage.extra.join(' ')).not.toContain('약');
  });
  it('협정이 안 열린 나라·없는 나라는 표에서 빠진다', () => {
    expect(buildCompare(rows, ['FI', 'ZZ', 'JP'], TODAY).map((c) => c.code)).toEqual(['JP']);
  });
});

describe('화면 (/compare)', () => {
  it('2개: 표 + 12줄 이름 + 빼기 링크(주소가 바뀜) + 나라 추가', () => {
    const html = view(['JP', 'CA']);
    const s = text(html);
    expect(html).toContain('<table');
    for (const id of ROW_IDS) expect(s).toContain((copy as Record<string, string>)[`compare.row.${id}`]);
    expect(html).toContain('href="/compare?c=CA"'); // 일본 빼기
    expect(html).toContain('href="/compare?c=JP"'); // 캐나다 빼기
    expect(s).toContain('+ 나라 추가');
    expect(s).not.toContain('적합도'); // 테스트 없이: %·✓△✗ 줄은 숨긴다
    expect(s).not.toContain('내 답으로 본 조건');
  });
  it('3개: 세 열, 출처 확인일 줄, 3개가 차면 더 추가 못 한다', () => {
    const html = view(['JP', 'CA', 'GB']);
    expect(html.match(/scope="col"/g)).toHaveLength(4); // 항목 이름 열 + 나라 3
    expect(text(html)).toContain('3개까지 비교할 수 있어요');
    expect(html).toMatch(/<button type="button" disabled="" aria-expanded="false" aria-controls="compare-add-panel"/);
  });
  it('모바일: 첫 열(항목 이름)은 고정(sticky), 표만 가로 스크롤(안의 보이지 않는 글자가 페이지를 넓히지 않게 relative)', () => {
    const html = view(['JP', 'CA']);
    expect(html).toContain('overflow-x-auto'); // ScrollFrame 안쪽 상자(바깥이 relative)
    expect(html).toMatch(/<th scope="row" class="sticky left-0/);
    expect(html).toContain('<colgroup>'); // 열 폭을 정해 긴 글이 한 줄로 늘어나지 않게
  });
  it('2개보다 적으면 표 대신 나라 고르는 칸', () => {
    for (const codes of [[], ['JP']]) {
      const html = view(codes);
      expect(html).not.toContain('<table');
      expect(text(html)).toContain('비교할 나라를 2개 이상 골라 주세요');
      expect(html).toContain('id="compare-add-panel"'); // 처음부터 펼쳐 둔다
    }
    expect(view(['JP'])).toContain('href="/compare"'); // 1개 남았을 때 빼면 주소에서 c가 사라진다
  });
  it('숫자는 한국어 단위·확인일을 보여 준다(공식 정보 줄)', () => {
    const s = text(view(['JP', 'CA']));
    expect(s).toContain('환율');
    expect(s).toContain('정보가 틀렸나요?');
  });
});

describe('화면 (/r/[id]/compare): 내 결과의 %와 ✓△✗', () => {
  const answers = { ...PERSONA_ANSWERS[0]!.answers, q1: { none: false, codes: ['CA', 'GB', 'JP'] } };
  const ctx = { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! };
  const checked = validateAnswers(answers, ctx);
  if (!checked.ok) throw new Error(checked.reason);
  const result = computeResult(checked.answers, data, TODAY, rows);
  const fit = buildFit(result, checked.answers, ['CA', 'GB', 'JP']);
  const html = view(['CA', 'GB', 'JP'], { fit, base: '/r/x/compare' });
  const s = text(html);

  it('%는 저장된 결과와 같다(다시 계산하지 않음)', () => {
    for (const code of ['CA', 'GB']) {
      const r = result.ranked.find((x) => x.code === code)!;
      expect(s).toContain(`적합도 ${r.pct}%`);
    }
  });
  it('마음에 둔 나라 이름표와 "적합도 최고" 이름표', () => {
    expect(s).toContain('마음에 둔 나라');
    expect(s.match(/적합도 최고/g)).toHaveLength(1);
    expect((fit.byCode.CA as { best: boolean }).best).toBe(true);
  });
  it('갈 수 없는 나라는 %가 아니라 이유를 보여 준다(Yvonne 33세는 일본 나이 초과)', () => {
    expect(fit.byCode.JP).toMatchObject({ blocked: expect.stringContaining('나이') });
  });
  it('조건 줄은 모양(✓△✗ 글자)으로도 구분되고, 줄 이름은 돈·언어·일…', () => {
    expect(html).toMatch(/sr-only">[✓△✗] /);
    expect(s).toContain('내 답으로 본 조건');
    expect(fit.rows.map((r) => r.label).slice(0, 3)).toEqual(['돈', '언어', '일']);
  });
  it('나라 빼기 주소는 결과 비교 주소를 유지한다', () => {
    expect(html).toContain('href="/r/x/compare?c=GB,JP"');
  });
  it('결과에 없는 코드(이 결과가 모르는 나라)는 "이 결과에 없는 나라예요"', () => {
    const fit2 = buildFit({ ...result, ranked: result.ranked.filter((r) => r.code !== 'GB'), blocked: result.blocked.filter((b) => b.code !== 'GB') }, checked.answers, ['CA', 'GB']);
    expect(fit2.byCode.GB).toBeNull();
    expect(text(view(['CA', 'GB'], { fit: fit2 }))).toContain('이 결과에 없는 나라예요');
  });
});

describe('비교에 담기 저장소 (woholog.compare.v1, 저장소가 막혀도 동작)', () => {
  afterEach(() => { for (const c of loadCompare()) removeCompare(c); });
  it('3개까지 담고 4번째는 담지 않는다', () => {
    expect([addCompare('JP'), addCompare('CA'), addCompare('GB'), addCompare('AU')]).toEqual(['added', 'added', 'added', 'full']);
    expect(loadCompare()).toEqual(['JP', 'CA', 'GB']);
  });
  it('이미 담은 나라는 그대로, 빼면 다시 담을 수 있다', () => {
    addCompare('JP');
    expect(addCompare('JP')).toBe('exists');
    removeCompare('JP');
    expect(loadCompare()).toEqual([]);
  });
  it('저장된 값이 깨져 있으면 버린다', () => {
    expect(sanitizeCodes('x')).toEqual([]);
    expect(sanitizeCodes([1, 2])).toEqual([]);
    expect(sanitizeCodes(['jp'])).toEqual([]);
    expect(sanitizeCodes(['JP', 'JP', 'CA', 'GB', 'AU'])).toEqual(['JP', 'CA', 'GB']);
  });
});

describe('결과 화면의 비교 버튼', () => {
  it('실제 /r/[id]/compare 주소로 이어진다', async () => {
    const { CompareButton } = await import('@/components/result/ResultActions');
    const html = renderToStaticMarkup(<CompareButton id="abc" plan={{ compare: { codes: ['JP', 'CA'], labelKey: 'compare.cta' } } as never} />);
    expect(html).toContain('href="/r/abc/compare?c=JP,CA"');
    expect(text(html)).toContain('1위 나라와 나란히 비교');
  });
});
