import { Check, Triangle, X } from 'lucide-react';

import type { Mark } from '@/lib/engine';

export type { Mark };

const styles: Record<Mark, { box: string; label: string }> = {
  ok: { box: 'bg-aqua-100 text-aqua-dark', label: '✓' },
  partial: { box: 'bg-coral-50 text-coral-dark', label: '△' },
  no: { box: 'bg-subtle text-text3', label: '✗' },
};

/**
 * 적합도 표시. 색만이 아니라 모양(아이콘)과 글자(스크린리더용)로도 구분한다 (CLAUDE.md 규칙 13).
 * ✗에는 빨간색을 쓰지 않는다. `text`는 호출하는 쪽이 copy 키로 넘긴다.
 */
export function FitMark({ mark, text, small = false }: { mark: Mark; text: string; small?: boolean }) {
  const { box, label } = styles[mark];
  const Icon = mark === 'ok' ? Check : mark === 'partial' ? Triangle : X;
  return (
    <span className={`inline-flex items-center justify-center rounded-full ${small ? 'size-5' : 'size-7'} ${box}`}>
      <Icon aria-hidden="true" className={small ? 'size-3' : 'size-4'} strokeWidth={2.25} />
      <span className="sr-only">{`${label} ${text}`}</span>
    </span>
  );
}
