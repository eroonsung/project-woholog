import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const body = readFileSync('supabase/seed/seed_visa_fee_v1.sql', 'utf-8').replace(/--[^\n]*\n/g, '\n');
const stmt = (code: string) => body.split(';').find((s) => s.includes(`p.destination = '${code}'`)) ?? '';

describe('비자 비용 시드 (D-139)', () => {
  it('4개국만 바꾸고 오스트리아·포르투갈은 건드리지 않는다(행 4개, 출처 3개)', () => {
    expect(body.match(/^update program_facts f set /gm)).toHaveLength(4);
    expect(body.match(/^  \('https:/gm)).toHaveLength(3); // 새 출처 3개(스페인·아일랜드·폴란드 대사관)
    expect(body).not.toMatch(/destination = 'PT'|destination = 'AT'/);
    expect(body).not.toMatch(/^delete /m);
    for (const code of ['ES', 'PL', 'IL', 'IE']) expect(stmt(code), code).toContain("f.key = 'visa_fee' and f.valid_to is null");
  });
  it('값·통화·needs_check', () => {
    expect(stmt('ES')).toMatch(/value_num = 0, currency = 'KRW'[\s\S]*needs_check = false/);
    expect(stmt('PL')).toMatch(/value_num = 113600, currency = 'KRW', note = '대사관에서 현금만 가능', needs_check = true/);
    expect(stmt('IL')).toMatch(/value_num = 70000, currency = 'KRW', note = '같은 페이지에 66,000원도 적혀 있어 확인 중', needs_check = true/);
    expect(stmt('IE')).toMatch(/set note = '계좌이체만 가능\(우편환 불가\), 금액은 추첨 당첨자에게 따로 안내', needs_check = true/);
    expect(stmt('IE')).not.toMatch(/value_num/); // 아일랜드 금액(105,000원)은 그대로
    expect(body).not.toMatch(/value_num = 84000|value_num = 150/);
    expect(body.match(/needs_check = false/g)).toHaveLength(1); // 스페인만 해제
    expect(body.match(/verified_at = '2026-11-12'/g)).toHaveLength(4);
  });
  it('한 트랜잭션이고 변경 이유를 남긴다', () => {
    expect(body).toMatch(/^begin;/m);
    expect(body).toMatch(/^commit;/m);
    expect(body).toContain("set_config('app.change_reason'");
  });
});
