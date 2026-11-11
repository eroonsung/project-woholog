import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOGO, localeOf } from '@/lib/locale';
import { tEn } from '@/lib/copy';

describe('화면 언어 판단 (D-135)', () => {
  it('/to-korea와 /privacy?lang=en만 영어, 나머지는 한국어', () => {
    expect(localeOf('/to-korea')).toBe('en');
    expect(localeOf('/privacy', 'en')).toBe('en');
    for (const [path, lang] of [['/', null], ['/privacy', null], ['/privacy', 'ko'], ['/test', 'en'], ['/countries/JP', 'en'], ['/r/abc', null]] as const) expect(localeOf(path, lang), `${path}?lang=${lang}`).toBe('ko');
    expect(localeOf(null)).toBe('ko');
  });
  it('언어별 로고 파일이 있고 .svg다', () => {
    for (const l of Object.values(LOGO)) {
      expect(l.src.endsWith('.svg')).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', l.src))).toBe(true);
    }
    expect(LOGO.ko.src).toBe('/brand/woholog-logo-ko.svg');
    expect(LOGO.en.src).toBe('/brand/woholog-logo.svg');
  });
  it('영어 대체 글', () => {
    expect(tEn('brand.logoAlt')).toBe('woholog home');
  });
});
