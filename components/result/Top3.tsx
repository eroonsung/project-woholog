import Link from 'next/link';
import { Flag } from '@/components/ui/Flag';
import { FitMark } from '@/components/ui/FitMark';
import { CountryBadges } from './Badges';
import { t } from '@/lib/copy';
import type { ReasonLine } from '@/lib/engine';
import { reasonText } from '@/lib/result/text';
import type { StoredRanked, StoredResult } from '@/lib/result/types';

/** TOP 3 줄의 한 줄 이유: ✓ 중 핵심 항목(언어·일·돈·어학원) 먼저, 없으면 중요한 것, 그것도 없으면 첫 줄 */
export function topReason(row: StoredRanked): ReasonLine | undefined {
  const oks = row.lines.filter((l) => l.mark === 'ok');
  const core = ['language', 'work', 'money', 'study'];
  return [...oks].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'core' ? -1 : 1) || core.indexOf(a.itemId) - core.indexOf(b.itemId))[0] ?? row.lines[0];
}

/** 카드 나라를 뺀 상위 3개. 같은 %이면 엔진이 준 순서 그대로(다시 정렬하지 않음, SPEC 4.5) */
export function Top3({ rows, countries, titleKey }: { rows: StoredRanked[]; countries: StoredResult['countries']; titleKey: string }) {
  return (
    <section aria-labelledby="top3-title" className="rounded-card-lg bg-subtle p-5">
      <h2 id="top3-title" className="mb-4 text-h3 text-navy">{t(titleKey)}</h2>
      <ol className="flex flex-col gap-3">
        {rows.map((row, i) => {
          const c = countries[row.code];
          const line = topReason(row);
          return (
            <li key={row.code} className="rounded-card bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-pill bg-aqua-100 px-2 py-0.5 text-caption font-extrabold text-aqua-dark">{t('result.rank', { n: i + 1 })}</span>
                <Flag code={row.code} />
                <Link href={`/countries/${row.code}`} className="text-body-l font-extrabold text-navy hover:underline">{c?.nameKo ?? row.code}</Link>
                <CountryBadges badges={row.badges} safety={!!c && c.safetyLevel !== 'normal'} />
                <span className="ml-auto text-h3 font-black text-aqua-dark">{row.pct}%</span>
              </div>
              {line ? <p className="mt-2 text-body text-text2">{reasonText(line, { country: c?.nameKo ?? row.code })}</p> : null}
              <ul aria-hidden="true" className="mt-2 flex gap-1">
                {row.items.map((item, k) => <li key={`${item.id}-${k}`}><FitMark mark={item.mark} text="" small /></li>)}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
