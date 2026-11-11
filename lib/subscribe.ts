/**
 * 이메일 신청(오픈 알림·To Korea 대기자) 입력 검사 (SPEC 11·12장, 처리방침과 같은 규칙).
 * 서버(api/subscribe)와 화면이 같은 함수를 쓴다. 이메일 외에는 아무것도 받지 않는다(D-020).
 */
export const CONSENT_VERSION = 'launch-v1';
export const SECTIONS = ['launch', 'to_korea'] as const;
export type SubscribeSection = (typeof SECTIONS)[number];

/** DB `launch_subscribers.section` 값(마이그레이션 001의 check 값): launch → from_korea */
export const DB_SECTION: Record<SubscribeSection, 'from_korea' | 'to_korea'> = { launch: 'from_korea', to_korea: 'to_korea' };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/; // DB check와 같은 모양
const CONTROL = /[\u0000-\u001f\u007f]/;

/** 앞뒤 공백을 지우고 소문자로 */
export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);
  return email.length <= 254 && EMAIL.test(email) && !CONTROL.test(email);
}

export type SubscribeInput = { email: string; section: SubscribeSection };
export type SubscribeError = 'bad_request' | 'invalid_email' | 'consent_required' | 'invalid_section';

/** 요청 본문 검사: 형식·동의를 서버에서 다시 확인하고, 이메일은 소문자·공백 정리한 값을 돌려준다 */
export function parseSubscribe(body: unknown): { ok: true; value: SubscribeInput } | { ok: false; error: SubscribeError } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, error: 'bad_request' };
  const { email, section, consent } = body as Record<string, unknown>;
  if (!(SECTIONS as readonly unknown[]).includes(section)) return { ok: false, error: 'invalid_section' };
  if (typeof email !== 'string' || !isValidEmail(email)) return { ok: false, error: 'invalid_email' };
  if (consent !== true) return { ok: false, error: 'consent_required' };
  return { ok: true, value: { email: normalizeEmail(email), section: section as SubscribeSection } };
}
