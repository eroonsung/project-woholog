import copyKo from '@/content/copy_ko.json';
import { josa, type JosaPair } from './josa';

type Vars = Record<string, string | number>;
const messages = copyKo as Record<string, string>;

/**
 * 문구 가져오기. 문장은 content/copy_ko.json의 키로만 쓴다 (CLAUDE.md 규칙 4).
 * `{name}` 자리표시자를 vars로 채운다. 없는 키는 키 이름을 그대로 돌려주고 개발 중에 경고한다.
 */
export function t(key: string, vars?: Vars): string {
  const template = messages[key];
  if (template === undefined) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[copy] 없는 문구 키: ${key}`);
    return key;
  }
  if (!vars) return template;
  // `{name}`은 값 그대로, `{name:이/가}`는 값 뒤에 받침에 맞는 조사를 붙인다
  return template.replace(/\{(\w+)(?::([^}]+))?\}/g, (match, name: string, pair?: string) => {
    const value = vars[name];
    if (value === undefined) return match;
    const text = String(value);
    return pair ? `${text}${josa(text, pair as JosaPair)}` : text;
  });
}

/** 문구 키가 있는지(없으면 그 줄을 숨길 때 쓴다). */
export function hasCopy(key: string): boolean {
  return messages[key] !== undefined;
}
