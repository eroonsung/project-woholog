import type { CountryAppRow } from '@/lib/data/queries';
import type { DbRows } from '@/lib/engine';
import { popularFirst } from '@/lib/popular';

/** 나라별 필수 앱 목록(/apps): 협정국마다 앱 개수. 많이 찾는 나라 먼저, 그다음 가나다순 (D-130) */
export interface AppsIndexRow { code: string; nameKo: string; count: number }

export function buildAppsIndex(rows: Pick<DbRows, 'programs' | 'countries'>, apps: Pick<CountryAppRow, 'country'>[]): AppsIndexRow[] {
  const counts = new Map<string, number>();
  for (const a of apps) counts.set(a.country, (counts.get(a.country) ?? 0) + 1);
  const list = rows.programs
    .filter((p) => p.origin === 'KR' && p.kind === 'working_holiday')
    .map((p) => ({ code: p.destination, nameKo: rows.countries.find((c) => c.code === p.destination)?.name_ko ?? p.destination, count: counts.get(p.destination) ?? 0 }));
  return popularFirst(list);
}

/** 나라 이름(한글) 일부 또는 나라 코드로 거른다. 빈 검색어는 전체 */
export function filterApps(list: AppsIndexRow[], query: string): AppsIndexRow[] {
  const q = query.trim().toLowerCase();
  return q ? list.filter((r) => r.nameKo.toLowerCase().includes(q) || r.code.toLowerCase() === q) : list;
}
