import { notFound } from 'next/navigation';
import { ResultView } from '@/components/result/ResultView';
import { adaptRows, type DbRows } from '@/lib/engine';
import { validateAnswers } from '@/lib/quiz/validate';
import { computeResult } from '@/lib/result/compute';
import snapshot from '@/tests/fixtures/db_rows_v1.json';
import { RESULT_CASES } from '@/tests/fixtures/result_cases';

// 개발 확인용: 결과 카드 5가지 경우를 DB 저장 없이 그린다(/dev/result?case=top1). 배포(production 빌드)에서는 404 (/dev/tokens와 같다).
export const dynamic = 'force-dynamic';

export default async function DevResult({ searchParams }: { searchParams: Promise<{ case?: string; changed?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { case: caseId, changed } = await searchParams;
  const rows = snapshot as unknown as DbRows;
  const picked = RESULT_CASES.find((c) => c.id === caseId);
  if (!picked) {
    return (
      <main className="mx-auto w-full max-w-content px-5 py-8">
        <ul className="flex flex-col gap-2">
          {RESULT_CASES.map((c) => <li key={c.id}><a className="underline" href={`/dev/result?case=${c.id}`}>{c.id}</a> {c.label}</li>)}
        </ul>
      </main>
    );
  }
  const asOf = '2026-11-11';
  const data = adaptRows(rows, { asOf });
  const checked = validateAnswers(picked.answers, { countries: data.active.map((a) => a.engine), config: data.config, minAge: data.minAge!, maxAge: data.maxAge! });
  if (!checked.ok) notFound();
  return <ResultView id="dev" answers={checked.answers} result={computeResult(checked.answers, data, asOf, rows)} dataChanged={changed === '1'} today={asOf} />;
}
