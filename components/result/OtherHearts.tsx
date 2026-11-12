import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Flag } from '@/components/ui/Flag';
import { FitMark } from '@/components/ui/FitMark';
import { CountryBadges } from './Badges';
import { t } from '@/lib/copy';
import type { ItemId, ReasonLine } from '@/lib/engine';
import { itemLabel, reasonSmall, reasonText } from '@/lib/result/text';
import type { StoredRanked, StoredResult } from '@/lib/result/types';

/** 처음부터 보이는 이유 줄 수. 나머지는 "이유 보기"를 누르면 펼쳐진다 */
const PREVIEW = 2;

/**
 * "마음에 둔 다른 나라" (SPEC 4.2): 카드로 뽑히지 않은 마음에 둔 나라마다 %와 이유를 보여 준다.
 * 이유는 결과에 이미 저장된 조건 줄(✗ → △ → ✓, 안 맞는 점이 먼저)을 그대로 쓴다. 다시 계산하지 않는다(규칙 1).
 * 처음엔 위 2줄만 보이고, 네이티브 <details>("이유 보기")로 나머지를 펼친다: hover를 쓰지 않아 휴대폰·키보드에서 된다.
 */
export function OtherHearts({ rows, countries }: { rows: StoredRanked[]; countries: StoredResult['countries'] }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="other-hearts-title" className="mt-5 border-t border-line pt-4">
      <h2 id="other-hearts-title" className="text-body font-extrabold text-navy">{t('result.otherHearts')}</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {rows.map((r) => <HeartRow key={r.code} row={r} country={countries[r.code]} />)}
      </ul>
    </section>
  );
}

function Line({ line, name }: { line: ReasonLine; name: string }) {
  return (
    <li className="flex items-start gap-2">
      <FitMark mark={line.mark} text={t(`mark.${line.mark}`)} small />
      <p className="min-w-0 flex-1 text-body text-navy">
        <span className="font-extrabold">{itemLabel(line)}</span> {reasonText(line, { country: name })}
        {reasonSmall(line) ? <span className="ml-1 text-caption text-text2">· {reasonSmall(line)}</span> : null}
      </p>
    </li>
  );
}

function Unknown({ id }: { id: ItemId }) {
  return (
    <li className="flex items-start gap-2">
      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-caption font-extrabold text-text3">?</span>
      <p className="min-w-0 flex-1 text-body text-text2"><span className="font-extrabold text-navy">{id === 'money' ? t('item.money') : t(`q12.opt.${id}`, {})}</span> {t('status.checking')}</p>
    </li>
  );
}

function HeartRow({ row, country }: { row: StoredRanked; country: StoredResult['countries'][string] | undefined }) {
  const name = country?.nameKo ?? row.code;
  const unknown = row.unknown ?? [];
  const shown = row.lines.slice(0, PREVIEW);
  const rest = row.lines.slice(PREVIEW);
  const more = rest.length > 0 || unknown.length > 0;
  return (
    <li className="rounded-card bg-subtle p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Flag code={row.code} />
        <Link href={`/countries/${row.code}`} className="text-body-l font-extrabold text-navy hover:underline">{name}</Link>
        <CountryBadges badges={row.badges} safety={!!country && country.safetyLevel !== 'normal'} />
        <span className="ml-auto text-h3 font-black text-aqua-dark">{row.pct}%</span>
      </div>
      <p className="mt-1 text-caption font-extrabold text-text2">{t('result.score', { total: row.itemCount, ok: row.okCount })}</p>
      <ul className="mt-3 flex flex-col gap-2">{shown.map((l, i) => <Line key={`${l.itemId}-${i}`} line={l} name={name} />)}</ul>
      {more ? (
        <details className="group mt-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 text-body font-extrabold text-navy [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{t('result.otherHearts.show')}</span>
            <span className="hidden group-open:inline">{t('result.otherHearts.hide')}</span>
            <ChevronDown aria-hidden="true" className="size-4 text-text3 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="flex flex-col gap-2 pb-2">
            {rest.map((l, i) => <Line key={`${l.itemId}-${i}`} line={l} name={name} />)}
            {unknown.map((id) => <Unknown key={id} id={id} />)}
          </ul>
        </details>
      ) : null}
      <p>
        <Link href={`/countries/${row.code}`} className="inline-flex min-h-11 items-center text-body font-extrabold text-navy underline underline-offset-4">{t('result.detailLink', { country: name })}</Link>
      </p>
    </li>
  );
}
