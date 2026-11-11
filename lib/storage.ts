/**
 * 브라우저 저장소. SPEC.md 0.2의 키만 쓴다 (CLAUDE.md 규칙 10).
 * 모든 읽기·쓰기는 try/catch. 저장소가 막혀 있어도 화면은 정상이어야 한다(저장만 안 됨).
 * 읽은 값의 형식이 다르면 오류 없이 버리고 null을 돌려준다(키 끝의 v1 = 저장 형식 버전).
 */

export const STORAGE_KEYS = {
  quiz: { key: 'woholog.quiz.v1', kind: 'session' },
  checklist: { key: 'woholog.checklist.v1', kind: 'local' },
  compare: { key: 'woholog.compare.v1', kind: 'local' },
  votes: { key: 'woholog.votes.v1', kind: 'local' },
  events: { key: 'woholog.events.v1', kind: 'local' },
} as const;

export type StorageName = keyof typeof STORAGE_KEYS;

type Guard<T> = (value: unknown) => value is T;

function getStore(name: StorageName): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return STORAGE_KEYS[name].kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

/** 저장소를 쓸 수 있는지(시크릿 모드·차단 여부). 체크리스트의 "저장 안 돼요" 안내에 쓴다. */
export function isStorageAvailable(name: StorageName): boolean {
  const store = getStore(name);
  if (!store) return false;
  try {
    const probe = `${STORAGE_KEYS[name].key}.probe`;
    store.setItem(probe, '1');
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** 값을 읽는다. 없거나, 깨졌거나, guard를 통과하지 못하면 null. */
export function readStorage<T>(name: StorageName, guard: Guard<T>): T | null {
  const store = getStore(name);
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEYS[name].key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 값을 쓴다. 성공하면 true, 막혀 있거나 가득 차 있으면 false(화면은 계속 동작). */
export function writeStorage(name: StorageName, value: unknown): boolean {
  const store = getStore(name);
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEYS[name].key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** 값을 지운다. 성공하면 true. */
export function removeStorage(name: StorageName): boolean {
  const store = getStore(name);
  if (!store) return false;
  try {
    store.removeItem(STORAGE_KEYS[name].key);
    return true;
  } catch {
    return false;
  }
}
