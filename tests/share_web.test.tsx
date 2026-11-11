import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ResultButtons } from '@/components/result/ResultActions';
import { StoryDownload } from '@/components/result/StoryDownload';
import { t } from '@/lib/copy';
import { buildSharePayload, isIos, storyHref } from '@/lib/share/web';

describe('공유 동작 (D-131)', () => {
  it('공유 창에는 제목·문구·링크만 넘기고 파일은 넣지 않는다', () => {
    const p = buildSharePayload('제목', '문구', 'https://x/r/1');
    expect(Object.keys(p).sort()).toEqual(['text', 'title', 'url']);
    expect(p).not.toHaveProperty('files');
  });
  it('공유 문구', () => {
    expect(t('share.text', { country: '캐나다', pct: 82 })).toBe('나는 캐나다 82%! 내 워홀 나라 적합도 확인해 봐');
  });
  it('스토리 이미지 주소: 저장은 ?download=1, 새 탭은 없음', () => {
    expect(storyHref('abc', true)).toBe('/r/abc/story?download=1');
    expect(storyHref('abc', false)).toBe('/r/abc/story');
  });
  it('아이폰·아이패드 판별', () => {
    expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone', 5)).toBe(true);
    expect(isIos('Mozilla/5.0 (Macintosh)', 'MacIntel', 5)).toBe(true); // 데스크톱 모드 아이패드
    expect(isIos('Mozilla/5.0 (Macintosh)', 'MacIntel', 0)).toBe(false);
    expect(isIos('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l', 5)).toBe(false);
  });
  it('저장 버튼은 처음 그릴 때 다운로드 링크, 아이폰 안내는 아이폰에서만', () => {
    const html = renderToStaticMarkup(<StoryDownload id="abc" />);
    expect(html).toContain('href="/r/abc/story?download=1"');
    expect(html).toContain('download="woholog-result.png"');
    expect(html).not.toContain('길게 눌러');
  });
  it('웹 결과 버튼 묶음: 공유와 이미지 저장이 따로 있다', () => {
    const plan = { card: { code: 'CA' } } as never;
    const html = renderToStaticMarkup(<ResultButtons plan={plan} id="abc" shareTitle="t" shareText="x" />);
    expect(html).toContain('data-share');
    expect(html).toContain('data-story-download');
  });
});
