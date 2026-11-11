import Link from 'next/link';
import { X } from 'lucide-react';
import { ScrollFrame } from '@/components/compare/ScrollFrame';
import { CountryBadges } from '@/components/result/Badges';
import { FitMark } from '@/components/ui/FitMark';
import { Flag } from '@/components/ui/Flag';
import { ROW_IDS, type Cell, type CompareCountry } from '@/lib/compare/build';
import { fitTags, type FitView } from '@/lib/compare/fit';
import { t } from '@/lib/copy';

/**
 * 나란히 비교 표 (SPEC 6장). 모바일은 첫 열(항목 이름)을 고정하고 표 안에서만 가로로 스크롤한다.
 * fit이 있으면(/r/[id]/compare) 맨 위에 내 결과의 %와 ✓△✗ 줄을 같이 보여 준다.
 */
const headCell = 'px-3 py-4 text-left align-top';
const labelCell = 'sticky left-0 z-10 bg-white px-3 py-4 text-left align-top text-body font-extrabold text-navy';
const valueCell = 'px-3 py-4 align-top text-body text-navy';

function CellView({ cell }: { cell: Cell }) {
  return (
    <>
      {cell.checking ? (
        <span className="inline-flex rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2">{cell.text}</span>
      ) : (
        <span className="font-bold">{cell.text}</span>
      )}
      {cell.stale ? <span className="ml-2 inline-flex rounded-pill bg-coral-50 px-2 py-0.5 text-caption font-extrabold text-coral-dark">{t('status.stale')}</span> : null}
      {cell.extra.map((line) => <p key={line} className="mt-1 text-caption text-text2">{line}</p>)}
    </>
  );
}

export function CompareTable({ countries, fit, removeHref }: { countries: CompareCountry[]; fit?: FitView; removeHref: (code: string) => string }) {
  const hl = (code: string) => {
    const f = fit?.byCode[code];
    return f && 'pct' in f && f.best ? 'bg-aqua-50' : '';
  };

  return (
    <ScrollFrame hint={t('compare.scrollHint')}>
      <table className="w-max table-fixed border-collapse lg:w-full">
        <caption className="sr-only">{t('compare.title')}</caption>
        <colgroup>
          <col className="w-28 lg:w-40" />
          {countries.map((c) => <col key={c.code} className="w-56 lg:w-auto" />)}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={`${labelCell} text-caption font-extrabold text-text2`}>{t('compare.corner')}</th>
            {countries.map((c) => {
              const f = fit?.byCode[c.code];
              const fc = f && 'pct' in f ? f : null;
              return (
                <th key={c.code} scope="col" className={`${headCell} ${hl(c.code)}`}>
                  <div className="flex min-h-6 flex-wrap gap-1">
                    {fc ? fitTags(fc).map((tag) => <span key={tag} className="rounded-pill bg-white px-2 py-0.5 text-caption font-extrabold text-aqua-dark">{tag}</span>) : null}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-h3 font-extrabold text-navy">
                      <Flag code={c.code} className="h-5 w-7" />
                      <Link href={`/countries/${c.code}`} className="underline-offset-4 hover:underline">{c.nameKo}</Link>
                    </span>
                    <Link href={removeHref(c.code)} aria-label={t('compare.remove', { country: c.nameKo })} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text2 hover:bg-subtle">
                      <X aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                  {fc ? (
                    <div className="mt-2">
                      <p className="text-h2 font-black text-navy">{t('compare.fit', { pct: fc.pct })}</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-pill bg-subtle" aria-hidden="true"><div className="h-full rounded-pill bg-coral" style={{ width: `${fc.pct}%` }} /></div>
                      <p className="mt-1 text-caption text-text2">{t('result.score', { ok: fc.okCount, total: fc.itemCount })}</p>
                    </div>
                  ) : f && 'blocked' in f ? (
                    <p className="mt-2 text-body text-text2">{f.blocked}</p>
                  ) : fit ? (
                    <p className="mt-2 text-body text-text2">{t('compare.fit.none')}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1"><CountryBadges badges={fc?.badges ?? []} safety={c.safety} /></div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {fit && fit.rows.length > 0 ? (
            <>
              <tr><th scope="rowgroup" colSpan={countries.length + 1} className="sticky left-0 bg-subtle px-3 py-2 text-left text-caption font-extrabold text-text2">{t('compare.fit.title')}</th></tr>
              {fit.rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={labelCell}>{row.label}</th>
                  {countries.map((c) => {
                    const v = row.cells[c.code];
                    return (
                      <td key={c.code} className={`${valueCell} ${hl(c.code)}`}>
                        {v ? (
                          <span className="flex items-start gap-2"><FitMark mark={v.mark} text={row.label} small /><span className="text-body">{v.text}</span></span>
                        ) : <span className="inline-flex rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2">{t('status.checking')}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr><th scope="rowgroup" colSpan={countries.length + 1} className="sticky left-0 bg-subtle px-3 py-2 text-left text-caption font-extrabold text-text2">{t('compare.facts.title')}</th></tr>
            </>
          ) : null}
          {ROW_IDS.map((id) => (
            <tr key={id}>
              <th scope="row" className={labelCell}>{t(`compare.row.${id}`)}</th>
              {countries.map((c) => <td key={c.code} className={`${valueCell} ${hl(c.code)}`}><CellView cell={c.cells[id]} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollFrame>
  );
}
