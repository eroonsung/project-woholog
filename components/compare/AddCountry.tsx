'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Flag } from '@/components/ui/Flag';
import { compareHref, MAX_COMPARE } from '@/lib/compare/parse';
import type { CompareOption } from '@/lib/compare/build';
import { t } from '@/lib/copy';

/**
 * 나라 추가 (SPEC 6장): 이름으로 찾아 누르면 주소가 바뀐다(링크). 최대 3개.
 * 고른 나라가 2개보다 적으면 처음부터 펼쳐 둔다.
 */
export function AddCountry({ options, selected, base, openAtStart }: { options: CompareOption[]; selected: string[]; base: string; openAtStart: boolean }) {
  const [open, setOpen] = useState(openAtStart);
  const [query, setQuery] = useState('');
  const full = selected.length >= MAX_COMPARE;
  const shown = options.filter((o) => !selected.includes(o.code) && o.nameKo.includes(query.trim()));

  return (
    <div>
      <button
        type="button" onClick={() => setOpen((v) => !v)} disabled={full} aria-expanded={open && !full} aria-controls="compare-add-panel"
        className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-aqua-100 px-4 text-body font-extrabold text-aqua-dark disabled:opacity-60"
      >
        {t('compare.add')} <span className="font-medium text-text2">{full ? t('compare.add.max') : t('compare.add.limit')}</span>
      </button>
      {open && !full ? (
        <div id="compare-add-panel" className="mt-3 rounded-card bg-subtle p-4">
          <label className="block">
            <span className="sr-only">{t('compare.add.search')}</span>
            <input
              type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('compare.add.search')} autoComplete="off"
              className="h-12 w-full rounded-button border-[1.5px] border-line bg-white px-4 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100"
            />
          </label>
          {shown.length === 0 ? (
            <p className="mt-3 text-body text-text2">{t('compare.add.empty')}</p>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((o) => (
                <li key={o.code}>
                  <Link href={compareHref(base, [...selected, o.code])} className="flex min-h-11 items-center gap-2 rounded-button bg-white px-3 text-body font-extrabold text-navy hover:bg-aqua-50">
                    <Flag code={o.code} />
                    {o.nameKo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
