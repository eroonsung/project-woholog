-- 워홀로그 DB 스키마 v2 검증 테스트 (로컬 PostgreSQL에서 실행)
-- 순서: 1) 아래 Supabase 흉내 부분 2) 스키마 v2 3) 테스트. Supabase에서는 1)을 빼고 스키마만 실행

-- 1) Supabase 흉내 (로컬 전용)
-- Supabase 흉내: auth 스키마와 역할
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

-- 3) 테스트
\set ON_ERROR_STOP 0
\pset footer off
-- Supabase 기본 권한 흉내 (RLS가 실제로 막는지 확인하려고 넓게 줌)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

-- 시드
insert into countries values ('KR','한국','Korea','asia','N','{한국어}',false,false,'normal',null),
                             ('AU','호주','Australia','oceania','Y','{영어}',false,false,'normal',null),
                             ('JP','일본','Japan','asia','N','{일본어}',false,true,'normal',null);
insert into sources(url,publisher,grade,watch) values ('https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100002','워킹홀리데이 인포센터','official',true);
insert into programs(origin,destination,status,age_min,age_max,selection,stay_months,long_stay_months,long_stay_condition)
  values ('KR','AU','active',18,35,'unlimited',12,36,'지정 지역 88일·179일 근무'),
         ('KR','JP','active',18,30,'first_come',12,24,null);
insert into fact_keys values ('proof_amount','재정 증명','money',null),('visa_fee','비자 비용','money',null),('study_max_months','어학 한도','months',null);
select set_config('app.change_reason','초기 입력',false);
insert into program_facts(program_id,key,value_num,currency,source_id,verified_at) values (1,'proof_amount',5000,'AUD',1,'2026-11-09');
insert into checklist_items(program_id,phase,days_offset,title_ko,body_ko,verified_at) values
 (1,'apply',-90,'잔고 증명 준비','{proof_amount} 이상 잔고 증명서 발급','2026-11-09'),
 (null,'prepare',-60,'여권 유효기간 확인','남은 기간 확인','2026-11-09');
insert into guides(slug,program_id,title_ko,body_ko,status) values ('au-money',1,'호주 돈','필요 금액 {proof_amount}','published');

\echo '--- T1 오타 자리표시자 거부 (오류가 나야 정상)'
insert into checklist_items(program_id,phase,title_ko,body_ko,verified_at) values (1,'apply','오타','{proof_amout}','2026-11-09');
\echo '--- T2 금액인데 통화 없음 거부'
insert into program_facts(program_id,key,value_num,verified_at) values (1,'visa_fee',840,'2026-11-09');
\echo '--- T3 현재 값 두 개 거부'
insert into program_facts(program_id,key,value_num,currency,verified_at) values (1,'proof_amount',6000,'AUD','2026-11-10');
\echo '--- T4 나이 범위 뒤집힘 거부'
insert into programs(origin,destination,status,age_min,age_max,selection,stay_months) values ('KR','KR','active',30,18,'unlimited',12);
\echo '--- T5 값 교체(이력 보존) 후 검토 필요 자동 표시'
update checklist_items set needs_review=false; update guides set needs_review=false;
begin;
select set_config('app.change_reason','2026.7 기준 변경 예시',true);
update program_facts set valid_to='2026-11-10' where program_id=1 and key='proof_amount' and valid_to is null;
insert into program_facts(program_id,key,value_num,currency,source_id,verified_at,valid_from) values (1,'proof_amount',5500,'AUD',1,'2026-11-10','2026-11-10');
commit;
select title_ko, needs_review from checklist_items order by id;
select slug, needs_review from guides;
select count(*) as history_rows from program_facts where program_id=1 and key='proof_amount';
\echo '--- T6 변경 기록 자동'
select table_name, action, reason from change_log where table_name='program_facts' order by id;
\echo '--- T7 관리 할 일 뷰'
update program_facts set verified_at='2026-06-01' where valid_to is null and key='proof_amount';
select kind, what, detail from admin_todo order by kind;

\echo '--- T8 익명(anon) 권한'
set role anon;
select count(*) as anon_can_read_facts from program_facts;
select count(*) as anon_reads_published_guides from guides;
select count(*) as anon_sees_change_log from change_log;
insert into launch_subscribers(email,consent_version) values ('test@example.com','2026-11-v1');
select count(*) as anon_sees_subscribers from launch_subscribers;
insert into quiz_results(answers,result,data_version) values ('{}','{"top":"AU"}',current_data_version());
select count(*) as anon_lists_results from quiz_results;
\echo '--- T9 익명이 사실 수정 시도 (막혀야 정상)'
update program_facts set value_num=1;
select count(*) as facts_changed_to_1 from program_facts where value_num=1;
insert into user_reports(message) values ('호주 비용이 달라요');
\echo '--- T10 이메일 형식 오류 거부'
insert into launch_subscribers(email,consent_version) values ('not-an-email','v1');
reset role;
\echo '--- T11 공유 링크 조회 함수 (데이터가 바뀌면 data_changed=true)'
select set_config('app.change_reason','',false);
insert into program_facts(program_id,key,value_num,currency,verified_at) values (2,'visa_fee',0,'JPY','2026-11-10');
set role anon;
select result, data_changed from get_quiz_result((select id from quiz_results limit 1));
reset role;
\echo '--- T12 중복 구독 거부'
insert into launch_subscribers(email,consent_version) values ('TEST@example.com','2026-11-v1');

\pset footer off
select count(*) as saved_results, (select count(*) from launch_subscribers) as subscribers, (select count(*) from user_reports) as reports from quiz_results;
select id as rid from quiz_results limit 1 \gset
set role anon;
select result, data_changed from get_quiz_result(:'rid');
select count(*) as anon_reads_draft_guides from guides where status='draft';
reset role;
\echo '--- 삭제해도 기록이 남는지'
delete from country_apps; insert into country_apps(country,name,category,verified_at) values ('AU','Opal','transport','2026-11-10');
delete from country_apps where name='Opal';
select table_name, action, row_id from change_log where table_name='country_apps';
\echo '--- 체크리스트 자기 자신 의존 거부'
update checklist_items set depends_on=id where id=1;
