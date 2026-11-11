import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isStorageAvailable, readStorage, removeStorage, STORAGE_KEYS, writeStorage } from '@/lib/storage';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

describe('lib/storage', () => {
  let local: MemoryStorage;
  let session: MemoryStorage;

  beforeEach(() => {
    local = new MemoryStorage();
    session = new MemoryStorage();
    vi.stubGlobal('window', { localStorage: local, sessionStorage: session });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('SPEC 0.2의 키와 저장소 종류를 쓴다', () => {
    writeStorage('compare', ['JP']);
    writeStorage('quiz', ['x']);
    expect(local.data.has('woholog.compare.v1')).toBe(true);
    expect(session.data.has('woholog.quiz.v1')).toBe(true);
    expect(Object.keys(STORAGE_KEYS).sort()).toEqual(['checklist', 'compare', 'events', 'quiz', 'votes']);
  });

  it('쓴 값을 그대로 읽는다', () => {
    expect(writeStorage('compare', ['JP', 'CA'])).toBe(true);
    expect(readStorage('compare', isStringArray)).toEqual(['JP', 'CA']);
  });

  it('형식이 다르거나 깨진 값은 오류 없이 버린다', () => {
    local.setItem('woholog.compare.v1', '{"a":1}');
    expect(readStorage('compare', isStringArray)).toBeNull();
    local.setItem('woholog.compare.v1', '{깨진 json');
    expect(readStorage('compare', isStringArray)).toBeNull();
  });

  it('지우면 읽을 때 null', () => {
    writeStorage('votes', ['a']);
    expect(removeStorage('votes')).toBe(true);
    expect(readStorage('votes', isStringArray)).toBeNull();
  });

  it('저장소가 막혀 있어도 던지지 않는다', () => {
    const blocked = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('blocked'); },
      removeItem() { throw new Error('blocked'); },
    };
    vi.stubGlobal('window', { localStorage: blocked, sessionStorage: blocked });
    expect(writeStorage('compare', ['JP'])).toBe(false);
    expect(readStorage('compare', isStringArray)).toBeNull();
    expect(removeStorage('compare')).toBe(false);
    expect(isStorageAvailable('compare')).toBe(false);
  });

  it('window가 없어도(서버) 던지지 않는다', () => {
    vi.unstubAllGlobals();
    expect(readStorage('compare', isStringArray)).toBeNull();
    expect(writeStorage('compare', [])).toBe(false);
  });
});
