import { isIsoDate } from '@/lib/checklist';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';

/**
 * 체크리스트 저장소 `woholog.checklist.v1` (localStorage, SPEC 0.2·10.3): 나라별 `{date, checked[]}`. 서버로 보내지 않는다.
 * 저장소가 막혀 있으면 이 탭 안(메모리)에서만 기억하고, 읽기·쓰기 오류는 화면에 번지지 않는다(lib/storage.ts의 try/catch).
 */
export interface ChecklistRecord { date: string | null; checked: string[] }
type All = Record<string, ChecklistRecord>;

const EVENT = 'woholog:checklist';
const KEY = /^[id]\d{1,9}$/;
let memory: All = {};

const isRecord = (v: unknown): v is ChecklistRecord =>
  typeof v === 'object' && v !== null
  && ((v as ChecklistRecord).date === null || isIsoDate((v as ChecklistRecord).date))
  && Array.isArray((v as ChecklistRecord).checked) && (v as ChecklistRecord).checked.every((k) => typeof k === 'string' && KEY.test(k));
const isAll = (v: unknown): v is All => typeof v === 'object' && v !== null && !Array.isArray(v);

/** 저장된 나라별 기록. 형식이 다른 나라 기록은 버린다 */
function readAll(): All {
  const stored = readStorage('checklist', isAll);
  const base = stored ?? memory;
  return Object.fromEntries(Object.entries(base).filter(([code, r]) => /^[A-Z]{2}$/.test(code) && isRecord(r)));
}

function writeAll(all: All): void {
  if (!writeStorage('checklist', all)) memory = all;
  else memory = {};
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* 서버 */ }
}

export const loadRecord = (code: string): ChecklistRecord | null => readAll()[code] ?? null;

export function saveRecord(code: string, record: ChecklistRecord): void {
  writeAll({ ...readAll(), [code]: { date: record.date, checked: [...new Set(record.checked)] } });
}

export function clearRecord(code: string): void {
  const rest = readAll();
  delete rest[code];
  if (Object.keys(rest).length === 0 && !removeStorage('checklist')) memory = {};
  else writeAll(rest);
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* 서버 */ }
}

export function subscribeChecklist(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onChange); };
}

/** useSyncExternalStore용 스냅샷(글자). 같은 값이면 다시 그리지 않는다 */
export const snapshotRecord = (code: string): string => { const r = loadRecord(code); return r ? JSON.stringify(r) : ''; };
