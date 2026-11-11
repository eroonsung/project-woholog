import { trackEvent } from '@/lib/analytics';
import { readStorage, writeStorage } from '@/lib/storage';

/**
 * 원해요 (SPEC 14장): 한 브라우저에서 기능마다 1번. `woholog.votes.v1`(localStorage)에 누른 slug를 적는다(D-023: 누가 눌렀는지는 서버에 없다).
 * 저장소가 막혀 있으면 이 탭 안(메모리)에서만 기억한다. 누르면 먼저 +1을 보여 주고 서버에 보내며, 실패하면 되돌린다.
 */
const SLUG = /^[a-z0-9-]{2,40}$/;
const EVENT = 'woholog:votes';
let memory: string[] = [];

const isSlugs = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string' && SLUG.test(s));

export function loadVotes(): string[] {
  const stored = readStorage('votes', isSlugs);
  return [...new Set([...(stored ?? []), ...memory])];
}

function save(list: string[]): void {
  if (!writeStorage('votes', list)) memory = list; else memory = [];
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* 서버 */ }
}

export const hasVoted = (slug: string): boolean => loadVotes().includes(slug);
export const markVoted = (slug: string): void => { if (!hasVoted(slug)) save([...loadVotes(), slug]); };
export const unmarkVoted = (slug: string): void => save(loadVotes().filter((s) => s !== slug));

export function subscribeVotes(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onChange); };
}

export type VoteResult = 'ok' | 'already' | 'failed' | 'limited';

/** 원해요 보내기: 이미 눌렀으면 'already'. 서버가 실패하면 표시를 되돌리고 'failed'(너무 잦으면 'limited' = 화면은 조용히 되돌림) */
export async function castVote(slug: string, send: typeof fetch = fetch): Promise<VoteResult> {
  if (hasVoted(slug)) return 'already';
  markVoted(slug);
  try {
    const res = await send('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    if (res.status === 429) { unmarkVoted(slug); return 'limited'; }
    if (!res.ok) { unmarkVoted(slug); return 'failed'; }
    trackEvent('vote', { slug });
    return 'ok';
  } catch {
    unmarkVoted(slug);
    return 'failed';
  }
}
