/**
 * 정보 제보 입력 검사 (SPEC 13장). 내용 5~2,000자, 연락처 칸은 없다.
 * 어느 나라·어느 화면·어느 섹션인지는 자동으로 붙고, DB에는 `country`와 `page`(글자 300자 이하)로 저장한다.
 */
export const MIN_REPORT = 5;
export const MAX_REPORT = 2000;
export const SCREENS = ['result', 'country', 'compare', 'countries', 'checklist', 'footer', 'other'] as const;
export type ReportScreen = (typeof SCREENS)[number];

export type ReportContext = { country?: string | null; screen: ReportScreen; section?: string | null; path?: string | null };

const COUNTRY = /^[A-Z]{2}$/;
const SECTION = /^[a-z0-9-]{1,30}$/;

/** 글자 수(앞뒤 공백 제외, 이모지 등도 1글자로) */
export const reportLength = (text: string): number => [...text.trim()].length;

/** 연락처처럼 보이는 글(이메일·전화번호): 막지 않고 "연락처는 적지 않아도 돼요" 안내만 띄운다 */
export function looksLikeContact(text: string): boolean {
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return true;
  const digits = text.replace(/[^\d+]/g, '');
  if (/(?:\+?82[-\s]?)?0?1[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/.test(text)) return true; // 휴대폰
  if (/0\d{1,2}[-.\s]\d{3,4}[-.\s]\d{4}/.test(text)) return true; // 지역번호 전화
  return digits.replace(/\D/g, '').length >= 9 && /\d{3,4}[-.\s]\d{3,4}[-.\s]?\d{0,4}/.test(text);
}

/** 화면 정보를 DB `page` 글자로: `country /countries/JP#money` */
export function pageLabel(ctx: ReportContext): string {
  const path = typeof ctx.path === 'string' && ctx.path.startsWith('/') ? ctx.path.slice(0, 200) : '';
  const section = typeof ctx.section === 'string' && SECTION.test(ctx.section) ? `#${ctx.section}` : '';
  return `${ctx.screen} ${path}${section}`.trim().slice(0, 300);
}

export type ReportError = 'bad_request' | 'invalid_message' | 'invalid_context';

export function parseReport(body: unknown): { ok: true; value: { message: string; country: string | null; page: string; screen: ReportScreen } } | { ok: false; error: ReportError } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, error: 'bad_request' };
  const { message, country, screen, section, path } = body as Record<string, unknown>;
  if (typeof message !== 'string') return { ok: false, error: 'invalid_message' };
  const len = reportLength(message);
  if (len < MIN_REPORT || len > MAX_REPORT) return { ok: false, error: 'invalid_message' };
  if (!(SCREENS as readonly unknown[]).includes(screen)) return { ok: false, error: 'invalid_context' };
  if (country != null && (typeof country !== 'string' || !COUNTRY.test(country))) return { ok: false, error: 'invalid_context' };
  const page = pageLabel({ screen: screen as ReportScreen, section: typeof section === 'string' ? section : null, path: typeof path === 'string' ? path : null });
  return { ok: true, value: { message: message.trim(), country: (country as string | null | undefined) ?? null, page, screen: screen as ReportScreen } };
}

/** 지금 주소에서 화면 종류·나라 코드를 알아낸다(푸터처럼 어느 화면에서나 열리는 "제보하기"용) */
export function contextFromPath(pathname: string, fallback: ReportScreen = 'other'): { screen: ReportScreen; country: string | null } {
  const detail = /^\/countries\/([A-Za-z]{2})$/.exec(pathname);
  if (detail) return { screen: 'country', country: detail[1]!.toUpperCase() };
  if (/^\/r\/[^/]+\/compare$/.test(pathname) || pathname === '/compare') return { screen: 'compare', country: null };
  if (/^\/r\/[^/]+$/.test(pathname)) return { screen: 'result', country: null };
  if (pathname === '/countries') return { screen: 'countries', country: null };
  if (pathname === '/checklist') return { screen: 'checklist', country: null };
  return { screen: fallback, country: null };
}
