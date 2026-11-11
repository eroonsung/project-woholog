import { defineConfig } from '@playwright/test';

/**
 * 핵심 흐름 e2e (11단계). 먼저 `npm run build`를 해 두면 `npm run start`로 서버를 띄워 확인한다.
 * 운영 DB에는 쓰지 않는다(D-106): 저장 요청(/api/*)은 테스트 안에서 가짜 응답으로 막는다. 읽기(GET)만 DB로 간다.
 * 이미 떠 있는 서버를 쓰려면 E2E_BASE_URL을 준다(예: E2E_BASE_URL=http://localhost:3121 npm run test:e2e). 3000번 포트(개발 서버)는 쓰지 않는다.
 */
const PORT = 3122;
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}` },
  projects: [
    { name: 'mobile-375', use: { viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true } },
    { name: 'web-1280', use: { viewport: { width: 1280, height: 900 } } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : { command: `npm run start -- -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: true, timeout: 60_000 },
});
