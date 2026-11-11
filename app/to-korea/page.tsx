import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ListChecks, Building2 } from 'lucide-react';
import { SubscribeForm } from '@/components/soon/SubscribeForm';
import { tEn } from '@/lib/copy';

// To Korea 대기자 (SPEC 12장): 화면 전체가 영어(content/copy_en.json), 신청은 section = to_korea. 신청 여부는 기억하지 않는다(새로고침하면 다시 신청 칸).
export const metadata: Metadata = { title: 'Working Holiday in Korea | woholog' };

const CARDS = [{ key: 'tk.card1', Icon: FileText }, { key: 'tk.card2', Icon: ListChecks }, { key: 'tk.card3', Icon: Building2 }] as const;

export default function ToKoreaPage() {
  return (
    <main lang="en" className="w-full">
      <section className="bg-aqua">
        <div className="mx-auto grid max-w-content gap-8 px-5 py-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10 lg:py-16">
          <div>
            <p className="inline-flex rounded-pill bg-white px-3 py-1 text-caption font-extrabold text-aqua-dark">{tEn('tk.badge')}</p>
            <h1 className="relative mt-4 text-display text-navy">
              {tEn('tk.title')}
              <span className="ml-3 inline-flex rotate-6 rounded-pill bg-lime px-3 py-1 align-middle text-caption font-extrabold text-navy">{tEn('tk.sticker')}</span>
            </h1>
            <p className="mt-4 text-body-l text-navy-80">{tEn('tk.sub')}</p>
          </div>
          <div className="rounded-card-lg bg-white p-6 shadow-float">
            <SubscribeForm lang="en" section="to_korea" />
          </div>
        </div>
      </section>

      <section aria-labelledby="tk-build" className="mx-auto max-w-content px-5 py-12 lg:px-10">
        <h2 id="tk-build" className="text-h2 text-navy">{tEn('tk.section')}</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          {CARDS.map(({ key, Icon }) => (
            <li key={key} className="flex items-center gap-4 rounded-card-lg bg-subtle p-5">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-button bg-aqua-100 text-aqua-dark"><Icon aria-hidden="true" className="size-6" /></span>
              <span className="text-h3 text-navy">{tEn(key)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex flex-wrap items-center gap-x-4 text-caption text-text3">
          <Link href="/privacy?lang=en" className="inline-flex min-h-11 items-center underline underline-offset-4">{tEn('tk.privacy')}</Link>
          <span>{tEn('tk.disclaimer')}</span>
        </p>
      </section>
    </main>
  );
}
