import { Ban, ChevronDown } from 'lucide-react';
import { Flag } from '@/components/ui/Flag';
import { t } from '@/lib/copy';
import { blockReasonText } from '@/lib/result/text';
import type { StoredResult } from '@/lib/result/types';

/** "지금은 갈 수 없는 나라 N곳": 처음에는 접혀 있고, 펼치면 나라 + 이유(나이 제한·이미 다녀옴·모집 중단) (SPEC 4.5). 네이티브 <details>라 키보드로 펼친다. */
export function BlockedList({ result }: { result: StoredResult }) {
  const items = [
    ...result.blocked.map((b) => ({ code: b.code, name: result.countries[b.code]?.nameKo ?? b.code, reason: blockReasonText(b.reason) })),
    ...result.comingSoon.map((c) => ({ code: c.code, name: c.nameKo, reason: blockReasonText({ kind: 'inactive' }) })),
  ];
  if (items.length === 0) return null;
  return (
    <details className="group rounded-card-lg bg-subtle">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-h3 text-navy [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2"><Ban aria-hidden="true" className="size-5 text-text3" />{t('result.blocked', { n: items.length })}</span>
        <ChevronDown aria-hidden="true" className="size-5 text-text3 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="flex flex-col gap-2 px-5 pb-5">
        {items.map((item) => (
          <li key={item.code} className="flex items-center gap-3 rounded-card bg-white px-4 py-3">
            <Flag code={item.code} />
            <span className="text-body font-extrabold text-navy">{item.name}</span>
            <span className="ml-auto text-caption text-text2">{item.reason}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
