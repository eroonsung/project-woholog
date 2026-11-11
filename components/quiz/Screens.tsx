'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { t } from '@/lib/copy';
import { MIN_LOADING_MS } from '@/lib/quiz/config';

/** 나이 초과 (S06_stop-age). 결과를 저장하지 않는다. TODO(9단계): "오픈 알림 받기" 버튼은 Coming soon 모달이 생긴 뒤에 넣는다. */
export function StopAge({ maxAge, onRetry }: { maxAge: number; onRetry: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return (
    <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col items-center justify-center py-16 gap-6 px-5 text-center">
      <h1 ref={ref} tabIndex={-1} className="text-h1 text-navy outline-none">{t('stop.title', { maxAge })}</h1>
      <p className="text-body-l text-text2">{t('stop.body', { maxAge })}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button onClick={onRetry}>{t('stop.retry')}</Button>
        <Link href="/countries" className="inline-flex min-h-11 items-center px-2 text-body font-bold text-navy underline underline-offset-4">
          {t('quiz.stop.compare')}
        </Link>
      </div>
    </main>
  );
}

/** 계산 중 (S06_loading). 최소 1.2초 보여 준다(SPEC 3.3). 오류면 다시 시도·질문으로 돌아가기. */
export function Loading({ failed, rateLimited = false, onRetry, onBack }: {
  failed: boolean; rateLimited?: boolean; onRetry: () => void; onBack: () => void;
}) {
  const steps = ['loading.step1', 'loading.step2', 'loading.step3'];
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (failed) return;
    const ids = steps.map((_, i) => setTimeout(() => setDone(i + 1), ((i + 1) * MIN_LOADING_MS) / steps.length));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  return (
    <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col items-center justify-center py-16 gap-8 px-5 text-center">
      {failed ? (
        <>
          <h1 className="text-h2 text-navy">{t(rateLimited ? 'quiz.error.rateLimited' : 'error.generic')}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button onClick={onRetry}>{t('quiz.error.retry')}</Button>
            <Button variant="ghost" onClick={onBack}>{t('quiz.error.back')}</Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-h2 text-navy">{t('loading.title')}</h1>
          <ul className="flex w-full max-w-sm flex-col gap-3 rounded-card-lg bg-subtle p-6 text-left" aria-live="polite">
            {steps.map((key, i) => (
              <li key={key} className={`flex items-center gap-3 text-body font-bold ${i < done ? 'text-navy' : 'text-text3'}`}>
                {i < done
                  ? <Check aria-hidden="true" className="size-5 rounded-full bg-aqua-100 p-1 text-aqua-dark" />
                  : <Loader aria-hidden="true" className="size-5 animate-spin" />}
                {t(key)}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

/** 질문 불러오는 동안 보여 주는 회색 막대 (SPEC 0.4) */
export function QuizSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex w-full max-w-quiz flex-1 flex-col gap-4 px-5 pt-24">
      <div className="h-10 w-3/4 animate-pulse rounded-card bg-subtle" />
      <div className="h-6 w-1/2 animate-pulse rounded-card bg-subtle" />
      <div className="mt-6 h-40 animate-pulse rounded-card-lg bg-subtle" />
    </div>
  );
}
