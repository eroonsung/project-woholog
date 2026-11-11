/**
 * 사이트가 열렸는가. `NEXT_PUBLIC_SITE_LIVE=true`일 때만 검색 색인을 허용한다 (D-092).
 * 오픈 날 Vercel 환경변수만 true로 바꾸고 다시 배포한다(빌드 때 값이 들어간다).
 */
export const isSiteLive = (): boolean => process.env.NEXT_PUBLIC_SITE_LIVE === 'true';
