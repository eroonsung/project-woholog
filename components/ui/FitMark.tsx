import { Check, Minus, Triangle } from 'lucide-react';

export type Mark = 'ok' | 'warn' | 'no';

const styles: Record<Mark, { box: string; label: string }> = {
  ok: { box: 'bg-aqua-100 text-aqua-dark', label: '✓' },
  warn: { box: 'bg-coral-50 text-coral-dark', label: '△' },
  no: { box: 'bg-subtle text-text3', label: '✗' },
};

/**
 * 적합도 표시. 색만이 아니라 모양(아이콘)과 글자(스크린리더용)로도 구분한다 (CLAUDE.md 규칙 13).
 * ✗에는 빨간색을 쓰지 않는다. `text`는 호출하는 쪽이 copy 키로 넘긴다.
 */
export function FitMark({ mark, text }: { mark: Mark; text: string }) {
  const { box, label } = styles[mark];
  const Icon = mark === 'ok' ? Check : mark === 'warn' ? Triangle : Minus;
  return (
    <span className={`inline-flex size-7 items-center justify-center rounded-full ${box}`}>
      <Icon aria-hidden="true" className="size-4" strokeWidth={2.25} />
      <span className="sr-only">{`${label} ${text}`}</span>
    </span>
  );
}
