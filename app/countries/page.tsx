import { CountriesView } from '@/components/countries/CountriesView';
import { pageMeta } from '@/lib/meta';
import { applyQuery, buildList, parseListQuery } from '@/lib/countries/list';
import { fetchAdapterRows } from '@/lib/data/queries';
import { adaptRows } from '@/lib/engine';
import { todayKst } from '@/lib/format';

// 29개국 한눈에 비교 (SPEC 7장). 정렬·필터가 주소(?sort=&region=&english=&age=)에 담기므로 요청마다 서버에서 그린다(읽기만 함).
export const dynamic = 'force-dynamic';

export const metadata = pageMeta('countries.title', 'meta.countries.desc');

export default async function CountriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = parseListQuery(await searchParams);
  const rows = await fetchAdapterRows();
  const today = todayKst();
  const all = buildList(rows, today);
  const dates = adaptRows(rows, { asOf: today }).active.map((a) => a.provenance.verifiedAt).filter((d): d is string => d !== null).sort();
  return <CountriesView rows={applyQuery(all, q)} total={all.length} q={q} verifiedAt={dates[0] ?? null} />;
}
