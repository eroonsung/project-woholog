-- 독일 EUR 2,500, 덴마크 DKK 15,000 (D-085). 출처·확인일은 같은 프로그램의 기존 proof_amount 값에서 그대로 가져온다.
-- seed_engine_v1.sql 다음에 실행.
begin;
select set_config('app.change_reason', '3단계: 항공권 증빙 시 재정 증명 금액(독일·덴마크)', true);

insert into program_facts (program_id, key, value_num, value_text, currency, source_id, verified_at, note)
select f.program_id, 'proof_amount_with_ticket', v.amount, null, v.currency, f.source_id, f.verified_at, v.note
from (values
  ('DE', 2500, 'EUR', '기존 메모: 귀국 항공권 증빙 시 €1,000 감액 (3,500 → 2,500)'),
  ('DK', 15000, 'DKK', '기존 메모: 항공권이 있으면 DKK 15,000')
) as v(dest, amount, currency, note)
join programs p on p.origin = 'KR' and p.destination = v.dest and p.kind = 'working_holiday'
join program_facts f on f.program_id = p.id and f.key = 'proof_amount' and f.valid_to is null;

commit;
