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
