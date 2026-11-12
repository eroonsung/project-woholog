-- 비자 비용 6개국 정리 (D-139, docs/content/data_review_v1.md 6장). seed_data_research_v1.sql(D-136) 다음에 실행. 확인일 2026-11-12.
-- 스페인 0원(면제, needs_check 해제) · 폴란드 113,600원 · 이스라엘 70,000원 · 아일랜드는 금액 그대로(105,000원)에 메모만 · 오스트리아·포르투갈은 그대로(needs_check = true, "확인 중" 표시 유지).
-- 여러 번 실행해도 같은 결과(같은 값으로 덮어씀). 결과의 "필요한 돈"이 달라지므로 운영 적용 전에 나라별 % 변화표를 본다(규칙 6).
begin;
select set_config('app.change_reason', 'D-139: 비자 비용 정리(스페인 면제·폴란드·이스라엘 값 수정, 아일랜드 메모·출처)', true);

-- 1) 출처(이미 있으면 건너뜀): 주한 스페인 대사관 AML 안내(국가비자 수수료 면제), 주한 아일랜드 대사관 2026 상반기 안내서, 주한 폴란드 대사관 체크리스트
insert into sources (url, publisher, grade, watch, note) values
  ('https://www.exteriores.gob.es/Embajadas/seul/ko/ServiciosConsulares/Documents/AML_%ec%9b%8c%ed%82%b9%ed%99%80%eb%a6%ac%eb%8d%b0%ec%9d%b4%20%eb%b9%84%ec%9e%90.pdf', '주한 스페인 대사관 AML 안내(최종 수정 2024-01-29)', 'official', false, '비자 비용 정리 2026-11-12'),
  ('https://assets.ireland.ie/documents/Korea_-_WHA_-_%EC%95%88%EB%82%B4%EC%84%9C_Guidelines_2026_%EC%83%81%EB%B0%98%EA%B8%B0.pdf', '주한 아일랜드 대사관 워킹홀리데이 안내서 2026 상반기', 'official', false, '비자 비용 정리 2026-11-12'),
  ('https://www.gov.pl/attachment/2e84a443-9292-4e41-ab12-d00121b64a9e', '주한 폴란드 대사관 워킹홀리데이 비자 체크리스트', 'official', false, '비자 비용 정리 2026-11-12')
on conflict (url) do nothing;

-- 2) 스페인: 비자 수수료 면제 → 0원, needs_check 해제
update program_facts f set value_num = 0, currency = 'KRW', note = '비자 수수료 면제(외국인번호(NIE) 신청 비용 14,850원은 별도, 현금)', needs_check = false, verified_at = '2026-11-12',
  source_id = (select id from sources where url = 'https://www.exteriores.gob.es/Embajadas/seul/ko/ServiciosConsulares/Documents/AML_%ec%9b%8c%ed%82%b9%ed%99%80%eb%a6%ac%eb%8d%b0%ec%9d%b4%20%eb%b9%84%ec%9e%90.pdf')
from programs p where f.program_id = p.id and f.key = 'visa_fee' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'ES' and p.kind = 'working_holiday';

-- 3) 폴란드: 339,390원은 틀림 → 113,600원(WHIC 폴란드 페이지 기준, 출처는 그대로), 메모는 대사관 현금만. WHIC 페이지에 날짜가 없어 needs_check 유지(대사관 체크리스트는 출처 목록에만 추가)
update program_facts f set value_num = 113600, currency = 'KRW', note = '대사관에서 현금만 가능', needs_check = true, verified_at = '2026-11-12'
from programs p where f.program_id = p.id and f.key = 'visa_fee' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'PL' and p.kind = 'working_holiday';

-- 4) 이스라엘: WHIC "비자 신청 수수료" 항목 70,000원. 같은 페이지에 66,000원도 있어 needs_check 유지
update program_facts f set value_num = 70000, currency = 'KRW', note = '같은 페이지에 66,000원도 적혀 있어 확인 중', needs_check = true, verified_at = '2026-11-12'
from programs p where f.program_id = p.id and f.key = 'visa_fee' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'IL' and p.kind = 'working_holiday';

-- 5) 아일랜드: 금액(105,000원)은 그대로, 납부 방법 메모만 바꾸고 출처를 2026 상반기 안내서로. 금액은 추첨 당첨자에게 따로 안내되어 needs_check 유지
update program_facts f set note = '계좌이체만 가능(우편환 불가), 금액은 추첨 당첨자에게 따로 안내', needs_check = true, verified_at = '2026-11-12',
  source_id = (select id from sources where url = 'https://assets.ireland.ie/documents/Korea_-_WHA_-_%EC%95%88%EB%82%B4%EC%84%9C_Guidelines_2026_%EC%83%81%EB%B0%98%EA%B8%B0.pdf')
from programs p where f.program_id = p.id and f.key = 'visa_fee' and f.valid_to is null
  and p.origin = 'KR' and p.destination = 'IE' and p.kind = 'working_holiday';

-- 6) 오스트리아: 바꾸지 않는다(195유로, 메모 그대로, needs_check = true: VFS 안내 원문 재확인 필요)

-- 포르투갈(PT): 공식 금액이 없어 바꾸지 않는다. 지금 값(110유로)과 needs_check = true("확인 중")를 그대로 둔다(비우지 않음).

commit;
