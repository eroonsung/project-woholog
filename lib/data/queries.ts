import type { DbRows } from '@/lib/engine/adapter';
import { getPublicClient } from './supabase';

/** DB 읽기는 이 파일에서만 한다. 화면에서 직접 쿼리하지 않는다(CLAUDE.md 5장). */

async function rows<T>(table: string, columns: string): Promise<T[]> {
  const { data, error } = await getPublicClient().from(table).select(columns).limit(5000);
  if (error) throw new Error(`${table} 읽기 실패: ${error.message}`);
  return (data ?? []) as unknown as T[];
}

/** adapter에 넘길 행 전체. 현재 값(valid_to 없음)만 읽는다. */
export async function fetchAdapterRows(): Promise<DbRows> {
  const db = getPublicClient();
  const current = async <T>(table: string, columns: string): Promise<T[]> => {
    const { data, error } = await db.from(table).select(columns).is('valid_to', null).limit(5000);
    if (error) throw new Error(`${table} 읽기 실패: ${error.message}`);
    return (data ?? []) as unknown as T[];
  };
  const [countries, programs, facts, stats, rates, flights, sources, config] = await Promise.all([
    rows<DbRows['countries'][number]>('countries', 'code,name_ko,region,english,languages,in_europe,near_korea,safety_level,safety_note'),
    rows<DbRows['programs'][number]>('programs', 'id,origin,destination,kind,status,age_min,age_max,selection,max_participations,stay_months,long_stay_months'),
    current<DbRows['facts'][number]>('program_facts', 'program_id,key,value_num,value_text,currency,source_id,verified_at'),
    current<DbRows['stats'][number]>('country_stats', 'country,city,metric,value,currency'),
    rows<DbRows['rates'][number]>('exchange_rates', 'currency,krw_per_unit,rate_date'),
    rows<DbRows['flights'][number]>('flight_estimates', 'region,krw'),
    rows<DbRows['sources'][number]>('sources', 'id,publisher'),
    rows<DbRows['config'][number]>('scoring_config', 'key,value'),
  ]);
  return { countries, programs, facts, stats, rates, flights, sources, config };
}
