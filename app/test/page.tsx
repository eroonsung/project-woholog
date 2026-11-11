import { Suspense } from 'react';
import { pageMeta } from '@/lib/meta';
import { QuizApp } from '@/components/quiz/QuizApp';
import { QuizSkeleton } from '@/components/quiz/Screens';
import { getQuizData } from '@/lib/data/quizCountries';

// 질문 12개 (SPEC.md 3장). 주소: /test?q=1..12, /test?pre=JP
// 나라 데이터는 하루에 한 번 다시 만든다(D-034). 급한 수정은 Vercel에서 다시 배포.
export const revalidate = 86400;

export const metadata = pageMeta('meta.test.title');

export default async function TestPage() {
  const { countries, minAge, config } = await getQuizData();
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizApp countries={countries} minAge={minAge} config={config} />
    </Suspense>
  );
}
