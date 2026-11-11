-- 005: 요청 제한(rate limit) + 보안 정리 (D-095)
-- 1) 요청 제한: IP 해시만 저장, 24시간 뒤 삭제. 서비스 키(서버)만 함수를 부를 수 있다.
-- 2) log_change·flag_dependent_content(트리거 전용)를 외부 호출(RPC)에서 막고, 트리거 함수 3개 search_path 고정.
-- 3) flight_estimates는 왕복 항공권 가격 기준(D-094)임을 DB에도 적어 둔다.

-- ---------- 1. 요청 제한 ----------
create table rate_limits (
  bucket       text not null,                          -- 'result' | 'subscribe' | 'report' | 'vote'
  ip_hash      text not null check (length(ip_hash) between 16 and 128),   -- HMAC-SHA256 hex. 원래 IP는 저장하지 않는다
  window_start timestamptz not null,
  hits         int not null default 0,
  primary key (bucket, ip_hash, window_start)
);
create index rate_limits_window on rate_limits (window_start);
alter table rate_limits enable row level security;      -- 정책 없음 = 익명·로그인 사용자는 읽기·쓰기 모두 불가
comment on table rate_limits is '요청 제한 횟수. IP는 해시만, 24시간 지난 행은 check_rate_limit 호출 때 지운다 (SPEC 0.8, D-065)';

create or replace function purge_rate_limits() returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from rate_limits where window_start < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end $$;

-- 같은 창(p_window_seconds) 안에서 hits를 1 올리고, 한도(p_limit) 이하이면 true
create or replace function check_rate_limit(p_bucket text, p_ip_hash text, p_limit int, p_window_seconds int default 60)
returns boolean language plpgsql security definer set search_path = public as $$
declare w timestamptz; n int;
begin
  if p_limit < 1 or p_window_seconds < 1 then raise exception 'p_limit과 p_window_seconds는 1 이상이어야 해요'; end if;
  perform purge_rate_limits();
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into rate_limits (bucket, ip_hash, window_start, hits) values (p_bucket, p_ip_hash, w, 1)
    on conflict (bucket, ip_hash, window_start) do update set hits = rate_limits.hits + 1
    returning hits into n;
  return n <= p_limit;
end $$;

revoke all on function purge_rate_limits() from public, anon, authenticated;
revoke all on function check_rate_limit(text, text, int, int) from public, anon, authenticated;
grant execute on function purge_rate_limits() to service_role;
grant execute on function check_rate_limit(text, text, int, int) to service_role;

-- ---------- 2. 보안 정리 ----------
-- 트리거 전용 함수: 외부(/rest/v1/rpc)에서 부를 수 없게 한다. 트리거는 그대로 동작한다.
revoke all on function log_change() from public, anon, authenticated;
revoke all on function flag_dependent_content() from public, anon, authenticated;
-- 트리거 함수 3개 search_path 고정
alter function touch_updated_at() set search_path = public;
alter function check_fact_type() set search_path = public;
alter function check_placeholders() set search_path = public;
-- get_quiz_result, current_data_version, feature_vote_counts는 공개 유지(변경 없음)

-- ---------- 3. 문서화 ----------
comment on table flight_estimates is '항공권 추정. krw는 왕복 항공권 가격 기준 (D-094)';
comment on column flight_estimates.krw is '왕복 항공권 가격(원). 필요한 돈 계산에 그대로 더한다';
