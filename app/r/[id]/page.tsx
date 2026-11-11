import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResultView } from '@/components/result/ResultView';
import { fetchQuizResult } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';
import { loadResult } from '@/lib/result/load';
import { buildShareData, shareDescription, shareTitle } from '@/lib/share/data';
import { isAnswers } from '@/lib/quiz/state';
import type { StoredResult } from '@/lib/result/types';

// 결과 화면 (SPEC 4장). get_quiz_result 함수로만 읽는다. 없거나 지워진 id·형식이 맞지 않는 결과는 404.
export const dynamic = 'force-dynamic';
// 결과 링크는 아는 사람만 보는 주소라서 오픈 후에도 검색에 나오지 않게 한다

// 링크 미리보기(카카오톡·메신저)용 제목·설명. 이미지는 같은 폴더의 opengraph-image.tsx가 붙인다.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const base: Metadata = { robots: { index: false, follow: false } };
  try {
    const { id } = await params;
    const loaded = await loadResult(id);
    const data = loaded ? buildShareData(loaded.answers, loaded.result) : null;
    if (!data) return base;
    const title = shareTitle(data);
    return { ...base, title, description: shareDescription(), openGraph: { title, description: shareDescription(), type: 'website' }, twitter: { card: 'summary_large_image', title, description: shareDescription() } };
  } catch { return base; }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isStoredResult(v: unknown): v is StoredResult {
  const r = v as Partial<StoredResult> | null;
  return !!r && r.v === 1 && Array.isArray(r.ranked) && Array.isArray(r.blocked) && Array.isArray(r.comingSoon)
    && typeof r.countries === 'object' && r.countries !== null && typeof r.whatIf === 'object' && !!r.config;
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const row = await fetchQuizResult(id);
  if (!row || !isAnswers(row.answers) || !isStoredResult(row.result)) notFound();
  return <ResultView id={id} answers={row.answers} result={row.result} dataChanged={row.dataChanged} today={todayKst()} />;
}
