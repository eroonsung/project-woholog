import type { BlockReason, ReasonLine } from '@/lib/engine';
import { hasCopy, t } from '@/lib/copy';
import { formatNumber } from '@/lib/format';
import type { HeartBlock } from './card';

/** 저장된 문구 키 + 값 → 화면에 쓸 글자. 계산은 하지 않고 문구 파일(copy_ko.json)의 키만 쓴다. */

const NUMERIC = new Set(['budget', 'need', 'gap', 'months', 'plan', 'long']);

export function reasonText(line: ReasonLine): string {
  const vars: Record<string, string | number> = {};
  let missing = false;
  for (const [name, value] of Object.entries(line.params)) {
    if (value === null || value === undefined) { missing = true; continue; }
    if (Array.isArray(value)) {
      const joined = value.map((code) => t(`reason.obstacle.${code}`)).join(', ');
      vars.obstacle = joined;
      vars.obstacles = joined;
    } else vars[name] = NUMERIC.has(name) && typeof value === 'number' ? formatNumber(value) : value;
  }
  // 값이 비어 있으면(대표 일자리·한 고용주 기간 등) 값 없이 읽히는 대체 문구를 쓴다
  const key = missing && hasCopy(`${line.key}.noValue`) ? `${line.key}.noValue` : line.key;
  return t(key, vars);
}

/** 조건 줄 왼쪽 이름: 핵심 4항목은 돈·언어·일·어학원, 중요한 것(Q12)은 칩 이름 */
export const itemLabel = (line: Pick<ReasonLine, 'kind' | 'itemId'>): string =>
  line.kind === 'core' ? t(`item.${line.itemId}`) : t(`q12.opt.${line.itemId}`);

/** 갈 수 없는 나라의 이유 글자 */
export function blockReasonText(reason: HeartBlock['reason'] | BlockReason): string {
  switch (reason.kind) {
    case 'age': return t('result.blocked.age', { age: reason.maxAge });
    case 'visited': return t('result.blocked.visited');
    case 'companion_age': return t('result.blocked.companion');
    case 'companion_visited': return t('result.blocked.companionVisited');
    default: return t('result.blocked.inactive');
  }
}
