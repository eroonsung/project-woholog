import Link from 'next/link';
import { CompareToggle } from '@/components/compare/CompareToggle';
import { CountryBadges } from '@/components/result/Badges';
import { Flag } from '@/components/ui/Flag';
import type { Cell } from '@/lib/compare/build';
import type { ListRow } from '@/lib/countries/list';
import { t } from '@/lib/copy';

/** 29개국 비교표 본문: 웹(1024px↑)은 표, 모바일은 카드 (S12). 미발효 나라는 흐리게 + "곧 열려요", 줄마다 "비교에 담기". */
const COLS = ['country', 'age', 'stay', 'selection', 'money', 'wage', 'study', 'work'] as const;

function Val({ cell }: { cell: Cell }) {
  return cell.checking
    ? <span className="inline-flex rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2">{cell.text}</span>
    : <span className="font-bold">{cell.text}</span>;
}

function Name({ r }: { r: ListRow }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Flag code={r.code} className="h-5 w-7" />
      <Link href={`/countries/${r.code}`} className="text-body-l font-extrabold text-navy underline-offset-4 hover:underline">{r.nameKo}</Link>
      {r.comingSoon ? <span className="inline-flex rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2">{t('badge.soon')}</span> : null}
      <CountryBadges badges={[]} safety={r.safety} />
    </span>
  );
}

export function CountryList({ rows }: { rows: ListRow[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-card-lg border border-line bg-white lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">{t('countries.title')}</caption>
          <colgroup>
            <col className="w-14" /><col className="w-44" /><col className="w-28" /><col className="w-32" /><col className="w-28" /><col className="w-28" /><col className="w-32" /><col className="w-28" /><col />
          </colgroup>
          <thead>
            <tr className="bg-subtle text-caption font-extrabold text-text2">
              <th scope="col" className="px-3 py-3"><span className="sr-only">{t('compare.toggle.add')}</span></th>
              {COLS.map((c) => <th key={c} scope="col" className="px-3 py-3">{t(`countries.col.${c}`)}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.code} className={r.comingSoon ? 'bg-subtle' : ''}>
                <td className="px-3 py-3 align-top">{r.comingSoon ? null : <CompareToggle code={r.code} nameKo={r.nameKo} compact />}</td>
                <th scope="row" className="px-3 py-3 text-left align-top font-normal"><Name r={r} /></th>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={r.cells.age} /></td>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={r.cells.stay} />{r.cells.stay.extra.map((x) => <p key={x} className="mt-1 text-caption text-text2">{x}</p>)}</td>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={r.cells.selection} />{r.cells.selection.extra.map((x) => <p key={x} className="mt-1 text-caption text-text2">{x}</p>)}</td>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={r.cells.money} /></td>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={r.cells.wage} /></td>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={r.cells.study} /></td>
                <td className="px-3 py-3 align-top text-body text-navy"><Val cell={{ ...r.cells.work, extra: [] }} />{r.cells.work.extra.map((x) => <p key={x} className="mt-1 text-caption text-text2">{x}</p>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 lg:hidden">
        {rows.map((r) => (
          <li key={r.code} className={`rounded-card-lg border border-line bg-white p-4 ${r.comingSoon ? 'bg-subtle' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <Name r={r} />
              {r.comingSoon ? null : <CompareToggle code={r.code} nameKo={r.nameKo} compact />}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-body text-navy">
              {([['age', 'age'], ['stay', 'stay'], ['selection', 'selection'], ['money', 'money'], ['wage', 'wage'], ['study', 'study']] as const).map(([id, col]) => (
                <div key={id}>
                  <dt className="text-caption font-extrabold text-text2">{t(`countries.col.${col}`)}</dt>
                  <dd className="mt-0.5"><Val cell={r.cells[id]} />{r.cells[id].extra.map((x) => <p key={x} className="text-caption text-text2">{x}</p>)}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-caption font-extrabold text-text2">{t('countries.col.work')}</dt>
                <dd className="mt-0.5"><Val cell={{ ...r.cells.work, extra: [] }} />{r.cells.work.extra.map((x) => <p key={x} className="text-caption text-text2">{x}</p>)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
