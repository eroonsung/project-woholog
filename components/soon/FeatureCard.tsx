import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { VoteButton } from '@/components/soon/VoteButton';
import { t } from '@/lib/copy';
import { STAGE_KEY, type Feature, type FeatureStage } from '@/lib/features';

/** 준비 중 기능 카드 (S18): 단계 뱃지 · 이름 · 한 줄 설명 · "○○ 목표" · 원해요 + 숫자. "예정"이 아니라 항상 "목표"(규칙 16). */
export function FeatureCard({ feature, count }: { feature: Feature; count: number | null }) {
  return (
    <li className="flex flex-col gap-3 rounded-card-lg border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-aqua-100 text-aqua-dark"><Sparkles aria-hidden="true" className="size-5" /></span>
        <span className="rounded-pill bg-aqua-100 px-3 py-1 text-caption font-extrabold text-aqua-dark">{t(STAGE_KEY[feature.stage as FeatureStage])}</span>
      </div>
      <h2 className="text-h3 text-navy"><Link href={`/soon/${feature.slug}`} className="underline-offset-4 hover:underline">{feature.name}</Link></h2>
      <p className="text-body text-text2">{feature.summary}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-caption text-text2">{t('soon.target', { when: feature.target })}</span>
        <VoteButton slug={feature.slug} count={count} />
      </div>
    </li>
  );
}
