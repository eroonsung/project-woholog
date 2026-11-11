import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { DetailView } from '@/components/countries/DetailView';
import type { Partner } from '@/components/countries/DetailExtras';
import partnersJson from '@/content/partners.json';
import { buildDetail } from '@/lib/countries/detail';
import { fetchAdapterRows, fetchDetailExtras } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';

// 나라 상세 (SPEC 8장). 협정국 29개 페이지를 빌드 때 만들고 하루에 한 번 다시 만든다(ISR). DB는 읽기만 한다.
export const revalidate = 86400;

export async function generateStaticParams() {
  const rows = await fetchAdapterRows();
  return rows.programs.filter((p) => p.origin === 'KR' && p.kind === 'working_holiday').map((p) => ({ code: p.destination }));
}

type Props = { params: Promise<{ code: string }> };

async function load(code: string) {
  const [rows, extras] = await Promise.all([fetchAdapterRows(), fetchDetailExtras()]);
  return buildDetail(rows, extras, code, todayKst());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const d = await load(code.toUpperCase());
  return d ? { title: `${d.nameKo} 워킹홀리데이 | 워홀로그` } : {};
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params;
  const upper = code.toUpperCase();
  if (code !== upper) redirect(`/countries/${upper}`); // 소문자 주소는 대문자 주소로
  const d = await load(upper);
  if (!d) notFound();
  return <DetailView d={d} partners={partnersJson as Partner[]} />;
}
