import { describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * 운영 DB에 익명 키로 붙어 보안을 확인한다(CLAUDE.md 9장 3단계 완료 기준). 키 값은 출력하지 않는다.
 * .env.local이 없으면 건너뛴다. 데이터를 만들거나 바꾸는 요청은 "막혀야 하는 것"만 보낸다.
 * 트랜잭션 안에서 자세히 보는 검사(트리거·제약)는 docs/db/db_test_v2_live.sql.
 */
function env(): { url: string; key: string } | null {
  try { process.loadEnvFile('.env.local'); } catch { /* 없으면 건너뜀 */ }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}
const cfg = env();

describe.skipIf(!cfg)('익명 키 권한 (RLS)', () => {
  const db = () => createClient(cfg!.url, cfg!.key, { auth: { persistSession: false } });

  it('공개 표는 읽을 수 있다', async () => {
    for (const table of ['countries', 'programs', 'program_facts', 'country_stats', 'scoring_config', 'checklist_items']) {
      const { data, error } = await db().from(table).select('*').limit(1);
      expect(error, table).toBeNull();
      expect(data?.length, table).toBe(1);
    }
  });

  it('관리·개인 표는 읽어도 비어 있다(변경 기록·구독자·제보·결과·진행상황)', async () => {
    for (const table of ['change_log', 'launch_subscribers', 'user_reports', 'quiz_results', 'user_checklist_progress']) {
      const { data, error } = await db().from(table).select('*').limit(1);
      expect(error?.message ?? null, table).toBeNull();
      expect(data, table).toEqual([]);
    }
  });

  it('임시 초안 가이드는 보이지 않는다', async () => {
    const { data } = await db().from('guides').select('status');
    expect((data ?? []).every((g) => g.status === 'published')).toBe(true);
  });

  it('사실·설정을 넣거나 고치려 하면 막힌다', async () => {
    const insert = await db().from('countries').insert({ code: 'ZZ', name_ko: 'x', name_en: 'x', region: 'asia', english: 'N' });
    expect(insert.error).not.toBeNull();
    const config = await db().from('scoring_config').insert({ key: 'x', value: 1 });
    expect(config.error).not.toBeNull();
    const update = await db().from('program_facts').update({ value_num: 1 }).not('id', 'is', null).select('id');
    expect(update.data ?? []).toEqual([]); // 고쳐진 행 0개
    const del = await db().from('countries').delete().eq('code', 'KR').select('code');
    expect(del.data ?? []).toEqual([]);
  });

  it('사실이 그대로 남아 있다', async () => {
    const { count } = await db().from('countries').select('*', { count: 'exact', head: true });
    expect(count).toBe(30);
  });
});
