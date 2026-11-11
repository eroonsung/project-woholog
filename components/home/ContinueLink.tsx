'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { t } from '@/lib/copy';
import { loadQuiz } from '@/lib/quiz/state';

const subscribe = () => () => {};
/** 진행 중인 답이 있으면 지금 질문 번호, 없거나 저장소를 못 읽으면 0 (sessionStorage `woholog.quiz.v1`, 읽기는 try/catch 안에서) */
const progress = (): number => {
  const state = loadQuiz();
  return state && Object.keys(state.answers).length > 0 ? state.q : 0;
};

/**
 * "이어서 하기 (Q7부터)" (SPEC.md 2장): 브라우저에 진행 중인 답이 있을 때만 보인다.
 * 서버에서 그릴 때는 항상 숨기고, 브라우저에서만 저장소를 읽는다. 눌러도 안 푼 질문 앞으로는 못 간다(주소 검사가 막음).
 */
export function ContinueLink() {
  const q = useSyncExternalStore(subscribe, progress, () => 0);
  if (!q) return null;
  return (
    <p className="mt-3">
      <Link href={`/test?q=${q}`} className="inline-flex min-h-11 items-center text-body font-extrabold text-navy underline underline-offset-4">
        {t('landing.continue', { n: q })}
      </Link>
    </p>
  );
}
