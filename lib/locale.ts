/**
 * 화면 언어 판단은 여기 한 곳에서만 한다 (D-135). 컴포넌트마다 따로 판단하지 않는다.
 * 영어 화면(copy_en.json, tEn)은 `/to-korea`와 `/privacy?lang=en`뿐이고, 나머지는 모두 한국어(copy_ko.json, t)다.
 * 헤더처럼 주소만 아는 곳에서 쓰는 순수 함수라서 화면 없이 테스트한다.
 */
export type Locale = 'ko' | 'en';

export function localeOf(pathname: string | null | undefined, lang?: string | null): Locale {
  const path = pathname ?? '/';
  if (path === '/to-korea' || path.startsWith('/to-korea/')) return 'en';
  if ((path === '/privacy' || path.startsWith('/privacy/')) && lang === 'en') return 'en';
  return 'ko';
}

/** 언어별 가로 로고(글자 포함). 한국어는 "워홀로그", 영어는 "woholog" 워드마크 (logo-ko). 높이는 모두 같게 그린다 */
export const LOGO = {
  ko: { src: '/brand/woholog-logo-ko.svg', width: 132, height: 36 },
  en: { src: '/brand/woholog-logo.svg', width: 167, height: 36 },
} as const;
