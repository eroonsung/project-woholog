import { t } from '@/lib/copy';

/** Soon 뱃지: 색(라임) + 글자로 함께 표시한다 (SPEC 1장, CLAUDE.md 규칙 13). */
export function SoonBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-pill bg-lime px-2 py-0.5 text-caption font-extrabold uppercase text-navy ${className}`}>
      {t('nav.soon')}
    </span>
  );
}
