-- 002: 준비 중 기능 "원해요" 투표 (2026-11-10)
-- 개인정보 없음: 기능 이름과 시각만 저장. 같은 사람 중복 클릭은 브라우저에서 막고(localStorage), 서버는 초당 요청 제한만.
create table feature_votes (
  id          bigint generated always as identity primary key,
  feature     text not null check (feature ~ '^[a-z0-9-]{2,40}$'),
  created_at  timestamptz not null default now()
);
create index feature_votes_feature on feature_votes (feature);

alter table feature_votes enable row level security;
create policy "anon insert" on feature_votes for insert to anon, authenticated with check (true);
-- 읽기 정책 없음: 개수는 아래 함수로만 공개

create or replace function feature_vote_counts()
returns table (feature text, votes bigint)
language sql stable security definer set search_path = public as $$
  select feature, count(*) from feature_votes group by feature order by 2 desc;
$$;
revoke all on function feature_vote_counts() from public;
grant execute on function feature_vote_counts() to anon, authenticated;
