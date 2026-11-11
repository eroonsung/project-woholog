'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QUESTION_COUNT } from '@/lib/quiz/config';
import { t } from '@/lib/copy';

/** 질문 화면 공통 틀: 위쪽 줄(이전·진행·처음부터) + 진행 막대 + 본문 폭. 와이어프레임 S01~S06. */
export function QuizShell({ q, onBack, onRestart, children }: {
  q: number; onBack: () => void; onRestart: () => void; children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="mx-auto flex h-16 w-full max-w-quiz items-center justify-between px-5 lg:px-0">
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 pr-3 text-body font-bold text-navy">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('btn.prev')}
        </button>
        <p className="text-body font-extrabold" aria-live="polite">
          {t('quiz.progress', { n: q, total: QUESTION_COUNT })}
        </p>
        <button type="button" onClick={onRestart} className="min-h-11 pl-3 text-body font-bold text-navy underline underline-offset-4">
          {t('btn.restart')}
        </button>
      </header>
      <div
        role="progressbar" aria-valuemin={1} aria-valuemax={QUESTION_COUNT} aria-valuenow={q}
        aria-label={t('quiz.progress', { n: q, total: QUESTION_COUNT })} className="h-1 w-full bg-aqua-50"
      >
        <div className="h-full bg-aqua transition-[width]" style={{ width: `${(q / QUESTION_COUNT) * 100}%` }} />
      </div>
      <main className="mx-auto flex w-full max-w-quiz flex-1 flex-col px-5 pb-12 pt-8 lg:px-0">{children}</main>
    </div>
  );
}

/** 질문 제목. 질문이 바뀌면 여기로 포커스를 옮겨 스크린리더가 새 질문을 읽게 한다. */
export function QuestionHeading({ title, help }: { title: string; help?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), [title]);
  return (
    <div className="mb-8">
      <h1 ref={ref} tabIndex={-1} className="text-h1 text-navy outline-none">{title}</h1>
      {help ? <p className="mt-3 text-body-l text-text2">{help}</p> : null}
    </div>
  );
}

/** 아래 버튼 줄: 왼쪽 보조(선택 사항) + 오른쪽 "다음"(주요 버튼, 화면당 1개) */
export function QuizActions({ secondary, nextLabel, nextDisabled, onNext }: {
  secondary?: ReactNode; nextLabel?: string; nextDisabled?: boolean; onNext: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-auto flex items-center justify-between gap-4 border-t border-line bg-white px-5 py-3 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:pt-10">
      <div>{secondary}</div>
      <Button onClick={onNext} disabled={nextDisabled} className="flex-1 lg:min-w-32 lg:flex-none">
        {nextLabel ?? t('btn.next')}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}

/** 선택 칸 위에 잠깐 뜨는 안내(예: "3개까지 고를 수 있어요") */
export function InlineNotice({ message }: { message: string | null }) {
  return <p role="status" className="min-h-6 text-body font-bold text-coral-dark">{message}</p>;
}
