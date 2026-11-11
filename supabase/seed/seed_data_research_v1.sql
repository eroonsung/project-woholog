-- 오픈 전 데이터 조사 결과 반영 (D-136, docs/content/data_research_v1.md). 마이그레이션 007 다음에 실행. 확인일 2026-11-11.
-- 잔고 증명 4곳(IE·ES·PL·IL 숫자 추가, PT·AT는 숫자 없이 메모만), 증빙 안내 메모 6곳(AT는 needs_check), 비자 비용 6곳 needs_check, 비행 정보 15곳, 환율 19개(새 기준일로 추가, 옛 값은 기록으로 남김).
-- 값은 모두 조사 파일의 값이다. 여러 번 실행해도 같은 결과(추가는 on conflict do nothing, 수정은 같은 값으로 덮어씀).
begin;
select set_config('app.change_reason', 'D-136: 오픈 전 데이터 조사 반영(잔고 증명·비행 정보·환율)', true);

-- 1) 출처 (이미 있는 주소는 건너뜀)
insert into sources (url, publisher, grade, watch, note) values
  ('https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100014', 'WHIC 아일랜드(외교부 해외안전여행)', 'official', false, '데이터 조사 2026-11-11'),
  ('https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10951', 'WHIC 스페인(외교부 해외안전여행)', 'official', false, '데이터 조사 2026-11-11'),
  ('https://www.exteriores.gob.es/Embajadas/seul/ko/ServiciosConsulares/Documents/%ec%9b%8c%ed%82%b9%ed%99%80%eb%a6%ac%eb%8d%b0%ec%9d%b4%20%ec%9e%ac%ec%a0%95%eb%b3%b4%ec%a6%9d%ec%84%9c%20%ea%b4%80%eb%a0%a8%20%eb%a7%a4%eb%89%b4%ec%96%bc.pdf', '주한 스페인 대사관 재정보증서 매뉴얼(2024-04-05)', 'official', false, '데이터 조사 2026-11-11'),
  ('https://pvtistes.net/en/whv/portugal/', 'pvtistes.net 포르투갈(2026-05, 비공식)', 'other', false, '데이터 조사 2026-11-11'),
  ('https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10952', 'WHIC 폴란드(외교부 해외안전여행)', 'official', false, '데이터 조사 2026-11-11'),
  ('https://www.gov.pl/web/hanguk/working-holiday-visa', '주한 폴란드 대사관', 'official', false, '데이터 조사 2026-11-11'),
  ('https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100016', 'WHIC 오스트리아(외교부 해외안전여행)', 'official', false, '데이터 조사 2026-11-11'),
  ('https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100021', 'WHIC 이스라엘(외교부 해외안전여행)', 'official', false, '데이터 조사 2026-11-11'),
  ('https://kr.directflightsfrom.com/icn-ams', 'directflightsfrom ICN–AMS', 'other', false, '데이터 조사 2026-11-11'),
  ('https://xpatloop.com/channels/2026/04/new-direct-budapest-seoul-flights-launched-by-asiana-airlines.html', 'XpatLoop 2026-04(아시아나 부다페스트 직항)', 'press', false, '데이터 조사 2026-11-11'),
  ('https://kr.trip.com/flights/status-lo096/', 'Trip.com LO096(인천→바르샤바)', 'commercial', false, '데이터 조사 2026-11-11'),
  ('https://www.aeroroutes.com/eng/251202-lomay26icn', 'AeroRoutes 2026-05 LOT 증편', 'press', false, '데이터 조사 2026-11-11'),
  ('https://www.sasgroup.net/newsroom/press-releases/2025/sas-marks-first-day-of-direct-route-between-scandinavia-and-seoul/', 'SAS 보도자료 2025-09-12', 'official', false, '데이터 조사 2026-11-11'),
  ('https://www.aeroroutes.com/eng/251107-sk4q26ea', 'AeroRoutes 2026 SAS 인천 운항', 'press', false, '데이터 조사 2026-11-11'),
  ('https://www.koreanair.com/contents/promotion/list/2026/lis2026?pageNum=1', '대한항공 리스본 2026', 'commercial', false, '데이터 조사 2026-11-11'),
  ('https://www.heraldk.com/article/2026021318494820839', '헤럴드K', 'press', false, '데이터 조사 2026-11-11'),
  ('https://www.x-rates.com/table/?from=KRW&amount=1', 'x-rates.com 환율표', 'other', false, '데이터 조사 2026-11-11')
on conflict (url) do nothing;

-- 2) 잔고 증명 금액 (proof_amount는 이 4곳에 아직 없다: 새로 넣는다. 오스트리아는 월 기준을 체류 개월로 곱할지 원문으로 확정할 수 없어서 숫자 없이 메모만, D-136)
insert into program_facts (program_id, key, value_num, currency, source_id, verified_at, note, needs_check)
select p.id, 'proof_amount', 1500, 'EUR', (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100014'), '2026-11-11', '페이지가 2024 모집 기준. 2027 모집 공고 나오면 재확인', true
from programs p where p.origin = 'KR' and p.destination = 'IE' and p.kind = 'working_holiday'
on conflict (program_id, key) where valid_to is null do nothing;
insert into program_facts (program_id, key, value_num, currency, source_id, verified_at, note, needs_check)
select p.id, 'proof_amount', 4000000, 'KRW', (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10951'), '2026-11-11', '공식 최소액은 없지만 400만 원 아래면 재정보증서가 필요해요', false
from programs p where p.origin = 'KR' and p.destination = 'ES' and p.kind = 'working_holiday'
on conflict (program_id, key) where valid_to is null do nothing;
insert into program_facts (program_id, key, value_num, currency, source_id, verified_at, note, needs_check)
select p.id, 'proof_amount', 8412, 'PLN', (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10952'), '2026-11-11', '월 701PLN × 12개월. 편도 항공권이면 2,500PLN 더 필요해요', false
from programs p where p.origin = 'KR' and p.destination = 'PL' and p.kind = 'working_holiday'
on conflict (program_id, key) where valid_to is null do nothing;
insert into program_facts (program_id, key, value_num, currency, source_id, verified_at, note, needs_check)
select p.id, 'proof_amount', 3000, 'USD', (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100021'), '2026-11-11', '본인 명의 잔고증명서', false
from programs p where p.origin = 'KR' and p.destination = 'IL' and p.kind = 'working_holiday'
on conflict (program_id, key) where valid_to is null do nothing;

-- 3) 증빙 안내 메모 (proof_note, 나라 상세에 보이는 문장)
update program_facts f set value_text = '영문 잔고증명서(신청일 기준 1개월 안 발급)와 왕복 항공권 예약 사본이 필요해요', source_id = (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100014'), verified_at = '2026-11-11'
from programs p where f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'IE' and p.kind = 'working_holiday';
update program_facts f set value_text = '공식 최소액은 없지만 400만 원 아래면 재정보증서가 필요해요', source_id = (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10951'), verified_at = '2026-11-11'
from programs p where f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'ES' and p.kind = 'working_holiday';
update program_facts f set value_text = '공식 금액이 없어요. 첫 몇 달 생활비를 넉넉히 준비하세요', source_id = (select id from sources where url = 'https://pvtistes.net/en/whv/portugal/'), verified_at = '2026-11-11'
from programs p where f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'PT' and p.kind = 'working_holiday';
update program_facts f set value_text = '월 701PLN 기준 12개월치예요. 편도 항공권이면 2,500PLN 더 필요해요', source_id = (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=10952'), verified_at = '2026-11-11'
from programs p where f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'PL' and p.kind = 'working_holiday';
update program_facts f set value_text = '공식 최소액은 없어요. 대사관 안내로는 만 24세 미만 월 약 570유로, 만 24세 이상 월 약 1,031유로가 잔고에 있으면 무난해요', source_id = (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100016'), verified_at = '2026-11-11', needs_check = true
from programs p where f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'AT' and p.kind = 'working_holiday';
update program_facts f set value_text = '본인 명의 잔고증명서와 왕복 항공권이 필요해요', source_id = (select id from sources where url = 'https://whic.mofa.go.kr/whic/nation/info.jsp?boardNo=100021'), verified_at = '2026-11-11'
from programs p where f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'IL' and p.kind = 'working_holiday';

-- 3-2) 비자 비용 6곳: 값은 바꾸지 않고 오픈 전 재확인 표시만(DB 값과 조사값이 달라서, docs/content/data_review_v1.md 표 참고)
update program_facts f set needs_check = true
from programs p where f.program_id = p.id and f.key = 'visa_fee' and f.valid_to is null
  and p.origin = 'KR' and p.kind = 'working_holiday' and p.destination in ('IE', 'IL', 'PL', 'ES', 'PT', 'AT');

-- 4) 비행 정보 (FI는 값·출처 그대로, flight_needs_check = true 유지)
update countries set flight_direct = true, flight_hours = 14, flight_note = '대한항공·KLM 직항', flight_source_id = (select id from sources where url = 'https://kr.directflightsfrom.com/icn-ams'), flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'NL';
update countries set flight_direct = true, flight_hours = 13, flight_note = '대한항공·아시아나 직항', flight_source_id = (select id from sources where url = 'https://xpatloop.com/channels/2026/04/new-direct-budapest-seoul-flights-launched-by-asiana-airlines.html'), flight_verified_at = '2026-11-11', flight_needs_check = true where code = 'HU';
update countries set flight_direct = true, flight_hours = 13, flight_note = 'LOT 폴란드항공 직항', flight_source_id = (select id from sources where url = 'https://kr.trip.com/flights/status-lo096/'), flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'PL';
update countries set flight_direct = true, flight_hours = 13.5, flight_note = 'SAS 직항(주 3~6회)', flight_source_id = (select id from sources where url = 'https://www.sasgroup.net/newsroom/press-releases/2025/sas-marks-first-day-of-direct-route-between-scandinavia-and-seoul/'), flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'DK';
update countries set flight_note = '여름에는 대한항공 직항(약 14시간 30분)이 다녀요', flight_source_id = (select id from sources where url = 'https://www.koreanair.com/contents/promotion/list/2026/lis2026?pageNum=1'), flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'PT';
update countries set flight_note = '엘알 직항이 2027년 3월부터 주 3회 예정이에요', flight_source_id = (select id from sources where url = 'https://www.heraldk.com/article/2026021318494820839'), flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'IL';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'AD';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'IE';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'BE';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'LU';
update countries set flight_note = '코펜하겐·헬싱키 등에서 갈아타요', flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'SE';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'LV';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'BR';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'CL';
update countries set flight_verified_at = '2026-11-11', flight_needs_check = false where code = 'AR';

-- 5) 환율: 새 기준일로 추가(옛 가정값 행은 기록으로 남고, 화면은 가장 최근 날짜를 쓴다)
insert into exchange_rates (currency, krw_per_unit, rate_date, source) values
  ('ARS', 0.8621, '2026-11-11', 'x-rates.com'),
  ('AUD', 915.66, '2026-11-11', 'x-rates.com'),
  ('BRL', 240.25, '2026-11-11', 'x-rates.com'),
  ('CAD', 938.09, '2026-11-11', 'x-rates.com'),
  ('CLP', 1.358, '2026-11-11', 'x-rates.com'),
  ('CZK', 60.82, '2026-11-11', 'x-rates.com'),
  ('DKK', 198.44, '2026-11-11', 'x-rates.com'),
  ('EUR', 1483.48, '2026-11-11', 'x-rates.com'),
  ('GBP', 1774.64, '2026-11-11', 'x-rates.com'),
  ('HKD', 170.25, '2026-11-11', 'x-rates.com'),
  ('HUF', 4.063, '2026-11-11', 'x-rates.com'),
  ('ILS', 420.84, '2026-11-11', 'x-rates.com'),
  ('JPY', 8.372, '2026-11-11', 'x-rates.com'),
  ('NZD', 744.71, '2026-11-11', 'x-rates.com'),
  ('PLN', 336.52, '2026-11-11', 'x-rates.com'),
  ('SEK', 134.14, '2026-11-11', 'x-rates.com'),
  ('TWD', 40.63, '2026-11-11', 'x-rates.com'),
  ('USD', 1335.78, '2026-11-11', 'x-rates.com'),
  ('KRW', 1, '2026-11-11', 'x-rates.com')
on conflict (currency, rate_date) do nothing;

commit;
