import { track } from '@vercel/analytics';
import { readStorage, writeStorage } from '@/lib/storage';

/**
 * 측정 이벤트 (SPEC 0.7). Vercel Web Analytics(쿠키 없음)와 우리 DB(api/event)에 같이 보낸다. 이벤트 속성에 이메일·나이·예산 같은 답변 값은 넣지 않는다.
 * 보내기에 실패해도(차단·오프라인) 화면은 아무 영향이 없다. <Analytics />는 app/layout.tsx에 있고(D-133), 이벤트는 SPEC 0.7 표의 이름만 쓴다.
 */
type Props = Record<string, string | number | boolean>;

type VaWindow = Window & { va?: (...args: unknown[]) => void; vaq?: unknown[][] };

/**
 * <Analytics />가 스크립트를 붙이기 전에 보낸 이벤트가 사라지지 않게 대기줄을 먼저 만든다(라이브러리와 같은 모양).
 * 자식 컴포넌트의 효과가 <Analytics />보다 먼저 실행돼서(quiz_start 등) 이게 없으면 첫 이벤트가 버려진다(D-133).
 */
function ensureQueue(): void {
  const w = window as VaWindow;
  if (w.va) return;
  w.va = (...args: unknown[]) => { (w.vaq = w.vaq ?? []).push(args); };
}

/**
 * 우리 DB(api/event)에도 보낸다 (D-137). Vercel Hobby는 커스텀 이벤트를 모으지 않아서 따로 쌓는다.
 * sendBeacon이 되면 그걸로(페이지를 떠나는 중에도 전달), 안 되면 keepalive fetch. 실패해도 화면은 아무 영향이 없다.
 * 개발 서버에서는 보내지 않는다(개발 서버도 운영 DB에 연결돼 있어서, D-106). 화면 주소는 쿼리 없이 경로만, 결과 id는 서버가 지운다.
 */
function sendToServer(name: string, props?: Props): void {
  try {
    if (process.env.NODE_ENV !== 'production') return;
    const body = JSON.stringify({ name, props: props ?? {}, path: window.location.pathname });
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))) return;
    void fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch { /* 저장 실패는 무시 */ }
}

export function trackEvent(name: string, props?: Props): void {
  try { ensureQueue(); track(name, props); } catch { /* 측정은 화면을 막지 않는다 */ }
  sendToServer(name, props);
}

/** 세션(탭이 열려 있는 동안) 한 번만 보내는 이벤트. 쓰기 없이 메모리만 쓴다(SPEC 0.7 quiz_start). */
const isLog = (v: unknown): v is Record<string, true> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** 브라우저당 한 번만 보내는 이벤트(`woholog.events.v1`에 기록). 저장소가 막혀 있으면 이 탭 안에서만 한 번. */
const memory = new Set<string>();
export function trackSession(name: string, props?: Props): void {
  if (memory.has(name)) return;
  memory.add(name);
  trackEvent(name, props);
}

export function trackOnce(name: string, props?: Props): void {
  if (memory.has(name)) return;
  memory.add(name);
  const log = readStorage('events', isLog) ?? {};
  if (log[name]) return;
  writeStorage('events', { ...log, [name]: true });
  trackEvent(name, props);
}
