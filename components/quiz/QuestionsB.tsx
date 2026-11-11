'use client';

import { useEffect, useState } from 'react';
import type { EarnNeed, EnglishSkill, JobId, PriorityId } from '@/lib/engine';
import { t, hasCopy } from '@/lib/copy';
import { formatNumber } from '@/lib/format';
import { BUDGET, MAX_PRIORITIES } from '@/lib/quiz/config';
import { languageChips, priorityChips, type QuizContext } from '@/lib/quiz/steps';
import type { HeartReasonId, StudyId, WhenId } from '@/lib/quiz/types';
import { ChipToggle, ChoiceCards, NoneToggle, type ChoiceOption } from './Choices';
import { QuestionHeading, QuizActions, InlineNotice } from './Shell';
import type { QProps } from './QuestionsA';

const help = (q: number) => (hasCopy(`q${q}.help`) ? t(`q${q}.help`) : undefined);
const opts = <T extends string | number>(q: number, ids: readonly T[], withSub: boolean): ChoiceOption<T>[] =>
  ids.map((id) => ({ id, title: t(`q${q}.opt.${id}`), sub: withSub ? t(`q${q}.opt.${id}.sub`) : undefined }));

/** 하나만 고르는 질문 4개: Q5 출국 시기 · Q7 영어 · Q10 생활비 벌기 · Q11 어학원 */
export function QuestionChoice({ q, answers, set, next }: QProps & { q: 5 | 7 | 10 | 11 }) {
  const common = { label: t(`q${q}`) };
  let body;
  if (q === 5) body = <ChoiceCards {...common} options={opts<WhenId>(5, ['m3', 'm6', 'y1', 'unknown'], false)} value={answers.q5} onChange={(id) => set({ q5: id })} />;
  else if (q === 7) body = <ChoiceCards {...common} options={opts<EnglishSkill>(7, [0, 1, 2, 3], true)} value={answers.q7} onChange={(id) => set({ q7: id })} />;
  else if (q === 10) body = <ChoiceCards {...common} options={opts<EarnNeed>(10, ['must', 'partly', 'none'], true)} value={answers.q10} onChange={(id) => set({ q10: id })} />;
  else body = <ChoiceCards {...common} options={opts<StudyId>(11, ['none', 'm3', 'm6', 'over6'], false)} value={answers.q11} onChange={(id) => set({ q11: id })} />;
  const done = [answers.q5, answers.q7, answers.q10, answers.q11][[5, 7, 10, 11].indexOf(q)] !== undefined;
  return (
    <>
      <QuestionHeading title={t(`q${q}`)} help={help(q)} />
      {body}
      <QuizActions nextDisabled={!done} onNext={next} />
    </>
  );
}

/** Q6 예산 슬라이더. 기본값 그대로도 진행할 수 있다. 끝값은 "2,000만 원 이상". */
export function QuestionBudget({ answers, set, next }: QProps) {
  const value = answers.q6 ?? BUDGET.default;
  const label = value >= BUDGET.max ? t('q6.valueMax', { budget: formatNumber(value) }) : t('q6.value', { budget: formatNumber(value) });
  return (
    <>
      <QuestionHeading title={t('q6')} help={help(6)} />
      <div className="rounded-card-lg border-thin border-line bg-white p-8 text-center shadow-card">
        <p className="text-display text-navy" aria-live="polite">{label}</p>
        <input
          type="range" aria-label={t('q6.slider')} min={BUDGET.min} max={BUDGET.max} step={BUDGET.step} value={value}
          onChange={(e) => set({ q6: Number(e.target.value) })}
          className="mt-8 h-11 w-full accent-aqua-dark"
        />
        <div className="flex justify-between text-caption font-bold text-text3">
          <span>{t('q6.value', { budget: formatNumber(BUDGET.min) })}</span>
          <span>{t('q6.valueMax', { budget: formatNumber(BUDGET.max) })}</span>
        </div>
      </div>
      <p className="mt-6 rounded-card bg-aqua-50 p-5 text-body font-bold text-navy">{t('q6.hint')}</p>
      <QuizActions onNext={() => { if (answers.q6 === undefined) set({ q6: value }); next(); }} />
    </>
  );
}

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

/** Q8 다른 언어(후보 나라의 일자리 언어만) */
export function QuestionLanguage({ answers, ctx, set, next }: QProps & { ctx: QuizContext }) {
  const chips = languageChips(answers, ctx);
  const cur = answers.q8 ?? { none: false, languages: [] };
  return (
    <>
      <QuestionHeading title={t('q8')} help={help(8)} />
      <div role="group" aria-label={t('q8')} className="flex flex-wrap gap-2">
        {chips.map((lang) => (
          <ChipToggle key={lang} selected={cur.languages.includes(lang)} onClick={() => set({ q8: { none: false, languages: toggle(cur.languages, lang) } })}>
            {lang}
          </ChipToggle>
        ))}
      </div>
      <QuizActions
        nextDisabled={!(cur.none || cur.languages.length > 0)} onNext={next}
        secondary={<NoneToggle selected={cur.none} onClick={() => set({ q8: cur.none ? { none: false, languages: [] } : { none: true, languages: [] } })}>{t('btn.none')}</NoneToggle>}
      />
    </>
  );
}

const JOBS: JobId[] = ['cafe', 'retail', 'hotel', 'farm', 'office', 'care'];

/** Q9 희망 직군. "아직 몰라요"를 고르면 다른 선택이 지워진다. */
export function QuestionJob({ answers, set, next }: QProps) {
  const cur = answers.q9 ?? { unknown: false, jobs: [] };
  return (
    <>
      <QuestionHeading title={t('q9')} help={help(9)} />
      <div role="group" aria-label={t('q9')} className="flex flex-wrap gap-2">
        {JOBS.map((job) => (
          <ChipToggle key={job} selected={cur.jobs.includes(job)} onClick={() => set({ q9: { unknown: false, jobs: toggle(cur.jobs, job) } })}>
            {t(`q9.opt.${job}`)}
          </ChipToggle>
        ))}
        <ChipToggle selected={cur.unknown} onClick={() => set({ q9: cur.unknown ? { unknown: false, jobs: [] } : { unknown: true, jobs: [] } })}>
          {t('q9.opt.unknown')}
        </ChipToggle>
      </div>
      <QuizActions nextDisabled={!(cur.unknown || cur.jobs.length > 0)} onNext={next} />
    </>
  );
}

const HEARTS: HeartReasonId[] = ['culture', 'learn_language', 'know_someone'];

/** Q12 중요한 것(최대 3). 후보가 모두 같은 표시인 칩은 숨긴다. Q1에서 나라를 골랐을 때만 "마음 이유"를 보여 준다. */
export function QuestionPriority({ answers, ctx, set, next }: QProps & { ctx: QuizContext }) {
  const chips = priorityChips(answers, ctx);
  const cur = answers.q12 ?? { unknown: false, priorities: [], hearts: [] };
  const full = cur.priorities.length >= MAX_PRIORITIES;
  const hasHeart = !!answers.q1 && !answers.q1.none && answers.q1.codes.length > 0;
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(id);
  }, [notice]);

  const pick = (id: PriorityId) => {
    if (cur.priorities.includes(id)) return set({ q12: { ...cur, unknown: false, priorities: cur.priorities.filter((p) => p !== id) } });
    if (full) return setNotice(t('q12.full'));
    set({ q12: { ...cur, unknown: false, priorities: [...cur.priorities, id] } });
  };

  return (
    <>
      <QuestionHeading title={t('q12')} help={help(12)} />
      <InlineNotice message={notice ?? (full ? t('q12.full') : null)} />
      <div role="group" aria-label={t('q12')} className="flex flex-wrap gap-2">
        {chips.map((id) => (
          <ChipToggle key={id} selected={cur.priorities.includes(id)} disabled={full && !cur.priorities.includes(id)} onClick={() => pick(id)}>
            {t(`q12.opt.${id}`)}
          </ChipToggle>
        ))}
      </div>
      {hasHeart ? (
        <section className="mt-8 rounded-card bg-subtle p-5" aria-label={t('q12.heartLabel')}>
          <h2 className="text-body font-extrabold text-navy">{t('q12.heartLabel')}</h2>
          <p className="mb-3 text-caption text-text2">{t('q12.heartLabel.help')}</p>
          <div className="flex flex-wrap gap-2">
            {HEARTS.map((h) => (
              <ChipToggle key={h} selected={cur.hearts.includes(h)} onClick={() => set({ q12: { ...cur, hearts: toggle(cur.hearts, h) } })}>
                {t(`q12.heart.${h}`)}
              </ChipToggle>
            ))}
          </div>
        </section>
      ) : null}
      <QuizActions
        nextLabel={t('btn.seeResult')} nextDisabled={!(cur.unknown || cur.priorities.length > 0)} onNext={next}
        secondary={<NoneToggle selected={cur.unknown} onClick={() => set({ q12: { ...cur, unknown: !cur.unknown, priorities: [] } })}>{t('q12.opt.unknown')}</NoneToggle>}
      />
    </>
  );
}
