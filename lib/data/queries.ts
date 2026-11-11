import type { DbRows } from '@/lib/engine/adapter';
import { getPublicClient } from './supabase';

/** DB 읽기는 이 파일에서만 한다. 화면에서 직접 쿼리하지 않는다(CLAUDE.md 5장). */

async function rows<T>(table: string, columns: string): Promise<T[]> {
  const { data, error } = await getPublicClient().from(table).select(columns).limit(5000);
  if (error) throw new Error(`${table} 읽기 실패: ${error.message}`);
  return (data ?? []) as unknown as T[];
}

/** 공유 링크로 결과 하나 읽기 (get_quiz_result 함수만 쓴다: 전체 목록 조회는 막혀 있음). 없거나 지워졌으면 null */
export async function fetchQuizResult(id: string) {
  const { data, error } = await getPublicClient().rpc('get_quiz_result', { result_id: id });
  if (error) throw new Error(`결과 읽기 실패: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { answers: row.answers as unknown, result: row.result as unknown, createdAt: row.created_at as string, dataChanged: row.data_changed === true };
}

/** adapter에 넘길 행 전체. 현재 값(valid_to 없음)만 읽는다. */
export async function fetchAdapterRows(): Promise<DbRows> {
  const db = getPublicClient();
  const current = async <T>(table: string, columns: string): Promise<T[]> => {
    const { data, error } = await db.from(table).select(columns).is('valid_to', null).limit(5000);
    if (error) throw new Error(`${table} 읽기 실패: ${error.message}`);
    return (data ?? []) as unknown as T[];
  };
  const [countries, programs, facts, stats, rates, flights, windows, jobTypes, sources, config] = await Promise.all([
    rows<DbRows['countries'][number]>('countries', 'code,name_ko,region,english,languages,in_europe,near_korea,safety_level,safety_note'),
    rows<DbRows['programs'][number]>('programs', 'id,origin,destination,kind,status,age_min,age_max,selection,max_participations,stay_months,long_stay_months,annual_quota'),
    current<DbRows['facts'][number]>('program_facts', 'program_id,key,value_num,value_text,currency,source_id,verified_at'),
    current<DbRows['stats'][number]>('country_stats', 'country,city,metric,value,value_max,currency,as_of,verified_at,source_id'),
    rows<DbRows['rates'][number]>('exchange_rates', 'currency,krw_per_unit,rate_date'),
    rows<DbRows['flights'][number]>('flight_estimates', 'region,krw'),
    rows<DbRows['windows'][number]>('application_windows', 'program_id,opens_on,closes_on,note,verified_at'),
    rows<DbRows['jobTypes'][number]>('job_types', 'country,job_code,description_ko,language'),
    rows<DbRows['sources'][number]>('sources', 'id,publisher'),
    rows<DbRows['config'][number]>('scoring_config', 'key,value'),
  ]);
  return { countries, programs, facts, stats, rates, flights, windows, jobTypes, sources, config };
}

/** 나라 상세(7단계)에만 쓰는 값: 필수 앱, 출처 링크 */
export interface CountryAppRow { country: string; name: string; category: string; url: string | null; note_ko: string | null; verified_at: string }
export interface SourceLinkRow { id: number; url: string; publisher: string }

export async function fetchDetailExtras(): Promise<{ apps: CountryAppRow[]; sourceLinks: SourceLinkRow[] }> {
  const db = getPublicClient();
  const [apps, links] = await Promise.all([
    db.from('country_apps').select('country,name,category,url,note_ko,verified_at').eq('active', true).limit(5000),
    db.from('sources').select('id,url,publisher').limit(5000),
  ]);
  if (apps.error) throw new Error(`country_apps 읽기 실패: ${apps.error.message}`);
  if (links.error) throw new Error(`sources 읽기 실패: ${links.error.message}`);
  return { apps: (apps.data ?? []) as CountryAppRow[], sourceLinks: (links.data ?? []) as SourceLinkRow[] };
}

/** 체크리스트(8단계)에 쓰는 값: 항목(공통 + 나라)과 비자 서류. 사용 중(active)인 항목만 읽는다. */
export interface ChecklistItemRow {
  id: number; program_id: number | null; phase: string; days_offset: number | null; sort_order: number;
  title_ko: string; body_ko: string | null; source_id: number | null; verified_at: string; needs_review: boolean;
}
export interface RequiredDocRow {
  id: number; program_id: number; sort_order: number; title_ko: string; body_ko: string | null; issuer: string | null;
  max_age_days: number | null; translation_required: boolean; apostille_required: boolean; source_id: number | null; verified_at: string; needs_review: boolean;
}
export interface ChecklistRows { items: ChecklistItemRow[]; docs: RequiredDocRow[] }

export async function fetchChecklistRows(): Promise<ChecklistRows> {
  const db = getPublicClient();
  const [items, docs] = await Promise.all([
    db.from('checklist_items').select('id,program_id,phase,days_offset,sort_order,title_ko,body_ko,source_id,verified_at,needs_review').eq('active', true).limit(5000),
    db.from('required_documents').select('id,program_id,sort_order,title_ko,body_ko,issuer,max_age_days,translation_required,apostille_required,source_id,verified_at,needs_review').limit(5000),
  ]);
  if (items.error) throw new Error(`checklist_items 읽기 실패: ${items.error.message}`);
  if (docs.error) throw new Error(`required_documents 읽기 실패: ${docs.error.message}`);
  return { items: (items.data ?? []) as ChecklistItemRow[], docs: (docs.data ?? []) as RequiredDocRow[] };
}

/** 원해요 숫자: feature_vote_counts()만 쓴다(표는 직접 못 읽게 막혀 있음). 표에 없는 기능은 0 */
export async function fetchVoteCounts(): Promise<Record<string, number>> {
  const { data, error } = await getPublicClient().rpc('feature_vote_counts');
  if (error) throw new Error(`원해요 숫자 읽기 실패: ${error.message}`);
  return Object.fromEntries(((data ?? []) as { feature: string; votes: number | string }[]).map((r) => [r.feature, Number(r.votes)]));
}

/** 가이드(10단계): 발행된 글만(`status = published`), 최신순 */
export interface GuideRow { id: number; slug: string; country: string | null; program_id: number | null; title_ko: string; body_ko: string; needs_review: boolean; reviewed_at: string | null; updated_at: string }
const GUIDE_COLUMNS = 'id,slug,country,program_id,title_ko,body_ko,needs_review,reviewed_at,updated_at';

export async function fetchPublishedGuides(): Promise<GuideRow[]> {
  const { data, error } = await getPublicClient().from('guides').select(GUIDE_COLUMNS).eq('status', 'published').order('updated_at', { ascending: false }).limit(500);
  if (error) throw new Error(`guides 읽기 실패: ${error.message}`);
  return (data ?? []) as GuideRow[];
}

export async function fetchPublishedGuide(slug: string): Promise<GuideRow | null> {
  const { data, error } = await getPublicClient().from('guides').select(GUIDE_COLUMNS).eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) throw new Error(`guides 읽기 실패: ${error.message}`);
  return (data as GuideRow | null) ?? null;
}

/** 가이드 글 안의 {fact_key} 자리표시자를 채우는 값: 그 프로그램의 현재 규칙 값 + 값 종류 + 환율(원화 환산) */
export interface GuideFactContext {
  facts: { key: string; value_num: number | null; value_text: string | null; currency: string | null }[];
  keyTypes: Record<string, string>;
  rates: DbRows['rates'];
}

export async function fetchGuideFactContext(programId: number | null): Promise<GuideFactContext> {
  const db = getPublicClient();
  const [facts, keys, rates] = await Promise.all([
    programId === null ? Promise.resolve({ data: [], error: null }) : db.from('program_facts').select('key,value_num,value_text,currency').eq('program_id', programId).is('valid_to', null).limit(500),
    db.from('fact_keys').select('key,value_type').limit(500),
    db.from('exchange_rates').select('currency,krw_per_unit,rate_date').limit(500),
  ]);
  for (const r of [facts, keys, rates]) if (r.error) throw new Error(`가이드 값 읽기 실패: ${r.error.message}`);
  return {
    facts: (facts.data ?? []) as GuideFactContext['facts'],
    keyTypes: Object.fromEntries(((keys.data ?? []) as { key: string; value_type: string }[]).map((k) => [k.key, k.value_type])),
    rates: (rates.data ?? []) as DbRows['rates'],
  };
}

export async function fetchCountryName(code: string | null): Promise<string | null> {
  if (!code) return null;
  const { data, error } = await getPublicClient().from('countries').select('name_ko').eq('code', code).maybeSingle();
  if (error) throw new Error(`countries 읽기 실패: ${error.message}`);
  return (data as { name_ko: string } | null)?.name_ko ?? null;
}
