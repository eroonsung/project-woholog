import { track } from '@vercel/analytics';
import { readStorage, writeStorage } from '@/lib/storage';

/**
 * 측정 이벤트 (SPEC 0.7, Vercel Web Analytics: 쿠키 없음). 이벤트 속성에 이메일·나이·예산 같은 답변 값은 넣지 않는다.
 * 보내기에 실패해도(차단·오프라인) 화면은 아무 영향이 없다. 전체 이벤트와 <Analytics /> 연결은 11단계.
 */
type Props = Record<string, string | number | boolean>;

export function trackEvent(name: string, props?: Props): void {
  try { track(name, props); } catch { /* 측정은 화면을 막지 않는다 */ }
}

const isLog = (v: unknown): v is Record<string, true> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** 브라우저당 한 번만 보내는 이벤트(`woholog.events.v1`에 기록). 저장소가 막혀 있으면 이 탭 안에서만 한 번. */
const memory = new Set<string>();
export function trackOnce(name: string, props?: Props): void {
  if (memory.has(name)) return;
  memory.add(name);
  const log = readStorage('events', isLog) ?? {};
  if (log[name]) return;
  writeStorage('events', { ...log, [name]: true });
  trackEvent(name, props);
}
