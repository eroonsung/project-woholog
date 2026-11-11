import { t } from '@/lib/copy';
import type { Answers } from '@/lib/quiz/types';
import { pickCard } from '@/lib/result/card';
import type { StoredResult } from '@/lib/result/types';

/**
 * 공유 이미지·미리보기에 들어가는 값 (SPEC 5장): 카드 나라 국기·이름·%, 한 줄 문장, TOP 3 이름·%.
 * 나이·예산·언어 수준 같은 답변 값은 여기서 아예 꺼내지 않는다(이 함수는 결과의 카드 계획만 읽는다).
 */
export interface ShareData {
  code: string; name: string; pct: number; okCount: number; itemCount: number;
  headline: string; topTitle: string;
  top3: { code: string; name: string; pct: number }[];
}

export function buildShareData(answers: Answers, result: StoredResult): ShareData | null {
  const plan = pickCard(answers, result);
  if (!plan) return null;
  const nameOf = (code: string) => result.countries[code]?.nameKo ?? code;
  return {
    code: plan.card.code, name: nameOf(plan.card.code), pct: plan.card.pct, okCount: plan.card.okCount, itemCount: plan.card.itemCount,
    headline: t(plan.headline.key, plan.headline.params),
    topTitle: t(plan.topTitleKey),
    top3: plan.top3.map((r) => ({ code: r.code, name: nameOf(r.code), pct: r.pct })),
  };
}

/** 공유 제목·설명(OG 메타, 시스템 공유 창) */
export const shareTitle = (d: Pick<ShareData, 'name' | 'pct'>): string => t('share.ogTitle', { country: d.name, pct: d.pct });
export const shareDescription = (): string => t('share.ogDesc');
