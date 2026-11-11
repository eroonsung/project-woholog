import { getAdminClient } from './admin';

/** DB 쓰기는 이 파일에서만 한다(서버 전용, 서비스 키). 화면에서 직접 쓰지 않는다. */

/** 요청 제한: 같은 창(초) 안에서 한도 이하이면 true (마이그레이션 005 check_rate_limit) */
export async function checkRateLimit(bucket: string, ipHash: string, limit: number, windowSeconds = 60): Promise<boolean> {
  const { data, error } = await getAdminClient().rpc('check_rate_limit', {
    p_bucket: bucket, p_ip_hash: ipHash, p_limit: limit, p_window_seconds: windowSeconds,
  });
  if (error) throw new Error(`요청 제한 확인 실패: ${error.message}`);
  return data === true;
}

/** 결과 저장. data_version은 저장 당시 change_log 최대 id(공유 링크의 "정보가 바뀌었어요" 비교용) */
export async function saveQuizResult(answers: unknown, result: unknown): Promise<string> {
  const db = getAdminClient();
  const version = await db.rpc('current_data_version');
  if (version.error) throw new Error(`데이터 버전 확인 실패: ${version.error.message}`);
  const { data, error } = await db
    .from('quiz_results')
    .insert({ answers, result, data_version: version.data })
    .select('id')
    .single();
  if (error || !data) throw new Error(`결과 저장 실패: ${error?.message ?? '응답 없음'}`);
  return data.id as string;
}

/** 이메일 신청 저장. 같은 이메일(대소문자 무시)·같은 구분이 이미 있으면 'exists' (D-024) */
export async function addSubscriber(input: { email: string; section: 'from_korea' | 'to_korea'; locale: 'ko' | 'en'; consentVersion: string }): Promise<'created' | 'exists'> {
  const { error } = await getAdminClient().from('launch_subscribers').insert({
    email: input.email, section: input.section, locale: input.locale, consent_version: input.consentVersion, consented_at: new Date().toISOString(),
  });
  if (!error) return 'created';
  if (error.code === '23505') return 'exists'; // 중복(lower(email), section) 유니크
  throw new Error(`신청 저장 실패: ${error.code ?? error.message}`);
}

/** 정보 제보 저장. 나라 코드가 DB에 없으면(외래 키 오류) 나라 없이 저장한다 */
export async function addReport(input: { country: string | null; page: string; message: string }): Promise<void> {
  const db = getAdminClient();
  const row = { country: input.country, page: input.page, message: input.message };
  const first = await db.from('user_reports').insert(row);
  if (!first.error) return;
  if (first.error.code === '23503' && input.country) {
    const retry = await db.from('user_reports').insert({ ...row, country: null });
    if (!retry.error) return;
    throw new Error(`제보 저장 실패: ${retry.error.code ?? retry.error.message}`);
  }
  throw new Error(`제보 저장 실패: ${first.error.code ?? first.error.message}`);
}

/** 원해요 1표 저장: 기능 이름과 시각만(누가 눌렀는지는 저장하지 않는다, D-023) */
export async function addVote(slug: string): Promise<void> {
  const { error } = await getAdminClient().from('feature_votes').insert({ feature: slug });
  if (error) throw new Error(`원해요 저장 실패: ${error.code ?? error.message}`);
}
