import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompareView } from '@/components/compare/CompareView';
import { buildCompare, compareOptions } from '@/lib/compare/build';
import { buildFit } from '@/lib/compare/fit';
import { parseCodes } from '@/lib/compare/parse';
import { fetchAdapterRows, fetchQuizResult } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';
import { isAnswers } from '@/lib/quiz/state';
import { latestRates } from '@/lib/result/preview';
import type { StoredResult } from '@/lib/result/types';

// 결과에서 비교 (SPEC 6장): 내 결과의 %와 ✓△✗를 같이 보여 준다. 결과 링크는 아는 사람만 보는 주소라 검색에 나오지 않게 한다.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isStoredResult(v: unknown): v is StoredResult {
  const r = v as Partial<StoredResult> | null;
  return !!r && r.v === 1 && Array.isArray(r.ranked) && Array.isArray(r.blocked) && typeof r.countries === 'object' && r.countries !== null;
}

export default async function ResultComparePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ c?: string | string[] }> }) {
  const [{ id }, { c }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const saved = await fetchQuizResult(id);
  if (!saved || !isAnswers(saved.answers) || !isStoredResult(saved.result)) notFound();
  const rows = await fetchAdapterRows();
  const today = todayKst();
  const options = compareOptions(rows, today);
  const codes = parseCodes(c, new Set(options.map((o) => o.code)));
  const countries = buildCompare(rows, codes, today);
  return (
    <CompareView
      base={`/r/${id}/compare`} countries={countries} options={options}
      fit={buildFit(saved.result, saved.answers, countries.map((x) => x.code))}
      back={{ href: `/r/${id}`, labelKey: 'compare.back.result' }} fxDate={latestRates(rows, today).fxDate}
    />
  );
}
