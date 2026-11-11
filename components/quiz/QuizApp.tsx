'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { maxAgeOf, type ScoringConfig } from '@/lib/engine';
import type { QuizCountry } from '@/lib/data/quizCountries';
import { MAX_HEART_COUNTRIES, MIN_LOADING_MS, QUESTION_COUNT } from '@/lib/quiz/config';
import { clearQuiz, loadQuiz, saveQuiz } from '@/lib/quiz/state';
import {
  candidatesOf, canEnter, firstUnanswered, isSkipped, nextQuestion, prevQuestion, pruneAnswers, type QuizContext,
} from '@/lib/quiz/steps';
import { submitQuiz, SubmitError } from '@/lib/quiz/submit';
import { EMPTY_STATE, type Answers, type QuizState } from '@/lib/quiz/types';
import { t } from '@/lib/copy';
import { markMine } from '@/lib/mine';
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
  const [failure, setFailure] = useState<{ attempt: number; rate: boolean } | null>(null); // 실패한 시도 번호와 이유
  const [attempt, setAttempt] = useState(0);
  const failed = failure?.attempt === attempt;
  const request = useRef<{ attempt: number; started: number; promise: ReturnType<typeof submitQuiz> } | null>(null);
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

  // 질문이 바뀌면(다음·이전·화면 전환) 맨 위로: 긴 질문(Q4) 뒤에 Q5의 헤더가 잘려 보이지 않게 (D-130)
  useEffect(() => { window.scrollTo(0, 0); }, [q, view]);

  // 답과 현재 질문 번호를 저장 (저장소가 막혀 있어도 화면은 그대로)
  useEffect(() => { if (state && q) saveQuiz({ answers: state.answers, q }); }, [state, q]);

  // 계산 중 화면: 결과 저장 요청 (SPEC 3.3). 최소 1.2초는 보여 주고, 성공하면 답을 지우고 /r/[id]로 replace 이동한다.
  // 시도마다 요청을 한 번만 보낸다(개발 모드에서 효과가 두 번 실행돼도 같은 요청을 이어받는다).
  useEffect(() => {
    if (view !== 'loading' || !state) return;
    if (request.current?.attempt !== attempt) {
      request.current = { attempt, started: Date.now(), promise: submitQuiz(state.answers) };
    }
    const { started, promise } = request.current;
    let live = true;
    promise
      .then(async ({ id }) => {
        const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - started));
        if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
        if (!live) return;
        clearQuiz();
        markMine(id); // 이 브라우저에서 만든 결과 표시(D-132). 저장소가 막혀도 이동은 계속
        router.replace(`/r/${id}`);
      })
      .catch((error: unknown) => {
        if (!live) return;
        if (error instanceof SubmitError && error.kind === 'invalid' && error.question) return router.replace(url(error.question)); // 잘못된 답: 그 질문으로
        setFailure({ attempt, rate: error instanceof SubmitError && error.kind === 'rate' });
      });
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
    return <Loading failed={failed} rateLimited={failed && failure?.rate === true} onRetry={() => setAttempt((n) => n + 1)} onBack={() => router.push(url(QUESTION_COUNT))} />;
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
