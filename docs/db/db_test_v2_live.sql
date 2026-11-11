-- db_test_v2.sql을 Supabase(운영 프로젝트)에서 돌리는 버전. psql·로컬 DB 없이 `supabase db query --remote -f`로 실행한다.
-- 원본(db_test_v2.sql)은 로컬 PostgreSQL에서 Supabase 역할을 흉내 내고 임시 데이터를 넣는 스크립트라 그대로는 못 돌린다.
-- 여기서는 같은 T1~T12를 "통과/실패를 스스로 판정"하는 방식으로 옮겼다. 실패하면 예외가 나서 끝까지 가지 못한다.
-- 모든 변경은 하나의 트랜잭션 안에서 일어나고 마지막에 rollback한다(데이터·change_log 모두 남지 않음).
-- 실행: npx supabase db query --remote -f docs/db/db_test_v2_live.sql
begin;

create function pg_temp.expect_fail(name text, stmt text) returns void language plpgsql as $$
begin
  begin execute stmt; exception when others then return; end;
  raise exception '% 실패: 막혀야 하는데 통과했어요', name;
end $$;

create function pg_temp.expect(name text, ok boolean) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception '% 실패', name; end if; end $$;

-- 테스트용 프로그램(롤백됨): KR→AU student
create temp table t as
  with p as (insert into programs(origin,destination,kind,status,age_min,age_max,selection,stay_months)
             values ('KR','AU','student','active',18,35,'unlimited',12) returning id)
  select id as pid from p;
grant select on t to anon, authenticated;

select set_config('app.change_reason','db_test_v2_live',true);

-- T1 오타 자리표시자 거부
select pg_temp.expect_fail('T1 오타 자리표시자',
  format($q$insert into checklist_items(program_id,phase,title_ko,body_ko,verified_at) values (%s,'apply','오타','{proof_amout}',current_date)$q$, (select pid from t)));
-- T2 금액인데 통화 없음 거부
select pg_temp.expect_fail('T2 통화 없는 금액',
  format($q$insert into program_facts(program_id,key,value_num,verified_at) values (%s,'visa_fee',840,current_date)$q$, (select pid from t)));
-- T3 현재 값 두 개 거부
insert into program_facts(program_id,key,value_num,currency,verified_at) values ((select pid from t),'proof_amount',5000,'AUD','2026-11-09');
select pg_temp.expect_fail('T3 현재 값 두 개',
  format($q$insert into program_facts(program_id,key,value_num,currency,verified_at) values (%s,'proof_amount',6000,'AUD','2026-11-10')$q$, (select pid from t)));
-- T4 나이 범위 뒤집힘 거부
select pg_temp.expect_fail('T4 나이 범위',
  $q$insert into programs(origin,destination,kind,status,age_min,age_max,selection,stay_months) values ('KR','AU','nomad','active',30,18,'unlimited',12)$q$);

-- T5 값 교체(이력 보존) 후 검토 필요 자동 표시 + T6 변경 기록
insert into checklist_items(program_id,phase,days_offset,title_ko,body_ko,verified_at) values ((select pid from t),'apply',-90,'잔고 증명 준비','{proof_amount} 이상 잔고 증명서 발급','2026-11-09');
insert into guides(slug,program_id,title_ko,body_ko,status) values ('db-test-live',(select pid from t),'테스트','필요 금액 {proof_amount}','published');
update checklist_items set needs_review=false where program_id=(select pid from t);
update guides set needs_review=false where slug='db-test-live';
update program_facts set valid_to='2026-11-10' where program_id=(select pid from t) and key='proof_amount' and valid_to is null;
insert into program_facts(program_id,key,value_num,currency,verified_at,valid_from) values ((select pid from t),'proof_amount',5500,'AUD','2026-11-10','2026-11-10');
select pg_temp.expect('T5 체크리스트 검토 필요 표시', (select needs_review from checklist_items where program_id=(select pid from t)));
select pg_temp.expect('T5 가이드 검토 필요 표시', (select needs_review from guides where slug='db-test-live'));
select pg_temp.expect('T5 이력 보존(2행)', (select count(*) from program_facts where program_id=(select pid from t) and key='proof_amount') = 2);
select pg_temp.expect('T6 변경 기록 자동', (select count(*) from change_log where table_name='program_facts') > 0);
-- T7 관리 할 일 뷰
select pg_temp.expect('T7 admin_todo 조회', (select count(*) from admin_todo) >= 0);
-- 체크리스트 자기 자신 의존 거부
select pg_temp.expect_fail('자기 의존',
  format($q$update checklist_items set depends_on=id where program_id=%s$q$, (select pid from t)));

-- T8 익명(anon) 권한
set local role anon;
select pg_temp.expect('T8 익명이 사실 읽기', (select count(*) from program_facts) > 0);
select pg_temp.expect('T8 익명이 공개 가이드 읽기', (select count(*) from guides where slug='db-test-live') = 1);
select pg_temp.expect('T8 익명은 변경 기록을 못 봄', (select count(*) from change_log) = 0);
insert into launch_subscribers(email,consent_version) values ('test@example.com','2026-11-v1');
select pg_temp.expect('T8 익명은 구독자를 못 읽음', (select count(*) from launch_subscribers) = 0);
insert into quiz_results(answers,result,data_version) values ('{}','{"top":"AU"}',current_data_version());
select pg_temp.expect('T8 익명은 결과 목록을 못 읽음', (select count(*) from quiz_results) = 0);
-- T9 익명이 사실 수정·삽입 시도 → 막힘
do $$ declare n int; begin
  update program_facts set value_num = 1; get diagnostics n = row_count;
  if n <> 0 then raise exception 'T9 실패: 익명이 사실 % 행을 바꿨어요', n; end if;
end $$;
select pg_temp.expect_fail('T9 익명이 나라 추가', $q$insert into countries(code,name_ko,name_en,region,english) values ('ZZ','x','x','asia','N')$q$);
select pg_temp.expect_fail('T9 익명이 설정 추가', $q$insert into scoring_config(key,value) values ('x','1')$q$);
insert into user_reports(message) values ('호주 비용이 달라요');
-- T10 이메일 형식 오류 거부 / T12 중복 구독 거부
select pg_temp.expect_fail('T10 이메일 형식', $q$insert into launch_subscribers(email,consent_version) values ('not-an-email','v1')$q$);
select pg_temp.expect_fail('T12 중복 구독', $q$insert into launch_subscribers(email,consent_version) values ('TEST@example.com','2026-11-v1')$q$);
-- T11 공유 링크 조회 함수 (데이터가 바뀌면 data_changed = true)
reset role;
create temp table rid as select id from quiz_results limit 1;
grant select on rid to anon;
set local role anon;
select pg_temp.expect('T11 결과 한 건 조회', (select count(*) from get_quiz_result((select id from rid))) = 1);
reset role;
insert into program_facts(program_id,key,value_num,currency,verified_at) values ((select pid from t),'visa_fee',0,'KRW','2026-11-10');
set local role anon;
select pg_temp.expect('T11 데이터가 바뀌면 data_changed', (select data_changed from get_quiz_result((select id from rid))));
select pg_temp.expect('임시 초안 가이드는 익명에게 안 보임', (select count(*) from guides where status='draft') = 0);
reset role;

select 'db_test_v2_live: 통과' as result;
rollback;
