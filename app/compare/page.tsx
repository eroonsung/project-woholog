import { CompareView } from '@/components/compare/CompareView';
import { pageMeta } from '@/lib/meta';
import { buildCompare, compareOptions } from '@/lib/compare/build';
import { parseCodes } from '@/lib/compare/parse';
import { fetchAdapterRows } from '@/lib/data/queries';
import { latestRates } from '@/lib/result/preview';
import { todayKst } from '@/lib/format';

// 나란히 비교, 테스트 없이 (SPEC 6장). 주소의 ?c=JP,CA,GB에 따라 달라지므로 요청마다 그린다(읽기만 함).
export const dynamic = 'force-dynamic';

export const metadata = pageMeta('compare.title', 'meta.compare.desc');

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ c?: string | string[] }> }) {
  const { c } = await searchParams;
  const rows = await fetchAdapterRows();
  const today = todayKst();
  const options = compareOptions(rows, today);
  const codes = parseCodes(c, new Set(options.map((o) => o.code)));
  return (
    <CompareView
      base="/compare" countries={buildCompare(rows, codes, today)} options={options}
      back={{ href: '/countries', labelKey: 'compare.back.countries' }} fxDate={latestRates(rows, today).fxDate}
    />
  );
}
