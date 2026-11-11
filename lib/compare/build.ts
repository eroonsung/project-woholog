import { adaptRows, type DbRows } from '@/lib/engine';
import { t } from '@/lib/copy';
import { flightLine, flightOf } from '@/lib/flight';
import { formatKoDate, formatNumber } from '@/lib/format';
import { buildPreview, latestRates, nextApply } from '@/lib/result/preview';
import { nextApplyText, previewRows } from '@/lib/result/previewText';

/**
 * 나란히 비교 표의 값 (SPEC 6장). DB 값을 글자로 바꿔 줄 뿐 점수·%·✓△✗는 계산하지 않는다(그건 저장된 결과에서 온다).
 * 값이 없으면 `checking: true`("확인 중"). 문구는 copy 키만 쓴다.
 */
export const ROW_IDS = ['age', 'stay', 'selection', 'money', 'wage', 'rent', 'work', 'study', 'next', 'korean', 'distance', 'source'] as const;
export type RowId = (typeof ROW_IDS)[number];

export interface Cell {
  text: string;
  extra: string[]; // 작은 글씨 보충 줄
  checking: boolean; // 값이 없어 "확인 중"
  stale?: boolean; // 확인일이 오래돼 "확인 필요"
}

export interface CompareCountry {
  code: string;
  nameKo: string;
  safety: boolean; // 외교부 여행경보가 있는 나라
  cells: Record<RowId, Cell>;
}

export interface CompareOption { code: string; nameKo: string }

export const checkingCell = (): Cell => ({ text: t('status.checking'), extra: [], checking: true });
const cell = (text: string, extra: string[] = []): Cell => ({ text, extra, checking: false });

/** 비교할 수 있는 나라(active 프로그램): 이름(가나다) 순 */
export function compareOptions(rows: DbRows, today: string): CompareOption[] {
  return adaptRows(rows, { asOf: today }).active.map((a) => ({ code: a.code, nameKo: a.nameKo }));
}

/** 일 제한 줄(있는 것만): 한 고용주 기간 · 총 취업 기간 · 정규직 불가 · 금지 업종. 나라 상세도 같은 줄을 쓴다. */
export function workLimitLines(fact: (key: string) => { value_num: number | null; value_text: string | null } | undefined): string[] {
  const employer = fact('employer_limit_months')?.value_num;
  const total = fact('work_limit_months')?.value_num;
  const prohibited = fact('prohibited_work')?.value_text;
  return [
    employer != null ? t('detail.work.employer', { months: employer }) : null,
    total != null ? t('compare.work.total', { months: total }) : null,
    fact('no_fulltime')?.value_num === 1 ? t('detail.work.noFulltime') : null,
    prohibited ? t('detail.work.prohibited', { text: prohibited }) : null,
  ].filter((x): x is string => x !== null);
}

export function buildCompare(rows: DbRows, codes: readonly string[], today: string): CompareCountry[] {
  const data = adaptRows(rows, { asOf: today });
  const { rate } = latestRates(rows, today);
  const out: CompareCountry[] = [];

  for (const code of codes) {
    const a = data.active.find((x) => x.code === code);
    const program = rows.programs.find((p) => p.origin === 'KR' && p.destination === code && p.kind === 'working_holiday' && p.status === 'active');
    if (!a || !program) continue;
    const e = a.engine;
    const fact = (key: string) => rows.facts.find((f) => f.program_id === program.id && f.key === key);
    const preview = buildPreview(rows, code, today, data.config, [], e.needMan);

    // 기간·횟수
    const stay = cell(t('detail.stay', { months: program.stay_months }), [
      ...(program.long_stay_months && program.long_stay_months > program.stay_months ? [t('compare.stay.long', { long: program.long_stay_months })] : []),
      ...(program.max_participations >= 2 ? [t('detail.stay.twice')] : []),
    ]);

    // 선발 방식
    const selection = cell(t(`compare.sel.${program.selection}`), program.annual_quota ? [t('compare.sel.quota', { n: formatNumber(program.annual_quota) })] : []);

    // 필요한 돈(분해는 결과의 현실 미리보기와 같은 글)
    const money = e.needMan === null || !preview ? checkingCell() : cell(t('money.krw', { man: formatNumber(e.needMan) }), [previewRows(preview, today, undefined)[0]?.sub].filter((x): x is string => !!x));

    // 시급: 외화 + 원화 환산(환율이 있을 때), 월급에서 구한 값이면 안내
    let wage = checkingCell();
    if (preview?.wage) {
      const w = preview.wage;
      const per = rate.get(w.currency);
      wage = cell(`${w.currency} ${formatNumber(w.amount)}${w.city ? ` (${w.city})` : ''}`, [
        ...(per !== undefined && w.currency !== 'KRW' ? [t('compare.wage.krw', { krw: formatNumber(Math.round((w.amount * per) / 100) * 100) })] : []),
        ...(w.derived ? [t('compare.wage.derived')] : []),
      ]);
    }

    // 월세
    let rent = checkingCell();
    if (preview?.rent) {
      const r = preview.rent;
      const amount = `${r.currency} ${formatNumber(r.amount)}${r.max !== null ? `~${formatNumber(r.max)}` : ''}${r.city ? ` (${r.city})` : ''}`;
      const krwText = r.currency !== 'KRW' && r.krwMan != null ? (r.max !== null && r.krwMaxMan != null ? t('money.krwRange', { min: formatNumber(r.krwMan), max: formatNumber(r.krwMaxMan) }) : t('money.krw', { man: formatNumber(r.krwMan) })) : null;
      rent = cell(r.unit === 'month' ? amount : t('preview.rent.week', { rent: amount }), krwText ? [krwText] : []);
    }

    // 일 제한: 한 고용주 기간 · 총 취업 기간 · 정규직 불가 · 금지 업종. 하나도 없으면 "알려진 제한 없음"
    const workLines = workLimitLines(fact);
    const work = workLines.length ? cell(workLines[0]!, workLines.slice(1)) : cell(t('compare.work.none'));

    // 어학원
    const study = e.studyMaxMonths === null ? checkingCell()
      : e.studyMaxMonths >= data.config.study_unlimited_months ? cell(t('detail.work.study.none'))
      : cell(t('compare.study', { months: e.studyMaxMonths }));

    // 다음 접수
    const apply = preview ? nextApply(preview.next, today) : { kind: 'unknown' as const };
    const next = apply.kind === 'unknown' ? cell(t('preview.next.unknown')) : cell(nextApplyText(apply));

    // 한국인: 많음·보통·적음 + 인원 수
    const pop = rows.stats.filter((s) => s.country === code && s.metric === 'korean_population');
    const popRow = pop.find((s) => s.city === '') ?? [...pop].sort((x, y) => y.value - x.value)[0];
    const korean = e.korean === null ? checkingCell() : cell(t(`compare.korean.${e.korean}`), popRow ? [t('compare.korean.n', { n: formatNumber(popRow.value) })] : []);

    // 거리
    const fl = flightLine(flightOf(rows.countries.find((c) => c.code === code)), e.nearKorea);
    const distance = cell(fl.main, fl.small ? [fl.small] : []);

    // 출처 확인일
    const { verifiedAt, publishers, stale } = a.provenance;
    const source: Cell = verifiedAt
      ? { text: formatKoDate(verifiedAt), extra: publishers.length ? [`${publishers[0]}${publishers.length > 1 ? ' 외' : ''}`] : [], checking: false, stale }
      : checkingCell();

    out.push({
      code, nameKo: a.nameKo, safety: a.safetyLevel !== 'normal',
      cells: { age: cell(t('compare.age', { min: program.age_min, max: program.age_max })), stay, selection, money, wage, rent, work, study, next, korean, distance, source },
    });
  }
  return out;
}
