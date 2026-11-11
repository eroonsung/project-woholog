import data from '@/content/features_ko.json';

/** 준비 중 기능 15개 (content/features_ko.json, SPEC 14장). JSON 순서를 그대로 쓴다(원해요 순으로 바꾸지 않음). */
export interface Feature { slug: string; name: string; stage: string; summary: string; target: string; now?: string; can: string[] }
export const FEATURES = data.features as Feature[];
export const featureBySlug = (slug: string): Feature | undefined => FEATURES.find((f) => f.slug === slug);

export const STAGES = ['prepare', 'local', 'return', 'community'] as const;
export type FeatureStage = (typeof STAGES)[number];
/** 단계 이름 문구 키(헤더 메뉴 문구와 같다) */
export const STAGE_KEY: Record<FeatureStage, string> = { prepare: 'nav.stage.prepare', local: 'nav.stage.local', return: 'nav.stage.return', community: 'nav.community' };

/** 다른 준비 중 기능: JSON에서 이 기능 바로 다음 것부터 n개(끝이면 처음으로 돌아감) */
export function otherFeatures(slug: string, n = 3): Feature[] {
  const i = FEATURES.findIndex((f) => f.slug === slug);
  return Array.from({ length: Math.min(n, FEATURES.length - 1) }, (_, k) => FEATURES[(i + 1 + k) % FEATURES.length]!);
}
