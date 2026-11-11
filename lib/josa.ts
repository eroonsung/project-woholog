/**
 * 한국어 조사 고르기(은/는, 이/가, 을/를, 와/과, 으로/로). 문구 파일에서는 `{country:이/가}`처럼 쓴다 (lib/copy.ts).
 * 받침이 있으면 앞쪽, 없으면 뒤쪽. "으로/로"는 받침이 ㄹ이어도 "로". 한글이 아닌 글자(영문·숫자)로 끝나면 받침 없음으로 본다.
 */
export type JosaPair = '이/가' | '은/는' | '을/를' | '와/과' | '으로/로';

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const RIEUL = 8; // 종성 ㄹ

function batchim(word: string): { has: boolean; rieul: boolean } {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (!last || code < HANGUL_START || code > HANGUL_END) return { has: false, rieul: false };
  const tail = (code - HANGUL_START) % 28;
  return { has: tail !== 0, rieul: tail === RIEUL };
}

// [받침이 있을 때, 없을 때]. "와/과"는 이름 순서와 달리 받침 없음 "와", 받침 있음 "과"
const FORMS: Record<JosaPair, [string, string]> = {
  '이/가': ['이', '가'], '은/는': ['은', '는'], '을/를': ['을', '를'], '와/과': ['과', '와'], '으로/로': ['으로', '로'],
};

export function josa(word: string, pair: JosaPair): string {
  const [withBatchim, without] = FORMS[pair];
  const b = batchim(word);
  if (pair === '으로/로') return b.has && !b.rieul ? withBatchim : without;
  return b.has ? withBatchim : without;
}

/** 단어 + 조사 */
export const withJosa = (word: string, pair: JosaPair): string => `${word}${josa(word, pair)}`;
