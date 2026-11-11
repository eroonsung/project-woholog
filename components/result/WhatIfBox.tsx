import { t } from '@/lib/copy';
import { formatNumber } from '@/lib/format';
import type { WhatIfRow } from '@/lib/engine';
import type { StoredResult } from '@/lib/result/types';

/** "이렇게 바꾸면": 답을 하나만 바꿨을 때 % 변화 (엔진이 돌려준 제안만, SPEC 4.2). 낮은 %이면 앞에 "딱 맞는 나라가 없어요" 안내. */
export function WhatIfBox({ rows, countries, allLow }: { rows: WhatIfRow[]; countries: StoredResult['countries']; allLow: boolean }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="whatif-title" className="mt-4 rounded-card bg-aqua-50 p-4">
      <h2 id="whatif-title" className="text-body font-extrabold text-aqua-dark">{t('result.whatIf.title')}</h2>
      {allLow ? <p className="mt-1 text-body text-navy">{t('result.allLow')}</p> : null}
      <ul className="mt-2 flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.change} className="text-body-l font-extrabold text-navy">
            {t('result.whatIf.row', {
              change: t(`result.whatIf.change.${row.change}`, Object.fromEntries(Object.entries(row.params).map(([k, v]) => [k, typeof v === 'number' ? formatNumber(v) : String(v)]))),
              country: countries[row.code]?.nameKo ?? row.code, from: row.from, to: row.to,
            })}
          </li>
        ))}
      </ul>
    </section>
  );
}
