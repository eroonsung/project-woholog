import { readStorage, writeStorage } from '@/lib/storage';

/**
 * "내 결과" 표시 (SPEC 0.2 `woholog.mine.v1`, D-132): 이 브라우저에서 결과를 만든 직후에 그 결과 id를 남긴다(최근 20개).
 * 링크로 들어온 사람(또는 저장소를 못 읽을 때)은 "남의 결과"로 보고 "나도 해보기"를 보여 준다.
 * 읽기·쓰기는 모두 storage.ts의 try/catch 안에서 한다. 저장소가 막혀도 화면은 정상(남의 결과로 보임).
 */
export const MINE_MAX = 20;

const isIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

export const loadMine = (): string[] => readStorage('mine', isIds) ?? [];

/** 방금 만든 결과 id를 맨 앞에 넣는다(중복은 앞으로 옮기고, 20개를 넘으면 오래된 것부터 뺀다) */
export function markMine(id: string): boolean {
  return writeStorage('mine', [id, ...loadMine().filter((x) => x !== id)].slice(0, MINE_MAX));
}

export const isMine = (id: string): boolean => loadMine().includes(id);
