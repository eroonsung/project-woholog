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
