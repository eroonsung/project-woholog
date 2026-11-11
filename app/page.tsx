import { HomeView, type BrowseCountry } from '@/components/home/HomeView';
import landing from '@/content/landing_countries.json';
import { adaptRows } from '@/lib/engine';
import { fetchAdapterRows } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';
import { buildExample } from '@/lib/result/example';

// 첫 화면 (SPEC.md 2장). 요청 때 DB를 읽지 않는다: 빌드할 때 한 번 만들고 하루에 한 번 다시 만든다(D-034).
// 예시 카드 숫자는 가상 사용자 A의 답을 엔진으로 계산한 실제 값이라, DB 값이 바뀌면 다음 재생성·배포 때 같이 바뀐다.
export const revalidate = 86400;

export default async function Home() {
  const rows = await fetchAdapterRows();
  const asOf = todayKst();
  const example = buildExample(rows, asOf);
  const active = adaptRows(rows, { asOf }).active;
  const countries: BrowseCountry[] = landing.codes.flatMap((code) => {
    const found = active.find((a) => a.code === code);
    return found ? [{ code, nameKo: found.nameKo, selection: found.engine.selection }] : [];
  });
  return <HomeView example={example} countries={countries} />;
}
