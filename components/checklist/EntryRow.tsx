import type { Entry, Timing } from '@/lib/checklist';
import { t } from '@/lib/copy';
import { formatKoDate, formatKoRange } from '@/lib/format';

const pill = 'inline-flex shrink-0 items-center rounded-pill px-2 py-0.5 text-caption font-extrabold';

/** 체크리스트 항목 1개 (S15): 체크 칸 + 제목 + 표시(서류·확인 필요·늦었어요) + 날짜 + 설명 + 서류 뱃지 + 출처. 색만으로 구분하지 않고 글자도 함께 쓴다. */
export function EntryRow({ entry, timing, done, publisher, onToggle }: {
  entry: Entry; timing: Timing; done: boolean; publisher: string | null; onToggle: () => void;
}) {
  const { doc } = entry;
  return (
    <li className="rounded-card border border-line bg-white">
      <label className="flex min-h-11 cursor-pointer items-start gap-3 p-4">
        <input type="checkbox" checked={done} onChange={onToggle} className="mt-0.5 size-6 shrink-0 cursor-pointer accent-aqua-dark" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`text-body-l font-extrabold ${done ? 'text-text3 line-through' : 'text-navy'}`}>{entry.title}</span>
            {entry.kind === 'doc' ? <span className={`${pill} bg-aqua-100 text-aqua-dark`}>{t('checklist.tag.doc')}</span> : null}
            {doc?.maxAgeDays ? <span className={`${pill} bg-coral-50 text-coral-dark`}>{t('checklist.tag.valid', { days: doc.maxAgeDays })}</span> : null}
            {doc?.translation ? <span className={`${pill} bg-coral-50 text-coral-dark`}>{t('checklist.tag.translate')}</span> : null}
            {doc?.apostille ? <span className={`${pill} bg-coral-50 text-coral-dark`}>{t('checklist.tag.apostille')}</span> : null}
            {entry.needsReview ? <span className={`${pill} bg-subtle text-text2`}>{t('status.stale')}</span> : null}
            {timing.late ? <span className={`${pill} bg-subtle text-text2`}>{t('checklist.late')}</span> : null}
          </span>
          {timing.label ? (
            <span className="text-caption font-extrabold text-text2">{timing.label}{timing.date ? ` · ${formatKoRange(timing.date, timing.date)}` : ''}</span>
          ) : null}
        </span>
      </label>
      {entry.body || doc?.issuer || publisher ? (
        <div className="mx-4 mb-4 rounded-card bg-subtle p-3 text-body text-text2 sm:ml-13">
          {entry.body ? <p>{entry.body}</p> : null}
          {doc?.issuer ? <p className="mt-1 text-caption">{t('checklist.doc.issuer', { issuer: doc.issuer })}</p> : null}
          {publisher ? <p className="mt-1 text-caption text-text3">{t('source.line', { date: formatKoDate(entry.verifiedAt), publisher })}</p> : null}
        </div>
      ) : null}
    </li>
  );
}
