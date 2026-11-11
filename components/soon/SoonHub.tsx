import Link from 'next/link';
import { FeatureCard } from '@/components/soon/FeatureCard';
import { NotifyBlock } from '@/components/soon/NotifyBlock';
import { t } from '@/lib/copy';
import { FEATURES, STAGE_KEY, STAGES, type FeatureStage } from '@/lib/features';

/** 준비 중 기능 모음 (S18, SPEC 14장): 15개 카드, 단계 탭, JSON 순서 그대로, 아래 오픈 알림 블록 */
export function SoonHub({ stage, counts }: { stage: FeatureStage | null; counts: Record<string, number> | null }) {
  const list = stage ? FEATURES.filter((f) => f.stage === stage) : FEATURES;
  const tab = 'inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-body font-extrabold';
  return (
    <main className="w-full">
      <section className="bg-aqua">
        <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-5 py-10 lg:px-10 lg:py-14">
          <div>
            <p className="inline-flex rounded-pill bg-white px-3 py-1 text-caption font-extrabold text-aqua-dark">{t('soon.hub.badge')}</p>
            <h1 className="mt-3 text-h1 text-navy">{t('soon.hub.title')}</h1>
            <p className="mt-3 text-body-l text-navy-80">{t('soon.hub.sub')}</p>
          </div>
          <p className="hidden size-28 shrink-0 rotate-6 items-center justify-center rounded-full bg-lime p-3 text-center text-body font-extrabold text-navy sm:flex">{t('soon.hub.sticker', { n: FEATURES.length })}</p>
        </div>
      </section>

      <div className="mx-auto max-w-content px-5 py-8 lg:px-10">
        <nav aria-label={t('soon.tab.label')} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          <Link href="/soon" aria-current={stage === null ? 'true' : undefined} className={`${tab} ${stage === null ? 'bg-aqua-100 text-aqua-dark ring-[1.5px] ring-aqua-dark' : 'bg-subtle text-text2'}`}>
            {t('soon.tab.all')}<span className="rounded-pill bg-white px-2 text-caption">{FEATURES.length}</span>
          </Link>
          {STAGES.map((s) => (
            <Link key={s} href={`/soon?stage=${s}`} aria-current={stage === s ? 'true' : undefined} className={`${tab} shrink-0 ${stage === s ? 'bg-aqua-100 text-aqua-dark ring-[1.5px] ring-aqua-dark' : 'bg-subtle text-text2'}`}>
              {t(STAGE_KEY[s])}
            </Link>
          ))}
        </nav>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => <FeatureCard key={f.slug} feature={f} count={counts ? counts[f.slug] ?? 0 : null} />)}
        </ul>

        <NotifyBlock variant="hub" titleKey="soon.hub.notify.title" className="mt-12" />
        <p className="mt-6 text-caption text-text3">{t('soon.note')}</p>
      </div>
    </main>
  );
}
