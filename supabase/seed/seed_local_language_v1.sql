-- 5.1단계 (D-111): Q12 "현지 언어 배우기" 칩 추가, 마음 이유에서 "언어 배우기" 제거.
-- scoring_config 두 줄만 바꾼다(여러 번 실행해도 결과가 같다). 스키마 변경 없음.
-- 적용 전에는 운영 화면에 새 칩이 보이지 않는다(칩 목록을 DB 값에서 읽기 때문).
begin;

update scoring_config
set value = '["money", "easy_job", "english", "career", "two_years", "europe", "local_language", "low_cost", "sure_pick", "few_koreans", "many_koreans", "near_korea"]'::jsonb
where key = 'priority_chips';

update scoring_config
set value = '["culture", "know_someone"]'::jsonb
where key = 'heart_reason_chips';

commit;
