import type { Metadata } from 'next';
import { GuidesView, type GuideItem } from '@/components/guides/GuidesView';
import { fetchPublishedGuides } from '@/lib/data/queries';
import { excerpt } from '@/lib/guides';

// 가이드 목록 (SPEC 15장): 발행된 글만 최신순, 0개면 빈 상태. 하루에 한 번 다시 만든다.
export const revalidate = 3600;
export const metadata: Metadata = { title: '가이드 | 워홀로그' };

export default async function GuidesPage() {
  const rows = await fetchPublishedGuides();
  const guides: GuideItem[] = rows.map((g) => ({ slug: g.slug, title: g.title_ko, summary: excerpt(g.body_ko.replace(/\{[a-z0-9_]+\}/g, '')), date: g.reviewed_at }));
  return <GuidesView guides={guides} />;
}
