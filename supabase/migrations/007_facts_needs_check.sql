-- 007: 사실 값 "오픈 전 재확인 필요" 표시 칸 (D-136)
-- countries.flight_needs_check(006)와 같은 뜻: true면 값은 넣었지만 공식 안내가 오래됐거나 출처가 약해서 오픈 전에 다시 확인해야 한다.
-- 화면에는 표시하지 않는다(운영자용). 값이 없으면 false.
alter table program_facts
  add column needs_check boolean not null default false;

comment on column program_facts.needs_check is '오픈 전 재확인 필요(운영자용, 화면에 표시하지 않음). 예: 2024년 모집 기준 값';
