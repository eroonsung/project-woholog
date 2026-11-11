import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountryBadges } from '@/components/result/Badges';
import { ResultView } from '@/components/result/ResultView';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import snapshot from './fixtures/db_rows_v1.json';
import { RESULT_CASES } from './fixtures/result_cases';

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
      expect(out).toContain('data-share-slot'); // 공유 버튼은 자리만
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
