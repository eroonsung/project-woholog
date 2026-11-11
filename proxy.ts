import { NextResponse, type NextRequest } from 'next/server';

/**
 * 나라 상세 주소의 소문자 코드는 대문자 주소로 바꿔 보낸다 (SPEC 8장): /countries/jp → /countries/JP.
 * 나라 상세는 미리 만들어 둔 정적 페이지라서 페이지 안의 redirect()는 Location 헤더가 없는 응답이 된다. 그래서 여기서 처리한다.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const code = pathname.slice('/countries/'.length);
  if (/^[A-Za-z]{2}$/.test(code) && code !== code.toUpperCase()) {
    return NextResponse.redirect(new URL(`/countries/${code.toUpperCase()}${search}`, request.url), 308);
  }
  return NextResponse.next();
}

export const config = { matcher: '/countries/:code' };
