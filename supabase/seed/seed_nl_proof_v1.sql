-- 네덜란드 잔고 증명 = 0 (D-088). 요구 조건이 "왕복 항공권 또는 그 금액"이고 필요한 돈 공식에 항공권이 이미 들어 있어서
-- 잔고 증명 금액은 0으로 둔다. 출처·확인일은 기존 proof_note(같은 프로그램)에서 그대로 가져온다. seed_proof_ticket_v1.sql 다음에 실행.
begin;
select set_config('app.change_reason', '3단계: 네덜란드 잔고 증명 0 (왕복 항공권으로 대체, 항공권은 공식에 포함)', true);

insert into program_facts (program_id, key, value_num, value_text, currency, source_id, verified_at, note)
select f.program_id, 'proof_amount', 0, null, 'EUR', f.source_id, f.verified_at, '왕복 항공권으로 대체(항공권은 필요한 돈 공식에 포함)'
from programs p
join program_facts f on f.program_id = p.id and f.key = 'proof_note' and f.valid_to is null
where p.origin = 'KR' and p.destination = 'NL' and p.kind = 'working_holiday';

commit;
