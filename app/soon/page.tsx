import type { Metadata } from 'next';
import { SoonHub } from '@/components/soon/SoonHub';
import { fetchVoteCounts } from '@/lib/data/queries';
import { STAGES, type FeatureStage } from '@/lib/features';

// 준비 중 기능 모음 (SPEC 14장). 원해요 숫자는 feature_vote_counts()에서 읽어서 요청마다 그린다(읽기만 함).
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '곧 나올 기능 | 워홀로그' };

export default async function SoonPage({ searchParams }: { searchParams: Promise<{ stage?: string | string[] }> }) {
  const raw = (await searchParams).stage;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const stage = (STAGES as readonly string[]).includes(value ?? '') ? (value as FeatureStage) : null;
  const counts = await fetchVoteCounts().catch(() => null); // 숫자를 못 읽으면 숫자 없이 보여 준다
  return <SoonHub stage={stage} counts={counts} />;
}
