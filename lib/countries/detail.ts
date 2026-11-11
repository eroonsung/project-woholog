import { buildCompare, checkingCell, workLimitLines, type Cell, type RowId } from '@/lib/compare/build';
import { adaptRows, type DbRows } from '@/lib/engine';
import { t } from '@/lib/copy';
import type { CountryAppRow, SourceLinkRow } from '@/lib/data/queries';
import { formatNumber } from '@/lib/format';
import { buildPreview, latestRates } from '@/lib/result/preview';
import { moneyText } from '@/lib/result/previewText';

/**
 * 나라 상세(/countries/[code], SPEC 8장)에 보여 줄 값. DB 값을 글자로 바꿀 뿐 계산은 하지 않는다(필요한 돈은 엔진 adapter 값).
 * 값이 없으면 "확인 중", 확인일이 stale_days(기본 180일)를 넘으면 "확인 필요". 문구는 copy 키만 쓴다.
 */
export interface DetailLine { label: string; text: string; checking: boolean }
export interface DetailCard { id: string; title: string; body?: string; checking: boolean }
export interface DetailSource { publisher: string; url: string | null; verifiedAt: string; stale: boolean }
export interface DetailApp { name: string; category: string; note: string | null; url: string | null }

export interface CountryDetail {
  code: string;
  nameKo: string;
  comingSoon: boolean;
  tags: string[]; // 나이 · 기간·횟수 · 선발 방식(+인원)
  safety: { level: 'caution' | 'avoid'; text: string } | null;
  glance: { id: 'money' | 'wage' | 'rent' | 'next'; label: string; cell: Cell }[];
  money: { rows: DetailLine[]; total: Cell; fxDate: string | null };
  work: { limits: string[]; study: DetailLine; job: string | null; notes: string[] };
  apply: { next: Cell; items: DetailLine[] };
  life: DetailCard[];
  apps: DetailApp[];
  sources: DetailSource[];
  verifiedAt: string | null;
  stale: boolean;
}

const DAY_MS = 86_400_000;
const APPLY_FACTS = ['apply_method', 'extension', 'insurance_required', 'medical_check', 'proof_note', 'special_note'] as const;

export function buildDetail(rows: DbRows, extras: { apps: CountryAppRow[]; sourceLinks: SourceLinkRow[] }, code: string, today: string): CountryDetail | null {
  const program = rows.programs.find((p) => p.origin === 'KR' && p.destination === code && p.kind === 'working_holiday');
  const country = rows.countries.find((c) => c.code === code);
  if (!program || !country) return null;

  const data = adaptRows(rows, { asOf: today });
  const a = data.active.find((x) => x.code === code);
  const staleDays = ((rows.config.find((r) => r.key === 'stale_days')?.value as { badge?: number } | undefined)?.badge) ?? 180;
  const cells = buildCompare(rows, [code], today)[0]?.cells;
  const cell = (id: RowId): Cell => cells?.[id] ?? checkingCell();
  const fact = (key: string) => rows.facts.find((f) => f.program_id === program.id && f.key === key);
  const preview = buildPreview(rows, code, today, data.config, [], a?.engine.needMan ?? null);
  const checking = t('status.checking');

  // 위쪽 태그
  const quota = program.annual_quota ? ` (${t('compare.sel.quota', { n: formatNumber(program.annual_quota) })})` : '';
  const tags = [
    t('compare.age', { min: program.age_min, max: program.age_max }),
    `${t('detail.stay', { months: program.stay_months })}${program.max_participations >= 2 ? ` · ${t('detail.stay.twice')}` : ''}`,
    `${t(`compare.sel.${program.selection}`)}${quota}`,
  ];

  // 여행경보 배너: caution·avoid, 문장은 safety_note
  const level = country.safety_level;
  const safety: CountryDetail['safety'] = level === 'caution' || level === 'avoid'
    ? { level: level as 'caution' | 'avoid', text: country.safety_note ? t('detail.safety.banner', { text: country.safety_note }) : t('detail.safety.bannerNoNote') }
    : null;

  // 필요한 돈
  const m = preview?.money;
  const amount = (v: NonNullable<typeof m>['proof']): { text: string; checking: boolean } =>
    v === null ? { text: checking, checking: true } : v.amount === 0 ? { text: t('detail.money.none'), checking: false } : { text: moneyText(v), checking: false };
  const moneyRows: DetailLine[] = [
    { label: t('detail.money.proof'), ...amount(m?.proof ?? null) },
    { label: t('detail.money.fee'), ...amount(m?.fee ?? null) },
    ...(m?.health && m.health.amount > 0 ? [{ label: t('detail.money.health'), ...amount(m.health) }] : []),
    { label: t('detail.money.flight'), text: m?.flightMan != null ? t('money.man', { man: formatNumber(m.flightMan) }) : checking, checking: m?.flightMan == null },
  ];

  // 일·어학
  const studyMonths = fact('study_max_months')?.value_num ?? null;
  const studyNote = fact('study_note')?.value_text ?? null;
  const study: DetailLine = studyMonths === null
    ? { label: t('compare.row.study'), text: t('detail.work.study.unknown'), checking: true }
    : { label: t('compare.row.study'), text: studyMonths >= data.config.study_unlimited_months ? t('detail.work.study.none') : t('detail.work.study', { months: studyMonths }), checking: false };
  const workNote = fact('work_note')?.value_text;
  const job = preview?.job ? t('detail.work.job', { job: preview.job.text }) : null;

  // 신청 방법
  const items: DetailLine[] = APPLY_FACTS.flatMap((key) => {
    const text = fact(key)?.value_text;
    return text ? [{ label: t(`detail.apply.${key}`), text, checking: false }] : [];
  });

  // 생활 정보: 한국인 · 물가 · 거리 (구간은 엔진 adapter 값)
  const e = a?.engine;
  const statValue = (metric: string) => { const l = rows.stats.filter((s) => s.country === code && s.metric === metric); return (l.find((s) => s.city === '') ?? [...l].sort((x, y) => y.value - x.value)[0])?.value ?? null; };
  const pop = statValue('korean_population');
  const price = statValue('price_level_kr100');
  const KOREAN_KEY = { low: 'ok', mid: 'partial', high: 'no' } as const; // 한국인 적음 = few_koreans ok
  const PRICE_KEY = { low: 'ok', mid: 'partial', high: 'no' } as const;
  const life: DetailCard[] = [
    e?.korean ? { id: 'korean', title: t(`reason.priority.few_koreans.${KOREAN_KEY[e.korean]}`), body: pop !== null ? t('compare.korean.n', { n: formatNumber(pop) }) : undefined, checking: false } : { id: 'korean', title: `${t('compare.row.korean')}: ${checking}`, checking: true },
    e?.price ? { id: 'price', title: t(`reason.priority.low_cost.${PRICE_KEY[e.price]}`), body: price !== null ? t('detail.life.price.n', { n: formatNumber(price) }) : undefined, checking: false } : { id: 'price', title: `${t('detail.life.price')}: ${checking}`, checking: true },
    e ? { id: 'distance', title: t(e.nearKorea ? 'reason.priority.near_korea.ok' : 'reason.priority.near_korea.no'), checking: false } : { id: 'distance', title: `${t('compare.row.distance')}: ${checking}`, checking: true },
  ];

  // 필수 앱
  const apps: DetailApp[] = extras.apps.filter((x) => x.country === code).sort((x, y) => x.name.localeCompare(y.name, 'ko'))
    .map((x) => ({ name: x.name, category: t(`apps.cat.${x.category}`), note: x.note_ko, url: x.url }));

  // 출처: 이 나라 프로그램 값과 통계 값에 쓰인 출처. 같은 출처는 가장 오래된 확인일로 합친다
  const used: { sourceId: number; verifiedAt: string }[] = [
    ...rows.facts.filter((f) => f.program_id === program.id && f.source_id != null).map((f) => ({ sourceId: f.source_id!, verifiedAt: f.verified_at })),
    ...rows.stats.filter((s) => s.country === code && s.source_id != null).map((s) => ({ sourceId: s.source_id!, verifiedAt: s.verified_at })),
  ];
  const oldest = new Map<number, string>();
  for (const u of used) if (!oldest.has(u.sourceId) || u.verifiedAt < oldest.get(u.sourceId)!) oldest.set(u.sourceId, u.verifiedAt);
  const isStale = (iso: string) => (Date.parse(today) - Date.parse(iso)) / DAY_MS > staleDays;
  const sources: DetailSource[] = [...oldest].map(([id, verifiedAt]) => {
    const link = extras.sourceLinks.find((l) => l.id === id);
    return { publisher: link?.publisher ?? rows.sources.find((s) => s.id === id)?.publisher ?? checking, url: link?.url ?? null, verifiedAt, stale: isStale(verifiedAt) };
  }).sort((x, y) => x.publisher.localeCompare(y.publisher, 'ko'));
  const all = used.map((u) => u.verifiedAt).sort();
  const verifiedAt = a?.provenance.verifiedAt ?? all[0] ?? null;

  return {
    code, nameKo: country.name_ko, comingSoon: !a, tags, safety,
    glance: [
      { id: 'money', label: t('compare.row.money'), cell: cell('money') },
      { id: 'wage', label: t('compare.row.wage'), cell: cell('wage') },
      { id: 'rent', label: t('compare.row.rent'), cell: cell('rent') },
      { id: 'next', label: t('compare.row.next'), cell: cell('next') },
    ],
    money: { rows: moneyRows, total: cell('money'), fxDate: latestRates(rows, today).fxDate },
    work: {
      limits: workLimitLines(fact),
      study: { ...study, text: studyNote ? `${study.text} — ${studyNote}` : study.text },
      job,
      notes: workNote ? [t('detail.work.note', { text: workNote })] : [],
    },
    apply: { next: cell('next'), items },
    life, apps, sources, verifiedAt, stale: verifiedAt !== null && isStale(verifiedAt),
  };
}
