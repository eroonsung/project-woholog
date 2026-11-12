import { featureBySlug } from '@/lib/features';
import { SCREENS } from '@/lib/report';

/**
 * 이용 이벤트 7종과 속성 검사 (SPEC 0.7, D-137). 서버(api/event)가 쓴다. 순수 함수라 화면 없이 테스트한다.
 * 이름·속성 이름·값이 아래 표에 없으면 모두 거절한다. 답변 값·이메일·나이 같은 건 받을 수 있는 칸 자체가 없다.
 */
type Check = (v: unknown) => boolean;
const oneOf = (...values: string[]): Check => (v) => typeof v === 'string' && values.includes(v);

export const EVENT_SPEC: Record<string, Record<string, Check>> = {
  quiz_start: {},
  quiz_complete: { heart: oneOf('있음', '없음') },
  share: { type: oneOf('link', 'story', 'native') },
  checklist_start: { country: (v) => typeof v === 'string' && /^[A-Z]{2}$/.test(v) },
  subscribe: { section: oneOf('launch', 'to_korea') },
  vote: { slug: (v) => typeof v === 'string' && featureBySlug(v) !== undefined },
  report: { page: oneOf(...SCREENS) },
};
export const EVENT_NAMES = Object.keys(EVENT_SPEC);

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** 화면 주소(쿼리 없음)만 남긴다. 결과 id는 `:id`로 바꿔 이벤트가 특정 결과와 이어지지 않게 한다. 이상한 값은 null */
export function normalizePath(path: unknown): string | null {
  if (typeof path !== 'string' || path.length > 100 || !path.startsWith('/')) return null;
  const clean = path.split(/[?#]/)[0]!.replace(UUID, ':id');
  return /^\/[A-Za-z0-9\-_/:.]*$/.test(clean) && clean.length <= 100 ? clean : null;
}

export type ParsedEvent = { name: string; props: Record<string, string>; path: string | null };

export function parseEvent(body: unknown): { ok: true; value: ParsedEvent } | { ok: false } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false };
  const { name, props, path, ...rest } = body as Record<string, unknown>;
  if (Object.keys(rest).length > 0) return { ok: false }; // 모르는 칸이 있으면 거절
  if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(EVENT_SPEC, name)) return { ok: false };
  const rules = EVENT_SPEC[name]!;
  const given = props === undefined ? {} : props;
  if (typeof given !== 'object' || given === null || Array.isArray(given)) return { ok: false };
  const entries = Object.entries(given as Record<string, unknown>);
  if (entries.length !== Object.keys(rules).length) return { ok: false }; // 속성은 정해진 것만, 빠짐없이
  const out: Record<string, string> = {};
  for (const [key, value] of entries) {
    const check = rules[key];
    if (!check || !check(value)) return { ok: false };
    out[key] = value as string;
  }
  if (path !== undefined && path !== null && normalizePath(path) === null) return { ok: false };
  return { ok: true, value: { name, props: out, path: path == null ? null : normalizePath(path) } };
}
