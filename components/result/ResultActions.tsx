import Link from 'next/link';
import { ArrowLeft, ArrowRightLeft, Rocket } from 'lucide-react';
import { t } from '@/lib/copy';
import { ShareButton } from '@/components/result/ShareButton';
import { StoryDownload } from '@/components/result/StoryDownload';
import type { CardPlan } from '@/lib/result/card';

/** 위쪽 줄: 다시 하기(새로 시작) + 공유 자리 */
export function ResultTopBar({ id, shareTitle, shareText }: { id: string; shareTitle: string; shareText: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/test" className="inline-flex min-h-11 items-center gap-2 text-body-l font-extrabold text-navy">
        <ArrowLeft aria-hidden="true" className="size-5" />
        {t('result.again')}
      </Link>
      <div className="hidden w-32 lg:block"><ShareButton id={id} title={shareTitle} text={shareText} /></div>
    </div>
  );
}

const cta = 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-button bg-coral px-6 font-extrabold text-navy shadow-coral hover:bg-coral-hover';

/** 나란히 비교 버튼: 카드 나라 + TOP 3 1위(카드가 1위면 1·2위) (SPEC 4.5) */
export function CompareButton({ plan, id }: { plan: CardPlan; id: string }) {
  if (!plan.compare) return null;
  return (
    <Link
      href={`/r/${id}/compare?c=${plan.compare.codes.join(',')}`}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-button bg-aqua-50 px-6 text-body font-extrabold text-navy hover:bg-aqua-100"
    >
      <ArrowRightLeft aria-hidden="true" className="size-4" />
      {t(plan.compare.labelKey)}
    </Link>
  );
}

/** 웹: TOP 3 아래 버튼 묶음. 이 나라로 준비 시작 → /checklist?c=카드 나라 (SPEC 4.6) */
export function ResultButtons({ plan, id, shareTitle, shareText }: { plan: CardPlan; id: string; shareTitle: string; shareText: string }) {
  return (
    <div className="mt-4 hidden flex-col gap-2 lg:flex">
      <Link href={`/checklist?c=${plan.card.code}`} className={cta}>
        <Rocket aria-hidden="true" className="size-4" />
        {t('result.startChecklist')}
      </Link>
      <ShareButton id={id} title={shareTitle} text={shareText} />
      <StoryDownload id={id} />
    </div>
  );
}

/** 모바일: 화면 아래에 붙는 줄(공유 + 이 나라로 준비 시작). 푸터와 겹치지 않게 main 안에서 sticky. */
export function StickyActions({ plan, id, shareTitle, shareText }: { plan: CardPlan; id: string; shareTitle: string; shareText: string }) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-8 flex items-center gap-3 border-t border-line bg-white px-5 py-3 lg:hidden">
      <div className="w-20 shrink-0"><ShareButton id={id} title={shareTitle} text={shareText} compact /></div>
      <Link href={`/checklist?c=${plan.card.code}`} className={cta}>
        {t('result.startChecklist')}
      </Link>
    </div>
  );
}
