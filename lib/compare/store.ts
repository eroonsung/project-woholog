import { readStorage, writeStorage } from '@/lib/storage';
import { MAX_COMPARE } from './parse';

/**
 * "비교에 담기" 저장소 `woholog.compare.v1` (localStorage, SPEC 0.2). 나라 코드 최대 3개.
 * 저장소가 막혀 있으면 이 탭 안에서만(메모리) 기억한다. 읽기·쓰기는 lib/storage.ts의 try/catch를 지난다.
 */
const CODE = /^[A-Z]{2}$/;
const EVENT = 'woholog:compare';
let memory: string[] | null = null;

const isCodes = (v: unknown): v is string[] => Array.isArray(v) && v.every((c) => typeof c === 'string' && CODE.test(c));

/** 저장된 값을 3개까지, 중복 없이 (형식이 다르면 버림) */
export function sanitizeCodes(v: unknown): string[] {
  return isCodes(v) ? [...new Set(v)].slice(0, MAX_COMPARE) : [];
}

export function loadCompare(): string[] {
  return sanitizeCodes(readStorage('compare', isCodes) ?? memory ?? []);
}

function save(list: string[]) {
  if (!writeStorage('compare', list)) memory = list;
  else memory = null;
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* 서버·막힌 환경 */ }
}

/** 담기. 이미 있으면 그대로, 3개가 차 있으면 담지 않고 'full' */
export function addCompare(code: string): 'added' | 'exists' | 'full' {
  const list = loadCompare();
  if (list.includes(code)) return 'exists';
  if (list.length >= MAX_COMPARE) return 'full';
  save([...list, code]);
  return 'added';
}

export function removeCompare(code: string): void {
  save(loadCompare().filter((c) => c !== code));
}

/** useSyncExternalStore용 */
export function subscribeCompare(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onChange); };
}
