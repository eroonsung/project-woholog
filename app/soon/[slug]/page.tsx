import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FeatureDetail } from '@/components/soon/FeatureDetail';
import { fetchVoteCounts } from '@/lib/data/queries';
import { FEATURES, featureBySlug } from '@/lib/features';

// 준비 중 기능 상세 (SPEC 14장): 템플릿 하나로 15개 slug. 없는 slug는 404. 원해요 숫자는 요청마다 읽는다(읽기만 함).
export const dynamic = 'force-dynamic';
export const dynamicParams = false;
export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const f = featureBySlug((await params).slug);
  return f ? { title: `${f.name} | 워홀로그`, description: f.summary } : {};
}

export default async function SoonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const feature = featureBySlug((await params).slug);
  if (!feature) notFound();
  const counts = await fetchVoteCounts().catch(() => null);
  return <FeatureDetail feature={feature} counts={counts} />;
}
