import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuideArticle } from '@/components/guides/GuideArticle';
import { fetchCountryName, fetchGuideFactContext, fetchPublishedGuide, fetchPublishedGuides } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';
import { fillFacts, parseMarkdown } from '@/lib/guides';

// 가이드 글 (SPEC 15장): 발행된 글만(없는 slug·발행 안 된 글은 404). {fact_key}는 DB의 현재 값, 없으면 "확인 중". 정보가 바뀌어 다시 확인 중이면 맨 위 안내.
export const revalidate = 3600;
export async function generateStaticParams() {
  return (await fetchPublishedGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = await fetchPublishedGuide((await params).slug);
  return g ? { title: `${g.title_ko} | 워홀로그` } : {};
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = await fetchPublishedGuide((await params).slug);
  if (!guide) notFound();
  const [ctx, country] = await Promise.all([fetchGuideFactContext(guide.program_id), fetchCountryName(guide.country)]);
  return <GuideArticle title={guide.title_ko} country={country} date={guide.reviewed_at} needsReview={guide.needs_review} blocks={parseMarkdown(fillFacts(guide.body_ko, ctx, todayKst()))} />;
}
