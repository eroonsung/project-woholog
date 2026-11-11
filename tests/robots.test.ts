import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from '@/app/robots';
import { isSiteLive } from '@/lib/site';

describe('오픈 전 검색 차단 (D-092)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('기본(환경변수 없음)은 전체 Disallow', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_LIVE', '');
    expect(isSiteLive()).toBe(false);
    expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' });
  });

  it('false·true가 아닌 값도 막는다', () => {
    for (const v of ['false', 'TRUE', '1', 'yes']) {
      vi.stubEnv('NEXT_PUBLIC_SITE_LIVE', v);
      expect(robots().rules).toEqual({ userAgent: '*', disallow: '/' });
    }
  });

  it('true일 때만 색인을 허용한다', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_LIVE', 'true');
    expect(isSiteLive()).toBe(true);
    expect(robots().rules).toEqual({ userAgent: '*', allow: '/' });
  });
});
