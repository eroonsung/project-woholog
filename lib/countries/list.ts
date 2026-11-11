import { buildCompare, checkingCell, type Cell, type RowId } from '@/lib/compare/build';
import { adaptRows, type DbRows, type Selection } from '@/lib/engine';

/**
 * 29개국 비교표(/countries, SPEC 7장)의 줄과 정렬·필터. 정렬·필터 값은 모두 주소에 담는다(?sort=money&region=europe&age=31&english=1).
 * 값은 DB(adapter·비교 표와 같은 글자 만들기)에서 오고, 이상한 주소 값은 조용히 무시한다.
 */
export const SORTS = ['name', 'age', 'money', 'selection'] as const;
export type SortId = (typeof SORTS)[number];
export const REGIONS = ['asia', 'oceania', 'europe', 'america', 'middle_east'] as const;
export type RegionId = (typeof REGIONS)[number];

export interface ListQuery { sort: SortId; region: RegionId | null; english: boolean; age: number | null }
export const DEFAULT_QUERY: ListQuery = { sort: 'name', region: null, english: false, age: null };

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseListQuery(sp: Params): ListQuery {
  const sort = first(sp.sort);
  const region = first(sp.region);
  const age = Number(first(sp.age));
  return {
    sort: (SORTS as readonly string[]).includes(sort ?? '') ? (sort as SortId) : 'name',
    region: (REGIONS as readonly string[]).includes(region ?? '') ? (region as RegionId) : null,
    english: first(sp.english) === '1',
    age: Number.isInteger(age) && age >= 1 && age <= 99 ? age : null,
  };
}

/** 쿼리 → 주소. 기본값은 주소에서 뺀다. */
export function listHref(q: ListQuery): string {
  const p = new URLSearchParams();
  if (q.sort !== 'name') p.set('sort', q.sort);
  if (q.region) p.set('region', q.region);
  if (q.english) p.set('english', '1');
  if (q.age !== null) p.set('age', String(q.age));
  const s = p.toString();
  return s ? `/countries?${s}` : '/countries';
}

export interface ListRow {
  code: string;
  nameKo: string;
  region: RegionId;
  english: 'Y' | 'H' | 'N';
  safety: boolean;
  comingSoon: boolean; // 협정 미발효(핀란드 등): 흐리게, 맨 아래
  ageMin: number;
  ageMax: number;
  needMan: number | null;
  selection: Selection | null;
  cells: Pick<Record<RowId, Cell>, 'age' | 'stay' | 'selection' | 'money' | 'wage' | 'study' | 'work'>;
}

const SELECTION_RANK: Record<Selection, number> = { unlimited: 0, first_come: 1, lottery: 2 };
const regionOf = (r: string): RegionId => (r === 'north_america' || r === 'south_america' ? 'america' : (r as RegionId));

/** 협정국 전체(active + 미발효), 이름(가나다) 순 */
export function buildList(rows: DbRows, today: string): ListRow[] {
  const data = adaptRows(rows, { asOf: today });
  const compare = new Map(buildCompare(rows, data.active.map((a) => a.code), today).map((c) => [c.code, c]));
  const out: ListRow[] = [];
  for (const p of rows.programs.filter((x) => x.origin === 'KR' && x.kind === 'working_holiday')) {
    const country = rows.countries.find((c) => c.code === p.destination);
    if (!country) continue;
    const a = data.active.find((x) => x.code === p.destination);
    const c = compare.get(p.destination);
    const pick = (id: RowId): Cell => c?.cells[id] ?? checkingCell();
    out.push({
      code: country.code, nameKo: country.name_ko, region: regionOf(country.region), english: country.english,
      safety: country.safety_level !== 'normal', comingSoon: !a, ageMin: p.age_min, ageMax: p.age_max,
      needMan: a?.engine.needMan ?? null, selection: a ? a.engine.selection : null,
      cells: { age: pick('age'), stay: pick('stay'), selection: pick('selection'), money: pick('money'), wage: pick('wage'), study: pick('study'), work: pick('work') },
    });
  }
  return out.sort((x, y) => x.nameKo.localeCompare(y.nameKo, 'ko'));
}

/** 필터 → 정렬. 미발효 나라는 항상 맨 아래, 값이 없는 나라는 그 정렬에서 맨 아래, 같으면 이름순 */
export function applyQuery(list: readonly ListRow[], q: ListQuery): ListRow[] {
  const kept = list.filter((r) =>
    (!q.region || r.region === q.region) && (!q.english || r.english === 'Y') && (q.age === null || (q.age >= r.ageMin && q.age <= r.ageMax)));
  const name = (a: ListRow, b: ListRow) => a.nameKo.localeCompare(b.nameKo, 'ko');
  const key = (r: ListRow): number | null =>
    q.sort === 'age' ? -r.ageMax : q.sort === 'money' ? r.needMan : q.sort === 'selection' ? (r.selection ? SELECTION_RANK[r.selection] : null) : 0;
  return [...kept].sort((a, b) => {
    if (a.comingSoon !== b.comingSoon) return a.comingSoon ? 1 : -1;
    const ka = key(a), kb = key(b);
    if (ka === null && kb !== null) return 1;
    if (kb === null && ka !== null) return -1;
    return (ka !== null && kb !== null && ka !== kb ? ka - kb : 0) || name(a, b);
  });
}

