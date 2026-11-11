import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountriesView } from '@/components/countries/CountriesView';
import { DetailView } from '@/components/countries/DetailView';
import type { Partner } from '@/components/countries/DetailExtras';
import { buildDetail } from '@/lib/countries/detail';
import { applyQuery, buildList, DEFAULT_QUERY, listHref, parseListQuery, type ListQuery } from '@/lib/countries/list';
import { adaptRows, type DbRows } from '@/lib/engine';
import partnersJson from '@/content/partners.json';
import snapshot from './fixtures/db_rows_v1.json';

const rows = snapshot as unknown as DbRows;
const TODAY = '2026-11-11';
const data = adaptRows(rows, { asOf: TODAY });
const list = buildList(rows, TODAY);
const q = (patch: Partial<ListQuery> = {}): ListQuery => ({ ...DEFAULT_QUERY, ...patch });
const names = (rs: { nameKo: string }[]) => rs.map((r) => r.nameKo);
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const NO_EXTRAS: Parameters<typeof buildDetail>[1] = { apps: [], sourceLinks: [] };
const codes = rows.programs.filter((p) => p.kind === 'working_holiday').map((p) => p.destination);

describe('주소 ?sort=&region=&english=&age= (SPEC 7장)', () => {
  it('읽고 다시 쓰면 같은 주소, 기본값은 주소에서 뺀다', () => {
    const query = parseListQuery({ sort: 'money', region: 'europe', age: '31', english: '1' });
    expect(query).toEqual({ sort: 'money', region: 'europe', age: 31, english: true });
    expect(listHref(query)).toBe('/countries?sort=money&region=europe&english=1&age=31');
    expect(listHref(DEFAULT_QUERY)).toBe('/countries');
  });
  it('이상한 값은 조용히 무시한다', () => {
    expect(parseListQuery({ sort: 'x', region: 'mars', age: '-3', english: 'yes' })).toEqual(DEFAULT_QUERY);
    expect(parseListQuery({ age: '31.5' })).toEqual(DEFAULT_QUERY);
    expect(parseListQuery({ age: '<b>' })).toEqual(DEFAULT_QUERY);
    expect(parseListQuery({ sort: ['age', 'money'] }).sort).toBe('age');
  });
});

describe('비교표 줄·정렬·필터', () => {
  it('협정국 29개를 모두 보여 준다(발효 28 + 핀란드), 기본은 이름(가나다)순', () => {
    expect(list).toHaveLength(29);
    const all = applyQuery(list, DEFAULT_QUERY);
    expect(names(all.slice(0, 3))).toEqual(['네덜란드', '뉴질랜드', '대만']);
  });
  it('핀란드는 곧 열려요: 어떤 정렬이든 맨 아래', () => {
    const fi = list.find((r) => r.code === 'FI')!;
    expect(fi.comingSoon).toBe(true);
    for (const sort of ['name', 'age', 'money', 'selection'] as const) expect(applyQuery(list, q({ sort })).at(-1)!.code).toBe('FI');
  });
  it('필요한 돈 적은 순: 오름차순, 값이 없는 나라는 그 다음 맨 아래(핀란드 앞)', () => {
    const r = applyQuery(list, q({ sort: 'money' }));
    const active = r.filter((x) => !x.comingSoon);
    const known = active.filter((x) => x.needMan !== null).map((x) => x.needMan!);
    expect(known).toEqual([...known].sort((a, b) => a - b));
    const firstNull = active.findIndex((x) => x.needMan === null);
    expect(active.slice(firstNull).every((x) => x.needMan === null)).toBe(true);
    expect(firstNull).toBeGreaterThan(0);
  });
  it('나이 제한 넉넉한 순 = 지원 최대 나이 큰 순, 선발 방식 = 무제한 → 선착순 → 추첨', () => {
    const age = applyQuery(list, q({ sort: 'age' })).filter((x) => !x.comingSoon).map((x) => x.ageMax);
    expect(age).toEqual([...age].sort((a, b) => b - a));
    const sel = applyQuery(list, q({ sort: 'selection' })).filter((x) => !x.comingSoon);
    const rank = { unlimited: 0, first_come: 1, lottery: 2 } as const;
    const ranks = sel.map((x) => rank[x.selection!]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(ranks).size).toBe(3);
  });
  it('필터: 지역·영어권·내 나이, 함께 쓰면 모두 만족하는 나라만', () => {
    expect(names(applyQuery(list, q({ region: 'america' })).filter((x) => !x.comingSoon)).sort()).toEqual(['브라질', '아르헨티나', '칠레', '캐나다']);
    const en = applyQuery(list, q({ english: true }));
    expect(en.every((x) => x.english === 'Y')).toBe(true);
    expect(en.some((x) => x.code === 'HK')).toBe(false);
    const age31 = applyQuery(list, q({ age: 31 }));
    expect(age31.every((x) => x.ageMin <= 31 && 31 <= x.ageMax)).toBe(true);
    expect(age31.some((x) => x.code === 'JP')).toBe(false); // 일본은 30세까지
    expect(age31.some((x) => x.code === 'AU')).toBe(true);
    expect(names(applyQuery(list, q({ region: 'oceania', english: true, age: 31 })))).toEqual(['호주']);
    expect(applyQuery(list, q({ region: 'asia', english: true })).length).toBe(0);
  });
  it('결과가 없으면 빈 목록 → 안내와 필터 초기화', () => {
    const none = applyQuery(list, q({ age: 99 }));
    expect(none).toHaveLength(0);
    const s = text(renderToStaticMarkup(<CountriesView rows={none} total={29} q={q({ age: 99 })} verifiedAt="2026-11-05" />));
    expect(s).toContain('조건에 맞는 나라가 없어요');
    expect(s).toContain('필터 초기화');
  });
});

describe('비교표 화면', () => {
  const html = renderToStaticMarkup(<CountriesView rows={applyQuery(list, DEFAULT_QUERY)} total={29} q={DEFAULT_QUERY} verifiedAt="2026-11-05" />);
  it('29개 줄(표 29 + 모바일 카드 29), 줄마다 "비교에 담기"(핀란드 제외), 나라 이름은 상세 링크', () => {
    expect(html.match(/<tr class=/g)).toHaveLength(30); // 29줄 + 머리 줄
    expect(html.match(/aria-pressed="false" aria-label="/g)!.length).toBe(28 * 2); // 웹 표 + 모바일 카드
    expect(html).toContain('href="/countries/JP"');
    expect(html).toContain('href="/countries/FI"');
  });
  it('핀란드: 흐리게 + "곧 열려요", 개수 안내 "총 29개국 중 28개국"', () => {
    expect(html).toContain('bg-subtle');
    expect(text(html)).toContain('곧 열려요');
    expect(text(html)).toContain('총 29개국 중 28개국');
  });
  it('필터·정렬은 링크라서 주소가 바뀐다', () => {
    expect(html).toContain('href="/countries?region=europe"');
    expect(html).toContain('href="/countries?sort=money"');
    expect(html).toContain('href="/countries?english=1"');
    expect(html).toContain('name="age"');
  });
  it('값이 없으면 "확인 중"(필요한 돈이 없는 나라)', () => {
    expect(text(html)).toContain('확인 중');
  });
});

describe('나라 상세 값 (DB와 같다)', () => {
  it('협정국 29개 모두 만들어진다(핀란드 포함), 없는 코드는 null', () => {
    expect(codes).toHaveLength(29);
    for (const c of codes) expect(buildDetail(rows, NO_EXTRAS, c, TODAY), c).not.toBeNull();
    for (const c of ['KR', 'ZZ', 'jp', '']) expect(buildDetail(rows, NO_EXTRAS, c, TODAY)).toBeNull();
  });
  it('필요한 돈은 엔진(adapter) 값, 잔고 증명·비자 비용은 DB 값 그대로', () => {
    for (const a of data.active) {
      const d = buildDetail(rows, NO_EXTRAS, a.code, TODAY)!;
      if (a.engine.needMan !== null) expect(d.money.total.text).toBe(`약 ${a.engine.needMan.toLocaleString('ko-KR')}만 원`);
      else expect(d.money.total.checking).toBe(true);
    }
    const jp = buildDetail(rows, NO_EXTRAS, 'JP', TODAY)!;
    const p = rows.programs.find((x) => x.destination === 'JP')!;
    const proof = rows.facts.find((f) => f.program_id === p.id && f.key === 'proof_amount_with_ticket') ?? rows.facts.find((f) => f.program_id === p.id && f.key === 'proof_amount')!;
    expect(jp.money.rows[0]!.text).toContain(proof.currency === 'KRW' ? Math.round(proof.value_num! / 10_000).toLocaleString('ko-KR') : proof.value_num!.toLocaleString('ko-KR'));
    expect(jp.tags[0]).toBe(`만 ${p.age_min}~${p.age_max}세`);
  });
  it('값이 없으면 "확인 중": 핀란드(협정 미발효)는 거의 모두', () => {
    const fi = buildDetail(rows, NO_EXTRAS, 'FI', TODAY)!;
    expect(fi.comingSoon).toBe(true);
    expect(fi.money.total).toMatchObject({ text: '확인 중', checking: true });
    expect(fi.life.every((c) => c.checking)).toBe(true);
    expect(fi.apply.items.map((i) => i.label)).toEqual(['참고']);
  });
  it('이스라엘만 여행경보 배너: 문장은 safety_note, 일본은 없음', () => {
    const il = buildDetail(rows, NO_EXTRAS, 'IL', TODAY)!;
    const note = rows.countries.find((c) => c.code === 'IL')!.safety_note!;
    expect(il.safety).toMatchObject({ level: 'caution' });
    expect(il.safety!.text).toContain(note);
    expect(codes.filter((c) => buildDetail(rows, NO_EXTRAS, c, TODAY)!.safety)).toEqual(['IL']);
  });
  it('avoid는 note가 없어도 배너 문구가 나온다', () => {
    const r2: DbRows = { ...rows, countries: rows.countries.map((c) => (c.code === 'JP' ? { ...c, safety_level: 'avoid', safety_note: null } : c)) };
    expect(buildDetail(r2, NO_EXTRAS, 'JP', TODAY)!.safety).toMatchObject({ level: 'avoid', text: expect.stringContaining('여행경보') });
  });
  it('확인일이 180일을 넘으면 "확인 필요"', () => {
    expect(buildDetail(rows, NO_EXTRAS, 'JP', TODAY)!.stale).toBe(false);
    const late = buildDetail(rows, NO_EXTRAS, 'JP', '2027-06-30')!;
    expect(late.stale).toBe(true);
    expect(late.sources.every((s) => s.stale)).toBe(true);
  });
  it('필수 앱: country_apps가 있으면 그 나라 것만(이름순), 없으면 비어 있다', () => {
    const apps = [
      { country: 'JP', name: 'PayPay', category: 'bank', url: 'https://paypay.ne.jp/', note_ko: '간편결제', verified_at: TODAY },
      { country: 'JP', name: 'LINE', category: 'life', url: null, note_ko: null, verified_at: TODAY },
      { country: 'CA', name: 'Transit', category: 'transport', url: null, note_ko: null, verified_at: TODAY },
    ];
    expect(buildDetail(rows, { apps, sourceLinks: [] }, 'JP', TODAY)!.apps.map((a) => a.name)).toEqual(['LINE', 'PayPay']);
    expect(buildDetail(rows, NO_EXTRAS, 'JP', TODAY)!.apps).toEqual([]);
  });
});

describe('나라 상세 화면', () => {
  const view = (code: string, partners: Partner[] = partnersJson as Partner[], extras = NO_EXTRAS) =>
    renderToStaticMarkup(<DetailView d={buildDetail(rows, extras, code, TODAY)!} partners={partners} />);
  it('섹션 앵커 8개와 목차(웹 왼쪽·모바일 가로 탭)', () => {
    const html = view('JP');
    for (const id of ['summary', 'money', 'work', 'apply', 'life', 'apps', 'partners', 'sources']) {
      expect(html, id).toContain(`id="${id}"`);
      expect(html, id).toContain(`href="#${id}"`);
    }
    expect(html).toContain('lg:sticky'); // 웹 목차는 스크롤을 따라온다
    expect(html).toContain('overflow-x-auto'); // 모바일 가로 탭
  });
  it('버튼: 적합도 확인 → /test?pre=코드, 체크리스트 → /checklist?c=코드, 비교에 담기', () => {
    const html = view('JP');
    expect(html).toContain('href="/test?pre=JP"');
    expect(html).toContain('href="/checklist?c=JP"');
    expect(text(html)).toContain('비교에 담기');
    expect(text(html)).toContain('일본 적합도 확인');
  });
  it('"질문 12개로 {나라}가/이 나에게…" 조사가 받침에 맞는다', () => {
    expect(text(view('JP'))).toContain('질문 12개로 일본이 나에게');
    expect(text(view('IL'))).toContain('질문 12개로 이스라엘이 나에게');
    expect(text(view('AU'))).toContain('질문 12개로 호주가 나에게');
  });
  it('이스라엘: 위쪽 정보 아래 여행경보 배너', () => {
    const html = view('IL');
    expect(html).toContain('role="note"');
    expect(text(html)).toContain('외교부 여행경보가 있어요: 외교부 여행경보 2단계');
    expect(view('JP')).not.toContain('role="note"');
  });
  it('필수 앱이 없으면 "정리하는 중" 카드 1장', () => {
    expect(text(view('JP'))).toContain('이 나라 앱 목록을 정리하고 있어요');
  });
  it('추천 준비물: 링크가 없으면 칸 4개 모두 "고르는 중", "광고"·수수료 안내 없음', () => {
    const s = text(view('JP'));
    expect(s.match(/추천 상품을 고르는 중이에요/g)).toHaveLength(4);
    for (const c of ['eSIM', '여행자 보험', '해외 송금', '항공권']) expect(s).toContain(c);
    expect(s).not.toContain('광고');
    expect(s).not.toContain('수수료를 받을 수 있어요');
  });
  it('추천 준비물: 링크가 있으면 "광고" 표시 + 수수료 안내 + rel="sponsored noopener" 새 탭', () => {
    const partners: Partner[] = [{ category: 'esim', name: '예시 eSIM', url: 'https://example.com/esim', disclosure: '' }];
    const html = view('JP', partners);
    expect(html).toContain('rel="sponsored noopener"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('href="https://example.com/esim"');
    const s = text(html);
    expect(s).toContain('광고');
    expect(s).toContain('이 링크로 구매하면 워홀로그가 수수료를 받을 수 있어요');
    expect(s.match(/추천 상품을 고르는 중이에요/g)).toHaveLength(3);
  });
  it('핀란드: 곧 열려요 안내, 적합도·비교 버튼 없음', () => {
    const html = view('FI');
    expect(text(html)).toContain('협정이 아직 발효되지 않았어요');
    expect(html).not.toContain('/test?pre=FI');
    expect(text(html)).not.toContain('비교에 담기');
  });
  it('"정보가 틀렸나요?"는 나라·섹션이 붙은 /report 링크', () => {
    const html = view('JP');
    expect(html).toMatch(/href="\/report\?screen=country&amp;c=JP&amp;s=money"/); // 모달을 못 여는 경우(새 탭·스크립트 없음)의 주소
  });
  it('출처 줄: 이름 + 확인일, 링크는 새 탭', () => {
    const p = rows.programs.find((x) => x.destination === 'JP')!;
    const sid = rows.facts.find((f) => f.program_id === p.id && f.source_id != null)!.source_id!;
    const html = view('JP', undefined, { apps: [], sourceLinks: [{ id: sid, url: 'https://example.org/src', publisher: '시험 출처' }] });
    expect(html).toContain('href="https://example.org/src"');
    expect(text(html)).toContain('시험 출처 (확인일:');
  });
});
