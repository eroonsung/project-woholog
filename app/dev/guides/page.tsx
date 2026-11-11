import { readFileSync } from 'node:fs';
import { notFound } from 'next/navigation';
import { GuideArticle } from '@/components/guides/GuideArticle';
import { fetchAdapterRows, fetchGuideFactContext } from '@/lib/data/queries';
import { todayKst } from '@/lib/format';
import { fillFacts, parseMarkdown } from '@/lib/guides';

// 개발 확인용: supabase/seed/seed_guides_v1.sql의 글을 DB에 넣지 않고 미리 그려 본다(/dev/guides?slug=canada-iec-2027).
// 초안은 공개 규칙 때문에 화면에서 볼 수 없어서 쓴다. {fact_key}는 운영 DB의 현재 값을 읽어서(읽기만) 채운다. 배포(production 빌드)에서는 404.
export const dynamic = 'force-dynamic';

const ENTRY = /\('([a-z0-9-]+)', (null|\(select id from programs where origin = 'KR' and destination = '([A-Z]{2})'[^)]*\)), '([^']+)',\n\$guide\$([\s\S]*?)\$guide\$,\n\s+'(published|draft|archived)', '(\d{4}-\d{2}-\d{2})'\)/g;

export default async function DevGuides({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const sql = readFileSync('supabase/seed/seed_guides_v1.sql', 'utf8');
  const entries = [...sql.matchAll(ENTRY)].map((m) => ({ slug: m[1]!, dest: m[3] ?? null, title: m[4]!, body: m[5]!, date: m[7]! }));
  const { slug } = await searchParams;
  const e = entries.find((x) => x.slug === slug);
  if (!e) {
    return <main className="mx-auto max-w-content px-5 py-8"><ul>{entries.map((x) => <li key={x.slug}><a className="underline" href={`/dev/guides?slug=${x.slug}`}>{x.slug}</a> {x.title}</li>)}</ul></main>;
  }
  const rows = await fetchAdapterRows();
  const program = e.dest ? rows.programs.find((p) => p.origin === 'KR' && p.destination === e.dest && p.kind === 'working_holiday') ?? null : null;
  const ctx = await fetchGuideFactContext(program?.id ?? null);
  const country = e.dest ? rows.countries.find((c) => c.code === e.dest)?.name_ko ?? null : null;
  return <GuideArticle title={e.title} country={country} date={e.date} needsReview={false} blocks={parseMarkdown(fillFacts(e.body, ctx, todayKst()))} />;
}
