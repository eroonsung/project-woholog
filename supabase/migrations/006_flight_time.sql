-- 006: 인천 출발 기준 비행시간 (D-130)
-- 나라 상세·비교·결과의 "한국과 가까운 곳" 줄에 "직항 약 2시간 30분" 같은 시간을 작게 붙인다.
-- 값이 없으면(null) 화면은 기존 문구만 쓴다. 숫자는 별도 시드로 넣는다(이 파일은 칸만 만든다).
-- 기준: 출발지는 인천(ICN), 도착지는 나라의 대표 도시 공항(flight_city). 시드: supabase/seed/seed_flight_v1.sql
alter table countries
  add column flight_city        text,                      -- 기준 도시. 예: '도쿄'
  add column flight_direct      boolean,                   -- true = 인천에서 직항 있음, false = 직항 없음(경유)
  add column flight_hours       numeric(4,1),              -- 직항이면 직항 시간, 직항이 없으면 경유 포함 최소 시간(시간 단위, 0.5 단위 권장)
  add column flight_note        text,                      -- 예: '토론토 직항은 약 13시간'
  add column flight_source_id   bigint references sources(id),
  add column flight_verified_at date,
  add column flight_needs_check boolean not null default false; -- true = 오픈 전에 항공사 시간표로 다시 확인(화면에는 표시하지 않음)

alter table countries
  add constraint countries_flight_pair_chk  check ((flight_direct is null) = (flight_hours is null)),
  add constraint countries_flight_range_chk check (flight_hours is null or (flight_hours > 0 and flight_hours <= 48)),
  add constraint countries_flight_verified_chk check (flight_hours is null or flight_verified_at is not null);

comment on column countries.flight_hours is '인천 출발 비행시간(시간). flight_direct=true면 직항 시간, false면 경유 포함 최소 시간';
