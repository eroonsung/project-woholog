import { FitMark } from '@/components/ui/FitMark';
import { t } from '@/lib/copy';
import type { ItemId, ReasonLine } from '@/lib/engine';
import { itemLabel, reasonText } from '@/lib/result/text';

/** 조건 줄: ✗ → △ → ✓ 순서(저장된 순서 그대로), 각 줄은 모양 + 항목 이름 + 이유 한 문장 (SPEC 4.3). 확인 중인 조건은 맨 아래에 회색 "확인 중" 뱃지로. */
export function ConditionList({ lines, unknown, countryName }: { lines: ReasonLine[]; unknown: ItemId[]; countryName: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line, i) => (
        <li key={`${line.kind}-${line.itemId}-${i}`} className="flex items-start gap-3 rounded-card bg-subtle px-4 py-3">
          <FitMark mark={line.mark} text={t(`mark.${line.mark}`)} />
          <div className="min-w-0 flex-1">
            <p className="text-caption font-extrabold text-navy">{itemLabel(line)}</p>
            <p className="text-body text-navy">{reasonText(line, { country: countryName })}</p>
          </div>
        </li>
      ))}
      {unknown.map((id) => {
        const money = id === 'money';
        return (
          <li key={`unknown-${id}`} className="flex items-start gap-3 rounded-card bg-subtle px-4 py-3">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-caption font-extrabold text-text3">?</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-caption font-extrabold text-navy">
                {money ? t('item.money') : t(`q12.opt.${id}`, {})}
                <span className="rounded-pill bg-white px-2 py-0.5 text-caption font-bold text-text2">{t('status.checking')}</span>
              </p>
              <p className="text-body text-text2">{money ? t('result.confirming') : t('status.checking.tip')}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
