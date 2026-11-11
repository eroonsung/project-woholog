-- 004: 항공권을 낼 때 감액되는 잔고 증명 금액 (D-085)
-- 필요한 돈 계산에 항공권이 들어가므로, 이 값이 있으면 proof_amount 대신 쓴다. 요청 제한은 005(4단계).
insert into fact_keys (key, label_ko, value_type, description) values
  ('proof_amount_with_ticket', '항공권 증빙 시 재정 증명 금액', 'money', '귀국 항공권을 증빙하면 감액되는 잔고 증명 기준 금액. 있으면 필요한 돈 계산에 proof_amount 대신 쓴다')
on conflict (key) do nothing;
