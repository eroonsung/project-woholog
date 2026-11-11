-- 3단계 시드: 엔진용 값 (seed_v1_1.sql, seed_checklist_v1.sql 다음에 실행)
-- 1) 호주만 extension_by_regional_work = 1  2) scoring_config 기준값 4개 (D-077)
begin;
select set_config('app.change_reason', '3단계: 엔진용 연장 규칙·기준값 시드', true);

insert into program_facts (program_id, key, value_num, value_text, currency, source_id, verified_at, note) values
  ((select id from programs where origin='KR' and destination='AU' and kind='working_holiday'),
   'extension_by_regional_work', 1, null, null,
   (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100002'),
   '2026-11-11', '지정 지역 88일(2차)·179일(3차) 근무 (programs.long_stay_condition과 같은 내용)');

insert into scoring_config (key, value) values
  ('english_levels', '{"interview": 2, "work": 3, "basic_max": 1}'::jsonb),
  ('close_gap_pp', '10'::jsonb),
  ('study_unlimited_months', '99'::jsonb),
  ('what_if_max_rows', '3'::jsonb);

commit;
