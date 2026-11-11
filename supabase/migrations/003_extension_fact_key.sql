-- 003: 엔진 입력 farmForExtension용 사실 항목 추가 (D-079)
-- 값은 program_facts에 넣는다(1 = 지정 지역 근무로 체류 연장 가능). 지금은 호주만 1: seed/seed_engine_v1.sql
-- 기존 마이그레이션(001·002)은 고치지 않는다 (CLAUDE.md 규칙 7). 요청 제한(rate limit)은 4단계 마이그레이션 004.
insert into fact_keys (key, label_ko, value_type, description) values
  ('extension_by_regional_work', '지정 지역 근무로 연장', 'boolean', 'value_num 1 = 지정 지역(농장 등) 근무로 체류 연장 가능. 엔진 farmForExtension')
on conflict (key) do nothing;
