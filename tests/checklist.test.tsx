import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { ChecklistView, type SelectedCountry } from '@/components/checklist/ChecklistView';
import { SetupForm } from '@/components/checklist/SetupForm';
import {
  buildEntries, checklistHref, daysUntil, decodeChecked, dLabel, encodeChecked, hasCountryContent, isIsoDate, isValidDeparture,
  maxDeparture, phaseEntries, PHASES, progress, sameChecked, timing, type Entry,
} from '@/lib/checklist';
import { clearRecord, loadRecord, saveRecord } from '@/lib/checklistStore';
import type { ChecklistRows } from '@/lib/data/queries';
import { addDaysIso } from '@/lib/format';
import type { DbRows } from '@/lib/engine';
import checklistSnapshot from './fixtures/checklist_rows_v1.json';
import snapshot from './fixtures/db_rows_v1.json';

const cl = checklistSnapshot as unknown as ChecklistRows;
const rows = snapshot as unknown as DbRows;
const pid = (code: string) => rows.programs.find((p) => p.destination === code)!.id;
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const TODAY = '2026-11-11';

describe('날짜 계산 (출국일 + days_offset)', () => {
  it('D-90 = 출국 90일 전, D+7 = 도착 7일 뒤, 월말·윤년도 맞다', () => {
    expect(addDaysIso('2027-03-01', -90)).toBe('2026-12-01');
    expect(addDaysIso('2027-03-01', 7)).toBe('2027-03-08');
    expect(addDaysIso('2028-03-01', -1)).toBe('2028-02-29');
    expect(addDaysIso('2027-01-31', 1)).toBe('2027-02-01');
  });
  it('D-표시', () => expect([-120, -1, 0, 7].map(dLabel)).toEqual(['D-120', 'D-1', 'D-day', 'D+7']));
  it('출국까지 남은 일 수', () => {
    expect(daysUntil('2027-04-01', '2026-11-11')).toBe(141);
    expect(daysUntil(TODAY, TODAY)).toBe(0);
    expect(daysUntil('2026-11-10', TODAY)).toBe(-1);
  });
  it('출국일: 오늘 이후(오늘 포함) ~ 3년 안, 형식이 이상하면 거부', () => {
    expect(isValidDeparture(TODAY, TODAY)).toBe(true);
    expect(isValidDeparture('2026-11-10', TODAY)).toBe(false);
    expect(isValidDeparture('2029-11-11', TODAY)).toBe(true);
    expect(isValidDeparture('2029-11-12', TODAY)).toBe(false);
    expect(maxDeparture(TODAY)).toBe('2029-11-11');
    for (const bad of ['', '2027-13-01', '2027-02-30', '내일', '2027/03/01', '2027-3-1']) expect(isValidDeparture(bad, TODAY), bad).toBe(false);
    expect(isIsoDate(20270301)).toBe(false);
  });
  it('항목 날짜·늦음: 날짜 있음 / 날짜 없음 / 체크한 항목은 늦지 않다', () => {
    const t1 = timing({ offset: -120 }, '2027-03-01', TODAY, false);
    expect(t1).toEqual({ date: '2026-11-01', label: 'D-120', late: true }); // 2026-11-01 < 오늘
    expect(timing({ offset: -120 }, '2027-03-01', TODAY, true).late).toBe(false);
    expect(timing({ offset: -60 }, '2027-03-01', TODAY, false)).toEqual({ date: '2026-12-31', label: 'D-60', late: false });
    expect(timing({ offset: -120 }, null, TODAY, false)).toEqual({ date: null, label: 'D-120', late: false }); // 날짜 모름
    expect(timing({ offset: null }, '2027-03-01', TODAY, false)).toEqual({ date: null, label: null, late: false }); // 날짜 없는 항목(서류)
    expect(timing({ offset: -139 }, '2027-03-01', '2026-10-13', false)).toMatchObject({ date: '2026-10-13', late: false }); // 오늘이 정확히 그날이면 늦지 않다
    expect(timing({ offset: -140 }, '2027-03-01', '2026-10-13', false).late).toBe(true); // 하루 지나면 늦음
  });
});

describe('항목 만들기 (운영 DB seed_checklist_v1 스냅샷)', () => {
  it('공통 27 + 그 나라 항목 + 그 나라 서류, 단계 순서(결정 → 신청 → 출국 준비 → 출국 → 도착 후 → 지내는 동안)', () => {
    const jp = buildEntries(cl, pid('JP'));
    expect(jp.filter((e) => e.kind === 'item')).toHaveLength(27 + 3);
    expect(jp.filter((e) => e.kind === 'doc')).toHaveLength(13);
    const order = jp.map((e) => PHASES.indexOf(e.phase));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect([...new Set(jp.map((e) => e.phase))]).toEqual(['decide', 'apply', 'prepare', 'depart', 'arrive']); // 일본에는 "지내는 동안" 항목이 없다
    expect([...new Set(buildEntries(cl, pid('AU')).map((e) => e.phase))]).toEqual([...PHASES]); // 호주(세컨비자)에는 있다
  });
  it('날짜 순으로 정렬되고, 서류는 신청 단계 맨 뒤(날짜 없음)', () => {
    const jp = buildEntries(cl, pid('JP'));
    for (const p of PHASES) {
      const offs = phaseEntries(jp, p).filter((e) => e.kind === 'item').map((e) => e.offset ?? 9999);
      expect(offs, p).toEqual([...offs].sort((a, b) => a - b));
    }
    const apply = phaseEntries(jp, 'apply');
    expect(apply.slice(-13).every((e) => e.kind === 'doc' && e.offset === null)).toBe(true);
    expect(apply.slice(0, -13).every((e) => e.kind === 'item')).toBe(true);
  });
  it('항목·서류 키는 겹치지 않는다(i12 / d12)', () => {
    const keys = buildEntries(cl, pid('CA')).map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((k) => /^[id]\d+$/.test(k))).toBe(true);
  });
  it('서류 없는 나라(독일)는 공통 항목만 + "정리하는 중" 대상', () => {
    const de = buildEntries(cl, pid('DE'));
    expect(de).toHaveLength(27);
    expect(de.every((e) => e.kind === 'item')).toBe(true);
    expect(hasCountryContent(cl, pid('DE'))).toBe(false);
    expect(hasCountryContent(cl, pid('JP'))).toBe(true);
  });
  it('서류 뱃지 값(유효 기간·번역·아포스티유)이 DB 그대로 들어간다', () => {
    const real = cl.docs.find((d) => d.max_age_days !== null)!;
    expect(buildEntries(cl, real.program_id).find((x) => x.key === `d${real.id}`)!.doc).toMatchObject({ maxAgeDays: real.max_age_days, translation: false, apostille: false });
    const synthetic: ChecklistRows = { ...cl, docs: [...cl.docs, { ...cl.docs[0]!, id: 9001, program_id: real.program_id, max_age_days: 90, translation_required: true, apostille_required: true }] };
    expect(buildEntries(synthetic, real.program_id).find((x) => x.key === 'd9001')!.doc).toMatchObject({ maxAgeDays: 90, translation: true, apostille: true });
  });
  it('"확인 필요"(needs_review)가 그대로 넘어온다, 사용 안 하는 단계(return)는 빠진다', () => {
    const all = buildEntries(cl, pid('JP'));
    expect(all.some((e) => e.needsReview)).toBe(true);
    const withReturn: ChecklistRows = { ...cl, items: [...cl.items, { ...cl.items[0]!, id: 9999, phase: 'return' }] };
    expect(buildEntries(withReturn, pid('JP')).some((e) => e.key === 'i9999')).toBe(false);
  });
  it('진행률: 지금 있는 항목만 센다', () => {
    const e = buildEntries(cl, pid('JP'));
    expect(progress(e, [e[0]!.key, e[1]!.key, 'i99999'])).toEqual({ total: e.length, done: 2 });
  });
});

describe('링크로 옮기기: 체크 상태 줄이기·풀기', () => {
  const keys = (n: number, kind = 'i') => Array.from({ length: n }, (_, i) => `${kind}${i + 1}`);
  it('줄였다 풀면 같다(순서·중복 무시)', () => {
    const src = ['i3', 'd5', 'i1', 'i3', 'd12', 'i40'];
    expect(new Set(decodeChecked(encodeChecked(src))!)).toEqual(new Set(src));
    expect(decodeChecked(encodeChecked([]))).toEqual([]);
  });
  it('항목·서류가 모두 체크된 JP 62개도 짧다(주소에 담길 길이)', () => {
    const all = buildEntries(cl, pid('JP')).map((e) => e.key);
    const s = encodeChecked(all);
    expect(s.length).toBeLessThan(all.join(',').length / 2);
    expect(s).toMatch(/^[A-Za-z0-9_-]+$/); // base64url
    expect(new Set(decodeChecked(s)!)).toEqual(new Set(all));
    expect(encodeChecked(keys(30)).length).toBeLessThan(60);
  });
  it('없는 항목 id는 조용히 무시한다(항목이 바뀐 경우)', () => {
    const s = encodeChecked(['i1', 'i2', 'i3', 'd1']);
    expect(decodeChecked(s, new Set(['i1', 'd1']))).toEqual(['i1', 'd1']);
  });
  it('깨진 값은 null: 이상한 글자·잘린 값·너무 큰 값', () => {
    for (const bad of ['!!', 'a b', '<script>', '=====', '😀', 'x'.repeat(5000)]) expect(decodeChecked(bad), bad).toBeNull();
    expect(decodeChecked('gA')).toBeNull(); // 가변 길이 바이트가 중간에 끊김
  });
  it('큰 id(만 단위)도 안 깨진다', () => {
    const src = ['i1', 'i123456', 'd99999'];
    expect(new Set(decodeChecked(encodeChecked(src))!)).toEqual(new Set(src));
  });
  it('같은 체크 상태 비교(순서 무시)', () => {
    expect(sameChecked(['i1', 'd2'], ['d2', 'i1'])).toBe(true);
    expect(sameChecked(['i1'], ['i1', 'i2'])).toBe(false);
    expect(sameChecked([], [])).toBe(true);
  });
  it('공유 주소: c · d · s, 날짜·체크가 없으면 빠진다', () => {
    expect(checklistHref('JP', '2027-03-01', ['i1'])).toMatch(/^\/checklist\?c=JP&d=2027-03-01&s=[A-Za-z0-9_-]+$/);
    expect(checklistHref('JP', null, [])).toBe('/checklist?c=JP');
  });
});

describe('저장소 woholog.checklist.v1 (저장소가 막혀 있어도 동작: 이 탭 메모리)', () => {
  afterEach(() => { for (const c of ['JP', 'CA']) clearRecord(c); });
  it('나라마다 따로 저장·불러오기, 나라를 바꿔도 기록이 남는다', () => {
    saveRecord('JP', { date: '2027-03-01', checked: ['i1', 'd2'] });
    saveRecord('CA', { date: null, checked: ['i5'] });
    expect(loadRecord('JP')).toEqual({ date: '2027-03-01', checked: ['i1', 'd2'] });
    expect(loadRecord('CA')).toEqual({ date: null, checked: ['i5'] });
  });
  it('출국일을 바꿔도 체크는 그대로, 초기화는 그 나라만', () => {
    saveRecord('JP', { date: '2027-03-01', checked: ['i1'] });
    saveRecord('JP', { date: '2027-05-01', checked: loadRecord('JP')!.checked });
    expect(loadRecord('JP')).toEqual({ date: '2027-05-01', checked: ['i1'] });
    saveRecord('CA', { date: null, checked: ['i2'] });
    clearRecord('JP');
    expect(loadRecord('JP')).toBeNull();
    expect(loadRecord('CA')).not.toBeNull();
  });
  it('중복 체크는 하나로', () => {
    saveRecord('JP', { date: null, checked: ['i1', 'i1'] });
    expect(loadRecord('JP')!.checked).toEqual(['i1']);
  });
});

describe('화면', () => {
  const entries = buildEntries(cl, pid('JP'));
  const country = (patch: Partial<SelectedCountry> = {}): SelectedCountry => ({
    code: 'JP', nameKo: '일본', entries, hasCountryContent: true, publishers: {}, apps: [], ...patch,
  });
  const view = (o: { date: string | null; checked?: string[]; storageOn?: boolean; c?: SelectedCountry }) =>
    renderToStaticMarkup(<ChecklistView country={o.c ?? country()} date={o.date} checked={o.checked ?? []} today={TODAY} storageOn={o.storageOn ?? true} partners={[]} onToggle={() => {}} onDate={() => {}} onReset={() => {}} />);

  it('날짜 있음: 출국 D-일수, 항목마다 D-day와 날짜, 진행률', () => {
    const s = text(view({ date: '2027-04-01' }));
    expect(s).toContain('일본 · 출국 D-141');
    expect(s).toContain(`${entries.length}개 중 0개 완료`);
    expect(s).toMatch(/D-90 · \d+월 \d+일/);
  });
  it('날짜 있음: 지난 항목은 "늦었어요", 체크하면 사라진다', () => {
    expect(text(view({ date: '2027-04-01' }))).toContain('늦었어요'); // D-180 = 2026-10-03 < 오늘
    const late = entries.filter((e) => timing(e, '2027-04-01', TODAY, false).late).map((e) => e.key);
    expect(late.length).toBeGreaterThan(0);
    expect(text(view({ date: '2027-04-01', checked: late }))).not.toContain('늦었어요');
  });
  it('날짜 없음: 날짜·D-day 없이 단계만 + 날짜 고르기 안내', () => {
    const html = view({ date: null });
    const s = text(html);
    expect(s).toContain('일본 · 출국일 미정');
    expect(s).toContain('출국일을 정하면 할 일 날짜를 알려 드려요');
    expect(s).not.toMatch(/\d월 \d+일/);
    expect(s).not.toContain('늦었어요');
    expect(html).toContain('type="date"');
  });
  it('단계 6개 앵커와 이동 탭', () => {
    const html = view({ date: null });
    for (const p of PHASES.filter((x) => x !== 'during')) { expect(html).toContain(`id="phase-${p}"`); expect(html).toContain(`href="#phase-${p}"`); }
    expect(html).not.toContain('id="phase-during"'); // 항목이 없는 단계는 숨긴다
  });
  it('"확인 필요"(needs_review) 항목에 표시', () => {
    const n = entries.filter((e) => e.needsReview).length;
    expect(text(view({ date: null })).match(/확인 필요/g)!.length).toBeGreaterThanOrEqual(n);
  });
  it('서류 항목: 서류·유효 기간·번역·아포스티유 뱃지', () => {
    const s = text(view({ date: null }));
    expect(s).toContain('서류');
    expect(s).toMatch(/발급 후 \d+일 유효/);
    const doc: Entry = { key: 'd9001', kind: 'doc', phase: 'apply', offset: null, title: '시험 서류', body: null, needsReview: false, sourceId: null, verifiedAt: TODAY, doc: { issuer: '시험 발급처', maxAgeDays: 90, translation: true, apostille: true } };
    const t2 = text(view({ date: null, c: country({ entries: [doc] }) }));
    for (const x of ['서류', '발급 후 90일 유효', '번역 필요', '아포스티유 필요', '발급처: 시험 발급처']) expect(t2).toContain(x);
  });
  it('서류 없는 나라: 공통 항목만 + "이 나라 서류는 정리하는 중이에요"', () => {
    const de = buildEntries(cl, pid('DE'));
    const s = text(view({ date: null, c: country({ code: 'DE', nameKo: '독일', entries: de, hasCountryContent: false }) }));
    expect(s).toContain('이 나라 서류는 정리하는 중이에요');
    expect(s).not.toContain('발급 후');
    expect(view({ date: null })).not.toContain('정리하는 중이에요</p>');
  });
  it('저장소가 막혀 있으면 안내가 뜨고 화면은 그대로', () => {
    expect(text(view({ date: null, storageOn: false }))).toContain('이 브라우저에서는 저장이 꺼져 있어요');
    expect(text(view({ date: null, storageOn: true }))).not.toContain('저장이 꺼져 있어요');
  });
  it('"출국" 단계 아래에 필수 앱 블록과 추천 준비물 블록', () => {
    const html = view({ date: null });
    const depart = html.slice(html.indexOf('id="phase-depart"'), html.indexOf('id="phase-arrive"'));
    expect(depart).toContain('일본 가면 깔아야 할 앱');
    expect(text(depart)).toContain('이 나라 앱 목록을 정리하고 있어요');
    expect(text(depart)).toContain('추천 준비물');
    expect(html.indexOf('추천 준비물')).toBeGreaterThan(html.indexOf('id="phase-depart"'));
  });
  it('모두 체크하면 완료 문구, 단계가 다 끝나면 단계 완료', () => {
    const s = text(view({ date: null, checked: entries.map((e) => e.key) }));
    expect(s).toContain('출국 준비 끝! 좋은 여행 되세요.');
    expect(s).toContain('결정 단계 완료!');
  });
  it('체크 칸은 키보드로 고를 수 있는 진짜 체크박스, 링크 복사·체크 초기화·나라 바꾸기 버튼', () => {
    const html = view({ date: null });
    expect(html.match(/type="checkbox"/g)).toHaveLength(entries.length);
    const s = text(html);
    for (const label of ['다른 기기에서 열기 (링크 복사)', '체크 초기화', '나라 바꾸기', '출국일 바꾸기']) expect(s).toContain(label);
  });
  it('시작 화면: 나라 미리 고름 + 날짜 칸(오늘 이후 ~ 3년) + 아직 몰라요', () => {
    const html = renderToStaticMarkup(<SetupForm options={[{ code: 'JP', nameKo: '일본' }, { code: 'CA', nameKo: '캐나다' }]} preselect="JP" today={TODAY} onStart={() => {}} />);
    expect(text(html)).toContain('일본');
    expect(html).toContain('min="2026-11-11"');
    expect(html).toContain('max="2029-11-11"');
    expect(text(html)).toContain('아직 몰라요');
    expect(text(html)).toContain('체크리스트 만들기');
  });
  it('시작 화면: 나라를 안 골랐으면 검색 칸과 나라 목록', () => {
    const html = renderToStaticMarkup(<SetupForm options={[{ code: 'JP', nameKo: '일본' }, { code: 'CA', nameKo: '캐나다' }]} preselect={null} today={TODAY} onStart={() => {}} />);
    expect(html).toContain('type="search"');
    expect(text(html)).toContain('캐나다');
  });
});

describe('잘못된 입력은 무시', () => {
  it('Entry 타입 순서: decide가 가장 먼저', () => {
    const e: Entry[] = buildEntries(cl, null);
    expect(e[0]!.phase).toBe('decide');
    expect(e.every((x) => x.kind === 'item')).toBe(true);
  });
});
