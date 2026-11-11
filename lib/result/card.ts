import type { BlockReason } from '@/lib/engine';
import type { Answers } from '@/lib/quiz/types';
import type { StoredRanked, StoredResult } from './types';

/**
 * 결과 맨 위 카드 고르기 (SPEC.md 4.2, D-013). 점수는 다시 계산하지 않고, 저장된 결과에서 "어느 나라를 어떤 문장으로 보여 줄지"만 정한다.
 * 기준값(10%p, 60%)은 결과에 저장된 scoring_config 값을 쓴다(코드에 숫자를 쓰지 않는다).
 */
export type CardKind = 'noheart' | 'top1' | 'close' | 'far' | 'blocked';

export type HeartBlock = { code: string; reason: BlockReason | { kind: 'inactive' } };

export interface CardPlan {
  kind: CardKind;
  card: StoredRanked;
  /** 카드 나라가 엔진 1위인가 (TOP 3 제목·비교 버튼 글자가 달라진다) */
  cardIsFirst: boolean;
  chipKey: 'result.chip.heart' | 'result.noHeart.title';
  headline: { key: string; params: Record<string, string | number> };
  /** 마음에 둔 나라 중 지금 갈 수 없는 나라(이유 포함) */
  blockedHearts: HeartBlock[];
  /** 마음에 둔 다른 나라(%만 작게) */
  otherHearts: StoredRanked[];
  /** "이렇게 바꾸면" 상자를 보여 줄지(엔진이 제안을 돌려줬고 SPEC 4.2 표의 조건을 만족할 때) */
  showWhatIf: boolean;
  /** "지금 조건으로는 딱 맞는 나라가 없어요" 문장을 같이 보여 줄지(noheart·blocked에서 카드가 60% 미만) */
  allLow: boolean;
  top3: StoredRanked[];
  topTitleKey: 'result.next' | 'result.top3';
  /** 마음에 둔 나라가 엔진 1위가 아닌데 1위와 %가 같다(공동 1위). "0%p 차이" 대신 같은 점수라고 알린다(D-130). 엔진 순서는 그대로 */
  tie: boolean;
  compare: { codes: [string, string]; labelKey: 'compare.cta' | 'result.compare.other' } | null;
}

export function pickCard(answers: Answers, result: StoredResult): CardPlan | null {
  const { ranked, blocked, comingSoon, countries, config } = result;
  const first = ranked[0];
  if (!first) return null;
  const nameOf = (code: string) => countries[code]?.nameKo ?? code;
  const hearts = answers.q1 && !answers.q1.none ? answers.q1.codes : [];

  const reachable = hearts.flatMap((code) => ranked.filter((r) => r.code === code));
  const blockedHearts: HeartBlock[] = hearts.flatMap((code): HeartBlock[] => {
    if (ranked.some((r) => r.code === code)) return [];
    const b = blocked.find((x) => x.code === code);
    if (b) return [{ code, reason: b.reason }];
    return comingSoon.some((c) => c.code === code) ? [{ code, reason: { kind: 'inactive' as const } }] : [];
  });

  // 마음에 둔 나라가 여러 개면 % 가장 높은 나라가 카드(같으면 고른 순서)
  const heart = reachable.reduce<StoredRanked | null>((best, r) => (best === null || r.pct > best.pct ? r : best), null);
  const suggests = (code: string) => (result.whatIf[code]?.length ?? 0) > 0;

  let kind: CardKind;
  let card: StoredRanked;
  if (!heart) {
    kind = blockedHearts.length > 0 ? 'blocked' : 'noheart';
    card = first;
  } else {
    card = heart;
    const gap = first.pct - heart.pct;
    kind = heart.code === first.code || gap === 0 ? 'top1' : gap < config.closeGapPp ? 'close' : 'far'; // 같은 %면 공동 1위(top1)
  }

  const showWhatIf =
    kind === 'top1' ? false
    : kind === 'close' ? card.pct < config.lowResultPct && suggests(card.code)
    : kind === 'far' ? suggests(card.code)
    : card.pct < config.lowResultPct && suggests(card.code); // noheart, blocked

  const heartStyle = kind === 'top1' || kind === 'close' || kind === 'far';
  const headline: CardPlan['headline'] =
    kind === 'top1' && card.code !== first.code ? { key: 'result.heart.tie', params: { country: nameOf(card.code), top: nameOf(first.code) } }
    : kind === 'top1' ? { key: 'result.heart.top', params: { country: nameOf(card.code) } }
    : kind === 'close' ? { key: 'result.heart.close', params: { country: nameOf(card.code), top: nameOf(first.code), diff: first.pct - card.pct } }
    : kind === 'far' ? { key: 'result.heart.far', params: { country: nameOf(card.code) } }
    : { key: 'result.noHeart.headline', params: { country: nameOf(card.code) } };

  const cardIsFirst = card.code === first.code;
  const tie = !cardIsFirst && card.pct === first.pct && kind === 'top1';
  const top3 = ranked.filter((r) => r.code !== card.code).slice(0, 3);
  const second = ranked[1];
  const compare: CardPlan['compare'] = cardIsFirst
    ? second ? { codes: [first.code, second.code], labelKey: 'result.compare.other' } : null
    : { codes: [card.code, first.code], labelKey: 'compare.cta' };

  return {
    kind, card, cardIsFirst, headline, blockedHearts,
    chipKey: heartStyle ? 'result.chip.heart' : 'result.noHeart.title',
    otherHearts: reachable.filter((r) => r.code !== card.code),
    showWhatIf,
    allLow: showWhatIf && (kind === 'noheart' || kind === 'blocked'),
    top3,
    topTitleKey: cardIsFirst || tie ? 'result.next' : 'result.top3',
    tie,
    compare,
  };
}
