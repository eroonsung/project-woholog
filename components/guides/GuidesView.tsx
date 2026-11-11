import Link from 'next/link';
import { BookOpen, Hourglass } from 'lucide-react';
import { NotifyBlock } from '@/components/soon/NotifyBlock';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';
import { excerpt } from '@/lib/guides';

export interface GuideItem { slug: string; title: string; summary: string; date: string | null }

/**
 * 가이드 목록 (S20, SPEC 15장): 발행된 글만 최신순. 0개면 빈 상태 = "곧 올라올 글"(제목만, 누를 수 없음) + 알림 신청.
 * "곧 올라올 글"은 문구 파일의 목록이다(제안, 오픈 전 전체 문구 검토 때 확정).
 */
export function GuidesView({ guides }: { guides: GuideItem[] }) {
  const planned = t('guides.planned').split(' / ');
  return (
    <main className="w-full">
      <section className="bg-aqua">
        <div className="mx-auto max-w-content px-5 py-10 lg:px-10 lg:py-14">
          <h1 className="text-h1 text-navy">{t('guides.title')}</h1>
          <p className="mt-3 text-body-l text-navy-80">{t('guides.sub')}</p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-10">
        {guides.length === 0 ? (
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex size-20 items-center justify-center rounded-full bg-aqua text-navy"><BookOpen aria-hidden="true" className="size-9" /></span>
            <h2 className="mt-5 text-h2 text-navy">{t('guides.empty.title')}</h2>
            <p className="mt-2 text-body-l text-text2">{t('guides.empty.sub')}</p>
            <section aria-labelledby="planned-title" className="mt-8 w-full rounded-card-lg bg-aqua-50 p-5 text-left">
              <div className="flex items-center justify-between gap-3">
                <h3 id="planned-title" className="flex items-center gap-2 text-h3 text-navy"><Hourglass aria-hidden="true" className="size-5" />{t('guides.empty.planned')}</h3>
                <span className="text-caption text-text2">{t('guides.planned.note')}</span>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {planned.map((title) => (
                  <li key={title} className="flex items-center justify-between gap-3 rounded-card bg-white px-4 py-3 text-body font-extrabold text-navy">
                    {title}<span className="shrink-0 rounded-pill bg-aqua-100 px-2 py-0.5 text-caption font-extrabold text-aqua-dark">{t('guides.planned.badge')}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {guides.map((g) => (
              <li key={g.slug} className="rounded-card-lg border border-line bg-white p-5 shadow-card">
                <h2 className="text-h3 text-navy"><Link href={`/guides/${g.slug}`} className="underline-offset-4 hover:underline">{g.title}</Link></h2>
                {g.summary ? <p className="mt-2 text-body text-text2">{g.summary}</p> : null}
                {g.date ? <p className="mt-2 text-caption text-text3">{t('guides.meta.date', { date: formatKoDate(g.date) })}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <NotifyBlock variant="guides" titleKey="guides.notify.title" className="mt-10" />
      </div>
    </main>
  );
}

export { excerpt };
