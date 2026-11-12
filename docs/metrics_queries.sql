-- 워홀로그 이용 이벤트 조회 SQL (D-138)
-- 실행: Supabase 대시보드 SQL Editor (또는 `npx supabase db query --remote --read-only`).
-- 읽기 전용 조회만 있다. 표: public.events(id, name, props, path, created_at). D-137, 008_events.sql 참고.
--
-- 읽는 법과 한계
-- * 방문자 번호(anon_id)를 저장하지 않으므로 "사람 수"는 셀 수 없다. 아래는 모두 "이벤트 건수"다.
-- * 방문자 수·페이지뷰는 Vercel Analytics(Hobby에서도 수집)로 본다. 여기서는 만들지 않는다.
-- * quiz_start는 브라우저 탭 세션당 1번, checklist_start는 브라우저당 1번만 보낸다(lib/analytics.ts).
--   quiz_complete는 끝낼 때마다 보내므로 같은 사람이 다시 하면 또 센다. 그래서 비율은 "대략의 추세"로만 본다.
-- * 오픈 전(2026-12-31 이전) 행은 테스트라 오픈 직전에 비운다(launch_checklist). 기간 조건으로 거를 수 있다.

-- 1) 이벤트별 일간 건수 (한국 시간 기준, 최근 30일)
select
  (created_at at time zone 'Asia/Seoul')::date as day,
  name,
  count(*) as n
from public.events
where created_at >= now() - interval '30 days'
group by 1, 2
order by 1 desc, 2;

-- 2) quiz_start → quiz_complete 완료율 (일간, 건수 비율)
select
  day,
  starts,
  completes,
  round(100.0 * completes / nullif(starts, 0), 1) as complete_pct
from (
  select
    (created_at at time zone 'Asia/Seoul')::date as day,
    count(*) filter (where name = 'quiz_start')    as starts,
    count(*) filter (where name = 'quiz_complete') as completes
  from public.events
  where created_at >= now() - interval '30 days'
  group by 1
) t
order by day desc;

-- 3) quiz_complete → checklist_start 전환율 (일간, 건수 비율)
select
  day,
  completes,
  checklist_starts,
  round(100.0 * checklist_starts / nullif(completes, 0), 1) as checklist_pct
from (
  select
    (created_at at time zone 'Asia/Seoul')::date as day,
    count(*) filter (where name = 'quiz_complete')   as completes,
    count(*) filter (where name = 'checklist_start') as checklist_starts
  from public.events
  where created_at >= now() - interval '30 days'
  group by 1
) t
order by day desc;
