import Link from 'next/link';
import { t } from '@/lib/copy';
import { listHref, REGIONS, SORTS, type ListQuery } from '@/lib/countries/list';

/**
 * 29개국 비교표 위쪽: 지역 · 영어권만 · 내 나이 · 정렬 (SPEC 7장). 모두 링크/폼(GET)이라 주소가 바뀌고, 새로고침·공유해도 같은 화면이 나온다.
 */
const chip = 'inline-flex min-h-11 items-center rounded-pill px-4 text-body font-extrabold';
const on = 'bg-aqua-100 text-aqua-dark ring-[1.5px] ring-aqua-dark';
const off = 'bg-white text-text2 hover:bg-aqua-50';

export function FilterBar({ q }: { q: ListQuery }) {
  return (
    <div className="flex flex-col gap-3 rounded-card-lg bg-subtle p-4">
      <nav aria-label={t('countries.filter.region')} className="flex flex-wrap gap-2">
        <Link href={listHref({ ...q, region: null })} aria-current={q.region === null ? 'true' : undefined} className={`${chip} ${q.region === null ? on : off}`}>{t('countries.filter.all')}</Link>
        {REGIONS.map((r) => (
          <Link key={r} href={listHref({ ...q, region: r })} aria-current={q.region === r ? 'true' : undefined} className={`${chip} ${q.region === r ? on : off}`}>{t(`countries.region.${r}`)}</Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={listHref({ ...q, english: !q.english })} aria-current={q.english ? 'true' : undefined} className={`${chip} ${q.english ? on : off}`}>{t('countries.filter.english')}</Link>
        <form method="get" action="/countries" className="flex flex-wrap items-center gap-2">
          {q.sort !== 'name' ? <input type="hidden" name="sort" value={q.sort} /> : null}
          {q.region ? <input type="hidden" name="region" value={q.region} /> : null}
          {q.english ? <input type="hidden" name="english" value="1" /> : null}
          <label className="flex items-center gap-2 text-body font-extrabold text-navy">
            {t('countries.filter.ageLabel')}
            <input
              type="number" name="age" min={1} max={99} inputMode="numeric" defaultValue={q.age ?? ''}
              className="h-11 w-20 rounded-button border-[1.5px] border-line bg-white px-3 text-body text-navy outline-none focus:border-aqua-dark focus:ring-[3px] focus:ring-aqua-100"
            />
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center rounded-button bg-navy px-4 text-body font-extrabold text-white">{t('countries.filter.ageApply')}</button>
          {q.age !== null ? <Link href={listHref({ ...q, age: null })} className="inline-flex min-h-11 items-center text-body font-extrabold text-navy underline underline-offset-4">{t('countries.filter.age', { age: q.age })} ×</Link> : null}
        </form>
      </div>

      <nav aria-label={t('countries.sort')} className="flex flex-wrap items-center gap-2">
        <span className="text-body font-extrabold text-text2">{t('countries.sort')}</span>
        {SORTS.map((s) => (
          <Link key={s} href={listHref({ ...q, sort: s })} aria-current={q.sort === s ? 'true' : undefined} className={`${chip} ${q.sort === s ? on : off}`}>{t(`countries.sort.${s}`)}</Link>
        ))}
      </nav>
    </div>
  );
}
