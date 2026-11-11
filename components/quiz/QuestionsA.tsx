'use client';

import { useEffect, useState } from 'react';
import { Users, User, Check } from 'lucide-react';
import { t, hasCopy } from '@/lib/copy';
import type { QuizCountry } from '@/lib/data/quizCountries';
import { AGE_MAX, MAX_HEART_COUNTRIES } from '@/lib/quiz/config';
import type { Answers, CountryAnswer } from '@/lib/quiz/types';
import { AgeCalculator } from './AgeCalculator';
import { AgeField } from './AgeField';
import { NoneToggle } from './Choices';
import { CountryPicker } from './CountryPicker';
import { QuestionHeading, QuizActions } from './Shell';

export interface QProps {
  answers: Answers;
  countries: QuizCountry[];
  set: (patch: Partial<Answers>) => void;
  next: () => void;
  minAge: number;
  /** 지금까지 답으로 갈 수 있는 나라 수(Q3부터 표시) */
  available?: number;
}

const EMPTY: CountryAnswer = { none: false, codes: [] };
const help = (q: number) => (hasCopy(`q${q}.help`) ? t(`q${q}.help`) : undefined);

/** 나라 고르기 공통 동작: "없어요"를 고르면 나라를 지우고, 나라를 고르면 "없어요"를 푼다. max가 있으면 넘길 때 안내. */
function useCountryAnswer(value: CountryAnswer | undefined, onChange: (v: CountryAnswer) => void, max?: number) {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(id);
  }, [notice]);
  const cur = value ?? EMPTY;
  return {
    cur, notice,
    toggle: (code: string) => {
      if (cur.codes.includes(code)) return onChange({ none: false, codes: cur.codes.filter((c) => c !== code) });
      if (max !== undefined && cur.codes.length >= max) return setNotice(t('quiz.maxCountries', { max }));
      onChange({ none: false, codes: [...cur.codes, code] });
    },
    clear: () => onChange({ none: false, codes: [] }),
    toggleNone: () => onChange(cur.none ? EMPTY : { none: true, codes: [] }),
  };
}

const answered = (v: CountryAnswer) => v.none || v.codes.length > 0;

/** Q1 마음에 둔 나라(최대 3) · Q4 다녀온 나라(제한 없음) */
export function QuestionCountry({ q, answers, countries, set, next, available }: QProps & { q: 1 | 4 }) {
  const key = q === 1 ? 'q1' : 'q4';
  const a = useCountryAnswer(answers[key], (v) => set({ [key]: v }), q === 1 ? MAX_HEART_COUNTRIES : undefined);
  return (
    <>
      <QuestionHeading q={q} title={t(`q${q}`)} help={help(q)} mode="multi" available={available} />
      <CountryPicker
        countries={countries} selected={a.cur.codes} max={q === 1 ? MAX_HEART_COUNTRIES : undefined}
        onToggle={a.toggle} onClear={a.clear} notice={a.notice} label={t(`q${q}`)}
      />
      <QuizActions
        nextDisabled={!answered(a.cur)} onNext={next}
        secondary={<NoneToggle selected={a.cur.none} onClick={a.toggleNone}>{t(q === 1 ? 'q1.none' : 'btn.none')}</NoneToggle>}
      />
    </>
  );
}

/** Q2 만 나이. 17 이하는 안내만 띄우고 막는다. 최대 나이 초과(나이 초과 화면)는 QuizApp이 처리한다. */
export function QuestionAge({ answers, set, next, minAge }: QProps) {
  // 계산기가 나이를 넣으면 나이 칸을 새 값으로 다시 그린다(key). 범위 밖이면 값은 비우고 글자만 보여 준다.
  const [applied, setApplied] = useState<{ nonce: number; text: string } | null>(null);
  const apply = (age: number) => {
    set({ q2: age >= minAge && age <= AGE_MAX ? age : undefined });
    setApplied((prev) => ({ nonce: (prev?.nonce ?? 0) + 1, text: String(age) }));
  };
  return (
    <>
      <QuestionHeading q={2} title={t('q2')} help={help(2)} />
      <AgeField
        key={applied?.nonce ?? 0} initialText={applied?.text} value={answers.q2}
        onChange={(v) => set({ q2: v })} label={t('q2')} minAge={minAge}
      />
      <AgeCalculator onApply={apply} />
      <QuizActions nextDisabled={answers.q2 === undefined} onNext={next} />
    </>
  );
}

/** Q3 누구랑. "혼자"가 아니면 동행자 나이 + 동행자가 다녀온 나라를 펼친다. */
export function QuestionCompanion({ answers, countries, set, next, minAge, available }: QProps) {
  const q3 = answers.q3;
  const together = q3?.together ?? false;
  const companion = useCountryAnswer(q3?.companionVisited, (v) => set({ q3: { together: true, companionAge: q3?.companionAge, companionVisited: v } }));
  const options = [
    { together: false, key: 'solo', Icon: User },
    { together: true, key: 'together', Icon: Users },
  ] as const;
  const ready = !!q3 && (!q3.together || (q3.companionAge !== undefined && answered(companion.cur)));

  return (
    <>
      <QuestionHeading q={3} title={t('q3')} help={help(3)} mode="single" available={available} />
      <div role="radiogroup" aria-label={t('q3')} className="grid gap-3 lg:grid-cols-2">
        {options.map(({ together: value, key, Icon }) => {
          const on = q3 !== undefined && together === value;
          return (
            <button
              key={key} type="button" role="radio" aria-checked={on}
              onClick={() => set({ q3: value ? { together: true, companionAge: q3?.companionAge, companionVisited: q3?.companionVisited } : { together: false } })}
              className={`relative flex min-h-36 flex-col items-start gap-3 rounded-card-lg border-thin p-6 text-left ${
                on ? 'border-aqua-dark bg-aqua-100' : 'border-line bg-white hover:bg-subtle'}`}
            >
              <Icon aria-hidden="true" className="size-6 text-navy" />
              <span>
                <span className="block text-h3 text-navy">{t(`q3.opt.${key}`)}</span>
                <span className="block text-body text-text2">{t(`q3.opt.${key}.sub`)}</span>
              </span>
              {on ? <Check aria-hidden="true" className="absolute right-4 top-4 size-6 rounded-full bg-aqua-dark p-1 text-white" /> : null}
            </button>
          );
        })}
      </div>

      {q3?.together ? (
        <section className="mt-6 flex flex-col gap-6 rounded-card-lg bg-aqua-50 p-6">
          <div>
            <h2 className="mb-3 text-body-l font-extrabold text-navy">{t('q3.companionAge')}</h2>
            <AgeField size="sm" minAge={minAge} label={t('q3.companionAge')} value={q3.companionAge}
              onChange={(v) => set({ q3: { together: true, companionAge: v, companionVisited: q3.companionVisited } })} />
          </div>
          <div>
            <h2 className="mb-3 text-body-l font-extrabold text-navy">{t('q3.companionVisited')}</h2>
            <CountryPicker countries={countries} selected={companion.cur.codes} onToggle={companion.toggle}
              onClear={companion.clear} label={t('q3.companionVisited')} />
            <div className="mt-3">
              <NoneToggle selected={companion.cur.none} onClick={companion.toggleNone}>{t('btn.none')}</NoneToggle>
            </div>
          </div>
        </section>
      ) : null}
      <QuizActions nextDisabled={!ready} onNext={next} />
    </>
  );
}
