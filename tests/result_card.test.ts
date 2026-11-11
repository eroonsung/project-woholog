import { describe, expect, it } from 'vitest';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { pickCard } from '@/lib/result/card';
import { computeResult } from '@/lib/result/compute';
import { buildPreview, isLate, nextApply, pickJob } from '@/lib/result/preview';
import { moneyText, previewRows } from '@/lib/result/previewText';
import { blockReasonText, itemLabel, reasonText } from '@/lib/result/text';
import { addMonthsIso, formatKoDate, formatKoRange } from '@/lib/format';
import snapshot from './fixtures/db_rows_v1.json';
import { RESULT_CASES } from './fixtures/result_cases';

const rows = snapshot as unknown as DbRows;
const TODAY = '2026-11-11';
const data = adaptRows(rows, { asOf: TODAY });
const ctx = { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! };

function build(id: string) {
  const c = RESULT_CASES.find((x) => x.id === id)!;
  const v = validateAnswers(c.answers, ctx);
  if (!v.ok) throw new Error(`${id}: ${v.reason}`);
  const result = computeResult(v.answers, data, TODAY, rows);
  return { c, answers: v.answers, result, plan: pickCard(v.answers, result)! };
}

describe('결과 맨 위 카드 5가지 경우 (SPEC 4.2)', () => {
  for (const c of RESULT_CASES) {
    it(`${c.id}: ${c.label}`, () => {
      const { plan, result } = build(c.id);
      expect(plan.kind).toBe(c.expect.kind);
      expect(plan.showWhatIf).toBe(c.expect.whatIf);
      if (c.expect.allLow !== undefined) expect(plan.allLow).toBe(c.expect.allLow);
      if (c.expect.checking) expect(plan.card.unknown).toContain('money');
      // 카드 나라는 갈 수 있는 나라(순위에 있는 나라)이고, TOP 3에는 카드 나라가 없다
      expect(result.ranked.some((r) => r.code === plan.card.code)).toBe(true);
      expect(plan.top3.some((r) => r.code === plan.card.code)).toBe(false);
      expect(plan.top3.length).toBeLessThanOrEqual(3);
    });
  }

  it('noheart·blocked: 카드는 엔진 1위, 제목은 "나에게 가장 잘 맞는 나라"', () => {
    for (const id of ['noheart', 'noheart_low', 'blocked_age', 'blocked_visited']) {
      const { plan, result } = build(id);
      expect(plan.card.code).toBe(result.ranked[0]!.code);
      expect(plan.chipKey).toBe('result.noHeart.title');
      expect(plan.headline.key).toBe('result.noHeart.headline');
    }
  });

  it('top1: 마음에 둔 나라가 1위면 확신 문장, 이렇게 바꾸면는 보이지 않는다', () => {
    const { plan } = build('top1');
    expect(plan.card.code).toBe('CA');
    expect(plan.headline.key).toBe('result.heart.top');
    expect(plan.chipKey).toBe('result.chip.heart');
    expect(plan.cardIsFirst).toBe(true);
  });

  it('close: 1위와의 %p 차이를 문장에 넣는다(기준은 저장된 설정 close_gap_pp)', () => {
    const { plan, result } = build('close');
    expect(plan.headline.key).toBe('result.heart.close');
    expect(plan.headline.params.diff).toBe(result.ranked[0]!.pct - plan.card.pct);
    expect(plan.headline.params.diff as number).toBeLessThan(result.config.closeGapPp);
  });

  it('far: 차이가 기준 이상이면 "이것부터 해결해요"', () => {
    const { plan, result } = build('far');
    expect(plan.headline.key).toBe('result.heart.far');
    expect(result.ranked[0]!.pct - plan.card.pct).toBeGreaterThanOrEqual(result.config.closeGapPp);
  });

  it('blocked: 갈 수 없는 이유(나이·이미 다녀옴)를 카드 위에 보여 준다', () => {
    expect(build('blocked_age').plan.blockedHearts).toEqual([{ code: 'JP', reason: { kind: 'age', maxAge: 30 } }]);
    expect(build('blocked_visited').plan.blockedHearts).toEqual([{ code: 'AU', reason: { kind: 'visited' } }]);
  });

  it('마음에 둔 나라가 여러 개면 % 가장 높은 나라가 카드, 나머지는 "다른 나라"에 %만, 못 가는 나라는 이유와 함께', () => {
    const { plan } = build('multi');
    expect(plan.card.code).toBe('CA');
    expect(plan.otherHearts.map((r) => r.code)).toEqual(['GB']);
    expect(plan.blockedHearts.map((b) => b.code)).toEqual(['JP']);
  });

  it('TOP 3 제목과 비교 버튼: 카드가 1위가 아니면 "TOP 3"·"1위 나라와", 1위면 "다음으로"·"다른 나라와"(1·2위)', () => {
    const far = build('far').plan;
    expect([far.topTitleKey, far.compare]).toEqual(['result.top3', { codes: ['GB', 'CA'], labelKey: 'compare.cta' }]);
    const top1 = build('top1').plan;
    expect(top1.topTitleKey).toBe('result.next');
    expect(top1.compare?.labelKey).toBe('result.compare.other');
    expect(top1.compare?.codes).toEqual(['CA', top1.top3[0]!.code]);
  });

  it('돈이 확인 중이면 그 줄은 "확인 중", % 옆에 "일부 조건 확인 중"을 띄울 수 있다(SPEC 4.3, D-090)', () => {
    const { plan, result } = build('checking');
    expect(plan.card.code).toBe('ES');
    expect(result.countries.ES!.moneyChecking).toBe(true);
    expect(plan.card.unknown).toContain('money');
    expect(plan.card.lines.some((l) => l.kind === 'core' && l.itemId === 'money')).toBe(false);
  });
});

describe('조건 줄 문구 (reason.* 키 → 글자)', () => {
  it('모든 저장된 조건 줄의 문구 키가 copy 파일에 있고 자리표시자가 남지 않는다', () => {
    for (const c of RESULT_CASES) {
      const { result } = build(c.id);
      for (const r of result.ranked) {
        for (const line of r.lines) {
          const text = reasonText(line, { country: result.countries[r.code]!.nameKo });
          expect(text, `${c.id} ${r.code} ${line.key}`).not.toMatch(/\{\w+\}|reason\.|undefined|null|NaN/);
          expect(itemLabel(line)).not.toMatch(/item\.|q12\./);
        }
      }
    }
  });

  it('영어가 "일부"인 나라 문구는 나라 이름을 넣어 읽는다(홍콩 고정이 아님)', () => {
    const line = { mark: 'partial', kind: 'core', itemId: 'language', key: 'reason.language.partial.mixed', params: {} } as const;
    expect(reasonText(line, { country: '홍콩' })).toBe('홍콩은 영어로 일할 곳이 일부만 있어요.');
    expect(reasonText(line, { country: '캐나다' })).toBe('캐나다는 영어로 일할 곳이 일부만 있어요.');
    expect(reasonText(line, { country: '영국' })).toBe('영국은 영어로 일할 곳이 일부만 있어요.');
    // 실제 데이터: 영어가 일부(H)인 나라(지금은 홍콩)의 조건 줄에서 그 나라 이름이 쓰인다
    const found = RESULT_CASES.flatMap((c) => {
      const { result } = build(c.id);
      return result.ranked.flatMap((r) => r.lines.filter((l) => l.key === 'reason.language.partial.mixed').map((l) => ({ code: r.code, name: result.countries[r.code]!.nameKo, line: l })));
    });
    expect(found.length, '영어가 일부인 나라가 나오는 답 세트').toBeGreaterThan(0);
    for (const f of found) expect(reasonText(f.line, { country: f.name })).toBe(`${f.name}${f.name === '홍콩' ? '은' : ''} 영어로 일할 곳이 일부만 있어요.`);
  });

  it('값이 비면 대체 문구(대표 일자리·한 고용주 기간)를 쓴다', () => {
    expect(reasonText({ mark: 'ok', kind: 'core', itemId: 'work', key: 'reason.work.ok', params: { job: null } })).toBe('하고 싶은 일을 찾을 수 있어요.');
    expect(reasonText({ mark: 'ok', kind: 'core', itemId: 'work', key: 'reason.work.ok', params: { job: '카페·식당' } })).toBe('카페·식당처럼 하고 싶은 일을 찾을 수 있어요.');
    expect(reasonText({ mark: 'partial', kind: 'core', itemId: 'work', key: 'reason.work.partial.employerLimit', params: { months: null } })).toBe('한 고용주와 일할 수 있는 기간이 짧아요.');
  });

  it('돈 문구: 숫자는 천 단위, 걸림돌은 문구로 풀어 쓴다', () => {
    expect(reasonText({ mark: 'no', kind: 'core', itemId: 'money', key: 'reason.money.no', params: { budget: 500, need: 1800, gap: 1300 } })).toBe('필요한 돈 약 1,800만 원보다 1,300만 원 부족해요.');
    expect(reasonText({ mark: 'partial', kind: 'priority', itemId: 'easy_job', key: 'reason.priority.easy_job.partial', params: { obstacles: ['noFulltime'] } })).toBe('걸림돌이 하나 있어요: 정규직이 안 돼요');
    expect(reasonText({ mark: 'no', kind: 'priority', itemId: 'easy_job', key: 'reason.priority.easy_job.no', params: { obstacles: ['localLanguage', 'hardCompetition'] } })).toBe('걸림돌이 여러 개예요: 현지어가 필요해요, 구직 경쟁이 치열해요');
  });

  it('갈 수 없는 이유 문구', () => {
    expect(blockReasonText({ kind: 'age', maxAge: 30 })).toBe('나이 조건(만 30세까지)');
    expect(blockReasonText({ kind: 'visited' })).toBe('이미 다녀온 나라(한 번만 가능)');
    expect(blockReasonText({ kind: 'inactive' })).toBe('모집 중단');
  });
});

describe('현실 미리보기 4줄 (SPEC 4.4)', () => {
  const previewOf = (code: string, jobs: ('cafe' | 'office' | 'farm' | 'hotel' | 'retail' | 'care')[] = []) =>
    buildPreview(rows, code, TODAY, data.config, jobs, data.active.find((a) => a.code === code)!.engine.needMan)!;

  it('필요한 돈: 분해를 보여 주고(외화는 원화 병기), 합계는 adapter 값과 같다', () => {
    const p = previewOf('CA');
    expect(p.money.needMan).toBe(428);
    const r = previewRows(p, TODAY, undefined)[0]!;
    expect(r.value).toBe('필요한 돈 약 428만 원');
    expect(r.sub).toContain('잔고 증명 CAD 2,500 (약 250만 원)');
    expect(r.sub).toContain('항공권 약 150만 원');
  });

  it('영국은 보건부담금이 분해에 들어간다, 비자 비용 0·잔고 증명 0은 줄에서 뺀다', () => {
    expect(previewRows(previewOf('GB'), TODAY, undefined)[0]!.sub).toContain('보건부담금');
    const nl = previewRows(previewOf('NL'), TODAY, undefined)[0]!;
    expect(nl.sub).not.toContain('잔고 증명');
    const jp = previewRows(previewOf('JP'), TODAY, undefined)[0]!;
    expect(jp.sub).not.toContain('비자 비용'); // 일본 비자 비용 0
  });

  it('돈이 확인 중인 나라는 "확인 중"', () => {
    expect(previewRows(previewOf('PL'), TODAY, undefined)[0]!.value).toBe('확인 중');
  });

  it('대표 일자리는 이용자가 고른 직군을 먼저, 없으면 그 나라의 첫 번째, 아예 없으면 확인 중', () => {
    expect(pickJob(rows.jobTypes, 'AU', ['farm'])?.code).toBe('farm');
    expect(pickJob(rows.jobTypes, 'AU', ['office'])?.code).toBe('cafe');
    expect(pickJob(rows.jobTypes, 'DE', ['cafe'])).toBeNull();
    const deKrw = previewOf('DE').wage!.krw!;
    expect(deKrw).toBeGreaterThan(0);
    expect(previewRows(previewOf('DE'), TODAY, undefined)[1]!.value).toBe(`대표 일자리 확인 중 / 시급 약 EUR 13.9 (약 ${deKrw.toLocaleString('ko-KR')}원)`);
  });

  it('최저시급: 나라 값이 없으면 도시 중 가장 높은 값, 시급이 없고 월급만 있으면 월급÷월 근무 시간', () => {
    expect(previewOf('JP').wage).toMatchObject({ currency: 'JPY', amount: 1226, city: '도쿄', derived: false });
    expect(previewOf('DE').wage).toMatchObject({ amount: 13.9, derived: false }); // 시급 값이 있으면 그것
    const monthlyOnly = data.active.map((a) => a.code).find((code) => {
      const own = rows.stats.filter((s) => s.country === code);
      return own.some((s) => s.metric === 'min_wage_monthly' && s.city === '') && !own.some((s) => s.metric === 'min_wage_hourly');
    });
    expect(monthlyOnly, '월급만 있는 나라').toBeDefined();
    const w = previewOf(monthlyOnly!).wage!;
    const monthly = rows.stats.find((s) => s.country === monthlyOnly && s.metric === 'min_wage_monthly' && s.city === '')!;
    expect(w.derived).toBe(true);
    expect(w.amount).toBeCloseTo(monthly.value / 173.8, 1);
  });

  it('월세: 월세 값이 있으면 그것, 범위면 a~b, 원화 환산을 같이, 도시가 있으면 "· 도시"', () => {
    const rent = previewRows(previewOf('CA'), TODAY, undefined)[2]!;
    expect(rent.value).toMatch(/^월세 CAD [\d,]+(~[\d,]+)? \(약 [\d,]+(~[\d,]+)?만 원\)( · .+)?$/);
  });

  it('외화 값에는 원화를 같이 쓴다(SPEC 0.3): 시급·월세, 환율이 없거나 이전에 저장된 결과는 외화만', () => {
    const jp = previewOf('JP');
    expect(jp.wage!.krw).toBeGreaterThan(5000);
    expect(previewRows(jp, TODAY, undefined)[1]!.value).toContain(`JPY 1,226 (약 ${jp.wage!.krw!.toLocaleString('ko-KR')}원) · 도쿄`);
    expect(jp.rent!.krwMan).toBeGreaterThan(0);
    expect(previewRows(jp, TODAY, undefined)[2]!.value).toContain(`(약 ${jp.rent!.krwMan!.toLocaleString('ko-KR')}만 원) · 도쿄`);
    const ca = previewOf('CA');
    expect(ca.rent!.max).not.toBeNull();
    expect(previewRows(ca, TODAY, undefined)[2]!.value).toContain(`약 ${ca.rent!.krwMan!.toLocaleString('ko-KR')}~${ca.rent!.krwMaxMan!.toLocaleString('ko-KR')}만 원`);
    // 환율 없음 / 예전 결과(krw 칸 없음): 지어내지 않고 외화만
    const old = { ...jp, wage: { ...jp.wage!, krw: undefined }, rent: { ...jp.rent!, krwMan: undefined, krwMaxMan: undefined } };
    expect(previewRows(old, TODAY, undefined)[1]!.value).toContain('JPY 1,226 · 도쿄');
    expect(previewRows(old, TODAY, undefined)[1]!.value).not.toContain('원)');
    expect(previewRows(old, TODAY, undefined)[2]!.value).not.toContain('만 원');
    const noRate = buildPreview({ ...rows, rates: rows.rates.filter((x) => x.currency !== 'JPY') }, 'JP', TODAY, data.config, [], null)!;
    expect(noRate.wage!.krw).toBeNull();
    expect(previewRows(noRate, TODAY, undefined)[1]!.value).toContain('JPY 1,226 · 도쿄');
  });

  it('다음 접수: 오늘 이후 가장 가까운 기간(열려 있는 것 포함) → 상시 → 선착순(연 N명)', () => {
    // 네덜란드: 소진 시까지(closes 없음)라 지금도 열려 있는 기간
    const nl = nextApply(previewOf('NL').next, TODAY);
    expect(nl).toMatchObject({ kind: 'window', opensOn: '2026-01-01', closesOn: null });
    expect(previewRows(previewOf('NL'), TODAY, undefined)[3]!.value).toBe('다음 접수 2026년 1월 1일 (200명 소진 시까지)');
    // 일본: 올해 분기 접수가 모두 지났으니 선착순(연 N명)
    expect(nextApply(previewOf('JP').next, TODAY)).toEqual({ kind: 'first_come', quota: 10000 });
    expect(previewRows(previewOf('JP'), TODAY, undefined)[3]!.value).toBe('다음 접수 선착순 (연 10,000명)');
    expect(nextApply({ selection: 'unlimited', quota: null, windows: [] }, TODAY)).toEqual({ kind: 'always' });
    expect(previewRows({ ...previewOf('AU'), next: { selection: 'unlimited', quota: null, windows: [] } }, TODAY, undefined)[3]!.value).toBe('다음 접수 상시');
    // 닫힌 기간은 보여 주지 않고, 열리기 전 기간은 날짜 범위로
    expect(nextApply({ selection: 'first_come', quota: 5, windows: [{ opensOn: '2026-01-01', closesOn: '2026-01-05', note: null }] }, TODAY).kind).toBe('first_come');
    const future = { selection: 'first_come' as const, quota: 5, windows: [{ opensOn: '2027-01-13', closesOn: '2027-01-17', note: null }] };
    expect(previewRows({ ...previewOf('JP'), next: future }, TODAY, undefined)[3]!.value).toBe('다음 접수 1월 13일~17일');
  });

  it('고른 출국 시기보다 접수가 늦으면 안내 줄이 붙는다(Q5), 시기를 모르면 안 붙는다', () => {
    const next = { selection: 'first_come' as const, quota: 100, windows: [{ opensOn: '2027-04-13', closesOn: '2027-04-17', note: '2027년 2분기' }] };
    const apply = nextApply(next, TODAY);
    expect(isLate(apply, 'm3', TODAY)).toBe(true); // 3개월 안(2027-02-11)보다 늦다
    expect(isLate(apply, 'y1', TODAY)).toBe(false);
    expect(isLate(apply, 'unknown', TODAY)).toBe(false);
    expect(isLate(apply, undefined, TODAY)).toBe(false);
    const p = { ...previewOf('JP'), next };
    expect(previewRows(p, TODAY, 'm3')[3]!.extra).toBe('원하는 시기보다 접수가 늦어요');
    expect(previewRows(p, TODAY, 'y1')[3]!.extra).toBeUndefined();
    expect(previewRows(p, TODAY, 'y1')[3]!.value).toBe('다음 접수 4월 13일~17일 (2027년 2분기)');
  });

  it('이전에 저장된 결과(미리보기 없음)는 4줄 모두 확인 중', () => {
    expect(previewRows(undefined, TODAY, undefined).map((r) => r.value)).toEqual(['확인 중', '확인 중', '확인 중', '확인 중']);
  });

  it('외화 금액 표시: 원화 병기(SPEC 0.3)', () => {
    expect(moneyText({ amount: 2500, currency: 'CAD', man: 250 })).toBe('CAD 2,500 (약 250만 원)');
    expect(moneyText({ amount: 3000000, currency: 'KRW', man: 300 })).toBe('약 300만 원');
    expect(moneyText({ amount: 10, currency: 'XXX', man: null })).toBe('XXX 10');
  });
});

describe('날짜 표시 (SPEC 0.3)', () => {
  it('2027-01-13 → 2027년 1월 13일, 기간은 연도 없이', () => {
    expect(formatKoDate('2027-01-13')).toBe('2027년 1월 13일');
    expect(formatKoRange('2027-01-13', '2027-01-17')).toBe('1월 13일~17일');
    expect(formatKoRange('2027-01-30', '2027-02-02')).toBe('1월 30일~2월 2일');
    expect(formatKoRange('2027-01-13', '2027-01-13')).toBe('1월 13일');
  });
  it('개월 더하기: 말일을 넘으면 그 달 말일', () => {
    expect(addMonthsIso('2026-11-11', 3)).toBe('2027-02-11');
    expect(addMonthsIso('2026-11-30', 3)).toBe('2027-02-28');
    expect(addMonthsIso('2026-11-11', 12)).toBe('2027-11-11');
  });
});
