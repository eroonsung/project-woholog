import Link from 'next/link';
import { ArrowRight, ArrowRightLeft, CalendarCheck, ShieldCheck, type LucideIcon } from 'lucide-react';
import { ContinueLink } from './ContinueLink';
import { Flag } from '@/components/ui/Flag';
import { ResultCard } from '@/components/result/ResultCard';
import { t } from '@/lib/copy';
import type { LandingExample } from '@/lib/result/example';

export interface BrowseCountry {
  code: string;
  nameKo: string;
  selection: 'unlimited' | 'first_come' | 'lottery';
}

/** 접수 방식 글자: 이미 있는 문구 키를 쓴다(상시 / 선착순 / 추첨) */
const SELECTION_KEY = { unlimited: 'preview.next.always', first_come: 'preview.next.firstComeNoQuota', lottery: 'badge.lottery' } as const;
const FEATURES: { key: string; Icon: LucideIcon; box: string }[] = [
  { key: 'landing.feature1', Icon: ShieldCheck, box: 'bg-aqua-100 text-aqua-dark' },
  { key: 'landing.feature2', Icon: CalendarCheck, box: 'bg-aqua-50 text-aqua-dark' },
  { key: 'landing.feature3', Icon: ArrowRightLeft, box: 'bg-coral-50 text-coral-dark' },
];

const cta = 'inline-flex h-12 items-center justify-center gap-2 rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover lg:h-13';

/**
 * 첫 화면 (SPEC.md 2장, S00). DB는 요청 때 읽지 않는다: 예시 카드와 나라 목록은 빌드(재생성)할 때 만든 값이다.
 * 없는 것: 이용자 수·후기·"실시간 집계"·통계 숫자(근거 없는 값은 넣지 않는다, D-064).
 */
export function HomeView({ example, countries }: { example: LandingExample; countries: BrowseCountry[] }) {
  return (
    <main className="flex-1">
      <section className="bg-aqua">
        <div className="mx-auto grid max-w-content items-center gap-8 px-5 py-10 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-16">
          <div>
            <p className="inline-flex rounded-pill bg-white px-3 py-1 text-caption font-extrabold text-aqua-dark">{t('landing.badge')}</p>
            <h1 className="mt-4 text-display text-navy">{t('landing.title')}</h1>
            <p className="mt-4 text-body-l text-navy-80">{t('landing.sub')}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/test" className={cta}>
                {t('landing.cta')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/countries" className="inline-flex min-h-11 items-center text-body font-extrabold text-navy underline underline-offset-4">{t('landing.compare')}</Link>
            </div>
            <p className="mt-3 flex items-center gap-2 text-caption font-bold text-navy-80">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {t('landing.noLogin')}
            </p>
            <ContinueLink />
          </div>
          <div className="lg:justify-self-end lg:max-w-lg">
            <ResultCard plan={example.plan} result={example.result} answers={example.answers} example />
          </div>
        </div>
      </section>

      <section aria-labelledby="why-title" className="mx-auto max-w-content px-5 py-12 lg:px-10 lg:py-16">
        <h2 id="why-title" className="text-h2 text-navy">{t('landing.why.title')}</h2>
        <ul className="mt-6 grid gap-3 lg:grid-cols-3">
          {FEATURES.map(({ key, Icon, box }) => (
            <li key={key} className="flex items-center gap-4 rounded-card bg-subtle p-5">
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-button ${box}`}>
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="text-h3 text-navy">{t(key)}</h3>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="browse-title" className="mx-auto max-w-content px-5 pb-12 lg:px-10 lg:pb-16">
        <h2 id="browse-title" className="text-h2 text-navy">{t('landing.browse.title')}</h2>
        <ul className="-mx-5 mt-6 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {countries.map((c) => (
            <li key={c.code} className="w-44 shrink-0 snap-start lg:w-auto">
              <Link href={`/countries/${c.code}`} className="flex min-h-24 flex-col justify-between gap-4 rounded-card bg-subtle p-4 hover:bg-aqua-50">
                <Flag code={c.code} className="h-6 w-8" />
                <span className="flex items-center justify-between gap-2">
                  <span className="text-body-l font-extrabold text-navy">{c.nameKo}</span>
                  <span className="rounded-pill bg-aqua-100 px-2 py-0.5 text-caption font-extrabold text-aqua-dark">{t(SELECTION_KEY[c.selection])}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 모바일: 화면 아래에 붙는 주요 버튼(와이어프레임). 푸터와 겹치지 않게 main 안에서 sticky */}
      <div className="sticky bottom-0 border-t border-line bg-white px-5 py-3 lg:hidden">
        <Link href="/test" className={`${cta} w-full`}>{t('landing.cta')}</Link>
      </div>
    </main>
  );
}
