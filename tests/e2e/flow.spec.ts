import { expect, test, type Page } from '@playwright/test';

/**
 * 핵심 흐름: 첫 화면 → 질문 12개 → 결과 → 비교 → 나라 상세 → 체크리스트 (CLAUDE.md 9장 11단계).
 * 결과 저장(POST /api/result)은 가짜 응답으로 막고, 읽을 결과는 test_data.md에 기록된 기존 결과(읽기만)를 쓴다.
 * 그 밖의 POST·PUT·DELETE 요청은 모두 막아서 하나라도 나가면 실패시킨다(운영 DB에 쓰지 않음).
 */
const RESULT_ID = 'b9aa04c8-c038-4b38-a244-50f596690080';

async function blockWrites(page: Page) {
  const blocked: string[] = [];
  await page.route('**/api/result', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: RESULT_ID }) }));
  await page.route('**/api/{subscribe,report,vote}', (route) => { blocked.push(route.request().url()); return route.abort(); });
  return blocked;
}

async function answerCurrentQuestion(page: Page, q: number) {
  const number = page.locator('main input[type=number], main input[inputmode=numeric]').first();
  if (await number.count()) await number.fill('27');
  const none = page.getByRole('button', { name: /^(아직 없어요|없어요)$/ }).first();
  const choice = page.locator('main [role=radio], main button[aria-pressed]').first();
  if ((q === 1 || q === 4) && (await none.count())) await none.click();
  else if (await choice.count()) await choice.click();
  const next = page.getByRole('button', { name: /^(다음|결과 보기)/ }).last();
  await expect(next).toBeEnabled();
  await next.click();
}

test('첫 화면 → 질문 12개 → 결과 → 비교 → 상세 → 체크리스트', async ({ page }) => {
  const blocked = await blockWrites(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /내 나라 확인하기/ }).first().click();
  await page.waitForURL(/\/test/);

  for (let q = 1; q <= 12; q++) {
    await expect(page).toHaveURL(new RegExp(`q=${q}($|&)`));
    await answerCurrentQuestion(page, q);
  }
  await page.waitForURL(new RegExp(`/r/${RESULT_ID}`), { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('main').innerText()).toMatch(/\d+%/);

  // 이 브라우저에서 만든 결과로 표시된다(내 결과): "나도 해보기" 카드가 없다
  await expect(page.getByText('나도 내 나라 확인해 볼까요?')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('woholog.mine.v1') ?? '[]'))).toContain(RESULT_ID);

  // quiz_complete 이벤트가 대기줄에 쌓였다(답 값 없이 heart만)
  const done = await page.evaluate(() => ((window as unknown as { vaq?: unknown[][] }).vaq ?? []).filter((e) => e[0] === 'event').map((e) => e[1] as { name: string; data?: Record<string, unknown> }).filter((e) => e.name === 'quiz_complete'));
  expect(done).toHaveLength(1);
  expect(Object.keys(done[0]!.data ?? {})).toEqual(['heart']);

  // 비교
  await page.getByRole('link', { name: /비교/ }).filter({ hasText: /나란히|비교하기|와 .* 비교|비교/ }).first().click();
  await page.waitForURL(/\/compare\?c=/);
  await expect(page.locator('table')).toBeVisible();

  // 나라 상세
  await page.goto('/countries/JP');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('일본');
  await expect(page.locator('#apps')).toBeVisible();

  // 체크리스트
  await page.goto('/checklist?c=JP');
  const date = new Date(Date.now() + 9 * 3600e3 + 120 * 864e5).toISOString().slice(0, 10);
  await page.locator('input[type=date]').fill(date);
  await page.getByRole('button', { name: '체크리스트 만들기' }).click();
  await page.waitForURL(/c=JP&d=/);
  await page.locator('input[type=checkbox]').first().check();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('woholog.checklist.v1') ?? 'null'));
  expect(saved?.JP?.checked?.length).toBe(1);

  expect(errors).toEqual([]);
  expect(blocked).toEqual([]); // 결과 저장 말고는 어떤 저장 요청도 나가지 않았다
});

test('없는 주소·없는 결과·없는 나라는 404 화면', async ({ page }) => {
  for (const path of ['/nope', '/countries/ZZ', '/soon/nope', '/guides/nope']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveText('찾는 페이지가 없어요');
    await expect(page.getByRole('link', { name: '나라 추천 테스트' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: '29개국 비교' }).last()).toBeVisible();
  }
});

test('없는 결과 id는 결과 전용 404 안내', async ({ page }) => {
  const res = await page.goto('/r/00000000-0000-4000-8000-000000000000');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('결과가 없거나');
});

test('남의 결과(링크로 들어옴)에는 "나도 해보기"가 보인다', async ({ page }) => {
  await page.goto(`/r/${RESULT_ID}`);
  await expect(page.getByText('나도 내 나라 확인해 볼까요?')).toBeVisible();
  await page.getByRole('link', { name: '나도 해보기' }).first().click();
  await page.waitForURL(/\/test/);
});

test('측정 이벤트: Analytics가 붙어 있고 quiz_start가 한 번만 쌓인다', async ({ page }) => {
  await blockWrites(page);
  await page.goto('/test?q=1');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForFunction(() => typeof (window as unknown as { va?: unknown }).va === 'function');
  const queued = await page.evaluate(() => ((window as unknown as { vaq?: unknown[][] }).vaq ?? []).filter((e) => e[0] === 'event').map((e) => (e[1] as { name: string; data?: unknown }).name));
  expect(queued.filter((n) => n === 'quiz_start')).toHaveLength(1);
});
