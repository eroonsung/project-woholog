import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Flag } from '@/components/ui/Flag';
import { CountryBadges } from './Badges';
import { ConditionList } from './ConditionList';
import { WhatIfBox } from './WhatIfBox';
import { t } from '@/lib/copy';
import { blockReasonText } from '@/lib/result/text';
import type { CardPlan } from '@/lib/result/card';
import type { StoredResult } from '@/lib/result/types';
import type { Answers } from '@/lib/quiz/types';

/**
 * 결과 맨 위 카드 (SPEC 4.2·4.3). 어떤 나라·어떤 제목을 보여 줄지는 lib/result/card.ts(pickCard)가 정했고,
 * 여기서는 그 계획과 저장된 값을 그대로 그린다. 홈(5.5단계)의 예시 카드도 이 부품을 쓴다.
 * example: 첫 화면용. "예시" 표시를 붙이고, 조건 줄은 위 3개만, 이렇게 바꾸면·다른 마음에 둔 나라·상세 링크는 뺀다.
 */
export function ResultCard({ plan, result, answers, example = false }: { plan: CardPlan; result: StoredResult; answers: Answers; example?: boolean }) {
  const { card } = plan;
  const country = result.countries[card.code];
  const name = country?.nameKo ?? card.code;
  const hearts = answers.q12?.hearts ?? [];
  const heartStyle = plan.chipKey === 'result.chip.heart';
  const checking = (card.unknown?.length ?? 0) > 0;
  const hard = card.badges.includes('hard_to_live');

  return (
    <section aria-labelledby="result-headline" className="relative rounded-card-lg bg-white p-5 shadow-float lg:p-6">
      {example ? (
        <span className="absolute -top-3 right-4 inline-flex rotate-6 items-center rounded-pill bg-lime px-3 py-1 text-caption font-extrabold text-navy">{t('landing.example')}</span>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="rounded-pill bg-aqua-100 px-3 py-1 text-caption font-extrabold text-aqua-dark">{t(plan.chipKey)}</span>
        {!example && heartStyle && hearts.length > 0 ? (
          <span className="inline-flex -rotate-2 items-center gap-1 rounded-pill bg-lime px-3 py-1 text-caption font-extrabold text-navy">
            <Heart aria-hidden="true" className="size-3" />
            {t('result.heartReason', { reasons: hearts.map((h) => t(`q12.heart.${h}`)).join(', ') })}
          </span>
        ) : null}
      </div>

      {plan.blockedHearts.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1">
          {plan.blockedHearts.map((b) => (
            <li key={b.code} className="rounded-card bg-coral-50 px-3 py-2 text-body font-bold text-coral-dark">
              {t('result.heart.blocked', { country: result.countries[b.code]?.nameKo ?? b.code, reason: blockReasonText(b.reason) })}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Flag code={card.code} className="size-8" />
          <p className="text-h2 text-navy">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-display leading-none text-navy">{card.pct}<span className="text-h3">%</span></p>
          <p className="text-caption font-bold text-text2">{t('result.score', { total: card.itemCount, ok: card.okCount })}</p>
          {checking ? <p className="mt-1 inline-block rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2">{t('result.partialChecking')}</p> : null}
        </div>
      </div>

      {example ? (
        <h2 id="result-headline" className="mt-4 text-h3 text-navy">{t(plan.headline.key, plan.headline.params)}</h2>
      ) : (
        <h1 id="result-headline" className="mt-4 text-h3 text-navy">{t(plan.headline.key, plan.headline.params)}</h1>
      )}
      {card.badges.length > 0 || country?.safetyLevel !== 'normal' ? (
        <div className="mt-2 flex flex-wrap gap-2"><CountryBadges badges={card.badges} safety={!!country && country.safetyLevel !== 'normal'} /></div>
      ) : null}
      {hard ? <p className="mt-2 text-caption text-text2">{t('badge.hardToLive.tip', { cap: result.config.workFailCapPct ?? 59 })}</p> : null}

      <div className="mt-4"><ConditionList lines={example ? card.lines.slice(0, 3) : card.lines} unknown={example ? [] : card.unknown ?? []} countryName={name} /></div>
      {example ? <p className="mt-3 text-caption text-text2">{t('landing.example.note')}</p> : null}

      {!example && plan.showWhatIf ? <WhatIfBox rows={result.whatIf[card.code] ?? []} countries={result.countries} allLow={plan.allLow} /> : null}

      {!example && plan.otherHearts.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-caption text-text2">
          <span className="font-bold">{t('result.otherHearts')}</span>
          {plan.otherHearts.map((r) => (
            <Link key={r.code} href={`/countries/${r.code}`} className="inline-flex min-h-8 items-center gap-1 rounded-pill bg-subtle px-3 font-bold text-navy hover:underline">
              <Flag code={r.code} />{result.countries[r.code]?.nameKo ?? r.code} {r.pct}%
            </Link>
          ))}
        </div>
      ) : null}

      {example ? null : <p className="mt-5">
        <Link href={`/countries/${card.code}`} className="inline-flex min-h-11 items-center text-body font-extrabold text-navy underline underline-offset-4">
          {t('result.detailLink', { country: name })}
        </Link>
      </p>}
    </section>
  );
}
