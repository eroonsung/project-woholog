import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sql = readFileSync('supabase/seed/seed_data_research_v1.sql', 'utf-8');
const body = sql.replace(/--[^\n]*\n/g, '\n');

describe('데이터 조사 시드 (D-136)', () => {
  it('바뀌는 행 수: 비행 15곳(핀란드 제외), 증빙 메모 6곳, 비자 비용 표시 6곳, 금액 4곳, 환율 19개', () => {
    expect(body.match(/^update countries set /gm)).toHaveLength(15);
    expect(body).not.toMatch(/update countries set [^;]*where code = 'FI'/);
    expect(body.match(/^update program_facts f set /gm)).toHaveLength(7); // 증빙 메모 6 + 비자 비용 needs_check 1문장(6곳)
    expect(body.match(/^insert into program_facts /gm)).toHaveLength(4);
    expect(body).toMatch(/set needs_check = true\nfrom programs p where f\.program_id = p\.id and f\.key = 'visa_fee'[\s\S]*?in \('IE', 'IL', 'PL', 'ES', 'PT', 'AT'\)/);
    const fx = body.slice(body.indexOf('insert into exchange_rates'));
    expect(fx.match(/^\s+\('[A-Z]{3}', /gm)).toHaveLength(19);
    expect(fx.match(/'2026-11-11', 'x-rates\.com'/g)).toHaveLength(19);
  });
  it('확인일은 2026-11-11, 헝가리만 비행 재확인 유지', () => {
    expect(body).toMatch(/flight_needs_check = true where code = 'HU'/);
    expect(body.match(/flight_needs_check = true/g)).toHaveLength(1);
    expect(body.match(/flight_needs_check = false/g)).toHaveLength(14);
  });
  it('잔고 증명 금액 값(결정 A·B·C, 오스트리아는 D 변경)과 needs_check', () => {
    expect(body).toMatch(/'proof_amount', 1500, 'EUR'[\s\S]*?true\nfrom programs p where p\.origin = 'KR' and p\.destination = 'IE'/);
    expect(body).toMatch(/'proof_amount', 4000000, 'KRW'/);
    expect(body).toMatch(/'proof_amount', 8412, 'PLN'/);
    expect(body).toMatch(/'proof_amount', 3000, 'USD'/);
    expect(body.match(/, true\nfrom programs p/g)).toHaveLength(1); // 금액 needs_check는 아일랜드만
    expect(body).not.toMatch(/1031/); // 오스트리아는 숫자 없이 메모만
    expect(body).toMatch(/needs_check = true\nfrom programs p where f\.program_id = p\.id and f\.key = 'proof_note'|where f\.program_id = p\.id and f\.key = 'proof_note' and f\.valid_to is null\n  and p\.origin = 'KR' and p\.destination = 'AT'/);
    expect(body).toContain('만 24세 이상 월 약 1,031유로가 잔고에 있으면 무난해요');
    for (const code of ['PT', 'AT']) expect(body).not.toMatch(new RegExp(`'proof_amount'[^;]*destination = '${code}'`)); // 포르투갈·오스트리아는 숫자 없이 메모만
  });
});
