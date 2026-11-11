import { describe, expect, it } from 'vitest';
import features from '@/content/features_ko.json';
import { COMMUNITY, hrefOf, isCommunity, isCurrentItem, isToKorea, matches, SOON_COUNT, STAGES, stageIndexFor } from '@/lib/nav';

const slugs = new Set(features.features.map((f) => f.slug));
const allItems = STAGES.flatMap((s) => s.items);

describe('메뉴 데이터 (content/nav_ko.json, D-004)', () => {
  it('단계 4개: 나라 고르기 → 준비하기 → 현지 생활 → 귀국', () => {
    expect(STAGES.map((s) => s.id)).toEqual(['choose', 'prepare', 'local', 'return']);
  });

  it('Soon 항목은 모두 /soon/[slug]이고 slug가 준비 중 기능 목록에 있다', () => {
    for (const item of allItems.filter((i) => i.soon)) {
      expect(item.href, item.label).toMatch(/^\/soon\//);
      expect(slugs.has(item.href!.replace('/soon/', '')), item.label).toBe(true);
    }
    expect(COMMUNITY.href).toBe('/soon/community');
    expect(slugs.has('community')).toBe(true);
  });

  it('실제 기능 항목은 Soon이 아니고, 나라 고르는 창이 필요한 항목은 지금 /countries로 간다', () => {
    const real = allItems.filter((i) => !i.soon);
    expect(real.map((i) => i.label)).toEqual(['나라 추천 테스트', '29개국 비교', '가이드', 'D-day 체크리스트', '나라별 필수 앱']);
    expect(hrefOf(allItems.find((i) => i.pickCountry)!)).toBe('/countries');
  });

  it('곧 나올 기능 수는 준비 중 기능 목록과 같다(15)', () => {
    expect(SOON_COUNT).toBe(15);
  });
});

describe('지금 페이지 판단 (SPEC 1장: 현재 페이지 메뉴는 굵게)', () => {
  it('주소가 같거나 하위 주소면 맞고, 비슷한 글자만 겹치면 아니다', () => {
    expect(matches('/countries', '/countries')).toBe(true);
    expect(matches('/countries', '/countries/JP')).toBe(true);
    expect(matches('/countries', '/countries-extra')).toBe(false);
    expect(matches('/', '/')).toBe(true);
    expect(matches('/', '/test')).toBe(false);
  });

  it('주소 → 단계 번호', () => {
    const cases: [string, number | null][] = [
      ['/test', 0], ['/countries', 0], ['/countries/JP', 0], ['/guides', 0], ['/r/abc', 0], ['/compare', 0],
      ['/checklist', 1], ['/soon/cost-calculator', 1], ['/soon/guidebook', 1],
      ['/soon/job-guide', 2], ['/soon/departure-buddies', 2],
      ['/soon/tax-refund', 3], ['/soon/resume', 3],
      ['/', null], ['/soon', null], ['/to-korea', null], ['/privacy', null], ['/soon/community', null],
    ];
    for (const [path, stage] of cases) expect(stageIndexFor(path), path).toBe(stage);
  });

  it('나라 고르는 창이 필요한 항목은 주소가 겹쳐도 굵게 하지 않는다', () => {
    const apps = allItems.find((i) => i.pickCountry)!;
    expect(isCurrentItem(apps, '/countries')).toBe(false);
    expect(isCurrentItem(allItems.find((i) => i.href === '/countries')!, '/countries')).toBe(true);
  });

  it('커뮤니티·To Korea 구역', () => {
    expect(isCommunity('/soon/community')).toBe(true);
    expect(isCommunity('/soon/communityx')).toBe(false);
    expect(isCommunity('/soon/job-guide')).toBe(false);
    expect(isToKorea('/to-korea')).toBe(true);
    expect(isToKorea('/')).toBe(false);
    expect(isToKorea('/test')).toBe(false);
  });
});
