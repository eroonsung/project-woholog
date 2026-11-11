import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * 읽기 전용(익명 키) 클라이언트. 공개 읽기 정책이 있는 표만 읽을 수 있다(RLS).
 * 화면 코드는 이 파일을 직접 쓰지 않고 lib/data/queries.ts만 부른다(CLAUDE.md 5장).
 * TODO(4단계): 결과 저장 등 서버 쓰기는 SUPABASE_SERVICE_ROLE_KEY를 서버 코드에서만 읽는 별도 함수로 만든다.
 */
let client: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY가 .env.local에 없어요');
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
