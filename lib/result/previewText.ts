import { t } from '@/lib/copy';
import { formatKoDate, formatKoRange, formatNumber } from '@/lib/format';
import { isLate, nextApply, type NextApply } from './preview';
import type { StoredMoney, StoredPreview } from './types';

/** "현실 미리보기" 4줄 (SPEC 4.4): 필요한 돈 · 대표 일자리+시급 · 월세 · 다음 접수. 값이 없는 줄은 "확인 중". 문구는 copy 키만 쓴다. */
export interface PreviewRow {
  id: 'money' | 'job' | 'rent' | 'next';
  label: string;
  value: string;
  sub?: string; // 필요한 돈의 분해(잔고 증명 + 비자 비용 + 항공권)
  extra?: string; // "원하는 시기보다 접수가 늦어요"
}

const man = (n: number) => t('money.krw', { man: formatNumber(n) });

/** 외화는 "CAD 2,500 (약 250만 원)", 원화는 "약 280만 원" (SPEC 0.3). 환율이 없으면 외화 금액만. */
export function moneyText(m: StoredMoney): string {
  if (m.currency === 'KRW') return man(Math.round(m.amount / 10_000));
  const base = `${m.currency} ${formatNumber(m.amount)}`;
  return m.man === null ? base : t('money.foreign', { currency: m.currency, amount: formatNumber(m.amount), krw: man(m.man) });
}

const place = (city: string) => (city ? `(${city})` : '');

/** 다음 접수 글자(앞에 "다음 접수"를 붙이지 않은 값). unknown이면 빈 글자 */
export function nextApplyText(apply: NextApply): string {
  switch (apply.kind) {
    case 'window': {
      const date = apply.closesOn ? formatKoRange(apply.opensOn, apply.closesOn) : formatKoDate(apply.opensOn);
      return apply.note ? `${date} (${apply.note})` : date;
    }
    case 'always': return t('preview.next.always');
    case 'first_come': return apply.quota ? t('preview.next.firstCome', { n: formatNumber(apply.quota) }) : t('preview.next.firstComeNoQuota');
    case 'lottery': return apply.quota ? t('preview.next.lottery', { n: formatNumber(apply.quota) }) : t('preview.next.lotteryNoQuota');
    default: return '';
  }
}

export function previewRows(preview: StoredPreview | undefined, today: string, when: string | undefined): PreviewRow[] {
  const checking = t('status.checking');
  const label = (id: PreviewRow['id']) => t(`preview.label.${id}`);
  if (!preview) {
    return (['money', 'job', 'rent', 'next'] as const).map((id) => ({ id, label: label(id), value: checking }));
  }

  // 필요한 돈
  const { money } = preview;
  const parts = [
    money.proof && money.proof.amount > 0 ? t('preview.part.proof', { value: moneyText(money.proof) }) : null,
    money.fee && money.fee.amount > 0 ? t('preview.part.fee', { value: moneyText(money.fee) }) : null,
    money.health && money.health.amount > 0 ? t('preview.part.health', { value: moneyText(money.health) }) : null,
    money.flightMan !== null ? t('preview.part.flight', { value: t('money.man', { man: formatNumber(money.flightMan) }) }) : null,
  ].filter((p): p is string => p !== null);
  const moneyRow: PreviewRow = {
    id: 'money', label: label('money'),
    value: money.needMan === null ? checking : t('preview.money', { need: formatNumber(money.needMan) }),
    sub: money.needMan === null ? undefined : parts.join(' + '),
  };

  // 대표 일자리 + 시급
  const w = preview.wage;
  const wage = w ? `${w.currency} ${formatNumber(w.amount)}${w.krw && w.currency !== 'KRW' ? ` (${t('compare.wage.krw', { krw: formatNumber(w.krw) })})` : ''}${w.city ? ` · ${w.city}` : ''}` : null;
  const jobRow: PreviewRow = {
    id: 'job', label: label('job'),
    value: !preview.job && !wage ? checking : t('preview.job', { job: preview.job?.text ?? checking, wage: wage ?? checking }),
  };

  // 월세(월세 값이 없고 주당 값만 있으면 주당)
  const r = preview.rent;
  const rentKrw = r && r.currency !== 'KRW' && r.krwMan != null ? ` (${r.max !== null && r.krwMaxMan != null ? t('money.krwRange', { min: formatNumber(r.krwMan), max: formatNumber(r.krwMaxMan) }) : t('money.krw', { man: formatNumber(r.krwMan) })})` : '';
  const rentText = r ? `${r.currency} ${formatNumber(r.amount)}${r.max !== null ? `~${formatNumber(r.max)}` : ''}${rentKrw}${r.city ? ` · ${r.city}` : ''}` : null;
  const rentRow: PreviewRow = {
    id: 'rent', label: label('rent'),
    value: !r || !rentText ? checking : r.unit === 'month' ? t('preview.rent', { rent: rentText }) : t('preview.rent.week', { rent: rentText }),
  };

  // 다음 접수: 오늘 이후 가장 가까운 기간 → 상시 → 선착순(연 N명) → 추첨 → 아직 안 나왔어요
  const apply = nextApply(preview.next, today);
  const nextValue = apply.kind === 'unknown' ? t('preview.next.unknown') : t('preview.next', { window: nextApplyText(apply) });
  const nextRow: PreviewRow = { id: 'next', label: label('next'), value: nextValue, extra: isLate(apply, when, today) ? t('preview.next.late') : undefined };

  return [moneyRow, jobRow, rentRow, nextRow];
}
