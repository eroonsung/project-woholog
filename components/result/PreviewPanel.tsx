import { Briefcase, CalendarDays, Eye, Home, Wallet, type LucideIcon } from 'lucide-react';
import { t } from '@/lib/copy';
import { formatKoDate } from '@/lib/format';
import type { PreviewRow } from '@/lib/result/previewText';

const ICONS: Record<PreviewRow['id'], { Icon: LucideIcon; box: string }> = {
  money: { Icon: Wallet, box: 'bg-aqua-100 text-aqua-dark' },
  job: { Icon: Briefcase, box: 'bg-aqua-50 text-aqua-dark' },
  rent: { Icon: Home, box: 'bg-coral-50 text-coral-dark' },
  next: { Icon: CalendarDays, box: 'bg-aqua-50 text-aqua-dark' },
};

/** 현실 미리보기: 4줄 고정 (SPEC 4.4). 값이 없는 줄은 "확인 중". 외화가 있으면 환율 기준일을 아래에 한 번 보여 준다 (SPEC 0.3). */
export function PreviewPanel({ rows, fxDate }: { rows: PreviewRow[]; fxDate: string | null }) {
  return (
    <section aria-labelledby="preview-title" className="rounded-card-lg bg-subtle p-5 lg:p-6">
      <h2 id="preview-title" className="mb-4 flex items-center gap-2 text-h3 text-navy">
        <Eye aria-hidden="true" className="size-5 text-aqua-dark" />
        {t('preview.title')}
      </h2>
      <ul className="flex flex-col gap-2">
        {rows.map(({ id, label, value, sub, extra }) => {
          const { Icon, box } = ICONS[id];
          return (
            <li key={id} className="flex items-start gap-3 rounded-card bg-white p-4">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-button ${box}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-caption font-bold text-text2">{label}</p>
                <p className="text-body-l font-extrabold text-navy">{value}</p>
                {sub ? <p className="text-caption text-text2">{sub}</p> : null}
                {extra ? <p className="mt-1 text-caption font-bold text-coral-dark">{extra}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
      {fxDate ? <p className="mt-3 text-caption text-text3">{t('fx.line', { date: formatKoDate(fxDate) })}</p> : null}
    </section>
  );
}
