import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { NotifyBlock } from '@/components/soon/NotifyBlock';
import { VoteButton } from '@/components/soon/VoteButton';
import { t } from '@/lib/copy';
import { otherFeatures, STAGE_KEY, type Feature, type FeatureStage } from '@/lib/features';

/**
 * 준비 중 기능 상세 (S19, SPEC 14장). 템플릿 하나로 15개를 모두 그린다.
 * 블록 순서: 이름·한 줄 설명·목표 시기 / 기능 미리보기(흐린 그림) / "이런 걸 할 수 있어요" / 원해요 / "지금 쓸 수 있는 것"(없으면 숨김) / 알림 신청 / 다른 준비 중 기능 3개.
 */
export function FeatureDetail({ feature, counts }: { feature: Feature; counts: Record<string, number> | null }) {
  const count = counts ? counts[feature.slug] ?? 0 : null;
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-6 lg:px-0">
      <p className="text-caption font-extrabold text-text2">
        <Link href="/soon" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">{t('footer.soon')}</Link>
        <span aria-hidden="true"> › </span>{t(STAGE_KEY[feature.stage as FeatureStage])}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 text-navy">{feature.name}</h1>
        <span className="inline-flex -rotate-2 rounded-pill bg-lime px-3 py-1 text-caption font-extrabold text-navy">{t('soon.status', { when: feature.target })}</span>
      </div>
      <p className="mt-3 text-body-l text-text2">{feature.summary}</p>

      <div aria-hidden="true" className="relative mt-6 overflow-hidden rounded-card-lg border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 blur-sm">
          <div className="h-5 w-1/3 rounded-pill bg-aqua-100" />
          <div className="mx-auto my-4 size-32 rounded-full border-[14px] border-aqua-100 border-t-aqua-dark" />
          <div className="grid grid-cols-2 gap-3"><div className="h-14 rounded-card bg-subtle" /><div className="h-14 rounded-card bg-subtle" /></div>
        </div>
        <p className="absolute inset-0 flex items-center justify-center"><span className="inline-flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-body font-extrabold text-navy shadow-card"><Lock className="size-4" />{t('soon.preview')}</span></p>
      </div>

      <section aria-labelledby="can-title" className="mt-10">
        <h2 id="can-title" className="text-h3 text-navy">{t('soon.can')}</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {feature.can.map((line) => (
            <li key={line} className="flex items-start gap-3 rounded-card bg-subtle p-4 text-body text-navy">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-aqua-100 text-aqua-dark"><Check aria-hidden="true" className="size-3.5" /></span>{line}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={t('soon.want')} className="mt-8 flex flex-col items-center gap-2 rounded-card-lg bg-subtle p-6 text-center">
        <VoteButton slug={feature.slug} count={count} large />
        {count !== null && count > 0 ? <p className="text-body text-text2">{t('soon.wantCount', { n: count })}</p> : null}
      </section>

      {feature.now ? (
        <section aria-labelledby="now-title" className="mt-6 rounded-card bg-subtle p-5">
          <h2 id="now-title" className="text-caption font-extrabold text-text2">{t('soon.now')}</h2>
          <p className="mt-1 text-body-l font-extrabold text-navy">{feature.now}</p>
        </section>
      ) : null}

      <NotifyBlock variant="feature" titleKey="soon.notify.title" className="mt-6" />

      <section aria-labelledby="others-title" className="mt-12">
        <div className="flex items-center justify-between gap-3">
          <h2 id="others-title" className="text-h3 text-navy">{t('soon.others')}</h2>
          <Link href="/soon" className="inline-flex min-h-11 items-center text-body font-extrabold text-navy underline underline-offset-4">{t('soon.hub.badge')}</Link>
        </div>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {otherFeatures(feature.slug).map((o) => (
            <li key={o.slug} className="rounded-card-lg bg-subtle p-4">
              <Link href={`/soon/${o.slug}`} className="block min-h-11">
                <span className="text-caption font-extrabold text-aqua-dark">{t('soon.target', { when: o.target })}</span>
                <span className="mt-1 block text-body-l font-extrabold text-navy">{o.name}</span>
                <span className="mt-1 block text-body text-text2">{o.summary}</span>
                {counts && (counts[o.slug] ?? 0) > 0 ? <span className="mt-2 block text-caption font-extrabold text-text2">{t('soon.want')} {counts[o.slug]}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-8 text-caption text-text3">{t('soon.note')}</p>
    </main>
  );
}
