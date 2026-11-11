'use client';

import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { t } from '@/lib/copy';
import type { QuizCountry } from '@/lib/data/quizCountries';
import { InlineNotice } from './Shell';

const REGION_ORDER = ['north_america', 'asia', 'oceania', 'europe', 'south_america', 'middle_east'] as const;

/** 나라 칩 모음(Q1·Q4·동행자). 지역별로 묶고 이름으로 찾을 수 있다. max가 없으면 개수 제한 없음. */
export function CountryPicker({ countries, selected, max, onToggle, onClear, notice, label }: {
  countries: QuizCountry[]; selected: string[]; max?: number;
  onToggle: (code: string) => void; onClear: () => void; notice?: string | null; label: string;
}) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim();
    const shown = q ? countries.filter((c) => c.nameKo.includes(q)) : countries;
    return REGION_ORDER.map((region) => ({ region, items: shown.filter((c) => c.region === region) })).filter((g) => g.items.length > 0);
  }, [countries, query]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">{t('quiz.search')}</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text3" />
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('quiz.search')}
          className="h-13 w-full rounded-button border-thin border-line bg-subtle pl-12 pr-4 text-body-l text-navy placeholder:text-text3 focus:border-aqua-dark focus:bg-white"
        />
      </label>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-body text-text2">
          <strong className="font-extrabold text-aqua-dark">{t('quiz.selected', { n: selected.length })}</strong>{' '}
          {max ? t('quiz.selectedMax', { max }) : t('quiz.selectedMulti')}
        </p>
        <button type="button" onClick={onClear} disabled={selected.length === 0}
          className="min-h-11 px-1 text-caption font-bold text-text2 underline underline-offset-4 disabled:opacity-50">
          {t('quiz.clear')}
        </button>
      </div>
      <InlineNotice message={notice ?? null} />

      <div role="group" aria-label={label} className="mt-2 flex flex-col gap-6">
        {groups.length === 0 ? <p className="text-body text-text2">{t('quiz.noResult')}</p> : null}
        {groups.map(({ region, items }) => (
          <section key={region} aria-label={t(`region.${region}`)}>
            <h2 className="mb-2 text-caption font-bold text-text3">{t(`region.${region}`)}</h2>
            <div className="flex flex-wrap gap-2">
              {items.map((c) => {
                const on = selected.includes(c.code);
                return (
                  <button
                    key={c.code} type="button" aria-pressed={on} onClick={() => onToggle(c.code)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-button px-4 text-body font-bold transition-colors ${
                      on ? 'bg-aqua text-navy' : 'bg-subtle text-navy hover:bg-aqua-50'}`}
                  >
                    <span aria-hidden="true">{c.flag}</span>
                    {c.nameKo}
                    {c.safety ? <span className="rounded-pill bg-coral-50 px-2 text-caption font-extrabold text-coral-dark">{t('badge.safety')}</span> : null}
                    {on ? <Check aria-hidden="true" className="size-4" /> : null}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
