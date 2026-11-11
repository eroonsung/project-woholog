import { ReportPage } from '@/components/report/ReportPage';
import { SCREENS, type ReportScreen } from '@/lib/report';
import { fetchAdapterRows } from '@/lib/data/queries';

// 정보 제보 (SPEC 13장): 보통은 각 화면의 "제보하기"가 모달로 열고, 링크로 직접 들어와도(?c=&s=&screen=&from=) 같은 모달이 열린다.
export const dynamic = 'force-dynamic';

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function ReportRoute({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const code = (one(sp.c) ?? '').toUpperCase();
  const screenParam = one(sp.screen) ?? '';
  const screen: ReportScreen = (SCREENS as readonly string[]).includes(screenParam) ? (screenParam as ReportScreen) : code ? 'country' : 'other';
  const section = /^[a-z0-9-]{1,30}$/.test(one(sp.s) ?? '') ? one(sp.s) : null;
  const from = one(sp.from) ?? '';
  const back = from.startsWith('/') && !from.startsWith('//') ? from : code ? `/countries/${code}` : '/';
  let country: string | null = null;
  let countryName: string | null = null;
  if (/^[A-Z]{2}$/.test(code)) {
    const rows = await fetchAdapterRows();
    const c = rows.countries.find((x) => x.code === code);
    if (c) { country = c.code; countryName = c.name_ko; }
  }
  return <ReportPage ctx={{ country, countryName, screen, section, path: back }} back={back} />;
}
