'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { maxAgeOf, type ScoringConfig } from '@/lib/engine';
import type { QuizCountry } from '@/lib/data/quizCountries';
import { MAX_HEART_COUNTRIES, QUESTION_COUNT } from '@/lib/quiz/config';
import { clearQuiz, loadQuiz, saveQuiz } from '@/lib/quiz/state';
import {
  candidatesOf, canEnter, firstUnanswered, isSkipped, nextQuestion, prevQuestion, pruneAnswers, type QuizContext,
} from '@/lib/quiz/steps';
import { submitQuiz } from '@/lib/quiz/submit';
import { EMPTY_STATE, type Answers, type QuizState } from '@/lib/quiz/types';
import { t } from '@/lib/copy';
import { ConfirmDialog } from './ConfirmDialog';
import { QuestionAge, QuestionCompanion, QuestionCountry, type QProps } from './QuestionsA';
import { QuestionBudget, QuestionChoice, QuestionJob, QuestionLanguage, QuestionPriority } from './QuestionsB';
import { Loading, QuizSkeleton, StopAge } from './Screens';
import { QuizShell } from './Shell';

const url = (q: number) => `/test?q=${q}`;

/**
 * 질문 화면 전체: 주소(?q=, ?pre=, ?stop=age, ?loading=1) ↔ 답 ↔ sessionStorage를 이어 준다. (SPEC.md 3장)
 * 질문 순서·건너뛰기·답 정리 규칙은 lib/quiz/steps.ts에 있다.
 */
export function QuizApp({ countries, minAge, config }: { countries: QuizCountry[]; minAge: number; config: ScoringConfig }) {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<QuizState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failedAt, setFailedAt] = useState(-1); // 이 번호의 시도가 실패했다
  const [attempt, setAttempt] = useState(0);
  const failed = failedAt === attempt;
  // 서버에서는 false, 브라우저에서는 true (저장소를 읽어도 되는 때)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const ctx: QuizContext = useMemo(() => ({ countries: countries.map((c) => c.engine), config }), [countries, config]);
  const maxAge = useMemo(() => maxAgeOf(ctx.countries), [ctx]);

  const qParam = Number(params.get('q'));
  const q = Number.isInteger(qParam) && qParam >= 1 && qParam <= QUESTION_COUNT ? qParam : null;
  const view = params.get('loading') ? 'loading' : params.get('stop') === 'age' ? 'stop' : 'question';

  const pre = params.get('pre');
  const fresh = pre === null && params.get('q') === null && params.get('loading') === null && params.get('stop') === null;

  // 처음 브라우저에서 그릴 때 한 번: 저장된 답 + ?pre= 반영. 새로 시작이면 저장된 답을 쓰지 않는다.
  if (mounted && state === null) {
    let initial = fresh ? EMPTY_STATE : (loadQuiz() ?? EMPTY_STATE);
    const code = pre?.toUpperCase();
    const cur = initial.answers.q1 ?? { none: false, codes: [] };
    if (code && countries.some((c) => c.code === code) && !cur.codes.includes(code) && cur.codes.length < MAX_HEART_COUNTRIES) {
      initial = { ...initial, answers: { ...initial.answers, q1: { none: false, codes: [...cur.codes, code] } } };
    }
    setState(initial);
  }

  // 처음 한 번: 새로 시작이면 저장된 답을 지우고, ?pre=는 주소만 ?q=1로 정리한다 (SPEC 3.1)
  useEffect(() => {
    if (fresh) clearQuiz();
    if (fresh || pre !== null) router.replace(url(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 주소 검사: 아직 안 푼 질문으로 직접 들어오면 안 푼 첫 질문으로 보낸다 (SPEC 3.1)
  useEffect(() => {
    if (!state) return;
    const first = firstUnanswered(state.answers, ctx);
    if (view === 'loading') { if (first !== null) router.replace(url(first)); return; }
    if (view === 'stop') {
      if (maxAge === null || state.answers.q2 === undefined || state.answers.q2 <= maxAge) router.replace(url(2));
      return;
    }
    if (q === null) { if (params.get('pre') === null) router.replace(url(first ?? 1)); return; }
    if (!canEnter(q, state.answers, ctx)) router.replace(url(first ?? 1));
    else if (isSkipped(q, state.answers, ctx)) router.replace(url(nextQuestion(q, state.answers, ctx) === 'submit' ? q - 1 : (nextQuestion(q, state.answers, ctx) as number)));
  }, [state, q, view, ctx, maxAge, params, router]);

  // 답과 현재 질문 번호를 저장 (저장소가 막혀 있어도 화면은 그대로)
  useEffect(() => { if (state && q) saveQuiz({ answers: state.answers, q }); }, [state, q]);

  // 계산 중 화면: 결과 저장 요청 (TODO(4단계): 지금은 끝나지 않는다)
  useEffect(() => {
    if (view !== 'loading' || !state) return;
    let live = true;
    submitQuiz(state.answers).catch(() => live && setFailedAt(attempt));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, attempt]);

  const set = useCallback((patch: Partial<Answers>) => {
    setState((s) => (s ? { ...s, answers: pruneAnswers({ ...s.answers, ...patch }, ctx) } : s));
  }, [ctx]);

  if (!state) return <QuizSkeleton />;
  const { answers } = state;

  if (view === 'stop' && maxAge !== null && answers.q2 !== undefined && answers.q2 > maxAge) {
    return <StopAge maxAge={maxAge} onRetry={() => router.push(url(2))} />;
  }
  if (view === 'loading') {
    if (firstUnanswered(answers, ctx) !== null) return <QuizSkeleton />;
    return <Loading failed={failed} onRetry={() => setAttempt((n) => n + 1)} onBack={() => router.push(url(QUESTION_COUNT))} />;
  }
  if (q === null || !canEnter(q, answers, ctx) || isSkipped(q, answers, ctx)) return <QuizSkeleton />;

  const next = () => {
    if (q === 2 && maxAge !== null && answers.q2 !== undefined && answers.q2 > maxAge) return router.push('/test?q=2&stop=age');
    const n = nextQuestion(q, answers, ctx);
    if (n !== 'submit') return router.push(url(n));
    const first = firstUnanswered(answers, ctx);
    router.push(first !== null ? url(first) : '/test?loading=1');
  };
  const back = () => (q === 1 ? router.push('/') : router.push(url(prevQuestion(q, answers, ctx))));
  const restart = () => { clearQuiz(); setState(EMPTY_STATE); setConfirmOpen(false); router.push(url(1)); };

  const available = q >= 3 ? candidatesOf(answers, ctx).length : undefined;
  const props: QProps = { answers, countries, set, next, minAge, available };
  return (
    <QuizShell q={q} onBack={back} onRestart={() => setConfirmOpen(true)}>
      {q === 1 || q === 4 ? <QuestionCountry key={q} {...props} q={q} /> : null}
      {q === 2 ? <QuestionAge {...props} /> : null}
      {q === 3 ? <QuestionCompanion {...props} /> : null}
      {q === 5 || q === 7 || q === 10 || q === 11 ? <QuestionChoice key={q} {...props} q={q} /> : null}
      {q === 6 ? <QuestionBudget {...props} /> : null}
      {q === 8 ? <QuestionLanguage {...props} ctx={ctx} /> : null}
      {q === 9 ? <QuestionJob {...props} /> : null}
      {q === 12 ? <QuestionPriority {...props} ctx={ctx} /> : null}
      <ConfirmDialog
        open={confirmOpen} message={t('quiz.restart.confirm')} yes={t('quiz.restart.yes')} no={t('quiz.restart.no')}
        onYes={restart} onNo={() => setConfirmOpen(false)}
      />
    </QuizShell>
  );
}
