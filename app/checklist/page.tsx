import { ChecklistApp } from '@/components/checklist/ChecklistApp';
import { pageMeta } from '@/lib/meta';
import type { Partner } from '@/components/countries/DetailExtras';
import partnersJson from '@/content/partners.json';
import { buildEntries, hasCountryContent } from '@/lib/checklist';
import { pickApps } from '@/lib/countries/detail';
import { popularFirst } from '@/lib/popular';
import { fetchAdapterRows, fetchChecklistRows, fetchDetailExtras } from '@/lib/data/queries';

// D-day 체크리스트 (SPEC 10장). 나라·항목은 서버에서 읽고(읽기만), 체크·날짜는 브라우저 저장소에 둔다(D-022). 주소(?c=&d=&s=)마다 달라서 요청마다 그린다.
export const dynamic = 'force-dynamic';

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export const metadata = pageMeta('meta.checklist.title', 'meta.checklist.desc');

export default async function ChecklistPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const [rows, rowsCl, extras] = await Promise.all([fetchAdapterRows(), fetchChecklistRows(), fetchDetailExtras()]);

  const programs = rows.programs.filter((p) => p.origin === 'KR' && p.kind === 'working_holiday');
  // 많이 찾는 나라 먼저, 그다음 가나다순 (D-130)
  const options = popularFirst(programs.map((p) => ({ code: p.destination, nameKo: rows.countries.find((c) => c.code === p.destination)?.name_ko ?? p.destination })));

  const code = (one(sp.c) ?? '').toUpperCase();
  const program = programs.find((p) => p.destination === code) ?? null;
  const selected = program ? {
    code, nameKo: options.find((o) => o.code === code)!.nameKo,
    entries: buildEntries(rowsCl, program.id),
    hasCountryContent: hasCountryContent(rowsCl, program.id),
    publishers: Object.fromEntries(rows.sources.map((s) => [s.id, s.publisher])),
    apps: pickApps(extras.apps, code),
  } : null;

  return <ChecklistApp options={options} selected={selected} d={one(sp.d)} s={one(sp.s)} partners={partnersJson as Partner[]} />;
}
