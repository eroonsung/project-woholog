import landing from '@/content/landing_countries.json';

/**
 * "많이 찾는 나라" 먼저, 그다음 가나다순 (D-130). 많이 찾는 나라는 첫 화면 "나라 둘러보기"와 같은 목록(content/landing_countries.json)이다.
 * 체크리스트 나라 고르기·나라별 필수 앱이 쓴다. 목록에 없는 코드는 무시하고, 입력 순서는 상관없다.
 */
export const POPULAR_CODES: readonly string[] = landing.codes;

export function popularFirst<T extends { code: string; nameKo: string }>(items: readonly T[]): T[] {
  const rank = (code: string) => { const i = POPULAR_CODES.indexOf(code); return i < 0 ? Infinity : i; };
  return [...items].sort((a, b) => (rank(a.code) === rank(b.code) ? a.nameKo.localeCompare(b.nameKo, 'ko') : rank(a.code) - rank(b.code)));
}
