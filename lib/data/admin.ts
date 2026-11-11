import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * 서버 전용 관리자 클라이언트(서비스 키). 서버 코드(route handler)에서만 쓴다 — 브라우저 번들에 들어가면 안 된다 (CLAUDE.md 규칙 8).
 * `NEXT_PUBLIC_`을 붙이지 않은 SUPABASE_SERVICE_ROLE_KEY만 읽는다.
 */
let client: SupabaseClient | null = null;

export function getServiceKey(): string {
  if (typeof window !== 'undefined') throw new Error('서비스 키는 서버에서만 쓸 수 있어요');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY가 없어요 (로컬은 .env.local, Vercel은 Production 환경변수)');
  return key;
}

export function getAdminClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL이 없어요');
  client = createClient(url, getServiceKey(), { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
