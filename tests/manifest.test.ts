import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

describe('웹 앱 매니페스트 (D-134)', () => {
  const m = manifest();
  it('이름·시작 주소·표시 방식', () => {
    expect(m).toMatchObject({ name: '워홀로그', short_name: '워홀로그', start_url: '/', display: 'browser' });
  });
  it('색은 navy·white 토큰 값', () => {
    expect(m.theme_color).toBe('#1d3366');
    expect(m.background_color).toBe('#ffffff');
  });
  it('아이콘 파일이 public/brand에 있다', () => {
    expect(m.icons?.map((i) => i.src)).toEqual(['/brand/icon-192.png', '/brand/icon-512.png']);
    for (const i of m.icons ?? []) expect(existsSync(join(process.cwd(), 'public', i.src))).toBe(true);
  });
});
