import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountryBadges } from '@/components/result/Badges';
import { ResultView } from '@/components/result/ResultView';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import snapshot from './fixtures/db_rows_v1.json';
import { RESULT_CASES } from './fixtures/result_cases';
import { pickCard } from '@/lib/result/card';
import { reasonText } from '@/lib/result/text';
import { localeOf } from '@/lib/locale';

const rows = snapshot as unknown as DbRows;
const TODAY = '2026-11-11';
const data = adaptRows(rows, { asOf: TODAY });
const ctx = { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! };
const html = (id: string) => {
  const c = RESULT_CASES.find((x) => x.id === id)!;
  const v = validateAnswers(c.answers, ctx);
  if (!v.ok) throw new Error(id);
  return renderToStaticMarkup(<ResultView id="test" answers={v.answers} result={computeResult(v.answers, data, TODAY, rows)} dataChanged={false} today={TODAY} />);
};

describe('결과 화면 그리기(서버 렌더)', () => {
  for (const c of RESULT_CASES) {
    it(`${c.id}: 오류 없이 그려지고, 문구 키·빈 값이 화면에 새지 않는다`, () => {
      const out = html(c.id);
      expect(out).toContain('id="result-headline"');
      const text = out.replace(/<[^>]+>/g, ' ');
      expect(text).not.toMatch(/\{\w+\}|reason\.|result\.|preview\.|undefined|NaN|\bnull\b/);
      expect(out).toContain('현실 미리보기');
      expect(out).toContain('data-share'); // 공유 버튼(10단계): 누를 수 있는 진짜 버튼
      expect(out).not.toContain('data-share-slot');
    });
  }

  it('마음에 둔 나라를 고르지 않으면 제목 칩은 "나에게 가장 잘 맞는 나라", 고르면 "마음에 둔 나라"', () => {
    expect(html('noheart')).toContain('나에게 가장 잘 맞는 나라');
    expect(html('top1')).toContain('마음에 둔 나라');
  });

  it('카드가 1위가 아니면 "나에게 더 잘 맞는 나라 TOP 3", 1위면 "다음으로 잘 맞는 나라"', () => {
    expect(html('far')).toContain('나에게 더 잘 맞는 나라 TOP 3');
    expect(html('top1')).toContain('다음으로 잘 맞는 나라');
  });

  it('카드가 1위면 비교 버튼 글자가 바뀐다', () => {
    expect(html('top1')).toContain('다른 나라와 나란히 비교');
    expect(html('far')).toContain('1위 나라와 나란히 비교');
  });

  it('돈이 확인 중이면 "확인 중" 줄과 "일부 조건 확인 중"이 나온다', () => {
    const out = html('checking');
    expect(out).toContain('확인 중: 잔고 증명 금액을 확인하고 있어요');
    expect(out).toContain('일부 조건 확인 중');
  });

  it('이렇게 바꾸면: 제안이 있을 때만(낮은 %), top1은 없음', () => {
    expect(html('noheart_low')).toContain('이렇게 바꾸면');
    expect(html('top1')).not.toContain('이렇게 바꾸면');
  });

  it('갈 수 없는 나라 목록은 <details>로 접혀 있고 개수가 제목에 나온다', () => {
    const out = html('top1');
    expect(out).toMatch(/<details[^>]*class="[^"]*"[^>]*>/);
    expect(out).not.toMatch(/<details[^>]*\sopen/);
    expect(out).toMatch(/지금은 갈 수 없는 나라 \d+곳/);
  });
});

describe('뱃지: 색(코랄) + 글자', () => {
  it('추첨·일하며 지내기 어려움·안전 주의를 글자로 보여 준다', () => {
    const out = renderToStaticMarkup(<CountryBadges badges={['lottery', 'hard_to_live']} safety />);
    expect(out).toContain('추첨');
    expect(out).toContain('일하며 지내기 어려움');
    expect(out).toContain('안전 주의');
    expect(out).toContain('bg-coral-50');
  });
  it('아무것도 없으면 아무것도 그리지 않는다', () => {
    expect(renderToStaticMarkup(<CountryBadges badges={[]} safety={false} />)).toBe('');
  });
});

describe('마음에 둔 다른 나라: 이유 보기', () => {
  const planOf = (id: string) => {
    const c = RESULT_CASES.find((x) => x.id === id)!;
    const v = validateAnswers(c.answers, ctx);
    if (!v.ok) throw new Error(id);
    const result = computeResult(v.answers, data, TODAY, rows);
    return { plan: pickCard(v.answers, result)!, result };
  };
  const section = (out: string) => out.match(/<section aria-labelledby="other-hearts-title".*?<\/section>/s)?.[0] ?? '';
  const plain = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  it('마음에 둔 나라가 둘 이상이면 다른 나라마다 %·조건 수·이유 2줄·"이유 보기"·상세 링크가 나온다', () => {
    const out = html('multi_low');
    const sec = section(out);
    const { plan, result } = planOf('multi_low');
    expect(plan.card.code).toBe('CA');
    expect(plan.otherHearts.map((r) => r.code)).toEqual(['TW']);
    const tw = plan.otherHearts[0]!;
    const name = result.countries.TW!.nameKo;
    const text = plain(sec);
    expect(text).toContain('마음에 둔 다른 나라');
    expect(text).toContain(`${name} ${tw.pct}%`.replace(' ', ' ')); // 이름과 % (사이 공백만 다를 수 있음)
    expect(text).toContain(`조건 ${tw.itemCount}개 중 ${tw.okCount}개 ✓`);
    for (const line of tw.lines.slice(0, 2)) expect(text).toContain(reasonText(line, { country: name }));
    expect(text).toContain('이유 보기');
    expect(sec).toContain(`href="/countries/TW"`);
    expect(text).toContain(`${name} 상세 정보 보기`);
  });

  it('안 맞는 점(✗·△)이 맞는 점(✓)보다 먼저 나온다 — 저장된 순서 그대로', () => {
    const { plan } = planOf('multi_low');
    const marks = plan.otherHearts[0]!.lines.map((l) => l.mark);
    const rank = { no: 0, partial: 1, ok: 2 } as const;
    expect(marks.map((m) => rank[m])).toEqual([...marks.map((m) => rank[m])].sort((a, b) => a - b));
    expect(marks[0]).not.toBe('ok'); // 대만은 깎인 점이 있어 맨 위가 ✓가 아니다
  });

  it('처음에는 2줄만 보이고 나머지는 접힌 <details>(기본 닫힘) 안에 있다. hover를 쓰지 않는다', () => {
    const sec = section(html('multi_low'));
    const { plan, result } = planOf('multi_low');
    const tw = plan.otherHearts[0]!;
    const name = result.countries.TW!.nameKo;
    expect(tw.lines.length).toBeGreaterThan(2);
    expect(sec).toMatch(/<details[^>]*class="group/);
    expect(sec).not.toMatch(/<details[^>]*\sopen/);
    const [before, inside] = [sec.slice(0, sec.indexOf('<details')), sec.slice(sec.indexOf('<details'))];
    expect(plain(before)).toContain(reasonText(tw.lines[1]!, { country: name }));
    expect(plain(before)).not.toContain(reasonText(tw.lines[2]!, { country: name }));
    expect(plain(inside)).toContain(reasonText(tw.lines[2]!, { country: name }));
    expect(inside).toContain('이유 접기');
    expect(sec).not.toMatch(/hover:(block|flex|inline|visible)|group-hover/);
    expect(sec).toMatch(/min-h-11/); // 누르는 칸 44px 이상
  });

  it('돈 줄은 숫자(필요한 돈·내 예산·부족액)로 나온다 (돈이 안 맞는 나라)', () => {
    const { plan, result } = planOf('multi_low');
    const money = plan.otherHearts[0]!.lines.find((l) => l.itemId === 'money' && l.mark !== 'ok');
    if (!money) return; // 이 사람은 대만 돈 조건이 맞으면 건너뜀(다른 줄 검증은 위 테스트)
    expect(plain(section(html('multi_low')))).toMatch(/필요한 돈 약 [\d,]+만 원/);
    expect(result.countries.TW).toBeTruthy();
  });

  it('마음에 둔 나라가 없거나 하나뿐이거나 1위와 같으면 이 영역이 없다(중복 표시 없음)', () => {
    expect(section(html('noheart'))).toBe('');
    expect(section(html('top1'))).toBe(''); // 캐나다 하나, 1위
    expect(section(html('far'))).toBe(''); // 영국 하나(카드), 1위는 TOP 3에서 보임
    expect(section(html('blocked_age'))).toBe(''); // 갈 수 없는 나라는 기존대로 카드 위 한 줄
  });

  it('마음에 둔 나라가 하나뿐이고 점수가 낮아도(1위가 다른 나라) 그 나라가 카드라서 이유가 전부 보인다', () => {
    const out = html('far_low'); // 대만 하나, 1위는 다른 나라
    const { plan, result } = planOf('far_low');
    expect(plan.card.code).toBe('TW');
    expect(plan.cardIsFirst).toBe(false);
    expect(plan.otherHearts).toEqual([]);
    expect(section(out)).toBe(''); // "다른 나라" 영역에 또 나오지 않는다
    const text = plain(out);
    const name = result.countries.TW!.nameKo;
    expect(plan.card.lines.some((l) => l.mark === 'no' || l.mark === 'partial')).toBe(true); // 안 맞는 점이 있고
    for (const line of plan.card.lines) expect(text).toContain(reasonText(line, { country: name })); // 줄마다 카드에 보인다(접힘 없음)
    expect(text).toContain(`${name} 상세 정보 보기`);
  });

  it('기존 동작: 카드 나라는 그대로 위에, 다른 나라(multi: 영국)는 아래 영역에', () => {
    const out = html('multi');
    expect(plain(section(out))).toContain('영국');
    expect(plain(out.slice(0, out.indexOf('other-hearts-title')))).toContain('캐나다');
    expect(out.match(/id="other-hearts-title"/g)).toHaveLength(1);
  });

  it('결과 화면은 한국어 화면이다(영어 화면은 To Korea·처리방침뿐) — 새 문구도 한국어 키만 쓴다', () => {
    expect(localeOf('/r/abc', null)).toBe('ko');
    expect(localeOf('/r/abc/compare', 'en')).toBe('ko');
    const text = plain(section(html('multi_low')));
    expect(text).not.toMatch(/result\.otherHearts|undefined|\{\w+\}/);
    expect(text).toContain('이유 보기');
  });
});
