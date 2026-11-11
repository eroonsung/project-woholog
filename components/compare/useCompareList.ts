'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { loadCompare, subscribeCompare } from '@/lib/compare/store';

/** 비교에 담은 나라 코드. 서버에서 그릴 때는 빈 목록. 문자열로 비교해 값이 같으면 다시 그리지 않는다. */
export function useCompareList(): string[] {
  const raw = useSyncExternalStore(subscribeCompare, () => loadCompare().join(','), () => '');
  return useMemo(() => (raw ? raw.split(',') : []), [raw]);
}
