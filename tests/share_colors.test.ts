import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHARE_COLORS } from '@/lib/share/colors';

/**
 * 공유 이미지(satori)는 CSS 변수를 못 읽어서 lib/share/colors.ts에 색을 직접 적는다(D-125).
 * 디자인 토큰(app/globals.css의 @theme)과 값이 다르면 실패해서, 토큰을 바꾸고 이미지 색을 깜빡하는 일을 막는다.
 */
const css = readFileSync('app/globals.css', 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map((m) => [m[1]!, m[2]!.toLowerCase()]));
const kebab = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase();
/** 이름에 맞는 토큰 이름: aqua50 → aqua-50, text2는 토큰 이름이 그대로 text2 */
const tokenName = (name: string) => (kebab(name) in tokens ? kebab(name) : name.toLowerCase());

describe('공유 이미지 색 = 디자인 토큰', () => {
  const entries = Object.entries(SHARE_COLORS).filter(([name]) => name !== 'white'); // white는 Tailwind 기본값(#fff)이라 토큰 표에 없다
  it('globals.css에서 색 토큰을 읽었다', () => expect(Object.keys(tokens).length).toBeGreaterThan(10));
  for (const [name, hex] of entries) {
    it(`${name} = --color-${tokenName(name)}`, () => {
      const token = tokens[tokenName(name)];
      expect(token, `${name}에 맞는 --color-… 토큰이 globals.css에 없어요`).toBeDefined();
      expect(hex.toLowerCase(), `${name}: 이미지 색과 디자인 토큰이 달라요`).toBe(token);
    });
  }
  it('white는 #ffffff', () => expect(SHARE_COLORS.white).toBe('#ffffff'));
  it('이미지 그리는 코드에는 색 값을 직접 쓰지 않고 이 표만 쓴다', () => {
    const image = readFileSync('lib/share/image.tsx', 'utf8');
    expect(image.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });
});
