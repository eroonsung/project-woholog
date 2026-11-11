import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchQuizResult } from '@/lib/data/queries';

// 결과 화면은 5단계. 지금은 저장된 결과를 그대로 보여 주는 임시 화면이다. 없는 id·지워진 결과는 404 (SPEC 4.1).
export const dynamic = 'force-dynamic';
// 결과 링크는 아는 사람만 보는 주소라서 오픈 후에도 검색에 나오지 않게 한다
export const metadata: Metadata = { robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const row = await fetchQuizResult(id);
  if (!row) notFound();
  return (
    <main className="mx-auto w-full max-w-content px-5 py-8 lg:px-10">
      <pre className="overflow-x-auto text-caption text-navy">
        {JSON.stringify({ id, dataChanged: row.dataChanged, createdAt: row.createdAt, answers: row.answers, result: row.result }, null, 2)}
      </pre>
    </main>
  );
}
