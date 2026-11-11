import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CompareToggle } from '@/components/compare/CompareToggle';
import { Apply, Glance, Life, Money, SafetyBanner, Section, Work } from '@/components/countries/DetailSections';
import { Apps, Partners, Sources, type Partner } from '@/components/countries/DetailExtras';
import { DetailToc } from '@/components/countries/DetailToc';
import { Flag } from '@/components/ui/Flag';
import type { CountryDetail } from '@/lib/countries/detail';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';

/** 나라 상세 (SPEC 8장, S13). 위: 이름·태그·여행경보·적합도 확인 / 왼쪽 목차 / 섹션 8개 / 아래: 비교에 담기·체크리스트 */
export function DetailView({ d, partners }: { d: CountryDetail; partners: Partner[] }) {
  const sec = (id: string, titleKey: string, body: React.ReactNode, report = true) => (
    <Section id={id} code={d.code} title={t(titleKey, { country: d.nameKo })} report={report}>{body}</Section>
  );
  const anyPartnerLink = partners.some((p) => p.url);

  return (
    <main className="w-full pb-28">
      <div className="bg-aqua">
        <div className="mx-auto grid max-w-content gap-6 px-5 py-6 lg:grid-cols-[1fr_20rem] lg:items-center lg:px-10 lg:py-10">
          <div>
            <p className="text-body font-extrabold text-navy-80">
              <Link href="/countries" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">{t('detail.back')}</Link>
              <span aria-hidden="true"> › </span>{d.nameKo}
            </p>
            <h1 className="mt-1 flex items-center gap-3 text-h1 text-navy"><Flag code={d.code} className="h-7 w-10" />{t('detail.title', { country: d.nameKo })}</h1>
            <ul className="mt-3 flex flex-wrap gap-2">
              {d.tags.map((x) => <li key={x} className="rounded-pill bg-white px-3 py-1 text-body font-extrabold text-aqua-dark">{x}</li>)}
            </ul>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-caption text-navy-80">
              {t('detail.verified', { date: d.verifiedAt ? formatKoDate(d.verifiedAt) : t('status.checking') })}
              {d.stale ? <span className="rounded-pill bg-coral-50 px-2 py-0.5 font-extrabold text-coral-dark">{t('status.stale')}</span> : null}
            </p>
          </div>
          {d.comingSoon ? (
            <p className="rounded-card-lg bg-white p-5 text-body font-extrabold text-navy shadow-float">{t('detail.comingSoon')}</p>
          ) : (
            <div className="rounded-card-lg bg-white p-5 shadow-float">
              <h2 className="text-h3 text-navy">{t('detail.fit.title')}</h2>
              <p className="mt-1 text-body text-text2">{t('detail.fit.body', { country: d.nameKo })}</p>
              <Link href={`/test?pre=${d.code}`} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover">
                {t('detail.fit.cta', { country: d.nameKo })}<ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-content px-5 lg:px-10">
        {d.safety ? <div className="mt-6"><SafetyBanner safety={d.safety} /></div> : null}
        <div className="mt-6 grid gap-8 lg:grid-cols-[12rem_1fr] lg:gap-12">
          <DetailToc />
          <div className="flex min-w-0 flex-col gap-12 pb-8">
            {sec('summary', 'detail.section.summary', <Glance d={d} />)}
            {sec('money', 'detail.section.money', <Money d={d} />)}
            {sec('work', 'detail.section.work', <Work d={d} />)}
            {sec('apply', 'detail.section.apply', <Apply d={d} />)}
            {sec('life', 'detail.section.life', <Life d={d} />)}
            {sec('apps', 'apps.title', <Apps apps={d.apps} />)}
            <Section id="partners" code={d.code} title={t('partners.title')} report={false}>
              {anyPartnerLink ? <p className="-mt-3 mb-3"><span className="rounded-pill bg-subtle px-2 py-0.5 text-caption font-extrabold text-text2">{t('partners.badge')}</span></p> : null}
              <Partners items={partners} />
            </Section>
            {sec('sources', 'detail.section.sources', <Sources d={d} />)}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {d.comingSoon ? <span /> : <CompareToggle code={d.code} nameKo={d.nameKo} />}
              <Link href={`/checklist?c=${d.code}`} className="inline-flex h-12 items-center justify-center rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover">{t('detail.checklist')}</Link>
            </div>
            <p className="text-caption text-text3">{t('disclaimer.short')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
