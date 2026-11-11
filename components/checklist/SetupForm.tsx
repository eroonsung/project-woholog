'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Flag } from '@/components/ui/Flag';
import { isValidDeparture, maxDeparture } from '@/lib/checklist';
import { t } from '@/lib/copy';

export interface CountryOption { code: string; nameKo: string }

/**
 * 시작 화면 (S14, SPEC 10.1): 1 나라 고르기(이름 검색) + 2 출국 예정일(오늘 이후 ~ 3년 안) 또는 "아직 몰라요".
 * 나라는 ?c=로 미리 골라 올 수 있다. 누르면 onStart(나라, 날짜|null)를 부른다.
 */
export function SetupForm({ options, preselect, today, onStart }: { options: CountryOption[]; preselect: string | null; today: string; onStart: (code: string, date: string | null) => void }) {
  const [code, setCode] = useState<string | null>(preselect);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [touched, setTouched] = useState(false);

  const chosen = options.find((o) => o.code === code) ?? null;
  const dateOk = unknown || isValidDeparture(date, today);
  const shown = options.filter((o) => o.nameKo.includes(query.trim()));
  const step = 'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-aqua text-body font-extrabold text-navy';

  return (
    <form
      noValidate className="flex flex-col gap-6"
      onSubmit={(e) => { e.preventDefault(); setTouched(true); if (chosen && dateOk) onStart(chosen.code, unknown ? null : date); }}
    >
      <section aria-labelledby="setup-country" className="flex flex-col gap-3">
        <h2 id="setup-country" className="flex items-center gap-3 text-h3 text-navy"><span className={step}>1</span>{t('checklist.setup.country')}</h2>
        {chosen ? (
          <div className="flex items-center justify-between gap-3 rounded-card border-[1.5px] border-aqua-dark bg-aqua-100 px-4 py-3">
            <span className="flex items-center gap-3 text-body-l font-extrabold text-navy"><Flag code={chosen.code} className="h-5 w-7" />{chosen.nameKo}<Check aria-hidden="true" className="size-5 text-aqua-dark" /></span>
            <button type="button" onClick={() => { setCode(null); setQuery(''); }} className="inline-flex min-h-11 items-center text-body font-extrabold text-aqua-dark underline underline-offset-4">{t('checklist.setup.change')}</button>
          </div>
        ) : (
          <div className="rounded-card bg-subtle p-3">
            <label className="block">
              <span className="sr-only">{t('checklist.setup.search')}</span>
              <input
                type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('checklist.setup.search')} autoComplete="off"
                className="h-12 w-full rounded-button border-[1.5px] border-line bg-white px-4 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100"
              />
            </label>
            {shown.length === 0 ? <p className="mt-3 text-body text-text2">{t('checklist.setup.noMatch')}</p> : (
              <ul className="mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {shown.map((o) => (
                  <li key={o.code}>
                    <button type="button" onClick={() => setCode(o.code)} className="flex min-h-11 w-full items-center gap-2 rounded-button bg-white px-3 text-left text-body font-extrabold text-navy hover:bg-aqua-50">
                      <Flag code={o.code} />{o.nameKo}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="setup-date" className="flex flex-col gap-3">
        <h2 id="setup-date" className="flex items-center gap-3 text-h3 text-navy"><span className={step}>2</span>{t('checklist.setup.date')}</h2>
        <input
          type="date" value={unknown ? '' : date} disabled={unknown} min={today} max={maxDeparture(today)} aria-label={t('checklist.setup.date')}
          aria-invalid={touched && !dateOk} aria-describedby="setup-date-hint"
          onChange={(e) => setDate(e.target.value)}
          className="h-12 w-full rounded-button border-[1.5px] border-line bg-white px-4 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100 disabled:bg-subtle disabled:text-text3"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p id="setup-date-hint" className={`text-caption ${touched && !dateOk ? 'font-extrabold text-coral-dark' : 'text-text2'}`}>{touched && !dateOk ? t('checklist.err.date') : t('checklist.setup.dateHint')}</p>
          <button
            type="button" aria-pressed={unknown} onClick={() => setUnknown((v) => !v)}
            className={`inline-flex min-h-11 items-center rounded-pill px-4 text-body font-extrabold ${unknown ? 'bg-aqua-100 text-aqua-dark ring-[1.5px] ring-aqua-dark' : 'bg-subtle text-text2'}`}
          >{t('checklist.setup.unknown')}</button>
        </div>
      </section>

      <p className="rounded-card bg-aqua-50 p-4 text-body text-navy">{t('checklist.setup.tip')}</p>

      <button
        type="submit" disabled={!chosen || (touched && !dateOk)}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover disabled:cursor-not-allowed disabled:opacity-50"
      >{t('checklist.setup.cta')}<ArrowRight aria-hidden="true" className="size-4" /></button>
    </form>
  );
}
