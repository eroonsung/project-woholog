import { t } from '@/lib/copy';
import type { Badge } from '@/lib/engine';

/** 주의 뱃지(추첨·안전 주의·일하며 지내기 어려움): 색(코랄)과 글자로 함께 표시한다 (디자인 가이드 색 적용 규칙, CLAUDE.md 규칙 13) */
export function CountryBadges({ badges, safety }: { badges: Badge[]; safety: boolean }) {
  const pill = 'inline-flex shrink-0 items-center rounded-pill bg-coral-50 px-2 py-0.5 text-caption font-extrabold text-coral-dark';
  return (
    <>
      {badges.includes('lottery') ? <span className={pill}>{t('badge.lottery')}</span> : null}
      {badges.includes('hard_to_live') ? <span className={pill}>{t('badge.hardToLive')}</span> : null}
      {safety ? <span className={pill}>{t('badge.safety')}</span> : null}
    </>
  );
}
