import Link from 'next/link';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { GuideBody } from '@/components/guides/GuideBody';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';
import type { Block } from '@/lib/guides';

/** 가이드 글 한 편 (SPEC 15장). 정보가 바뀌어 다시 확인 중(needs_review)이면 글은 그대로 두고 맨 위에 안내를 붙인다. */
export function GuideArticle({ title, country, date, needsReview, blocks }: { title: string; country: string | null; date: string | null; needsReview: boolean; blocks: Block[] }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 lg:px-10">
      <Link href="/guides" className="inline-flex min-h-11 items-center gap-2 text-body font-extrabold text-navy"><ArrowLeft aria-hidden="true" className="size-5" />{t('guides.back')}</Link>
      {needsReview ? (
        <p role="note" className="mt-2 flex items-start gap-2 rounded-card bg-coral-50 p-4 text-body font-extrabold text-coral-dark"><TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />{t('guides.review')}</p>
      ) : null}
      <h1 className="mt-4 text-h1 text-navy">{title}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 text-caption text-text3">
        {country ? <span>{country}</span> : null}
        {date ? <span>{t('guides.meta.date', { date: formatKoDate(date) })}</span> : null}
      </p>
      <div className="mt-6"><GuideBody blocks={blocks} /></div>
    </main>
  );
}
