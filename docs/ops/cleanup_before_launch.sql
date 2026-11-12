-- 오픈 전 테스트 데이터 삭제 (준비만 해 둔 파일, 실행은 2026-11-30에 Yvonne가 허락한 뒤)
-- 대상: docs/ops/test_data.md에 적은 행만. launch_subscribers id 10은 삭제 목록에 넣지 않았다(테스트인지 실제 신청자인지 Yvonne가 다시 확인할 때까지 보존).
-- 실행 방법(허락 후): npx supabase db query --remote --yes -f docs/ops/cleanup_before_launch.sql
-- 안전장치: 아래 delete마다 지운 행 수가 기대와 다르면 예외를 내서 전체가 취소된다(한 트랜잭션).
-- 11/30에 test_data.md에 새 행이 더 적혀 있으면 이 파일의 id 목록·기대 수를 같이 고친다.
-- 순서: ① 실행 전 읽기 전용으로 아래 [사전 확인]을 돌려 행 수를 본다 ② 허락 ③ 실행 ④ [사후 확인].
begin;

-- 1) quiz_results 13건 (test_data.md의 quiz_results 표 전체)
do $$
declare n int;
begin
  delete from quiz_results where id in (
    '660ceaf3-2a01-4d84-99a8-eec659dcfb92',
    '897f0cf2-72e5-4183-a87b-58de664ecdcf',
    'ed3501a2-8164-41cc-ba82-bdb1b8a446a6',
    'd105cfc9-fbd4-45cb-9d65-df771cbc4390',
    '0f9e776c-83df-4b30-b6b3-f8f3617d17e3',
    '9120b3cb-a188-445d-9ae5-d44b447e1574',
    'b9aa04c8-c038-4b38-a244-50f596690080',
    'e86f24b1-777d-467e-b20c-e669dac881c2',
    '053af924-e09d-4264-b6e4-f0d8cd9b0000',
    '5af305ba-ab6a-40be-94ed-98c96f4d3b5d',
    '4e3d3420-5f5d-455f-8179-abea8a3e0bcb',
    '4cea69df-4312-4f28-a2a8-647f67a5b314',
    '9216955a-e3d3-415a-aa9b-6ab8298efb07'
  );
  get diagnostics n = row_count;
  if n <> 13 then raise exception 'quiz_results: 13건이어야 하는데 %건이에요. 취소합니다', n; end if;
end $$;

-- 2) 이메일 신청 테스트 2건 (id 7, 9). id 10은 지우지 않는다
do $$
declare n int;
begin
  delete from launch_subscribers where id in (7, 9) and email like 'woholog-test+%@example.com';
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'launch_subscribers: 2건이어야 하는데 %건이에요. 취소합니다', n; end if;
end $$;

-- 3) 제보 테스트 1건 (id 3)
do $$
declare n int;
begin
  delete from user_reports where id = 3 and message = '테스트 제보입니다. 오픈 전 삭제';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'user_reports: 1건이어야 하는데 %건이에요. 취소합니다', n; end if;
end $$;

-- 4) 원해요 테스트 1건 (id 1)
do $$
declare n int;
begin
  delete from feature_votes where id = 1 and feature = 'resume';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'feature_votes: 1건이어야 하는데 %건이에요. 취소합니다', n; end if;
end $$;

-- 5) 이용 이벤트 전체 (오픈 전에 쌓인 건 모두 테스트·점검 이벤트, D-137). 행 수는 실행 전 [사전 확인]에서 본 값과 같아야 한다
delete from events;

commit;

-- ========== [사전 확인] 읽기 전용(실행 전에 따로 돌려서 숫자를 본다) ==========
-- select (select count(*) from quiz_results) as quiz_results_all,
--        (select count(*) from launch_subscribers) as subscribers_all,
--        (select count(*) from user_reports) as reports_all,
--        (select count(*) from feature_votes) as votes_all,
--        (select count(*) from events) as events_all;
-- select id from launch_subscribers order by id;   -- id 10이 남아 있는지, 새 테스트 행이 없는지 확인

-- ========== [사후 확인] 읽기 전용 ==========
-- 기대: quiz_results 0(오픈 전 실제 결과가 없을 때) · launch_subscribers는 id 10만 · user_reports 0 · feature_votes 0 · events 0
-- select (select count(*) from quiz_results) as quiz_results_all,
--        (select count(*) from launch_subscribers) as subscribers_all,
--        (select count(*) from user_reports) as reports_all,
--        (select count(*) from feature_votes) as votes_all,
--        (select count(*) from events) as events_all;
