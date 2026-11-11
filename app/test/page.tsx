import { Suspense } from 'react';
import { QuizApp } from '@/components/quiz/QuizApp';
import { QuizSkeleton } from '@/components/quiz/Screens';
import { getQuizData } from '@/lib/data/quizCountries';

// 질문 12개 (SPEC.md 3장). 주소: /test?q=1..12, /test?pre=JP
export default function TestPage() {
  const { countries, minAge } = getQuizData();
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizApp countries={countries} minAge={minAge} />
    </Suspense>
  );
}
