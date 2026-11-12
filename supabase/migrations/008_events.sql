-- 008: 이용 이벤트 저장 (D-137, SPEC 0.7)
-- Vercel Hobby에서는 커스텀 이벤트가 수집되지 않아서(Pro부터) 이벤트 7종을 우리 DB에 직접 쌓는다.
-- 개인정보 없음: 이벤트 이름, 정해진 분류 값(props), 화면 주소(path, 결과 id는 서버에서 지움), 시각만. IP·브라우저 정보·답변 값·이메일은 저장하지 않는다.
-- 익명 키(anon)는 읽기·쓰기 모두 막고, 서버(서비스 키)만 쓴다. 보관 13개월: purge_events()가 지운다(api/event가 가끔 부름).
create table events (
  id          bigint generated always as identity primary key,
  name        text not null check (name in ('quiz_start', 'quiz_complete', 'share', 'checklist_start', 'subscribe', 'vote', 'report')),
  props       jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 300),
  path        text check (path is null or (path ~ '^/' and length(path) <= 100)),
  created_at  timestamptz not null default now()
);
create index events_name_created on events (name, created_at);
create index events_created on events (created_at);

alter table events enable row level security;
-- 정책을 만들지 않는다: anon·authenticated는 읽기·쓰기 모두 불가, service_role(서버)만 RLS를 건너뛰고 쓴다.
revoke all on events from anon, authenticated;

comment on table events is '이용 이벤트(SPEC 0.7). 서버(api/event)만 쓴다. 13개월 지난 행은 purge_events()로 지운다 (D-137)';

create or replace function purge_events() returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from events where created_at < now() - interval '13 months';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function purge_events() from public, anon, authenticated;
grant execute on function purge_events() to service_role;
