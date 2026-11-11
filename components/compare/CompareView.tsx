import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddCountry } from '@/components/compare/AddCountry';
import { CompareTable } from '@/components/compare/CompareTable';
import { ReportLink } from '@/components/report/ReportLink';
import { Flag } from '@/components/ui/Flag';
import type { CompareCountry, CompareOption } from '@/lib/compare/build';
import type { FitView } from '@/lib/compare/fit';
import { compareHref } from '@/lib/compare/parse';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';

/**
 * 나란히 비교 화면 몸통 (SPEC 6장, S08). /compare와 /r/[id]/compare가 함께 쓴다.
 * base = 이 화면의 주소(나라를 빼고 더하면 `?c=`만 바뀐다). fit이 있으면 내 결과의 %·✓△✗ 줄을 보여 준다.
 */
export function CompareView({ base, countries, options, fit, back, fxDate }: {
  base: string; countries: CompareCountry[]; options: CompareOption[]; fit?: FitView; back: { href: string; labelKey: string }; fxDate: string | null;
}) {
  const codes = countries.map((c) => c.code);
  const enough = countries.length >= 2;
  const removeHref = (code: string) => compareHref(base, codes.filter((c) => c !== code));

  return (
    <main className="mx-auto w-full max-w-content px-5 pb-12 pt-4 lg:px-10">
      <Link href={back.href} className="inline-flex min-h-11 items-center gap-2 text-body font-extrabold text-navy">
        <ArrowLeft aria-hidden="true" className="size-5" />
        {t(back.labelKey)}
      </Link>
      <h1 className="mt-2 text-h1 text-navy">{t('compare.title')}</h1>
      <p className="mt-2 text-body text-text2">{t('compare.sub')}</p>

      <div className="mt-6 flex flex-col gap-4">
        {!enough ? (
          <section aria-labelledby="compare-pick" className="rounded-card-lg bg-aqua-50 p-5">
            <h2 id="compare-pick" className="text-h3 text-navy">{t('compare.pick.title')}</h2>
            {countries.length === 1 ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1 text-body font-extrabold text-navy">
                <Flag code={countries[0]!.code} />
                {countries[0]!.nameKo}
                <Link href={removeHref(countries[0]!.code)} aria-label={t('compare.remove', { country: countries[0]!.nameKo })} className="inline-flex size-9 items-center justify-center rounded-full text-text2 hover:bg-subtle">×</Link>
              </p>
            ) : null}
            <div className="mt-4"><AddCountry options={options} selected={codes} base={base} openAtStart /></div>
          </section>
        ) : (
          <AddCountry options={options} selected={codes} base={base} openAtStart={false} />
        )}
        {enough ? <CompareTable countries={countries} fit={fit} removeHref={removeHref} /> : null}
      </div>

      {enough ? (
        <div className="mt-6 flex flex-col gap-2 text-caption text-text3">
          {fxDate ? <p>{t('fx.line', { date: formatKoDate(fxDate) })}</p> : null}
          <p className="flex flex-wrap items-center gap-x-3">
            <ReportLink screen="compare" className="inline-flex min-h-11 items-center underline underline-offset-4">{t('source.report')}</ReportLink>
          </p>
          <p>{t('disclaimer.result')}</p>
        </div>
      ) : null}
    </main>
  );
}
