import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppsIndex } from '@/components/apps/AppsIndex';
import { buildAppsIndex, filterApps } from '@/lib/countries/appsIndex';

const p = (d: string) => ({ origin: 'KR', kind: 'working_holiday', destination: d }) as never;
const rows = { programs: ['DE', 'CA', 'AU', 'JP', 'GB', 'FI'].map(p), countries: [['DE', '독일'], ['CA', '캐나다'], ['AU', '호주'], ['JP', '일본'], ['GB', '영국'], ['FI', '핀란드']].map(([code, name_ko]) => ({ code, name_ko })) } as never;
const apps = [{ country: 'JP' }, { country: 'JP' }, { country: 'DE' }];

describe('나라별 필수 앱 목록 (D-130)', () => {
  it('많이 찾는 나라 먼저, 그다음 가나다순, 앱 개수', () => {
    const list = buildAppsIndex(rows, apps);
    expect(list.map((r) => r.code)).toEqual(['AU', 'GB', 'JP', 'CA', 'DE', 'FI']);
    expect(list.find((r) => r.code === 'JP')!.count).toBe(2);
    expect(list.find((r) => r.code === 'FI')!.count).toBe(0);
  });
  it('검색: 이름 일부·코드, 빈 검색어는 전체', () => {
    const list = buildAppsIndex(rows, apps);
    expect(filterApps(list, '캐').map((r) => r.code)).toEqual(['CA']);
    expect(filterApps(list, ' jp ').map((r) => r.code)).toEqual(['JP']);
    expect(filterApps(list, '')).toHaveLength(6);
    expect(filterApps(list, '없는나라')).toHaveLength(0);
  });
  it('카드는 나라 상세 #apps로 간다, 앱이 없으면 "정리 중이에요"', () => {
    const html = renderToStaticMarkup(<AppsIndex rows={buildAppsIndex(rows, apps)} />);
    expect(html).toContain('href="/countries/JP#apps"');
    expect(html).toContain('앱 2개');
    expect(html).toContain('정리 중이에요');
  });
});
