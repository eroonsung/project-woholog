'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Flag } from '@/components/ui/Flag';
import { t } from '@/lib/copy';
import { filterApps, type AppsIndexRow } from '@/lib/countries/appsIndex';

/** 나라별 필수 앱: 나라 검색 + 국기 카드. 카드를 누르면 나라 상세의 앱 칸(#apps)으로 간다 (D-130). */
export function AppsIndex({ rows }: { rows: AppsIndexRow[] }) {
  const [query, setQuery] = useState('');
  const shown = filterApps(rows, query);
  return (
    <div>
      <label className="block">
        <span className="sr-only">{t('apps.index.search')}</span>
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('apps.index.search')} autoComplete="off"
          className="h-12 w-full rounded-button border-[1.5px] border-line bg-white px-4 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100 lg:max-w-md"
        />
      </label>
      {shown.length === 0 ? (
        <p className="mt-4 rounded-card-lg bg-aqua-50 p-6 text-body-l font-extrabold text-navy" aria-live="polite">{t('apps.index.empty')}</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((r) => (
            <li key={r.code}>
              <Link href={`/countries/${r.code}#apps`} className="flex min-h-11 flex-col gap-2 rounded-card bg-subtle p-4 hover:bg-aqua-50">
                <Flag code={r.code} className="h-6 w-9" />
                <span className="text-body-l font-extrabold text-navy">{r.nameKo}</span>
                <span className="text-caption font-bold text-text2">{r.count > 0 ? t('apps.index.count', { n: r.count }) : t('apps.index.preparing')}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
