/** 비교 주소 `?c=JP,CA,GB` 읽기 (SPEC 6장). 없는 코드와 중복은 조용히 빼고, 4개 이상이면 앞의 3개만 쓴다. */
export const MAX_COMPARE = 3;

export function parseCodes(raw: string | string[] | undefined, valid: ReadonlySet<string>): string[] {
  const text = Array.isArray(raw) ? raw.join(',') : (raw ?? '');
  const out: string[] = [];
  for (const part of text.split(',')) {
    const code = part.trim().toUpperCase();
    if (valid.has(code) && !out.includes(code)) out.push(code);
    if (out.length === MAX_COMPARE) break;
  }
  return out;
}

/** 나라 코드 목록 → 주소. 비면 쿼리 없이 */
export const compareHref = (base: string, codes: readonly string[]): string => (codes.length ? `${base}?c=${codes.join(',')}` : base);
