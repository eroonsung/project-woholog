import { notFound } from 'next/navigation';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import features from '@/content/features_ko.json';

// 임시 화면: 10단계에서 준비 중 기능 상세로 교체한다(D-103). 없는 slug는 404 (SPEC 0.4, 14장)
export const dynamicParams = false;
export function generateStaticParams() {
  return features.features.map((f) => ({ slug: f.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!features.features.some((f) => f.slug === slug)) notFound();
  return <ComingSoonPage />;
}
