import Link from 'next/link';
import { CountryList } from '@/components/countries/CountryList';
import { FilterBar } from '@/components/countries/FilterBar';
import { listHref, DEFAULT_QUERY, type ListQuery, type ListRow } from '@/lib/countries/list';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';

/** 29개국 한눈에 비교 (SPEC 7장, S12). 결과가 없으면 안내 + 필터 초기화. */
export function CountriesView({ rows, total, q, verifiedAt }: { rows: ListRow[]; total: number; q: ListQuery; verifiedAt: string | null }) {
  const available = rows.filter((r) => !r.comingSoon).length;
  return (
    <main className="mx-auto w-full max-w-content px-5 pb-28 pt-6 lg:px-10">
      <h1 className="text-h1 text-navy">{t('countries.title')}</h1>
      <p className="mt-2 text-body text-text2">{t('countries.sub', { date: verifiedAt ? formatKoDate(verifiedAt) : t('status.checking') })}</p>

      <div className="mt-6"><FilterBar q={q} /></div>
      <p className="mt-4 text-body font-extrabold text-navy" aria-live="polite">{t('countries.count', { total, n: available })}</p>

      <div className="mt-3">
        {rows.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-card-lg bg-aqua-50 p-6">
            <p className="text-body-l font-extrabold text-navy">{t('countries.empty')}</p>
            <Link href={listHref(DEFAULT_QUERY)} className="inline-flex min-h-11 items-center rounded-button bg-navy px-5 font-extrabold text-white">{t('countries.reset')}</Link>
          </div>
        ) : <CountryList rows={rows} />}
      </div>
      <p className="mt-6 text-caption text-text3">{t('disclaimer.short')}</p>
    </main>
  );
}
