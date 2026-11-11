import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TryCard } from '@/components/result/ResultActions';
import { isMine, loadMine, markMine, MINE_MAX } from '@/lib/mine';

function fakeStore(blocked = false) {
  const data = new Map<string, string>();
  const boom = () => { throw new DOMException('blocked', 'SecurityError'); };
  return { data, getItem: (k: string) => (blocked ? boom() : data.get(k) ?? null), setItem: (k: string, v: string) => (blocked ? boom() : void data.set(k, v)), removeItem: (k: string) => void data.delete(k) };
}
const stub = (local: ReturnType<typeof fakeStore>) => vi.stubGlobal('window', { localStorage: local, sessionStorage: fakeStore() });

describe('내 결과 표시 (D-132)', () => {
  beforeEach(() => stub(fakeStore()));
  afterEach(() => vi.unstubAllGlobals());

  it('내 결과: 만든 직후 id를 남기면 내 결과로 본다', () => {
    expect(isMine('a')).toBe(false);
    expect(markMine('a')).toBe(true);
    expect(isMine('a')).toBe(true);
  });
  it('남의 결과: 링크로 들어온 사람은 목록에 없다', () => {
    markMine('mine-1');
    expect(isMine('someone-else')).toBe(false);
  });
  it('최근 20개만, 같은 id는 앞으로 옮긴다', () => {
    for (let i = 0; i < 25; i++) markMine(`id-${i}`);
    const list = loadMine();
    expect(list).toHaveLength(MINE_MAX);
    expect(list[0]).toBe('id-24');
    expect(isMine('id-0')).toBe(false);
    markMine('id-10');
    expect(loadMine()[0]).toBe('id-10');
    expect(loadMine()).toHaveLength(MINE_MAX);
  });
  it('형식이 다른 값은 버리고 새로 시작한다', () => {
    (window.localStorage as unknown as ReturnType<typeof fakeStore>).data.set('woholog.mine.v1', '{"a":1}');
    expect(loadMine()).toEqual([]);
  });
});

describe('저장소가 막혔을 때', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('오류 없이 남의 결과로 본다(쓰기는 false)', () => {
    stub(fakeStore(true));
    expect(() => markMine('a')).not.toThrow();
    expect(markMine('a')).toBe(false);
    expect(isMine('a')).toBe(false);
    expect(loadMine()).toEqual([]);
  });
});

describe('남의 결과 화면 (서버에서 그릴 때 = 남의 결과)', () => {
  it('결과 카드 아래 "나도 해보기" 카드 + /test 버튼, 준비 시작은 카드 아래(모바일)', () => {
    const html = renderToStaticMarkup(<TryCard plan={{ card: { code: 'CA' } } as never} id="abc" />);
    expect(html).toContain('나도 내 나라 확인해 볼까요?');
    expect(html).toContain('질문 12개, 약 2분');
    expect(html).toContain('href="/test"');
    expect(html).toContain('href="/checklist?c=CA"');
  });
});
