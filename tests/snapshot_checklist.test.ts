import { writeFileSync } from 'node:fs';
import { describe, it } from 'vitest';

/**
 * 체크리스트 항목·서류(운영 DB, 익명 키로 읽기만)를 tests/fixtures/checklist_rows_v1.json으로 저장한다. 평소에는 건너뛴다.
 * 실행: SNAPSHOT=1 npx vitest run tests/snapshot_checklist.test.ts   (키 값은 출력하지 않는다)
 */
describe.skipIf(!process.env.SNAPSHOT)('체크리스트 스냅샷 저장', () => {
  it('checklist_rows_v1.json 만들기', async () => {
    process.loadEnvFile('.env.local');
    const { fetchChecklistRows } = await import('@/lib/data/queries');
    writeFileSync('tests/fixtures/checklist_rows_v1.json', JSON.stringify(await fetchChecklistRows(), null, 1) + '\n');
  });
});
